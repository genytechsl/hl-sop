import DashboardHeader from "@/components/DashboardHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import AgingTable from "@/components/dashboard/AgingTable";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="CMU Issue Tracking Dashboard" page={1} />

      <StatusOverview />

      <AgingTable />

      <DashboardCharts />

      <section className="white-card">
        <div className="mt-3 flex items-center justify-end gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>

          <p className="font-medium text-red-600">Live</p>
        </div>

        {/* <div className="mt-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>

          <p className="font-medium text-red-600">Service Disruption</p>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          One or more services are currently unavailable.
        </p> */}
      </section>
    </div>
  );
}
