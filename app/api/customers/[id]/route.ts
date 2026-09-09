import { NextRequest, NextResponse } from "next/server";

import { getCustomerById } from "@/lib/customer-service";
import { TICKET_ROLES, authorizeRoles } from "@/app/api/_rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authorizeRoles(TICKET_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await params;

    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        {
          message: "Customer not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);

    return NextResponse.json(
      {
        message: "Failed to load customer",
      },
      {
        status: 500,
      },
    );
  }
}
