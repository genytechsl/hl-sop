"use client";
import { useRef } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import AgingTable from "@/components/dashboard/AgingTable";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export default function DashboardPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  async function downloadPdf() {
    if (!cardRef.current) return;

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#fff",
    });

    const pdf = new jsPDF();

    const width = pdf.internal.pageSize.getWidth();
    const height =
      (cardRef.current.offsetHeight * width) / cardRef.current.offsetWidth;

    pdf.addImage(dataUrl, "PNG", 0, 10, width, height);
    pdf.save("sla-breach-rate-report.pdf");
  }

  return (
    <>
      <DashboardHeader header="CIM Dashboard" page={1} onExport={downloadPdf} />{" "}
      <div ref={cardRef} className="mt-6 space-y-8">
        <StatusOverview />

        <AgingTable />

        <DashboardCharts />

        <section>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
              <p className="font-medium text-red-600">Live</p>
            </div>

            <div className="mt-2 flex justify-end text-sm text-slate-500">
              Generated on{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* <div className="mt-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>

          <p className="font-medium text-red-600">Service Disruption</p>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          One or more services are currently unavailable.
        </p> */}
        </section>
      </div>
    </>
  );
}
