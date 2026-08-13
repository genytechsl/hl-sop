import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const user = await prisma.employee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        designation: true,
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
    console.error(error);

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
    const { id } = await params;

    const body = await request.json();

    const { name, designation, email, username, role, active } = body;

    if (!name || !designation || !email || !username || !role) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.employee.update({
      where: { id },
      data: {
        name,
        designation,
        email,
        username,
        role,
        active,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        active: true,
        role: true,
        username: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
