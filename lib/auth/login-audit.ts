import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

type LoginAuditInput = {
  request: NextRequest;
  employeeId?: string | null;
  identifier?: string | null;
  event: "LOGIN" | "LOGOUT";
  success: boolean;
};

function getClientIp(request: NextRequest): string | null {
  /*
   * When Next.js is behind Nginx/proxy,
   * X-Forwarded-For may contain:
   *
   * client-ip, proxy-ip, ...
   *
   * The first address is normally the originating client.
   */

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return null;
}

export async function createLoginAuditLog({
  request,
  employeeId = null,
  identifier = null,
  event,
  success,
}: LoginAuditInput) {
  try {
    const ipAddress = getClientIp(request);

    const userAgent = request.headers.get("user-agent");

    await prisma.loginAuditLog.create({
      data: {
        employeeId,
        identifier,
        event,
        success,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    /*
     * Audit logging should not prevent legitimate
     * authentication if the audit table temporarily fails.
     */

    console.error("Failed to create login audit log:", error);
  }
}
