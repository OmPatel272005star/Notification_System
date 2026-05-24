import { useState, useRef } from "react";
import { X, User } from "lucide-react";
import { useAuth }              from "../../context/AuthContext";
import { updateMyProfile }      from "../../services/profileService";
import { ProfileAvatarSection } from "./profile/ProfileAvatarSection";
import { ProfileFieldsGrid }    from "./profile/ProfileFieldsGrid";

/* ---------- inline styles (unchanged from original) ---------- */
const STYLES = `
  .ep-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: ep-fade-in 0.18s ease;
  }
  @keyframes ep-fade-in { from { opacity:0; } to { opacity:1; } }
  .ep-dialog {
    width: 100%; max-width: 580px;
    background: var(--ep-bg, #fff);
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.22);
    display: flex; flex-direction: column;
    max-height: 92vh;
    animation: ep-slide-up 0.22s ease;
    overflow: hidden;
  }
  @keyframes ep-slide-up {
    from { opacity:0; transform: translateY(24px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .dark .ep-dialog {
    --ep-bg: #161B22; --ep-border: #2A2F3A; --ep-label: #9CA3AF;
    --ep-input-bg: #0D1117; --ep-input-border: #2A2F3A; --ep-input-text: #F3F4F6;
    --ep-placeholder: #4B5563; --ep-option-hover: #1F2937; --ep-option-selected-bg: #6D5EF5;
  }
  .ep-dialog {
    --ep-bg: #fff; --ep-border: #E4E7EC; --ep-label: #6B7280;
    --ep-input-bg: #F9FAFB; --ep-input-border: #D1D5DB; --ep-input-text: #111827;
    --ep-placeholder: #9CA3AF; --ep-option-hover: #F3F4F6; --ep-option-selected-bg: #6D5EF5;
  }
  .ep-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 16px; border-bottom:1px solid var(--ep-border); flex-shrink:0; }
  .ep-header-left { display:flex; align-items:center; gap:12px; }
  .ep-icon-box { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#6D5EF5,#8B7CFF); display:flex; align-items:center; justify-content:center; color:#fff; }
  .ep-title { font-size:16px; font-weight:700; color:var(--ep-input-text); margin:0; }
  .ep-subtitle { font-size:12px; color:var(--ep-label); margin:2px 0 0; }
  .ep-close { width:32px; height:32px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; background:transparent; color:var(--ep-label); transition:background 0.15s,color 0.15s; }
  .ep-close:hover { background:var(--ep-option-hover); color:var(--ep-input-text); }
  .ep-body { overflow-y:auto; padding:20px 24px; flex:1; }
  .ep-body::-webkit-scrollbar { width:4px; }
  .ep-body::-webkit-scrollbar-track { background:transparent; }
  .ep-body::-webkit-scrollbar-thumb { background:var(--ep-input-border); border-radius:4px; }
  .ep-avatar-row { display:flex; align-items:center; gap:16px; padding:16px 0 20px; border-bottom:1px solid var(--ep-border); margin-bottom:20px; }
  .ep-avatar-wrap { position:relative; flex-shrink:0; }
  .ep-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#6D5EF5,#8B7CFF); display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#fff; overflow:hidden; }
  .ep-avatar img { width:100%; height:100%; object-fit:cover; }
  .ep-cam-btn { position:absolute; bottom:0; right:0; width:26px; height:26px; border-radius:50%; background:#6D5EF5; border:2px solid var(--ep-bg); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; transition:background 0.15s; }
  .ep-cam-btn:hover { background:#5a4de0; }
  .ep-avatar-info .ep-user-name { font-size:15px; font-weight:600; color:var(--ep-input-text); margin:0 0 2px; }
  .ep-avatar-info .ep-user-sub { font-size:12px; color:var(--ep-label); }
  .ep-change-pic-btn { margin-top:8px; font-size:11px; font-weight:500; color:#6D5EF5; background:none; border:1px solid #6D5EF5; border-radius:6px; padding:4px 10px; cursor:pointer; transition:background 0.15s; }
  .ep-change-pic-btn:hover { background:rgba(109,94,245,0.08); }
  .ep-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .ep-grid-full { grid-column:1/-1; }
  @media (max-width:480px) { .ep-grid { grid-template-columns:1fr; } }
  .ep-field { display:flex; flex-direction:column; gap:5px; }
  .ep-label { font-size:12px; font-weight:500; color:var(--ep-label); display:flex; align-items:center; gap:4px; }
  .ep-input { height:40px; border-radius:10px; border:1px solid var(--ep-input-border); background:var(--ep-input-bg); color:var(--ep-input-text); font-size:13px; padding:0 12px; width:100%; box-sizing:border-box; transition:border-color 0.15s,box-shadow 0.15s; outline:none; }
  .ep-input:focus { border-color:#6D5EF5; box-shadow:0 0 0 3px rgba(109,94,245,0.15); }
  .ep-input-icon-wrap { position:relative; }
  .ep-input-icon-wrap .ep-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--ep-label); pointer-events:none; }
  .ep-input-icon-wrap .ep-input { padding-left:34px; }
  .ep-phone-row { display:flex; gap:8px; }
  .ep-phone-num { flex:1; }
  .ep-select-wrap { position:relative; }
  .ep-select-btn { width:100%; height:40px; border-radius:10px; border:1px solid var(--ep-input-border); background:var(--ep-input-bg); color:var(--ep-input-text); font-size:13px; padding:0 10px 0 12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; text-align:left; box-sizing:border-box; transition:border-color 0.15s,box-shadow 0.15s; }
  .ep-select-btn:focus { outline:none; border-color:#6D5EF5; box-shadow:0 0 0 3px rgba(109,94,245,0.15); }
  .ep-select-placeholder { color:var(--ep-placeholder); font-size:13px; }
  .ep-select-val { color:var(--ep-input-text); font-size:13px; }
  .ep-select-actions { display:flex; align-items:center; gap:4px; flex-shrink:0; }
  .ep-select-clear { color:var(--ep-label); cursor:pointer; display:flex; align-items:center; padding:2px; border-radius:4px; }
  .ep-select-clear:hover { color:var(--ep-input-text); }
  .ep-select-chevron { color:var(--ep-label); transition:transform 0.2s; }
  .ep-select-chevron.open { transform:rotate(180deg); }
  .ep-select-dropdown { position:absolute; top:calc(100% + 4px); left:0; right:0; background:var(--ep-bg); border:1px solid var(--ep-input-border); border-radius:10px; max-height:180px; overflow-y:auto; z-index:100; box-shadow:0 8px 24px rgba(0,0,0,0.12); }
  .ep-select-dropdown::-webkit-scrollbar { width:4px; }
  .ep-select-dropdown::-webkit-scrollbar-thumb { background:var(--ep-input-border); border-radius:4px; }
  .ep-select-option { padding:9px 12px; font-size:13px; color:var(--ep-input-text); cursor:pointer; transition:background 0.12s; }
  .ep-select-option:hover { background:var(--ep-option-hover); }
  .ep-select-option.selected { background:var(--ep-option-selected-bg); color:#fff; }
  .ep-phonecode-wrap { position:relative; flex-shrink:0; }
  .ep-phonecode-btn { height:40px; border-radius:10px; border:1px solid var(--ep-input-border); background:var(--ep-input-bg); color:var(--ep-input-text); font-size:13px; padding:0 8px; display:flex; align-items:center; gap:4px; cursor:pointer; white-space:nowrap; box-sizing:border-box; transition:border-color 0.15s; }
  .ep-phonecode-btn:focus { outline:none; border-color:#6D5EF5; }
  .ep-phonecode-val { font-size:13px; color:var(--ep-input-text); }
  .ep-phonecode-dropdown { width:130px; left:0; right:auto; }
  .ep-date-wrap { position:relative; }
  .ep-date-wrap .ep-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--ep-label); pointer-events:none; z-index:1; }
  .ep-date-input { height:40px; border-radius:10px; border:1px solid var(--ep-input-border); background:var(--ep-input-bg); color:var(--ep-input-text); font-size:13px; padding:0 12px 0 34px; width:100%; box-sizing:border-box; outline:none; transition:border-color 0.15s,box-shadow 0.15s; -webkit-appearance:none; }
  .ep-date-input:focus { border-color:#6D5EF5; box-shadow:0 0 0 3px rgba(109,94,245,0.15); }
  .ep-date-input::-webkit-calendar-picker-indicator { opacity:0.4; cursor:pointer; }
  .dark .ep-date-input::-webkit-calendar-picker-indicator { filter:invert(1); }
  .ep-footer { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:16px 24px; border-top:1px solid var(--ep-border); flex-shrink:0; background:var(--ep-bg); }
  .ep-btn-cancel { height:38px; padding:0 20px; border-radius:10px; border:1px solid var(--ep-input-border); background:transparent; color:var(--ep-input-text); font-size:13px; font-weight:500; cursor:pointer; transition:background 0.15s; }
  .ep-btn-cancel:hover { background:var(--ep-option-hover); }
  .ep-btn-save { height:38px; padding:0 24px; border-radius:10px; border:none; background:linear-gradient(135deg,#6D5EF5,#8B7CFF); color:#fff; font-size:13px; font-weight:600; cursor:pointer; transition:opacity 0.15s,transform 0.1s; box-shadow:0 4px 12px rgba(109,94,245,0.35); }
  .ep-btn-save:hover { opacity:0.9; transform:translateY(-1px); }
  .ep-btn-save:active { transform:translateY(0); }
`;

