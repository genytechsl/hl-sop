import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const { id: ticketId } = await params;

    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          message: "Ticket not found.",
        },
        {
          status: 404,
        },
      );
    }

    const formData = await request.formData();

    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        {
          message: "No files were provided.",
        },
        {
          status: 400,
        },
      );
    }

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
    const { id: ticketId } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          message: "Ticket not found.",
        },
        {
          status: 404,
        },
      );
    }

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
