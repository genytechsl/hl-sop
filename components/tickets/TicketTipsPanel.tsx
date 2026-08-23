import {
  Info,
  Clock3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function TicketTipsPanel() {
  return (
    <div className="space-y-5">
      {/* Ticket Guidelines */}
      <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1.5 bg-[#14b8a6]" />

        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
              <Info size={20} className="text-[#14b8a6]" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-slate-800">Ticket Guidelines</h3>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                Resolve requests faster
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Complete ticket information helps the assigned team understand
                and resolve issues faster.
              </p>

              <div className="mt-1 space-y-1">
                <Tip text="Use a clear, descriptive title." />
                <Tip text="Include relevant dates, locations and details." />
                <Tip text="Select the correct category and service." />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Information */}
      <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
        <div className="h-1.5 bg-[#14b8a6]" />

        <div className="p-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
              <Clock3 size={20} className="text-[#14b8a6]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">SLA Information</h3>

                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    Resolution targets
                  </p>
                </div>

                <ShieldCheck
                  size={19}
                  className="hidden text-amber-500 sm:block"
                />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Each category has a defined SLA target. Tickets approaching or
                exceeding their target may require escalation.
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category
                  </span>

                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Target
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  <SlaRow
                    category="CAT-A"
                    description="Critical"
                    time="24 Hours"
                  />
                  <SlaRow
                    category="CAT-B"
                    description="Technical"
                    time="7 Working Days"
                  />
                  <SlaRow
                    category="CAT-B2"
                    description="SFM Facility"
                    time="7 Days"
                  />
                  <SlaRow
                    category="CAT-C"
                    description="Admin / Payment"
                    time="5 Working Days"
                  />
                  <SlaRow
                    category="CAT-D"
                    description="Legal"
                    time="10 Working Days"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3">
                <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />

                <p className="text-xs leading-relaxed text-amber-700">
                  SLA timers are monitored against the applicable category
                  target and may trigger escalation when exceeded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-1">
      <CheckCircle2 size={15} className="shrink-0 text-blue-600" />
      <p className="text-xs font-medium text-slate-600">{text}</p>
    </div>
  );
}

function SlaRow({
  category,
  description,
  time,
}: {
  category: string;
  description: string;
  time: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
          {category}
        </span>

        {/* <span className="truncate text-sm text-slate-600">{description}</span> */}
      </div>

      <span className="whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
        {time}
      </span>
    </div>
  );
}
