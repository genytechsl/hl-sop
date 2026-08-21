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

    const scopeId = Number(id);

    if (!Number.isInteger(scopeId)) {
      return NextResponse.json(
        {
          message: "Invalid scope ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const ticketType = String(body.ticketType || "").trim();
    const scope = String(body.scope || "").trim();

    if (!ticketType || !scope) {
      return NextResponse.json(
        {
          message: "Ticket type and scope are required.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.ticketTypeScope.findFirst({
      where: {
        ticketType,
        scope,
        NOT: {
          id: scopeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "This scope already exists for the selected ticket type.",
        },
        {
          status: 409,
        },
      );
    }

    const updatedScope = await prisma.ticketTypeScope.update({
      where: {
        id: scopeId,
      },
      data: {
        ticketType,
        scope,
      },
    });

    return NextResponse.json(updatedScope);
  } catch (error) {
    console.error("Failed to update ticket type scope:", error);

    return NextResponse.json(
      {
        message: "Failed to update scope.",
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

    const scopeId = Number(id);

    if (!Number.isInteger(scopeId)) {
      return NextResponse.json(
        {
          message: "Invalid scope ID.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.ticketTypeScope.delete({
      where: {
        id: scopeId,
      },
    });

    return NextResponse.json({
      message: "Scope deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete ticket type scope:", error);

    return NextResponse.json(
      {
        message: "Failed to delete scope.",
      },
      {
        status: 500,
      },
    );
  }
}
