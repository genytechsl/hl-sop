"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Building2,
  Phone,
  Mail,
  Plus,
  Trash2,
  CalendarDays,
  CreditCard,
  CircleUserRound,
  X,
} from "lucide-react";
import Toast from "@/components/BottomRIghtToast";
import CustomerTicketHistory from "@/components/customers/CustomerTicketHistory";

interface Property {
  propertyName: string;
  address: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  otherEmails: string[];
  mobile: string;
  otherMobiles: string[];
  NIC: string;
  active: boolean;
  createdDate: string;
  properties: Property[];
}

type CustomerTab = "details" | "tickets";

export default function CustomerViewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<CustomerTab>("details");
  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id]);

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

  async function loadCustomer() {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load customer.");
      }

      setCustomer({
        ...data,
        otherEmails: data.otherEmails ?? [],
        otherMobiles: data.otherMobiles ?? [],
        properties: data.properties ?? [],
      });
    } catch (error) {
      console.error("Failed to load customer:", error);
      setToast({
        open: true,
        type: "error",
        title: "Failed to Load",
        message: "Failed to load customer information.",
      });
    } finally {
      setLoading(false);
    }
  }

  function showWarning(title: string, message: string) {
    setToast({
      open: true,
      type: "warning",
      title,
      message,
    });
  }

  function isRequiredFieldsValid(): boolean {
    if (!customer) return false;

    if (
      customer.name.trim() === "" ||
      customer.email.trim() === "" ||
      customer.mobile.trim() === "" ||
      customer.NIC.trim() === ""
    ) {
      showWarning(
        "Missing Information",
        "Please complete all required fields.",
      );
      return false;
    }

    return true;
  }

  function isEmailValid(): boolean {
    if (!customer) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const primaryEmail = customer.email.trim();

    if (!emailRegex.test(primaryEmail)) {
      showWarning(
        "Invalid Email",
        "Please enter a valid primary email address.",
      );
      return false;
    }

    const otherEmails = customer.otherEmails
      .map((item) => item.trim())
      .filter(Boolean);

    for (const email of otherEmails) {
      if (!emailRegex.test(email)) {
        showWarning(
          "Invalid Email",
          `"${email}" is not a valid additional email address.`,
        );
        return false;
      }
    }

    const primaryNormalized = primaryEmail.toLowerCase();
    const normalizedOtherEmails = otherEmails.map((item) => item.toLowerCase());

    if (normalizedOtherEmails.includes(primaryNormalized)) {
      showWarning(
        "Duplicate Email",
        "The primary email address cannot also be added as an additional email.",
      );
      return false;
    }

    if (new Set(normalizedOtherEmails).size !== normalizedOtherEmails.length) {
      showWarning(
        "Duplicate Email",
        "The same additional email address has been entered more than once.",
      );
      return false;
    }

    return true;
  }

  function isMobileValid(): boolean {
    if (!customer) return false;

    const phoneRegex = /^0\d{9}$/;
    const primaryMobile = customer.mobile.trim();

    if (!phoneRegex.test(primaryMobile)) {
      showWarning(
        "Invalid Mobile Number",
        "Please enter a valid Sri Lankan primary mobile number.",
      );
      return false;
    }

    const otherMobiles = customer.otherMobiles
      .map((item) => item.trim())
      .filter(Boolean);

    for (const number of otherMobiles) {
      if (!phoneRegex.test(number)) {
        showWarning(
          "Invalid Contact Number",
          `"${number}" is not a valid Sri Lankan telephone number.`,
        );
        return false;
      }
    }

    if (otherMobiles.includes(primaryMobile)) {
      showWarning(
        "Duplicate Contact Number",
        "The primary mobile number cannot also be added as an additional contact number.",
      );
      return false;
    }

    if (new Set(otherMobiles).size !== otherMobiles.length) {
      showWarning(
        "Duplicate Contact Number",
        "The same additional contact number has been entered more than once.",
      );
      return false;
    }

    return true;
  }

  function isPropertyValid(): boolean {
    if (!customer) return false;

    const validProperties = customer.properties.filter(
      (property) =>
        property.propertyName.trim() !== "" && property.address.trim() !== "",
    );

    if (validProperties.length === 0) {
      showWarning("Property Required", "Please add at least one property.");
      return false;
    }

    const incompleteProperty = customer.properties.find(
      (property) =>
        (property.propertyName.trim() !== "" &&
          property.address.trim() === "") ||
        (property.propertyName.trim() === "" && property.address.trim() !== ""),
    );

    if (incompleteProperty) {
      showWarning(
        "Incomplete Property",
        "Each property must have both a property name and address.",
      );
      return false;
    }

    return true;
  }

  function addOtherEmail() {
    if (!customer) return;

    setCustomer({
      ...customer,
      otherEmails: [...customer.otherEmails, ""],
    });
  }

  function updateOtherEmail(index: number, value: string) {
    if (!customer) return;

    const otherEmails = [...customer.otherEmails];
    otherEmails[index] = value;

    setCustomer({
      ...customer,
      otherEmails,
    });
  }

  function removeOtherEmail(index: number) {
    if (!customer) return;

    setCustomer({
      ...customer,
      otherEmails: customer.otherEmails.filter((_, i) => i !== index),
    });
  }

  function addOtherMobile() {
    if (!customer) return;

    setCustomer({
      ...customer,
      otherMobiles: [...customer.otherMobiles, ""],
    });
  }

  function updateOtherMobile(index: number, value: string) {
    if (!customer) return;

    const otherMobiles = [...customer.otherMobiles];
    otherMobiles[index] = value;

    setCustomer({
      ...customer,
      otherMobiles,
    });
  }

  function removeOtherMobile(index: number) {
    if (!customer) return;

    setCustomer({
      ...customer,
      otherMobiles: customer.otherMobiles.filter((_, i) => i !== index),
    });
  }

  async function saveCustomer() {
    if (!customer) return;

    if (
      !isRequiredFieldsValid() ||
      !isEmailValid() ||
      !isMobileValid() ||
      !isPropertyValid()
    ) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...customer,
        name: customer.name.trim(),
        email: customer.email.trim(),
        otherEmails: customer.otherEmails
          .map((item) => item.trim())
          .filter(Boolean),
        mobile: customer.mobile.trim(),
        otherMobiles: customer.otherMobiles
          .map((item) => item.trim())
          .filter(Boolean),
        properties: customer.properties
          .filter(
            (property) =>
              property.propertyName.trim() !== "" &&
              property.address.trim() !== "",
          )
          .map((property) => ({
            propertyName: property.propertyName.trim(),
            address: property.address.trim(),
          })),
      };

      const response = await fetch("/api/customers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update customer.");
      }

      setCustomer({
        ...customer,
        email: payload.email,
        otherEmails: payload.otherEmails,
        mobile: payload.mobile,
        otherMobiles: payload.otherMobiles,
        properties: payload.properties,
      });

      setToast({
        open: true,
        type: "success",
        title: "Customer Updated",
        message: `${customer.id} has been updated successfully.`,
      });
    } catch (error: any) {
      console.error("Customer update error:", error);
      setToast({
        open: true,
        type: "error",
        title: "Update Failed",
        message: error.message || "Failed to update customer.",
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
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative pb-4 text-sm font-semibold transition ${
              activeTab === "details"
                ? "text-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Customer Details
            {activeTab === "details" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tickets")}
            className={`relative pb-4 text-sm font-semibold transition ${
              activeTab === "tickets"
                ? "text-emerald-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Ticket History
            {activeTab === "tickets" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>
      </div>

      {activeTab === "details" && (
        <>
          {/* Basic Information */}
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

              <button
                type="button"
                onClick={() =>
                  setCustomer({
                    ...customer,
                    active: !customer.active,
                  })
                }
                aria-pressed={customer.active}
                className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2 transition-all duration-200 ${
                  customer.active
                    ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`relative h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${
                    customer.active ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      customer.active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <div className="hidden text-left sm:block">
                  <p
                    className={`text-xs font-semibold ${
                      customer.active ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {customer.active ? "Active" : "Inactive"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {customer.active ? "Customer enabled" : "Customer disabled"}
                  </p>
                </div>
              </button>
            </div>

            <div className="card-body">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                    Customer National Identity Card number cannot be changed.
                  </p>
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
                      value={new Date(customer.createdDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                      className="input bg-slate-50 pl-11 text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Email */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Email Addresses</h2>
                  <p className="card-description">
                    Manage the customer's primary and additional email
                    addresses.
                  </p>
                </div>
                <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                  <Mail size={20} />
                </div>
              </div>

              <div className="card-body">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="label">Primary Email Address</label>
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-600">
                      Primary
                    </span>
                  </div>

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
                      placeholder="Enter primary email address"
                    />
                  </div>

                  <p className="helper-text">
                    This email remains the customer's primary email address.
                  </p>
                </div>

                {customer.otherEmails.length > 0 && (
                  <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                    {customer.otherEmails.map((email, index) => (
                      <div key={index}>
                        <label className="label">
                          Additional Email {index + 1}
                        </label>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Mail
                              size={17}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="email"
                              className="input pl-11"
                              value={email}
                              onChange={(e) =>
                                updateOtherEmail(index, e.target.value)
                              }
                              placeholder="Enter additional email address"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeOtherEmail(index)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Remove email"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addOtherEmail}
                  className="btn-outline mt-5 !px-4 !py-2"
                >
                  <Plus size={16} />
                  Add Email Address
                </button>
              </div>
            </div>

            {/* Mobile */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Contact Numbers</h2>
                  <p className="card-description">
                    Manage the customer's primary mobile and additional
                    telephone numbers.
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <Phone size={20} />
                </div>
              </div>

              <div className="card-body">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="label">Primary Mobile Number</label>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                      Primary
                    </span>
                  </div>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                      placeholder="Enter primary mobile number"
                    />
                  </div>

                  <p className="helper-text">
                    This number remains the customer's primary mobile number.
                  </p>
                </div>

                {customer.otherMobiles.length > 0 && (
                  <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                    {customer.otherMobiles.map((number, index) => (
                      <div key={index}>
                        <label className="label">
                          Additional Contact Number {index + 1}
                        </label>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Phone
                              size={17}
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="tel"
                              className="input pl-11"
                              value={number}
                              onChange={(e) =>
                                updateOtherMobile(index, e.target.value)
                              }
                              placeholder="Enter additional contact number"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeOtherMobile(index)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            title="Remove contact number"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addOtherMobile}
                  className="btn-outline mt-5 !px-4 !py-2"
                >
                  <Plus size={16} />
                  Add Contact Number
                </button>
              </div>
            </div>
          </div>

          {/* Properties */}
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
                          onClick={() =>
                            setCustomer({
                              ...customer,
                              properties: customer.properties.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
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
                        <input
                          className="input"
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

          {/* Save */}
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
                  type="button"
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
        </>
      )}

      {activeTab === "tickets" && (
        <CustomerTicketHistory customerId={customer.id} />
      )}

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
