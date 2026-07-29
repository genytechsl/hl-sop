import { NextResponse } from "next/server";
import customers from "@/data/customers.json";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
    };
  },
) {
  const customer = customers.find((item) => item.id === params.id);

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
