"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (res.ok) {
      const data = await res.json();

      router.replace(data.redirectTo);
      router.refresh();

      return;
    }

    alert("Invalid username or password");

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6">
      {/* Background */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#dbeafe,transparent_45%)]" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-20 lg:grid-cols-2">
        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="hidden flex-col justify-center lg:flex">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-5 py-2 text-sm font-medium text-[#2563eb]">
            <ShieldCheck size={24} />
            Case Intelligence Platform
          </div>

          {/* <h1 className="mt-8 text-5xl font-bold leading-tight text-slate-900">
            Customer Complaint
            <br />
            Management Platform
          </h1> */}

          {/* Logo here */}
          <div className="mt-8 flex justify-center lg:justify-start">
            <Image
              src="/login_page.png"
              alt="Customer Inquiry Management Platform"
              width={640}
              height={536}
              priority
              className="h-auto w-full max-w-[640px] object-contain"
            />
          </div>

          <p className="mt-6 w-full text-md text-slate-600">
            Centralize customer complaints, improve cross-functional
            collaboration, monitor SLA performance, and ensure every issue is
            tracked from creation to resolution.
          </p>

          {/* <div className="mt-12 flex gap-14">
            <div>
              <h3 className="text-3xl font-bold text-[#3b82f6]">100%</h3>
              <p className="mt-1 text-slate-500">Complaint Traceability</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#3b82f6]">24/7</h3>
              <p className="mt-1 text-slate-500">SLA Monitoring</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#3b82f6]">Secure</h3>
              <p className="mt-1 text-slate-500">Role-Based Access</p>
            </div>
          </div> */}
        </div>

        {/* ================================================= */}
        {/* LOGIN CARD */}
        {/* ================================================= */}

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <ShieldCheck className="text-[#3b82f6]" size={32} />
              </div>

              <h2 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-slate-500">Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#3b82f6] focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#2563eb]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember */}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input type="checkbox" className="accent-[#3b82f6]" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-medium text-[#3b82f6] hover:text-[#2563eb]"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#2563eb] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Powered by */}

              {/* Powered By */}

              <div className="pt-4">
                <div className="flex items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-5">
                  {/* Logo */}

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                    <img
                      src="/images/logo-only.png"
                      alt="GenY Technologies"
                      className="h-12 w-auto object-contain"
                    />
                  </div>

                  {/* Text */}

                  <div className="text-left">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                      Powered by
                    </p>

                    <h3 className="text-base font-semibold text-slate-800">
                      GenY Technologies
                    </h3>

                    <p className="text-xs text-slate-500">
                      Smart Enterprise Solutions
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
