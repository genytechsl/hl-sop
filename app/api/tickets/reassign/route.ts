import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =========================================================
    // AUTHORIZATION
    // =========================================================

    /*
     * Ticket reassignment changes ownership of a case.
     * Restrict this operation to administrators only.
     */

    if (sessionUser.role !== "admin" && sessionUser.role !== "dataEntry") {
      return NextResponse.json(
        {
          message: "You are not authorized to reassign tickets.",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================================
    // REQUEST BODY
    // =========================================================

    const body = await request.json();

    const { ticketId, assignedToId } = body;

    if (!ticketId || !assignedToId) {
      return NextResponse.json(
        {
          message: "Ticket ID and employee ID are required.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // VERIFY TICKET
    // =========================================================

    const existingTicket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        assignedToId: true,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          message: "Ticket not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // VERIFY ASSIGNEE
    // =========================================================

    const employee = await prisma.employee.findUnique({
      where: {
        id: assignedToId,
      },
      select: {
        id: true,
        name: true,
        designation: true,
        department: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          message: "Employee not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (!employee.active) {
      return NextResponse.json(
        {
          message: "Cannot assign a ticket to an inactive employee.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // ASSIGNEE ROLE VALIDATION
    // =========================================================

    /*
     * Tickets should only be assigned to employees who are
     * allowed to act as ticket owners.
     */

    if (employee.role !== "actionOwner" && employee.role !== "admin") {
      return NextResponse.json(
        {
          message:
            "Tickets can only be assigned to an Action Owner or Administrator.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // PREVENT UNNECESSARY REASSIGNMENT
    // =========================================================

    if (existingTicket.assignedToId === employee.id) {
      return NextResponse.json(
        {
          message: "Ticket is already assigned to this employee.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // REASSIGN TICKET
    // =========================================================

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
        assignedTo: {
          select: {
            id: true,
            name: true,
            designation: true,
            department: true,
            email: true,
            role: true,
            active: true,
          },
        },
      },
    });

    // =========================================================
    // RESPONSE
    // =========================================================

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
