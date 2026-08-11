"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Toast from "../BottomRIghtToast";

export default function NewUserForm() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("sfm");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("actionOwner");
  const [active, setActive] = useState(true);

  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameEdited, setUsernameEdited] = useState(false);

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

  function generateUsername(employeeName: string) {
    return employeeName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, ".");
  }

  function showWarning(title: string, message: string) {
    setToast({
      open: true,
      type: "warning",
      title,
      message,
    });
  }

  function isEmpty() {
    if (
      !id.trim() ||
      !name.trim() ||
      !designation.trim() ||
      !department.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password.trim() ||
      !role
    ) {
      showWarning("Missing Information", "Please fill in all required fields.");
      return true;
    }

    return false;
  }

  function isEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      showWarning("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    return true;
  }

  function isIDComplete() {
    if (!/^EMP\d{5}$/.test(id)) {
      showWarning(
        "Invalid Employee ID",
        "Employee ID must be in the format EMP12345.",
      );
      return false;
    }

    return true;
  }

  function isPasswordValid() {
    if (password.length < 8) {
      showWarning(
        "Invalid Password",
        "Password must contain at least 8 characters.",
      );
      return false;
    }

    return true;
  }

  const generateSuggestions = async (employeeName: string) => {
    const base = generateUsername(employeeName);

    if (!base) {
      setUsernameSuggestions([]);
      return;
    }

    const suggestions: string[] = [];
    let count = 0;
    let suffix = 0;

    while (count < 5) {
      const candidate = suffix === 0 ? base : `${base}${suffix}`;

      try {
        const response = await fetch(
          `/api/users?username=${encodeURIComponent(candidate)}`,
        );

        if (!response.ok) {
          break;
        }

        const result = await response.json();

        if (!result.exists) {
          suggestions.push(candidate);
          count++;
        }
      } catch (error) {
        console.error("Username suggestion error:", error);
        break;
      }

      suffix++;
    }

    setUsernameSuggestions(suggestions);

    if (suggestions.length > 0 && !usernameEdited) {
      setUsername(suggestions[0]);
    }
  };

  const checkUsernameAvailability = async (value: string) => {
    if (!value.trim()) {
      setUsernameAvailable(null);
      return;
    }

    try {
      const response = await fetch(
        `/api/users?username=${encodeURIComponent(value.trim())}`,
      );

      if (!response.ok) {
        setUsernameAvailable(null);
        return;
      }

      const result = await response.json();

      setUsernameAvailable(!result.exists);
    } catch (error) {
      console.error("Username availability error:", error);
      setUsernameAvailable(null);
    }
  };

  const handleRegisterUser = async () => {
    if (isEmpty()) return;
    if (!isEmail()) return;
    if (!isIDComplete()) return;
    if (!isPasswordValid()) return;

    if (usernameAvailable === false) {
      showWarning("Username Already Exists", "Please select another username.");
      return;
    }

    try {
      /*
       * Send the plain password only to the server.
       *
       * The API is responsible for hashing it with bcrypt.
       */
      const payload = {
        id,
        name,
        designation,
        department,
        email,
        username,
        password,
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

      const result = await response.json();

      console.log("user creation result:", result);

      if (!response.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Failed!",
          message: result.message || "Failed to register employee.",
        });

        return;
      }

      setToast({
        open: true,
        type: "success",
        title: "Success!",
        message: `New System User: ${result.id} has been created successfully.`,
      });

      resetForm();
    } catch (error) {
      console.error("User registration error:", error);

      setToast({
        open: true,
        type: "error",
        title: "Failed!",
        message: "Failed to register employee.",
      });
    }
  };

  const resetForm = () => {
    setId("");
    setName("");
    setDesignation("");
    setDepartment("sfm");
    setEmail("");
    setUsername("");
    setPassword("");
    setRole("actionOwner");
    setActive(true);

    setUsernameSuggestions([]);
    setUsernameAvailable(null);
    setUsernameEdited(false);
  };

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

  /*
   * Automatically generate usernames
   * from the employee name.
   */
  useEffect(() => {
    if (usernameEdited) return;

    if (!name.trim()) {
      setUsername("");
      setUsernameSuggestions([]);
      return;
    }

    generateSuggestions(name);
  }, [name, usernameEdited]);

  /*
   * Check username availability while typing.
   */
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  return (
    <section className="p-4 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      {/* User/Employee Basic Information */}
      <div className="white-section mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Employee Information
        </h3>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Employee ID
            </label>

            <div className="flex">
              <div className="h-11 px-4 flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-600 font-semibold">
                EMP
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="12345"
                value={id.replace("EMP", "")}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 5);

                  setId(`EMP${digits}`);
                }}
                className="w-full h-11 px-4 rounded-r-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="mt-1 text-xs text-slate-500">Example: EMP00045</p>
          </div>

          <InputField
            label="Employee Name"
            placeholder="Enter employee name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />

          <InputField
            label="Designation"
            placeholder="Enter designation"
            value={designation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDesignation(e.target.value)
            }
          />

          <SelectField
            label="Department"
            value={department}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setDepartment(e.target.value)
            }
          >
            <option value="sfm">SFM</option>
            <option value="operations">Operations</option>
            <option value="technical">Technical</option>
            <option value="contractor">Contractors</option>
          </SelectField>

          <SelectField
            label="Role"
            value={role}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRole(e.target.value)
            }
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
            type="email"
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />

          <div>
            <InputField
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUsernameEdited(true);
                setUsername(e.target.value);
              }}
            />

            {usernameSuggestions.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Suggested usernames
                  </p>

                  {username && usernameAvailable !== null && (
                    <p
                      className={`mt-2 text-sm ${
                        usernameAvailable ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {usernameAvailable
                        ? "✓ Username available"
                        : "Username already exists"}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {usernameSuggestions.slice(0, 3).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setUsername(item);
                        setUsernameEdited(true);
                      }}
                      className={`rounded-full border px-3 py-1 text-sm transition-all active:scale-95 ${
                        username === item
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
          />

          <SelectField
            label="User Status"
            value={active ? "true" : "false"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setActive(e.target.value === "true")
            }
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </SelectField>
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <button
          type="button"
          onClick={handleRegisterUser}
          className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition"
        >
          <Save size={16} />
          Save
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="button-heading flex items-center gap-2 hover:scale-[1.02] transition"
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

function InputField(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
  },
) {
  const { label, ...inputProps } = props;

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {label}
      </label>

      <input
        {...inputProps}
        className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
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
