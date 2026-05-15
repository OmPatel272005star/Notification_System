import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreVertical, Trash2, Edit3, Eye, X, AlertTriangle, Mail, MessageSquare, Smartphone, Bell, Radio, Layers, Globe, MessageCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { CampaignWizard } from "./CampaignWizard";

const TYPE_ICONS = {
  Email: Mail, WhatsApp: MessageCircle, SMS: MessageSquare,
  "In-App Messaging": Bell, "Mobile Push": Smartphone,
  RCS: Radio, MMS: Layers, "Web Push": Globe,
};

const TYPE_COLORS = {
  Email: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  WhatsApp: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  SMS: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "In-App Messaging": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Mobile Push": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  RCS: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  MMS: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "Web Push": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_CFG = {
  Draft:     { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",         dot: "bg-gray-400" },
  Scheduled: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",   dot: "bg-amber-500" },
  Published: { cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",   dot: "bg-green-500" },
  Sending:   { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400", dot: "bg-purple-500" },
  Completed: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500" },
  Failed:    { cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",           dot: "bg-red-500" },
};

const SCHED_CFG = {
  "Not Scheduled": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  Scheduled:       "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  Completed:       "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

const INIT_CAMPAIGNS = [
  { id: "1", name: "Welcome Email Series", description: "Onboarding emails for new subscribers", type: "Email", status: "Completed", scheduleType: "One Time", scheduleStatus: "Completed", createdAt: "2026-05-10" },
  { id: "2", name: "Spring WhatsApp Promo", description: "Seasonal offer blasted via WhatsApp", type: "WhatsApp", status: "Published", scheduleType: "One Time", scheduleStatus: "Completed", createdAt: "2026-05-08" },
  { id: "3", name: "May Newsletter", description: "Monthly digest with latest platform updates", type: "Email", status: "Sending", scheduleType: "One Time", scheduleStatus: "Scheduled", createdAt: "2026-05-08" },
  { id: "4", name: "SMS Flash Sale", description: "SMS_testing_14_5_v1", type: "SMS", status: "Scheduled", scheduleType: "One Time", scheduleStatus: "Scheduled", createdAt: "2026-05-06" },
  { id: "5", name: "Web Push Announcement", description: "This is description", type: "Web Push", status: "Draft", scheduleType: "—", scheduleStatus: "Not Scheduled", createdAt: "2026-05-05" },
  { id: "6", name: "RCS Product Launch", description: "Interactive RCS cards for product reveal", type: "RCS", status: "Failed", scheduleType: "One Time", scheduleStatus: "Completed", createdAt: "2026-05-03" },
];

/* ── Three-dot row menu ── */
function RowMenu({ onEdit, onView, onDelete, onPublishDetails, onPublish }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(o => !o);
  };

  const act = (fn) => (e) => { e.stopPropagation(); setOpen(false); fn(); };

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-52 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl py-1 text-sm">
          <button onMouseDown={act(onView)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          <button onMouseDown={act(onEdit)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          {onPublishDetails && (
            <button onMouseDown={act(onPublishDetails)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
              📅 Set Publish Details
            </button>
          )}
          {onPublish && (
            <button onMouseDown={act(onPublish)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
              🚀 Publish
            </button>
          )}
          <div className="my-1 border-t border-gray-100 dark:border-[#2A2F3A]" />
          <button onMouseDown={act(onDelete)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </>
  );
}

/* ── Delete confirm dialog ── */
function DeleteDialog({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-6 text-center space-y-4" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Confirm Deletion</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            Are you sure you want to delete <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>?
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">
            Remove Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Publish Details Dialog (Phase 5) ── */
function PublishDialog({ open, onClose, onConfirm }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeStr);
  const [sendBest, setSendBest] = useState(false);
  const [custTz, setCustTz] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Set Publish Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select a type of trigger for your campaign.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Trigger type */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Trigger Type</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#6D5EF5] bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-[#6D5EF5] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#6D5EF5]" />
                </div>
                <span className="text-sm font-semibold text-[#6D5EF5]">Time-Based</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#E4E7EC] dark:border-[#2A2F3A] opacity-50 cursor-not-allowed">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                <span className="text-sm font-medium text-gray-500">Event-Based</span>
              </div>
            </div>
          </div>
          {/* Recurrence */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recurrence</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#6D5EF5] bg-[#6D5EF5]/8 dark:bg-[#6D5EF5]/10 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-[#6D5EF5] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#6D5EF5]" />
                </div>
                <span className="text-sm font-semibold text-[#6D5EF5]">One Time</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#E4E7EC] dark:border-[#2A2F3A] opacity-50 cursor-not-allowed">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                <span className="text-sm font-medium text-gray-500">Periodic</span>
              </div>
            </div>
          </div>
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date</p>
              <div className="relative">
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📅</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Time</p>
              <div className="relative">
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🕐</span>
              </div>
            </div>
          </div>
          {/* Checkboxes */}
          <div className="space-y-2.5">
            {[{label:"Send at Best Time",v:sendBest,set:setSendBest},{label:"Use Customer Timezone",v:custTz,set:setCustTz}].map(({label,v,set:s})=>(
              <label key={label} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#6D5EF5] focus:ring-[#6D5EF5]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">Cancel</button>
          <button onClick={() => onConfirm({ date, time, scheduleType: "One Time" })}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all">Confirm</button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function CampaignPage() {
  const { addToast } = useToast();
  const [campaigns, setCampaigns] = useState(INIT_CAMPAIGNS);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [publishTarget, setPublishTarget] = useState(null);

  const handleWizardSave = (campaign) => {
    setCampaigns(p => [campaign, ...p]);
    addToast(`"${campaign.name}" created as draft`, "success");
  };

  const handleSchedule = ({ date, time, scheduleType }) => {
    setCampaigns(p => p.map(c => c.id === publishTarget.id
      ? { ...c, status: "Scheduled", scheduleType, scheduleStatus: "Scheduled", scheduledAt: `${date}T${time}` }
      : c
    ));
    addToast(`Scheduled for ${date} at ${time}`, "success");
    setPublishTarget(null);
  };

  const handlePublish = (id) => {
    setCampaigns(p => p.map(c => c.id === id
      ? { ...c, status: "Published", scheduleStatus: "Completed" }
      : c
    ));
    addToast("Campaign published! 🎉", "success");
  };

  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    setCampaigns(p => p.filter(c => c.id !== deleteTarget.id));
    addToast(`"${deleteTarget.name}" deleted`, "success");
    setDeleteTarget(null);
  };

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap";
  const tdCls = "px-4 py-4 text-sm";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{campaigns.length} total</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Description</th>
                  <th className={thCls}>Channel Type</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Schedule Type</th>
                  <th className={thCls}>Schedule Status</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
                {filtered.map(c => {
                  const Icon = TYPE_ICONS[c.type] || Mail;
                  const typeColor = TYPE_COLORS[c.type] || TYPE_COLORS["Web Push"];
                  const statusCfg = STATUS_CFG[c.status] || STATUS_CFG.Draft;
                  const schedColor = SCHED_CFG[c.scheduleStatus] || SCHED_CFG["Not Scheduled"];
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                      {/* Name */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#6D5EF5]" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{c.name}</span>
                        </div>
                      </td>
                      {/* Description */}
                      <td className={tdCls + " text-gray-500 dark:text-gray-400 max-w-[200px]"}>
                        <span className="truncate block max-w-[200px]">{c.description}</span>
                      </td>
                      {/* Channel Type */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}>
                          {c.type}
                        </span>
                      </td>
                      {/* Status */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                          {c.status}
                        </span>
                      </td>
                      {/* Schedule Type */}
                      <td className={tdCls + " text-gray-600 dark:text-gray-400 whitespace-nowrap"}>
                        {c.scheduleType}
                      </td>
                      {/* Schedule Status */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${schedColor}`}>
                          {c.scheduleStatus}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <RowMenu
                          onView={() => addToast(`Viewing "${c.name}"`, "info")}
                          onEdit={() => addToast("Edit coming in Phase 7", "info")}
                          onDelete={() => setDeleteTarget(c)}
                          onPublishDetails={c.status === "Draft" ? () => setPublishTarget(c) : null}
                          onPublish={c.status === "Scheduled" ? () => handlePublish(c.id) : null}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#E4E7EC] dark:border-[#2A2F3A] text-xs text-gray-400">
            Showing {filtered.length} of {campaigns.length} campaigns
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search ? "Try a different search term." : "Create your first campaign to reach your audience."}
          </p>
          {!search && (
            <button onClick={() => setShowWizard(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Add New Campaign
            </button>
          )}
        </div>
      )}

      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        name={deleteTarget?.name}
      />

      <CampaignWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={handleWizardSave}
      />

      <PublishDialog
        open={Boolean(publishTarget)}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleSchedule}
      />
    </div>
  );
}
