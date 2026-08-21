import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          message: "Invalid category ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    const label = String(body.label || "").trim();
    const sla = String(body.sla || "").trim();
    const priority = String(body.priority || "").trim();

    if (!code || !label || !sla || !priority) {
      return NextResponse.json(
        {
          message: "Code, label, SLA and priority are all required.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.ticketCategory.findFirst({
      where: {
        code,
        NOT: {
          id: categoryId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: `Category code "${code}" already exists.`,
        },
        {
          status: 409,
        },
      );
    }

    const category = await prisma.ticketCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        code,
        label,
        sla,
        priority,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to update ticket category:", error);

    return NextResponse.json(
      {
        message: "Failed to update ticket category.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId)) {
      return NextResponse.json(
        {
          message: "Invalid category ID.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.ticketCategory.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete ticket category:", error);

    return NextResponse.json(
      {
        message: "Failed to delete ticket category.",
      },
      {
        status: 500,
      },
    );
  }
}
