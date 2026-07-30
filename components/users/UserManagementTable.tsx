"use client";

import { useEffect, useState } from "react";
import {
  Save,
  UserCog,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [savingId, setSavingId] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

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

      <div className="flex items-center gap-3 mb-6">
        {/* <div
          className="
          rounded-xl
          bg-blue-50
          p-3
          text-blue-600
        "
        >
          <UserCog size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            User Role Management
          </h2>

          <p className="text-sm text-slate-500">
            Manage employee access permissions
          </p>
        </div> */}
      </div>

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
            {users.map((user, index) => (
              <tr
                key={user.id}
                className="
                border-b
                border-slate-100
                hover:bg-slate-50
                transition
              "
              >
                <td className="px-4 py-4">{index + 1}</td>

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
    </div>
  );
}
