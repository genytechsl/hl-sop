import { NextResponse } from "next/server";
import { getSession, type SessionUser, type UserRole } from "./session";

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole[],
): Promise<SessionUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole(["admin"]);
}

export function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Unauthorized",
    },
    { status: 401 },
  );
}

export function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Forbidden",
    },
    { status: 403 },
  );
}
