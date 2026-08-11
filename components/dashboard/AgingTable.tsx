"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryPieChart from "./CategoryPieChart";

export default function AgingTable() {
  const [agingData, setAgingData] = useState([]);

  useEffect(() => {
    fetch("/api/tickets?aging=true")
      .then((res) => res.json())
      .then(setAgingData);
  }, []);

  return (
    <section className="flex items-stretch gap-6">
      {/* Aging Table */}
      <div id="agingTable" className="flex w-2/3 flex-col">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="section-heading">Average Aging by Category</h2>
          <Info size={16} className="text-slate-500" />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div
            className="absolute left-0 right-0 top-0 h-1.5"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #3b82f6, #3b82f6)",
            }}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-left">Target SLA</th>
                  <th className="px-5 py-4 text-left">Average Aging</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {agingData.map((row: any) => (
                  <tr key={row.code}>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center rounded-l-md px-5 py-2 text-base text-[var(--text-primary)]"
                        style={{
                          borderLeft: `5px solid ${row.accentColor}`,
                        }}
                      >
                        {row.code} ({row.label})
                      </span>
                    </td>

                    <td className="px-5 py-4">{row.slaTarget}</td>

                    <td className="px-5 py-4">{row.averageAge}</td>

                    <td className="px-5 py-4"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div id="totalVolume" className="flex w-1/3 flex-col">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="section-heading">Volume by Category</h2>
          <Info size={16} className="text-slate-500" />
        </div>

        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div
            className="absolute left-0 right-0 top-0 h-1.5"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #3b82f6, #3b82f6)",
            }}
          />

          <div className="flex h-full items-center justify-center p-6">
            <CategoryPieChart />
          </div>
        </div>
      </div>
    </section>
  );
}
