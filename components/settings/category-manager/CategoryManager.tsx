"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, Search, RefreshCw } from "lucide-react";

interface TicketCategory {
  id: number;
  code: string;
  label: string;
  sla: string;
  priority: string;
}

const priorityOptions = ["Very High", "High", "Medium", "Low", "Very Low"];

const slaUnits = ["Minutes", "Hours", "Days", "Working Days"];

export default function CategoryManager() {
  const [categories, setCategories] = useState<TicketCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");

  // SLA is split in the UI but stored as one string in the DB.
  // Example:
  // slaValue = "24"
  // slaUnit  = "Hours"
  // Database = "24 Hours"
  const [slaValue, setSlaValue] = useState("");
  const [slaUnit, setSlaUnit] = useState("Hours");

  const [priority, setPriority] = useState("Medium");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * PARSE SLA
   * ---------------------------------------------------------
   *
   * Converts the database value:
   *
   * "24 Hours"
   * "7 Working Days"
   * "5 Days"
   *
   * back into the two form fields.
   */

  const parseSla = (value: string) => {
    const trimmed = value.trim();

    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);

    if (!match) {
      return {
        value: trimmed,
        unit: "Hours",
      };
    }

    const [, number, unit] = match;

    const allowedUnit = slaUnits.find(
      (item) => item.toLowerCase() === unit.toLowerCase(),
    );

    return {
      value: number,
      unit: allowedUnit || "Hours",
    };
  };

  /*
   * ---------------------------------------------------------
   * LOAD CATEGORIES
   * ---------------------------------------------------------
   */

  const loadCategories = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/settings/ticket-type-categories", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load categories.");
      }

      if (!Array.isArray(result)) {
        throw new Error("Invalid category data received from server.");
      }

      setCategories(result);
    } catch (error) {
      console.error("Failed to load categories:", error);

      alert(
        error instanceof Error ? error.message : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return categories;
    }

    return categories.filter((item) => {
      return (
        item.code.toLowerCase().includes(searchValue) ||
        item.label.toLowerCase().includes(searchValue) ||
        item.sla.toLowerCase().includes(searchValue) ||
        item.priority.toLowerCase().includes(searchValue)
      );
    });
  }, [categories, search]);

  /*
   * ---------------------------------------------------------
   * RESET FORM
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setLabel("");
    setSlaValue("");
    setSlaUnit("Hours");
    setPriority("Medium");
    setShowForm(false);
  };

  /*
   * ---------------------------------------------------------
   * OPEN ADD FORM
   * ---------------------------------------------------------
   */

  const openAddForm = () => {
    setEditingId(null);
    setCode("");
    setLabel("");
    setSlaValue("");
    setSlaUnit("Hours");
    setPriority("Medium");
    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * OPEN EDIT FORM
   * ---------------------------------------------------------
   */

  const openEditForm = (item: TicketCategory) => {
    setEditingId(item.id);

    setCode(item.code);
    setLabel(item.label);

    const parsedSla = parseSla(item.sla);

    setSlaValue(parsedSla.value);
    setSlaUnit(parsedSla.unit);

    setPriority(item.priority);

    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * SAVE
   * CREATE / UPDATE
   * ---------------------------------------------------------
   */

  const handleSave = async () => {
    const trimmedCode = code.trim().toUpperCase();
    const trimmedLabel = label.trim();
    const trimmedSlaValue = slaValue.trim();

    /*
     * Validation
     */

    if (!trimmedCode) {
      alert("Please enter a category code.");
      return;
    }

    if (!trimmedLabel) {
      alert("Please enter a category label.");
      return;
    }

    if (!trimmedSlaValue) {
      alert("Please enter an SLA value.");
      return;
    }

    if (!/^\d+(\.\d+)?$/.test(trimmedSlaValue)) {
      alert("SLA value must be a valid number.");
      return;
    }

    if (Number(trimmedSlaValue) <= 0) {
      alert("SLA value must be greater than zero.");
      return;
    }

    if (!slaUnits.includes(slaUnit)) {
      alert("Please select a valid SLA unit.");
      return;
    }

    if (!priority) {
      alert("Please select a priority.");
      return;
    }

    /*
     * Combine SLA value + unit.
     *
     * Example:
     *
     * 24 + Hours
     * becomes
     * "24 Hours"
     */

    const combinedSla = `${trimmedSlaValue} ${slaUnit}`;

    try {
      setSaving(true);

      const url = editingId
        ? `/api/settings/ticket-type-categories/${editingId}`
        : "/api/settings/ticket-type-categories";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: trimmedCode,
          label: trimmedLabel,

          // IMPORTANT:
          // Send the combined SLA, not just the numeric value.
          sla: combinedSla,

          priority,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save category.");
      }

      await loadCategories();

      resetForm();
    } catch (error) {
      console.error("Failed to save category:", error);

      alert(
        error instanceof Error ? error.message : "Failed to save category.",
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

  const handleDelete = async (item: TicketCategory) => {
    const confirmed = window.confirm(
      `Delete category "${item.code} - ${item.label}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);

      const response = await fetch(
        `/api/settings/ticket-type-categories/${item.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete category.");
      }

      setCategories((current) =>
        current.filter((category) => category.id !== item.id),
      );

      if (editingId === item.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete category.",
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
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 lg:p-8">
        {/* -------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Category Manager
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage ticket categories, SLA targets and priorities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* REFRESH */}

            <button
              type="button"
              onClick={() => loadCategories(true)}
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
              Add Category
            </button>
          </div>
        </div>

        {/* -------------------------------------------------
            ADD / EDIT FORM
        -------------------------------------------------- */}

        {showForm && (
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
            {/* FORM HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingId ? "Edit Category" : "Add Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the category configuration."
                    : "Add a new ticket category."}
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

            {/* -------------------------------------------------
                FORM FIELDS
            -------------------------------------------------- */}

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* CATEGORY CODE */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Code
                </label>

                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CAT-A"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* LABEL */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Label
                </label>

                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Critical"
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* SLA */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SLA
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {/* SLA VALUE */}

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={slaValue}
                    onChange={(e) => setSlaValue(e.target.value)}
                    placeholder="e.g. 24"
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />

                  {/* SLA UNIT */}

                  <select
                    value={slaUnit}
                    onChange={(e) => setSlaUnit(e.target.value)}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    {slaUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PRIORITY */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  {priorityOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* -------------------------------------------------
                SLA PREVIEW
            -------------------------------------------------- */}

            {slaValue.trim() && (
              <div className="mt-4 text-sm text-slate-500">
                SLA will be stored as{" "}
                <span className="font-semibold text-slate-700">
                  {slaValue.trim()} {slaUnit}
                </span>
              </div>
            )}

            {/* -------------------------------------------------
                BUTTONS
            -------------------------------------------------- */}

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
                  saving || !code.trim() || !label.trim() || !slaValue.trim()
                }
                className="geny-theme-button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Add Category"}
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------
            SEARCH
        -------------------------------------------------- */}

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
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* -------------------------------------------------
            TABLE
        -------------------------------------------------- */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Code
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Label
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SLA
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
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
                        Loading categories...
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  /* EMPTY */

                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="text-sm text-slate-500">
                        {search
                          ? "No categories match your search."
                          : "No categories have been configured yet."}
                      </div>

                      {!search && (
                        <button
                          type="button"
                          onClick={openAddForm}
                          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Add your first category
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  /* DATA */

                  filteredCategories.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* CODE */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          {item.code}
                        </span>
                      </td>

                      {/* LABEL */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                      </td>

                      {/* SLA */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {item.sla}
                        </span>
                      </td>

                      {/* PRIORITY */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {item.priority}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            disabled={deletingId === item.id || saving}
                            title="Edit category"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id || saving}
                            title="Delete category"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
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

        {/* -------------------------------------------------
            COUNT
        -------------------------------------------------- */}

        {!loading && (
          <div className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredCategories.length}
            </span>{" "}
            {filteredCategories.length === 1 ? "category" : "categories"}
          </div>
        )}
      </div>
    </section>
  );
}
