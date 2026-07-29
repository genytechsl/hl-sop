"use client";

import {
  FileEdit,
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    title: "Enter Details",
    icon: FileEdit,
    active: true,
  },
  {
    title: "Review",
    icon: ClipboardCheck,
  },
  {
    title: "Confirm",
    icon: ShieldCheck,
  },
  {
    title: "Submitted",
    icon: CheckCircle2,
  },
];

export default function TicketWizard() {
  return (
    <>
      <section className="white-section">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="flex items-center w-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    h-12 w-12 rounded-2xl
                    flex items-center justify-center
                    ${
                      step.active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }
                  `}
                  >
                    <Icon size={20} />
                  </div>

                  <span
                    className={`
                    font-medium
                    ${step.active ? "text-slate-900" : "text-slate-400"}
                  `}
                  >
                    {step.title}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 h-px bg-slate-200 mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
