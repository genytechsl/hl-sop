import { NextRequest, NextResponse } from "next/server";

import { destroySession, getSession } from "@/lib/auth/session";

import { createLoginAuditLog } from "@/lib/auth/login-audit";

export async function POST(request: NextRequest) {
  try {
    // Get the user BEFORE destroying the session.
    const sessionUser = await getSession();

    if (sessionUser) {
      await createLoginAuditLog({
        request,
        employeeId: sessionUser.id,
        identifier: sessionUser.email,
        event: "LOGOUT",
        success: true,
      });
    }

    await destroySession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to logout",
      },
      {
        status: 500,
      },
    );
  }
}
