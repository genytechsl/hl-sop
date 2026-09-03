import { redirect } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
