import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const colors = {
    success: "border-l-4 border-green-500 bg-white dark:bg-gray-900",
    error: "border-l-4 border-red-500 bg-white dark:bg-gray-900",
    warning: "border-l-4 border-yellow-500 bg-white dark:bg-gray-900",
    info: "border-l-4 border-blue-500 bg-white dark:bg-gray-900",
  };
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${colors[toast.type]} min-w-[280px] max-w-sm animate-slide-up`}
    >
      <span>{icons[toast.type]}</span>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1">
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
      >
        ×
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);