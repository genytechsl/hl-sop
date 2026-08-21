import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const ticketType = searchParams.get("ticketType");

    const scopes = await prisma.ticketTypeScope.findMany({
      where: ticketType
        ? {
            ticketType,
          }
        : undefined,
      orderBy: [
        {
          ticketType: "asc",
        },
        {
          scope: "asc",
        },
      ],
    });

    return NextResponse.json(scopes);
  } catch (error) {
    console.error("Failed to load ticket type scopes:", error);

    return NextResponse.json(
      {
        message: "Failed to load ticket type scopes.",
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

    const ticketType = String(body.ticketType || "").trim();
    const scope = String(body.scope || "").trim();

    if (!ticketType) {
      return NextResponse.json(
        {
          message: "Ticket type is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!scope) {
      return NextResponse.json(
        {
          message: "Scope is required.",
        },
        {
          status: 400,
        },
      );
    }

    const existing = await prisma.ticketTypeScope.findUnique({
      where: {
        ticketType_scope: {
          ticketType,
          scope,
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

    const newScope = await prisma.ticketTypeScope.create({
      data: {
        ticketType,
        scope,
      },
    });

    return NextResponse.json(newScope, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create ticket type scope:", error);

    return NextResponse.json(
      {
        message: "Failed to create scope.",
      },
      {
        status: 500,
      },
    );
  }
}
