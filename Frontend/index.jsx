// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  onClick,
  type = "button",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    secondary:
      "border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 focus:ring-gray-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    success:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    warning:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    danger: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    purple:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status) {
  const map = {
    Published: "success",
    Active: "success",
    Draft: "default",
    Approved: "info",
    Scheduled: "warning",
    Failed: "danger",
    Pending: "warning",
    "Pending Approval": "orange",
    Completed: "success",
    Deactivated: "default",
    Deleted: "danger",
    Email: "info",
    SMS: "purple",
    WhatsApp: "success",
    "Web Push": "orange",
  };
  return map[status] || "default";
}

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  className = "",
  helper,
  error,
  disabled,
  maxLength,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        className={`px-3 py-2 text-sm rounded-lg border transition-colors
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800
          ${error ? "border-red-500 focus:ring-red-500" : ""}`}
      />
      {helper && <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  required,
  className = "",
  disabled,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-2 text-sm rounded-lg border transition-colors
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          )
        )}
      </select>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-thin flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = "", size = "md" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  const colors = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {initials || "?"}
    </div>
  );
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Delete", danger = true }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${danger ? "bg-red-100 dark:bg-red-900/40" : "bg-yellow-100 dark:bg-yellow-900/40"}`}>
          🗑️
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="text-5xl">{icon}</div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ columns, data, actions }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key] || "—"}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dropdown Menu ────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
export function ActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-1">
          {items.map((item, i) =>
            item === "divider" ? (
              <div key={i} className="my-1 border-t border-gray-100 dark:border-gray-800" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${item.danger ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}