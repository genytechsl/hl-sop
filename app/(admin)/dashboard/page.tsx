import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatusOverview from "@/components/dashboard/StatusOverview";
import AgingTable from "@/components/dashboard/AgingTable";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />

      <StatusOverview />

      <AgingTable />
    </div>
  );
}
