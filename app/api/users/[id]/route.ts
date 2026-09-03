import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const PROTECTED_USERNAMES = ["geny_admin", "geny_admin_b"] as const;

function isProtectedUsername(username: string) {
  return PROTECTED_USERNAMES.includes(
    username.toLowerCase() as (typeof PROTECTED_USERNAMES)[number],
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.employee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        email: true,
        active: true,
        role: true,
        username: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to retrieve user" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();

    const { name, designation, department, email, username, role, active } =
      body;

    if (!name || !designation || !department || !email || !username || !role) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /*
     * Protected system accounts cannot be modified.
     */
    if (isProtectedUsername(existingUser.username)) {
      return NextResponse.json(
        {
          error: "This is a protected system account and cannot be modified.",
        },
        { status: 403 },
      );
    }

    /*
     * Prevent other users from being renamed to a protected username.
     */
    if (isProtectedUsername(username)) {
      return NextResponse.json(
        {
          error: "This username is reserved for a protected system account.",
        },
        { status: 403 },
      );
    }

    const duplicateUsername = await prisma.employee.findFirst({
      where: {
        username,
        NOT: {
          id,
        },
      },
    });

    if (duplicateUsername) {
      return NextResponse.json(
        {
          error: "Username is already in use.",
        },
        { status: 409 },
      );
    }

    const duplicateEmail = await prisma.employee.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    });

    if (duplicateEmail) {
      return NextResponse.json(
        {
          error: "Email address is already in use.",
        },
        { status: 409 },
      );
    }

    const updatedUser = await prisma.employee.update({
      where: {
        id,
      },
      data: {
        name,
        designation,
        department,
        email,
        username,
        role,
        active,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        email: true,
        active: true,
        role: true,
        username: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingUser = await prisma.employee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /*
     * Protected system accounts cannot be deleted.
     */
    if (isProtectedUsername(existingUser.username)) {
      return NextResponse.json(
        {
          error: "This is a protected system account and cannot be deleted.",
        },
        { status: 403 },
      );
    }

    await prisma.employee.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
