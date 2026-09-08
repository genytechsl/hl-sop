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
    <section
      className="
        grid
        grid-cols-1
        gap-4
        lg:grid-cols-2
        xl:grid-cols-3
        xl:gap-6
      "
    >
      {/* Average Aging */}
      <div id="agingTable" className="min-w-0">
        <div
          className="
            relative
            flex
            h-full
            min-h-[320px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            sm:rounded-3xl
            xl:shadow-xl
            xl:shadow-slate-900/10
          "
        >
          {/* Accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 sm:h-1.5" />

          {/* Header */}
          <div className="flex items-center gap-2 px-4 pb-3 pt-5 sm:px-5 sm:pt-6">
            <h2 className="section-heading min-w-0">
              Average Aging by Category
            </h2>

            <Info
              size={16}
              className="shrink-0 text-slate-400"
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          {error ? (
            <div className="flex min-h-[220px] flex-1 items-center justify-center px-5 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Data unavailable at the moment
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  We couldn&apos;t load the aging data. Please try again later.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:px-5">
                      Category
                    </th>

                    <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:px-5">
                      Target SLA
                    </th>

                    <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:px-5">
                      Avg. Aging
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {agingData.map((row) => (
                    <tr
                      key={row.code}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-2.5 sm:px-5">
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            border-l-4
                            py-1
                            pl-3
                          "
                          style={{
                            borderLeftColor: row.accentColor,
                          }}
                        >
                          <div className="min-w-0">
                            <p className="whitespace-nowrap text-xs font-semibold text-slate-700 sm:text-sm">
                              {row.code}
                            </p>

                            <p className="max-w-[180px] truncate text-[10px] text-slate-400 sm:text-xs">
                              {row.label}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-center text-xs font-medium text-slate-600 sm:px-5 sm:text-sm">
                        {getSlaTarget(row.code)}
                      </td>

                      <td className="px-3 py-2.5 text-center text-xs font-semibold text-slate-700 sm:px-5 sm:text-sm">
                        {row.averageAge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
            <p className="text-[10px] leading-relaxed text-slate-400">
              Average aging represents the typical time elapsed since ticket
              creation, helping identify categories requiring closer attention
              against their target SLA.
            </p>
          </div>
        </div>
      </div>

      {/* Scope Distribution */}
      <div id="scopeDistribution" className="min-w-0">
        <div
          className="
            relative
            h-full
            min-h-[320px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            sm:rounded-3xl
            xl:shadow-xl
            xl:shadow-slate-900/10
          "
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 sm:h-1.5" />

          <div className="flex h-full min-h-[320px] items-center justify-center p-3 sm:p-4">
            <div className="w-full min-w-0">
              <ScopeDistributionChart />
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div
        id="categoryDistribution"
        className="
          min-w-0
          lg:col-span-2
          xl:col-span-1
        "
      >
        <div
          className="
            relative
            h-full
            min-h-[320px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            sm:rounded-3xl
            xl:shadow-xl
            xl:shadow-slate-900/10
          "
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 sm:h-1.5" />

          <div className="flex h-full min-h-[380px] items-stretch p-3 sm:p-4">
            <div className="h-full min-h-[320px] w-full min-w-0">
              <CategoryPieChart />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
