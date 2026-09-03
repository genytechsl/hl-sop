import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured");
}

const encodedSecret = new TextEncoder().encode(secret);

export type UserRole = "admin" | "actionOwner" | "dataEntry" | "sys_admin";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  email: string;
  department?: string | null;
}

interface SessionPayload extends JWTPayload {
  user: SessionUser;
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    user,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodedSecret);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedSecret, {
      algorithms: ["HS256"],
    });

    if (!payload.user) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}
