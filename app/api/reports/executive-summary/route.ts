import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

import { getExecutiveSummaryReport } from "@/lib/executive-report-service";

export async function GET() {
  try {
    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    /* =====================================================
       AUTHORIZATION
    ===================================================== */

    const isAdmin = user.role === "admin";
    const isDataEntry = user.role === "dataEntry";

    if (!isAdmin && !isDataEntry) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    /* =====================================================
       EXECUTIVE SUMMARY
    ===================================================== */

    const report = await getExecutiveSummaryReport();

    return NextResponse.json(
      {
        success: true,
        data: report,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/reports/executive-summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate executive summary report",
      },
      {
        status: 500,
      },
    );
  }
}
