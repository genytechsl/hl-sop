"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function Sidebar({ open, setOpen }: Props) {
  const pathname = usePathname();

  const [settingsOpen, setSettingsOpen] = useState(true);

  const menus = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tickets",
      href: "/tickets",
      icon: Ticket,
    },
    {
      name: "Ledger",
      href: "/ledger",
      icon: BookOpen,
    },
    {
      name: "SLA Escalations",
      href: "/sla-escalations",
      icon: AlertTriangle,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72

          bg-slate-900/95
          backdrop-blur-xl

          border-r border-white/10

          transform transition-all duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}

          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                  U
                </div>

                <div>
                  <h2 className="font-bold text-lg">UCSP Admin</h2>

                  <p className="text-xs text-slate-400">
                    Service Desk Platform
                  </p>
                </div>
              </div>

              <button className="lg:hidden" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
          </div>

          {/* Menu */}

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    rounded-2xl
                    px-4 py-3

                    transition-all duration-200

                    ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}

            {/* Settings */}

            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-slate-300 hover:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} />
                Settings
              </div>

              <ChevronDown
                className={`transition ${settingsOpen ? "rotate-180" : ""}`}
                size={16}
              />
            </button>

            {settingsOpen && (
              <div className="ml-6 space-y-2">
                <Link
                  href="/settings/user-settings"
                  className="block px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  User Settings
                </Link>

                <Link
                  href="/settings/other-settings"
                  className="block px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Other Settings
                </Link>
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="p-5 border-t border-white/10">
            <p className="text-xs text-slate-500">
              Developed by GenY Tech © 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
