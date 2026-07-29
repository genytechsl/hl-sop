import DashboardHeader from "@/components/DashboardHeader";
import NewUserForm from "@/components/users/NewUserForm";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="New Customer" page={51} />

      <NewUserForm />

      <section className=".white-card">
        <h4 className="font-semibold text-gray-500">Last Updated</h4>

        <p className="mt-2 text-grey-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
