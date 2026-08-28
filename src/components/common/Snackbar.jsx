"use client";

import { useSnackbar } from "@/context/SnackbarContext";
import { CheckCircle, X, AlertCircle } from "lucide-react";

export default function Snackbar() {
  const { snackbar, hide } = useSnackbar();

  if (!snackbar?.visible) return null;

  const getIcon = () => {
    switch (snackbar.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (snackbar.type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          icon: "text-green-600",
          button: "hover:bg-green-100",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          icon: "text-red-600",
          button: "hover:bg-red-100",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: "text-blue-600",
          button: "hover:bg-blue-100",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          icon: "text-gray-600",
          button: "hover:bg-gray-100",
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md w-full snackbar-enter">
      <div
        className={`${styles.bg} ${styles.border} border rounded-2xl shadow-xl shadow-black/5 p-4 flex items-start gap-3 backdrop-blur-sm`}
      >
        <div className={`${styles.icon} shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center`}>{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className={`${styles.text} text-sm font-medium leading-snug`}>{snackbar.message}</p>
          {snackbar.validationErrors &&
            snackbar.validationErrors.length > 1 && (
              <ul
                className={`${styles.text} text-xs mt-2 list-disc list-inside space-y-1`}
              >
                {snackbar.validationErrors.slice(1).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
        </div>
        <button
          onClick={hide}
          className={`${styles.text} ${styles.button} p-1.5 rounded-lg transition-colors shrink-0`}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
