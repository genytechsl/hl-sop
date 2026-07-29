"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

interface User {
  id: string;
  name: string;
  role: string;
  designation: string;
  email: string;
}

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-gradient min-h-screen">
      <Sidebar open={open} setOpen={setOpen} user={user} />

      <div className="lg:ml-72">
        <MobileNavbar setOpen={setOpen} />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
