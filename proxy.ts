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

function redirectToAccessDenied(request: NextRequest) {
  return NextResponse.redirect(new URL("/access-denied", request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  const user = await getMiddlewareSession(request);

  if (pathname.startsWith("/api")) {
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

  if (pathname === "/") {
    if (!user) {
      return NextResponse.next();
    }

    if (user.mustChangePassword) {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    return NextResponse.redirect(new URL(getDefaultRoute(user), request.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/change-password") {
    if (user.mustChangePassword) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(getDefaultRoute(user), request.url));
  }

  if (user.mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", request.url));
  }

  if (pathname === "/access-denied") {
    return NextResponse.next();
  }

  if (user.role === "sys_admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/settings")) {
    if (user.role !== "admin") {
      return redirectToAccessDenied(request);
    }
  }

  if (pathname.startsWith("/reports")) {
    if (user.role !== "admin") {
      return redirectToAccessDenied(request);
    }
  }

  if (pathname.startsWith("/assigned")) {
    if (user.role !== "actionOwner" && user.role !== "admin") {
      return redirectToAccessDenied(request);
    }
  }

  if (pathname === "/tickets/new") {
    if (
      user.role !== "admin" &&
      user.role !== "dataEntry" &&
      user.role !== "actionOwner"
    ) {
      return redirectToAccessDenied(request);
    }

    return NextResponse.next();
  }

  if (pathname === "/tickets") {
    if (user.role !== "admin" && user.role !== "dataEntry") {
      return redirectToAccessDenied(request);
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/tickets/view")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && user.role === "actionOwner") {
    return redirectToAccessDenied(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
