"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  PlusCircle,
  AlertOctagon,
  X,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  designation: string;
  email: string;
}

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  user: User;
}

export default function Sidebar({ open, setOpen, user }: Props) {
  const pathname = usePathname();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const allMenus = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["dataEntry", "admin"],
    },
    {
      name: "Tickets",
      href: "/tickets",
      icon: Ticket,
      roles: ["dataEntry", "admin"],
    },
    {
      name: "Assigned To Me",
      href: "/assigned",
      icon: BookOpen,
      roles: ["actionOwner"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText,
      roles: ["admin"],
    },
  ];

  const menus = allMenus.filter((menu) => menu.roles.includes(user.role));

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  };

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
            <div className="flex items-center justify-between md:justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center">
                  <Image
                    src="/hl_logo_white.png"
                    alt="Company Logo"
                    width={400}
                    height={150}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    Customer Inquiry Management
                  </h2>
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
            {user && user.role === "admin" && (
              <>
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
                      href="/settings/user/"
                      className="block px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
                    >
                      Users
                    </Link>

                    <Link
                      href="/settings/customers/"
                      className="block px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
                    >
                      Customers
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Quick Actions */}
          {user && (user.role === "admin" || user.role === "dataEntry") && (
            <div className="px-4 pb-4">
              <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">
                  Quick Actions
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <Link
                    href="/tickets/new"
                    className="
                      group
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-500/10
                      border
                      border-blue-500/20
                      p-3
                      hover:bg-blue-500/20
                      transition-all
                    "
                  >
                    <PlusCircle
                      size={20}
                      className="text-blue-400 group-hover:scale-110 transition-transform"
                    />

                    <span className="text-[11px] text-slate-300 text-center">
                      Ticket
                    </span>
                  </Link>

                  <Link
                    href="/reports"
                    className="
                      group
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-amber-500/10
                      border
                      border-amber-500/20
                      p-3
                      hover:bg-amber-500/20
                      transition-all
                    "
                  >
                    <AlertOctagon
                      size={20}
                      className="text-amber-400 group-hover:scale-110 transition-transform"
                    />

                    <span className="text-[11px] text-slate-300 text-center">
                      Escalations
                    </span>
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/settings/user"
                      className="
                        group
                        flex
                        flex-col
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-purple-500/10
                        border
                        border-purple-500/20
                        p-3
                        hover:bg-purple-500/20
                        transition-all
                      "
                    >
                      <Settings
                        size={20}
                        className="text-purple-400 group-hover:rotate-90 transition-transform duration-300"
                      />

                      <span className="text-[11px] text-slate-300">
                        Settings
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
          ;{/* Logout function */}
          <div className="px-4 pb-3">
            <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-4">
              {/* Top Row */}
              <div className="flex items-center justify-between mb-4">
                {user.role === "admin" ? (
                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300">
                    System Administrator
                  </span>
                ) : user.role === "actionOwner" ? (
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                    Case Owner
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                    Case Coordinator
                  </span>
                )}

                <button
                  onClick={logout}
                  title="Logout"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-red-500/20
                    text-red-300
                    transition-all
                    hover:bg-red-500/20
                    hover:text-white
                    cursor-pointer
                  "
                >
                  <LogOut size={18} />
                </button>
              </div>

              {/* User Details */}
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {user.designation}
                </p>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="p-5 border-t border-white/10">
            <p className="text-xs text-slate-500">
              <span className="text-geny-green">SolvY360 </span>Powered by GenY
              Tech © 2026
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
