import { useState } from "react";
import { X, Check, Search, Plus, Mail, MessageCircle, MessageSquare, Bell, Smartphone, Radio, Layers, Globe, ChevronLeft } from "lucide-react";
import { useTemplates } from "../../context/TemplateContext";

const CHANNELS = [
  { name: "Email",           icon: Mail,           color: "emerald" },
  { name: "WhatsApp",        icon: MessageCircle,  color: "violet" },
  { name: "SMS",             icon: MessageSquare,  color: "blue" },
  { name: "In-App Messaging",icon: Bell,           color: "indigo" },
  { name: "Mobile Push",     icon: Smartphone,     color: "teal" },
  { name: "RCS",             icon: Radio,          color: "orange" },
  { name: "MMS",             icon: Layers,         color: "pink" },
  { name: "Web Push",        icon: Globe,          color: "gray" },
];

const CONNECTIONS = [
  { id: "1", name: "Primary Mailer",   email: "noreply@mailflow.io" },
  { id: "2", name: "Marketing Team",   email: "team@mailflow.io" },
  { id: "3", name: "Transactional",    email: "alerts@mailflow.io" },
];

const AUDIENCE_DATA = [
  { id: "1", name: "Om Patel",    email: "opatel272005@gmail.com" },
  { id: "2", name: "Jane Smith",  email: "jane@example.com" },
  { id: "3", name: "Ravi Kumar",  email: "ravi@example.com" },
  { id: "4", name: "Sara Lee",    email: "sara@example.com" },
  { id: "5", name: "Alex Mehta",  email: "alex@example.com" },
];

const RIGHTS = ["All Users", "Admin", "Marketing Team"];
const STEPS = ["Type", "Details", "Template", "Settings", "Audience", "Summary"];

const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

