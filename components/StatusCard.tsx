interface Props {
  title: string;
  value: number;
  percentage: number;
  complaints: number;
  inquiries: number;
  icon: React.ReactNode;
  accentColor: string;
}

export default function StatusCard({
  title,
  value,
  percentage,
  complaints,
  inquiries,
  icon,
  accentColor,
}: Props) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      {/* Accent */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accentColor }}
      />

      {/* Row 1 */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          {icon}
        </div>

        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-600">
          {title}
        </h3>

        <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-400">
          {percentage}%
        </span>
      </div>

      {/* Row 2 */}
      <div className="mt-4 flex items-end justify-between gap-4">
        {/* Left: COM + INQ */}
        <div className="flex min-w-0 items-end gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
              COM
            </span>

            <span className="text-sm font-bold text-red-700">{complaints}</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
              INQ
            </span>

            <span className="text-sm font-bold text-blue-700">{inquiries}</span>
          </div>
        </div>

        {/* Right: Main value */}
        <p className="shrink-0 text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
