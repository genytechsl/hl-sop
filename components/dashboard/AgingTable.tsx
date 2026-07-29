import { ArrowRight, Info } from "lucide-react";
import { agingData } from "./dashboard-data";

export default function AgingTable() {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="section-heading">Average Aging & SLA Compliance</h2>

        <Info size={16} className="text-slate-500" />
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl shadow-slate-900/10 border border-slate-200">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: "linear-gradient(90deg, #3b82f6, #3b82f6, #3b82f6)",
          }}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="">
              <tr>
                <th className="text-left px-5 py-4">Category</th>
                <th className="text-left px-5 py-4">Target SLA</th>
                <th className="text-left px-5 py-4">Average Aging</th>
                <th className="text-left px-5 py-4">SLA Compliance</th>
                <th className="text-left px-5 py-4">vs SLA</th>
                <th className="text-left px-5 py-4"></th>
              </tr>
            </thead>

            <tbody>
              {agingData.map((row) => (
                <tr key={row.code}>
                  <td className="px-5 py-4">
                    <span
                      className={`text-base inline-flex items-center px-5 py-2 rounded-l-md text-[var(--text-primary)]`}
                      style={{
                        borderLeft: `5px solid ${row.accentColor}`,
                      }}
                    >
                      {row.code} ({row.label})
                    </span>
                  </td>

                  <td className="px-5 py-4">{row.target}</td>

                  <td className="px-5 py-4">{row.aging}</td>

                  {/* <td className="px-5 py-4">{row.compliance}%</td> */}

                  <td className="px-5 py-4 min-w-[220px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-primary)] text-lg font-semibold">
                          {row.compliance}%
                        </span>
                      </div>

                      <div className="h-3 bg-slate-300 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${row.color}`}
                          style={{
                            width: `${row.compliance}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-green-400 text-center">
                    Within SLA
                  </td>

                  <td className="px-5 py-4 text-center">
                    <div className="mt-5 flex justify-end align-middle">
                      <button className="flex items-center gap-2 text-xl text-blue-500 group-hover:text-blue-300">
                        View Details
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center m-2">
        <Info size={16} className="text-slate-500 mr-2" />
        <p className="text-sm">Click on View Details to see the full details</p>
      </div>
    </section>
  );
}
