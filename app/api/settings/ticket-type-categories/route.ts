import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.ticketCategory.findMany({
      orderBy: {
        code: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to load ticket categories:", error);

    return NextResponse.json(
      {
        message: "Failed to load ticket categories.",
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

    const code = String(body.code || "")
      .trim()
      .toUpperCase();

    const label = String(body.label || "").trim();
    const sla = String(body.sla || "").trim();
    const priority = String(body.priority || "").trim();

    if (!code) {
      return NextResponse.json(
        {
          message: "Category code is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!label) {
      return NextResponse.json(
        {
          message: "Category label is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!sla) {
      return NextResponse.json(
        {
          message: "SLA is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!priority) {
      return NextResponse.json(
        {
          message: "Priority is required.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.ticketCategory.findUnique({
      where: {
        code,
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

    const category = await prisma.ticketCategory.create({
      data: {
        code,
        label,
        sla,
        priority,
      },
    });

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create ticket category:", error);

    return NextResponse.json(
      {
        message: "Failed to create ticket category.",
      },
      {
        status: 500,
      },
    );
  }
}
