import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const categoryRoleMap: Record<string, string[]> = {
  "CAT-A": ["MEP Engineer"],
  "CAT-B": ["MEP Engineer", "Contractor"],
  "CAT-B2": ["SFM Department"],
  "CAT-C": ["CMU Manager"],
  "CAT-D": ["Operations Executive"],
};

export async function GET() {
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
     * This endpoint is mainly required for ACTION OWNER.
     *
     * Admin/dataEntry can continue using the normal administrative
     * endpoints if you prefer.
     */
    if (user.role === "actionOwner") {
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
          { message: "Employee account is unavailable" },
          { status: 403 },
        );
      }

      /*
       * Load categories.
       *
       * Change the Prisma model name below if your actual generated
       * Prisma model uses a different name.
       */
      const allCategories = await prisma.ticketCategory.findMany({
        orderBy: {
          code: "asc",
        },
      });

      /*
       * Only return categories that match the logged-in employee's
       * designation.
       */
      const categories = allCategories.filter((category) => {
        const allowedDesignations = categoryRoleMap[category.code] ?? [];

        return allowedDesignations.includes(employee.designation);
      });

      /*
       * Scopes are not administrative user records, so they can safely
       * be returned as ticket-form metadata.
       */
      const scopes = await prisma.ticketTypeScope.findMany({
        orderBy: [
          {
            ticketType: "asc",
          },
          {
            scope: "asc",
          },
        ],
      });

      return NextResponse.json({
        role: user.role,

        department: employee.department,

        actionOwner: employee,

        categories,

        scopes,
      });
    }

    return NextResponse.json({
      role: user.role,
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
