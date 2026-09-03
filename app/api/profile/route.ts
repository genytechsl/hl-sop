import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSession, type UserRole } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: session.id,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        email: true,
        username: true,
        role: true,
        active: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET /api/profile error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const { name, designation, department, email, username } = body;

    /*
     * Users are allowed to modify only their own
     * personal/account information.
     *
     * role and active are intentionally NOT accepted.
     */

    if (
      !name?.trim() ||
      !designation?.trim() ||
      !department?.trim() ||
      !email?.trim() ||
      !username?.trim()
    ) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    /*
     * Check whether the new username belongs to another user.
     */

    const existingUsername = await prisma.employee.findFirst({
      where: {
        username: username.trim(),
        NOT: {
          id: session.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    /*
     * Check whether the new email belongs to another user.
     */

    const existingEmail = await prisma.employee.findFirst({
      where: {
        email: email.trim(),
        NOT: {
          id: session.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email address already exists" },
        { status: 409 },
      );
    }

    /*
     * Update ONLY the current user's editable fields.
     */

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: session.id,
      },
      data: {
        name: name.trim(),
        designation: designation.trim(),
        department: department.trim(),
        email: email.trim(),
        username: username.trim(),
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        email: true,
        username: true,
        role: true,
        active: true,
      },
    });

    /*
     * IMPORTANT:
     *
     * Your JWT session contains name, email, designation,
     * department, etc.
     *
     * Therefore recreate the session after updating the
     * profile so the JWT does not contain old information.
     */

    await createSession({
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      role: updatedEmployee.role as UserRole,
      designation: updatedEmployee.designation,
      email: updatedEmployee.email,
      department: updatedEmployee.department,
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error("PUT /api/profile error:", error);

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
