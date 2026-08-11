"use client";

import { useEffect, useState } from "react";
import {
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import Link from "next/link";

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

export default function CustomerManagementTable() {
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

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? customer.active
            : !customer.active;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison =
          new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, mobile or NIC..."
              className="
        w-full
        rounded-xl
        border
        border-slate-200
        bg-white
        py-2.5
        pl-10
        pr-4
        outline-none
        focus:border-blue-500
      "
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-slate-500" />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "createdDate")
                }
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="name">Name</option>
                <option value="createdDate">Created Date</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
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
                ? "text-blue-600 hover:text-blue-700"
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
                    {customer.createdDate}
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
              of <span className="font-medium">{filteredCustomers.length}</span>{" "}
              customers
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
}
