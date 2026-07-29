import ChartCard from "./ChartCard";

import TicketVolumeChart from "./TicketVolumeChart";
import CategoryPieChart from "./CategoryPieChart";
import PropertyBarChart from "./PropertyBarChart";

export default function DashboardCharts() {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Total Ticket Volume (Last 12 Months)">
          <TicketVolumeChart />
        </ChartCard>

        <ChartCard title="Volume by Category">
          <CategoryPieChart />
        </ChartCard>

        <ChartCard title="Tickets by Property / Project">
          <PropertyBarChart />
        </ChartCard>
      </div>
    </section>
  );
}
