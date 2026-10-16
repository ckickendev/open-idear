import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js routes, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/banner")
  ) {
    return NextResponse.next();
  }

  // 2. Determine explicit URL locale
  const isViRoute = pathname === "/vi" || pathname.startsWith("/vi/");
  const activeLocale = isViRoute ? "vi" : "en";

  // 3. Inject locale and pathname headers for Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", activeLocale);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. Synchronize NEXT_LOCALE cookie if explicit URL locale differs from current cookie
  const currentCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (isViRoute && currentCookie !== "vi") {
    response.cookies.set("NEXT_LOCALE", "vi", {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });
  } else if (!isViRoute && pathname.startsWith("/post/") && currentCookie === "vi") {
    // Navigating explicitly to an English article preserves user browsing
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static file extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
