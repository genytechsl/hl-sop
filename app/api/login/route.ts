import { NextRequest, NextResponse } from "next/server";
import { validateEmployeeLogin } from "@/lib/employee-service";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      );
    }

    const employee = await validateEmployeeLogin(username, password);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 },
      );
    }

    let redirectTo = "/dashboard";

    switch (employee.role) {
      case "actionOwner":
        redirectTo = "/assigned";
        break;

      case "cmuManager":
        redirectTo = "/dashboard";
        break;

      case "admin":
        redirectTo = "/dashboard";
        break;

      case "dataEntry":
        redirectTo = "/dashboard";
        break;

      default:
        redirectTo = "/dashboard";
        break;
    }

    const user = {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      designation: employee.designation,
      email: employee.email,
      department: employee.department,
    };

    const response = NextResponse.json({
      success: true,
      user,
      redirectTo,
    });

    response.cookies.set("user", JSON.stringify(user), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
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
