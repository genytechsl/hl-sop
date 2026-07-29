import customers from "@/data/customers.json";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);

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
}
