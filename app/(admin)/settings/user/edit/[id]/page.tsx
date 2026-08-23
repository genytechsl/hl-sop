"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import Toast from "@/components/BottomRIghtToast";

interface User {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  active: boolean;
  role: string;
  username: string;
}

const roles = ["admin", "manager", "actionOwner", "viewer"];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  manager: "Manager",
  actionOwner: "Action Owner",
  viewer: "Viewer",
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();

  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [originalUsername, setOriginalUsername] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] =
    useState(false);

  async function searchDepartments(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setDepartments([]);
      setShowDepartmentSuggestions(false);
      return;
    }

    try {
      setDepartmentLoading(true);

      const response = await fetch(
        `/api/settings/departments?search=${encodeURIComponent(trimmedValue)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load departments");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setDepartments(data);
        setShowDepartmentSuggestions(true);
      } else {
        setDepartments([]);
        setShowDepartmentSuggestions(false);
      }
    } catch (error) {
      console.error("Department search error:", error);
      setDepartments([]);
      setShowDepartmentSuggestions(false);
    } finally {
      setDepartmentLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDepartments(departmentSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [departmentSearch]);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Error",
          message: "Could not load the user",
        });
        return;
      }

      const data: User = await response.json();

      setUser(data);
      setDepartmentSearch(data.department || "");
      setOriginalUsername(data.username);
      setUsernameEdited(false);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Failed to load user information",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof User>(field: K, value: User[K]) {
    if (!user) return;

    setUser({
      ...user,
      [field]: value,
    });
  }

  function generateUsername(employeeName: string) {
    return employeeName
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, ".");
  }

  async function generateSuggestions(employeeName: string) {
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

        /*
         * The current user's existing username should be considered
         * available because the user is allowed to keep it.
         */
        const isCurrentUsername =
          candidate.toLowerCase() === originalUsername.toLowerCase();

        if (!result.exists || isCurrentUsername) {
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

    /*
     * Automatically use the first suggestion only when the user
     * has not manually changed the username.
     */
    if (suggestions.length > 0 && !usernameEdited) {
      updateField("username", suggestions[0]);

      /*
       * The current username is valid even though the API reports
       * it as existing.
       */
      if (suggestions[0].toLowerCase() === originalUsername.toLowerCase()) {
        setUsernameAvailable(true);
      }
    }
  }

  async function checkUsernameAvailability(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setUsernameAvailable(null);
      return;
    }

    /*
     The user's existing username belongs to this user,
     therefore it is available for this update.
     */
    if (trimmedValue.toLowerCase() === originalUsername.toLowerCase()) {
      setUsernameAvailable(true);
      return;
    }

    try {
      const response = await fetch(
        `/api/users?username=${encodeURIComponent(trimmedValue)}`,
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
  }

  useEffect(() => {
    if (!user) return;
    if (usernameEdited) return;

    if (!user.name.trim()) {
      setUsernameSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      generateSuggestions(user.name);
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.name, usernameEdited, originalUsername]);

  useEffect(() => {
    if (!user?.username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(user.username);
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.username, originalUsername]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!user) return;

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.name,
          designation: user.designation,
          department: user.department,
          email: user.email,
          username: user.username,
          role: user.role,
          active: user.active,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      } else {
        setToast({
          open: true,
          type: "success",
          title: "Success",
          message: "User data updated successfully.",
        });
      }

      setUser(data);

      // setMessage({
      //   type: "success",
      //   text: "User information updated successfully",
      // });
    } catch (error) {
      console.log(error);
      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Unable to update user. Try again later",
      });
      // setMessage({
      //   type: "error",
      //   text: error instanceof Error ? error.message : "Failed to update user",
      // });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();

    if (newPassword.length < 8) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid format",
        message: "Password must contain 8 or more characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        open: true,
        type: "warning",
        title: "Invaliid",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      setPasswordSaving(true);
      setMessage(null);

      const response = await fetch(`/api/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      } else {
        setToast({
          open: true,
          type: "success",
          title: "Success",
          message: "Password changed successfully.",
        });
      }

      setNewPassword("");
      setConfirmPassword("");

      setMessage({
        type: "success",
        text: "Password changed successfully",
      });
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Unable to change password. Try again later",
      });
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to change password",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">User could not be found.</p>

        <Link href="/settings/user" className="btn-primary mt-4 inline-flex">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Link href="/settings/user" className="btn-ghost !px-3 !py-2">
              <ArrowLeft size={17} />
            </Link>

            <div>
              <h1 className="page-title">Edit User</h1>
              <p className="page-description">
                Manage employee information and account access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={
            message.type === "success" ? "alert-success" : "alert-danger"
          }
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Information */}
        <form onSubmit={handleSave} className="card lg:col-span-2">
          <div className="card-header">
            <div className="min-w-0">
              <h2 className="card-title">User Information</h2>

              <p className="card-description">
                Update the employee's account information.
              </p>
            </div>

            {/* Account Status */}
            <button
              type="button"
              onClick={() => updateField("active", !user.active)}
              aria-pressed={user.active}
              className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-3 py-2 transition-all duration-200 ${
                user.active
                  ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              <div
                className={`relative h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${
                  user.active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    user.active ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>

              <div className="hidden text-left sm:block">
                <p
                  className={`text-xs font-semibold ${
                    user.active ? "text-emerald-700" : "text-slate-600"
                  }`}
                >
                  {user.active ? "Active" : "Inactive"}
                </p>

                <p className="text-[10px] text-slate-400">
                  {user.active ? "Access enabled" : "Access disabled"}
                </p>
              </div>
            </button>
          </div>

          <div className="card-body">
            <div className="form-grid">
              <div>
                <label className="label">Employee ID</label>

                <input
                  value={user.id}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="label">Username</label>

                <input
                  value={user.username}
                  onChange={(e) => {
                    setUsernameEdited(true);
                    updateField("username", e.target.value);
                  }}
                  className="input"
                  required
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Choose a username or use a suggestion.
                  </p>

                  {user.username && usernameAvailable !== null && (
                    <p
                      className={`text-xs font-medium ${
                        usernameAvailable ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {usernameAvailable
                        ? "✓ Username available"
                        : "Username already exists"}
                    </p>
                  )}
                </div>

                {usernameSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Suggested usernames
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {usernameSuggestions.slice(0, 3).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            updateField("username", item);
                            setUsernameEdited(true);
                          }}
                          className={`rounded-full border px-3 py-1 text-sm transition-all active:scale-95 ${
                            user.username === item
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

              <div>
                <label className="label">Full Name</label>

                <input
                  value={user.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Designation</label>

                {/* <input
                  value={user.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  className="input"
                  required
                /> */}

                <select
                  value={user.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  className="select"
                >
                  <option value="MEP Engineer">MEP Engineer</option>
                  <option value="Contractor">Contractor</option>
                  <option value="CMU Manager">CMU Manager</option>
                  <option value="SFM Department">SFM</option>
                  <option value="Operations Executive">
                    Operations Executive
                  </option>
                </select>
              </div>

              <div className="relative">
                <label className="label">Department</label>

                <div className="relative">
                  <input
                    value={departmentSearch}
                    onChange={(e) => {
                      const value = e.target.value;

                      setDepartmentSearch(value);
                      updateField("department", value);
                      setShowDepartmentSuggestions(true);
                    }}
                    onFocus={() => {
                      if (departmentSearch.trim()) {
                        setShowDepartmentSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay closing so a suggestion can be clicked
                      setTimeout(() => {
                        setShowDepartmentSuggestions(false);
                      }, 150);
                    }}
                    className="input"
                    placeholder="Search department..."
                    required
                    autoComplete="off"
                  />

                  {departmentLoading && (
                    <LoaderCircle
                      size={17}
                      className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                    />
                  )}
                </div>

                {showDepartmentSuggestions && departments.length > 0 && (
                  <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {departments.map((department) => (
                      <button
                        key={department.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();

                          setDepartmentSearch(department.name);
                          updateField("department", department.name);
                          setShowDepartmentSuggestions(false);
                        }}
                        className="flex w-full items-center px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        {department.name}
                      </button>
                    ))}
                  </div>
                )}

                {showDepartmentSuggestions &&
                  !departmentLoading &&
                  departmentSearch.trim() &&
                  departments.length === 0 && (
                    <div className="absolute left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
                      No departments found.
                    </div>
                  )}
              </div>

              <div>
                <label className="label">Email Address</label>

                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Access Role</label>

                <div className="relative">
                  <select
                    value={user.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    className="select pr-10 font-medium"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="helper-text">
                  Determines what this user can access and manage.
                </p>
              </div>

              {/* <div>
                <label className="label">Account Status</label>

                <button
                  type="button"
                  onClick={() => updateField("active", !user.active)}
                  className={`relative mt-1 flex h-11 w-full items-center rounded-xl border px-3 transition-all duration-200 ${
                    user.active
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                      user.active ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        user.active ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>

                  <div className="ml-3 flex flex-col items-start">
                    <span
                      className={`text-sm font-semibold ${
                        user.active ? "text-emerald-700" : "text-slate-600"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {user.active
                        ? "User can access the system"
                        : "User access is disabled"}
                    </span>
                  </div>
                </button>
              </div> */}
            </div>
          </div>

          <div className="card-footer flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Security */}
        <form onSubmit={handlePasswordChange} className="card h-fit">
          <div className="card-header">
            <div>
              <h2 className="card-title">Security</h2>
              <p className="card-description">Manage account credentials.</p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="card-body">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                Change Password
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                The existing password cannot be viewed. Enter a new password to
                replace it.
              </p>
            </div>

            <div className="mt-5">
              <label className="label">New Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input pr-11"
                  placeholder="Enter new password"
                  minLength={8}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="helper-text">
                Use at least 8 characters. A longer passphrase is recommended.
              </p>
            </div>

            <div className="mt-4">
              <label className="label">Confirm New Password</label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pr-11"
                  placeholder="Confirm new password"
                  minLength={8}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <button
              type="submit"
              disabled={passwordSaving || !newPassword || !confirmPassword}
              className="btn-secondary w-full"
            >
              {passwordSaving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <ShieldCheck size={17} />
              )}

              {passwordSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
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
