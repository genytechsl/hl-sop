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
  Plus,
  Trash2,
  CalendarDays,
  CreditCard,
  CircleUserRound,
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

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  async function loadCustomer() {
    const response = await fetch(`/api/customers/${id}`);
    const data = await response.json();
    setCustomer(data);
    setLoading(false);
  }

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
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="page">
      {/* <DashboardHeader header="Customer Management" page={6} /> */}

      <div className="page-header">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-ghost !px-3 !py-2"
              title="Go back"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <h1 className="page-title">Edit Customer</h1>
              <p className="page-description">
                Manage customer information, contact details and properties.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={customer.active ? "badge-success" : "badge-danger"}>
            <span
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                customer.active ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            {customer.active ? "Active Customer" : "Inactive Customer"}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
              <CircleUserRound size={24} />
            </div>

            <div>
              <h2 className="card-title">{customer.name}</h2>

              <p className="card-description">
                Customer ID:{" "}
                <span className="font-medium text-slate-700">
                  {customer.id}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="form-grid">
            <div>
              <label className="label">Customer Name</label>

              <input
                className="input"
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
              <label className="label">NIC</label>

              <div className="relative">
                <CreditCard
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  readOnly
                  value={customer.NIC}
                  className="input bg-slate-50 pl-11 text-slate-500"
                />
              </div>

              <p className="helper-text">
                Customer identification number cannot be changed.
              </p>
            </div>

            <div>
              <label className="label">Account Status</label>

              <select
                value={customer.active ? "true" : "false"}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    active: e.target.value === "true",
                  })
                }
                className="select"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div>
              <label className="label">Created Date</label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  readOnly
                  value={customer.createdDate}
                  className="input bg-slate-50 pl-11 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Email Address</h2>

              <p className="card-description">
                Primary email address used for customer communication.
              </p>
            </div>

            <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
              <Mail size={20} />
            </div>
          </div>

          <div className="card-body">
            <label className="label">Email</label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                className="input pl-11"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    email: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Mobile Number</h2>

              <p className="card-description">
                Primary contact number for customer communication.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <Phone size={20} />
            </div>
          </div>

          <div className="card-body">
            <label className="label">Mobile</label>

            <div className="relative">
              <Phone
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="tel"
                className="input pl-11"
                value={customer.mobile}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    mobile: e.target.value,
                  })
                }
              />

              <p className="helper-text">
                Enter a valid Sri Lankan mobile number.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <Building2 size={20} />
            </div>

            <div>
              <h2 className="card-title">Customer Properties</h2>

              <p className="card-description">
                Manage the properties associated with this customer.
              </p>
            </div>
          </div>

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
            className="btn-outline !px-4 !py-2"
          >
            <Plus size={17} />
            Add Property
          </button>
        </div>

        <div className="card-body">
          <div className="space-y-5">
            {customer.properties.map((property, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Property {index + 1}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Property information and address
                    </p>
                  </div>

                  {customer.properties.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomer({
                          ...customer,
                          properties: customer.properties.filter(
                            (_, i) => i !== index,
                          ),
                        });
                      }}
                      className="btn-ghost !px-3 !py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="label">Property Name</label>

                    <input
                      className="input"
                      placeholder="Enter property name"
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
                  </div>

                  <div>
                    <label className="label">Property Address</label>

                    <textarea
                      rows={3}
                      className="textarea"
                      placeholder="Enter complete property address"
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-footer flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700">
              Ready to save changes?
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Make sure all customer information is correct.
            </p>
          </div>

          <div className="flex w-full justify-end sm:w-auto">
            <button
              onClick={saveCustomer}
              disabled={saving}
              className="btn-primary min-w-[170px]"
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
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
  );
}
