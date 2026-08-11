import ChartCard from "./ChartCard";

import TicketVolumeChart from "./TicketVolumeChart";
import SlaComplianceChart from "./SlaComplianceChart";
import ActionOwnerPerformanceChart from "./ActionOwnerPerformanceChart";

export default function DashboardCharts() {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          title="Total Ticket Volume (Last 12 Months)"
          info="Shows the total volume of tickets opened within the last 365 days"
        >
          <TicketVolumeChart />
        </ChartCard>

        <ChartCard
          title="SLA Compliance Trend"
          info="Shows whether the organization is improving or worsening in meeting SLA targets (Monthly)"
        >
          <SlaComplianceChart />
        </ChartCard>

        <ChartCard
          title="Action Owner Performance"
          info="Shows which employees are handling tickets effectively"
        >
          <ActionOwnerPerformanceChart />
        </ChartCard>
      </div>
    </section>
  );
}
