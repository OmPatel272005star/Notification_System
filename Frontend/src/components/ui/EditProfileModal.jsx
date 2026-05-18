import { useState, useRef, useEffect } from "react";
import { X, Camera, User, Phone, MapPin, Calendar, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland",
  "France", "Germany", "Ghana", "Greece", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya",
  "Malaysia", "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Saudi Arabia", "South Africa", "South Korea", "Spain",
  "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

const PHONE_CODES = [
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+91", label: "IN +91" },
  { code: "+61", label: "AU +61" },
  { code: "+81", label: "JP +81" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+86", label: "CN +86" },
  { code: "+55", label: "BR +55" },
  { code: "+7",  label: "RU +7"  },
  { code: "+971",label: "AE +971"},
  { code: "+92", label: "PK +92" },
  { code: "+880",label: "BD +880"},
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German", "Arabic", "Chinese",
  "Portuguese", "Russian", "Japanese", "Korean", "Italian", "Dutch",
  "Turkish", "Polish", "Vietnamese", "Bengali", "Gujarati", "Marathi",
];

/* ---------- tiny custom select ---------- */
function CustomSelect({ value, onChange, options, placeholder, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="ep-select-wrap" id={id}>
      <button
        type="button"
        className="ep-select-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? "ep-select-val" : "ep-select-placeholder"}>
          {value || placeholder}
        </span>
        <div className="ep-select-actions">
          {value && (
            <span
              className="ep-select-clear"
              onMouseDown={(e) => { e.stopPropagation(); onChange(""); }}
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={`ep-select-chevron ${open ? "open" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="ep-select-dropdown">
          {options.map((opt) => (
            <div
              key={opt}
              className={`ep-select-option ${opt === value ? "selected" : ""}`}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- phone code select ---------- */
function PhoneCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = PHONE_CODES.find((p) => p.code === value) || PHONE_CODES[2];

  return (
    <div ref={ref} className="ep-phonecode-wrap">
      <button
        type="button"
        className="ep-phonecode-btn"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ep-phonecode-val">{selected.code}</span>
        <div className="ep-select-actions">
          <X
            size={11}
            className="ep-select-clear"
            onMouseDown={(e) => { e.stopPropagation(); onChange("+91"); }}
          />
          <ChevronDown size={13} className={`ep-select-chevron ${open ? "open" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="ep-select-dropdown ep-phonecode-dropdown">
          {PHONE_CODES.map((p) => (
            <div
              key={p.code}
              className={`ep-select-option ${p.code === value ? "selected" : ""}`}
              onMouseDown={() => { onChange(p.code); setOpen(false); }}
            >
              {p.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MAIN MODAL
   ============================================================ */
export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();

  /* Split stored mobile into code + number */
  const splitMobile = (raw = "") => {
    const match = raw.match(/^(\+\d{1,4})\s?(.*)$/);
    if (match) return { code: match[1], num: match[2] };
    return { code: "+91", num: raw };
  };

  const { code: initCode, num: initNum } = splitMobile(user?.mobile || "");

  const [form, setForm] = useState({
    name:       user?.name        || "",
    gender:     user?.gender      || "",
    birthDate:  user?.birthDate   || "",
    country:    user?.country     || "",
    state:      user?.state       || "",
    city:       user?.city        || "",
    phoneCode:  initCode          || "+91",
    phoneNum:   initNum           || "",
    language:   user?.language    || "",
    avatarUrl:  user?.avatarUrl   || "",
  });

  const fileRef = useRef();
  const overlayRef = useRef();

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setInput = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  /* Preview selected avatar */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, avatarUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  /* Close on backdrop click */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleSave = () => {
    updateUser({
      name:      form.name,
      gender:    form.gender,
      birthDate: form.birthDate,
      country:   form.country,
      state:     form.state,
      city:      form.city,
      mobile:    `${form.phoneCode} ${form.phoneNum}`,
      language:  form.language,
      avatarUrl: form.avatarUrl,
    });
    onClose();
  };

  /* Initials fallback */
  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      {/* ---- inline styles ---- */}
      <style>{`
        /* Overlay */
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

        /* Dialog */
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

        /* Dark */
        .dark .ep-dialog {
          --ep-bg: #161B22;
          --ep-border: #2A2F3A;
          --ep-label: #9CA3AF;
          --ep-input-bg: #0D1117;
          --ep-input-border: #2A2F3A;
          --ep-input-text: #F3F4F6;
          --ep-placeholder: #4B5563;
          --ep-option-hover: #1F2937;
          --ep-option-selected-bg: #6D5EF5;
        }
        .ep-dialog {
          --ep-bg: #fff;
          --ep-border: #E4E7EC;
          --ep-label: #6B7280;
          --ep-input-bg: #F9FAFB;
          --ep-input-border: #D1D5DB;
          --ep-input-text: #111827;
          --ep-placeholder: #9CA3AF;
          --ep-option-hover: #F3F4F6;
          --ep-option-selected-bg: #6D5EF5;
        }

        /* Header */
        .ep-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--ep-border);
          flex-shrink: 0;
        }
        .ep-header-left { display: flex; align-items: center; gap: 12px; }
        .ep-icon-box {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6D5EF5, #8B7CFF);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }
        .ep-title {
          font-size: 16px; font-weight: 700;
          color: var(--ep-input-text);
          margin: 0;
        }
        .ep-subtitle {
          font-size: 12px; color: var(--ep-label);
          margin: 2px 0 0;
        }
        .ep-close {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
          color: var(--ep-label);
          transition: background 0.15s, color 0.15s;
        }
        .ep-close:hover { background: var(--ep-option-hover); color: var(--ep-input-text); }

        /* Body */
        .ep-body {
          overflow-y: auto;
          padding: 20px 24px;
          flex: 1;
        }
        .ep-body::-webkit-scrollbar { width: 4px; }
        .ep-body::-webkit-scrollbar-track { background: transparent; }
        .ep-body::-webkit-scrollbar-thumb { background: var(--ep-input-border); border-radius: 4px; }

        /* Avatar section */
        .ep-avatar-row {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 0 20px;
          border-bottom: 1px solid var(--ep-border);
          margin-bottom: 20px;
        }
        .ep-avatar-wrap { position: relative; flex-shrink: 0; }
        .ep-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #6D5EF5, #8B7CFF);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700; color: #fff;
          overflow: hidden;
        }
        .ep-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ep-cam-btn {
          position: absolute; bottom: 0; right: 0;
          width: 26px; height: 26px; border-radius: 50%;
          background: #6D5EF5; border: 2px solid var(--ep-bg);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #fff;
          transition: background 0.15s;
        }
        .ep-cam-btn:hover { background: #5a4de0; }
        .ep-avatar-info .ep-user-name {
          font-size: 15px; font-weight: 600;
          color: var(--ep-input-text); margin: 0 0 2px;
        }
        .ep-avatar-info .ep-user-sub {
          font-size: 12px; color: var(--ep-label);
        }
        .ep-change-pic-btn {
          margin-top: 8px;
          font-size: 11px; font-weight: 500;
          color: #6D5EF5; background: none;
          border: 1px solid #6D5EF5; border-radius: 6px;
          padding: 4px 10px; cursor: pointer;
          transition: background 0.15s;
        }
        .ep-change-pic-btn:hover { background: rgba(109,94,245,0.08); }

        /* Grid */
        .ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ep-grid-full { grid-column: 1 / -1; }
        @media (max-width: 480px) { .ep-grid { grid-template-columns: 1fr; } }

        /* Field */
        .ep-field { display: flex; flex-direction: column; gap: 5px; }
        .ep-label {
          font-size: 12px; font-weight: 500;
          color: var(--ep-label); display: flex; align-items: center; gap: 4px;
        }
        .ep-input {
          height: 40px; border-radius: 10px;
          border: 1px solid var(--ep-input-border);
          background: var(--ep-input-bg);
          color: var(--ep-input-text);
          font-size: 13px; padding: 0 12px;
          width: 100%; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .ep-input:focus {
          border-color: #6D5EF5;
          box-shadow: 0 0 0 3px rgba(109,94,245,0.15);
        }
        .ep-input-icon-wrap { position: relative; }
        .ep-input-icon-wrap .ep-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--ep-label); pointer-events: none;
        }
        .ep-input-icon-wrap .ep-input { padding-left: 34px; }

        /* Phone row */
        .ep-phone-row { display: flex; gap: 8px; }
        .ep-phone-num { flex: 1; }

        /* Custom select */
        .ep-select-wrap { position: relative; }
        .ep-select-btn {
          width: 100%; height: 40px; border-radius: 10px;
          border: 1px solid var(--ep-input-border);
          background: var(--ep-input-bg);
          color: var(--ep-input-text);
          font-size: 13px; padding: 0 10px 0 12px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; text-align: left;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ep-select-btn:focus { outline: none; border-color: #6D5EF5; box-shadow: 0 0 0 3px rgba(109,94,245,0.15); }
        .ep-select-placeholder { color: var(--ep-placeholder); font-size: 13px; }
        .ep-select-val { color: var(--ep-input-text); font-size: 13px; }
        .ep-select-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .ep-select-clear {
          color: var(--ep-label); cursor: pointer; display: flex; align-items: center;
          padding: 2px; border-radius: 4px;
        }
        .ep-select-clear:hover { color: var(--ep-input-text); }
        .ep-select-chevron { color: var(--ep-label); transition: transform 0.2s; }
        .ep-select-chevron.open { transform: rotate(180deg); }
        .ep-select-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0;
          background: var(--ep-bg);
          border: 1px solid var(--ep-input-border);
          border-radius: 10px;
          max-height: 180px; overflow-y: auto;
          z-index: 100;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .ep-select-dropdown::-webkit-scrollbar { width: 4px; }
        .ep-select-dropdown::-webkit-scrollbar-thumb { background: var(--ep-input-border); border-radius: 4px; }
        .ep-select-option {
          padding: 9px 12px; font-size: 13px;
          color: var(--ep-input-text); cursor: pointer;
          transition: background 0.12s;
        }
        .ep-select-option:hover { background: var(--ep-option-hover); }
        .ep-select-option.selected { background: var(--ep-option-selected-bg); color: #fff; }

        /* Phone code select */
        .ep-phonecode-wrap { position: relative; flex-shrink: 0; }
        .ep-phonecode-btn {
          height: 40px; border-radius: 10px;
          border: 1px solid var(--ep-input-border);
          background: var(--ep-input-bg);
          color: var(--ep-input-text);
          font-size: 13px; padding: 0 8px;
          display: flex; align-items: center; gap: 4px;
          cursor: pointer; white-space: nowrap;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .ep-phonecode-btn:focus { outline: none; border-color: #6D5EF5; }
        .ep-phonecode-val { font-size: 13px; color: var(--ep-input-text); }
        .ep-phonecode-dropdown { width: 130px; left: 0; right: auto; }

        /* Date input */
        .ep-date-wrap { position: relative; }
        .ep-date-wrap .ep-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: var(--ep-label); pointer-events: none; z-index: 1;
        }
        .ep-date-input {
          height: 40px; border-radius: 10px;
          border: 1px solid var(--ep-input-border);
          background: var(--ep-input-bg);
          color: var(--ep-input-text);
          font-size: 13px; padding: 0 12px 0 34px;
          width: 100%; box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          -webkit-appearance: none;
        }
        .ep-date-input:focus {
          border-color: #6D5EF5;
          box-shadow: 0 0 0 3px rgba(109,94,245,0.15);
        }
        .ep-date-input::-webkit-calendar-picker-indicator {
          opacity: 0.4; cursor: pointer;
          filter: var(--cal-filter, none);
        }
        .dark .ep-date-input::-webkit-calendar-picker-indicator { filter: invert(1); }

        /* Footer */
        .ep-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid var(--ep-border);
          flex-shrink: 0;
          background: var(--ep-bg);
        }
        .ep-btn-cancel {
          height: 38px; padding: 0 20px; border-radius: 10px;
          border: 1px solid var(--ep-input-border);
          background: transparent; color: var(--ep-input-text);
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .ep-btn-cancel:hover { background: var(--ep-option-hover); }
        .ep-btn-save {
          height: 38px; padding: 0 24px; border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6D5EF5, #8B7CFF);
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(109,94,245,0.35);
        }
        .ep-btn-save:hover { opacity: 0.9; transform: translateY(-1px); }
        .ep-btn-save:active { transform: translateY(0); }
      `}</style>

      {/* Overlay */}
      <div className="ep-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="ep-dialog" role="dialog" aria-modal="true" aria-labelledby="ep-title">
          {/* Header */}
          <div className="ep-header">
            <div className="ep-header-left">
              <div className="ep-icon-box">
                <User size={18} />
              </div>
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
            {/* Avatar */}
            <div className="ep-avatar-row">
              <div className="ep-avatar-wrap">
                <div className="ep-avatar">
                  {form.avatarUrl
                    ? <img src={form.avatarUrl} alt="Profile" />
                    : initials
                  }
                </div>
                <div
                  className="ep-cam-btn"
                  onClick={() => fileRef.current?.click()}
                  title="Change profile picture"
                >
                  <Camera size={12} />
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="ep-avatar-info">
                <p className="ep-user-name">{form.name || "Your Name"}</p>
                <p className="ep-user-sub">{user?.email}</p>
                <button className="ep-change-pic-btn" onClick={() => fileRef.current?.click()}>
                  Change Picture
                </button>
              </div>
            </div>

            {/* Fields grid */}
            <div className="ep-grid">
              {/* Name */}
              <div className="ep-field">
                <label className="ep-label" htmlFor="ep-name">Name</label>
                <input
                  id="ep-name"
                  className="ep-input"
                  type="text"
                  value={form.name}
                  onChange={setInput("name")}
                  placeholder="Your full name"
                />
              </div>

              {/* Gender */}
              <div className="ep-field">
                <label className="ep-label">Gender</label>
                <CustomSelect
                  id="ep-gender"
                  value={form.gender}
                  onChange={set("gender")}
                  options={["Male", "Female"]}
                  placeholder="Select gender"
                />
              </div>

              {/* Birth Date */}
              <div className="ep-field">
                <label className="ep-label" htmlFor="ep-dob">
                  <Calendar size={12} /> Birth Date
                </label>
                <div className="ep-date-wrap">
                  <Calendar size={14} className="ep-icon" />
                  <input
                    id="ep-dob"
                    type="date"
                    className="ep-date-input"
                    value={form.birthDate}
                    onChange={setInput("birthDate")}
                  />
                </div>
              </div>

              {/* Country */}
              <div className="ep-field">
                <label className="ep-label">
                  <Globe size={12} /> Country (Optional)
                </label>
                <CustomSelect
                  id="ep-country"
                  value={form.country}
                  onChange={set("country")}
                  options={COUNTRIES}
                  placeholder="Select country"
                />
              </div>

              {/* State */}
              <div className="ep-field">
                <label className="ep-label">
                  <MapPin size={12} /> State (Optional)
                </label>
                <input
                  id="ep-state"
                  className="ep-input"
                  type="text"
                  value={form.state}
                  onChange={setInput("state")}
                  placeholder="State / Province"
                />
              </div>

              {/* City */}
              <div className="ep-field">
                <label className="ep-label">
                  <MapPin size={12} /> City (Optional)
                </label>
                <input
                  id="ep-city"
                  className="ep-input"
                  type="text"
                  value={form.city}
                  onChange={setInput("city")}
                  placeholder="City"
                />
              </div>

              {/* Mobile Number */}
              <div className="ep-field ep-grid-full">
                <label className="ep-label">
                  <Phone size={12} /> Mobile Number
                </label>
                <div className="ep-phone-row">
                  <PhoneCodeSelect value={form.phoneCode} onChange={set("phoneCode")} />
                  <input
                    id="ep-phone"
                    className="ep-input ep-phone-num"
                    type="tel"
                    value={form.phoneNum}
                    onChange={setInput("phoneNum")}
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="ep-field ep-grid-full">
                <label className="ep-label">Preferred Language (Optional)</label>
                <CustomSelect
                  id="ep-language"
                  value={form.language}
                  onChange={set("language")}
                  options={LANGUAGES}
                  placeholder="Select language"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ep-footer">
            <button className="ep-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="ep-btn-save" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </>
  );
}
