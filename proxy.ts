import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

interface SessionUser {
  id: string;
  name: string;
  role: "admin" | "actionOwner" | "dataEntry" | "sys_admin";
  designation: string;
  email: string;
  department?: string | null;
  mustChangePassword: boolean;
}

interface SessionPayload extends JWTPayload {
  user: SessionUser;
}

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured");
}

const encodedSecret = new TextEncoder().encode(secret);

async function getMiddlewareSession(
  request: NextRequest,
): Promise<SessionUser | null> {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedSecret, {
      algorithms: ["HS256"],
    });

    return payload.user ?? null;
  } catch {
    return null;
  }
}

function getDefaultRoute(user: SessionUser) {
  if (user.role === "actionOwner") {
    return "/assigned";
  }

  return "/dashboard";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================================================
  // NEXT.JS INTERNAL ROUTES
  // =========================================================

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  // =========================================================
  // GET SESSION
  // =========================================================

  const user = await getMiddlewareSession(request);

  // =========================================================
  // API ROUTES
  // =========================================================

  if (pathname.startsWith("/api")) {
    // ---------------------------------------------------------
    // FORCED PASSWORD CHANGE API RESTRICTION
    // ---------------------------------------------------------
    //
    // If the temporary password has not been changed,
    // don't allow normal application API access.
    //
    // The password-change endpoint must remain available.
    // Add your logout API here as well.
    // ---------------------------------------------------------

    if (
      user?.mustChangePassword &&
      pathname !== "/api/profile/password" &&
      pathname !== "/api/logout"
    ) {
      return NextResponse.json(
        {
          error: "Password change required",
          code: "PASSWORD_CHANGE_REQUIRED",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================================
    // ADMIN API ROUTES
    // =========================================================

    if (
      pathname.startsWith("/api/settings") ||
      pathname.startsWith("/api/customers") ||
      pathname.startsWith("/api/users")
    ) {
      if (!user) {
        return NextResponse.json(
          {
            error: "Unauthorized",
          },
          {
            status: 401,
          },
        );
      }

      if (user.role !== "admin" && user.role !== "sys_admin") {
        return NextResponse.json(
          {
            error: "Forbidden",
          },
          {
            status: 403,
          },
        );
      }
    }

    return NextResponse.next();
  }

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (pathname === "/") {
    if (!user) {
      return NextResponse.next();
    }

    // First login takes priority over role.
    if (user.mustChangePassword) {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    return NextResponse.redirect(new URL(getDefaultRoute(user), request.url));
  }

  // =========================================================
  // AUTHENTICATION REQUIRED
  // =========================================================

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // =========================================================
  // CHANGE PASSWORD PAGE
  // =========================================================

  if (pathname === "/change-password") {
    if (user.mustChangePassword) {
      return NextResponse.next();
    }

    // User already completed password setup.
    return NextResponse.redirect(new URL(getDefaultRoute(user), request.url));
  }

  // =========================================================
  // FORCE PASSWORD CHANGE
  // =========================================================
  //
  // IMPORTANT:
  // This must occur BEFORE any RBAC checks.
  // =========================================================

  if (user.mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  // =========================================================
  // SYSTEM ADMIN
  // =========================================================

  if (user.role === "sys_admin") {
    return NextResponse.next();
  }

  // =========================================================
  // SETTINGS
  // ADMIN ONLY
  // =========================================================

  if (pathname.startsWith("/settings")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // =========================================================
  // REPORTS
  // ADMIN ONLY
  // =========================================================

  if (pathname.startsWith("/reports")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // =========================================================
  // ASSIGNED
  // ADMIN + ACTION OWNER
  // =========================================================

  if (pathname.startsWith("/assigned")) {
    if (user.role !== "actionOwner" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // NEW TICKET
  // ADMIN + DATA ENTRY + ACTION OWNER
  // =========================================================

  if (pathname === "/tickets/new") {
    if (
      user.role !== "admin" &&
      user.role !== "dataEntry" &&
      user.role !== "actionOwner"
    ) {
      return NextResponse.redirect(new URL(getDefaultRoute(user), request.url));
    }

    return NextResponse.next();
  }

  // =========================================================
  // TICKETS LIST
  // ADMIN + DATA ENTRY ONLY
  // =========================================================

  if (pathname === "/tickets") {
    if (user.role !== "admin" && user.role !== "dataEntry") {
      return NextResponse.redirect(new URL("/assigned", request.url));
    }

    return NextResponse.next();
  }

  // =========================================================
  // TICKET DETAILS
  // =========================================================

  if (pathname.startsWith("/tickets/view")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
