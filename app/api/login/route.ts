import { NextRequest, NextResponse } from "next/server";
import employees from "@/data/employees.json";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const employee = employees.find(
    (e) => e.username === username && e.security === password && e.active,
  );

  if (!employee) {
    return NextResponse.json({ success: false }, { status: 401 });
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

    default:
      redirectTo = "/dashboard";
  }

  const response = NextResponse.json({
    success: true,
    user: {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      designation: employee.designation,
      email: employee.email,
    },
    redirectTo,
  });

  response.cookies.set(
    "user",
    JSON.stringify({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      designation: employee.designation,
      email: employee.email,
    }),
    {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24,
    },
  );

  return response;
}
