// src/components/ToastNotification.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import "./toast.css";

/**
 * Toast shape:
 * { id, type, message, duration }
 *
 * Exports:
 * - ToastProvider (component) — wrap app
 * - useToast (hook) — show toasts
 */

/* context (internal) */
const ToastContext = createContext(null);

/* =======================
   Toast Provider + API
   ======================= */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // auto-remove after duration
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const toastAPI = {
    success: (msg, duration) => showToast(msg, "success", duration),
    error: (msg, duration) => showToast(msg, "error", duration),
    warn: (msg, duration) => showToast(msg, "warn", duration),
    info: (msg, duration) => showToast(msg, "info", duration),
    custom: (msg, duration) => showToast(msg, "custom", duration),
  };

  return (
    <ToastContext.Provider value={toastAPI}>
      {children}

      {/* Toast container (z-50 is Tailwind default and safe) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/* Hook consumers call this */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // helpful dev error if provider missing
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

/* ===========================================
   Single Toast Item component (internal)
   =========================================== */
function ToastItem({ toast, onClose }) {
  const { type, message } = toast;

  const typeStyles = {
    success: "bg-emerald-700/80 border-emerald-500 text-emerald-100",
    error: "bg-red-700/80 border-red-500 text-red-100",
    warn: "bg-yellow-600/80 border-yellow-400 text-yellow-50",
    info: "bg-slate-700/80 border-slate-500 text-slate-100",
    custom: "bg-blue-700/80 border-blue-500 text-blue-100",
  };

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertTriangle size={18} />,
    warn: <AlertTriangle size={18} />,
    info: <Info size={18} />,
    custom: <Info size={18} />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border 
        shadow-lg backdrop-blur-md aq-animate-slideIn
        ${typeStyles[type] || typeStyles.info}
      `}
      style={{ minWidth: 260 }}
    >
      <div className="shrink-0">{icons[type]}</div>

      <div className="text-sm font-medium flex-1">{message}</div>

      <button onClick={onClose} className="text-white/70 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
