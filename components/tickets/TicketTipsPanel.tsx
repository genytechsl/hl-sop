import { Info, Clock3 } from "lucide-react";

export default function TicketTipsPanel() {
  return (
    <div className="space-y-5">
      {/* Card 1 */}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-1.5 bg-blue-600" />

        <div className="p-6">
          <div className="flex gap-3">
            <Info className="text-blue-600" />

            <div>
              <h3 className="font-bold text-slate-800">Ticket Guidelines</h3>

              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                Provide a clear title, complete description and select the
                correct category to ensure faster resolution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2 */}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-1.5 bg-amber-500" />

        <div className="p-6">
          <div className="flex gap-3">
            <Clock3 className="text-amber-500" />

            <div>
              <h3 className="font-bold text-slate-800">SLA Information</h3>

              <div className="mt-4 space-y-2 text-sm">
                <div>CAT-A → 24 Hours</div>

                <div>CAT-B → 7 Working Days</div>

                <div>CAT-B2 → 7 Days</div>

                <div>CAT-C → 5 Working Days</div>

                <div>CAT-D → 10 Working Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
