import { Info } from "lucide-react";
import { agingData } from "./dashboard-data";

export default function AgingTable() {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">
          Average Aging & SLA Compliance
        </h2>

        <Info size={16} className="text-slate-500" />
      </div>

      <div className="rounded-3xl border border-white/10 overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left px-5 py-4">Category</th>
                <th className="text-left px-5 py-4">Target SLA</th>
                <th className="text-left px-5 py-4">Average Aging</th>
                <th className="text-left px-5 py-4">SLA Compliance</th>
                <th className="text-left px-5 py-4">vs SLA</th>
              </tr>
            </thead>

            <tbody>
              {agingData.map((row) => (
                <tr key={row.code} className="border-t border-white/5">
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs text-white ${row.color}`}
                    >
                      {row.code} ({row.label})
                    </span>
                  </td>

                  <td className="px-5 py-4">{row.target}</td>

                  <td className="px-5 py-4">{row.aging}</td>

                  <td className="px-5 py-4">{row.compliance}%</td>

                  <td className="px-5 py-4 text-green-400">Within SLA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
