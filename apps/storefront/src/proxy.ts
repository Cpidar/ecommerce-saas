import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { ADMIN_COOKIE } from './lib/medusa/admin-auth';

/**
 * Handle Puck editor /edit url.
 * @param request
 * @param response
 */
async function handleEditRoute(request: NextRequest) {
  console.log('start handle edit path')

  const INCLUDED_SLUGS = new Set([
    '/home',
    '/about'
  ]);

  // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
  const pathWithoutEdit = request.nextUrl.pathname.slice(
    0,
    request.nextUrl.pathname.length - 5
    // just for manage home page (where pathWithoutEdit === '')
  ) || "/home";


  // Enable only for [...INCLUDED_SLUGS]/edit"
  if (!INCLUDED_SLUGS.has(pathWithoutEdit)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!token) {
    console.log("redirect to", `/admin/login?from=${pathWithoutEdit}/edit`)
    // Fix 1: Make sure the URL has a leading slash
    const loginUrl = new URL(`/admin/login?from=${pathWithoutEdit}/edit`, request.url);
    console.log("Login URL:", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  // Check token validity
  // TODO: must check store id to match with x-store-id header, otherwise redirect to login page
  try {
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/admin/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL(`/admin/login?from=${pathWithoutEdit}/edit`, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(`/admin/login?from=${pathWithoutEdit}/edit`, request.url));
  }



  const pathWithEditPrefix = `/admin/puck${pathWithoutEdit}`;

  return NextResponse.rewrite(new URL(pathWithEditPrefix, request.url));

}

export async function proxy(request: NextRequest) {
  const countryCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ir"

  if (!countryCode) return notFound()

  // Check if header was added to response
  // console.log("📤 Incomming Request headers:", Object.fromEntries(request.headers))

  let storeId = request.headers.get('x-store-id') || process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!
  // TODO: Also check Store subscription status and redirect to better place
  if (!storeId) {
    // Optionally redirect or return error 
    throw new Error('Store id not found!')
  }

  // Add store ID to headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-store-id', storeId)

  // Also add to response for downstream services
  let response = NextResponse.next({
    headers: requestHeaders
  })

  // Set a cookie for client-side access if needed
  response.cookies.set('current_store_id', storeId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  })


  // Rewrite routes that match "/[...puckPath]/edit" to "/puck/[...puckPath]"
  if (request.method === "GET") {
    if (request.nextUrl.pathname.endsWith("/edit")) {
      response = await handleEditRoute(request)

      // Also add to response for downstream services
      response.headers.set('x-store-id', storeId)

      // Set a cookie for client-side access if needed
      response.cookies.set('current_store_id', storeId, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      // console.log("📤 Response headers:", Object.fromEntries(response.headers))

    }
  }


  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|images|robots.txt|auth).*)",
  ],
}