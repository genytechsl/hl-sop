"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  FileText,
  Settings,
  ChevronDown,
  PlusCircle,
  AlertOctagon,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function Sidebar({
  open,
  setOpen,
  user,
  collapsed,
  setCollapsed,
}: Props) {
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
    // {
    //   name: "Reports",
    //   href: "/reports",
    //   icon: FileText,
    //   roles: ["admin"],
    // },
  ];

  const menus = allMenus.filter((menu) => menu.roles.includes(user.role));

  const settingsActive =
    pathname.startsWith("/settings/user") ||
    pathname.startsWith("/settings/customers") ||
    pathname.startsWith("/settings/report-schedular") ||
    pathname.startsWith("/settings/types-manager");

  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    setSettingsOpen(false);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen
          bg-white border-r border-slate-200
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-72"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          {/* =====================================================
              LOGO
          ====================================================== */}
          {/* =====================================================
    SIDEBAR HEADER
====================================================== */}
          <div
            className={`
    relative flex h-20 shrink-0 items-center
    justify-center
    border-b border-slate-100
    px-3
  `}
          >
            {/* Centered Logo */}
            <div
              className={`
                flex items-center justify-center
                transition-all duration-300 pt-4
                ${collapsed ? "w-0" : "w-36"}
              `}
            >
              <Image
                src="/solvy360.png"
                alt="SolvY360"
                width={400}
                height={150}
                className="h-auto w-full object-contain mt-4"
                priority
              />
            </div>

            {/* Desktop Collapse Button */}
            <button
              onClick={toggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="
                    absolute right-3 top-1/2
                    hidden h-8 w-8
                    -translate-y-1/2
                    items-center justify-center
                    rounded-lg
                    text-slate-400
                    transition-all
                    hover:bg-slate-100
                    hover:text-slate-700
                    lg:flex
                  "
            >
              {collapsed ? (
                <PanelLeftOpen size={17} />
              ) : (
                <PanelLeftClose size={17} />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              className="
                          absolute right-3 top-1/2
                          flex h-8 w-8
                          -translate-y-1/2
                          items-center justify-center
                          rounded-lg
                          text-slate-400
                          transition
                          hover:bg-slate-100
                          hover:text-slate-700
                          lg:hidden
                        "
            >
              <X size={19} />
            </button>
          </div>

          {/* =====================================================
              NAVIGATION
          ====================================================== */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Main Menu
              </p>
            )}

            <div className="space-y-1.5">
              {menus.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`
                      group flex items-center rounded-xl
                      transition-all duration-200
                      ${
                        collapsed
                          ? "h-11 justify-center px-2"
                          : "gap-3 px-3.5 py-3"
                      }
                      ${
                        active
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={active ? 2.3 : 2}
                      className="shrink-0 transition-transform group-hover:scale-105"
                    />

                    {!collapsed && (
                      <span className="truncate text-sm font-medium">
                        {item.name}
                      </span>
                    )}

                    {!collapsed && active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* =================================================
                SETTINGS
            ================================================== */}
            {user.role === "admin" && (
              <div className="mt-6">
                {!collapsed && (
                  <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Administration
                  </p>
                )}

                <button
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setSettingsOpen(true);
                    } else {
                      setSettingsOpen(!settingsOpen);
                    }
                  }}
                  title={collapsed ? "Settings" : undefined}
                  className={`
                    group flex w-full items-center rounded-xl
                    transition-all duration-200
                    ${
                      collapsed
                        ? "h-11 justify-center px-2"
                        : "justify-between px-3.5 py-3"
                    }
                    ${
                      settingsActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center
                      ${collapsed ? "justify-center" : "gap-3"}
                    `}
                  >
                    <Settings
                      size={19}
                      className="shrink-0 transition-transform duration-300 group-hover:rotate-45"
                    />

                    {!collapsed && (
                      <span className="text-sm font-medium">Settings</span>
                    )}
                  </div>

                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        settingsOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {!collapsed && settingsOpen && (
                  <div className="mt-1.5 ml-5 space-y-1 border-l border-slate-200 pl-4">
                    <Link
                      href="/settings/user"
                      onClick={() => setOpen(false)}
                      className={`
                        block rounded-lg px-3 py-2 text-sm transition
                        ${
                          pathname.startsWith("/settings/user")
                            ? "bg-emerald-50 font-medium text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      Users
                    </Link>

                    <Link
                      href="/settings/customers"
                      onClick={() => setOpen(false)}
                      className={`
                        block rounded-lg px-3 py-2 text-sm transition
                        ${
                          pathname.startsWith("/settings/customers")
                            ? "bg-emerald-50 font-medium text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      Customers
                    </Link>

                    <Link
                      href="/settings/report-schedular"
                      onClick={() => setOpen(false)}
                      className={`
                        block rounded-lg px-3 py-2 text-sm transition
                        ${
                          pathname.startsWith("/settings/report-schedular")
                            ? "bg-emerald-50 font-medium text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      Report Schedules
                    </Link>

                    <Link
                      href="/settings/types-manager"
                      onClick={() => setOpen(false)}
                      className={`
                        block rounded-lg px-3 py-2 text-sm transition
                        ${
                          pathname.startsWith("/settings/types-manager")
                            ? "bg-emerald-50 font-medium text-emerald-700"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      Other
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                QUICK ACTIONS
            ================================================== */}
            {(user.role === "admin" || user.role === "dataEntry") && (
              <div className="mt-6">
                {!collapsed && (
                  <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Actions
                  </p>
                )}

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  <div
                    className={`grid ${
                      collapsed ? "grid-cols-1 gap-1.5" : "grid-cols-3 gap-2"
                    }`}
                  >
                    <Link
                      href="/tickets/new"
                      onClick={() => setOpen(false)}
                      title={collapsed ? "New Ticket" : undefined}
                      className={`
                        group flex items-center justify-center
                        rounded-lg border border-emerald-100
                        bg-white text-emerald-600
                        transition-all hover:border-emerald-200 hover:bg-emerald-50
                        ${collapsed ? "h-10" : "flex-col gap-1.5 px-2 py-3"}
                      `}
                    >
                      <PlusCircle
                        size={19}
                        className="transition-transform group-hover:scale-110"
                      />

                      {!collapsed && (
                        <span className="text-[10px] font-medium text-slate-600">
                          Ticket
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/reports"
                      onClick={() => setOpen(false)}
                      title={collapsed ? "Escalations" : undefined}
                      className={`
                        group flex items-center justify-center
                        rounded-lg border border-amber-100
                        bg-white text-amber-600
                        transition-all hover:border-amber-200 hover:bg-amber-50
                        ${collapsed ? "h-10" : "flex-col gap-1.5 px-2 py-3"}
                      `}
                    >
                      <AlertOctagon
                        size={19}
                        className="transition-transform group-hover:scale-110"
                      />

                      {!collapsed && (
                        <span className="text-[10px] font-medium text-slate-600">
                          Escalations
                        </span>
                      )}
                    </Link>

                    {user.role === "admin" && (
                      <Link
                        href="/settings/user"
                        onClick={() => setOpen(false)}
                        title={collapsed ? "Settings" : undefined}
                        className={`
                          group flex items-center justify-center
                          rounded-lg border border-slate-200
                          bg-white text-slate-600
                          transition-all hover:border-slate-300 hover:bg-slate-100
                          ${collapsed ? "h-10" : "flex-col gap-1.5 px-2 py-3"}
                        `}
                      >
                        <Settings
                          size={19}
                          className="transition-transform duration-300 group-hover:rotate-45"
                        />

                        {!collapsed && (
                          <span className="text-[10px] font-medium text-slate-600">
                            Settings
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* =====================================================
              USER
          ====================================================== */}
          <div className="shrink-0 border-t border-slate-100 p-3">
            <div
              className={`
                rounded-xl border border-slate-200 bg-slate-50
                ${collapsed ? "p-2" : "p-3"}
              `}
            >
              {collapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href="/profile"
                    title="My Profile"
                    className="mb-3 flex items-center gap-3 rounded-xl p-1.5 -m-1.5 transition hover:bg-white"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>

                  <button
                    onClick={logout}
                    title="Logout"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={17} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-3">
                    <Link
                      href="/profile"
                      title="My Profile"
                      className="mb-3 flex items-center gap-3 rounded-xl p-1.5 -m-1.5 transition hover:bg-white"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {user.role === "admin" ? (
                      <span className="badge-danger">Administrator</span>
                    ) : user.role === "actionOwner" ? (
                      <span className="badge-info">Case Owner</span>
                    ) : (
                      <span className="badge-warning">Action Owner</span>
                    )}

                    <button
                      onClick={logout}
                      title="Logout"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={17} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ====================================================== */}
          <div
            className={`
              flex shrink-0 items-center border-t border-slate-100
              ${collapsed ? "justify-center p-3" : "justify-between px-4 py-3"}
            `}
          >
            {!collapsed && (
              <p className="justify-center text-[10px] text-slate-400">
                SolvY360 · GenY Tech © 2026
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
