import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

import { updateTicketStatus } from "@/lib/ticket-service";
import { createRemark } from "@/lib/remarks-service";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const userCookie = cookieStore.get("user");

    if (!userCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);

    const body = await request.json();

    const { ticketId, status, remark } = body;

    const ticket = await updateTicketStatus(ticketId, status);

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    // await createRemark({
    //   ticketId,
    //   remarkType: remark,
    //   statusChangedTo: status,
    //   updatedBy: user.id,
    // });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update ticket" },
      { status: 500 },
    );
  }
}
