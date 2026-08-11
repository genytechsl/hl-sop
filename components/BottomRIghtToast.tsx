"use client";

import { X } from "lucide-react";

type ToastProps = {
  open: boolean;
  type?: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  confirmButton?: string;
  onClose: () => void;
};

export default function Toast({
  open,
  type = "success",
  title,
  message,
  confirmButton,
  onClose,
}: ToastProps) {
  if (!open) return null;

  const styles = {
    success: {
      border: "border-green-300",
      bg: "bg-green-100",
      iconBg: "bg-green-200",
      icon: "text-green-600",
    },
    error: {
      border: "border-red-300",
      bg: "bg-red-100",
      iconBg: "bg-red-200",
      icon: "text-red-600",
    },
    warning: {
      border: "border-yellow-300",
      bg: "bg-yellow-100",
      iconBg: "bg-yellow-200",
      icon: "text-yellow-600",
    },
    info: {
      border: "border-blue-300",
      bg: "bg-blue-100",
      iconBg: "bg-blue-200",
      icon: "text-blue-600",
    },
  };

  const s = styles[type];

  return (
    <div
      className={`toast-enter 
        fixed
        bottom-6
        right-6
        min-w-[480px]
        min-h-[100px]
        rounded-2xl
        border
        ${s.border}
        ${s.bg}
        shadow-2xl
        p-8
        z-[9999]
        
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
            h-12
            w-12
            rounded-full
            ${s.iconBg}
            flex
            items-center
            justify-center
            shrink-0
          `}
        >
          <svg
            className={`h-6 w-6 ${s.icon}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            {type === "success" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            )}

            {type === "error" && (
              <>
                <path d="M6 18L18 6" />
                <path d="M6 6l12 12" />
              </>
            )}

            {type === "warning" && (
              <>
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </>
            )}

            {type === "info" && (
              <>
                <path d="M12 8h.01" />
                <path d="M11 12h2v5h-2z" />
              </>
            )}
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>

          <p className="mt-1 text-md text-slate-500">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>
      {confirmButton && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="
              button-heading-special
              rounded-xl
              px-5
              py-2.5
              text-sm
              font-medium
              transition
              hover:scale-[1.02]
            "
          >
            {confirmButton}
          </button>
        </div>
      )}
    </div>
  );
}
