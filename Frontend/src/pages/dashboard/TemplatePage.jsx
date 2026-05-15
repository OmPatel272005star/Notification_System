import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, MoreVertical, Edit3, Copy, Trash2, Plus, X, ChevronDown, FileText, AlertTriangle } from "lucide-react";
import { useTemplates } from "../../context/TemplateContext";
import { useToast } from "../../hooks/useToast";

const CHANNELS = ["Email", "WhatsApp", "SMS", "In-App Messaging", "Mobile Push", "RCS", "MMS", "Web Push"];
const VISIBLE_TO_OPTIONS = ["All Users", "Admin", "Marketing Team", "Dev Team"];

const CHANNEL_COLORS = {
  Email:              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  WhatsApp:           "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  SMS:                "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "In-App Messaging": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Mobile Push":      "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  RCS:                "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  MMS:                "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "Web Push":         "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");
}

/* ── Three-dot card menu ── */
function CardMenu({ onEdit, onDuplicate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-40 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden animate-fade-in">
          <button onClick={() => { setOpen(false); onEdit(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => { setOpen(false); onDuplicate(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />
          <button onClick={() => { setOpen(false); onDelete(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Minimal Template Card ── */
function TemplateCard({ t, onEdit, onDuplicate, onDelete }) {
  const chColor = CHANNEL_COLORS[t.channel] || CHANNEL_COLORS["Web Push"];
  return (
    <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${chColor}`}>{t.channel}</span>
        <CardMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.content || "No content preview"}</p>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-[#F0F0F0] dark:border-[#2A2F3A]">
        <span className="text-[11px] text-gray-400">{formatDate(t.createdAt)}</span>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: t.createdBy?.color || "#6D5EF5" }}>
          {t.createdBy?.initials || "?"}
        </div>
      </div>
    </div>
  );
}

/* ── Add New dropdown ── */
function AddNewDropdown({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
        <Plus className="w-4 h-4" /> Add New <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-2xl overflow-hidden animate-fade-in">
          {CHANNELS.map(ch => (
            <button key={ch} onClick={() => { setOpen(false); onSelect(ch); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Visible To multi-select ── */
function VisibleToSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const toggle = (opt) => {
    if (opt === "All Users") { onChange(["All Users"]); return; }
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value.filter(v => v !== "All Users"), opt];
    onChange(next.length ? next : ["All Users"]);
  };
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(v => !v)}
        className="w-full min-h-[42px] px-3 py-2 flex flex-wrap gap-1.5 items-center rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] cursor-pointer">
        {value.map(v => (
          <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-[#6D5EF5]/10 text-[#6D5EF5] rounded-full text-xs font-medium">
            {v}
            <button onClick={(e) => { e.stopPropagation(); toggle(v); }} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0" />
      </div>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full bg-white dark:bg-[#1A2030] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden">
          {VISIBLE_TO_OPTIONS.map(opt => (
            <button key={opt} onClick={() => toggle(opt)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222B3A] transition-colors">
              {opt}
              {value.includes(opt) && <span className="w-4 h-4 text-[#6D5EF5]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Add/Edit Dialog ── */
function TemplateDialog({ open, onClose, initial, initialChannel }) {
  const { addTemplate, updateTemplate, getTemplate } = useTemplates();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const isEdit = Boolean(initial);
  const blank = { name: "", channel: initialChannel || "Email", visibleTo: ["All Users"], content: "" };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (open) setForm(isEdit ? { name: initial.name, channel: initial.channel, visibleTo: initial.visibleTo || ["All Users"], content: initial.content || "" } : { ...blank, channel: initialChannel || "Email" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, initialChannel]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { addToast("Template name is required", "error"); return; }
    if (isEdit) {
      updateTemplate(initial.id, form);
      addToast("Template updated", "success");
      onClose();
    } else {
      const t = addTemplate(form);
      addToast("Template created", "success");
      onClose();
      return t;
    }
  };

  const handleEditTemplate = () => {
    if (!form.name.trim()) { addToast("Please enter a name first", "error"); return; }
    let id = initial?.id;
    if (!id) {
      const t = addTemplate(form);
      id = t.id;
    } else {
      updateTemplate(id, form);
    }
    onClose();
    navigate(`/templates/editor/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-3xl animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{isEdit ? "Edit Template" : "Add Template"}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: two panels */}
        <div className="grid grid-cols-2 divide-x divide-[#E4E7EC] dark:divide-[#2A2F3A]">
          {/* Left: form */}
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type="text" maxLength={512} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Template name..." className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{form.name.length}/512</span>
              </div>
            </div>
            {/* Channel */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Channel <span className="text-red-400">*</span></label>
              <select value={form.channel} onChange={e => set("channel", e.target.value)} className={inputCls}>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Visible To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Visible To <span className="text-red-400">*</span></label>
              <VisibleToSelect value={form.visibleTo} onChange={v => set("visibleTo", v)} />
              <p className="text-[11px] text-[#6D5EF5] mt-1">
                {form.visibleTo.includes("All Users") ? "All Users are Selected" : `${form.visibleTo.length} group(s) selected`}
              </p>
            </div>
          </div>

          {/* Right: preview */}
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Template <span className="text-red-400">*</span></span>
              <button onClick={handleEditTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-xs font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all">
                <Edit3 className="w-3.5 h-3.5" /> Edit Template
              </button>
            </div>
            {/* Read the LIVE template from context so preview updates after editor save */}
            {(() => {
              const liveHtml = (initial?.id ? getTemplate(initial.id)?.htmlContent : null) || "";
              return liveHtml ? (
                <div className="flex-1 rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] overflow-hidden" style={{ minHeight: 220 }}>
                  <iframe
                    srcDoc={liveHtml}
                    title="Template Preview"
                    sandbox="allow-same-origin"
                    style={{ width: '100%', height: '100%', minHeight: 220, border: 'none', display: 'block', background: '#fff' }}
                  />
                </div>
              ) : (
                <div className="flex-1 rounded-xl border border-dashed border-[#E4E7EC] dark:border-[#2A2F3A] bg-gray-50 dark:bg-[#0F1117] flex flex-col items-center justify-center gap-3" style={{ minHeight: 220 }}>
                  <div className="w-10 h-10 rounded-xl bg-[#6D5EF5]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#6D5EF5]" />
                  </div>
                  <p className="text-sm text-gray-400 text-center px-4">Click <span className="font-medium text-[#6D5EF5]">Edit Template</span> to design your template</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A]">
          <button onClick={onClose} className="px-5 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className={`px-5 py-2.5 text-sm rounded-xl font-medium transition-all ${form.name.trim() ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:shadow-lg hover:shadow-[#6D5EF5]/30" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
            {isEdit ? "Save Changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-6 text-center space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">Please confirm you would like to delete <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TemplatePage() {
  const { templates, deleteTemplate, duplicateTemplate } = useTemplates();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogChannel, setDialogChannel] = useState("Email");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.channel.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = (ch) => { setDialogChannel(ch); setEditTarget(null); setDialogOpen(true); };
  const handleEdit = (t) => { setEditTarget(t); setDialogOpen(true); };
  const handleDuplicate = (id) => { duplicateTemplate(id); addToast("Template duplicated", "success"); };
  const handleDelete = () => { deleteTemplate(deleteTarget.id); addToast("Template deleted", "success"); setDeleteTarget(null); };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-1">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-[#6D5EF5] text-white" : "text-gray-400 hover:text-gray-600"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-[#6D5EF5] text-white" : "text-gray-400 hover:text-gray-600"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <AddNewDropdown onSelect={handleAddNew} />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#6D5EF5]" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{search ? "No templates match your search." : "No templates yet. Click Add New to get started."}</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(t => (
            <TemplateCard key={t.id} t={t}
              onEdit={() => handleEdit(t)}
              onDuplicate={() => handleDuplicate(t.id)}
              onDelete={() => setDeleteTarget(t)} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
          {filtered.map(t => {
            const chColor = CHANNEL_COLORS[t.channel] || CHANNEL_COLORS["Web Push"];
            return (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                <div className="w-9 h-9 bg-[#6D5EF5]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-[#6D5EF5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{t.content}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${chColor}`}>{t.channel}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(t.createdAt)}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: t.createdBy?.color || "#6D5EF5" }}>
                  {t.createdBy?.initials || "?"}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <CardMenu onEdit={() => handleEdit(t)} onDuplicate={() => handleDuplicate(t.id)} onDelete={() => setDeleteTarget(t)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TemplateDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} initial={editTarget} initialChannel={dialogChannel} />
      <DeleteConfirm open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} name={deleteTarget?.name} />
    </div>
  );
}
