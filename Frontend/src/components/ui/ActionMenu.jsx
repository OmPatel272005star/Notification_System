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
