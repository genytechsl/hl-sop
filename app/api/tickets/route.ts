import { NextRequest, NextResponse } from "next/server";

import {
  getTickets,
  createTicket,
  getTicketsByAssignedTo,
  getTicketOverview,
  getAgingOverview,
  getTicketById,
  getTicketVolume,
  getActionOwnerWorkload,
  getCategoryVolume,
  getTicketsByCustomerId,
  getTicketByIdForUser,
} from "@/lib/ticket-service";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function generateTicketId(ticket: any) {
  const now = new Date();

  const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;

  const latestTicket = await prisma.ticket.findFirst({
    where: {
      ticketType: ticket.ticketType,
      id: {
        startsWith: `${ticket.ticketType}-${period}-`,
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  let sequence = 1;

  if (latestTicket) {
    sequence = Number(latestTicket.id.split("-")[2]) + 1;
  }

  return `${ticket.ticketType}-${period}-${String(sequence).padStart(6, "0")}`;
}

/* =========================================================
   GET TICKETS
========================================================= */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const user = await getSession();

    console.log("GET /api/tickets session:", {
      id: user?.id,
      role: user?.role,
      name: user?.name,
    });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = user.role === "admin";
    const isDataEntry = user.role === "dataEntry";
    const isActionOwner = user.role === "actionOwner";

    // =====================================================
    // DASHBOARD OVERVIEW
    // Admin + Data Entry ONLY
    // =====================================================

    if (searchParams.get("overview") === "true") {
      if (!isAdmin && !isDataEntry) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(await getTicketOverview());
    }

    // =====================================================
    // AGING
    // Admin + Data Entry ONLY
    // =====================================================

    if (searchParams.get("aging") === "true") {
      if (!isAdmin && !isDataEntry) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(await getAgingOverview());
    }

    // =====================================================
    // VOLUME
    // Admin + Data Entry ONLY
    // =====================================================

    if (searchParams.get("volume") === "true") {
      if (!isAdmin && !isDataEntry) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(await getTicketVolume());
    }

    // =====================================================
    // ACTION OWNER WORKLOAD
    // Admin + Data Entry ONLY
    // =====================================================

    if (searchParams.get("ownerWorkload") === "true") {
      if (!isAdmin && !isDataEntry) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(await getActionOwnerWorkload());
    }

    // =====================================================
    // CATEGORY VOLUME
    // Admin + Data Entry ONLY
    // =====================================================

    if (searchParams.get("categoryVolume") === "true") {
      if (!isAdmin && !isDataEntry) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json(await getCategoryVolume());
    }

    // =====================================================
    // SINGLE TICKET
    // =====================================================

    const ticketId = searchParams.get("id");

    if (ticketId) {
      const ticket = await getTicketById(ticketId);

      if (!ticket) {
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 },
        );
      }

      /*
       * ACTION OWNER SECURITY
       *
       * An action owner may ONLY view a ticket assigned
       * to their own employee ID.
       *
       * This check happens on the server, so changing the
       * ticket ID in the browser/API request will not bypass it.
       */

      if (isActionOwner && ticket.assignedToId !== user.id) {
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(ticket);
    }

    // =====================================================
    // CUSTOMER TICKETS
    // =====================================================

    const customerId = searchParams.get("customerId");

    if (customerId) {
      /*
       * ADMIN / DATA ENTRY
       *
       * Can see every ticket belonging to the customer.
       */

      if (isAdmin || isDataEntry) {
        return NextResponse.json(await getTicketsByCustomerId(customerId));
      }

      /*
       * ACTION OWNER
       *
       * IMPORTANT:
       * Do NOT call getTicketsByCustomerId() here because
       * that function returns every ticket belonging to
       * the customer.
       *
       * Instead, first retrieve ONLY this action owner's
       * tickets, then filter by customer.
       */

      if (isActionOwner) {
        const assignedTickets = await getTicketsByAssignedTo(user.id);

        const customerTickets = assignedTickets.filter(
          (ticket) => ticket.customerId === customerId,
        );

        return NextResponse.json(customerTickets);
      }
    }

    // =====================================================
    // NORMAL TICKET LIST
    // =====================================================

    /*
     * ACTION OWNER
     *
     * The database query itself is restricted to:
     *
     * assignedToId = logged-in user's ID
     *
     * Therefore an action owner cannot receive another
     * employee's tickets through this endpoint.
     */

    if (isActionOwner) {
      const tickets = await getTicketsByAssignedTo(user.id);

      return NextResponse.json(tickets);
    }

    // =====================================================
    // ADMIN / DATA ENTRY
    // =====================================================

    return NextResponse.json(await getTickets());
  } catch (error) {
    console.error("GET /api/tickets error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown ticket API error";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   CREATE TICKET
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role !== "admin" &&
      user.role !== "dataEntry" &&
      user.role !== "actionOwner"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const isActionOwner = user.role === "actionOwner";

    if (!body.customerName) {
      return NextResponse.json(
        { message: "Customer is required" },
        { status: 400 },
      );
    }

    if (!body.property?.propertyName) {
      return NextResponse.json(
        { message: "Property is required" },
        { status: 400 },
      );
    }

    if (!body.ticketType) {
      return NextResponse.json(
        { message: "Ticket type is required" },
        { status: 400 },
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { message: "Category is required" },
        { status: 400 },
      );
    }

    if (!body.scope) {
      return NextResponse.json(
        { message: "Scope is required" },
        { status: 400 },
      );
    }

    if (!body.title?.trim()) {
      return NextResponse.json(
        { message: "Ticket title is required" },
        { status: 400 },
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        name: body.customerName,
      },
      include: {
        properties: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 },
      );
    }

    const property = customer.properties.find(
      (item) =>
        item.propertyName === body.property.propertyName &&
        item.address === body.property.address,
    );

    if (!property) {
      return NextResponse.json(
        { message: "Customer property not found" },
        { status: 404 },
      );
    }

    let assignedToId: string | undefined = body.assignedToId || undefined;

    if (isActionOwner) {
      assignedToId = user.id;
    }

    if (!assignedToId) {
      return NextResponse.json(
        { message: "Action owner is required" },
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
        { message: "Action owner not found" },
        { status: 404 },
      );
    }

    if (employee.role !== "actionOwner" && employee.role !== "admin") {
      return NextResponse.json(
        { message: "Selected employee is not a valid action owner" },
        { status: 400 },
      );
    }

    if (!employee.active) {
      return NextResponse.json(
        { message: "Selected action owner is inactive" },
        { status: 400 },
      );
    }

    if (isActionOwner) {
      const categoryRoleMap: Record<string, string[]> = {
        "CAT-A": ["MEP Engineer"],
        "CAT-B": ["MEP Engineer", "Contractor"],
        "CAT-B2": ["SFM Department"],
        "CAT-C": ["CMU Manager"],
        "CAT-D": ["Operations Executive"],
      };

      const allowedDesignations = categoryRoleMap[body.category] ?? [];

      if (!allowedDesignations.includes(employee.designation)) {
        return NextResponse.json(
          {
            message:
              "You are not authorized to create tickets under this category.",
          },
          { status: 403 },
        );
      }
    }

    const id = await generateTicketId(body);

    const ticket = {
      id,
      title: body.title.trim(),
      description: body.description,
      ticketType: body.ticketType,
      category: body.category,
      categoryLabel: body.categoryLabel,
      status: body.status || "OPEN",
      priority: body.priority,
      customerId: customer.id,
      propertyId: property.id,
      assignedToId,
      slaTarget: body.slaTarget,
      complaintSource: body.complaintSource,
      scope: body.scope,
      cctoList: body.cctoList ?? [],
      sendEmail: body.sendEmail ?? false,
      createdAt: body.createdAt,
    };

    const createdTicket = await createTicket(ticket);

    let emailSent = false;

    if (body.sendEmail) {
      const emailResponse = await fetch(
        `${request.nextUrl.origin}/api/tickets/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...body,
            ...createdTicket,
            assignedToId,
            actionOwnerEmail: employee.email,
            actionOwnerName: employee.name,
            id,
          }),
        },
      );

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();
        emailSent = emailResult.success;
      } else {
        console.error(
          "Ticket created but email notification failed:",
          await emailResponse.text(),
        );
      }
    }

    return NextResponse.json(
      {
        ticket: createdTicket,
        emailSent,
        ticketId: id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/tickets error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create ticket",
      },
      { status: 500 },
    );
  }
}
