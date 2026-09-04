"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import {
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CustomerManagementTableRef {
  exportPdf: () => void;
  exportCsv: () => void;
}

interface Property {
  propertyName: string;
  address: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  NIC: string;
  active: boolean;
  createdDate: string;
  properties: Property[];
}

type PageItem = number | "ellipsis";

const CustomerManagementTable = forwardRef<CustomerManagementTableRef>(
  function CustomerManagementTable(_, ref) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // PAGINATION
    // =========================================================

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // =========================================================
    // SEARCH / SORT / FILTER
    // =========================================================

    const [search, setSearch] = useState("");

    const [sortBy, setSortBy] = useState<"name" | "createdDate">("name");

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [showInactive, setShowInactive] = useState(false);

    // =========================================================
    // MESSAGE
    // =========================================================

    const [message, setMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

    // =========================================================
    // FILTERED + SORTED CUSTOMERS
    // =========================================================

    const filteredCustomers = useMemo(() => {
      return customers
        .filter((customer) => {
          const keyword = search.trim().toLowerCase();

          const matchesSearch =
            customer.name.toLowerCase().includes(keyword) ||
            customer.NIC.toLowerCase().includes(keyword) ||
            customer.email.toLowerCase().includes(keyword) ||
            customer.mobile.toLowerCase().includes(keyword);

          // Hide inactive customers by default.
          const matchesInactive = showInactive || customer.active;

          return matchesSearch && matchesInactive;
        })
        .sort((a, b) => {
          let comparison = 0;

          if (sortBy === "name") {
            comparison = a.name.localeCompare(b.name);
          } else {
            comparison =
              new Date(a.createdDate).getTime() -
              new Date(b.createdDate).getTime();
          }

          return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [customers, search, sortBy, sortOrder, showInactive]);

    // =========================================================
    // PAGINATION DATA
    // =========================================================

    const totalPages = Math.max(
      Math.ceil(filteredCustomers.length / itemsPerPage),
      1,
    );

    const paginatedCustomers = filteredCustomers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );

    const startResult =
      filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

    const endResult = Math.min(
      currentPage * itemsPerPage,
      filteredCustomers.length,
    );

    // =========================================================
    // TRUNCATED PAGE NUMBERS
    // =========================================================

    const pageItems = useMemo<PageItem[]>(() => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
      }

      if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "ellipsis", totalPages];
      }

      if (currentPage >= totalPages - 3) {
        return [
          1,
          "ellipsis",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      }

      return [
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages,
      ];
    }, [currentPage, totalPages]);

    // =========================================================
    // KEEP CURRENT PAGE VALID
    // =========================================================

    useEffect(() => {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [currentPage, totalPages]);

    // =========================================================
    // EXPORT
    // =========================================================

    useImperativeHandle(ref, () => ({
      exportCsv() {
        const maxProperties = filteredCustomers.reduce(
          (max, customer) => Math.max(max, customer.properties.length),
          0,
        );

        const headers = [
          "No.",
          "Customer ID",
          "Name",
          "NIC",
          "Email",
          "Mobile",
        ];

        for (let i = 1; i <= maxProperties; i++) {
          headers.push(`Property ${i} Name`);

          headers.push(`Property ${i} Address`);
        }

        headers.push("Status");
        headers.push("Created");

        const rows = filteredCustomers.map((customer, index) => {
          const row: (string | number)[] = [
            index + 1,
            customer.id,
            customer.name,
            customer.NIC,
            customer.email,
            customer.mobile,
          ];

          for (let i = 0; i < maxProperties; i++) {
            const property = customer.properties[i];

            row.push(property?.propertyName ?? "");

            row.push(property?.address ?? "");
          }

          row.push(customer.active ? "ACTIVE" : "INACTIVE");

          row.push(
            new Date(customer.createdDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          );

          return row;
        });

        const csvContent = [headers, ...rows]
          .map((row) =>
            row
              .map((value) => {
                const stringValue = String(value ?? "");

                return `"${stringValue.replace(/"/g, '""')}"`;
              })
              .join(","),
          )
          .join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `customers-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      },

      exportPdf() {
        const doc = new jsPDF("landscape");

        const maxProperties = filteredCustomers.reduce(
          (max, customer) => Math.max(max, customer.properties.length),
          0,
        );

        const headers = [
          "No.",
          "Customer ID",
          "Name",
          "NIC",
          "Email",
          "Mobile",
        ];

        for (let i = 1; i <= maxProperties; i++) {
          headers.push(`Property ${i} Name`);

          headers.push(`Property ${i} Address`);
        }

        headers.push("Status");
        headers.push("Created");

        doc.setFontSize(18);

        doc.text("Customer Management Report", 14, 15);

        doc.setFontSize(10);

        doc.text(
          `Generated: ${new Date().toLocaleDateString("en-GB")}`,
          14,
          22,
        );

        doc.text(`Customers: ${filteredCustomers.length}`, 14, 27);

        const body = filteredCustomers.map((customer, index) => {
          const row: (string | number)[] = [
            index + 1,
            customer.id,
            customer.name,
            customer.NIC,
            customer.email,
            customer.mobile,
          ];

          for (let i = 0; i < maxProperties; i++) {
            const property = customer.properties[i];

            row.push(property?.propertyName ?? "");

            row.push(property?.address ?? "");
          }

          row.push(customer.active ? "ACTIVE" : "INACTIVE");

          row.push(
            new Date(customer.createdDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          );

          return row;
        });

        autoTable(doc, {
          startY: 32,

          head: [headers],

          body,

          styles: {
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            valign: "middle",
          },

          headStyles: {
            fontStyle: "bold",
          },

          columnStyles: {
            0: {
              cellWidth: 10,
            },

            1: {
              cellWidth: 22,
            },

            2: {
              cellWidth: 28,
            },

            3: {
              cellWidth: 22,
            },

            4: {
              cellWidth: 35,
            },

            5: {
              cellWidth: 25,
            },
          },

          didParseCell(data) {
            if (data.section === "body" || data.section === "head") {
              const propertyStartIndex = 6;

              const propertyEndIndex = propertyStartIndex + maxProperties * 2;

              if (
                data.column.index >= propertyStartIndex &&
                data.column.index < propertyEndIndex
              ) {
                data.cell.styles.cellWidth = 35;
              }
            }
          },
        });

        doc.save(`customers-${new Date().toISOString().slice(0, 10)}.pdf`);
      },
    }));

    // =========================================================
    // LOAD CUSTOMERS
    // =========================================================

    useEffect(() => {
      loadCustomers();
    }, []);

    async function loadCustomers() {
      try {
        setLoading(true);

        const response = await fetch("/api/customers");

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const data = await response.json();

        setCustomers(data);
      } catch (error) {
        console.error("Failed to load customers:", error);

        setMessage({
          type: "error",
          text: "Failed to load customers",
        });
      } finally {
        setLoading(false);
      }
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
      return (
        <div className="white-section flex justify-center py-20">
          <LoaderCircle className="animate-spin text-blue-600" size={30} />
        </div>
      );
    }

    return (
      <>
        <div className="white-section mt-6">
          {/* =================================================
                MESSAGE
            ================================================== */}

          {message && (
            <div
              className={`mb-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}

              {message.text}
            </div>
          )}

          {/* =================================================
                FILTERS
            ================================================== */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search */}

              <div className="relative w-full md:w-96">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);

                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, mobile, NIC or email..."
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

              {/* Right-side filters */}

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort */}

                <div className="relative">
                  <ArrowUpDown
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value as "name" | "createdDate");

                      setCurrentPage(1);
                    }}
                    className="
                        h-11
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-9
                        pr-8
                        text-sm
                        text-slate-700
                        focus:border-blue-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500/20
                      "
                  >
                    <option value="name">Sort by Name</option>

                    <option value="createdDate">Created Date</option>
                  </select>
                </div>

                {/* Sort Order */}

                <div className="relative">
                  <ArrowUpDown
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={sortOrder}
                    onChange={(event) => {
                      setSortOrder(event.target.value as "asc" | "desc");

                      setCurrentPage(1);
                    }}
                    className="
                        h-11
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        pl-9
                        pr-8
                        text-sm
                        text-slate-700
                        focus:border-blue-500
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500/20
                      "
                  >
                    <option value="asc">Ascending</option>

                    <option value="desc">Descending</option>
                  </select>
                </div>

                {/* Show inactive */}

                <label
                  className="
                      flex
                      h-11
                      cursor-pointer
                      items-center
                      gap-2.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3.5
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      hover:border-slate-300
                      hover:bg-slate-50
                    "
                >
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(event) => {
                      setShowInactive(event.target.checked);

                      setCurrentPage(1);
                    }}
                    className="
                        h-4
                        w-4
                        rounded
                        border-slate-300
                        text-blue-600
                        focus:ring-blue-500
                      "
                  />

                  <span>Show inactive customers</span>
                </label>
              </div>
            </div>
          </div>

          {/* =================================================
                TABLE
            ================================================== */}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      #
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Customer ID
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Name
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Primary Email
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Primary Mobile
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Properties
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Created
                    </th>

                    <th className="px-4 py-4 text-left font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-14 text-center">
                        <p className="text-sm font-medium text-slate-700">
                          No customers found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or filters.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className={`
                              border-b
                              border-slate-100
                              transition
                              ${
                                customer.active
                                  ? "hover:bg-slate-50"
                                  : "bg-slate-50/70 text-slate-400"
                              }
                            `}
                      >
                        <td className="px-4 py-2">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>

                        <td className="px-4 py-2">
                          <Link
                            href={`/settings/customers/view?id=${customer.id}`}
                            className={`
                                  font-semibold
                                  hover:underline
                                  ${
                                    customer.active
                                      ? "text-emerald-600 transition hover:text-emerald-700"
                                      : "text-slate-500"
                                  }
                                `}
                          >
                            {customer.id}
                          </Link>
                        </td>

                        <td className="px-4 py-2">
                          <div className="font-semibold text-slate-800">
                            {customer.name}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {customer.NIC}
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="font-medium text-slate-700">
                            {customer.email}
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="font-medium text-slate-700">
                            {customer.mobile}
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {customer.properties.length}{" "}
                            {customer.properties.length === 1
                              ? "Property"
                              : "Properties"}
                          </span>
                        </td>

                        <td className="px-4 py-2">
                          <span
                            className={`
                                  inline-flex
                                  rounded-full
                                  px-3
                                  py-1
                                  text-xs
                                  font-semibold
                                  ${
                                    customer.active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-200 text-slate-500"
                                  }
                                `}
                          >
                            {customer.active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                          {new Date(customer.createdDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>

                        <td className="px-4 py-2">
                          <Link
                            href={`/settings/customers/view?id=${customer.id}`}
                            className="
                                  inline-flex
                                  items-center
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-white
                                  px-4
                                  py-2
                                  text-sm
                                  font-medium
                                  text-slate-700
                                  transition
                                  hover:border-blue-200
                                  hover:bg-blue-50
                                  hover:text-blue-700
                                "
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                  PAGINATION
              ================================================== */}

            <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Results / rows per page */}

              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {startResult}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-700">
                    {endResult}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {filteredCustomers.length}
                  </span>{" "}
                  customers
                </p>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="customerRowsPerPage"
                    className="text-sm text-slate-500"
                  >
                    Rows per page
                  </label>

                  <select
                    id="customerRowsPerPage"
                    value={itemsPerPage}
                    onChange={(event) => {
                      setItemsPerPage(Number(event.target.value));

                      setCurrentPage(1);
                    }}
                    className="
                        h-9
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        text-sm
                        font-medium
                        text-slate-700
                        outline-none
                        transition
                        hover:border-slate-300
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-500/20
                      "
                  >
                    <option value={10}>10</option>

                    <option value={25}>25</option>

                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Pagination controls */}

              <div className="flex items-center gap-1 self-end lg:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                  className="
                      inline-flex
                      h-9
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                >
                  <ChevronLeft size={16} />
                  Back
                </button>

                <div className="mx-1 flex items-center gap-1">
                  {pageItems.map((item, index) => {
                    if (item === "ellipsis") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }

                    const active = item === currentPage;

                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        aria-current={active ? "page" : undefined}
                        className={`
                              flex
                              h-9
                              min-w-9
                              items-center
                              justify-center
                              rounded-lg
                              px-2
                              text-sm
                              font-medium
                              transition
                              ${
                                active
                                  ? "bg-[#14b8a6] text-white"
                                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }
                            `}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="
                      inline-flex
                      h-9
                      items-center
                      gap-1
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default CustomerManagementTable;
