import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-outlook",
  "application/octet-stream",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = await params;

    // =========================================================
    // GET TICKET + AUTHORIZATION
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
        { message: "Ticket not found." },
        { status: 404 },
      );
    }

    /*
     * Action owners may only upload attachments
     * to tickets assigned to themselves.
     */

    if (
      sessionUser.role === "actionOwner" &&
      ticket.assignedToId !== sessionUser.id
    ) {
      return NextResponse.json(
        { message: "Ticket not found." },
        { status: 404 },
      );
    }

    /*
     * Only known authorized roles may upload.
     */

    if (
      sessionUser.role !== "admin" &&
      sessionUser.role !== "dataEntry" &&
      sessionUser.role !== "actionOwner"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // =========================================================
    // FORM DATA
    // =========================================================

    const formData = await request.formData();

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { message: "No files were provided." },
        { status: 400 },
      );
    }

    // =========================================================
    // UPLOAD DIRECTORY
    // =========================================================

    const uploadDirectory = path.join(
      process.cwd(),
      "uploads",
      "tickets",
      ticketId,
    );

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    const attachments = [];

    // =========================================================
    // PROCESS FILES
    // =========================================================

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            message: `File "${file.name}" exceeds the 10 MB limit.`,
          },
          {
            status: 400,
          },
        );
      }

      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            message: `File type "${file.type}" is not allowed.`,
          },
          {
            status: 400,
          },
        );
      }

      const extension = path.extname(file.name);

      const storedName = `${crypto.randomUUID()}${extension}`;

      const filePath = path.join(uploadDirectory, storedName);

      const buffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(filePath, buffer);

      const attachment = await prisma.ticketAttachment.create({
        data: {
          ticketId,
          originalName: file.name,
          storedName,
          filePath: path.relative(process.cwd(), filePath),
          mimeType: file.type,
          fileSize: file.size,
        },
      });

      attachments.push(attachment);
    }

    return NextResponse.json(
      {
        message: "Files uploaded successfully.",
        attachments,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Attachment upload error:", error);

    return NextResponse.json(
      {
        message: "Failed to upload attachments.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: ticketId } = await params;

    // =========================================================
    // GET TICKET + AUTHORIZATION
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
        { message: "Ticket not found." },
        { status: 404 },
      );
    }

    /*
     * Action owners may only view attachments
     * belonging to tickets assigned to themselves.
     */

    if (
      sessionUser.role === "actionOwner" &&
      ticket.assignedToId !== sessionUser.id
    ) {
      return NextResponse.json(
        { message: "Ticket not found." },
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
    // GET ATTACHMENTS
    // =========================================================

    const attachments = await prisma.ticketAttachment.findMany({
      where: {
        ticketId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Attachment retrieval error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve attachments.",
      },
      {
        status: 500,
      },
    );
  }
}
