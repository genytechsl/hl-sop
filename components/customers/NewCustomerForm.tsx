"use client";

import { SetStateAction, useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";

export default function NewCustomerForm() {
  const [name, setName] = useState("");

  const [NIC, setNIC] = useState("");

  const [emails, setEmails] = useState([""]);

  const [mobiles, setMobiles] = useState([""]);

  const [properties, setProperties] = useState([
    {
      propertyName: "",
      address: "",
    },
  ]);

  const [active, setActive] = useState(true);

  const handleRegisterCustomer = async () => {
    try {
      const payload = {
        name,
        email: emails.filter((email) => email.trim() !== ""),
        mobile: mobiles.filter((mobile) => mobile.trim() !== ""),
        NIC,
        active,
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

      if (!response.ok) {
        throw new Error("Failed to register customer");
      }

      const customer = await response.json();

      console.log("Customer registered:", customer);

      alert(`Customer ${customer.id} registered successfully`);

      // optional reset
      setName("");
      setNIC("");
      setEmails([""]);
      setMobiles([""]);
      setProperties([
        {
          propertyName: "",
          address: "",
        },
      ]);
      setActive(true);
    } catch (error) {
      console.error("Customer registration error:", error);

      alert("Failed to register customer");
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
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Email Addresses
            </label>

            {emails.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  value={email}
                  onChange={(e) => {
                    const updated = [...emails];
                    updated[index] = e.target.value;
                    setEmails(updated);
                  }}
                  placeholder="Enter email"
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

                <button
                  type="button"
                  onClick={() => {
                    setEmails(emails.filter((_, i) => i !== index));
                  }}
                  title="Remove email"
                  className="
                    h-10
                    w-10
                    flex
                    items-center
                    justify-center
                    rounded-xl
                    text-red-400
                    hover:text-red-800
                    hover:bg-red-50
                    transition-all
                    duration-200
                    border
                    border-transparent
                    hover:border-red-200
                  "
                >
                  <X size={16} strokeWidth={4} />
                </button>
              </div>
            ))}
            <div className="flex justify-end pr-12">
              <button
                type="button"
                onClick={() => setEmails([...emails, ""])}
                className="
            text-md
            text-blue-600
            font-medium
          "
              >
                + Add Email
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Mobile Numbers
            </label>

            {mobiles.map((mobile, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  value={mobile}
                  onChange={(e) => {
                    const updated = [...mobiles];

                    updated[index] = e.target.value;

                    setMobiles(updated);
                  }}
                  placeholder="Enter mobile number"
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

                <button
                  type="button"
                  onClick={() =>
                    setMobiles(mobiles.filter((_, i) => i !== index))
                  }
                  className="
                    h-10
                    w-10
                    flex
                    items-center
                    justify-center
                    rounded-xl
                    text-red-400
                    hover:text-red-800
                    hover:bg-red-50
                    transition-all
                    duration-200
                    border
                    border-transparent
                    hover:border-red-200
                  "
                >
                  <X size={16} strokeWidth={4} />
                </button>
              </div>
            ))}
            <div className="flex justify-end pr-12">
              <button
                type="button"
                onClick={() => setMobiles([...mobiles, ""])}
                className="
            text-md
            text-blue-600
            font-medium
          "
              >
                + Add Mobile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}

      <div className="white-section mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Property Information
        </h3>

        {properties.map((property, index) => (
          <div
            key={index}
            className="
          px-4 py-2
          rounded-2xl
          border
          border-slate-200
          mb-2
          bg-slate-50
        "
          >
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setProperties(properties.filter((_, i) => i !== index))
                }
                className="
            mt-3
            text-sm
            text-red-600
            font-medium cursor-pointer
          "
              >
                Remove Property
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
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
      text-md
      text-blue-600
      font-medium
      hover:text-blue-700
    "
          >
            + Add Property
          </button>
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

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleRegisterCustomer}
          className="
      button-heading-special
      inline-flex
      items-center
      gap-2
      rounded-xl
      px-6
      py-3
      font-semibold
      text-white
      shadow-sm
      transition-all
      hover:bg-blue-700
      hover:shadow-md
    "
        >
          Register Customer
        </button>
      </div>
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
