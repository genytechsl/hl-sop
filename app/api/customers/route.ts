import { NextRequest, NextResponse } from "next/server";

import {
  createCustomer,
  generateCustomerId,
  getCustomers,
  searchCustomers,
} from "@/lib/customer-service";

import { Customer } from "@/types/customer";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");

  if (!search) {
    const customers = await getCustomers();

    return NextResponse.json(customers);
  }

  const customers = await searchCustomers(search);

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newCustomer: Customer = {
    id: await generateCustomerId(),

    name: body.name,

    email: body.email ?? [],

    mobile: body.mobile ?? [],

    NIC: body.NIC,

    active: body.active ?? true,

    createdDate: new Date().toISOString().split("T")[0],

    properties: body.properties ?? [],
  };

  const savedCustomer = await createCustomer(newCustomer);

  return NextResponse.json(savedCustomer, {
    status: 201,
  });
}
