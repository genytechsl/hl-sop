import { NextRequest, NextResponse } from "next/server";

import {
  getRemarks,
  getRemarkById,
  getRemarksByTicketId,
  createRemark,
} from "@/lib/remarks-service";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // =========================================================
    // QUERY PARAMETERS
    // =========================================================

    const { searchParams } = new URL(request.url);

    const ticketId = searchParams.get("ticketId");
    const remarkId = searchParams.get("remarkId");

    // =========================================================
    // GET REMARKS BY TICKET
    // =========================================================

    if (ticketId) {
      const ticket = await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
        select: {
          id: true,
          assignedToId: true,
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 },
        );
      }

      if (
        sessionUser.role === "actionOwner" &&
        ticket.assignedToId !== sessionUser.id
      ) {
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 },
        );
      }

      const remarks = await getRemarksByTicketId(ticketId);

      return NextResponse.json(remarks);
    }

    // =========================================================
    // GET REMARK BY ID
    // =========================================================

    if (remarkId) {
      const remark = await getRemarkById(Number(remarkId));

      if (!remark) {
        return NextResponse.json(
          { message: "Remark not found" },
          { status: 404 },
        );
      }

      /*
       * Action Owners may only view remarks belonging
       * to tickets assigned to themselves.
       */

      if (sessionUser.role === "actionOwner") {
        const ticket = await prisma.ticket.findUnique({
          where: {
            id: remark.ticketId,
          },
          select: {
            id: true,
            assignedToId: true,
          },
        });

        if (!ticket || ticket.assignedToId !== sessionUser.id) {
          return NextResponse.json(
            { message: "Remark not found" },
            { status: 404 },
          );
        }
      }

      return NextResponse.json(remark);
    }

    // =========================================================
    // GET ALL REMARKS
    // Admin + Data Entry only
    // =========================================================

    if (sessionUser.role !== "admin" && sessionUser.role !== "dataEntry") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const remarks = await getRemarks();

    return NextResponse.json(remarks);
  } catch (error) {
    console.error("Failed to load remarks:", error);

    return NextResponse.json(
      { message: "Failed to load remarks" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // =========================================================
    // REQUEST BODY
    // =========================================================

    const body = await request.json();

    if (!body.ticketId) {
      return NextResponse.json(
        { message: "Ticket ID is required" },
        { status: 400 },
      );
    }

    if (!body.remarkType) {
      return NextResponse.json(
        { message: "Remark type is required" },
        { status: 400 },
      );
    }

    // =========================================================
    // TICKET OWNERSHIP / RBAC
    // =========================================================

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: body.ticketId,
      },
      select: {
        id: true,
        assignedToId: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    if (
      sessionUser.role === "actionOwner" &&
      ticket.assignedToId !== sessionUser.id
    ) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    if (
      sessionUser.role !== "admin" &&
      sessionUser.role !== "dataEntry" &&
      sessionUser.role !== "actionOwner"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // =========================================================
    // CREATE REMARK
    // =========================================================

    const createdRemark = await createRemark({
      ticketId: body.ticketId,
      remarkType: body.remarkType,
      statusChangedTo: body.statusChangedTo ?? null,

      /*
       * IMPORTANT:
       * Never trust updatedById from the browser.
       * Always derive it from the authenticated session.
       */
      updatedById: sessionUser.id,
    });

    return NextResponse.json(createdRemark, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create remark:", error);

    return NextResponse.json(
      { message: "Failed to create remark" },
      { status: 500 },
    );
  }
}
