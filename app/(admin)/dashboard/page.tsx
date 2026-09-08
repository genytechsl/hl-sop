"use client";

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { flushSync } from "react-dom";

import DashboardHeader from "@/components/DashboardHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import AgingTable from "@/components/dashboard/AgingTable";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import SlaBreachRateCard from "@/components/reports/TargetComplianceChart";

import ExecutiveSummaryReport from "@/components/reports/pdf/ExecutiveSummaryReport";

import type {
  ExecutiveSummaryApiResponse,
  ExecutiveSummaryReport as ExecutiveSummaryReportData,
} from "@/types/executive-report";

export default function DashboardPage() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] =
    useState<ExecutiveSummaryReportData | null>(null);

  const [exporting, setExporting] = useState(false);

  async function waitForReportRender() {
    await document.fonts.ready;

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  async function waitForImages(container: HTMLElement) {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
      images.map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }),
    );
  }

  async function downloadPdf() {
    if (exporting) return;

    try {
      setExporting(true);

      /* =====================================================
       LOAD ONE CONSISTENT REPORT SNAPSHOT
    ===================================================== */

      const response = await fetch("/api/reports/executive-summary", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load executive report: ${response.status}`);
      }

      const result: ExecutiveSummaryApiResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error("Invalid executive summary response");
      }

      /* =====================================================
       RENDER OFF-SCREEN REPORT
    ===================================================== */

      flushSync(() => {
        setReportData(result.data);
      });

      await document.fonts.ready;

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      const reportElement = reportRef.current;

      if (!reportElement) {
        throw new Error("Executive report failed to render");
      }

      await waitForImages(reportElement);

      await waitForReportRender();

      /* =====================================================
       FIND THE THREE A4 REPORT PAGES
    ===================================================== */

      const pages = Array.from(
        reportElement.querySelectorAll<HTMLElement>('[data-pdf-page="true"]'),
      );

      if (pages.length === 0) {
        throw new Error("No report pages were generated");
      }

      /* =====================================================
       CREATE A4 LANDSCAPE PDF
    ===================================================== */

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      pdf.setProperties({
        title: "Case Intelligence Platform - Executive Summary",
        subject: "Case Intelligence Platform Executive Summary Report",
        author: "SolvY360 · GenY Tech",
        creator: "Case Intelligence Platform",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      /* =====================================================
       CAPTURE EACH PAGE INDIVIDUALLY
    ===================================================== */

      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];

        const image = await toPng(page, {
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          cacheBust: true,
        });

        if (index > 0) {
          pdf.addPage("a4", "landscape");
        }

        pdf.addImage(
          image,
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          "FAST",
        );
      }

      /* =====================================================
       FILE NAME
    ===================================================== */

      const date = result.data.report.generatedAt.slice(0, 10);

      pdf.save(`case-intelligence-executive-summary-${date}.pdf`);
    } catch (error) {
      console.error("Failed to export executive summary:", error);
    } finally {
      setReportData(null);
      setExporting(false);
    }
  }

  return (
    <>
      <DashboardHeader
        header="Case Intelligence Platform Dashboard"
        page={1}
        onExport={downloadPdf}
      />

      <div className="mt-6 space-y-8 bg-white">
        <StatusOverview />

        <AgingTable />

        <DashboardCharts />

        <SlaBreachRateCard />

        <section>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status & Generated Date */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                <p className="font-medium text-red-600">Live</p>
              </div>

              <p className="text-sm text-slate-500">
                Generated on{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Customer Logo */}
            <div className="flex h-14 w-full max-w-[240px] items-center rounded-xl border border-slate-200 bg-white px-4 py-2 sm:justify-end">
              <img
                src="/hl_logo.png"
                alt="Home Lands Logo"
                className="max-h-10 w-auto max-w-full object-contain object-right"
              />
            </div>
          </div>
        </section>
      </div>

      {reportData && (
        <ExecutiveSummaryReport ref={reportRef} data={reportData} />
      )}
    </>
  );
}
