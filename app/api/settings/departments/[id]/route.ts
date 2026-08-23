import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const departmentId = Number(id);

    if (!Number.isInteger(departmentId)) {
      return NextResponse.json(
        {
          message: "Invalid department ID.",
        },
        {
          status: 400,
        },
      );
    }

    const department = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      return NextResponse.json(
        {
          message: "Department not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Failed to load department:", error);

    return NextResponse.json(
      {
        message: "Failed to load department.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const departmentId = Number(id);

    if (!Number.isInteger(departmentId)) {
      return NextResponse.json(
        {
          message: "Invalid department ID.",
        },
        {
          status: 400,
        },
      );
    }

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
        id: departmentId,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        {
          message: "Department not found.",
        },
        {
          status: 404,
        },
      );
    }

    const duplicateDepartment = await prisma.department.findFirst({
      where: {
        name,
        NOT: {
          id: departmentId,
        },
      },
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        {
          message: "Another department with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const department = await prisma.department.update({
      where: {
        id: departmentId,
      },
      data: {
        name,
        head,
        email,
        description: description || null,
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Failed to update department:", error);

    return NextResponse.json(
      {
        message: "Failed to update department.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const departmentId = Number(id);

    if (!Number.isInteger(departmentId)) {
      return NextResponse.json(
        {
          message: "Invalid department ID.",
        },
        {
          status: 400,
        },
      );
    }

    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        {
          message: "Department not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.department.delete({
      where: {
        id: departmentId,
      },
    });

    return NextResponse.json({
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete department:", error);

    return NextResponse.json(
      {
        message: "Failed to delete department.",
      },
      {
        status: 500,
      },
    );
  }
}
