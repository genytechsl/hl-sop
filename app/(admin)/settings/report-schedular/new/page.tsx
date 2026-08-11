import DashboardHeader from "@/components/DashboardHeader";
import ReportSchedulerForm from "@/components/settings/NewReportSchedulerForm";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="New Schedule" page={61} />

      <ReportSchedulerForm />
    </div>
  );
}
