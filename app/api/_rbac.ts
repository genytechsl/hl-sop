import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export const ADMIN_ROLES = ["admin", "sys_admin"] as const;
export const TICKET_ROLES = ["admin", "sys_admin", "actionOwner"] as const;
export const SYS_ADMIN_ROLES = ["sys_admin"] as const;

export async function authorizeRoles(allowedRoles: readonly string[]) {
  const user = await getSession();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
