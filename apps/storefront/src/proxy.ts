import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE } from "./lib/medusa/admin-auth"

async function handleEditRoute(
  request: NextRequest,
  requestHeaders: Headers,
) {
  const INCLUDED_SLUGS = new Set([
    "/home",
    "/about",
    "/policies/terms",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
  ])

  const pathWithoutEdit =
    request.nextUrl.pathname.slice(
      0,
      request.nextUrl.pathname.length - 5,
    ) || "/home"

  if (!INCLUDED_SLUGS.has(pathWithoutEdit)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value

  if (!token) {
    return NextResponse.redirect(
      new URL(
        `/admin-portal/login?from=${pathWithoutEdit}/edit`,
        request.url,
      ),
    )
  }

  try {
    const verifyRes = await fetch(
      `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/admin/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!verifyRes.ok) {
      return NextResponse.redirect(
        new URL(
          `/admin-portal/login?from=${pathWithoutEdit}/edit`,
          request.url,
        ),
      )
    }
  } catch {
    return NextResponse.redirect(
      new URL(
        `/admin-portal/login?from=${pathWithoutEdit}/edit`,
        request.url,
      ),
    )
  }

  const pathWithEditPrefix =
    `/admin-portal/puck${pathWithoutEdit}`

  return NextResponse.rewrite(
    new URL(pathWithEditPrefix, request.url),
    {
      request: {
        headers: requestHeaders,
      },
    },
  )
}

export async function proxy(request: NextRequest) {
  const countryCode =
    process.env.NEXT_PUBLIC_DEFAULT_REGION || "ir"

  if (!countryCode) {
    return notFound()
  }

  const storeId =
    request.headers.get("x-store-id") ||
    process.env.NEXT_PUBLIC_DEFAULT_STORE_ID

  if (!storeId) {
    throw new Error("Store id not found!")
  }

  // Modify the INCOMING request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-store-id", storeId)

  // Handle Puck edit routes
  if (
    request.method === "GET" &&
    request.nextUrl.pathname.endsWith("/edit")
  ) {
    const response = await handleEditRoute(
      request,
      requestHeaders,
    )

    response.cookies.set("current_store_id", storeId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // Normal request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.cookies.set("current_store_id", storeId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|images|robots.txt|auth).*)",
  ],
}