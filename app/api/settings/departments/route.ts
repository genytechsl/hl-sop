import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Failed to load departments:", error);

    return NextResponse.json(
      {
        message: "Failed to load departments.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const head = String(body.head || "").trim();
    const email = String(body.email || "").trim();
    const description = String(body.description || "").trim();

    if (!name) {
      return NextResponse.json(
        {
          message: "Department name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!head) {
      return NextResponse.json(
        {
          message: "Department head is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          message: "Department email is required.",
        },
        {
          status: 400,
        },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Please provide a valid email address.",
        },
        {
          status: 400,
        },
      );
    }

    const existingDepartment = await prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        {
          message: "A department with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        head,
        email,
        description: description || null,
      },
    });

    return NextResponse.json(department, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create department:", error);

    return NextResponse.json(
      {
        message: "Failed to create department.",
      },
      {
        status: 500,
      },
    );
  }
}
