import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
  accentColor: string;
}

export default function StatusCard({
  title,
  value,
  percentage,
  icon,
  accentColor,
}: Props) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          backgroundColor: accentColor,
        }}
      />
      <div className="flex items-center justify-between">
        {icon}

        <span className="text-xl text-(--surface) font-semibold text-black/50">
          {percentage}% of total
        </span>
      </div>

      <div className="mt-5">
        <h3
          className="text-2xl font-semibold text-black/75"
          // style={{
          //   color: accentColor,
          // }}
        >
          {title}
        </h3>

        <p className="mt-1 text-4xl font-bold text-(--surface)">{value}</p>
      </div>

      <div className="mt-5 flex justify-end">
        <button className="flex items-center gap-2 text-xl text-blue-500 group-hover:text-blue-300">
          View Details
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
