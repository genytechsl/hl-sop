"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  User,
  Building2,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

interface Property {
  propertyName: string;
  address: string;
}

interface Customer {
  id: string;
  name: string;
  email: string[];
  mobile: string[];
  NIC: string;
  active: boolean;
  createdDate: string;
  properties: Property[];
}

export default function CustomerViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  async function loadCustomer() {
    const response = await fetch(`/api/customers/${id}`);
    const data = await response.json();
    setCustomer(data);
    setLoading(false);
  }

  async function saveCustomer() {
    if (!customer) return;

    setSaving(true);

    await fetch("/api/customers", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    });

    setSaving(false);

    alert("Customer updated successfully.");
  }

  if (loading || !customer) {
    return (
      <div className="white-section flex justify-center py-20">
        <LoaderCircle className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader header="Customer Management" page={6} />
      <div className="space-y-6">
        {/* <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back
        </button> */}

        <div className="white-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <User size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">{customer.name}</h2>

              <p className="text-slate-500">{customer.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="font-medium">Customer Name</label>

              <input
                className="mt-2 w-full rounded-xl border p-3"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="font-medium">NIC</label>

              <input
                readOnly
                value={customer.NIC}
                className="mt-2 w-full rounded-xl border bg-slate-100 p-3"
              />
            </div>

            <div>
              <label className="font-medium">Status</label>

              <select
                value={customer.active ? "true" : "false"}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    active: e.target.value === "true",
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="true">ACTIVE</option>
                <option value="false">INACTIVE</option>
              </select>
            </div>

            <div>
              <label className="font-medium">Created Date</label>

              <input
                readOnly
                value={customer.createdDate}
                className="mt-2 w-full rounded-xl border bg-slate-100 p-3"
              />
            </div>
          </div>
        </div>

        <div className="white-section">
          <div className="flex items-center gap-2 mb-5">
            <Mail size={20} />
            <h3 className="text-lg font-semibold">Email Addresses</h3>
          </div>

          {customer.email.map((email, index) => (
            <input
              key={index}
              className="mb-3 w-full rounded-xl border p-3"
              value={email}
              onChange={(e) => {
                const emails = [...customer.email];
                emails[index] = e.target.value;

                setCustomer({
                  ...customer,
                  email: emails,
                });
              }}
            />
          ))}
        </div>

        <div className="white-section">
          <div className="flex items-center gap-2 mb-5">
            <Phone size={20} />
            <h3 className="text-lg font-semibold">Mobile Numbers</h3>
          </div>

          {customer.mobile.map((mobile, index) => (
            <input
              key={index}
              className="mb-3 w-full rounded-xl border p-3"
              value={mobile}
              onChange={(e) => {
                const numbers = [...customer.mobile];
                numbers[index] = e.target.value;

                setCustomer({
                  ...customer,
                  mobile: numbers,
                });
              }}
            />
          ))}
        </div>

        <div className="white-section">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={20} />
            <h3 className="text-lg font-semibold">Properties</h3>
          </div>

          {customer.properties.map((property, index) => (
            <div key={index} className="mb-6 rounded-xl border p-5">
              <input
                className="mb-3 w-full rounded-xl border p-3"
                placeholder="Property Name"
                value={property.propertyName}
                onChange={(e) => {
                  const properties = [...customer.properties];

                  properties[index].propertyName = e.target.value;

                  setCustomer({
                    ...customer,
                    properties,
                  });
                }}
              />

              <textarea
                rows={3}
                className="w-full rounded-xl border p-3"
                placeholder="Address"
                value={property.address}
                onChange={(e) => {
                  const properties = [...customer.properties];

                  properties[index].address = e.target.value;

                  setCustomer({
                    ...customer,
                    properties,
                  });
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveCustomer}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            {saving ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
}