export default function EditProfileModal({ onClose }) {
  const { user, updateUser: updateUserCtx } = useAuth();

  // ── Helpers ──────────────────────────────────────────────────────────────
  const splitMobile = (raw = "") => {
    const match = raw.match(/^(\+\d{1,4})\s?(.*)$/);
    return match ? { code: match[1], num: match[2] } : { code: "+91", num: raw };
  };

  /** Convert DB ISO date (2000-01-15T00:00:00Z) → YYYY-MM-DD for <input type="date"> */
  const fmtDate = (val) => {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  };

  // ── Form state — reads from correct nested paths ──────────────────────────
  const { code: initCode, num: initNum } = splitMobile(user?.profile?.mobile || "");

  const [form, setForm] = useState({
    name:      user?.display_name              || "",
    gender:    user?.profile?.gender           || "",
    birthDate: fmtDate(user?.profile?.dob)     || "",
    country:   user?.profile?.country          || "",
    state:     user?.profile?.state            || "",
    city:      user?.profile?.city             || "",
    phoneCode: initCode                        || "+91",
    phoneNum:  initNum                         || "",
    avatarUrl: user?.profile?.profile_picture  || "",
  });

  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarErr, setAvatarErr] = useState("");

  const overlayRef = useRef();
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      const payload = {
        display_name:    form.name      || undefined,
        gender:          form.gender    || undefined,
        dob:             form.birthDate || undefined,
        country:         form.country   || undefined,
        state:           form.state     || undefined,
        city:            form.city      || undefined,
        mobile:          form.phoneNum  ? `${form.phoneCode}${form.phoneNum}` : undefined,
        profile_picture: form.avatarUrl || undefined,
      };

      const res = await updateMyProfile(payload);

      // Merge fresh server data into AuthContext + localStorage
      updateUserCtx({
        display_name: res.data.display_name,
        profile:      res.data.profile,
      });

      onClose();
    } catch (err) {
      setSaveError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="ep-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="ep-dialog" role="dialog" aria-modal="true" aria-labelledby="ep-title">

          {/* Header */}
          <div className="ep-header">
            <div className="ep-header-left">
              <div className="ep-icon-box"><User size={18} /></div>
              <div>
                <p className="ep-title" id="ep-title">Edit Your Profile Information</p>
                <p className="ep-subtitle">Update your personal details below</p>
              </div>
            </div>
            <button className="ep-close" onClick={onClose} aria-label="Close dialog">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="ep-body">
            <ProfileAvatarSection
              form={form}
              setForm={setForm}
              userEmail={user?.email}
              onError={setAvatarErr}
            />

            {/* Avatar compression error */}
            {avatarErr && (
              <p style={{ color: "#EF4444", fontSize: 12, marginBottom: 12 }}>{avatarErr}</p>
            )}

            {/* API save error */}
            {saveError && (
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#EF4444", fontSize: 13 }}>
                {saveError}
              </div>
            )}

            <ProfileFieldsGrid form={form} setForm={setForm} />
          </div>

          {/* Footer */}
          <div className="ep-footer">
            <button className="ep-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="ep-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
