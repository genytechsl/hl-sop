import { NextRequest, NextResponse } from "next/server";
import {
  getRemarks,
  getRemarkById,
  getRemarksByTicketId,
  createRemark,
} from "@/lib/remarks-service";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const ticketId = searchParams.get("ticketId");
    const remarkId = searchParams.get("remarkId");

    if (ticketId) {
      const remarks = await getRemarksByTicketId(ticketId);

      return NextResponse.json(remarks);
    }

    if (remarkId) {
      const remark = await getRemarkById(Number(remarkId));

      if (!remark) {
        return NextResponse.json(
          { message: "Remark not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(remark);
    }

    const remarks = await getRemarks();

    return NextResponse.json(remarks);
  } catch (error) {
    console.error("Failed to load remarks:", error);

    return NextResponse.json(
      { message: "Failed to load remarks" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    const body = await request.json();

    if (!body.ticketId) {
      return NextResponse.json(
        { message: "Ticket ID is required" },
        { status: 400 },
      );
    }

    if (!body.remarkType) {
      return NextResponse.json(
        { message: "Remark type is required" },
        { status: 400 },
      );
    }

    const createdRemark = await createRemark({
      ticketId: body.ticketId,
      remarkType: body.remarkType,
      statusChangedTo: body.statusChangedTo ?? null,
      updatedById: user.id,
    });

    return NextResponse.json(createdRemark, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create remark:", error);

    return NextResponse.json(
      { message: "Failed to create remark" },
      { status: 500 },
    );
  }
}
