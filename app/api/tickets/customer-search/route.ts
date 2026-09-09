import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TICKET_ROLES, authorizeRoles } from "@/app/api/_rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(TICKET_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";

    /*
     * Prevent an empty request from returning the whole customer DB.
     */
    if (search.length < 2) {
      return NextResponse.json([]);
    }

    const customers = await prisma.customer.findMany({
      where: {
        active: true,

        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            nic: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            mobile: {
              contains: search,
            },
          },
        ],
      },

      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        nic: true,

        properties: {
          select: {
            id: true,
            propertyName: true,
            address: true,
          },
          orderBy: {
            propertyName: "asc",
          },
        },
      },

      /*
       * Don't allow broad enumeration.
       */
      take: 20,

      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        NIC: customer.nic,
        properties: customer.properties,
      })),
    );
  } catch (error) {
    console.error("GET /api/tickets/customer-search error:", error);

    return NextResponse.json(
      {
        message: "Failed to search customers",
      },
      {
        status: 500,
      },
    );
  }
}
