"use client";

import { useEffect, useState } from "react";
import {
  Save,
  UserCog,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Filter,
  Search,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  designation: string;
  email: string;
  active: boolean;
  role: string;
  username: string;
}

const roles = ["admin", "manager", "actionOwner", "viewer"];

export default function UserManagementTable() {
  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const roleLabels = {
    admin: "Administrator",
    manager: "Manager",
    actionOwner: "Action Owner",
    viewer: "Viewer",
  };

  const filteredUsers = users
    .filter((user) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? user.active
            : !user.active;

      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "id":
          return a.id.localeCompare(b.id);

        case "role":
          return a.role.localeCompare(b.role);

        case "status":
          return Number(b.active) - Number(a.active);

        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter, sortBy]);

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await fetch("/api/users");

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateRole(id: string, role: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              role,
            }
          : user,
      ),
    );
  }

  async function saveRole(user: User) {
    try {
      setSavingId(user.id);

      setMessage(null);

      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          role: user.role,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setMessage({
        type: "success",
        text: `${user.name} role updated`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update role",
      });
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="white-section flex items-center justify-center py-20">
        <LoaderCircle className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  return (
    <div className="white-section">
      {/* Header */}

      <div className="flex items-center gap-3 mb-6"></div>

      {message && (
        <div
          className={`
              mb-5
              flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-3
              text-sm

              ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }
            `}
        >
          {message.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}

          {message.text}
        </div>
      )}

      <div
        className="
        overflow-x-auto
      "
      >
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className=" flex flex-wrap items-center justify-between gap-3">
            {/* Left */}
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee ID, username or email..."
                className="
        h-11
        w-full
        rounded-xl
        border
        border-slate-200
        bg-white
        pl-11
        pr-4
        text-sm
        placeholder:text-slate-400
        focus:border-blue-500
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500/20
      "
              />
            </div>

            {/* Right */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status */}

              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
          h-11
          rounded-xl
          border
          border-slate-200
          bg-white
          pl-9
          pr-8
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/20
        "
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Role */}

              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="
          h-11
          rounded-xl
          border
          border-slate-200
          bg-white
          pl-9
          pr-8
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/20
        "
                >
                  <option value="all">All Roles</option>

                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role as keyof typeof roleLabels]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}

              <div className="relative">
                <ArrowUpDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="
                      h-11
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      pl-9
                      pr-8
                      text-sm
                      focus:outline-none
                      focus:ring-2
                      focus:ring-blue-500/20
                    "
                >
                  <option value="name">Sort by Name</option>
                  <option value="id">Employee ID</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <table
          className="
        w-full
        min-w-[1000px]
        text-sm
      "
        >
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-4 text-left">#</th>
              <th className="px-4 py-4 text-left">Employee ID</th>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left">Designation</th>
              <th className="px-4 py-4 text-left">Email</th>
              <th className="px-4 py-4 text-left">Status</th>
              <th className="px-4 py-4 text-left">Role</th>
              <th className="px-4 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.id}
                className="
                border-b
                border-slate-100
                hover:bg-slate-50
                transition
              "
              >
                <td className="px-4 py-4">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>

                <td
                  className="
                px-4
                py-4
                font-medium
                text-slate-700
              "
                >
                  {user.id}
                </td>

                <td className="px-4 py-4">
                  <div className="font-medium">{user.name}</div>

                  <div className="text-xs text-slate-400">@{user.username}</div>
                </td>

                <td className="px-4 py-4">{user.designation}</td>

                <td className="px-4 py-4">{user.email}</td>

                <td className="px-4 py-4">
                  <span
                    className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold

                    ${
                      user.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                  >
                    {user.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="
                    rounded-xl
                    border
                    border-slate-200
                    px-3
                    py-2
                    bg-white
                    font-medium
                    focus:ring-2
                    focus:ring-blue-500
                    outline-none
                  "
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-4">
                  <button
                    onClick={() => saveRole(user)}
                    disabled={savingId === user.id}
                    className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-4
                    py-2
                    text-white
                    font-medium
                    hover:bg-blue-700
                    disabled:opacity-50
                    transition
                  "
                  >
                    {savingId === user.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
        <div className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium">
            {filteredUsers.length === 0
              ? 0
              : (currentPage - 1) * ITEMS_PER_PAGE + 1}
          </span>{" "}
          -
          <span className="font-medium">
            {" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
          </span>{" "}
          of <span className="font-medium">{filteredUsers.length}</span> users
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-sm
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`
                h-9
                w-9
                rounded-lg
                text-sm
                font-medium
                transition

                ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-sm
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
