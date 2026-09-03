import { NextRequest, NextResponse } from "next/server";

import { validateEmployeeLogin } from "@/lib/employee-service";

import { createSession, type UserRole } from "@/lib/auth/session";

import { createLoginAuditLog } from "@/lib/auth/login-audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const identifier =
      typeof body.identifier === "string" ? body.identifier.trim() : "";

    const password = typeof body.password === "string" ? body.password : "";

    // =========================================================
    // VALIDATION
    // =========================================================

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username/email and password are required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // VALIDATE CREDENTIALS
    // =========================================================

    const employee = await validateEmployeeLogin(identifier, password);

    // =========================================================
    // FAILED LOGIN AUDIT
    // =========================================================

    if (!employee) {
      await createLoginAuditLog({
        request,
        identifier,
        employeeId: null,
        event: "LOGIN",
        success: false,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid username/email or password",
        },
        {
          status: 401,
        },
      );
    }

    // =========================================================
    // CREATE SESSION
    // =========================================================

    const role = employee.role as UserRole;

    const user = {
      id: employee.id,
      name: employee.name,
      role,
      designation: employee.designation,
      email: employee.email,
      department: employee.department,
    };

    await createSession(user);

    // =========================================================
    // SUCCESSFUL LOGIN AUDIT
    // =========================================================

    await createLoginAuditLog({
      request,
      employeeId: employee.id,
      identifier,
      event: "LOGIN",
      success: true,
    });

    // =========================================================
    // REDIRECT
    // =========================================================

    let redirectTo = "/dashboard";

    switch (role) {
      case "actionOwner":
        redirectTo = "/assigned";
        break;

      case "admin":
      case "dataEntry":
        redirectTo = "/dashboard";
        break;

      default:
        redirectTo = "/";
        break;
    }

    return NextResponse.json({
      success: true,
      user,
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during login",
      },
      {
        status: 500,
      },
    );
  }
}
