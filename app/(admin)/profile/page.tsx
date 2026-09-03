"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import Toast from "@/components/BottomRIghtToast";

interface Profile {
  id: string;
  name: string;
  designation: string;
  department: string | null;
  email: string;
  username: string;
  role: string;
  active: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);

      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load profile");
      }

      setProfile(data);
    } catch (error) {
      console.error(error);

      setToast({
        open: true,
        type: "error",
        title: "Error",
        message: "Unable to load your profile.",
      });
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    if (!profile) return;

    setProfile({
      ...profile,
      [field]: value,
    });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();

    if (!profile) return;

    try {
      setSaving(true);

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          designation: profile.designation,
          department: profile.department,
          email: profile.email,
          username: profile.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data);

      setToast({
        open: true,
        type: "success",
        title: "Profile Updated",
        message: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error(error);

      setToast({
        open: true,
        type: "error",
        title: "Update Failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(event: FormEvent) {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword.length < 8) {
      setToast({
        open: true,
        type: "warning",
        title: "Invalid Password",
        message: "Password must contain at least 8 characters.",
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        open: true,
        type: "warning",
        title: "Passwords Do Not Match",
        message: "Please make sure both passwords are identical.",
      });

      return;
    }

    try {
      setPasswordSaving(true);

      const response = await fetch("/api/profile/password", {
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
      }

      setNewPassword("");
      setConfirmPassword("");

      setToast({
        open: true,
        type: "success",
        title: "Password Changed",
        message: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error(error);

      setToast({
        open: true,
        type: "error",
        title: "Password Change Failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to change your password.",
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

  if (!profile) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">Unable to load your profile.</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>

          <p className="page-description">
            Manage your personal information and account credentials.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================================================= */}
        {/* PROFILE INFORMATION */}
        {/* ================================================= */}

        <form onSubmit={handleSave} className="card lg:col-span-2">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User size={21} />
              </div>

              <div>
                <h2 className="card-title">Personal Information</h2>

                <p className="card-description">
                  Update your personal account information.
                </p>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="form-grid">
              {/* Employee ID */}

              <div>
                <label className="label">Employee ID</label>

                <input
                  value={profile.id}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />
              </div>

              {/* Username */}

              <div>
                <label className="label">Username</label>

                <input
                  value={profile.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Name */}

              <div>
                <label className="label">Full Name</label>

                <input
                  value={profile.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Designation */}

              <div>
                <label className="label">Designation</label>

                <select
                  value={profile.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  className="select"
                  required
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

              {/* Department */}

              <div>
                <label className="label">Department</label>

                <input
                  value={profile.department || ""}
                  onChange={(e) => updateField("department", e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Email */}

              <div>
                <label className="label">Email Address</label>

                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input"
                  required
                />
              </div>

              {/* Role */}

              <div>
                <label className="label">Access Role</label>

                <input
                  value={profile.role}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />

                <p className="helper-text">
                  Your access role can only be changed by an administrator.
                </p>
              </div>

              {/* Status */}

              <div>
                <label className="label">Account Status</label>

                <input
                  value={profile.active ? "Active" : "Inactive"}
                  disabled
                  className="input bg-slate-50 text-slate-500"
                />

                <p className="helper-text">
                  Account status can only be changed by an administrator.
                </p>
              </div>
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

        {/* ================================================= */}
        {/* SECURITY */}
        {/* ================================================= */}

        <form onSubmit={handlePasswordChange} className="card h-fit">
          <div className="card-header">
            <div>
              <h2 className="card-title">Security</h2>

              <p className="card-description">Manage your account password.</p>
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
                Your existing password cannot be viewed. Enter a new password to
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
