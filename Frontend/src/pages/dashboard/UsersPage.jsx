import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, MoreVertical, Trash2, Edit3, ShieldOff, ShieldCheck, X, UserPlus, AlertTriangle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";

// ── Seed data ────────────────────────────────────────────────────────────────
const ROLES = ["Owner", "Admin", "Editor", "Viewer"];

const ROLE_STYLE = {
  Owner:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  Admin:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Editor: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  Viewer: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const INIT_USERS = [
  { id: 1, name: "Om Patel",      email: "om@mailflow.io",    role: "Owner",  status: "Active",   initials: "OP", color: "from-purple-500 to-purple-600" },
  { id: 2, name: "Sarah Johnson", email: "sarah@mailflow.io", role: "Admin",  status: "Active",   initials: "SJ", color: "from-blue-500 to-blue-600" },
  { id: 3, name: "Mike Ross",     email: "mike@mailflow.io",  role: "Editor", status: "Active",   initials: "MR", color: "from-emerald-500 to-emerald-600" },
  { id: 4, name: "Emma Davis",    email: "emma@mailflow.io",  role: "Viewer", status: "Blocked",  initials: "ED", color: "from-gray-400 to-gray-500" },
];

function getInitials(name, email) {
  if (name && name.trim()) return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return email ? email[0].toUpperCase() : "?";
}

const AVATAR_COLORS = [
  "from-purple-500 to-purple-600",
  "from-blue-500 to-blue-600",
  "from-teal-500 to-teal-600",
  "from-pink-500 to-pink-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
];

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Three-dot dropdown ────────────────────────────────────────────────────────
function RowMenu({ user, onEdit, onDelete, onToggleBlock }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // dropdown is ~132px tall; if less space below, open upward
      setOpenUp(window.innerHeight - rect.bottom < 150);
    }
    setOpen(v => !v);
  };

  const isBlocked = user.status === "Blocked";

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
        <div className={`absolute right-0 z-50 w-44 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden animate-fade-in ${
          openUp ? "bottom-8" : "top-8"
        }`}>
          {/* Edit */}
          <button
            onClick={() => { setOpen(false); onEdit(user); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit User
          </button>

          {/* Block / Unblock */}
          <button
            onClick={() => { setOpen(false); onToggleBlock(user); }}
            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
              isBlocked
                ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            }`}
          >
            {isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
            {isBlocked ? "Unblock User" : "Block User"}
          </button>

          {/* Divider */}
          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />

          {/* Remove */}
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

// ── Add / Edit form dialog ────────────────────────────────────────────────────
function UserFormDialog({ open, onClose, onSave, initial }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({ name: "", email: "", role: "Viewer" });

  useEffect(() => {
    if (open) setForm(initial ? { name: initial.name, email: initial.email, role: initial.role } : { name: "", email: "", role: "Viewer" });
  }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose}>
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
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Enter the user name"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            placeholder="User e-mail address"
            value={form.email}
            onChange={e => set("email", e.target.value)}
            disabled={isEdit}
            className={`${inputCls} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Role</label>
          <select value={form.role} onChange={e => set("role", e.target.value)} className={inputCls}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Info note */}
        {!isEdit && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              An invitation email will be sent to this address. They'll be able to join after accepting.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all font-medium"
          >
            {isEdit ? "Save Changes" : "Add User"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, user }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Remove User</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Are you sure you want to remove <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name || user?.email}</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState(INIT_USERS);
  const [search, setSearch] = useState("");

  // dialogs
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);   // user object or null
  const [deleteTarget, setDeleteTarget] = useState(null); // user object or null

  // filtered list
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleAdd = (form) => {
    if (!form.email.includes("@")) { addToast("A valid email is required", "error"); return; }
    const initials = getInitials(form.name, form.email);
    const color = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    const nu = { id: Date.now(), name: form.name || form.email.split("@")[0], email: form.email, role: form.role, status: "Active", initials, color };
    setUsers(p => [...p, nu]);
    setShowAdd(false);
    addToast(`User ${nu.name} added successfully`, "success");
  };

  const handleEdit = (form) => {
    setUsers(p => p.map(u => u.id === editTarget.id ? { ...u, name: form.name || u.name, role: form.role, initials: getInitials(form.name, u.email) } : u));
    setEditTarget(null);
    addToast("User updated", "success");
  };

  const handleDelete = () => {
    setUsers(p => p.filter(u => u.id !== deleteTarget.id));
    addToast(`${deleteTarget.name || deleteTarget.email} removed`, "success");
    setDeleteTarget(null);
  };

  const handleToggleBlock = (user) => {
    const next = user.status === "Blocked" ? "Active" : "Blocked";
    setUsers(p => p.map(u => u.id === user.id ? { ...u, status: next } : u));
    addToast(`${user.name} ${next === "Blocked" ? "blocked" : "unblocked"}`, next === "Blocked" ? "error" : "success");
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} · {users.filter(u => u.status === "Active").length} active
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl">
        <table className="min-w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
            <tr>
              {["User", "Email", "Status", "Role", ""].map((h, i, arr) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    i === 0 ? "rounded-tl-xl" : i === arr.length - 1 ? "rounded-tr-xl" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                  No users match your search.
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">

                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {u.initials}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[140px]">{u.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{u.email}</span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    u.status === "Active"  ? "text-emerald-600 dark:text-emerald-400" :
                    u.status === "Blocked" ? "text-red-500 dark:text-red-400" :
                    "text-gray-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      u.status === "Active"  ? "bg-emerald-500" :
                      u.status === "Blocked" ? "bg-red-500" :
                      "bg-gray-400"
                    }`} />
                    {u.status}
                  </span>
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLE[u.role] || ROLE_STYLE.Viewer}`}>
                    {u.role}
                  </span>
                </td>

                {/* Three-dot menu */}
                <td className="px-5 py-4 text-right">
                  <RowMenu
                    user={u}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                    onToggleBlock={handleToggleBlock}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Dialog */}
      <UserFormDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        initial={null}
      />

      {/* Edit User Dialog */}
      <UserFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        user={deleteTarget}
      />
    </div>
  );
}
