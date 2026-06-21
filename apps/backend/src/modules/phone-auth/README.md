# TabeshElecShop Authentication Documentation

## Overview

TabeshElecShop implements a comprehensive authentication system using **MedusaJS v2** with support for multiple authentication methods:

- **Phone-based Authentication** (Primary method)
- **Email/Password Authentication** (Traditional method)
- **JWT Token-based Session Management**

The authentication system is integrated with **Payload CMS** for user management and uses **Next.js 14** App Router with middleware for route protection.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Methods](#authentication-methods)
3. [User Registration Flow](#user-registration-flow)
4. [User Login Flow](#user-login-flow)
5. [Session Management](#session-management)
6. [Protected Routes](#protected-routes)
7. [API Integration](#api-integration)
8. [Error Handling](#error-handling)
9. [Security Considerations](#security-considerations)
10. [Configuration](#configuration)

---

## Architecture Overview

### Components

```
Frontend (Next.js 14)
    ↓
Middleware (Route Protection)
    ↓
Auth Components (UI Layer)
    ↓
Customer Data Functions (Business Logic)
    ↓
MedusaJS SDK (API Client)
    ↓
MedusaJS Backend (Auth Service)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/modules/account/templates/login-template.tsx` | Main login/register template with view management |
| `src/modules/account/components/login/index.tsx` | Phone number input component |
| `src/modules/account/components/register/index.tsx` | User registration form |
| `src/lib/data/customer.ts` | Server actions for authentication |
| `src/middleware.ts` | Route protection and region detection |
| `src/lib/data/cookies.ts` | Cookie management for auth tokens |

---

## Authentication Methods

### 1. Phone-Based Authentication (Primary)

**Advantages:**
- No email required
- Faster registration
- OTP verification for security
- Mobile-first approach

**Flow:**
```
Enter Phone Number
    ↓
Check if account exists (via MedusaJS)
    ↓
If exists → Password login
If new → Registration + OTP
    ↓
Verify OTP
    ↓
Create session token
```

**Implementation:**
```typescript
// In src/lib/data/customer.ts
export const authenticateWithPhone = async (phone: string) => {
  const response = await sdk.auth.login("customer", "phone-auth", {
    phone,
  })
  return response // Returns { location: "register" | "password" }
}

export const registerWithPhone = async ({
  firstName,
  lastName,
  phone,
  email,
  password
}: FormData) => {
  // 1. Register with email/password
  const { token: regToken } = await sdk.client.fetch(
    `/auth/customer/emailpass/register`,
    { method: "POST", body: { email, password } }
  )

  // 2. Create customer profile
  const { customer: { id: customer_id } } = await sdk.store.customer.create(
    { email, first_name: firstName, last_name: lastName, phone },
    {},
    { authorization: `Bearer ${regToken}` }
  )

  // 3. Register phone auth
  await sdk.client.fetch(`/auth/customer/phone-auth/register`, {
    method: "POST",
    body: { phone, password, customer_id }
  })

  // 4. Authenticate with phone
  return await authenticateWithPhone(phone)
}
```

### 2. Email/Password Authentication

**Flow:**
```
Enter Email & Password
    ↓
Validate credentials with MedusaJS
    ↓
Receive JWT token
    ↓
Store token in cookies
```

**Implementation:**
```typescript
export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const token = await sdk.auth.login("customer", "emailpass", {
      email,
      password
    })
    await setAuthToken(token as string)
    revalidateTag("customers")
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}
```

### 3. OTP Verification

**Flow:**
```
User enters phone number and registers
    ↓
OTP sent to phone
    ↓
User enters OTP
    ↓
Verify OTP with backend
    ↓
Issue authentication token
```

**Implementation:**
```typescript
export const verifyOtp = async ({
  otp,
  phone,
}: {
  otp: string
  phone: string
}) => {
  try {
    const token = await sdk.auth.callback("customer", "phone-auth", {
      phone,
      otp,
    })

    await setAuthToken(token)
    revalidateTag("customers")
    await transferCart()

    return true
  } catch (e: any) {
    return e.toString()
  }
}
```

---

## User Registration Flow

### Phone-Based Registration

```
┌─────────────────────────────────────────────────────────┐
│ 1. User enters phone number in LoginTemplate            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. authenticateWithPhone() called                        │
│    - Checks if phone exists in system                    │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────────────────────────┐
        │   Account exists?                 │
        └───────────────────────────────────┘
        ↙                                    ↘
   NO (New User)                        YES (Existing User)
        ↓                                    ↓
   Registration Form                   Password Form
        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. User fills in registration details                    │
│    - First Name                                          │
│    - Last Name                                           │
│    - Password (auto-generated email)                     │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. registerWithPhone() called                            │
│    a. Register with emailpass auth                       │
│    b. Create customer profile                            │
│    c. Register phone auth provider                       │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Authenticate with phone                              │
│    - Triggers OTP send                                   │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. User verifies OTP                                     │
│    - Enters code received on phone                       │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. verifyOtp() called                                    │
│    - JWT token issued                                    │
│    - Token stored in cookies                             │
│    - User session created                                │
└─────────────────────────────────────────────────────────┘
        ↓
    LOGGED IN ✓
```

### Code Example

**Component: `src/modules/account/components/register/index.tsx`**

```typescript
const onSubmit = async (data: FormData) => {
  const { firstName, lastName, phone, email, password } = data
  setSubmitError(null)

  try {
    const response = await registerWithPhone({
      firstName,
      lastName,
      phone,
      email,
      password,
    })

    if (!response.location || response.location !== "otp") {
      setSubmitError(response || "Registration failed")
      return
    }

    // Move to OTP verification step
    setCurrentView(LOGIN_VIEW.OTP)
  } catch (err: any) {
    setSubmitError(err?.message || "An unexpected error occurred")
  }
}
```

---

## User Login Flow

### Login Sequence

```
┌─────────────────────────────────────────────────────────┐
│ 1. User enters phone number                              │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. authenticateWithPhone() validates                     │
└─────────────────────────────────────────────────────────┘
        ↓
    Account Found (location: "password")
        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. User enters password                                  │
│    (Component: Password)                                 │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Verify credentials with MedusaJS                      │
│    sdk.auth.login("customer", "emailpass", ...)         │
└─────────────────────────────────────────────────────────┘
        ↓
    ┌──────────────────┐
    │ Valid?           │
    └──────────────────┘
    ↙                ↘
YES                 NO
 ↓                   ↓
Issue JWT     Show Error Message
 ↓
Store Token
 ↓
Transfer Cart
 ↓
LOGGED IN ✓
```

### Code Example

**Component: `src/modules/account/components/password/index.tsx`**

```typescript
const onSubmit = async (data: { password: string }) => {
  try {
    const response = await login(null, formData)
    
    if (response instanceof Error) {
      setSubmitError(response.message)
      return
    }

    // Redirect to dashboard
    router.push("/account/dashboard")
  } catch (err: any) {
    setSubmitError("Login failed. Please try again.")
  }
}
```

---

## Session Management

### Token Storage

Tokens are stored in HTTP-only cookies for security:

```typescript
// src/lib/data/cookies.ts

export const setAuthToken = async (token: string) => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  cookies().set("_medusa_jwt", token, {
    maxAge: oneWeek,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export const getAuthHeaders = async () => {
  const token = (await cookies()).get("_medusa_jwt")?.value

  if (!token) {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const removeAuthToken = async () => {
  (await cookies()).delete("_medusa_jwt")
}
```

### Token Refresh

Tokens are automatically refreshed when making authenticated requests through the MedusaJS SDK:

```typescript
// Automatic with SDK
const headers = await getAuthHeaders()

const customer = await sdk.client.fetch(
  `/store/customers/me`,
  {
    method: "GET",
    headers,
    next: { revalidate: 60 }
  }
)
```

### Session Expiration

- Token expiration: **7 days**
- Session cache: **60 seconds** (revalidateTag)
- Cart transfer: **Automatic on login**

---

## Protected Routes

### Route Protection Logic

Located in `src/middleware.ts`:

```typescript
const protectedUrl = ['checkout', 'account']

// Check if route requires authentication
const isUrlProtected = protectedUrl.some(prurl => 
  request.nextUrl.pathname.split("/").includes(prurl)
)

// If no token and route is protected, redirect to login
if (!token && isUrlProtected) {
  return NextResponse.redirect(
    `${request.nextUrl.origin}/${countryCode}/auth`, 
    307
  )
}
```

### Protected Routes

| Route | Protection | Redirect |
|-------|-----------|----------|
| `/account/*` | Required | `/auth` |
| `/checkout/*` | Required | `/auth` |
| `/auth` | Redirect if logged in | `/account` |
| All public pages | Optional | None |

### Implementation Example

```typescript
// In middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("_medusa_jwt")?.value
  const { pathname } = request.nextUrl

  // Allow admin and API routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check protected routes
  const protectedUrl = ['checkout', 'account']
  const isUrlProtected = protectedUrl.some(prurl => 
    pathname.split("/").includes(prurl)
  )

  // Redirect to login if needed
  if (!token && isUrlProtected) {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth`, 307)
  }

  return NextResponse.next()
}
```

---

## API Integration

### MedusaJS SDK Configuration

```typescript
// src/lib/config.ts
import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseURL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
```

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/customer/emailpass/register` | POST | Register with email/password |
| `/auth/customer/emailpass/login` | POST | Login with email/password |
| `/auth/customer/phone-auth/register` | POST | Register phone auth |
| `/auth/customer/phone-auth/callback` | POST | Verify OTP |
| `/auth/customer/emailpass/reset-password` | POST | Request password reset |
| `/store/customers/me` | GET | Get current customer |
| `/store/customers/{id}` | PATCH | Update customer |
| `/store/auth/logout` | POST | Logout |

### API Request Examples

**Check Phone Existence:**
```typescript
await sdk.auth.login("customer", "phone-auth", { phone: "989123456789" })
// Returns: { location: "register" | "password" }
```

**Email/Password Login:**
```typescript
const token = await sdk.auth.login("customer", "emailpass", {
  email: "user@example.com",
  password: "password123"
})
```

**Verify OTP:**
```typescript
const token = await sdk.auth.callback("customer", "phone-auth", {
  phone: "989123456789",
  otp: "123456"
})
```

**Get Current Customer:**
```typescript
const customer = await sdk.store.customer.retrieve(headers)
// Returns customer object with orders, addresses, etc.
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid phone number" | Phone format incorrect | Use format: 09XXXXXXXXX or +989XXXXXXXXX |
| "Phone already registered" | Account exists | Redirect to password login |
| "Invalid OTP" | Wrong code entered | Request new OTP |
| "Invalid credentials" | Wrong password | Show password reset option |
| "Token expired" | Session expired | Redirect to login |
| "Network error" | Backend unreachable | Show error message, retry |

### Error Handling Pattern

```typescript
try {
  const response = await registerWithPhone({
    firstName: "Ali",
    lastName: "Karimi",
    phone: "989123456789",
    email: "ali@example.com",
    password: "SecurePass123!"
  })

  if (typeof response === "string") {
    // Error occurred
    setSubmitError(response)
    return
  }

  if (!response.location) {
    setSubmitError("Registration failed")
    return
  }

  // Success
  setCurrentView(LOGIN_VIEW.OTP)

} catch (err: any) {
  setSubmitError(err?.message || "An unexpected error occurred")
}
```

### Custom Error Handling

```typescript
// src/lib/util/medusa-error.ts
export default function medusaError(error: any) {
  if (error.response?.status === 401) {
    return { error: "Unauthorized access" }
  }
  if (error.response?.status === 404) {
    return { error: "User not found" }
  }
  if (error.message.includes("ECONNREFUSED")) {
    return { error: "Backend service unavailable" }
  }
  return { error: error.message }
}
```

---

## Security Considerations

### 1. Token Security

✅ **Best Practices Implemented:**
- JWT tokens stored in HTTP-only cookies
- Secure flag enabled in production
- SameSite=Lax for CSRF protection
- 7-day expiration window
- Automatic refresh on new requests

```typescript
cookies().set("_medusa_jwt", token, {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,                   // Prevent JS access
  sameSite: "lax",                  // CSRF protection
  secure: process.env.NODE_ENV === "production"
})
```

### 2. Password Security

✅ **Requirements:**
- Minimum 8 characters
- At least one number
- At least one special character
- Client-side validation
- Server-side validation (MedusaJS)

```typescript
const passwordRules = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },
  validate: {
    hasNumber: (value) =>
      /[0-9]/.test(value) || "At least one number required",
    hasSpecialChar: (value) =>
      /[!@#$%^&*(),.?":{}|<>]/.test(value) || 
      "At least one special character required",
  },
}
```

### 3. Phone Number Validation

✅ **Validation Pattern:**
```typescript
{
  pattern: {
    value: /((0?9)|(\+?989))\d{9}/g,
    message: "Invalid Iranian phone number"
  }
}
```

### 4. CORS Configuration

✅ **Configured in `src/payload.config.ts`:**
```typescript
cors: [getServerSideURL()].filter(Boolean)
```

### 5. CSRF Protection

✅ **Middleware Protection:**
- SameSite cookie attribute
- Origin validation
- CORS configuration

### 6. Rate Limiting

⚠️ **Recommended Enhancement:**
```typescript
// Add rate limiting middleware
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: 'Too many login attempts, try again later'
})
```

### 7. OTP Security

✅ **Features:**
- 6-digit OTP code
- 10-minute expiration
- Single-use only
- Phone number verified before OTP
- Rate limited

### 8. Server-Side Session Validation

✅ **Implemented in all authenticated routes:**
```typescript
const headers = await getAuthHeaders()
if (!headers.Authorization) {
  // User not authenticated
  redirect('/auth')
}
```

---

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Backend Configuration
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
PAYLOAD_SECRET=your_payload_secret_key

# Email Configuration
NEXT_PUBLIC_EMAIL_DOMAIN=gmail.com

# Security
CRON_SECRET=your_cron_secret
PREVIEW_SECRET=your_preview_secret
```

### MedusaJS Backend Auth Configuration

Ensure your MedusaJS backend is configured with:

1. **Phone-Auth Provider:**
```typescript
// medusa-config.js
{
  resolve: "@medusajs/medusa/dist/loaders/plugins",
  options: {
    plugins: [
      {
        resolve: "@medusajs/auth",
        options: {
          providers: [
            {
              resolve: "@medusajs/auth-phone",
              // configuration...
            }
          ]
        }
      }
    ]
  }
}
```

2. **Email/Password Provider:**
```typescript
{
  resolve: "@medusajs/auth-emailpass",
  // configuration...
}
```

---

## Testing Authentication

### Test Scenarios

1. **Phone Registration:**
   - Enter new phone number
   - Fill registration form
   - Verify OTP
   - Login successful

2. **Phone Login:**
   - Enter existing phone number
   - Enter password
   - Login successful

3. **Invalid Credentials:**
   - Enter wrong password
   - Error message displayed
   - Attempt retry

4. **Session Expiration:**
   - Wait for token expiration
   - Try to access protected route
   - Redirected to login

5. **Cart Transfer:**
   - Add items to cart as guest
   - Login
   - Cart items transferred to user account

### Manual Testing

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:8000/en/auth

# Test phone login
Phone: 989123456789
Then follow the prompts
```

### E2E Testing Example

```typescript
// playwright.config.ts
export const STORAGE_STATE = path.join(
  __dirname, 
  "playwright/.auth/user.json"
)

// tests/auth.spec.ts
test('user can login with phone', async ({ page }) => {
  await page.goto('/auth')
  
  // Enter phone
  await page.fill('input[placeholder="09123456789"]', '989123456789')
  await page.click('button:has-text("Continue")')
  
  // Enter password
  await page.fill('input[type="password"]', 'TestPass123!')
  await page.click('button:has-text("Login")')
  
  // Verify redirected
  await expect(page).toHaveURL('/account')
})
```

---

## Troubleshooting

### Issue: "Token not set" error

**Cause:** Auth token not being stored in cookies

**Solution:**
```typescript
// Verify cookie settings in setAuthToken()
// Check that httpOnly and secure flags are correct
// For development: secure should be false
```

### Issue: "User not authenticated" on protected route

**Cause:** Token expired or middleware not checking correctly

**Solution:**
```typescript
// Check middleware.ts is processing the request
// Verify token hasn't expired
// Check cookie domain matches
```

### Issue: OTP not received

**Cause:** SMS provider misconfigured or phone number format incorrect

**Solution:**
```typescript
// Use format: 989123456789 (without +98 prefix)
// Or: +989123456789 (with +98 prefix)
// Check MedusaJS SMS provider configuration
```

### Issue: CORS error on auth requests

**Cause:** Backend CORS not configured properly

**Solution:**
```typescript
// In MedusaJS backend - medusa-config.js
const ADMIN_CORS = process.env.ADMIN_CORS || "http://localhost:8000"
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000"

// Update .env
ADMIN_CORS=http://localhost:8000,https://yourdomain.com
STORE_CORS=http://localhost:8000,https://yourdomain.com
```

---

## API Reference

### Server Actions (in `src/lib/data/customer.ts`)

#### `authenticateWithPhone(phone: string)`

Check if phone account exists and initiate login flow.

**Parameters:**
- `phone` (string): User's phone number

**Returns:**
```typescript
{
  location: "register" | "password" | "error"
}
```

**Example:**
```typescript
const result = await authenticateWithPhone("989123456789")
if (result.location === "register") {
  // Show registration form
} else if (result.location === "password") {
  // Show password form
}
```

---

#### `registerWithPhone(data: RegistrationData)`

Register new user with phone number.

**Parameters:**
```typescript
{
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}
```

**Returns:**
```typescript
{
  location: "otp" | string (error)
}
```

**Example:**
```typescript
const result = await registerWithPhone({
  firstName: "Ali",
  lastName: "Karimi",
  phone: "989123456789",
  email: "ali@example.com",
  password: "SecurePass123!"
})
```

---

#### `verifyOtp({ otp, phone })`

Verify OTP code and create session.

**Parameters:**
- `otp` (string): 6-digit code
- `phone` (string): User's phone number

**Returns:**
```typescript
boolean | string (error)
```

**Example:**
```typescript
const success = await verifyOtp({
  otp: "123456",
  phone: "989123456789"
})
```

---

#### `login(formData: FormData)`

Login with email and password.

**Parameters:**
```typescript
FormData with:
- email (string)
- password (string)
```

**Returns:**
```typescript
string | null (error or null on success)
```

---

#### `signout(countryCode: string)`

Logout current user.

**Parameters:**
- `countryCode` (string): Current country code for redirect

**Returns:**
```typescript
void (redirects to auth page)
```

---

#### `retrieveCustomer()`

Get current authenticated user's information.

**Returns:**
```typescript
HttpTypes.StoreCustomer | null
```

---

## Best Practices

1. **Always validate phone format on client and server**
2. **Use HTTPS in production for auth endpoints**
3. **Implement rate limiting on auth endpoints**
4. **Log authentication events for security monitoring**
5. **Regularly rotate JWT secrets**
6. **Keep dependencies updated**
7. **Test authentication flows regularly**
8. **Monitor failed login attempts**
9. **Implement 2FA for sensitive accounts**
10. **Use environment variables for all secrets**

---

## Additional Resources

- [MedusaJS Authentication Docs](https://docs.medusajs.com/learn/fundamentals/authentication)
- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Support & Contact

For authentication issues or questions:
- Check troubleshooting section above
- Review MedusaJS documentation
- Check application logs for errors
- Contact development team

---

**Last Updated:** November 10, 2025  
**Version:** 2.0  
**Status:** Active
