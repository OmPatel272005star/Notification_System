import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, MoreVertical, Trash2, Edit3, Eye, Copy,
  X, AlertTriangle, Mail, MessageSquare, Smartphone, Bell,
  Radio, Layers, Globe, MessageCircle, Send,
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useCampaigns } from "../../context/CampaignContext";
import { useAuth } from "../../context/AuthContext";
import { CampaignWizard } from "./CampaignWizard";
import { CampaignViewDrawer } from "./CampaignViewPage";

// ── Channel config ─────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  Email:              Mail,
  WhatsApp:           MessageCircle,
  SMS:                MessageSquare,
  "In-App Messaging": Bell,
  "Mobile Push":      Smartphone,
  RCS:                Radio,
  MMS:                Layers,
  "Web Push":         Globe,
};

const TYPE_COLORS = {
  Email:              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  WhatsApp:           "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  SMS:                "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "In-App Messaging": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  "Mobile Push":      "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  RCS:                "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  MMS:                "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "Web Push":         "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

// ── Status configs ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Draft:     { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",              dot: "bg-gray-400" },
  Published: { cls: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",        dot: "bg-green-500" },
};

const SCHED_CFG = {
  "Not Scheduled": { cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  Scheduled:       { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  Completed:       { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  Live:            { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
};

// ── Loading skeleton ───────────────────────────────────────────────────────────
function SkeletonRows({ count = 5 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
      {[1, 2, 3, 4, 5, 6].map((j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
            style={{ width: j === 1 ? "70%" : j === 2 ? "85%" : "50%" }} />
        </td>
      ))}
      <td className="px-4 py-4"><div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" /></td>
    </tr>
  ));
}

// ── Three-dot row menu ─────────────────────────────────────────────────────────
function RowMenu({ campaign, onView, onEdit, onDelete, onDuplicate, onSetPublish, onPublish, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) setOpen(false);
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

  const isDraft      = campaign.status === "Draft";
  const isEditable   = isDraft && campaign.scheduleStatus === "Not Scheduled";
  const canSetPublish = isDraft;
  const canPublish   = campaign.status === "Published" && campaign.scheduleStatus === "Scheduled";

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-52 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl py-1 text-sm">

          {/* View — always visible */}
          <button onMouseDown={act(onView)}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </button>

          {/* Edit — only when draft + not_scheduled + admin */}
          {isAdmin && isEditable && (
            <button onMouseDown={act(onEdit)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          )}

          {/* Set Publish Details — only draft campaigns + admin */}
          {isAdmin && canSetPublish && (
            <button onMouseDown={act(onSetPublish)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
              📅 Set Publish Details
            </button>
          )}

          {/* Publish — only published + scheduled + admin */}
          {isAdmin && canPublish && (
            <button onMouseDown={act(onPublish)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
              <Send className="w-3.5 h-3.5" /> Publish
            </button>
          )}

          {/* Duplicate — always visible + admin */}
          {isAdmin && (
            <button onMouseDown={act(onDuplicate)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-[#2A2F3A]" />

          {/* Delete — admin only */}
          {isAdmin && (
            <button onMouseDown={act(onDelete)}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </>
  );
}

// ── Delete confirm dialog ──────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-6 text-center space-y-4"
        onClick={e => e.stopPropagation()}>
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
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">
            Remove Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Publish Details Dialog ─────────────────────────────────────────────────────
function PublishDialog({ open, onClose, onConfirm }) {
  const now    = new Date();
  const pad    = (n) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr  = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeStr);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
      await onConfirm({ scheduled_at });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Set Publish Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Select a type of trigger for your campaign.</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "Saving…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CampaignPage() {
  const { addToast }    = useToast();
  const { isAdmin }     = useAuth();
  const {
    campaigns, loading, total,
    getCampaign, loadCampaigns,
    removeCampaign, duplicateCampaign,
    setPublishDetails, publishCampaign,
  } = useCampaigns();

  const LIMIT = 20;

  const [search, setSearch]              = useState("");
  const [page, setPage]                  = useState(1);
  const [deleteTarget, setDeleteTarget]  = useState(null);
  const [publishTarget, setPublishTarget] = useState(null);
  const [showWizard, setShowWizard]      = useState(false);
  const [editTarget, setEditTarget]      = useState(null);
  const [viewTarget, setViewTarget]      = useState(null);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  const handlePage = (next) => {
    const p = Math.max(1, Math.min(next, totalPages));
    setPage(p);
    loadCampaigns(p, LIMIT);
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = campaigns.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
    c.channelType.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await removeCampaign(deleteTarget.id);
      addToast(`"${deleteTarget.name}" deleted`, "success");
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (campaign) => {
    try {
      const copy = await duplicateCampaign(campaign.id);
      addToast(`"${copy.name}" created as draft`, "success");
    } catch (err) {
      addToast(`Duplicate failed: ${err.message}`, "error");
    }
  };

  const handleSetPublish = async ({ scheduled_at }) => {
    const targetId   = publishTarget.id;
    const targetName = publishTarget.name;
    try {
      const updated = await setPublishDetails(targetId, { scheduled_at });
      addToast("Publish details saved! Click Publish to go live.", "success");
      // Auto-open the view drawer so admin can click Publish
      setViewTarget(updated);
    } catch (err) {
      addToast(`Failed to save: ${err.message}`, "error");
    } finally {
      setPublishTarget(null);
    }
  };

  const handlePublish = async (campaign) => {
    try {
      await publishCampaign(campaign.id);
      addToast(`"${campaign.name}" published! 🎉`, "success");
    } catch (err) {
      addToast(`Publish failed: ${err.message}`, "error");
    }
  };

  // Always keep viewTarget in sync with latest context data
  const liveViewTarget = viewTarget
    ? (getCampaign(viewTarget.id) ?? viewTarget)
    : null;

  const handleWizardSave = (campaign) => {
    addToast(`"${campaign?.name || 'Campaign'}" saved as draft ✓`, "success");
  };

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap";
  const tdCls = "px-4 py-4 text-sm";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${total} total`}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditTarget(null); setShowWizard(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search campaigns…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
      </div>

      {/* Table */}
      {!loading && filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl py-20 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <Mail className="w-7 h-7 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No campaigns found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {search ? "Try a different search term." : "Create your first campaign to reach your audience."}
          </p>
          {!search && isAdmin && (
            <button
              onClick={() => { setEditTarget(null); setShowWizard(true); }}
              className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Add New Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Description</th>
                  <th className={thCls}>Channel Type</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Schedule Status</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
                {loading ? (
                  <SkeletonRows count={5} />
                ) : filtered.map(c => {
                  const Icon        = TYPE_ICONS[c.channelType] || Mail;
                  const typeColor   = TYPE_COLORS[c.channelType] || TYPE_COLORS["Web Push"];
                  const statusCfg   = STATUS_CFG[c.status]         || STATUS_CFG.Draft;
                  const schedCfg    = SCHED_CFG[c.scheduleStatus]  || SCHED_CFG["Not Scheduled"];

                  return (
                    <tr key={c.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">

                      {/* Name — clickable to open view drawer */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#6D5EF5]" />
                          </div>
                          <button
                            onClick={() => setViewTarget(c)}
                            className="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap hover:text-[#6D5EF5] dark:hover:text-[#8B7CFF] transition-colors text-left">
                            {c.name}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className={tdCls + " text-gray-500 dark:text-gray-400"}>
                        <span className="truncate block max-w-[200px]">{c.description || "—"}</span>
                      </td>

                      {/* Channel Type */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}>
                          {c.channelType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot}`} />
                          {c.status}
                        </span>
                      </td>

                      {/* Schedule Status */}
                      <td className={tdCls}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${schedCfg.cls}`}>
                          {c.scheduleStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <RowMenu
                          campaign={c}
                          isAdmin={isAdmin}
                          onView={() => setViewTarget(c)}
                          onEdit={() => { setEditTarget(c); setShowWizard(true); }}
                          onDelete={() => setDeleteTarget(c)}
                          onDuplicate={() => handleDuplicate(c)}
                          onSetPublish={() => setPublishTarget(c)}
                          onPublish={() => handlePublish(c)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {!loading && (
            <div className="px-5 py-3 border-t border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total} campaigns
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
                  ← Previous
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <DeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        name={deleteTarget?.name}
      />

      <PublishDialog
        open={Boolean(publishTarget)}
        onClose={() => setPublishTarget(null)}
        onConfirm={handleSetPublish}
      />

      <CampaignWizard
        open={showWizard}
        editCampaign={editTarget}
        onClose={() => { setShowWizard(false); setEditTarget(null); }}
        onSave={handleWizardSave}
      />

      {/* View Drawer — always renders the live version from context */}
      {liveViewTarget && (
        <CampaignViewDrawer
          campaign={liveViewTarget}
          onClose={() => setViewTarget(null)}
          onPublishDone={() => {
            addToast(`"${liveViewTarget.name}" published! 🎉`, "success");
            setViewTarget(null);
          }}
        />
      )}
    </div>
  );
}
