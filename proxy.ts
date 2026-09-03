import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

interface SessionUser {
  id: string;
  name: string;
  role: "admin" | "actionOwner" | "dataEntry" | "sys_admin";
  designation: string;
  email: string;
  department?: string | null;
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // =========================================================
  // PROTECTED ADMIN API ROUTES
  // =========================================================
  if (
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/customers") ||
    pathname.startsWith("/api/users")
  ) {
    const user = await getMiddlewareSession(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin" && user.role !== "sys_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // =========================================================
  // OTHER API / INTERNAL ROUTES
  // =========================================================
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // =========================================================
  // GET CURRENT SESSION
  // =========================================================
  const user = await getMiddlewareSession(request);

  // =========================================================
  // LOGIN PAGE
  // =========================================================
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(
        new URL(
          user.role === "actionOwner" ? "/assigned" : "/dashboard",
          request.url,
        ),
      );
    }

    return NextResponse.next();
  }

  // =========================================================
  // PROTECTED PAGES
  // =========================================================
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // =========================================================
  // SYSTEM ADMIN
  // Full access to all authenticated routes
  // =========================================================
  if (user.role === "sys_admin") {
    return NextResponse.next();
  }

  // =========================================================
  // ADMIN ONLY
  // =========================================================
  if (pathname.startsWith("/settings")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // =========================================================
  // REPORTS - ADMIN ONLY
  // =========================================================
  if (pathname.startsWith("/reports")) {
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // =========================================================
  // ASSIGNED TICKETS
  // Admin + Action Owner
  // =========================================================
  if (pathname.startsWith("/assigned")) {
    if (user.role !== "actionOwner" && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // =========================================================
  // TICKET LIST
  // Admin + Data Entry ONLY
  // =========================================================
  if (pathname === "/tickets") {
    if (user.role !== "admin" && user.role !== "dataEntry") {
      return NextResponse.redirect(new URL("/assigned", request.url));
    }
  }

  // =========================================================
  // NEW TICKET
  // All authenticated users allowed here
  // =========================================================
  if (pathname === "/tickets/new") {
    return NextResponse.next();
  }

  // =========================================================
  // INDIVIDUAL TICKET
  // API performs ticket-specific authorization
  // =========================================================
  if (pathname.startsWith("/tickets/view")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
