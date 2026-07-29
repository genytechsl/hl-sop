import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const userCookie = request.cookies.get("user");

  const isLoggedIn = !!userCookie;

  // Public routes
  const publicRoutes = ["/"];

  const isPublicRoute = publicRoutes.includes(pathname);

  // Allow API routes and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Not logged in -> redirect to login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Already logged in -> prevent going back to login page
  if (isLoggedIn && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run middleware on all routes except:
     * - Next.js static files
     * - Images
     * - Static assets
     */
    "/((?!_next/static|_next/image|.*\\..*).*)",
  ],
};
