"use client";

import { Menu } from "lucide-react";

export default function MobileNavbar({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-40 lg:hidden backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
      <div className="h-16 px-4 flex items-center justify-between">
        <h1 className="font-semibold text-white">UCSP Admin</h1>

        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <Menu className="text-white" />
        </button>
      </div>
    </header>
  );
}
