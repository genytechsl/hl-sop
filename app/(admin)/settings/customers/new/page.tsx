import NewCustomerForm from "@/components/customers/NewCustomerForm";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="New Customer" page={51} />

      <NewCustomerForm />
    </div>
  );
}
