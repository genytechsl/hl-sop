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
    </div>
  );
}
