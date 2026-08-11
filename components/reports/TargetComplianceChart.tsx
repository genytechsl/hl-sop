"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { AlertTriangle, Clock3, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

interface Ticket {
  status: string;
  slaTarget: string;
  createdAt: string;
}

export default function SlaBreachRateCard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    const res = await fetch("/api/tickets");
    setTickets(await res.json());
  }

  function getHoursFromSla(sla: string) {
    const value = parseInt(sla);
    if (sla.includes("wd")) return value * 24 * 5;
    if (sla.includes("d")) return value * 24;
    return value;
  }

  const metrics = useMemo(() => {
    const now = new Date();

    let breached = 0;
    let closedTickets = 0;
    let breachedClosed = 0;
    let openedTickets = 0;
    let breachedOpened = 0;

    tickets.forEach((ticket) => {
      const created = new Date(ticket.createdAt.replace(" ", "T"));

      const age = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

      const isBreached = age > getHoursFromSla(ticket.slaTarget);

      if (ticket.status === "CLOSED") {
        closedTickets++;

        if (isBreached) {
          breachedClosed++;
        }
      }

      if (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") {
        openedTickets++;

        if (isBreached) {
          breachedOpened++;
        }
      }

      if (
        (ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") &&
        isBreached
      ) {
        breached++;
      }
    });

    return {
      breached,
      total: tickets.length,

      percentage:
        tickets.length === 0
          ? 0
          : Number(((breached / tickets.length) * 100).toFixed(1)),

      closedBreachRate:
        closedTickets === 0
          ? 0
          : Number(((breachedClosed / closedTickets) * 100).toFixed(1)),

      openedBreachRate:
        openedTickets === 0
          ? 0
          : Number(((breachedOpened / openedTickets) * 100).toFixed(1)),
    };
  }, [tickets]);

  const chartData = [
    {
      value: metrics.percentage,
    },
  ];

  const color =
    metrics.percentage < 25
      ? "#19e334"
      : metrics.percentage < 50
        ? "#f59e0b"
        : "#ef4444";

  // function downloadPdf() {
  //   window.print();
  // }

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
    <div ref={cardRef} className="white-card-graph">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-50 p-3">
            <AlertTriangle size={20} className="text-red-600" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              SLA Breach Rate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Active tickets exceeding SLA
            </p>
          </div>
        </div>

        <button
          onClick={downloadPdf}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#004737] hover:bg-[#004737] hover:text-white"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 items-center">
        {/* Main SLA Breach Chart */}
        <div className="col-span-2 h-[280px]">
          <ResponsiveContainer>
            <RadialBarChart
              innerRadius="78%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              data={chartData}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

              <RadialBar
                dataKey="value"
                cornerRadius={20}
                fill={color}
                background
              />

              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                className="fill-slate-800 text-4xl font-bold"
              >
                {metrics.percentage}%
              </text>

              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                className="fill-slate-500 text-sm"
              >
                Overall Breach
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side Small Charts */}
        <div className="col-span-1 flex flex-col gap-6">
          <SmallBreachChart
            value={metrics.closedBreachRate}
            label="Closed Tickets"
          />

          <SmallBreachChart
            value={metrics.openedBreachRate}
            label="Open Tickets"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-red-600" />

            <span className="text-sm text-slate-500">Breached</span>
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {metrics.breached}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Total Tickets</div>

          <p className="mt-2 text-3xl font-bold text-[#004737]">
            {metrics.total}
          </p>
        </div>
      </div>
    </div>
  );
}

function SmallBreachChart({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-40 w-40">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            data={[{ value }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

            <RadialBar
              dataKey="value"
              cornerRadius={10}
              fill={value < 25 ? "#19e334" : value < 50 ? "#f59e0b" : "#ef4444"}
              background
            />

            <text
              x="50%"
              y="52%"
              textAnchor="middle"
              className="fill-slate-800 text-sm font-bold"
            >
              {value}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
