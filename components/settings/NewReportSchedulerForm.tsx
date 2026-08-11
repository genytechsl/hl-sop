"use client";

import { useEffect, useState } from "react";
import { Save, CalendarClock, Mail, FileText } from "lucide-react";
import Toast from "../BottomRIghtToast";

export default function ReportSchedulerForm() {
  const [email, setEmail] = useState("");
  const [report, setReport] = useState("dashboard");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [day, setDay] = useState(31);
  const [time, setTime] = useState("17:00");
  const [active, setActive] = useState(true);

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
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

  function validateEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
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

  function validateDay() {
    if (day < 1 || day > 31) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid Date",
        message: "Monthly day must be between 1 and 31.",
      });

      return false;
    }

    return true;
  }

  async function saveScheduler() {
    if (!validateEmail() || !validateDay()) return;

    const payload = {
      email: email.trim(),
      report,
      frequency,
      day,
      time,
      active,
    };

    try {
      const response = await fetch("/api/settings/report-schedular", {
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
          title: "Failed",
          message: result.message || "Failed to create schedule.",
        });

        return;
      }

      setToast({
        open: true,
        type: "success",
        title: "Success",
        message: "Report schedule created successfully.",
      });
    } catch (error) {
      console.log(typeof error);
      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Unable to save report schedule.",
      });
    }
  }

  return (
    <section className="p-4 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="white-section mb-4">
        <div className="grid md:grid-cols-4 gap-5">
          <InputField
            label="Recipient Email"
            placeholder="manager@company.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />

          <SelectField
            label="Report Type"
            value={report}
            onChange={(e: any) => setReport(e.target.value)}
          >
            <option value="dashboard">Dashboard Report</option>
          </SelectField>

          <SelectField
            label="Frequency"
            value={frequency}
            onChange={(e: any) => setFrequency(e.target.value)}
          >
            <option value="DAILY">Daily</option>

            <option value="WEEKLY">Weekly</option>

            <option value="MONTHLY">Monthly</option>
          </SelectField>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Send Day
            </label>

            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
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

            <p className="text-xs text-slate-400 mt-1">
              Applicable for monthly reports.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Send Time
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
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

          <SelectField
            label="Status"
            value={active}
            onChange={(e: any) => setActive(e.target.value === "true")}
          >
            <option value="true">Active</option>

            <option value="false">Inactive</option>
          </SelectField>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={saveScheduler}
          className="
button-heading-special
flex
items-center
gap-2
hover:scale-[1.02]
transition
"
        >
          <Save size={16} />
          Save Schedule
        </button>

        <button
          className="
button-heading
hover:scale-[1.02]
transition
"
        >
          Cancel
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
    </section>
  );
}

function InputField(props: any) {
  return (
    <div>
      <label
        className="
block
text-sm
font-medium
mb-2
text-slate-700
"
      >
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
      <label
        className="
block
text-sm
font-medium
mb-2
text-slate-700
"
      >
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
