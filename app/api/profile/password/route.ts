import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSession, getSession, type UserRole } from "@/lib/auth/session";

export async function PUT(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =========================================================
    // REQUEST BODY
    // =========================================================

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";

    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: "Current password and new password are required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          error: "New password must contain at least 8 characters",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // GET CURRENT EMPLOYEE
    // =========================================================

    const employee = await prisma.employee.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        role: true,
        department: true,
        active: true,
        passwordHash: true,
        mustChangePassword: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    if (!employee.active) {
      return NextResponse.json(
        {
          error: "This account has been disabled",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================================
    // VERIFY CURRENT PASSWORD
    // =========================================================

    const validCurrentPassword = await bcrypt.compare(
      currentPassword,
      employee.passwordHash,
    );

    if (!validCurrentPassword) {
      return NextResponse.json(
        {
          error: "Current password is incorrect",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // PREVENT REUSING CURRENT PASSWORD
    // =========================================================

    const isSamePassword = await bcrypt.compare(
      newPassword,
      employee.passwordHash,
    );

    if (isSamePassword) {
      return NextResponse.json(
        {
          error: "New password must be different from your current password",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // HASH NEW PASSWORD
    // =========================================================

    const passwordHash = await bcrypt.hash(newPassword, 12);

    // =========================================================
    // UPDATE PASSWORD
    // =========================================================

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        role: true,
        department: true,
        mustChangePassword: true,
      },
    });

    // =========================================================
    // REFRESH SESSION
    // =========================================================
    //
    // Your existing JWT still contains:
    //
    // mustChangePassword: true
    //
    // Therefore we need to replace it with a new session.
    // =========================================================

    await createSession({
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      designation: updatedEmployee.designation,
      email: updatedEmployee.email,
      role: updatedEmployee.role as UserRole,
      department: updatedEmployee.department,
      mustChangePassword: false,
    });

    // =========================================================
    // ROLE-BASED DESTINATION
    // =========================================================

    let redirectTo = "/dashboard";

    switch (updatedEmployee.role) {
      case "actionOwner":
        redirectTo = "/assigned";
        break;

      case "admin":
      case "dataEntry":
      case "sys_admin":
        redirectTo = "/dashboard";
        break;

      default:
        redirectTo = "/";
        break;
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
      redirectTo,
    });
  } catch (error) {
    console.error("PUT /api/profile/password error:", error);

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
