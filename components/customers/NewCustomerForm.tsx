"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Toast from "../BottomRIghtToast";

export default function NewCustomerForm() {
  const [name, setName] = useState("");
  const [NIC, setNIC] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
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

  function isEmpty(): boolean {
    if (!name.trim() || !NIC.trim() || !email.trim() || !mobile.trim()) {
      setToast({
        open: true,
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields.",
      });

      return true;
    }

    return false;
  }

  function isNICValid(): boolean {
    const oldNIC = /^[0-9]{9}[VvXx]$/;
    const newNIC = /^[0-9]{12}$/;

    if (!(oldNIC.test(NIC) || newNIC.test(NIC))) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid NIC",
        message: "Please enter a valid Sri Lankan NIC.",
      });

      return false;
    }

    return true;
  }

  function isEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
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
    const regex = /^0\d{9}$/;

    if (!regex.test(mobile)) {
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
    const validProperties = properties.filter(
      (property) => property.propertyName.trim() && property.address.trim(),
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

  const handleRegisterCustomer = async () => {
    if (
      !isEmpty() &&
      isNICValid() &&
      isEmail() &&
      isMobileValid() &&
      isProperty()
    ) {
      try {
        const payload = {
          name,
          email: email.trim(),
          mobile: mobile.trim(),
          NIC,
          active,
          receiveEmailNotifications,
          receiveSmsNotifications,
          properties: properties.filter(
            (property) =>
              property.propertyName.trim() !== "" &&
              property.address.trim() !== "",
          ),
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
            message: `Failed to register customer. ${result.message}.`,
          });
        } else if (response.ok) {
          setToast({
            open: true,
            type: "success",
            title: "Success!",
            message: `New customer: ${result.id} has been created successfully.`,
          });

          // optional reset
          setName("");
          setNIC("");
          setEmail("");
          setMobile("");
          setProperties([
            {
              propertyName: "",
              address: "",
            },
          ]);
          setActive(true);
        }
      } catch (error) {
        setToast({
          open: true,
          type: "error",
          title: "Failed!",
          message: `Failed to register employee.`,
        });
      }
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
          <div className="col-span-2">
            <InputField
              label="Customer Name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <InputField
              label="NIC"
              placeholder="Enter NIC number"
              value={NIC}
              onChange={(e: any) => setNIC(e.target.value)}
            />
          </div>
          <div className="col-span-1">
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
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Contact Information
        </h3>

        <div className="grid md:grid-cols-2 gap-5">
          <InputField
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <InputField
            label="Mobile Number"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e: any) => setMobile(e.target.value)}
          />
        </div>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-slate-800">
              Notification Preferences
            </h4>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label
              className="
          flex
          items-start
          gap-4
          rounded-2xl
          border
          border-slate-200
          p-4
          cursor-pointer
          transition-all
          hover:border-slate-300
          hover:shadow-sm
        "
            >
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

            <label
              className="
          flex
          items-start
          gap-4
          rounded-2xl
          border
          border-slate-200
          p-4
          cursor-pointer
          transition-all
          hover:border-slate-300
          hover:shadow-sm
        "
            >
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
        <div className="flex items-center justify-between mb-5">
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
            className="
        rounded-xl
        border
        border-slate-300
        px-4
        py-2
        text-sm
        font-medium
        text-blue-600
        transition
        hover:bg-slate-50
      "
          >
            + Add Property
          </button>
        </div>

        <div className="space-y-4">
          {properties.map((property, index) => (
            <div
              key={index}
              className="
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-5
        "
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
                    className="
                text-sm
                font-medium
                text-red-600
                hover:underline
              "
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

      {/* Status */}

      <div className="grid md:grid-cols-2 gap-5">
        {/* <InputField
          label="Created Date"
          value={new Date().toISOString().split("T")[0]}
          readOnly
        /> */}
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <button
          type="button"
          onClick={handleRegisterCustomer}
          className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition"
        >
          <Save size={16} />
          Save
        </button>
        <button
          type="button"
          onClick={() => {}}
          className="button-heading flex items-center gap-2 hover:scale-[1.02] transition"
        >
          {/* <Save size={16} /> */}
          Cancel
        </button>
      </div>

      {dialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-7 animate-in fade-in zoom-in duration-200">
            <div
              className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full
        ${
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
              onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
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

function InputField(props: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {props.label}
      </label>

      <input
        {...props}
        className="
          w-full
          h-11
          px-4
          rounded-xl
          border
          border-slate-300
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
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
        className="
          w-full
          h-11
          px-4
          rounded-xl
          border
          border-slate-300
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        {children}
      </select>
    </div>
  );
}
