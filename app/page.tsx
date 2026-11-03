"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ArrowRight, User } from "lucide-react";
import Toast from "@/components/BottomRIghtToast";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });
  useEffect(() => {
    if (!toast.open) return;
    const timer = setTimeout(
      () => setToast((prev) => ({ ...prev, open: false })),
      7000,
    );
    return () => clearTimeout(timer);
  }, [toast.open]);
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (data.status === 400) {
        setToast({
          open: true,
          type: "warning",
          title: "Missing Information",
          message: data.message,
        });
      }

      if (res.ok) {
        router.replace(data.redirectTo);
        router.refresh();
        return;
      }

      setToast({
        open: true,
        type: "error",
        title: "Login Unsuccessful",
        message: "Username/Email & password do not match. Please try again.",
      });
    } catch (error) {
      console.error("Login request failed:", error);

      setToast({
        open: true,
        type: "error",
        title: "Connection Error",
        message: "Unable to sign in. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page grid min-h-dvh bg-slate-50 lg:grid-cols-2">
      <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-slate-950 p-7 text-white sm:p-10 lg:min-h-dvh lg:p-14">
        <img
          src="/images/login-building.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/20 to-slate-950/90" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <img
              src="/solvy_brand.png"
              alt="Solvy360 — Homelands Case Intelligence Platform"
              className="h-auto w-full max-w-[432px] object-contain"
            />
          </div>
        </div>
        <div className="relative mt-14 max-w-md">
          <p className="text-2xl font-semibold leading-tight sm:text-4xl">
            Every case matters.
            <br />
            Every resolution builds trust.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-200">
            Connect your teams, track every inquiry, and turn customer concerns
            into confident resolutions.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:py-14">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mb-8 mt-2 text-slate-500">Sign in to continue</p>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}

            <div className="">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Username or Email
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white/80 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:-translate-y-[1px] focus:border-[#3b82f6] focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Password */}

            <div className="">
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
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white/80 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:-translate-y-[1px] focus:border-[#3b82f6] focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#2563eb]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="accent-[#3b82f6]" />
                Remember me
              </label>

              <button
                type="button"
                className="font-medium text-[#3b82f6] transition hover:text-[#2563eb]"
              >
                Forgot Password?
              </button>
            </div>

            {/* Button */}

            <div className="">
              <button
                type="submit"
                disabled={loading}
                className="login-button group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#3b82f6] font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2563eb] hover:shadow-xl hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="login-button-shine absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/20" />

                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span className="relative">Sign In</span>

                    <ArrowRight
                      size={18}
                      className="relative transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </div>

            {/* Powered By */}

            <div className="pt-4">
              <div className="flex items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-6 py-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    src="/images/logo-only.png"
                    alt="GenY Technologies"
                    className="h-12 w-auto object-contain"
                  />
                </div>

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
      </section>
      <Toast
        {...toast}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}
