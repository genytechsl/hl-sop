import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * =====================================================
     * RBAC
     * =====================================================
     *
     * Only administrators can view user details.
     *
     */

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
     * =====================================================
     * GET USER
     * =====================================================
     */

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
    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /*
     * =====================================================
     * RBAC
     * =====================================================
     *
     * Only administrators can update users.
     *
     */

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /*
     * =====================================================
     * GET USER ID
     * =====================================================
     */

    const { id } = await params;

    /*
     * =====================================================
     * REQUEST BODY
     * =====================================================
     */

    const body = await request.json();

    const { name, designation, department, email, username, role, active } =
      body;

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    if (!name || !designation || !department || !email || !username || !role) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    /*
     * =====================================================
     * FIND EXISTING USER
     * =====================================================
     */

    const existingUser = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /*
     * =====================================================
     * UPDATE USER
     * =====================================================
     */

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
