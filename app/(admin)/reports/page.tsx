import DashboardHeader from "@/components/DashboardHeader";
import ScopeDistributionChart from "@/components/reports/MonthlyScopeVolumeChart";
import SlaBreachRateCard from "@/components/reports/TargetComplianceChart";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="Reports & Analytics" page={3} />
      <SlaBreachRateCard />
      <ScopeDistributionChart />

      <section className=".white-card">
        <h4 className="font-semibold text-gray-500">Last Updated</h4>

        <p className="mt-2 text-grey-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
