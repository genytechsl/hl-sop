import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =========================================================
    // ADMIN ONLY
    // =========================================================

    if (sessionUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================================
    // QUERY PARAMETERS
    // =========================================================

    const { searchParams } = new URL(request.url);

    const limitParam = searchParams.get("limit");

    const limit = Math.min(Math.max(Number(limitParam) || 100, 1), 500);

    // =========================================================
    // GET LOGS
    // =========================================================

    const logs = await prisma.loginAuditLog.findMany({
      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        identifier: true,
        event: true,
        success: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,

        employee: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            designation: true,
            department: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET login audit logs error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve login logs",
      },
      {
        status: 500,
      },
    );
  }
}
