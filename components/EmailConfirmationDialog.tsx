"use client";

import { Mail, Send, X } from "lucide-react";

interface Props {
  open: boolean;
  ticketNumber: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function EmailConfirmationDialog({
  open,
  ticketNumber,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}

        <div className="border-b border-slate-100 px-8 py-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Mail className="text-[#2563eb]" size={30} />
          </div>

          <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
            Ticket Created Successfully
          </h2>

          <p className="mt-3 text-center text-slate-500">
            Ticket
            <span className="font-semibold text-slate-800">
              {" "}
              {ticketNumber}
            </span>{" "}
            has been created.
          </p>
        </div>

        {/* Body */}

        <div className="px-8 py-6">
          <p className="text-center text-slate-600">
            Would you like to send an email notification to the customer and the
            assigned action owner?
          </p>
        </div>

        {/* Footer */}

        <div className="flex gap-3 border-t border-slate-100 px-8 py-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 py-3 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <X size={18} />
              Skip
            </span>
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-[#3b82f6] py-3 font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-60"
          >
            {loading ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send size={18} />
                Send Email
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
