"use client";
import { useEffect, useState } from "react";
import { LoaderCircle, Plus, Save, X } from "lucide-react";
import Toast from "../BottomRIghtToast";

export default function NewCustomerForm() {
  const [name, setName] = useState("");
  const [NIC, setNIC] = useState("");
  const [email, setEmail] = useState("");
  const [otherEmails, setOtherEmails] = useState<string[]>([]);
  const [mobile, setMobile] = useState("");
  const [otherMobiles, setOtherMobiles] = useState<string[]>([]);
  const [properties, setProperties] = useState([
    {
      propertyName: "",
      address: "",
    },
  ]);
  const [active, setActive] = useState(true);
  const [receiveEmailNotifications, setReceiveEmailNotifications] =
    useState(true);
  const [receiveSmsNotifications, setReceiveSmsNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
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

  function showWarning(title: string, message: string) {
    setToast({
      open: true,
      type: "warning",
      title,
      message,
    });
  }

  function isEmpty(): boolean {
    if (!name.trim() || !NIC.trim() || !email.trim() || !mobile.trim()) {
      showWarning("Missing Information", "Please fill in all required fields.");
      return true;
    }
    return false;
  }

  function isNICValid(): boolean {
    const oldNIC = /^[0-9]{9}[VvXx]$/;
    const newNIC = /^[0-9]{12}$/;
    if (!(oldNIC.test(NIC.trim()) || newNIC.test(NIC.trim()))) {
      showWarning("Invalid NIC", "Please enter a valid Sri Lankan NIC.");
      return false;
    }
    return true;
  }

  function isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const primaryEmail = email.trim();
    if (!emailRegex.test(primaryEmail)) {
      showWarning(
        "Invalid Email",
        "Please enter a valid primary email address.",
      );
      return false;
    }
    const cleanedOtherEmails = otherEmails
      .map((item) => item.trim())
      .filter(Boolean);
    for (const item of cleanedOtherEmails) {
      if (!emailRegex.test(item)) {
        showWarning(
          "Invalid Email",
          `"${item}" is not a valid additional email address.`,
        );
        return false;
      }
    }
    const normalizedPrimary = primaryEmail.toLowerCase();
    if (
      cleanedOtherEmails.some(
        (item) => item.toLowerCase() === normalizedPrimary,
      )
    ) {
      showWarning(
        "Duplicate Email",
        "The primary email address cannot also be added as an additional email.",
      );
      return false;
    }
    const normalizedOtherEmails = cleanedOtherEmails.map((item) =>
      item.toLowerCase(),
    );
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
    const mobileRegex = /^0\d{9}$/;
    const primaryMobile = mobile.trim();
    if (!mobileRegex.test(primaryMobile)) {
      showWarning(
        "Invalid Mobile Number",
        "Please enter a valid Sri Lankan primary mobile number.",
      );
      return false;
    }
    const cleanedOtherMobiles = otherMobiles
      .map((item) => item.trim())
      .filter(Boolean);
    for (const item of cleanedOtherMobiles) {
      if (!mobileRegex.test(item)) {
        showWarning(
          "Invalid Contact Number",
          `"${item}" is not a valid Sri Lankan contact number.`,
        );
        return false;
      }
    }
    if (cleanedOtherMobiles.includes(primaryMobile)) {
      showWarning(
        "Duplicate Contact Number",
        "The primary mobile number cannot also be added as an additional number.",
      );
      return false;
    }
    if (new Set(cleanedOtherMobiles).size !== cleanedOtherMobiles.length) {
      showWarning(
        "Duplicate Contact Number",
        "The same additional contact number has been entered more than once.",
      );
      return false;
    }
    return true;
  }

  function isPropertyValid(): boolean {
    const validProperties = properties.filter(
      (property) => property.propertyName.trim() && property.address.trim(),
    );
    if (validProperties.length === 0) {
      showWarning("Property Required", "Please add at least one property.");
      return false;
    }
    const incompleteProperty = properties.find(
      (property) =>
        (property.propertyName.trim() && !property.address.trim()) ||
        (!property.propertyName.trim() && property.address.trim()),
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
    setOtherEmails((prev) => [...prev, ""]);
  }

  function updateOtherEmail(index: number, value: string) {
    setOtherEmails((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  }

  function removeOtherEmail(index: number) {
    setOtherEmails((prev) => prev.filter((_, i) => i !== index));
  }

  function addOtherMobile() {
    setOtherMobiles((prev) => [...prev, ""]);
  }

  function updateOtherMobile(index: number, value: string) {
    setOtherMobiles((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  }

  function removeOtherMobile(index: number) {
    setOtherMobiles((prev) => prev.filter((_, i) => i !== index));
  }

  const handleRegisterCustomer = async () => {
    if (
      isEmpty() ||
      !isNICValid() ||
      !isEmailValid() ||
      !isMobileValid() ||
      !isPropertyValid()
    ) {
      return;
    }
    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        otherEmails: otherEmails.map((item) => item.trim()).filter(Boolean),
        mobile: mobile.trim(),
        otherMobiles: otherMobiles.map((item) => item.trim()).filter(Boolean),
        NIC: NIC.trim(),
        active,
        receiveEmailNotifications,
        receiveSmsNotifications,
        properties: properties
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Failed!",
          message: `Failed to register customer. ${
            result.message || "Please try again."
          }`,
        });
        return;
      }
      setToast({
        open: true,
        type: "success",
        title: "Success!",
        message: `New customer: ${result.id} has been created successfully.`,
      });
      setName("");
      setNIC("");
      setEmail("");
      setOtherEmails([]);
      setMobile("");
      setOtherMobiles([]);
      setProperties([
        {
          propertyName: "",
          address: "",
        },
      ]);
      setActive(true);
      setReceiveEmailNotifications(true);
      setReceiveSmsNotifications(true);
    } catch (error) {
      console.error("Customer registration error:", error);
      setToast({
        open: true,
        type: "error",
        title: "Failed!",
        message: "Failed to register customer. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="p-4 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Customer Basic Information */}
      <div className="white-section mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Customer Basic Information
        </h3>
        <div className="grid md:grid-cols-4 gap-5">
          <div className="md:col-span-2">
            <InputField
              label="Customer Name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <InputField
              label="NIC"
              placeholder="Enter NIC number"
              value={NIC}
              onChange={(e: any) => setNIC(e.target.value)}
            />
          </div>
          <div className="md:col-span-1">
            <SelectField
              label="Customer Status"
              value={active}
              onChange={(e: any) => setActive(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </SelectField>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="white-section mb-4">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-800">
            Contact Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Enter the customer's primary contact details and add any additional
            email addresses or telephone numbers if required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Email Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4">
              <InputField
                label="Primary Email Address"
                type="email"
                placeholder="Enter primary email address"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                This will remain the customer's primary email address.
              </p>
            </div>

            {otherEmails.length > 0 && (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                {otherEmails.map((otherEmail, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Additional Email {index + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter additional email address"
                        value={otherEmail}
                        onChange={(e) =>
                          updateOtherEmail(index, e.target.value)
                        }
                        className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherEmail(index)}
                        title="Remove email address"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <Plus size={16} />
              Add Email Address
            </button>
          </div>

          {/* Mobile Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-4">
              <InputField
                label="Primary Mobile Number"
                type="tel"
                placeholder="Enter primary mobile number"
                value={mobile}
                onChange={(e: any) => setMobile(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                This will remain the customer's primary mobile number.
              </p>
            </div>

            {otherMobiles.length > 0 && (
              <div className="space-y-3 border-t border-slate-200 pt-4">
                {otherMobiles.map((otherMobile, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Additional Contact Number {index + 1}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="Enter additional contact number"
                        value={otherMobile}
                        onChange={(e) =>
                          updateOtherMobile(index, e.target.value)
                        }
                        className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeOtherMobile(index)}
                        title="Remove contact number"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:border-blue-300 hover:bg-blue-50"
            >
              <Plus size={16} />
              Add Mobile Number
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-slate-800">
              Notification Preferences
            </h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm">
              <input
                type="checkbox"
                checked={receiveEmailNotifications}
                onChange={(e) => setReceiveEmailNotifications(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <div>
                <p className="font-medium text-slate-800">
                  Email Notifications
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Receive ticket updates, status changes and system
                  notifications by email.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-4 rounded-2xl border border-slate-200 p-4 cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm">
              <input
                type="checkbox"
                checked={receiveSmsNotifications}
                onChange={(e) => setReceiveSmsNotifications(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <div>
                <p className="font-medium text-slate-800">SMS Notifications</p>
                <p className="mt-1 text-sm text-slate-500">
                  Receive important alerts and updates via SMS.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="white-section mb-4">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Property Information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add one or more properties associated with this customer.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setProperties([
                ...properties,
                {
                  propertyName: "",
                  address: "",
                },
              ])
            }
            className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
          >
            + Add Property
          </button>
        </div>

        <div className="space-y-4">
          {properties.map((property, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-medium text-slate-800">
                  Property {index + 1}
                </h4>
                {properties.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setProperties(properties.filter((_, i) => i !== index))
                    }
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <InputField
                  label="Property Name"
                  placeholder="Enter property name"
                  value={property.propertyName}
                  onChange={(e: any) => {
                    const updated = [...properties];
                    updated[index].propertyName = e.target.value;
                    setProperties(updated);
                  }}
                />
                <InputField
                  label="Property Address"
                  placeholder="Enter property address"
                  value={property.address}
                  onChange={(e: any) => {
                    const updated = [...properties];
                    updated[index].address = e.target.value;
                    setProperties(updated);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <button
          type="button"
          onClick={handleRegisterCustomer}
          disabled={isSaving}
          className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {}}
          disabled={isSaving}
          className="button-heading flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Cancel
        </button>
      </div>

      {dialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-7 animate-in fade-in zoom-in duration-200">
            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
                dialog.type === "success"
                  ? "bg-emerald-100"
                  : dialog.type === "error"
                    ? "bg-red-100"
                    : "bg-amber-100"
              }`}
            >
              {dialog.type === "success" && (
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              {dialog.type === "error" && (
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {dialog.type === "warning" && (
                <svg
                  className="h-8 w-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 9v4m0 4h.01" />
                  <path d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800">
              {dialog.title}
            </h3>
            <p className="mt-3 text-center text-slate-500">{dialog.message}</p>
            <button
              onClick={() =>
                setDialog((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
              className="mt-7 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
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
    </section>
  );
}

function InputField({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({ label, children, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {label}
      </label>
      <select
        {...props}
        className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );
}
