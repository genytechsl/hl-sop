import { NextRequest, NextResponse } from "next/server";

import {
  createCustomer,
  generateCustomerId,
  getCustomers,
  searchCustomers,
  updateCustomer,
} from "@/lib/customer-service";

import { Customer } from "@/types/customer";

/**
 * Converts:
 *
 * ["a", "b"]
 * "a,b"
 * "a;b"
 * "a\nb"
 *
 * into a clean unique string array.
 */
function normalizeStringArray(value: unknown): string[] {
  let values: string[] = [];

  if (Array.isArray(value)) {
    values = value.map((item) => String(item));
  } else if (typeof value === "string") {
    values = value.split(/[,;\n]+/);
  }

  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function normalizeOtherEmails(value: unknown, primaryEmail: string): string[] {
  const primary = primaryEmail.trim().toLowerCase();

  const values = normalizeStringArray(value);

  const seen = new Set<string>();

  return values.filter((email) => {
    const normalized = email.toLowerCase();

    if (!normalized) {
      return false;
    }

    // Do not store primary email again in otherEmails.
    if (normalized === primary) {
      return false;
    }

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}

function normalizeOtherMobiles(
  value: unknown,
  primaryMobile: string,
): string[] {
  const primary = primaryMobile.trim();

  const values = normalizeStringArray(value);

  return values.filter((mobile) => {
    // Do not store primary mobile again in otherMobiles.
    return mobile !== primary;
  });
}

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

    const email = body.email?.trim() ?? "";
    const mobile = body.mobile?.trim() ?? "";

    const newCustomer: Customer = {
      id: await generateCustomerId(),

      name: body.name,

      email,

      otherEmails: normalizeOtherEmails(body.otherEmails, email),

      mobile,

      otherMobiles: normalizeOtherMobiles(body.otherMobiles, mobile),

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

    const email = body.email?.trim() ?? "";
    const mobile = body.mobile?.trim() ?? "";

    const updatedCustomer: Customer = {
      id: body.id,

      name: body.name,

      email,

      otherEmails: normalizeOtherEmails(body.otherEmails, email),

      mobile,

      otherMobiles: normalizeOtherMobiles(body.otherMobiles, mobile),

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
