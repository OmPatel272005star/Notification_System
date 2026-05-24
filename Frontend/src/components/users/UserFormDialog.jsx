import { useState, useEffect } from "react";
import { X, UserPlus, Lock } from "lucide-react";
import { UserModal } from "./UserModal";
import { ROLES, ROLE_LABEL, INPUT_CLS } from "./userConstants";

export function UserFormDialog({ open, onClose, onSave, initial, loading }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({ name: "", email: "", role: "viewer", password: "" });

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, email: initial.email, role: initial.role, password: "" }
          : { name: "", email: "", role: "viewer", password: "" }
      );
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <UserModal open={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center shadow-lg shadow-[#6D5EF5]/20">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {isEdit ? "Edit User" : "Add User"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update user details below." : "Fill in the details to add a new user."}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Enter the user name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            placeholder="User e-mail address"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            disabled={isEdit}
            className={`${INPUT_CLS} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            className={INPUT_CLS}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </div>

        {!isEdit && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={`${INPUT_CLS} pl-10`}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all font-medium disabled:opacity-60"
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Add User"}
          </button>
        </div>
      </div>
    </UserModal>
  );
}
