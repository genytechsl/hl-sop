import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const { id: ticketId, attachmentId } = await params;

    const attachment = await prisma.ticketAttachment.findFirst({
      where: {
        id: attachmentId,
        ticketId,
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

    const absolutePath = path.join(process.cwd(), attachment.filePath);

    const file = await fs.readFile(absolutePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          attachment.originalName,
        )}"`,
        "Content-Length": attachment.fileSize.toString(),
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
