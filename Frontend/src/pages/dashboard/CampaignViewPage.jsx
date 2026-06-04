import { useState } from "react";
import {
  X, Mail, MessageCircle, MessageSquare, Bell, Smartphone,
  Radio, Layers, Globe, Calendar, Clock, Send, AlertCircle,
  CheckCircle2, Eye, Users, FileText, Copy, ChevronDown, ChevronUp,
  Loader2, Zap,
} from "lucide-react";
import { useToast }     from "../../hooks/useToast";
import { useCampaigns } from "../../context/CampaignContext";
import { useAuth }      from "../../context/AuthContext";
import { campaignService } from "../../services/campaignService";

// ── Channel maps ──────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  Email: Mail, WhatsApp: MessageCircle, SMS: MessageSquare,
  "In-App Messaging": Bell, "Mobile Push": Smartphone,
  RCS: Radio, MMS: Layers, "Web Push": Globe,
};
const TYPE_COLORS = {
  Email:              "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/40",
  WhatsApp:           "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800/40",
  SMS:                "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40",
  "In-App Messaging": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/40",
  "Mobile Push":      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/40",
  RCS:                "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/40",
  MMS:                "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/40",
  "Web Push":         "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return iso; }
};

// ── Section Card ──────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-[#6D5EF5]" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function Row({ label, children, value, copyable }) {
  const text = children ?? value ?? "—";
  return (
    <div className="flex items-start gap-4">
      <span className="text-xs text-gray-400 dark:text-gray-500 w-32 flex-shrink-0 pt-0.5 font-medium">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-all">{text}</span>
        {copyable && typeof text === "string" && text !== "—" && (
          <button onClick={() => navigator.clipboard.writeText(text).catch(() => {})}
            className="flex-shrink-0 p-0.5 text-gray-300 hover:text-gray-500 transition-colors">
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Contextual banner ─────────────────────────────────────────────────────────
function Banner({ type, title, msg }) {
  const cfg = {
    pending:   { wrap: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",   icon: <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />,   tc: "text-amber-700 dark:text-amber-400",  mc: "text-amber-600 dark:text-amber-500" },
    info:      { wrap: "bg-gray-50 dark:bg-[#1A2030] border-[#E4E7EC] dark:border-[#2A2F3A]",          icon: <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />,    tc: "text-gray-600 dark:text-gray-400",   mc: "text-gray-500 dark:text-gray-400" },
    scheduled: { wrap: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40",       icon: <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />,           tc: "text-blue-700 dark:text-blue-400",   mc: "text-blue-600 dark:text-blue-500" },
    success:   { wrap: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />, tc: "text-emerald-700 dark:text-emerald-400", mc: "text-emerald-600 dark:text-emerald-500" },
  };
  const c = cfg[type] || cfg.info;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${c.wrap}`}>
      {c.icon}
      <div>
        {title && <p className={`text-sm font-semibold ${c.tc}`}>{title}</p>}
        <p className={`text-xs mt-0.5 leading-relaxed ${c.mc}`} dangerouslySetInnerHTML={{ __html: msg }} />
      </div>
    </div>
  );
}

// ── Template preview ──────────────────────────────────────────────────────────
function TemplatePreview({ template }) {
  if (!template) return (
    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-300 dark:text-gray-600 py-10">
      <FileText className="w-10 h-10" />
      <p className="text-xs">No template attached</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#6D5EF5]/10 border border-[#6D5EF5]/30 rounded-xl">
        <FileText className="w-3.5 h-3.5 text-[#6D5EF5] flex-shrink-0" />
        <span className="text-xs font-semibold text-[#6D5EF5] truncate">{template.name}</span>
      </div>
      {template.htmlContent ? (
        <div
          className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-3 bg-gray-50 dark:bg-[#0F1117] overflow-hidden max-h-[280px]"
          dangerouslySetInnerHTML={{ __html: template.htmlContent.slice(0, 2000) }}
        />
      ) : (
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-3 bg-gray-50 dark:bg-[#0F1117] max-h-[280px] overflow-auto">
          {template.content || "No preview content."}
        </p>
      )}
    </div>
  );
}

// ── Publish confirm dialog ────────────────────────────────────────────────────
function PublishConfirm({ open, campaign, onCancel, onConfirm, publishing }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-7 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center mx-auto shadow-lg shadow-[#6D5EF5]/30">
          <Send className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Confirm Publish</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You are about to publish{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">"{campaign?.name}"</span>.
          </p>
          {campaign?.publishDetails?.scheduled_at && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D5EF5]/10 rounded-lg text-sm text-[#6D5EF5] font-medium">
              <Clock className="w-3.5 h-3.5" />
              {fmt(campaign.publishDetails.scheduled_at)}
            </div>
          )}
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/40">
            ⚠️ Once published, this campaign cannot be edited.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={publishing}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {publishing
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing…</>
              : <><Send className="w-3.5 h-3.5" />Publish Now</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Send Campaign confirm dialog ───────────────────────────────────────────────
function SendConfirm({ open, campaign, onCancel, onConfirm, sending }) {
  if (!open) return null;
  const hasConn     = Boolean(campaign?.connectionId);
  const hasTemplate = Boolean(campaign?.template);
  const hasAudience = (campaign?.audience?.length || 0) > 0;
  const canSend     = hasConn && hasTemplate && hasAudience;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-7 space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Send Campaign Now</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Emails will be sent immediately via the linked connection to{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {campaign?.audience?.length || 0} recipient(s)
            </span>.
          </p>
        </div>

        {/* Pre-flight checklist */}
        <div className="space-y-2">
          {[
            [hasConn,     "Connection linked"],
            [hasTemplate, "Template attached"],
            [hasAudience, "Audience selected"],
          ].map(([ok, label]) => (
            <div key={label} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              ok ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                 : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
            }`}>
              {ok
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle  className="w-4 h-4 flex-shrink-0" />}
              {label}
            </div>
          ))}
        </div>

        {!canSend && (
          <p className="text-xs text-red-500 dark:text-red-400 text-center">
            Fix the items above before sending. Edit the campaign to add missing details.
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={sending || !canSend}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {sending
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending…</>
              : <><Zap className="w-3.5 h-3.5" />Send Now</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat card (delivery stats) ────────────────────────────────────────────────
function Stat({ label, value, color }) {
  return (
    <div className={`rounded-xl px-4 py-3 border ${color}`}>
      <p className="text-2xl font-bold">{value ?? 0}</p>
      <p className="text-xs mt-0.5 opacity-70 font-medium">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CampaignViewModal — FULL-PAGE centered dialog
// ─────────────────────────────────────────────────────────────────────────────
export function CampaignViewDrawer({ campaign, onClose, onPublishDone }) {
  const { addToast }         = useToast();
  const { isAdmin }          = useAuth();
  const { publishCampaign }  = useCampaigns();

  const [showConfirm, setShowConfirm]   = useState(false);
  const [publishing, setPublishing]     = useState(false);
  const [showSendDlg, setShowSendDlg]   = useState(false);
  const [sending, setSending]           = useState(false);
  // local delivery stat bump after send
  const [sentCount, setSentCount]       = useState(null);
  const [failedCount, setFailedCount]   = useState(null);

  if (!campaign) return null;

  const Icon      = TYPE_ICONS[campaign.channelType] || Mail;
  const typeColor = TYPE_COLORS[campaign.channelType] || TYPE_COLORS["Web Push"];

  const isDraft     = campaign.status === "Draft";
  const isPublished = campaign.status === "Published";
  const hasSchedule = Boolean(campaign.publishDetails?.scheduled_at);
  const isApproved  = isDraft && hasSchedule;
  const isScheduled = campaign.scheduleStatus === "Scheduled";
  const isCompleted = campaign.scheduleStatus === "Completed";
  const isLive      = campaign.scheduleStatus === "Live";
  const canPublish  = isAdmin && isApproved;
  // Send button: email channel + admin + has connection
  const isEmail     = campaign.channelType === "Email";
  const canSendNow  = isAdmin && isEmail;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishCampaign(campaign.id);
      setShowConfirm(false);
      onPublishDone?.();
    } catch (err) {
      addToast(`Publish failed: ${err.message}`, "error");
    } finally {
      setPublishing(false);
    }
  };

  // ── Send handler ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setSending(true);
    try {
      const res = await campaignService.send(campaign.id || campaign._id);
      setShowSendDlg(false);
      const d = res?.data || {};
      setSentCount(d.sent ?? 0);
      setFailedCount(d.failed ?? 0);
      if ((d.failed ?? 0) === 0 && (d.sent ?? 0) > 0) {
        addToast(`✅ Sent to ${d.sent} recipient(s) successfully!`, "success");
      } else if ((d.sent ?? 0) === 0) {
        // All failed — show the first actual error from Brevo
        const firstErr = d.errors?.[0]?.error || "Unknown error. Check backend terminal.";
        addToast(`❌ All ${d.failed} failed: ${firstErr}`, "error");
      } else {
        // Partial success
        const firstErr = d.errors?.[0]?.error || "";
        addToast(`⚠️ Sent ${d.sent}, failed ${d.failed}. ${firstErr}`, "warning");
      }
    } catch (err) {
      addToast(`Send failed: ${err.message}`, "error");
    } finally {
      setSending(false);
    }
  };

  // Contextual banner
  const banner =
    isApproved  ? <Banner type="pending"   title="Pending Publishing"  msg="This campaign is <strong>approved</strong> and ready to go live. Click <strong>Publish</strong> above to activate." />
  : isDraft     ? <Banner type="info"      title=""                    msg='This campaign is a draft. Use <strong>Set Publish Details</strong> from the campaign list to schedule it.' />
  : isScheduled ? <Banner type="scheduled" title="Scheduled"           msg={`Delivery scheduled for <strong>${fmt(campaign.publishDetails?.scheduled_at)}</strong>.`} />
  : isCompleted ? <Banner type="success"   title="Completed"           msg={`Campaign was sent on <strong>${fmt(campaign.publishDetails?.scheduled_at)}</strong>.`} />
  : isLive      ? <Banner type="success"   title="Live"                msg="This campaign is currently live and being delivered." />
  : null;

  return (
    <>
      {/* ── Full-screen overlay ── */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 lg:p-10"
        onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

        {/* ── Dialog box ── */}
        <div
          className="relative w-full max-w-5xl max-h-[90vh] bg-[#F7F8FC] dark:bg-[#0F1117] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{ animation: "modalPop 0.25s cubic-bezier(.34,1.56,.64,1)" }}
          onClick={e => e.stopPropagation()}>

          {/* ══ Modal Header ══ */}
          <div className="flex-shrink-0 bg-white dark:bg-[#161B22] border-b border-[#E4E7EC] dark:border-[#2A2F3A] px-6 py-5">
            <div className="flex items-center justify-between gap-4">

              {/* Left: icon + name + badges */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D5EF5]/20 to-[#8B7CFF]/20 border border-[#6D5EF5]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#6D5EF5]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {campaign.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {/* Approval */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isApproved
                        ? "bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/30"
                        : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                    }`}>
                      {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isApproved ? "Approved" : "Not Approved"}
                    </span>
                    {/* Status */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      isDraft
                        ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        : "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/40"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? "bg-gray-400" : "bg-green-500"}`} />
                      {campaign.status}
                    </span>
                    {/* Schedule status */}
                    {campaign.scheduleStatus !== "Not Scheduled" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40">
                        <Clock className="w-3 h-3" />
                        {campaign.scheduleStatus}
                      </span>
                    )}
                    {/* Channel */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
                      {campaign.channelType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Send Campaign button (email + admin) */}
                {canSendNow && (
                  <button
                    onClick={() => setShowSendDlg(true)}
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                    {sending
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                      : <><Zap className="w-4 h-4" />Send Campaign</>}
                  </button>
                )}
                {canPublish && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-bold rounded-xl hover:shadow-xl hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
                    <Send className="w-4 h-4" />
                    Publish Campaign
                  </button>
                )}
                <button onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ══ Modal Body ══ */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* ── Left col (details) ── */}
              <div className="lg:col-span-2 space-y-4">

                {/* Banner */}
                {banner}

                {/* Campaign Details */}
                <Section title="Campaign Details" icon={FileText}>
                  <Row label="Channel Type">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColor}`}>
                      {campaign.channelType}
                    </span>
                  </Row>
                  <Row label="Name"         value={campaign.name}        copyable />
                  <Row label="Description"  value={campaign.description || "—"} />
                  <Row label="Sender Name"  value={campaign.emailSettings?.sender_name || "—"} />
                  <Row label="Subject"      value={campaign.emailSettings?.subject || "—"} copyable />
                  <Row label="View Rights">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {campaign.visibleTo?.includes("all") ? "All Users" : `${campaign.visibleTo?.length || 0} user(s)`}
                    </div>
                  </Row>
                  <Row label="Edit Rights">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      {campaign.editableBy?.includes("all") ? "All Users" : `${campaign.editableBy?.length || 0} user(s)`}
                    </div>
                  </Row>
                  <Row label="Audience">
                    {campaign.audience?.length > 0
                      ? `${campaign.audience.length} contact(s)`
                      : "None selected"}
                  </Row>
                  <Row label="Created By"   value={campaign.createdBy?.name || "—"} />
                  <Row label="Created"      value={fmt(campaign.createdAt)} />
                  <Row label="Last Updated" value={fmt(campaign.updatedAt)} />
                </Section>

                {/* Publish Details */}
                <Section title="Publish Details" icon={Calendar}>
                  <Row label="Trigger Type" value="Time-Based" />
                  <Row label="Recurrence"   value={campaign.scheduleType || "One Time"} />
                  <Row label="Scheduled At">
                    {hasSchedule ? (
                      <div className="flex items-center gap-2 text-[#6D5EF5] font-bold text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {fmt(campaign.publishDetails.scheduled_at)}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-sm">Not yet set</span>
                    )}
                  </Row>
                  {campaign.publishDetails?.published_at && (
                    <Row label="Published At" value={fmt(campaign.publishDetails.published_at)} />
                  )}
                </Section>

                {/* Delivery stats: shown after any send, or if published/completed/live */}
                {(isPublished || isCompleted || isLive || sentCount !== null) && (
                  <Section title="Delivery Stats" icon={Eye} defaultOpen={sentCount !== null}>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <Stat label="Sent"      value={sentCount ?? campaign.deliveryStats?.sent}      color="bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-400" />
                      <Stat label="Delivered" value={campaign.deliveryStats?.delivered} color="bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400" />
                      <Stat label="Opened"    value={campaign.deliveryStats?.opened}    color="bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-950/20 dark:border-purple-800/30 dark:text-purple-400" />
                      <Stat label="Clicked"   value={campaign.deliveryStats?.clicked}   color="bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-800/30 dark:text-indigo-400" />
                      <Stat label="Bounced"   value={campaign.deliveryStats?.bounced}   color="bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20 dark:border-orange-800/30 dark:text-orange-400" />
                      <Stat label="Failed"    value={failedCount ?? campaign.deliveryStats?.failed}    color="bg-red-50 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400" />
                    </div>
                  </Section>
                )}
              </div>

              {/* ── Right col (template preview) ── */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#6D5EF5]/10 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-[#6D5EF5]" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Template Preview</span>
                  </div>
                  <TemplatePreview template={campaign.template} />
                </div>

                {/* Quick meta card */}
                <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Info</p>
                  <div className="space-y-2.5">
                    {[
                      ["Campaign ID", (campaign.id || campaign._id || "—").toString().slice(-8).toUpperCase()],
                      ["Schedule Type", campaign.scheduleType || "One Time"],
                      ["Schedule Status", campaign.scheduleStatus],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 dark:text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish confirm */}
      <PublishConfirm
        open={showConfirm}
        campaign={campaign}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handlePublish}
        publishing={publishing}
      />

      {/* Send confirm */}
      <SendConfirm
        open={showSendDlg}
        campaign={campaign}
        onCancel={() => setShowSendDlg(false)}
        onConfirm={handleSend}
        sending={sending}
      />

      <style>{`
        @keyframes modalPop {
          from { transform: scale(0.92) translateY(16px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
