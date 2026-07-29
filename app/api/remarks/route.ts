import { NextRequest, NextResponse } from "next/server";
import {
  getRemarks,
  getRemarkById,
  getRemarksByTicketId,
  createRemark,
  getNextRemarkId,
} from "@/lib/remarks-service";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const ticketId = searchParams.get("ticketId");
    const remarkId = searchParams.get("remarkId");

    // GET /api/remarks?ticketId=HL-CMU-2026-459669
    if (ticketId) {
      const remarks = await getRemarksByTicketId(ticketId);

      return NextResponse.json(remarks);
    }

    // GET /api/remarks?remarkId=3
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

    // GET /api/remarks
    const remarks = await getRemarks();

    return NextResponse.json(remarks);
  } catch (error) {
    console.error(error);

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
    return Response.json([], { status: 401 });
  }
  const user = JSON.parse(userCookie.value);

  try {
    const body = await request.json();

    const remark = {
      ...body,
      remarkId: await getNextRemarkId(),
      createdDate: new Date().toISOString(),
      updatedBy: user.id,
    };

    const createdRemark = await createRemark(remark);

    return NextResponse.json(createdRemark, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create remark" },
      { status: 500 },
    );
  }
}
