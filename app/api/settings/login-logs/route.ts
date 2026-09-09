import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SYS_ADMIN_ROLES, authorizeRoles } from "@/app/api/_rbac";

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(SYS_ADMIN_ROLES);

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 25, 10),
      100,
    );

    const event = searchParams.get("event");
    const success = searchParams.get("success");
    const search = searchParams.get("search")?.trim();

    const where = {
      ...(event && event !== "ALL"
        ? {
            event,
          }
        : {}),

      ...(success === "true"
        ? {
            success: true,
          }
        : success === "false"
          ? {
              success: false,
            }
          : {}),

      ...(search
        ? {
            OR: [
              {
                identifier: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                ipAddress: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                employee: {
                  is: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        username: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        email: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.loginAuditLog.findMany({
        where,

        skip: (page - 1) * limit,

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
      }),

      prisma.loginAuditLog.count({
        where,
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
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
