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
        p-5
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

      {/* Main value */}
      <div className="mt-5">
        <h3 className="text-2xl font-semibold text-black/75">{title}</h3>

        <p className="mt-1 text-4xl font-bold text-(--surface)">{value}</p>
      </div>

      {/* Complaint / Inquiry breakdown */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* Complaints */}
        <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3">
          <p className="text-xs font-medium text-red-500">Complaints</p>

          <p className="mt-1 text-xl font-bold text-red-700">{complaints}</p>
        </div>

        {/* Inquiries */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
          <p className="text-xs font-medium text-blue-500">Inquiries</p>

          <p className="mt-1 text-xl font-bold text-blue-700">{inquiries}</p>
        </div>
      </div>
    </div>
  );
}
