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
} from "@/lib/ticket-service";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.get("overview") === "true") {
      return NextResponse.json(await getTicketOverview());
    }

    if (searchParams.get("aging") === "true") {
      return NextResponse.json(await getAgingOverview());
    }

    if (searchParams.get("volume") === "true") {
      return NextResponse.json(await getTicketVolume());
    }

    if (searchParams.get("ownerWorkload") === "true") {
      return NextResponse.json(await getActionOwnerWorkload());
    }

    if (searchParams.get("categoryVolume") === "true") {
      return NextResponse.json(await getCategoryVolume());
    }

    const ticketId = searchParams.get("id");

    if (ticketId) {
      const ticket = await getTicketById(ticketId);

      if (!ticket) {
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(ticket);
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json([], {
        status: 401,
      });
    }

    const user = JSON.parse(userCookie.value);

    if (user.role !== "actionOwner") {
      return NextResponse.json(await getTickets());
    }

    return NextResponse.json(await getTicketsByAssignedTo(user.id));
  } catch (error) {
    console.error("GET /api/tickets error:", error);

    return NextResponse.json(
      {
        message: "Failed to load tickets",
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

    if (!body.customerName) {
      return NextResponse.json(
        {
          message: "Customer is required",
        },
        { status: 400 },
      );
    }

    if (!body.property?.propertyName) {
      return NextResponse.json(
        {
          message: "Property is required",
        },
        { status: 400 },
      );
    }

    /*
     * Find the customer from the existing
     * frontend payload.
     */
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
        {
          message: "Customer not found",
        },
        { status: 404 },
      );
    }

    /*
     * Find the selected property belonging
     * to that customer.
     */
    const property = customer.properties.find(
      (item) =>
        item.propertyName === body.property.propertyName &&
        item.address === body.property.address,
    );

    if (!property) {
      return NextResponse.json(
        {
          message: "Customer property not found",
        },
        { status: 404 },
      );
    }

    /*
     * Validate action owner if supplied.
     */
    if (body.assignedToId) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: body.assignedToId,
        },
      });

      if (!employee) {
        return NextResponse.json(
          {
            message: "Action owner not found",
          },
          { status: 404 },
        );
      }
    }

    const id = await generateTicketId(body);

    const ticket = {
      id,
      title: body.title,
      description: body.description,
      ticketType: body.ticketType,
      category: body.category,
      categoryLabel: body.categoryLabel,
      status: body.status || "OPEN",
      priority: body.priority,
      customerId: customer.id,
      propertyId: property.id,
      assignedToId: body.assignedToId || undefined,
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
            id,
          }),
        },
      );

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json();
        emailSent = emailResult.success;
      }
    }

    return NextResponse.json(
      {
        ticket: createdTicket,
        emailSent,
        ticketId: id,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/tickets error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create ticket",
      },
      {
        status: 500,
      },
    );
  }
}
