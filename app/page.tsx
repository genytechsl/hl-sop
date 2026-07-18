"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (username === "admin@example.com" && password === "admin123") {
      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 overflow-hidden relative flex items-center justify-center px-4">
      {/* Background Effects */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}

        <div className="hidden lg:block">
          <span className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm">
            Unified Customer Service Platform
          </span>

          <h1 className="mt-8 text-5xl font-bold text-white leading-tight">
            Deliver consistent customer service with accountability.
          </h1>

          <p className="mt-6 text-slate-400 text-lg max-w-xl">
            Centralize customer complaints, streamline cross-department
            collaboration, enforce SLA compliance, and ensure every customer
            concern is tracked, owned, and resolved through a transparent
            operational workflow.
          </p>

          <div className="mt-12 flex gap-6">
            <div>
              <h3 className="text-3xl font-bold text-white">100%</h3>
              <p className="text-slate-500">Complaint Traceability</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">SLA</h3>
              <p className="text-slate-500">Driven Resolution Tracking</p>
            </div>
          </div>
        </div>

        {/* Login Card */}

        <div className="w-full">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>

              <p className="text-slate-400 mt-2">Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* username */}

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Username
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setusername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember */}

              <div className="flex justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="accent-blue-500" />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 active:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
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

              <div className="pt-4 text-center text-sm text-slate-500">
                Demo Credentials:
                <br />
                admin@example.com
                <br />
                admin123
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
