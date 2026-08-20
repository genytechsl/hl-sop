import { Info } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
  info?: string;
}

export default function ChartCard({ title, children, info }: Props) {
  return (
    <div className="white-card relative overflow-hidden">
      {/* Premium gradient top border */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

      <div className="mb-5 flex items-center">
        <h3 className="section-heading">{title}</h3>

        {info && (
          <div className="group relative ml-4">
            <Info
              size={18}
              className="cursor-help text-slate-400 transition hover:text-emerald-600"
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

      <div className="min-h-[280px] flex-1">{children}</div>
    </div>
  );
}
