import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      attachmentId: string;
    }>;
  },
) {
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

    const { id: ticketId, attachmentId } = await params;

    // =========================================================
    // TICKET ACCESS CHECK
    // =========================================================

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
        {
          message: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // Action owners can only access attachments
    // belonging to tickets assigned to them.
    if (
      sessionUser.role === "actionOwner" &&
      ticket.assignedToId !== sessionUser.id
    ) {
      return NextResponse.json(
        {
          message: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // Only approved system roles may access attachments.
    if (
      sessionUser.role !== "admin" &&
      sessionUser.role !== "dataEntry" &&
      sessionUser.role !== "actionOwner"
    ) {
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
    // FIND ATTACHMENT
    // =========================================================

    const attachment = await prisma.ticketAttachment.findFirst({
      where: {
        id: attachmentId,
        ticketId,
      },
      select: {
        id: true,
        originalName: true,
        storedName: true,
        mimeType: true,
        fileSize: true,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        {
          message: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // RESOLVE FILE PATH
    // =========================================================

    const uploadDirectory = path.resolve(
      process.cwd(),
      "uploads",
      "tickets",
      ticketId,
    );

    const absolutePath = path.resolve(uploadDirectory, attachment.storedName);

    // Prevent a stored filename from resolving outside
    // the expected ticket upload directory.
    if (!absolutePath.startsWith(`${uploadDirectory}${path.sep}`)) {
      return NextResponse.json(
        {
          message: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // READ FILE
    // =========================================================

    let fileBuffer;

    try {
      fileBuffer = await fs.readFile(absolutePath);
    } catch {
      return NextResponse.json(
        {
          message: "Attachment not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================================
    // PREPARE RESPONSE
    // =========================================================

    const safeFileName = attachment.originalName.replace(/[\r\n"]/g, "_");

    /*
     * fs.readFile() returns a Node.js Buffer.
     * NextResponse expects a Web-compatible BodyInit.
     * Uint8Array avoids the Buffer<ArrayBufferLike> TS error.
     */
    const fileBody = new Uint8Array(fileBuffer);

    // =========================================================
    // RETURN FILE
    // =========================================================

    return new NextResponse(fileBody, {
      status: 200,
      headers: {
        "Content-Type": attachment.mimeType || "application/octet-stream",

        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
          safeFileName,
        )}`,

        "Content-Length": fileBuffer.length.toString(),

        "X-Content-Type-Options": "nosniff",

        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Attachment download error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve attachment.",
      },
      {
        status: 500,
      },
    );
  }
}
