import { NextRequest, NextResponse } from "next/server";
import {
  getTickets,
  createTicket,
  getTicketsByAssignedTo,
  getTicketOverview,
  getAgingOverview,
} from "@/lib/ticket-service";
import { cookies } from "next/headers";

async function generateTicketId(ticket: any) {
  const now = new Date();

  const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;

  const tickets = await getTickets();

  const latestTicket = tickets
    .filter(
      (t: any) =>
        t.ticketType === ticket.ticketType &&
        t.id?.startsWith(`${ticket.ticketType}-${period}-`),
    )
    .sort((a: any, b: any) => b.id.localeCompare(a.id))[0];

  let sequence = 1;

  if (latestTicket) {
    sequence = Number(latestTicket.id.split("-")[2]) + 1;
  }

  const id = `${ticket.ticketType}-${period}-${String(sequence).padStart(
    6,
    "0",
  )}`;
}

// export async function GET() {

//   const cookieStore = await cookies();

//   const userCookie = cookieStore.get("user");

//   if (!userCookie) {
//     return Response.json([], { status: 401 });
//   }
//   const user = JSON.parse(userCookie.value);
//   try {
//     console.log(user);
//     if (user.role !== "actionOwner") {
//       const tickets = await getTickets();

//       return NextResponse.json(tickets);
//     } else {
//       const tickets = await getTicketsByAssignedTo(user.id);

//       return NextResponse.json(tickets);
//     }

//     return;
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       { message: "Failed to load tickets" },
//       { status: 500 },
//     );
//   }
// }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("overview") === "true") {
    return NextResponse.json(await getTicketOverview());
  }
  if (searchParams.get("aging") === "true") {
    return NextResponse.json(await getAgingOverview());
  }

  const cookieStore = await cookies();

  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    return Response.json([], { status: 401 });
  }

  const user = JSON.parse(userCookie.value);

  try {
    if (user.role !== "actionOwner") {
      return NextResponse.json(await getTickets());
    }

    return NextResponse.json(await getTicketsByAssignedTo(user.id));
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to load tickets" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let emailSent = false;

    const ticket = await request.json();

    const ticketNumber = generateTicketId(ticket);

    const ticketWithId = {
      ...ticket,
      ticketNumber,
    };
    const createdTicket = await createTicket(ticketWithId);
    if (createdTicket && ticket.sendEmail) {
      const emailResponse = await fetch("/api/tickets/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketWithId),
      });

      const emailResult = await emailResponse.json();

      emailSent = emailResult.success;
    }

    return NextResponse.json(
      {
        ticket: createdTicket,
        emailSent,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create ticket" },
      { status: 500 },
    );
  }
}
