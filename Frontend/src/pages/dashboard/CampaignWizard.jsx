import { useState, useEffect, useCallback } from "react";
import {
  X, Check, Search, Mail, MessageCircle, MessageSquare, Bell,
  Smartphone, Radio, Layers, Globe, ChevronLeft, AlertTriangle,
  ChevronDown, User, Users, Plug,
} from "lucide-react";
import { useTemplates }   from "../../context/TemplateContext";
import { useAudience }    from "../../context/AudienceContext";
import { useCampaigns, toDBChannel } from "../../context/CampaignContext";
import { useConnections } from "../../context/ConnectionContext";
import { getAllUsers }    from "../../services/userService";

// ── Constants ─────────────────────────────────────────────────────────────────
const CHANNELS = [
  { name: "Email",           icon: Mail,          color: "emerald" },
  { name: "WhatsApp",        icon: MessageCircle, color: "violet" },
  { name: "SMS",             icon: MessageSquare, color: "blue" },
  { name: "In-App Messaging",icon: Bell,          color: "indigo" },
  { name: "Mobile Push",     icon: Smartphone,    color: "teal" },
  { name: "RCS",             icon: Radio,         color: "orange" },
  { name: "MMS",             icon: Layers,        color: "pink" },
  { name: "Web Push",        icon: Globe,         color: "gray" },
];

const STEPS = ["Type", "Details", "Template", "Settings", "Audience", "Summary"];

const inputCls  = "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";
const labelCls  = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

