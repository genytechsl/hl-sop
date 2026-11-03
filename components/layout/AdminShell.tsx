"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import MobileNavbar from "./MobileNavbar";

import type { SessionUser } from "@/lib/auth/session";

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell min-h-screen bg-slate-50">
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

        <main className="min-w-0 p-3 sm:p-4 md:p-6 lg:p-8"><div className="mb-4 flex justify-end"><ThemeToggle /></div>{children}</main>
      </div>
    </div>
  );
}
