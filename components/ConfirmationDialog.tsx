"use client";

import { ReactNode, useEffect } from "react";
import { AlertTriangle, X, LoaderCircle, CheckCircle2 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;

  confirmText?: string;
  cancelText?: string;

  showCancel?: boolean;

  variant?: "primary" | "danger" | "success";

  loading?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  open,
  title,
  description,

  confirmText = "Confirm",
  cancelText = "Cancel",

  variant = "primary",

  loading = false,
  showCancel = true,

  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, [onCancel]);

  if (!open) return null;

  const colors = {
    primary: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: <AlertTriangle size={28} />,
    },

    danger: {
      bg: "bg-red-100",
      text: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
      icon: <AlertTriangle size={28} />,
    },

    success: {
      bg: "bg-green-100",
      text: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
      icon: <CheckCircle2 size={28} />,
    },
  };

  const theme = colors[variant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background */}

      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog */}

      <div
        className="
          relative
          w-full
          max-w-md
          mx-4

          rounded-3xl

          bg-white

          border
          border-slate-200

          shadow-2xl

          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* Close */}

        <button
          onClick={onCancel}
          className="
            absolute
            right-5
            top-5

            h-9
            w-9

            rounded-xl

            hover:bg-slate-100

            transition
          "
        >
          <X size={18} className="mx-auto" />
        </button>

        <div className="p-8">
          {/* Icon */}

          <div
            className={`
              w-16
              h-16
              rounded-2xl

              flex
              items-center
              justify-center

              ${theme.bg}
              ${theme.text}
            `}
          >
            {theme.icon}
          </div>

          {/* Title */}

          <h2 className="mt-6 text-2xl font-bold text-slate-900">{title}</h2>

          {/* Description */}

          <div className="mt-3 text-slate-600 leading-7">{description}</div>

          {/* Buttons */}

          <div className="mt-8 flex justify-end gap-3">
            {showCancel && (
              <button
                onClick={onCancel}
                disabled={loading}
                className="
        px-5
        h-11
        rounded-xl
        border
        border-slate-300
        hover:bg-slate-100
        transition
      "
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
      h-11
      px-6
      rounded-xl
      text-white
      font-medium
      transition
      disabled:opacity-60
      flex
      items-center
      gap-2
      ${theme.button}
    `}
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}

              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
