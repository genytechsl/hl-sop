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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        open={open}
        setOpen={setOpen}
        user={user}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`
          min-h-screen
          transition-all duration-300 ease-in-out
          ${collapsed ? "lg:ml-20" : "lg:ml-72"}
        `}
      >
        <MobileNavbar setOpen={setOpen} />

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
