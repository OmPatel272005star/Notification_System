import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, MoreVertical, Trash2, Edit3, Eye, X, Plug,
  AlertTriangle, CheckCircle,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";

// ── Provider config ───────────────────────────────────────────────────────────
const PROVIDERS = [
  { id: "resend",    name: "Resend",       bg: "bg-black dark:bg-gray-800",  letter: "R" },
  { id: "sendgrid",  name: "SendGrid",     bg: "bg-[#1A82E2]",               letter: "SG" },
  { id: "mailgun",   name: "Mailgun",      bg: "bg-[#F06B26]",               letter: "MG" },
  { id: "ses",       name: "AWS SES",      bg: "bg-[#FF9900]",               letter: "SES" },
  { id: "smtp",      name: "Custom SMTP",  bg: "bg-gray-600",                letter: "⚙" },
];

const PROV_MAP = Object.fromEntries(PROVIDERS.map(p => [p.name, p]));

const INIT_CONNECTIONS = [
  { id: 1, name: "Primary Mailer",    provider: "Resend",      senderEmail: "noreply@mailflow.io",  senderName: "MailFlow",  apiKey: "re_••••••••" },
  { id: 2, name: "Marketing Emails",  provider: "SendGrid",    senderEmail: "team@mailflow.io",     senderName: "MailFlow Team", apiKey: "SG.••••••••" },
  { id: 3, name: "Transactional",     provider: "AWS SES",     senderEmail: "alerts@mailflow.io",   senderName: "MailFlow Alerts", apiKey: "AKIA••••••••" },
];

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full animate-scale-in ${wide ? "max-w-lg" : "max-w-md"}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Provider avatar ───────────────────────────────────────────────────────────
function ProvAvatar({ provider, size = "sm" }) {
  const cfg = PROV_MAP[provider] || { bg: "bg-gray-500", letter: "?" };
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${cfg.bg} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {cfg.letter}
    </div>
  );
}

// ── Three-dot row menu ────────────────────────────────────────────────────────
function RowMenu({ conn, onView, onEdit, onDelete }) {
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
      setOpenUp(window.innerHeight - rect.bottom < 150);
    }
    setOpen(v => !v);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Connection actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className={`absolute right-0 z-50 w-40 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden animate-fade-in ${openUp ? "bottom-8" : "top-8"}`}>
          {/* View */}
          <button
            onClick={() => { setOpen(false); onView(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>

          {/* Edit */}
          <button
            onClick={() => { setOpen(false); onEdit(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>

          {/* Divider */}
          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />

          {/* Delete */}
          <button
            onClick={() => { setOpen(false); onDelete(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit form dialog ────────────────────────────────────────────────────
function ConnectionFormDialog({ open, onClose, onSave, initial }) {
  const isEdit = Boolean(initial);
  const blank = { name: "", provider: "Resend", apiKey: "", senderEmail: "", senderName: "" };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(initial ? { name: initial.name, provider: initial.provider, apiKey: initial.apiKey || "", senderEmail: initial.senderEmail, senderName: initial.senderName } : blank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} wide>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center shadow-lg shadow-[#6D5EF5]/20">
            <Plug className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {isEdit ? "Edit Connection" : "Add Connection"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update your connection details." : "Configure a new email provider connection."}
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

        {/* Provider */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Provider <span className="text-red-400">*</span>
          </label>
          <select
            value={form.provider}
            onChange={e => set("provider", e.target.value)}
            className={inputCls}
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Connection Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Connection Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Primary Mailer"
            value={form.name}
            onChange={e => set("name", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            API Key <span className="text-red-400">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter your API key"
            value={form.apiKey}
            onChange={e => set("apiKey", e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </div>

        {/* Sender Name + Sender Email side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Sender Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MailFlow"
              value={form.senderName}
              onChange={e => set("senderName", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Sender Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="noreply@company.com"
              value={form.senderEmail}
              onChange={e => set("senderEmail", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

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
            {isEdit ? "Save Changes" : "Add Connection"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── View dialog ───────────────────────────────────────────────────────────────
function ViewDialog({ open, onClose, conn }) {
  if (!conn) return null;
  const rows = [
    ["Connection Name", conn.name],
    ["Provider", conn.provider],
    ["Sender Name", conn.senderName],
    ["Sender Email", conn.senderEmail],
    ["API Key", conn.apiKey],
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
        <div className="flex items-center gap-3">
          <ProvAvatar provider={conn.provider} size="md" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{conn.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{conn.provider}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium max-w-[200px] truncate text-right">{value}</span>
          </div>
        ))}
        <button
          onClick={onClose}
          className="w-full mt-2 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, conn }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Delete Connection</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">{conn?.name}</span>?
            This action cannot be undone.
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
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConnectionPage() {
  const { addToast } = useToast();
  const [connections, setConnections] = useState(INIT_CONNECTIONS);
  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [viewTarget, setViewTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = connections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.provider.toLowerCase().includes(search.toLowerCase()) ||
    c.senderEmail.toLowerCase().includes(search.toLowerCase())
  );

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleAdd = (form) => {
    if (!form.name.trim())        { addToast("Connection name is required", "error"); return; }
    if (!form.apiKey.trim())      { addToast("API key is required", "error"); return; }
    if (!form.senderEmail.includes("@")) { addToast("Valid sender email required", "error"); return; }
    if (!form.senderName.trim())  { addToast("Sender name is required", "error"); return; }
    const nc = { id: Date.now(), ...form };
    setConnections(p => [...p, nc]);
    setShowAdd(false);
    addToast(`Connection "${form.name}" added`, "success");
  };

  const handleEdit = (form) => {
    setConnections(p => p.map(c => c.id === editTarget.id ? { ...c, ...form } : c));
    setEditTarget(null);
    addToast("Connection updated", "success");
  };

  const handleDelete = () => {
    setConnections(p => p.filter(c => c.id !== deleteTarget.id));
    addToast(`"${deleteTarget.name}" deleted`, "success");
    setDeleteTarget(null);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {connections.length} connection{connections.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Connection
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search connections..."
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
              {["Name", "Email", "Connection Source", ""].map((h, i, arr) => (
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
                <td colSpan={4} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#6D5EF5]/10 flex items-center justify-center">
                      <Plug className="w-6 h-6 text-[#6D5EF5]" />
                    </div>
                    <p className="text-sm text-gray-400">
                      {search ? "No connections match your search." : "No connections yet. Add your first one."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(conn => (
              <tr key={conn.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">

                {/* Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProvAvatar provider={conn.provider} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{conn.name}</span>
                  </div>
                </td>

                {/* Sender Email */}
                <td className="px-5 py-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{conn.senderEmail}</span>
                </td>

                {/* Provider / Connection Source */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] dark:bg-[#6D5EF5]/20 dark:text-[#8B7CFF]">
                    {conn.provider}
                  </span>
                </td>

                {/* Three-dot menu */}
                <td className="px-5 py-4 text-right">
                  <RowMenu
                    conn={conn}
                    onView={setViewTarget}
                    onEdit={setEditTarget}
                    onDelete={setDeleteTarget}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Connection Dialog */}
      <ConnectionFormDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        initial={null}
      />

      {/* Edit Connection Dialog */}
      <ConnectionFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget}
      />

      {/* View Dialog */}
      <ViewDialog
        open={Boolean(viewTarget)}
        onClose={() => setViewTarget(null)}
        conn={viewTarget}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        conn={deleteTarget}
      />
    </div>
  );
}
