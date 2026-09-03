import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await params;

    // =========================================================
    // AUTHORIZATION
    // =========================================================

    /*
     * Admin:
     *   Can change any user's password.
     *
     * Other authenticated users:
     *   Can only change their own password.
     */

    if (sessionUser.role !== "admin" && sessionUser.id !== id) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================================
    // REQUEST BODY
    // =========================================================

    const body = await request.json();

    const password = body.password;

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must contain at least 8 characters",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // VERIFY USER EXISTS
    // =========================================================

    const user = await prisma.employee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // HASH PASSWORD
    // =========================================================

    const passwordHash = await bcrypt.hash(password, 12);

    // =========================================================
    // UPDATE PASSWORD
    // =========================================================

    await prisma.employee.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);

    return NextResponse.json(
      {
        error: "Failed to change password",
      },
      {
        status: 500,
      },
    );
  }
}
