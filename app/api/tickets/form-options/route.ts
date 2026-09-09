import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const categoryRoleMap: Record<string, string[]> = {
  "CAT-A": ["MEP Engineer"],
  "CAT-B": ["MEP Engineer", "Contractor"],
  "CAT-B2": ["SFM Department"],
  "CAT-C": ["CMU Manager"],
  "CAT-D": ["Operations Executive"],
};

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role !== "admin" &&
      user.role !== "dataEntry" &&
      user.role !== "actionOwner"
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    /*
     * ---------------------------------------------------------
     * QUERY PARAMETERS
     * ---------------------------------------------------------
     */

    const ticketType =
      request.nextUrl.searchParams.get("ticketType")?.trim() || "";

    /*
     * ---------------------------------------------------------
     * SCOPES
     * ---------------------------------------------------------
     *
     * If ticketType is supplied:
     *
     * INQ -> only INQ scopes
     * COM -> only COM scopes
     *
     * Otherwise return all scopes.
     */

    const scopes = await prisma.ticketTypeScope.findMany({
      where: ticketType
        ? {
            ticketType,
          }
        : undefined,

      orderBy: {
        scope: "asc",
      },
    });

    /*
     * ---------------------------------------------------------
     * ADMIN / DATA ENTRY
     * ---------------------------------------------------------
     */

    if (
      user.role === "admin" ||
      user.role === "dataEntry" ||
      user.role === "actionOwner"
    ) {
      return NextResponse.json({
        role: user.role,
        scopes,
      });
    }

    /*
     * ---------------------------------------------------------
     * ACTION OWNER
     * ---------------------------------------------------------
     */

    const employee = await prisma.employee.findUnique({
      where: {
        id: user.id,
      },

      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        active: true,
        role: true,
        department: true,
        username: true,
      },
    });

    if (!employee || !employee.active) {
      return NextResponse.json(
        {
          message: "Employee account is unavailable",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * ---------------------------------------------------------
     * ACTION OWNER CATEGORIES
     * ---------------------------------------------------------
     */

    const allCategories = await prisma.ticketCategory.findMany({
      orderBy: {
        code: "asc",
      },
    });

    const categories = allCategories.filter((category) => {
      const allowedDesignations = categoryRoleMap[category.code] ?? [];

      return allowedDesignations.includes(employee.designation);
    });

    /*
     * ---------------------------------------------------------
     * RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      role: user.role,
      department: employee.department,
      actionOwner: employee,
      categories,
      scopes,
    });
  } catch (error) {
    console.error("GET /api/tickets/form-options error:", error);

    return NextResponse.json(
      {
        message: "Failed to load ticket form options",
      },
      {
        status: 500,
      },
    );
  }
}
