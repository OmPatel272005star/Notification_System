import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreVertical, X, Check } from "lucide-react";
import { useToast } from "../../hooks/useToast";

// ── helpers ──────────────────────────────────────────────────────────────────
const CHANNEL_COLORS = {
  email:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  sms:      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  whatsapp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
};

function calcAge(dob) {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatAddress(addr) {
  if (!addr) return "—";
  const parts = [addr.city, addr.state, addr.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function primaryEmail(emails = []) {
  if (!emails.length) return "—";
  return (emails.find(e => e.is_primary) || emails[0]).email;
}

function primaryPhone(phones = []) {
  if (!phones.length) return "—";
  const p = phones.find(ph => ph.is_primary) || phones[0];
  return `${p.phone_code}${p.number}`;
}

// ── mock data ─────────────────────────────────────────────────────────────────
const INIT = [
  {
    _id: "1",
    first_name: "Do Not", last_name: "Delete",
    dob: "1995-08-17", gender: "male",
    emails: [{ email: "opatel272005@gmail.com", is_primary: true }],
    phone_numbers: [{ phone_code: "+91", number: "9624477474", is_primary: true }],
    address: { city: "Gandhinagar", state: "Gujarat", country: "India" },
    social_media_handles: ["email", "sms"],
  },
  {
    _id: "2",
    first_name: "Jane", last_name: "Smith",
    dob: "1990-03-22", gender: "female",
    emails: [{ email: "jane@example.com", is_primary: true }],
    phone_numbers: [{ phone_code: "+1", number: "5550001234", is_primary: true }],
    address: { city: "New York", state: "NY", country: "USA" },
    social_media_handles: ["whatsapp", "email"],
  },
];

const EMPTY_FORM = {
  first_name: "", last_name: "", dob: "", gender: "",
  email: "", phone_code: "+91", number: "",
  city: "", state: "", country: "",
  handles: [],
};

// ── ActionMenu — fixed-position dropdown ──────────────────────────────────────
function ThreeDotMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const menuRef = useRef();
  const btnRef = useRef();

  // Close when clicking anywhere outside the menu AND outside the trigger btn
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    // Use 'click' not 'mousedown' so the menu-item onClick fires first
    document.addEventListener("click", h, true);
    return () => document.removeEventListener("click", h, true);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(o => !o);
  };

  const handle = (fn) => (e) => {
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  const ITEMS = [
    { label: "View",   fn: onView },
    { label: "Edit",   fn: onEdit },
    "divider",
    { label: "Delete", fn: onDelete, danger: true },
  ];

  return (
    <>
      <button ref={btnRef} onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-48 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl shadow-xl py-1 text-sm">
          {ITEMS.map((item, i) =>
            item === "divider"
              ? <div key={i} className="my-1 border-t border-gray-100 dark:border-[#2A2F3A]" />
              : (
                <button key={i}
                  onMouseDown={handle(item.fn)}
                  className={`w-full text-left px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-[#1A2030] ${item.danger ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {item.label}
                </button>
              )
          )}
        </div>
      )}
    </>
  );
}

// ── Remove Confirm Dialog ──────────────────────────────────────────────────
function RemoveDialog({ open, onClose, onConfirm, name }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Remove Audience</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Are you sure you want to remove <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>? This action can't be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors font-medium">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium">
            Remove Audience
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Audience Modal (centered) ──────────────────────────────────
function AddAudienceModal({ open, onClose, onSave, initialData = null }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleHandle = (h) =>
    setForm(f => ({
      ...f,
      handles: f.handles.includes(h) ? f.handles.filter(x => x !== h) : [...f.handles, h],
    }));

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      const primaryEm = (initialData.emails || []).find(e => e.is_primary) || (initialData.emails || [])[0] || {};
      const primaryPh = (initialData.phone_numbers || []).find(p => p.is_primary) || (initialData.phone_numbers || [])[0] || {};
      setForm({
        first_name: initialData.first_name || "",
        last_name:  initialData.last_name  || "",
        dob:        initialData.dob ? initialData.dob.split("T")[0] : "",
        gender:     initialData.gender || "",
        email:      primaryEm.email || "",
        phone_code: primaryPh.phone_code || "+91",
        number:     primaryPh.number || "",
        city:       initialData.address?.city    || "",
        state:      initialData.address?.state   || "",
        country:    initialData.address?.country || "",
        handles:    initialData.social_media_handles || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, open]);

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-[#2A2F3A] bg-white dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] focus:border-transparent transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const sectionCls = "text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4";

  const handleSave = () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) return;
    const entry = {
      _id: initialData?._id || Date.now().toString(),
      first_name: form.first_name, last_name: form.last_name,
      dob: form.dob, gender: form.gender,
      emails: [{ email: form.email, is_primary: true }],
      phone_numbers: form.number ? [{ phone_code: form.phone_code, number: form.number, is_primary: true }] : [],
      address: { city: form.city, state: form.state, country: form.country },
      social_media_handles: form.handles,
    };
    onSave(entry);
    setForm(EMPTY_FORM);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog — centered, almost full height */}
      <div
        className="relative mt-8 mb-8 w-full max-w-2xl mx-4 bg-white dark:bg-[#161B22] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2A2F3A] flex flex-col"
        style={{ maxHeight: "calc(100vh - 64px)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? "Edit Audience" : "Audience Details"}
          </h2>

          {/* ── Personal Information ── */}
          <div>
            <p className={sectionCls}>Personal Information</p>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>First name</label>
                <input className={inputCls} placeholder="Enter first name" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Last name</label>
                  <input className={inputCls} placeholder="Enter last name" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" className={inputCls} value={form.dob} onChange={e => set("dob", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={form.gender} onChange={e => set("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Contact ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Contact</p>
            <div>
              <label className={labelCls}>Email <span className="text-red-500">*</span></label>
              <input type="email" className={inputCls} placeholder="User e-mail address" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="mt-4">
              <label className={labelCls}>Phone Number</label>
              <div className="flex gap-2">
                <input className={`${inputCls} w-24`} placeholder="+91" value={form.phone_code} onChange={e => set("phone_code", e.target.value)} />
                <input className={inputCls} placeholder="Enter number" value={form.number} onChange={e => set("number", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Address</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} placeholder="State" value={form.state} onChange={e => set("state", e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Country</label>
              <input className={inputCls} placeholder="Country" value={form.country} onChange={e => set("country", e.target.value)} />
            </div>
          </div>

          {/* Social Media Handles */}
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Social Media Handles</p>
            <div className="flex gap-3">
              {["email", "sms", "whatsapp"].map(h => (
                <button key={h} type="button"
                  onClick={() => toggleHandle(h)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.handles.includes(h) ? "border-[#6D5EF5] bg-[#6D5EF5]/10 text-[#6D5EF5]" : "border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A2030]"}`}>
                  {form.handles.includes(h) && <Check className="w-3.5 h-3.5" />}
                  {h.charAt(0).toUpperCase() + h.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all font-medium">
            Add Audience
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AudiencePage() {
  const { addToast } = useToast();
  const [audience, setAudience] = useState(INIT);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // audience entry being edited
  const [removeTarget, setRemoveTarget] = useState(null); // { _id, name }

  const filtered = audience.filter(a => {
    const q = search.toLowerCase();
    const name = `${a.first_name} ${a.last_name}`.toLowerCase();
    const email = primaryEmail(a.emails).toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  // Add new
  const handleSave = (entry) => {
    setAudience(prev => [entry, ...prev]);
    setShowAdd(false);
    addToast("Audience added successfully", "success");
  };

  // Update existing
  const handleUpdate = (updated) => {
    setAudience(prev => prev.map(a => a._id === updated._id ? updated : a));
    setEditTarget(null);
    addToast("Audience updated successfully", "success");
  };

  // Delete
  const handleRemove = () => {
    setAudience(prev => prev.filter(a => a._id !== removeTarget._id));
    addToast("Audience removed", "success");
    setRemoveTarget(null);
  };

  const thCls = "px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap";
  const tdCls = "px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audience</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{audience.length} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Add Audience(s)
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search audience..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all"
        />
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <tr>
                  <th className={thCls}>Name</th>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Address</th>
                  <th className={thCls}>Gender</th>
                  <th className={thCls}>Age</th>
                  <th className={thCls}>Phone Number</th>
                  <th className={thCls}>Social Media Handles</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
                {filtered.map(a => {
                  const fullName = `${a.first_name} ${a.last_name}`;
                  const initials = `${a.first_name[0] || ""}${a.last_name[0] || ""}`.toUpperCase();
                  return (
                    <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
                      {/* Name */}
                      <td className={tdCls}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{fullName}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className={tdCls + " text-gray-600 dark:text-gray-400"}>{primaryEmail(a.emails)}</td>
                      {/* Address */}
                      <td className={tdCls + " text-gray-600 dark:text-gray-400 max-w-[180px] truncate"}>{formatAddress(a.address)}</td>
                      {/* Gender */}
                      <td className={tdCls}>
                        {a.gender ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 capitalize">
                            {a.gender === "prefer_not_to_say" ? "—" : a.gender}
                          </span>
                        ) : "—"}
                      </td>
                      {/* Age */}
                      <td className={tdCls}>{calcAge(a.dob)}</td>
                      {/* Phone */}
                      <td className={tdCls}>{primaryPhone(a.phone_numbers)}</td>
                      {/* Handles */}
                      <td className={tdCls}>
                        <div className="flex flex-wrap gap-1">
                          {a.social_media_handles && a.social_media_handles.length > 0
                            ? a.social_media_handles.map(h => (
                              <span key={h} className={`px-2 py-0.5 rounded-full text-xs font-medium ${CHANNEL_COLORS[h] || ""}`}>
                                {h.toUpperCase()}
                              </span>
                            ))
                            : <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      {/* Three-dot menu */}
                      <td className="px-4 py-3.5 text-right">
                        <ThreeDotMenu
                          onView={() => addToast(`Viewing ${fullName}`, "info")}
                          onEdit={() => setEditTarget(a)}
                          onDelete={() => setRemoveTarget({ _id: a._id, name: fullName })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[#E4E7EC] dark:border-[#2A2F3A] text-xs text-gray-500 dark:text-gray-400">
            Showing {filtered.length} of {audience.length} contacts
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl py-24 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center text-3xl">👥</div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No audience found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{search ? "Try a different search term" : "Add your first audience member to get started"}</p>
          {!search && (
            <button onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all">
              Add Audience
            </button>
          )}
        </div>
      )}

      {/* Add Audience centered modal */}
      <AddAudienceModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />

      {/* Edit Audience modal (same form, pre-filled) */}
      <AddAudienceModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleUpdate}
        initialData={editTarget}
      />

      {/* Remove confirm dialog */}
      <RemoveDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        name={removeTarget?.name}
      />
    </div>
  );
}
