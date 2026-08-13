import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const password = body.password;

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "Password must contain at least 8 characters",
        },
        { status: 400 },
      );
    }

    const user = await prisma.employee.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.employee.update({
      where: { id },
      data: {
        password: passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