/* ── Step 1: Channel Type Picker ── */
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
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selected
                  ? "border-[#6D5EF5] bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10"
                  : "border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40 bg-white dark:bg-[#0F1117]"
              }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-[#6D5EF5]" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${selected ? "text-[#6D5EF5]" : "text-gray-700 dark:text-gray-300"}`}>{name}</span>
              {selected && <Check className="w-3.5 h-3.5 text-[#6D5EF5] absolute top-2 right-2" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 2: Campaign Details ── */
function Step2({ form, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Campaign Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Give your campaign a name and set access rights.</p>
      </div>
      <div>
        <label className={labelCls}>Campaign Name <span className="text-red-400">*</span></label>
        <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. May Newsletter" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description of this campaign..." rows={3}
          className={inputCls + " resize-none"} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>View Rights</label>
          <select value={form.viewRights} onChange={e => set("viewRights", e.target.value)} className={inputCls}>
            {RIGHTS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Edit Rights</label>
          <select value={form.editRights} onChange={e => set("editRights", e.target.value)} className={inputCls}>
            {RIGHTS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Template Selector ── */
function Step3({ form, set }) {
  const { templates } = useTemplates();
  const [q, setQ] = useState("");
  const filtered = templates.filter(t =>
    t.channel === form.type &&
    t.name.toLowerCase().includes(q.toLowerCase())
  );
  const all = templates.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  const list = form.type ? filtered : all;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Select Template</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Choose a {form.type} template from your library.
        </p>
      </div>
      {form.template && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 rounded-xl text-sm text-[#6D5EF5] font-medium">
          <Check className="w-3.5 h-3.5 flex-shrink-0" />
          {form.template.name}
          <button onClick={() => set("template", null)} className="ml-auto text-[#6D5EF5]/60 hover:text-[#6D5EF5]"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search templates..." className={inputCls + " pl-9"} />
      </div>
      <div className="border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No templates found for this channel</div>
        ) : list.map(t => {
          const selected = form.template?.id === t.id;
          return (
            <button key={t.id} type="button" onClick={() => set("template", selected ? null : t)}
              className={`flex items-center w-full gap-3 px-4 py-3 text-left border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0 transition-colors ${selected ? "bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10" : "hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
                {selected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{t.name}</span>
              <span className="text-xs text-gray-400">{t.channel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 4: Content Settings ── */
function Step4({ form, set }) {
  const showEmail = ["Email"].includes(form.type);
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Content Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure sender and content details.</p>
      </div>
      {showEmail && (
        <div>
          <label className={labelCls}>From Email <span className="text-red-400">*</span></label>
          <select value={form.fromEmail} onChange={e => set("fromEmail", e.target.value)} className={inputCls}>
            <option value="">Select Email ID</option>
            {CONNECTIONS.map(c => (
              <option key={c.id} value={c.email}>{c.name} &lt;{c.email}&gt;</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className={labelCls}>Sender Name</label>
        <input value={form.senderName} onChange={e => set("senderName", e.target.value)} placeholder="e.g. MailFlow Team" className={inputCls} />
      </div>
      {showEmail && (
        <>
          <div>
            <label className={labelCls}>Subject <span className="text-red-400">*</span></label>
            <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="e.g. Your May update is here!" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Reply-to Email <span className="text-gray-400 font-normal">(optional)</span></label>
            <input value={form.replyTo} onChange={e => set("replyTo", e.target.value)} placeholder="reply@example.com" className={inputCls} />
          </div>
        </>
      )}
    </div>
  );
}

/* ── Step 5: Audience Picker ── */
function Step5({ form, set }) {
  const [q, setQ] = useState("");
  const filtered = AUDIENCE_DATA.filter(a =>
    a.name.toLowerCase().includes(q.toLowerCase()) ||
    a.email.toLowerCase().includes(q.toLowerCase())
  );
  const toggle = (a) => {
    const exists = form.audience.find(x => x.id === a.id);
    set("audience", exists ? form.audience.filter(x => x.id !== a.id) : [...form.audience, a]);
  };

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
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search audience..." className={inputCls + " pl-9"} />
      </div>
      <div className="border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden max-h-56 overflow-y-auto">
        {filtered.map(a => {
          const selected = Boolean(form.audience.find(x => x.id === a.id));
          const initials = a.name.split(" ").map(n => n[0]).join("").toUpperCase();
          return (
            <button key={a.id} type="button" onClick={() => toggle(a)}
              className={`flex items-center w-full gap-3 px-4 py-3 text-left border-b border-[#E4E7EC] dark:border-[#2A2F3A] last:border-0 transition-colors ${selected ? "bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10" : "hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#6D5EF5] bg-[#6D5EF5]" : "border-gray-300 dark:border-gray-600"}`}>
                {selected && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                <p className="text-xs text-gray-400 truncate">{a.email}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 6: Summary ── */
function Step6({ form }) {
  const rows = [
    ["Campaign Type", form.type || "—"],
    ["Name", form.name || "—"],
    ["Description", form.description || "—"],
    ["View Rights", form.viewRights],
    ["Edit Rights", form.editRights],
    ["Template", form.template?.name || "—"],
    ["From Email", form.fromEmail || "—"],
    ["Sender Name", form.senderName || "—"],
    ["Subject", form.subject || "—"],
    ["Audience", form.audience.length > 0 ? `${form.audience.length} contact(s): ${form.audience.map(a => a.name).join(", ")}` : "—"],
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
            <span className="text-gray-500 dark:text-gray-400 min-w-[120px] flex-shrink-0">{k}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 break-all">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Wizard Modal ── */
const BLANK = {
  type: "", name: "", description: "",
  viewRights: "All Users", editRights: "All Users",
  template: null,
  fromEmail: "", senderName: "", subject: "", replyTo: "",
  audience: [],
};

export function CampaignWizard({ open, onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(BLANK);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return Boolean(form.type);
    if (step === 2) return Boolean(form.name.trim());
    return true;
  };

  const handleNext = () => {
    if (step < 6) setStep(s => s + 1);
    else {
      onSave({
        id: String(Date.now()),
        name: form.name,
        description: form.description || "—",
        type: form.type,
        status: "Draft",
        scheduleType: "—",
        scheduleStatus: "Not Scheduled",
        template: form.template?.name || "",
        fromEmail: form.fromEmail,
        senderName: form.senderName,
        subject: form.subject,
        audience: form.audience,
        createdAt: new Date().toISOString().split("T")[0],
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setForm(BLANK);
    onClose();
  };

  if (!open) return null;

  const STEP_COMPONENTS = [
    <Step1 form={form} set={set} />,
    <Step2 form={form} set={set} />,
    <Step3 form={form} set={set} />,
    <Step4 form={form} set={set} />,
    <Step5 form={form} set={set} />,
    <Step6 form={form} />,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-2xl animate-scale-in flex flex-col" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">New Campaign</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>
            </div>
            <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? "bg-[#6D5EF5]" : "bg-gray-200 dark:bg-gray-700"}`} />
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
          <button onClick={handleNext} disabled={!canNext()}
            className={`flex-1 py-2.5 text-sm rounded-xl font-semibold transition-all ${canNext() ? "bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white hover:shadow-lg hover:shadow-[#6D5EF5]/30" : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}>
            {step === 6 ? "💾 Save Campaign" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
