import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit3, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";

export function UserRowMenu({ user, onEdit, onDelete, onToggleBlock }) {
  const [open, setOpen]   = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref    = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 150);
    }
    setOpen((v) => !v);
  };

  const isBlocked = user.status === "blocked";

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="User actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 w-44 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden animate-fade-in ${
            openUp ? "bottom-8" : "top-8"
          }`}
        >
          <button
            onClick={() => { setOpen(false); onEdit(user); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit User
          </button>

          <button
            onClick={() => { setOpen(false); onToggleBlock(user); }}
            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
              isBlocked
                ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          >
            {isBlocked
              ? <ShieldCheck className="w-3.5 h-3.5" />
              : <ShieldOff   className="w-3.5 h-3.5" />}
            {isBlocked ? "Unblock User" : "Block User"}
          </button>

          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />

          <button
            onClick={() => { setOpen(false); onDelete(user); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove User
          </button>
        </div>
      )}
    </div>
  );
}
