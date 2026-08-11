import { Info } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  info?: string;
}

export default function ChartCard({ title, children, info }: Props) {
  return (
    <div className="white-card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-heading">{title}</h3>

        {info && (
          <div className="relative group">
            <Info
              size={18}
              className="text-slate-400 cursor-help hover:text-blue-600 transition"
            />

            <div
              className="
                absolute
                right-0
                top-7
                z-50
                hidden
                w-72
                rounded-xl
                bg-slate-800
                px-4
                py-3
                text-sm
                text-white
                shadow-xl
                group-hover:block
              "
            >
              {info}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[280px]">{children}</div>
    </div>
  );
}
