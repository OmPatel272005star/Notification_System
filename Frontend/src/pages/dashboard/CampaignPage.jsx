import { useState } from "react";
import { Search, Plus, Mail, Trash2, BarChart2, Filter, FileText } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const STATUS_CFG = {
  Completed: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  Sending:   { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400", dot: "bg-purple-500" },
  Scheduled: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-500" },
  Draft:     { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400" },
  Failed:    { cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" },
};

const INIT_DATA = [
  { id: 1, name: "Welcome Series", audience: 1250, template: "Welcome Email", status: "Completed", sentTime: "Jan 15, 2026", openRate: "32%", clickRate: "8%" },
  { id: 2, name: "Spring Promo", audience: 5000, template: "Promotion", status: "Sending", sentTime: "May 10, 2026", openRate: "28%", clickRate: "6%" },
  { id: 3, name: "May Newsletter", audience: 8100, template: "Newsletter v3", status: "Completed", sentTime: "May 8, 2026", openRate: "34%", clickRate: "9%" },
  { id: 4, name: "Product Announcement", audience: 12000, template: "Product Launch", status: "Scheduled", sentTime: "May 20, 2026", openRate: "—", clickRate: "—" },
  { id: 5, name: "Re-engagement Q1", audience: 3400, template: "Newsletter v2", status: "Failed", sentTime: "Apr 2, 2026", openRate: "—", clickRate: "—" },
  { id: 6, name: "Summer Campaign", audience: 0, template: "Promo Basic", status: "Draft", sentTime: "—", openRate: "—", clickRate: "—" },
];

const STEPS = ["Details", "Audience", "Template", "Schedule", "Review"];

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

export default function CampaignPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState(INIT_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", subject: "", senderName: "MailFlow", senderEmail: "noreply@mailflow.io" });

  const filtered = campaigns.filter(c =>
    (filterStatus === "All" || c.status === filterStatus) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => { setCampaigns(p => p.filter(c => c.id !== id)); addToast("Campaign deleted", "success"); };

  const handleFinish = () => {
    if (!form.name.trim()) { addToast("Campaign name required", "error"); return; }
    setCampaigns(p => [{ id: Date.now(), name: form.name, audience: 0, template: "Draft", status: "Draft", sentTime: "—", openRate: "—", clickRate: "—" }, ...p]);
    setShowCreate(false); setStep(1);
    setForm({ name: "", subject: "", senderName: "MailFlow", senderEmail: "noreply@mailflow.io" });
    addToast("Campaign created as draft", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{campaigns.length} campaigns total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total", campaigns.length, "text-gray-900 dark:text-gray-100"], ["Completed", campaigns.filter(c => c.status === "Completed").length, "text-emerald-600"], ["Scheduled", campaigns.filter(c => c.status === "Scheduled").length, "text-amber-600"], ["Drafts", campaigns.filter(c => c.status === "Draft").length, "text-gray-500"]].map(([l, v, cls]) => (
          <div key={l} className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{v}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5]">
          {["All", "Draft", "Scheduled", "Sending", "Completed", "Failed"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <tr>
                  {["Campaign", "Status", "Audience", "Template", "Sent Date", "Open Rate", "Click Rate", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
                {filtered.map(c => {
                  const cfg = STATUS_CFG[c.status] || STATUS_CFG.Draft;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#6D5EF5]/10 rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-[#6D5EF5]" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{c.audience > 0 ? c.audience.toLocaleString() : "—"}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{c.template}</td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{c.sentTime}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {c.openRate !== "—" && <div className="w-14 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: c.openRate }} /></div>}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.openRate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{c.clickRate}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => addToast("Analytics coming soon", "info")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><BarChart2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first campaign to reach your audience</p>
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium">New Campaign</button>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setStep(1); }}>
        <div className="px-6 pt-5 pb-3 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">New Campaign</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Step {step} of {STEPS.length} — {STEPS[step-1]}</p>
            </div>
            <button onClick={() => { setShowCreate(false); setStep(1); }} className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg">×</button>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-[#6D5EF5]" : "bg-gray-200 dark:bg-gray-700"}`} />)}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {step === 1 && <>
            {[["name","Campaign Name *","text","e.g. May Newsletter"],["subject","Subject Line","text","Your monthly update is here"],["senderName","Sender Name","text","MailFlow"],["senderEmail","Sender Email","email","noreply@mailflow.io"]].map(([k,l,t,ph]) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l}</label>
                <input type={t} placeholder={ph} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} className={inputCls} />
              </div>
            ))}
          </>}
          {step === 2 && <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Choose your target audience</p>
            {["All Subscribers (12,450)","Newsletter subscribers (8,200)","Premium users (2,100)"].map(o => (
              <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40 cursor-pointer">
                <input type="radio" name="aud" className="text-[#6D5EF5]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{o}</span>
              </label>
            ))}
          </div>}
          {step === 3 && <div className="grid grid-cols-2 gap-3">
            {["Welcome Email","Newsletter v3","Product Launch","Promo Basic"].map(t => (
              <label key={t} className="flex flex-col p-3 rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40 cursor-pointer">
                <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400" /></div>
                <input type="radio" name="tpl" className="sr-only" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{t}</span>
              </label>
            ))}
          </div>}
          {step === 4 && <div className="space-y-3">
            {["Send Now","Schedule for Later"].map(o => (
              <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] hover:border-[#6D5EF5]/40 cursor-pointer">
                <input type="radio" name="sched" className="text-[#6D5EF5]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{o}</span>
              </label>
            ))}
            <input type="datetime-local" className={inputCls} />
          </div>}
          {step === 5 && <div className="bg-[#6D5EF5]/5 dark:bg-[#6D5EF5]/10 border border-[#6D5EF5]/20 rounded-xl p-4 space-y-2">
            {[["Campaign", form.name || "Untitled"],["Subject", form.subject || "—"],["Sender", `${form.senderName} <${form.senderEmail}>`],["Audience", "12,450 contacts"],["Spam Score", "1.2 / 10 ✅"]].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{k}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>}
          <div className="flex gap-3 pt-2">
            {step > 1 && <button onClick={() => setStep(s => s-1)} className="flex-1 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">← Back</button>}
            <button onClick={() => step < STEPS.length ? setStep(s => s+1) : handleFinish()} className="flex-1 py-2 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg transition-all font-medium">
              {step === STEPS.length ? "🚀 Launch" : "Continue →"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
