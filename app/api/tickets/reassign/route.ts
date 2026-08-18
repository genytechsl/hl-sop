import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    if (!["admin", "cmuManager"].includes(user.role)) {
      return NextResponse.json(
        {
          message: "You are not authorized to reassign tickets.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { ticketId, assignedToId } = body;

    if (!ticketId || !assignedToId) {
      return NextResponse.json(
        {
          message: "Ticket ID and employee ID are required.",
        },
        { status: 400 },
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: assignedToId,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          message: "Employee not found.",
        },
        { status: 404 },
      );
    }

    if (!employee.active) {
      return NextResponse.json(
        {
          message: "Cannot assign a ticket to an inactive employee.",
        },
        { status: 400 },
      );
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          message: "Ticket not found.",
        },
        { status: 404 },
      );
    }

    const ticket = await prisma.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        assignedTo: {
          connect: {
            id: employee.id,
          },
        },
      },
      include: {
        assignedTo: true,
      },
    });

    return NextResponse.json({
      message: "Ticket reassigned successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Reassign ticket error:", error);

    return NextResponse.json(
      {
        message: "Failed to reassign ticket.",
      },
      {
        status: 500,
      },
    );
  }
}
