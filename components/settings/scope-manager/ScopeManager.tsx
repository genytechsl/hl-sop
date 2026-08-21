"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X, Search, RefreshCw } from "lucide-react";

interface TicketTypeScope {
  id: number;
  ticketType: string;
  scope: string;
}

interface TicketTypeOption {
  value: string;
  label: string;
}

/*
 * These are the system's existing ticket types.
 *
 * We are NOT making ticket types CRUD for now.
 * Only scopes are administrator-configurable.
 */
const ticketTypes: TicketTypeOption[] = [
  {
    value: "INQ",
    label: "Inquiry",
  },
  {
    value: "COM",
    label: "Complaint",
  },
];

export default function ScopeManager() {
  const [scopes, setScopes] = useState<TicketTypeScope[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [ticketType, setTicketType] = useState("INQ");
  const [scope, setScope] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /*
   * ---------------------------------------------------------
   * LOAD SCOPES
   * ---------------------------------------------------------
   */

  const loadScopes = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/settings/ticket-type-scopes", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load scopes.");
      }

      setScopes(result);
    } catch (error) {
      console.error("Failed to load scopes:", error);

      alert(error instanceof Error ? error.message : "Failed to load scopes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScopes();
  }, []);

  /*
   * ---------------------------------------------------------
   * TICKET TYPE LABEL
   * ---------------------------------------------------------
   */

  const getTicketTypeLabel = (value: string) => {
    const type = ticketTypes.find((item) => item.value === value);

    return type?.label || value;
  };

  /*
   * ---------------------------------------------------------
   * FILTER
   * ---------------------------------------------------------
   */

  const filteredScopes = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return scopes;
    }

    return scopes.filter((item) => {
      return (
        item.scope.toLowerCase().includes(searchValue) ||
        item.ticketType.toLowerCase().includes(searchValue) ||
        getTicketTypeLabel(item.ticketType).toLowerCase().includes(searchValue)
      );
    });
  }, [scopes, search]);

  /*
   * ---------------------------------------------------------
   * RESET FORM
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setEditingId(null);
    setTicketType("INQ");
    setScope("");
    setShowForm(false);
  };

  /*
   * ---------------------------------------------------------
   * OPEN ADD FORM
   * ---------------------------------------------------------
   */

  const openAddForm = () => {
    setEditingId(null);
    setTicketType("INQ");
    setScope("");
    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * OPEN EDIT FORM
   * ---------------------------------------------------------
   */

  const openEditForm = (item: TicketTypeScope) => {
    setEditingId(item.id);
    setTicketType(item.ticketType);
    setScope(item.scope);
    setShowForm(true);
  };

  /*
   * ---------------------------------------------------------
   * SAVE
   * CREATE / UPDATE
   * ---------------------------------------------------------
   */

  const handleSave = async () => {
    const trimmedScope = scope.trim();

    if (!ticketType) {
      alert("Please select a ticket type.");
      return;
    }

    if (!trimmedScope) {
      alert("Please enter a scope.");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `/api/settings/ticket-type-scopes/${editingId}`
        : "/api/settings/ticket-type-scopes";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketType,
          scope: trimmedScope,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save scope.");
      }

      /*
       * Reload the table so the UI always reflects
       * the database.
       */
      await loadScopes();

      resetForm();
    } catch (error) {
      console.error("Failed to save scope:", error);

      alert(error instanceof Error ? error.message : "Failed to save scope.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  const handleDelete = async (item: TicketTypeScope) => {
    const confirmed = window.confirm(
      `Delete "${item.scope}" from ${getTicketTypeLabel(item.ticketType)}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(item.id);

      const response = await fetch(
        `/api/settings/ticket-type-scopes/${item.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete scope.");
      }

      /*
       * Remove immediately from UI.
       */
      setScopes((current) => current.filter((scope) => scope.id !== item.id));

      /*
       * If the deleted item was being edited,
       * close the form.
       */
      if (editingId === item.id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete scope:", error);

      alert(error instanceof Error ? error.message : "Failed to delete scope.");
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
      {/* Top accent */}
      {/* <div className="h-1.5 bg-blue-600" /> */}

      <div className="p-6 lg:p-8">
        {/* -------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Scope Manager</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the scopes available for each ticket type.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadScopes(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="geny-theme-button"
            >
              <Plus size={18} />
              Add Scope
            </button>
          </div>
        </div>

        {/* -------------------------------------------------
            ADD / EDIT FORM
        -------------------------------------------------- */}

        {showForm && (
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingId ? "Edit Scope" : "Add Scope"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the ticket type or scope."
                    : "Add a new scope to a ticket type."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Ticket Type */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ticket Type
                </label>

                <select
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {ticketTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scope */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Scope
                </label>

                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (!saving) {
                        handleSave();
                      }
                    }
                  }}
                  placeholder="Enter scope name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Form buttons */}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !scope.trim()}
                className="geny-theme-button"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Scope"
                    : "Add Scope"}
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
              placeholder="Search scopes..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* -------------------------------------------------
            TABLE
        -------------------------------------------------- */}

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ticket Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Scope
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <RefreshCw size={17} className="animate-spin" />
                        Loading scopes...
                      </div>
                    </td>
                  </tr>
                ) : filteredScopes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center">
                      <div className="text-sm text-slate-500">
                        {search
                          ? "No scopes match your search."
                          : "No scopes have been configured yet."}
                      </div>

                      {!search && (
                        <button
                          type="button"
                          onClick={openAddForm}
                          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Add your first scope
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredScopes.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      {/* Ticket Type */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${
                            item.ticketType === "COM"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {getTicketTypeLabel(item.ticketType)}
                        </span>
                      </td>

                      {/* Scope */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {item.scope}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            disabled={deletingId === item.id}
                            title="Edit scope"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={deletingId === item.id}
                            title="Delete scope"
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
            FOOTER COUNT
        -------------------------------------------------- */}

        {!loading && (
          <div className="mt-4 text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredScopes.length}
            </span>{" "}
            {filteredScopes.length === 1 ? "scope" : "scopes"}
          </div>
        )}
      </div>
    </section>
  );
}
