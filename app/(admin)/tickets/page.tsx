import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import TicketsPageClient from "./TicketsPageClient";

export default async function TicketsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <TicketsPageClient
      user={{
        id: user.id,
        role: user.role,
      }}
    />
  );
}
