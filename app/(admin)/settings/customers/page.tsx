import DashboardHeader from "@/components/DashboardHeader";
import CustomerManagementTable from "@/components/customers/CustomerManagementTable";

export default function DashboardPage() {
  return (
    <div className="1">
      <DashboardHeader header="Customer Management" page={51} />

      <CustomerManagementTable />

      <section className=".white-card">
        <h4 className="font-semibold text-gray-500">Last Updated</h4>

        <p className="mt-2 text-grey-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
