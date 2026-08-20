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
        rounded-3xl
        border
        border-slate-200
        bg-white
        px-5 py-4
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Accent */}
      <div
        className="absolute left-0 right-0 top-0 h-1.5"
        style={{
          backgroundColor: accentColor,
        }}
      />

      {/* Icon + Percentage */}
      <div className="flex items-center justify-between">
        {icon}

        <span className="text-sm font-semibold text-black/40">
          {percentage}% of total
        </span>
      </div>

      {/* Main content */}
      <div className="mt-2 flex items-center justify-between gap-3">
        {/* Left: Title + Main Value */}
        <div>
          <h3 className="text-xl font-semibold text-black/75">{title}</h3>

          <p className="mt-1 text-4xl font-bold text-(--surface)">{value}</p>
        </div>

        {/* Right: Complaint / Inquiry */}
        <div className="flex min-w-[120px] flex-col gap-2">
          {/* Complaints */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-2">
            <p className="text-xs font-medium text-red-500">Complaints</p>
            <p className="text-normal font-bold text-red-700">{complaints}</p>
          </div>

          {/* Inquiries */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-2">
            <p className="text-xs font-medium text-blue-500">Inquiries</p>
            <p className="text-normal font-bold text-blue-700">{inquiries}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
