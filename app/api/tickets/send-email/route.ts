import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { customerTicketCreatedEmail } from "@/lib/customer-email";
import { actionOwnerTicketCreatedEmail } from "@/lib/action-owner-email";
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
     * Ticket creation emails should only be triggered by users
     * who are authorized to create/manage tickets.
     */

    if (sessionUser.role !== "admin" && sessionUser.role !== "dataEntry") {
      return NextResponse.json(
        {
          message: "Forbidden",
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

    const {
      customerEmail,
      customerName,
      ticketNumber,
      title,
      description,
      complaintSource,
      category,
      actionOwnerEmail,
      cctoList,
      actionOwnerName,
      scope,
      slaTarget,
      property,
    } = body;

    // =========================================================
    // VALIDATION
    // =========================================================

    if (!ticketNumber || !title || !category || !scope) {
      return NextResponse.json(
        {
          message: "Required ticket information is missing.",
        },
        {
          status: 400,
        },
      );
    }

    if (!customerEmail && !actionOwnerEmail) {
      return NextResponse.json(
        {
          message: "No email recipients were provided.",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================================
    // SMTP CONFIGURATION
    // =========================================================

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !smtpFrom) {
      console.error("SMTP configuration is incomplete.");

      return NextResponse.json(
        {
          message: "Email service is not configured correctly.",
        },
        {
          status: 500,
        },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: false,
      requireTLS: true,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // =========================================================
    // VERIFY SMTP CONNECTION
    // =========================================================

    await transporter.verify();

    const subject = `[Open]_${ticketNumber}_${category}_${scope}`;

    // =========================================================
    // CUSTOMER EMAIL
    // =========================================================

    if (customerEmail) {
      await transporter.sendMail({
        from: smtpFrom,
        to: customerEmail,
        subject,
        html: customerTicketCreatedEmail({
          customerName,
          ticketNumber,
          title,
          category,
          actionOwnerName,
        }),
      });
    }

    // =========================================================
    // ACTION OWNER + CC EMAIL
    // =========================================================

    if (actionOwnerEmail) {
      const ccRecipients = Array.isArray(cctoList)
        ? cctoList.filter(
            (email): email is string =>
              typeof email === "string" && email.trim().length > 0,
          )
        : [];

      await transporter.sendMail({
        from: smtpFrom,
        to: actionOwnerEmail,
        cc: ccRecipients,
        subject,
        html: actionOwnerTicketCreatedEmail({
          customerName,
          ticketNumber,
          category,
          title,
          actionOwnerName,
          property,
          description,
          complaintSource,
          scope,
          slaTarget,
        }),
      });
    }

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json({
      success: true,
      message: "Ticket emails sent successfully.",
    });
  } catch (error) {
    console.error("Ticket email error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send ticket emails.",
      },
      {
        status: 500,
      },
    );
  }
}
