"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryPieChart from "./CategoryPieChart";
import ScopeDistributionChart from "../reports/MonthlyScopeVolumeChart";

interface AgingRow {
  code: string;
  label: string;
  slaTarget: string;
  averageAge: string;
  accentColor: string;
}

const SLA_TARGETS: Record<string, string> = {
  "CAT-A": "24 h",
  "CAT-B": "7 Working Days",
  "CAT-B2": "7 Days",
  "CAT-C": "5 Working Days",
  "CAT-D": "10 Working Days",
};

function getSlaTarget(code: string): string {
  return SLA_TARGETS[code] ?? "—";
}
export default function AgingTable() {
  const [agingData, setAgingData] = useState<AgingRow[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadAgingData = async () => {
      try {
        setError(false);

        const res = await fetch("/api/tickets?aging=true");

        if (!res.ok) {
          throw new Error(`Failed to load aging data: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid aging data");
        }

        setAgingData(data);
      } catch (err) {
        console.error("Failed to load aging data:", err);
        setError(true);
        setAgingData([]);
      }
    };

    loadAgingData();
  }, []);

  return (
    <section className="flex items-stretch gap-6">
      {/* Aging Table */}
      <div id="agingTable" className="flex min-w-0 flex-[1] flex-col">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {/* Premium top border */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

          {/* Header */}
          <div className="mb-4 flex items-center gap-2 p-4">
            <h2 className="section-heading">Average Aging by Category</h2>
            <Info size={16} className="text-slate-500" />
          </div>

          {/* Table */}
          {error ? (
            <div className="flex min-h-[250px] flex-1 items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Data unavailable at the moment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  We couldn't load the aging data. Please try again later.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-1 py-3 text-center text-xs">Category</th>

                    <th className="px-5 py-3 text-center text-xs">
                      Target SLA
                    </th>

                    <th className="px-5 py-3 text-center text-xs">
                      Average Aging
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {agingData.map((row) => (
                    <tr key={row.code}>
                      <td className="px-1 py-1">
                        <span
                          className="inline-flex items-center rounded-l-md px-5 py-2 text-sm text-[var(--text-primary)]"
                          style={{
                            borderLeft: `5px solid ${row.accentColor}`,
                          }}
                        >
                          {row.code} ({row.label})
                        </span>
                      </td>

                      <td className="px-5 py-1 text-center text-sm">
                        {getSlaTarget(row.code)}
                      </td>

                      <td className="px-5 py-1 text-center text-sm">
                        {row.averageAge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <p className="text-[10px] leading-relaxed text-slate-400">
              Average aging represents the typical time elapsed since ticket
              creation, helping identify categories requiring closer attention
              against their target SLA.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly volume & data profile */}
      <div id="totalVolume" className="flex min-w-0 flex-[1] flex-col">
        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="flex h-full items-center justify-center">
            <ScopeDistributionChart />
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div id="totalVolume" className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

          <div className="flex h-full items-center justify-center p-3">
            <CategoryPieChart />
          </div>
        </div>
      </div>
    </section>
  );
}
