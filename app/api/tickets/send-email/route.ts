import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { customerTicketCreatedEmail } from "@/lib/customer-email";
import { actionOwnerTicketCreatedEmail } from "@/lib/action-owner-email";

export async function POST(req: NextRequest) {
  try {
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
      sla,
      property,
    } = await req.json();

    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });

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

    await transporter.verify();

    console.log("From api/tickets/send-mail, SMTP connection successful");

    // Customer email

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: [customerEmail].filter(Boolean), //Protect against undefined values:

      subject: `[Open]_${ticketNumber}_${category}_${scope}`,
      html: customerTicketCreatedEmail({
        customerName,
        ticketNumber,
        title,
        category,
        actionOwnerName,
      }),
    });

    // Action Owner & CC list email

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: [actionOwnerEmail].filter(Boolean), //Protect against undefined values:
      cc: (cctoList || []).filter(Boolean),

      // to: [customerEmail],
      // cc: [...cctoList, actionOwnerEmail],

      subject: `[Open]_${ticketNumber}_${category}_${scope}`,
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
        sla,
      }),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
