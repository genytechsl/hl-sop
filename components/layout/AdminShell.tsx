"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-gradient min-h-screen">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="lg:ml-72">
        <MobileNavbar setOpen={setOpen} />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
