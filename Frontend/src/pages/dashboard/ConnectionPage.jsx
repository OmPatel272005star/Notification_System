import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, MoreVertical, Trash2, Edit3, Eye, X, Plug,
  AlertTriangle, CheckCircle, XCircle, Clock, Loader2, FlaskConical,
  KeyRound, Server,
} from "lucide-react";
import { useToast }       from "../../hooks/useToast";
import { useConnections } from "../../context/ConnectionContext";

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

// ── Provider display map ──────────────────────────────────────────────────────
const PROVIDER_LABELS = {
  brevo_api: "Brevo API",
  smtp:      "Custom SMTP",
};

const PROVIDER_COLORS = {
  brevo_api: "bg-[#0092FF]",
  smtp:      "bg-gray-500",
};

const PROVIDER_INITIALS = {
  brevo_api: "B",
  smtp:      "⚙",
};

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === "ok") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
      <CheckCircle className="w-3 h-3" /> Verified
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      <Clock className="w-3 h-3" /> Untested
    </span>
  );
}

// ── Provider avatar ───────────────────────────────────────────────────────────
function ProvAvatar({ provider, size = "sm" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const bg = PROVIDER_COLORS[provider] || "bg-gray-500";
  return (
    <div className={`${sz} ${bg} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {PROVIDER_INITIALS[provider] || "?"}
    </div>
  );
}

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

// ── Three-dot row menu ────────────────────────────────────────────────────────
function RowMenu({ conn, onView, onEdit, onDelete, onTest, testing }) {
  const [open, setOpen]   = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref    = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 160);
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
        <div className={`absolute right-0 z-50 w-44 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden animate-fade-in ${openUp ? "bottom-8" : "top-8"}`}>
          <button onClick={() => { setOpen(false); onView(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button onClick={() => { setOpen(false); onEdit(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => { setOpen(false); onTest(conn._id); }} disabled={testing}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#6D5EF5] hover:bg-[#6D5EF5]/5 dark:hover:bg-[#6D5EF5]/10 transition-colors disabled:opacity-50">
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
            {testing ? "Testing…" : "Test"}
          </button>
          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />
          <button onClick={() => { setOpen(false); onDelete(conn); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Add / Edit form dialog ────────────────────────────────────────────────────
const BLANK_BREVO = { name: "", email: "", provider: "brevo_api", brevo_api_key: "" };
const BLANK_SMTP  = { name: "", email: "", provider: "smtp", smtp_host: "", smtp_port: 587, smtp_user: "", smtp_pass: "", smtp_secure: false };

function ConnectionFormDialog({ open, onClose, onSave, initial, saving }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(BLANK_BREVO);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        name:         initial.name     || "",
        email:        initial.email    || "",
        provider:     initial.provider || "brevo_api",
        brevo_api_key: "••••••••",      // always show mask when editing
        smtp_host:    initial.smtp_host || "",
        smtp_port:    initial.smtp_port || 587,
        smtp_user:    initial.smtp_user || "",
        smtp_pass:    "••••••••",
        smtp_secure:  Boolean(initial.smtp_secure),
      });
    } else {
      setForm(BLANK_BREVO);
    }
  }, [open, initial]);

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isBrevo = form.provider === "brevo_api";

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
              {isEdit ? "Edit Connection" : "Add Email Connection"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? "Update your connection credentials." : "Configure a sender to use in campaigns."}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">

        {/* Provider toggle */}
        <div>
          <label className={labelCls}>Provider <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "brevo_api", label: "Brevo API",    Icon: KeyRound },
              { id: "smtp",      label: "Custom SMTP",  Icon: Server   },
            ].map(({ id, label, Icon }) => {
              const sel = form.provider === id;
              return (
                <button key={id} type="button" onClick={() => set("provider", id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${sel ? "border-[#6D5EF5] bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10 text-[#6D5EF5]" : "border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-600 dark:text-gray-400 hover:border-[#6D5EF5]/40"}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connection name */}
        <div>
          <label className={labelCls}>Connection Name <span className="text-red-400">*</span></label>
          <input type="text" placeholder="e.g. Primary Mailer"
            value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
        </div>

        {/* Sender email */}
        <div>
          <label className={labelCls}>Sender Email <span className="text-red-400">*</span></label>
          <input type="email" placeholder="noreply@yourcompany.com"
            value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">Must be a verified sender in your provider dashboard.</p>
        </div>

        {/* ── Brevo API fields ── */}
        {isBrevo && (
          <div>
            <label className={labelCls}>Brevo API Key <span className="text-red-400">*</span></label>
            <input type="password" placeholder="xkeysib-••••••••"
              value={form.brevo_api_key} onChange={e => set("brevo_api_key", e.target.value)}
              className={inputCls} autoComplete="new-password" />
            <p className="text-xs text-gray-400 mt-1">
              Found in Brevo → SMTP &amp; API → API Keys. Free plan supports up to 300 emails/day.
            </p>
          </div>
        )}

        {/* ── SMTP fields ── */}
        {!isBrevo && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>SMTP Host <span className="text-red-400">*</span></label>
                <input type="text" placeholder="smtp-relay.brevo.com"
                  value={form.smtp_host} onChange={e => set("smtp_host", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Port</label>
                <input type="number" placeholder="587"
                  value={form.smtp_port} onChange={e => set("smtp_port", Number(e.target.value))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>SMTP Username <span className="text-red-400">*</span></label>
              <input type="text" placeholder="your@email.com"
                value={form.smtp_user} onChange={e => set("smtp_user", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>SMTP Password <span className="text-red-400">*</span></label>
              <input type="password" placeholder="••••••••"
                value={form.smtp_pass} onChange={e => set("smtp_pass", e.target.value)}
                className={inputCls} autoComplete="new-password" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.smtp_secure}
                onChange={e => set("smtp_secure", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6D5EF5]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Use TLS (port 465)</span>
            </label>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all font-medium disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
    ["Sender Email",    conn.email],
    ["Provider",        PROVIDER_LABELS[conn.provider] || conn.provider],
    ["Test Status",     conn.last_test_status],
    ["Last Tested",     conn.last_tested_at ? new Date(conn.last_tested_at).toLocaleString() : "Never"],
    ["Added On",        conn.createdAt ? new Date(conn.createdAt).toLocaleDateString() : "—"],
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
        <div className="flex items-center gap-3">
          <ProvAvatar provider={conn.provider} size="md" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{conn.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{PROVIDER_LABELS[conn.provider] || conn.provider}</p>
          </div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium max-w-[220px] truncate text-right">{value || "—"}</span>
          </div>
        ))}
        <button onClick={onClose}
          className="w-full mt-2 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Close
        </button>
      </div>
    </Modal>
  );
}

// ── Delete confirmation ────────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, conn, deleting }) {
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
            Any campaign using this connection will lose its sender. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
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
  const { connections, loading, addConnection, editConnection, removeConnection, testConnection } = useConnections();

  const [search, setSearch]           = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [viewTarget, setViewTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [testingId, setTestingId]     = useState(null);

  const filtered = connections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (PROVIDER_LABELS[c.provider] || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Add ─────────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    if (!form.name.trim())  { addToast("Connection name is required", "error"); return; }
    if (!form.email.includes("@")) { addToast("Valid sender email required", "error"); return; }
    if (form.provider === "brevo_api" && !form.brevo_api_key.trim()) {
      addToast("Brevo API key is required", "error"); return;
    }
    if (form.provider === "smtp" && (!form.smtp_host.trim() || !form.smtp_user.trim() || !form.smtp_pass.trim())) {
      addToast("SMTP host, username and password are required", "error"); return;
    }
    setSaving(true);
    try {
      await addConnection(form);
      setShowAdd(false);
      addToast(`Connection "${form.name}" added successfully`, "success");
    } catch (err) {
      addToast(err.message || "Failed to add connection", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await editConnection(editTarget._id, form);
      setEditTarget(null);
      addToast("Connection updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to update connection", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeConnection(deleteTarget._id);
      addToast(`"${deleteTarget.name}" deleted`, "success");
      setDeleteTarget(null);
    } catch (err) {
      addToast(err.message || "Failed to delete connection", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Test ─────────────────────────────────────────────────────────────────────
  const handleTest = async (id) => {
    setTestingId(id);
    try {
      const res = await testConnection(id);
      addToast(res?.message || "Test email sent! Check your inbox.", "success");
    } catch (err) {
      addToast(err.message || "Connection test failed", "error");
    } finally {
      setTestingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${connections.length} connection${connections.length !== 1 ? "s" : ""} configured`}
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
          placeholder="Search connections…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading connections…</span>
          </div>
        ) : (
          <table className="min-w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
              <tr>
                {["Name", "Sender Email", "Provider", "Status", ""].map((h, i, arr) => (
                  <th key={h || i}
                    className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 0 ? "rounded-tl-xl" : i === arr.length - 1 ? "rounded-tr-xl" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
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
                <tr key={conn._id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
                  {/* Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProvAvatar provider={conn.provider} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{conn.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{conn.email}</span>
                  </td>

                  {/* Provider */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#6D5EF5]/10 text-[#6D5EF5] dark:bg-[#6D5EF5]/20 dark:text-[#8B7CFF]">
                      {PROVIDER_LABELS[conn.provider] || conn.provider}
                    </span>
                  </td>

                  {/* Test Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={conn.last_test_status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <RowMenu
                      conn={conn}
                      onView={setViewTarget}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                      onTest={handleTest}
                      testing={testingId === conn._id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Dialog */}
      <ConnectionFormDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
        initial={null}
        saving={saving}
      />

      {/* Edit Dialog */}
      <ConnectionFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget}
        saving={saving}
      />

      {/* View Dialog */}
      <ViewDialog open={Boolean(viewTarget)} onClose={() => setViewTarget(null)} conn={viewTarget} />

      {/* Delete Dialog */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        conn={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}
