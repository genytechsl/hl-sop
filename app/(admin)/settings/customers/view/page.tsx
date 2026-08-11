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
import Toast from "@/components/BottomRIghtToast";
import DashboardHeader from "@/components/DashboardHeader";

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
  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });
  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 7000);

    return () => clearTimeout(timer);
  }, [toast.open]);

  function isRequiredFieldsValid(): boolean {
    if (!customer) return false;

    if (
      customer.name.trim() === "" ||
      customer.email.trim() === "" ||
      customer.mobile.trim() === "" ||
      customer.NIC.trim() === ""
    ) {
      setToast({
        open: true,
        type: "warning",
        title: "Missing Information",
        message: "Please complete all required fields.",
      });

      return false;
    }

    return true;
  }

  function isEmail(): boolean {
    if (!customer) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(customer.email.trim())) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid Email",
        message: "Please enter a valid email address.",
      });

      return false;
    }

    return true;
  }

  function isMobileValid(): boolean {
    if (!customer) return false;

    const regex = /^0\d{9}$/;

    if (!regex.test(customer.mobile.trim())) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid Mobile Number",
        message: "Please enter a valid Sri Lankan mobile number.",
      });

      return false;
    }

    return true;
  }

  function isProperty(): boolean {
    if (!customer) return false;

    const validProperties = customer.properties.filter(
      (property) =>
        property.propertyName.trim() !== "" && property.address.trim() !== "",
    );

    if (validProperties.length === 0) {
      setToast({
        open: true,
        type: "warning",
        title: "Property Required",
        message: "Please add at least one property.",
      });

      return false;
    }

    return true;
  }

  async function saveCustomer() {
    if (!customer) return;

    if (
      !isRequiredFieldsValid() ||
      !isEmail() ||
      !isMobileValid() ||
      !isProperty()
    ) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/customers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        throw new Error();
      }

      setToast({
        open: true,
        type: "success",
        title: "Customer Updated",
        message: `${customer.id} has been updated successfully.`,
      });
    } catch (error) {
      console.error(error);

      setToast({
        open: true,
        type: "error",
        title: "Update Failed",
        message: "Failed to update customer.",
      });
    } finally {
      setSaving(false);
    }
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
            <h3 className="text-lg font-semibold">Email Address</h3>
          </div>

          <input
            className="w-full rounded-xl border p-3"
            value={customer.email}
            onChange={(e) =>
              setCustomer({
                ...customer,
                email: e.target.value,
              })
            }
          />
        </div>

        <div className="white-section">
          <div className="flex items-center gap-2 mb-5">
            <Phone size={20} />
            <h3 className="text-lg font-semibold">Mobile Number</h3>
          </div>

          <input
            className="w-full rounded-xl border p-3"
            value={customer.mobile}
            onChange={(e) =>
              setCustomer({
                ...customer,
                mobile: e.target.value,
              })
            }
          />
        </div>

        <div className="white-section">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={20} />
            <h3 className="text-lg font-semibold">Properties</h3>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() =>
                setCustomer({
                  ...customer,
                  properties: [
                    ...customer.properties,
                    {
                      propertyName: "",
                      address: "",
                    },
                  ],
                })
              }
              className="
      rounded-lg
      px-4
      py-2
      text-sm
      font-medium
      text-blue-600
      transition
      hover:bg-blue-50
    "
            >
              + Add Property
            </button>
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

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={customer.properties.length === 1}
                  onClick={() => {
                    setCustomer({
                      ...customer,
                      properties: customer.properties.filter(
                        (_, i) => i !== index,
                      ),
                    });
                  }}
                  className="
      rounded-lg
      px-4
      py-2
      text-sm
      font-medium
      text-red-600
      transition
      hover:bg-red-50
      disabled:cursor-not-allowed
      disabled:text-slate-400
      disabled:hover:bg-transparent
    "
                >
                  Remove Property
                </button>
              </div>
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

        <Toast
          open={toast.open}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      </div>
    </div>
  );
}
