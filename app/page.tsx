"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck, User } from "lucide-react";
import Toast from "@/components/BottomRIghtToast";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const solvyTargetRef = useRef<HTMLDivElement>(null);
  const introSolvyRef = useRef<HTMLDivElement>(null);

  const [introComplete, setIntroComplete] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [showIntroLogo, setShowIntroLogo] = useState(true);

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
    const introLogo = introSolvyRef.current;
    const logoTarget = solvyTargetRef.current;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !introLogo || !logoTarget) {
      setIntroComplete(true);
      setShowLoginPanel(true);
      setShowIntroLogo(false);
      return;
    }

    let cancelled = false;

    async function runIntro() {
      // Wait one frame so the final layout is measurable.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (cancelled) return;

      const targetRect = logoTarget.getBoundingClientRect();

      if (targetRect.width === 0 || targetRect.height === 0) {
        setIntroComplete(true);
        setShowLoginPanel(true);
        setShowIntroLogo(false);
        return;
      }

      /*
       * The temporary logo is positioned exactly over its final target.
       * We then offset it back to the viewport centre for the intro.
       * This keeps the movement accurate at every screen size.
       */
      introLogo.style.left = `${targetRect.left}px`;
      introLogo.style.top = `${targetRect.top}px`;
      introLogo.style.width = `${targetRect.width}px`;
      introLogo.style.height = `${targetRect.height}px`;

      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const offsetX = window.innerWidth / 2 - targetCenterX;
      const offsetY = window.innerHeight / 2 - targetCenterY;

      const centred = `translate3d(${offsetX}px, ${offsetY}px, 0)`;

      /*
       * IMPORTANT:
       * Apply the initial SMALL state before the element is ever visible.
       * This prevents one browser paint at full target size.
       */
      introLogo.style.opacity = "0";
      introLogo.style.transform = `${centred} scale(0.42)`;
      introLogo.style.filter = "blur(6px)";
      introLogo.style.visibility = "hidden";

      /*
       * Commit the small starting state first, then expose the element.
       * Two animation frames ensure layout + paint state are settled.
       */
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (cancelled) return;

      introLogo.style.visibility = "visible";

      // Phase 1: SolvY360 starts smaller in the centre and gently zooms in.
      // There is no overshoot / zoom-out phase.
      const appear = introLogo.animate(
        [
          {
            opacity: 0,
            transform: `${centred} scale(0.42)`,
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            transform: `${centred} scale(0.58)`,
            filter: "blur(0px)",
          },
        ],
        {
          duration: 700,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        },
      );

      try {
        await appear.finished;
      } catch {
        return;
      }

      if (cancelled) return;

      // Small visual hold before the logo travels to its normal position.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 160);
      });

      if (cancelled) return;

      // Phase 2: slide to the final location while continuing to zoom in.
      const dock = introLogo.animate(
        [
          {
            opacity: 1,
            transform: `${centred} scale(0.58)`,
            filter: "blur(0px)",
          },
          {
            opacity: 1,
            transform: "translate3d(0, 0, 0) scale(1)",
            filter: "blur(0px)",
          },
        ],
        {
          duration: 920,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        },
      );

      try {
        await dock.finished;
      } catch {
        return;
      }

      if (cancelled) return;

      /*
       * Dock is now 100% complete.
       *
       * First switch on the real SolvY360 target and remove the temporary
       * travelling copy. The login panel remains completely hidden.
       */
      setIntroComplete(true);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 220);
      });

      if (cancelled) return;

      setShowIntroLogo(false);

      /*
       * Give the logo a short settling beat at its final position.
       * Only after this point is the right-side panel allowed to exist
       * visually. This prevents any pre-animation flash.
       */
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 260);
      });

      if (cancelled) return;

      setShowLoginPanel(true);
    }

    runIntro();

    return () => {
      cancelled = true;

      introLogo.getAnimations().forEach((animation) => {
        animation.cancel();
      });
    };
  }, []);

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-6">
      {/* ================================================= */}
      {/* CINEMATIC BACKGROUND */}
      {/* ================================================= */}

      <div className="login-bg absolute inset-0" />

      <div className="login-orb login-orb-one absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[100px]" />

      <div className="login-orb login-orb-two absolute -bottom-52 right-0 h-[620px] w-[620px] rounded-full bg-cyan-300/20 blur-[120px]" />

      <div className="login-grid absolute inset-0 opacity-[0.035]" />

      {/* ================================================= */}
      {/* OPENING LIGHT SWEEP */}
      {/* ================================================= */}

      <div className="login-light-sweep pointer-events-none absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

      {/* ================================================= */}
      {/* INTRO LOGO */}
      {/* ================================================= */}

      {showIntroLogo && (
        <div
          ref={introSolvyRef}
          className="login-intro-logo pointer-events-none fixed z-[70] flex items-center justify-center"
          style={{
            visibility: "hidden",
            opacity: 0,
          }}
          aria-hidden="true"
        >
          <img
            src="/login_page.png"
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* ================================================= */}
      {/* PAGE CONTENT */}
      {/* ================================================= */}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-20 lg:grid-cols-2">
        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="hidden flex-col justify-center lg:flex">
          <div className="login-badge inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-5 py-2 text-sm font-medium text-[#2563eb] shadow-sm backdrop-blur-xl">
            <ShieldCheck size={24} />
            Case Intelligence Platform
          </div>

          <div
            ref={solvyTargetRef}
            className={`login-visual relative mt-8 flex justify-center lg:justify-start ${
              introComplete ? "login-visual-ready" : ""
            }`}
            style={{
              opacity: introComplete ? 1 : 0,
            }}
          >
            <div className="login-visual-glow absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/25 blur-[70px]" />

            <Image
              src="/login_page.png"
              alt="Customer Inquiry Management Platform"
              width={640}
              height={536}
              priority
              className="relative h-auto w-full max-w-[640px] object-contain"
            />
          </div>

          <p className="login-description mt-6 w-full text-md leading-relaxed text-slate-600">
            Centralize customer complaints, improve cross-functional
            collaboration, monitor SLA performance, and ensure every issue is
            tracked from creation to resolution.
          </p>
        </div>

        {/* ================================================= */}
        {/* LOGIN */}
        {/* ================================================= */}

        <div className="flex items-center justify-center">
          <div
            className={`login-card relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl ${
              showLoginPanel ? "login-card-ready" : ""
            }`}
            style={
              showLoginPanel
                ? undefined
                : {
                    visibility: "hidden",
                    opacity: 0,
                    pointerEvents: "none",
                  }
            }
            aria-hidden={!showLoginPanel}
          >
            {/* Top glow */}

            <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/15 blur-3xl" />

            {/* Header */}

            <div className="login-item login-item-1 relative mb-8 text-center">
              <div className="login-shield relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <div className="login-shield-pulse absolute inset-0 rounded-2xl border border-blue-300" />

                <ShieldCheck className="relative text-[#3b82f6]" size={32} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-slate-500">Sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}

              <div className="login-item login-item-2">
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

              <div className="login-item login-item-3">
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}

              <div className="login-item login-item-4 flex items-center justify-between text-sm">
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

              <div className="login-item login-item-5">
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

              <div className="login-item login-item-6 pt-4">
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
        </div>
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

      <style jsx global>{`
        /*
         * Background enters first
         */
        .login-bg {
          background:
            radial-gradient(
              circle at 18% 20%,
              rgba(59, 130, 246, 0.13),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(20, 184, 166, 0.1),
              transparent 30%
            ),
            #f8fafc;
          animation: loginBackgroundReveal 1.4s ease-out both;
        }

        .login-grid {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.7) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 25%,
            black 75%,
            transparent
          );
          animation: loginGridReveal 1.8s ease both;
        }

        /*
         * Ambient floating light
         */
        .login-orb-one {
          animation:
            loginOrbReveal 1.5s ease-out both,
            loginOrbFloatOne 10s ease-in-out 1.5s infinite alternate;
        }

        .login-orb-two {
          animation:
            loginOrbReveal 1.7s ease-out both,
            loginOrbFloatTwo 12s ease-in-out 1.7s infinite alternate;
        }

        /*
         * Initial cinematic light sweep
         */
        .login-light-sweep {
          opacity: 0;
          transform: translateX(-150%);
          animation: loginLightSweep 1.5s 0.1s ease-in-out both;
        }

        /*
         * Left content
         */
        .login-badge {
          opacity: 0;
          transform: translateY(16px);
          animation: loginFadeUp 0.7s 1.7s ease-out forwards;
        }

        .login-visual {
          opacity: 0;
        }

        .login-visual-ready {
          opacity: 1;
          transition: opacity 0.2s ease;
        }

        .login-visual-glow {
          opacity: 0;
        }

        .login-visual-ready .login-visual-glow {
          animation: loginGlowReveal 0.8s 0.08s ease forwards;
        }

        .login-description {
          opacity: 0;
          transform: translateY(16px);
          animation: loginFadeUp 0.7s 1.9s ease-out forwards;
        }

        /*
         * Login card arrives after scene starts
         */
        .login-intro-logo {
          visibility: hidden;
          opacity: 0;
          will-change: transform, opacity, filter;
          transform-origin: center;
          backface-visibility: hidden;
        }

        /*
         * Keep the card hidden while the logo performs its intro.
         * No layout/styling changes are made to the card itself.
         */
        .login-card {
          visibility: hidden;
          opacity: 0;
          filter: blur(5px);
          pointer-events: none;
        }

        .login-card-ready {
          visibility: visible;
          pointer-events: auto;
          animation: loginCardReveal 0.68s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        /*
         * Inputs/content begin only after the logo reaches its final position.
         */
        .login-item {
          opacity: 0;
          transform: translateY(14px);
          filter: blur(4px);
        }

        .login-card-ready .login-item {
          animation: loginItemReveal 0.58s cubic-bezier(0.16, 1, 0.3, 1)
            forwards;
        }

        .login-card-ready .login-item-1 {
          animation-delay: 0.22s;
        }

        .login-card-ready .login-item-2 {
          animation-delay: 0.34s;
        }

        .login-card-ready .login-item-3 {
          animation-delay: 0.46s;
        }

        .login-card-ready .login-item-4 {
          animation-delay: 0.82s;
        }

        .login-card-ready .login-item-5 {
          animation-delay: 0.7s;
        }

        .login-card-ready .login-item-6 {
          animation-delay: 0.58s;
        }

        /*
         * Shield now joins the post-logo content reveal instead of
         * animating before the login inputs are visible.
         */
        .login-card-ready .login-shield {
          animation: loginShieldEnter 0.7s 0.06s cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .login-shield-pulse {
          opacity: 0;
        }

        .login-card-ready .login-shield-pulse {
          animation: loginShieldPulse 1.25s 0.22s ease-out;
        }

        /*
         * Sign-in button shimmer
         */
        .login-button:hover .login-button-shine {
          animation: loginButtonShine 0.7s ease;
        }

        @keyframes loginBackgroundReveal {
          from {
            opacity: 0;
            transform: scale(1.04);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes loginGridReveal {
          from {
            opacity: 0;
          }

          to {
            opacity: 0.035;
          }
        }

        @keyframes loginOrbReveal {
          from {
            opacity: 0;
            transform: scale(0.7);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes loginOrbFloatOne {
          from {
            translate: 0 0;
          }

          to {
            translate: 70px 45px;
          }
        }

        @keyframes loginOrbFloatTwo {
          from {
            translate: 0 0;
          }

          to {
            translate: -70px -35px;
          }
        }

        @keyframes loginLightSweep {
          0% {
            opacity: 0;
            transform: translateX(-150%);
          }

          25% {
            opacity: 0.6;
          }

          100% {
            opacity: 0;
            transform: translateX(400%);
          }
        }

        @keyframes loginVisualReveal {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
            filter: blur(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes loginCardReveal {
          from {
            opacity: 0;
            filter: blur(6px);
          }

          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes loginItemReveal {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes loginFadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loginGlowReveal {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.7);
          }

          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes loginShieldEnter {
          0% {
            opacity: 0;
            transform: scale(0.55) rotate(-8deg);
          }

          65% {
            opacity: 1;
            transform: scale(1.08) rotate(2deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes loginShieldPulse {
          0% {
            opacity: 0.65;
            transform: scale(0.85);
          }

          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }

        @keyframes loginButtonShine {
          from {
            transform: translateX(-120%) skewX(-20deg);
          }

          to {
            transform: translateX(520%) skewX(-20deg);
          }
        }

        /*
         * Accessibility
         */
        @media (prefers-reduced-motion: reduce) {
          .login-bg,
          .login-grid,
          .login-orb,
          .login-light-sweep,
          .login-badge,
          .login-visual,
          .login-description,
          .login-card,
          .login-item,
          .login-intro-logo,
          .login-shield,
          .login-shield-pulse {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }

          .login-card {
            visibility: visible !important;
            pointer-events: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
