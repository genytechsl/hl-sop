import { NextRequest, NextResponse } from "next/server";
import { validateEmployeeLogin } from "@/lib/employee-service";
import { createSession, type UserRole } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username/email and password are required",
        },
        { status: 400 },
      );
    }

    const employee = await validateEmployeeLogin(identifier.trim(), password);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username/email or password",
        },
        { status: 401 },
      );
    }

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
      { status: 500 },
    );
  }
}
