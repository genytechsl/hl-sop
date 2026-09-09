import { NextResponse } from "next/server";

import { ADMIN_ROLES, authorizeRoles } from "@/app/api/_rbac";

import { getExecutiveSummaryReport } from "@/lib/executive-report-service";

export async function GET() {
  try {
    const auth = await authorizeRoles(ADMIN_ROLES);

    if (!auth.ok) {
      return auth.response;
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