// ── Shared: Rights Multi-Select Dropdown ──────────────────────────────────────
function RightsSelect({ label, value, onChange, users, loading }) {
  const [open, setOpen] = useState(false);

  const isAll = value.includes("all");

  const toggle = (id) => {
    if (id === "all") {
      onChange(["all"]);
      setOpen(false);
      return;
    }
    const next = value.filter(v => v !== "all");
    const exists = next.includes(id);
    onChange(exists ? next.filter(v => v !== id) : [...next, id]);
  };

  const label_display = isAll
    ? "All Users"
    : value.length === 0
    ? "Select…"
    : `${value.length} selected`;

  return (
    <div className="relative">
      <label className={labelCls}>{label}</label>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all">
        <span className={isAll || value.length > 0 ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
          {label_display}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {/* All Users option */}
          <button type="button" onClick={() => toggle("all")}
            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${isAll ? "bg-[#6D5EF5]/10 text-[#6D5EF5]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isAll ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
              {isAll && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <Users className="w-3.5 h-3.5 flex-shrink-0" /> All Users
          </button>

          <div className="border-t border-[#E4E7EC] dark:border-[#2A2F3A]" />

          {loading ? (
            <div className="py-4 text-center text-xs text-gray-400">Loading users…</div>
          ) : users.map(u => {
            const sel = value.includes(u._id);
            return (
              <button key={u._id} type="button" onClick={() => toggle(u._id)}
                className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${sel ? "bg-[#6D5EF5]/10 text-[#6D5EF5]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <User className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                {u.display_name || u.email}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Step 1: Channel Type ───────────────────────────────────────────────────────
function Step1({ form, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Choose Campaign Type</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select the channel for this campaign.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CHANNELS.map(({ name, icon: Icon }) => {
          const selected = form.type === name;
          return (
            <button key={name} type="button" onClick={() => set("type", name)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                selected
                  ? "border-[#6D5EF5] bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10"
                  : "border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40 bg-white dark:bg-[#0F1117]"
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-[#6D5EF5]" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${selected ? "text-[#6D5EF5]" : "text-gray-700 dark:text-gray-300"}`}>
                {name}
              </span>
              {selected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#6D5EF5] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Campaign Details ───────────────────────────────────────────────────
function Step2({ form, set }) {
  const [users, setUsers]           = useState([]);
  const [loadingUsers, setLoading]  = useState(true);

  useEffect(() => {
    getAllUsers(1, 200)
      .then(res => {
        const docs = res?.data || [];
        setUsers(Array.isArray(docs) ? docs : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Campaign Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Name your campaign and set access rights.</p>
      </div>

      <div>
        <label className={labelCls}>Campaign Name <span className="text-red-400">*</span></label>
        <input value={form.name} onChange={e => set("name", e.target.value)}
          placeholder="e.g. May Newsletter" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          placeholder="Brief description of this campaign…" rows={3}
          className={inputCls + " resize-none"} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RightsSelect
          label="View Rights"
          value={form.visibleTo}
          onChange={v => set("visibleTo", v)}
          users={users}
          loading={loadingUsers}
        />
        <RightsSelect
          label="Edit Rights"
          value={form.editableBy}
          onChange={v => set("editableBy", v)}
          users={users}
          loading={loadingUsers}
        />
      </div>
    </div>
  );
}

// ── Step 3: Template Picker + Preview ─────────────────────────────────────────
function Step3({ form, set }) {
  const { templates } = useTemplates();
  const [q, setQ]     = useState("");

  const filtered = templates.filter(t => {
    const matchChannel = !form.type || t.channel === form.type;
    const matchQuery   = t.name.toLowerCase().includes(q.toLowerCase());
    return matchChannel && matchQuery;
  });

  const selected = form.template;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Select Template</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Choose a {form.type || "campaign"} template from your library.
        </p>
      </div>

      <div className="flex gap-4" style={{ minHeight: 260 }}>
        {/* Left: list */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {selected && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 rounded-xl text-sm text-[#6D5EF5] font-medium">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{selected.name}</span>
              <button onClick={() => set("template", null)} className="ml-auto text-[#6D5EF5]/60 hover:text-[#6D5EF5] flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search templates…" className={inputCls + " pl-9"} />
          </div>
          <div className="border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden flex-1 overflow-y-auto" style={{ maxHeight: 200 }}>
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                {form.type ? `No ${form.type} templates found` : "No templates found"}
              </div>
            ) : filtered.map(t => {
              const sel = form.template?.id === t.id || form.template?._id === t._id;
              return (
                <button key={t.id} type="button"
                  onClick={() => set("template", sel ? null : t)}
                  className={`flex items-center w-full gap-3 px-4 py-3 text-left border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0 transition-colors ${sel ? "bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10" : "hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
                    {sel && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.channel} · {t.status}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: preview */}
        <div className="w-44 flex-shrink-0 border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden bg-gray-50 dark:bg-[#0F1117] flex flex-col">
          <div className="px-3 py-2 border-b border-[#E4E7EC] dark:border-[#2A2F3A] text-xs font-semibold text-gray-500 dark:text-gray-400">
            Preview
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {selected ? (
              selected.htmlContent ? (
                <div
                  className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: selected.htmlContent.slice(0, 600) }}
                />
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selected.content || "No preview available."}
                </p>
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400 text-center">Select a template to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Content Settings ──────────────────────────────────────────────
function Step4({ form, set }) {
  const isEmail = form.type === "Email";
  const { connections, loading: connLoading } = useConnections();
  // Only email-channel connections make sense for email campaigns
  const emailConns = connections;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Content Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure sender and delivery details for this {form.type} campaign.
        </p>
      </div>

      {/* Connection selector — email channel only */}
      {isEmail && (
        <div>
          <label className={labelCls}>Email Connection <span className="text-red-400">*</span></label>
          {connLoading ? (
            <div className={inputCls + " text-gray-400"}>
              Loading connections…
            </div>
          ) : emailConns.length === 0 ? (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-3">
              <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Plug className="w-4 h-4 flex-shrink-0" />
                No connections found.{" "}
                <a href="/connections" target="_blank"
                  className="underline font-semibold hover:text-amber-800">
                  Add one on the Connections page.
                </a>
              </p>
            </div>
          ) : (
            <select
              value={form.connectionId}
              onChange={e => set("connectionId", e.target.value)}
              className={inputCls}
            >
              <option value="">Select a connection…</option>
              {emailConns.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} &lt;{c.email}&gt;
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Sender Name */}
      <div>
        <label className={labelCls}>Sender Name</label>
        <input value={form.senderName} onChange={e => set("senderName", e.target.value)}
          placeholder="e.g. MailFlow Team" className={inputCls} />
      </div>

      {/* Subject — email only */}
      {isEmail && (
        <div>
          <label className={labelCls}>Subject <span className="text-red-400">*</span></label>
          <input value={form.subject} onChange={e => set("subject", e.target.value)}
            placeholder="e.g. Your May update is here!" className={inputCls} />
        </div>
      )}

      {/* For non-email channels, show a generic note */}
      {!isEmail && (
        <div className="rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] p-4 bg-gray-50 dark:bg-[#0F1117]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">{form.type}</span> channel-specific
            settings (connection, message body, etc.) will be available in a future update.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step 5: Audience Picker ────────────────────────────────────────────────────
function Step5({ form, set }) {
  const { audience } = useAudience();
  const [q, setQ]    = useState("");

  const filtered = audience.filter(a => {
    const name  = `${a.first_name} ${a.last_name}`.toLowerCase();
    const email = (a.emails?.[0]?.email || "").toLowerCase();
    return name.includes(q.toLowerCase()) || email.includes(q.toLowerCase());
  });

  const toggle = (a) => {
    const exists = form.audience.find(x => x._id === a._id || x.id === a.id);
    set("audience", exists
      ? form.audience.filter(x => x._id !== a._id && x.id !== a.id)
      : [...form.audience, a]
    );
  };

  const isSelected = (a) => Boolean(form.audience.find(x => x._id === a._id || x.id === a.id));

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Select Audience</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Who should receive this campaign?</p>
      </div>

      {form.audience.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 rounded-xl text-sm text-[#6D5EF5] font-medium">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          {form.audience.length} contact{form.audience.length > 1 ? "s" : ""} selected
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search audience…" className={inputCls + " pl-9"} />
      </div>

      <div className="border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
        {audience.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No audience contacts found.</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No results match your search.</div>
        ) : filtered.map(a => {
          const sel      = isSelected(a);
          const fullName = `${a.first_name} ${a.last_name}`.trim() || "Unknown";
          const email    = a.emails?.[0]?.email || "—";
          const initials = fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

          return (
            <button key={a._id || a.id} type="button" onClick={() => toggle(a)}
              className={`flex items-center w-full gap-3 px-4 py-3 text-left border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0 transition-colors ${sel ? "bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10" : "hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${sel ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
                {sel && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fullName}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 6: Summary ────────────────────────────────────────────────────
function Step6({ form }) {
  const { connections } = useConnections();
  const conn = connections.find(c => c._id === form.connectionId || c.id === form.connectionId);

  const rows = [
    ["Campaign Type",   form.type || "—"],
    ["Name",            form.name || "—"],
    ["Description",     form.description || "—"],
    ["View Rights",     form.visibleTo.includes("all") ? "All Users" : `${form.visibleTo.length} user(s)`],
    ["Edit Rights",     form.editableBy.includes("all") ? "All Users" : `${form.editableBy.length} user(s)`],
    ["Template",        form.template?.name || "—"],
    ["From Email",      conn ? `${conn.name} <${conn.email}>` : "—"],
    ["Sender Name",     form.senderName || "—"],
    ["Subject",         form.subject || "—"],
    ["Audience",        form.audience.length > 0
      ? `${form.audience.length} contact(s): ${form.audience.map(a => `${a.first_name} ${a.last_name}`.trim()).join(", ")}`
      : "—"],
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Campaign Summary</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Review your settings before saving.</p>
      </div>
      <div className="bg-[#6D5EF5]/5 dark:bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 rounded-xl p-4 space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 text-sm">
            <span className="text-gray-500 dark:text-gray-400 min-w-[130px] flex-shrink-0">{k}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 break-all">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        💡 This campaign will be saved as a <strong>Draft</strong>. You can set publish details and go live later.
      </p>
    </div>
  );
}

// ── Discard Warning Dialog ─────────────────────────────────────────────────────
function DiscardDialog({ open, onCancel, onSaveDraft, onDiscard, saving }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Leave Campaign?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            You have unsaved changes. What would you like to do?
          </p>
        </div>
        <div className="space-y-2">
          <button onClick={onSaveDraft} disabled={saving}
            className="w-full py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-60">
            {saving ? "Saving…" : "💾 Save as Draft"}
          </button>
          <button onClick={onDiscard}
            className="w-full py-2.5 text-sm border border-red-300 dark:border-red-800 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium">
            Discard Campaign
          </button>
          <button onClick={onCancel}
            className="w-full py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Wizard default form state ──────────────────────────────────────────────────
const BLANK = {
  type:         "",
  name:         "",
  description:  "",
  visibleTo:    ["all"],
  editableBy:   ["admin"],
  template:     null,
  connectionId: "",   // empty string — user must pick a real connection
  senderName:   "",
  subject:      "",
  audience:     [],
};

// ── Main Wizard Modal ──────────────────────────────────────────────────────────
export function CampaignWizard({ open, editCampaign, onClose, onSave }) {
  const [step, setStep]           = useState(1);
  const [form, setForm]           = useState(BLANK);
  const [showDiscard, setDiscard] = useState(false);
  const [saving, setSaving]       = useState(false);

  const { addCampaign, updateCampaign } = useCampaigns();
  const isEdit = Boolean(editCampaign);

  // Pre-fill form when editing an existing campaign
  useEffect(() => {
    if (!open) return;
    if (editCampaign) {
      setForm({
        type:         editCampaign.channelType || "",
        name:         editCampaign.name || "",
        description:  editCampaign.description || "",
        visibleTo:    editCampaign.visibleTo || ["all"],
        editableBy:   editCampaign.editableBy || ["admin"],
        template:     editCampaign.template || null,
        connectionId: editCampaign.connectionId || "",
        senderName:   editCampaign.emailSettings?.sender_name || "",
        subject:      editCampaign.emailSettings?.subject || "",
        audience:     editCampaign.audience || [],
      });
    } else {
      setForm(BLANK);
    }
    setStep(1);
    setDiscard(false);
  }, [open, editCampaign]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return Boolean(form.type);
    if (step === 2) return Boolean(form.name.trim());
    return true;
  };

  // Build the backend payload
  const buildPayload = () => ({
    name:          form.name.trim(),
    description:   form.description.trim(),
    channel_type:  toDBChannel(form.type),
    visible_to:    form.visibleTo,
    editable_by:   form.editableBy,
    template_id:   form.template?._id || form.template?.id || null,
    // Send real connection ObjectId (empty string becomes null)
    connection_id: form.connectionId || null,
    email_settings: {
      sender_name: form.senderName,
      subject:     form.subject,
    },
    audience_ids: form.audience.map(a => a._id || a.id),
  });

  const doSave = async () => {
    setSaving(true);
    try {
      const payload    = buildPayload();
      const normalized = isEdit
        ? await updateCampaign(editCampaign.id, payload)
        : await addCampaign(payload);
      onSave(normalized);
      closeClean();
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
    else doSave();
  };

  const handleClose = () => {
    // Before summary step → warn
    if (step < STEPS.length) {
      setDiscard(true);
    } else {
      closeClean();
    }
  };

  const closeClean = () => {
    setForm(BLANK);
    setStep(1);
    setDiscard(false);
    onClose();
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload    = buildPayload();
      const normalized = isEdit
        ? await updateCampaign(editCampaign.id, payload)
        : await addCampaign(payload);
      onSave(normalized);
      closeClean();
    } catch {
      closeClean();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const STEP_COMPONENTS = [
    <Step1 key="s1" form={form} set={set} />,
    <Step2 key="s2" form={form} set={set} />,
    <Step3 key="s3" form={form} set={set} />,
    <Step4 key="s4" form={form} set={set} />,
    <Step5 key="s5" form={form} set={set} />,
    <Step6 key="s6" form={form} />,
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div
          className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-2xl flex flex-col animate-scale-in"
          style={{ maxHeight: "90vh" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {isEdit ? "Edit Campaign" : "New Campaign"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Step {step} of {STEPS.length} — {STEPS[step - 1]}
                </p>
              </div>
              <button onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div key={i}
                  className={`h-1 flex-1 rounded-full transition-all ${i < step ? "bg-[#6D5EF5]" : "bg-gray-200 dark:bg-gray-700"}`} />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {STEP_COMPONENTS[step - 1]}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A] flex gap-3 flex-shrink-0">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button onClick={handleNext} disabled={!canNext() || saving}
              className={`flex-1 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                canNext() && !saving
                  ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:shadow-lg hover:shadow-[#6D5EF5]/30"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}>
              {saving ? "Saving…" : step === STEPS.length ? "💾 Save Campaign" : "Next →"}
            </button>
          </div>
        </div>
      </div>

      {/* Discard Warning */}
      <DiscardDialog
        open={showDiscard}
        onCancel={() => setDiscard(false)}
        onSaveDraft={handleSaveDraft}
        onDiscard={closeClean}
        saving={saving}
      />
    </>
  );
}
