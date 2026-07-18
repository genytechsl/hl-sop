import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}

export default function StatusCard({ title, value, percentage, icon }: Props) {
  return (
    <div className="group rounded-3xl bg-slate-900/70 border border-white/10 p-5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between">
        {icon}

        <span className="text-xs text-slate-400">{percentage}% of total</span>
      </div>

      <div className="mt-5">
        <h3 className="text-slate-400 text-sm">{title}</h3>

        <p className="mt-1 text-4xl font-bold text-white">{value}</p>
      </div>

      <button className="mt-5 flex items-center gap-2 text-sm text-blue-400 group-hover:text-blue-300">
        View Details
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
