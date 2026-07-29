import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, children }: Props) {
  return (
    <div className="white-card">
      <h3 className="section-heading mb-5">{title}</h3>

      <div className="flex-1 min-h-[280px]">{children}</div>

      <div className="mt-5 flex justify-end align-middle">
        <button className="flex items-center gap-2 text-xl text-blue-500 group-hover:text-blue-300">
          View Details
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
