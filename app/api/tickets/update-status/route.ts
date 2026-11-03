import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendEmail } from "@/lib/mailer";

import { updateTicketStatus } from "@/lib/ticket-service";
import { customerTicketResolvedEmail } from "@/lib/customer-email";
import { TICKET_ROLES, authorizeRoles } from "@/app/api/_rbac";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const auth = await authorizeRoles(TICKET_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const sessionUser = auth.user;

    // =========================================================
    // REQUEST BODY
    // =========================================================

    const body = await request.json();

    const { ticketId, status, customerEmail, customerName, remark } = body;
    if (!["OPEN", "IN_PROGRESS", "BEING_PROCESSED", "RESOLVED", "CLOSED", "RETURN"].includes(status) || typeof remark !== "string" || !remark.trim()) {
      return NextResponse.json({message: "A valid status and remarks are required."}, {status: 400});
    }

    if (!ticketId || !status) {
      return NextResponse.json(
        {
          message: "Ticket ID and status are required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // GET TICKET FOR AUTHORIZATION
    // =========================================================

    const existingTicket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
      select: {
        id: true,
        assignedToId: true,
        status: true,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          message: "Ticket not found",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // RBAC / OWNERSHIP CHECK
    // =========================================================

    /*
     * Admin:
     *   Can update any ticket.
     *
     * Data Entry:
     *   Can update any ticket.
     *
     * Action Owner:
     *   Can update ONLY tickets assigned to themselves.
     */

    if (
      sessionUser.role === "actionOwner" &&
      existingTicket.assignedToId !== sessionUser.id
    ) {
      return NextResponse.json(
        {
          message: "Ticket not found",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Reject any unknown role.
     */


    // =========================================================
    // UPDATE TICKET STATUS
    // =========================================================

    const ticket = await updateTicketStatus(ticketId, status, { text: remark.trim(), updatedById: sessionUser.id });

    if (!ticket) {
      return NextResponse.json(
        {
          message: "Ticket not found",
        },
        {
          status: 404,
        },
      );
    }

    let notificationWarning: string | undefined;
    if (status === "RETURN" && existingTicket.status !== "RETURN") {
      try {
        await sendEmail({
          to: "cmu@homelandsskyline.lk",
          subject: `[Returned] ${ticketId}`,
          html: `<p>A ticket has been returned and requires administrator review and reassignment.</p><p>Ticket: ${String(ticketId).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]!)}</p>`,
        });
      } catch (error) {
        console.error("Returned-ticket notification failed:", error);
        notificationWarning = "Ticket updated, but the CMU notification could not be sent. Please notify CMU manually.";
      }
    }

    // =========================================================
    // CUSTOMER EMAIL WHEN CLOSED
    // =========================================================

    if (status === "CLOSED" && customerEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: customerEmail,
        subject: `[Closed]_${ticketId}`,
        html: customerTicketResolvedEmail({
          customerName,
          ticketNumber: ticketId,
        }),
      });
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({ ...ticket, notificationWarning });
  } catch (error) {
    console.error("POST ticket status error:", error);

    return NextResponse.json(
      {
        message: "Failed to update ticket",
      },
      {
        status: 500,
      },
    );
  }
}
