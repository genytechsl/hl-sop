import DashboardHeader from "@/components/DashboardHeader";
import NewUserForm from "@/components/users/NewUserForm";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="New System User" page={41} />

      <NewUserForm />
    </div>
  );
}
