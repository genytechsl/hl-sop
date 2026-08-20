"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowUpDown,
  Filter,
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

const CustomerManagementTable = forwardRef<CustomerManagementTableRef>(
  function CustomerManagementTable(_, ref) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    // Pagination Setup
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    //search setup
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "createdDate">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [statusFilter, setStatusFilter] = useState<
      "all" | "active" | "inactive"
    >("all");
    const [showInactive, setShowInactive] = useState(false);

    // const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
    // const paginatedCustomers = customers.slice(
    //   (currentPage - 1) * ITEMS_PER_PAGE,
    //   currentPage * ITEMS_PER_PAGE,
    // );

    const filteredCustomers = customers
      .filter((customer) => {
        const keyword = search.toLowerCase();

        const matchesSearch =
          customer.name.toLowerCase().includes(keyword) ||
          customer.NIC.toLowerCase().includes(keyword) ||
          customer.email.toLowerCase().includes(keyword) ||
          customer.mobile.toLowerCase().includes(keyword);

        // Hide inactive customers by default
        const matchesInactive = showInactive || customer.active;

        const matchesStatus =
          statusFilter === "all"
            ? true
            : statusFilter === "active"
              ? customer.active
              : !customer.active;

        return matchesSearch && matchesStatus && matchesInactive;
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

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    const paginatedCustomers = filteredCustomers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    useImperativeHandle(ref, () => ({
      exportCsv() {
        /*
         * Find the maximum number of properties belonging
         * to any customer in the currently filtered result.
         */
        const maxProperties = filteredCustomers.reduce(
          (max, customer) => Math.max(max, customer.properties.length),
          0,
        );

        /*
         * Build the fixed customer columns.
         */
        const headers = [
          "No.",
          "Customer ID",
          "Name",
          "NIC",
          "Email",
          "Mobile",
        ];

        /*
         * Dynamically add:
         * Property 1 Name
         * Property 1 Address
         * Property 2 Name
         * Property 2 Address
         * etc.
         */
        for (let i = 1; i <= maxProperties; i++) {
          headers.push(`Property ${i} Name`);
          headers.push(`Property ${i} Address`);
        }

        headers.push("Status");
        headers.push("Created");

        /*
         * Build the export rows.
         */
        const rows = filteredCustomers.map((customer, index) => {
          const row: (string | number)[] = [
            index + 1,
            customer.id,
            customer.name,
            customer.NIC,
            customer.email,
            customer.mobile,
          ];

          /*
           * Add property data.
           *
           * If a customer does not have that many properties,
           * empty values are inserted so the columns remain aligned.
           */
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

        /*
         * Find the maximum number of properties in the
         * currently filtered customers.
         */
        const maxProperties = filteredCustomers.reduce(
          (max, customer) => Math.max(max, customer.properties.length),
          0,
        );

        /*
         * Fixed columns.
         */
        const headers = [
          "No.",
          "Customer ID",
          "Name",
          "NIC",
          "Email",
          "Mobile",
        ];

        /*
         * Dynamic property columns.
         */
        for (let i = 1; i <= maxProperties; i++) {
          headers.push(`Property ${i} Name`);
          headers.push(`Property ${i} Address`);
        }

        headers.push("Status");
        headers.push("Created");

        /*
         * Report heading.
         */
        doc.setFontSize(18);
        doc.text("Customer Management Report", 14, 15);

        doc.setFontSize(10);
        doc.text(
          `Generated: ${new Date().toLocaleDateString("en-GB")}`,
          14,
          22,
        );

        /*
         * Add a small summary.
         */
        doc.text(`Customers: ${filteredCustomers.length}`, 14, 27);

        /*
         * Build PDF rows.
         */
        const body = filteredCustomers.map((customer, index) => {
          const row: (string | number)[] = [
            index + 1,
            customer.id,
            customer.name,
            customer.NIC,
            customer.email,
            customer.mobile,
          ];

          /*
           * Add property name/address pairs.
           */
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
            /*
             * Give property columns a reasonable width.
             */
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

    const [message, setMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);

    useEffect(() => {
      loadCustomers();
    }, []);

    async function loadCustomers() {
      try {
        setLoading(true);
        const response = await fetch("/api/customers");
        const data = await response.json();
        setCustomers(data);
      } catch {
        setMessage({
          type: "error",
          text: "Failed to load customers",
        });
      } finally {
        setLoading(false);
      }
    }

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
          <div className="flex items-center gap-3 mb-6">
            {/* <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Users size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Customer Management
            </h2>

            <p className="text-sm text-slate-500">
              Update customer information
            </p>
          </div> */}
          </div>

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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, mobile or NIC..."
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
                    onChange={(e) => {
                      setSortBy(e.target.value as "name" | "createdDate");
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
                    onChange={(e) => {
                      setSortOrder(e.target.value as "asc" | "desc");
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
                    onChange={(e) => {
                      setShowInactive(e.target.checked);
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
          <div className="overflow-x-auto">
            <table className="min-w-[1500px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-4 text-left">#</th>
                  <th className="px-4 py-4 text-left">Customer ID</th>
                  <th className="px-4 py-4 text-left">Name</th>
                  <th className="px-4 py-4 text-left">Email</th>
                  <th className="px-4 py-4 text-left">Mobile</th>
                  <th className="px-4 py-4 text-left">Properties</th>
                  <th className="px-4 py-4 text-left">Status</th>
                  <th className="px-4 py-4 text-left">Created</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCustomers.map((customer, index) => (
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
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
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

                    <td className="px-4 py-2 whitespace-nowrap text-slate-500">
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
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium">
                  {filteredCustomers.length === 0
                    ? 0
                    : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>
                -
                <span className="font-medium">
                  {" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredCustomers.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredCustomers.length}</span>{" "}
                customers
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
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
                  disabled={currentPage === totalPages}
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
        </div>
      </>
    );
  },
);

export default CustomerManagementTable;
