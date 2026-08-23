"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  X,
  Search,
  RefreshCw,
  Building2,
  Mail,
  User,
} from "lucide-react";

interface Department {
  id: number;
  name: string;
  head: string;
  email: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [head, setHead] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * LOAD DEPARTMENTS
   * ---------------------------------------------------------
   */

  const loadDepartments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/settings/departments", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load departments.");
      }

      if (!Array.isArray(result)) {
        throw new Error("Invalid department data received from server.");
      }

      setDepartments(result);
    } catch (error) {
      console.error("Failed to load departments:", error);

      alert(
        error instanceof Error ? error.message : "Failed to load departments.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  const filteredDepartments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return departments;
    }

    return departments.filter((department) => {
      return (
        department.name.toLowerCase().includes(searchValue) ||
        department.head.toLowerCase().includes(searchValue) ||
        department.email.toLowerCase().includes(searchValue) ||
        (department.description || "").toLowerCase().includes(searchValue)
      );
    });
  }, [departments, search]);

  /*
   * ---------------------------------------------------------
   * RESET FORM
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setHead("");
    setEmail("");
    setDescription("");
    setShowForm(false);
  };

  /*
   * ---------------------------------------------------------
   * OPEN ADD FORM
   * ---------------------------------------------------------
   */

  const openAddForm = () => {
    setEditingId(null);
    setName("");
    setHead("");
    setEmail("");
    setDescription("");
    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * OPEN EDIT FORM
   * ---------------------------------------------------------
   */

  const openEditForm = (department: Department) => {
    setEditingId(department.id);

    setName(department.name);
    setHead(department.head);
    setEmail(department.email);
    setDescription(department.description || "");

    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * SAVE
   * CREATE / UPDATE
   * ---------------------------------------------------------
   */

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedHead = head.trim();
    const trimmedEmail = email.trim();
    const trimmedDescription = description.trim();

    /*
     * Validation
     */

    if (!trimmedName) {
      alert("Please enter a department name.");
      return;
    }

    if (!trimmedHead) {
      alert("Please enter the department head.");
      return;
    }

    if (!trimmedEmail) {
      alert("Please enter the department email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `/api/settings/departments/${editingId}`
        : "/api/settings/departments";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          head: trimmedHead,
          email: trimmedEmail,
          description: trimmedDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save department.");
      }

      await loadDepartments();

      resetForm();
    } catch (error) {
      console.error("Failed to save department:", error);

      alert(
        error instanceof Error ? error.message : "Failed to save department.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const handleDelete = async (department: Department) => {
    const confirmed = window.confirm(`Delete department "${department.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(department.id);

      const response = await fetch(
        `/api/settings/departments/${department.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete department.");
      }

      setDepartments((current) =>
        current.filter((item) => item.id !== department.id),
      );

      if (editingId === department.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete department:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete department.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 lg:p-8">
        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Department Manager
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage departments, department heads and contact information.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadDepartments(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {/* ADD */}

            <button
              type="button"
              onClick={openAddForm}
              disabled={saving}
              className="geny-theme-button"
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>
        </div>

        {/* ADD / EDIT FORM */}

        {showForm && (
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
            {/* FORM HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingId ? "Edit Department" : "Add Department"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the department information."
                    : "Add a new department."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM FIELDS */}

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <div className="relative">
                  <Building2
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Customer Service"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* HEAD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department Head
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    placeholder="e.g. John Smith"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. support@example.com"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={1}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the department..."
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-5 flex justify-end gap-3">
              {/* CANCEL */}

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving || !name.trim() || !head.trim() || !email.trim()
                }
                className="geny-theme-button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Department"
                    : "Add Department"}
              </button>
            </div>
          </div>
        )}

        {/* SEARCH */}

        <div className="mt-7">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Head
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <RefreshCw size={17} className="animate-spin" />
                        Loading departments...
                      </div>
                    </td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  /* EMPTY */

                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="text-sm text-slate-500">
                        {search
                          ? "No departments match your search."
                          : "No departments have been configured yet."}
                      </div>

                      {!search && (
                        <button
                          type="button"
                          onClick={openAddForm}
                          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Add your first department
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  /* DATA */

                  filteredDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* NAME */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Building2 size={17} />
                          </div>

                          <span className="text-sm font-semibold text-slate-700">
                            {department.name}
                          </span>
                        </div>
                      </td>

                      {/* HEAD */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {department.head}
                        </span>
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {department.email}
                        </span>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-sm px-5 py-4">
                        <span className="line-clamp-2 text-sm text-slate-500">
                          {department.description || "—"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => openEditForm(department)}
                            disabled={deletingId === department.id || saving}
                            title="Edit department"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() => handleDelete(department)}
                            disabled={deletingId === department.id || saving}
                            title="Delete department"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === department.id ? (
                              <RefreshCw size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COUNT */}

        {!loading && (
          <div className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredDepartments.length}
            </span>{" "}
            {filteredDepartments.length === 1 ? "department" : "departments"}
          </div>
        )}
      </div>
    </section>
  );
}
