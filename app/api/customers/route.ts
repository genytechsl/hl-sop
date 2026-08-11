import { NextRequest, NextResponse } from "next/server";

import {
  createCustomer,
  generateCustomerId,
  getCustomers,
  searchCustomers,
  updateCustomer,
} from "@/lib/customer-service";

import { Customer } from "@/types/customer";

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search");

    const customers = search
      ? await searchCustomers(search)
      : await getCustomers();

    return NextResponse.json(customers);
  } catch (error) {
    console.error("GET /api/customers error:", error);

    return NextResponse.json(
      {
        message: "Failed to load customers",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newCustomer: Customer = {
      id: await generateCustomerId(),
      name: body.name,
      email: body.email ?? "",
      mobile: body.mobile ?? "",
      NIC: body.NIC,
      active: body.active ?? true,
      receiveEmail: body.receiveEmailNotifications,
      receiveSMS: body.receiveSmsNotifications,
      createdDate: new Date().toISOString().split("T")[0],
      properties: body.properties ?? [],
    };

    const savedCustomer = await createCustomer(newCustomer);

    return NextResponse.json(savedCustomer, {
      status: 201,
    });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to create customer!",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updatedCustomer: Customer = {
      id: body.id,
      name: body.name,
      email: body.email ?? "",
      mobile: body.mobile ?? "",
      NIC: body.NIC,
      active: body.active,
      receiveEmail: body.receiveEmailNotifications,
      receiveSMS: body.receiveSmsNotifications,
      createdDate: body.createdDate,
      properties: body.properties ?? [],
    };

    const customer = await updateCustomer(updatedCustomer);

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error("PUT /api/customers error:", error);

    return NextResponse.json(
      {
        message: error.message || "Failed to update customer",
      },
      {
        status: 500,
      },
    );
  }
}
