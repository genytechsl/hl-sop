"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Access Restricted
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            You don&apos;t have access to this page
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            Your account does not have the required permission to access this
            area of the Case Intelligence Platform.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Home size={16} />
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
