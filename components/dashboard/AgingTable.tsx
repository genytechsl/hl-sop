"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryPieChart from "./CategoryPieChart";

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

          {error ? (
            <div className="flex min-h-[250px] items-center justify-center px-6 text-center">
              <div>
                <p className="text-base font-medium text-slate-700">
                  Data unavailable at the moment
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  We couldn't load the aging data. Please try again later.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-center">Category</th>
                    <th className="px-5 py-4 text-center">Target SLA</th>
                    <th className="px-5 py-4 text-center">Average Aging</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>

                <tbody>
                  {agingData.map((row) => (
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

                      <td className="px-5 py-4 text-center">
                        {getSlaTarget(row.code)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {row.averageAge}
                      </td>

                      <td className="px-5 py-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
