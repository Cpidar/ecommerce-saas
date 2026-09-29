import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export function getEditablePagesSlugs(): Set<string> {
  const envSlugs = process.env.EDITABLE_PAGES_SLUGS;

  if (envSlugs) {
    const slugs = envSlugs.split(",").map((s) => s.trim());
    return new Set(slugs);
  }

  // Default fallback
  return new Set([
    "/home",
    "/about",
    "/policies/terms",
    "/policies/shipping",
    "/policies/returns",
    "/policies/privacy",
    "/faq",
  ]);
}
const SAAS_HOSTS = new Set([
  "nitrocommerce.com",
  "www.nitrocommerce.com",
  "saas.tabeshelecshop.com",
]);

async function handleSaasRoute(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const isSaasPath = pathname === "/saas" || pathname.startsWith("/saas/");

  if (host && SAAS_HOSTS.has(host)) {
    // Canonicalize: mysaas.com/saas/foo -> mysaas.com/foo
    if (isSaasPath) {
      url.pathname = pathname.replace(/^\/saas/, "") || "/";
      return NextResponse.redirect(url, 308);
    }
    // mysaas.com/foo -> internally serves /saas/foo
    url.pathname = `/saas${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Any other domain: /saas is not available
  if (isSaasPath) {
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }
}

async function handleEditRoute(request: NextRequest, requestHeaders: Headers) {
  const EDITABLE_PAGES_SLUGS = new Set(getEditablePagesSlugs());

  const pathWithoutEdit =
    request.nextUrl.pathname.slice(0, request.nextUrl.pathname.length - 5) ||
    "/home";

  if (!EDITABLE_PAGES_SLUGS.has(pathWithoutEdit)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const pathWithEditPrefix = `/admin-portal/puck${pathWithoutEdit}`;

  return NextResponse.rewrite(new URL(pathWithEditPrefix, request.url), {
    request: {
      headers: requestHeaders,
    },
  });
}

export async function proxy(request: NextRequest) {
  const countryCode = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ir";

  if (!countryCode) {
    return notFound();
  }

  const storeId =
    request.headers.get("x-store-id") ||
    process.env.NEXT_PUBLIC_DEFAULT_STORE_ID;

  if (!storeId) {
    throw new Error("Store id not found!");
  }

  // Modify the INCOMING request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-store-id", storeId);

  // Handle Saas routes
  // const saasResponse = await handleSaasRoute(request);
  // if (saasResponse) {
  //   saasResponse.cookies.set("current_store_id", storeId, {
  //     httpOnly: false,
  //     secure: process.env.NODE_ENV === "production",
  //     sameSite: "lax",
  //     maxAge: 60 * 60 * 24,
  //   });

  //   return saasResponse;
  // }

  // Handle Puck edit routes
  if (request.nextUrl.pathname.endsWith("/edit")) {
    const response = await handleEditRoute(request, requestHeaders);

    response.cookies.set("current_store_id", storeId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  }

  // Normal request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set("current_store_id", storeId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|images|robots.txt|auth).*)",
  ],
};
