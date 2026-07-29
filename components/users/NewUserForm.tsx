"use client";

import { SetStateAction, useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";

export default function NewUserForm() {
  const [id, setid] = useState<string>("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("sfm");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [security, setSecurity] = useState("");
  const [role, setRole] = useState("actionOwner");
  const [active, setActive] = useState(true);

  const handleRegisterUser = async () => {
    try {
      const payload = {
        id,
        name,
        designation,
        department,
        email,
        username,
        security,
        role,
        active,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to register employee");
      }

      const employee = await response.json();

      alert(`Employee ${employee.id} registered successfully`);

      setid("");
      setName("");
      setDesignation("");
      setDepartment("");
      setEmail("");
      setUsername("");
      setSecurity("");
      setRole("actionOwner");
      setActive(true);
    } catch (err) {
      console.error(err);
      alert("Failed to register employee");
    }
  };

  return (
    <section className="p-4 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* User/Employee Basic Information */}
      <div className="white-section mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Employee Information
        </h3>

        <div className="grid md:grid-cols-3 gap-5">
          <InputField
            label="Employee ID"
            placeholder="Enter employee Number"
            value={id}
            onChange={(e: any) => setid(e.target.value)}
          />

          <InputField
            label="Employee Name"
            placeholder="Enter employee name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />

          <InputField
            label="Designation"
            placeholder="Enter designation"
            value={designation}
            onChange={(e: any) => setDesignation(e.target.value)}
          />

          <SelectField
            label="Department"
            value={department}
            onChange={(e: any) => setDepartment(e.target.value)}
          >
            <option value="sfm">SFM</option>
            <option value="operations">Operations</option>
            <option value="technical">Technical</option>
            <option value="contractor">Contractors</option>
          </SelectField>

          <SelectField
            label="Role"
            value={role}
            onChange={(e: any) => setRole(e.target.value)}
          >
            <option value="actionOwner">Action Owner</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="dataEntry">Agent/Data Entry</option>
          </SelectField>
        </div>
      </div>

      {/* Account Information */}
      <div className="white-section mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Account Information
        </h3>

        <div className="grid md:grid-cols-4 gap-5">
          <InputField
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <InputField
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={security}
            onChange={(e: any) => setSecurity(e.target.value)}
          />

          <SelectField
            label="User Status"
            value={active}
            onChange={(e: any) => setActive(e.target.value === "true")}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </SelectField>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleRegisterUser}
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
          Register User
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
