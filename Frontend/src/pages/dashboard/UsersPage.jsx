import { useState } from "react";
import { Search, Plus, Trash2, Edit3, Shield, UserCheck, Eye, Mail } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const ROLES = ["Owner", "Admin", "Editor", "Viewer"];

const ROLE_CFG = {
  Owner:  { cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400", icon: Shield },
  Admin:  { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: UserCheck },
  Editor: { cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400", icon: Edit3 },
  Viewer: { cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", icon: Eye },
};

const INIT_USERS = [
  { id: 1, name: "Om Patel", email: "om@mailflow.io", role: "Owner", status: "Active", lastActive: "Today", campaigns: 12, initials: "OP", color: "from-purple-500 to-purple-600" },
  { id: 2, name: "Sarah Johnson", email: "sarah@mailflow.io", role: "Admin", status: "Active", lastActive: "2 hours ago", campaigns: 8, initials: "SJ", color: "from-blue-500 to-blue-600" },
  { id: 3, name: "Mike Ross", email: "mike@mailflow.io", role: "Editor", status: "Active", lastActive: "Yesterday", campaigns: 5, initials: "MR", color: "from-emerald-500 to-emerald-600" },
  { id: 4, name: "Emma Davis", email: "emma@mailflow.io", role: "Viewer", status: "Inactive", lastActive: "5 days ago", campaigns: 0, initials: "ED", color: "from-gray-400 to-gray-500" },
];

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState(INIT_USERS);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Editor" });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (id) => { setUsers(p => p.filter(u => u.id !== id)); addToast("User removed", "success"); };

  const handleInvite = () => {
    if (!inviteForm.email.includes("@")) { addToast("Valid email required", "error"); return; }
    const initials = inviteForm.name ? inviteForm.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : inviteForm.email[0].toUpperCase();
    const colors = ["from-purple-500 to-purple-600", "from-blue-500 to-blue-600", "from-teal-500 to-teal-600", "from-pink-500 to-pink-600"];
    const nu = { id: Date.now(), name: inviteForm.name || inviteForm.email.split("@")[0], email: inviteForm.email, role: inviteForm.role, status: "Pending", lastActive: "Invited", campaigns: 0, initials, color: colors[users.length % colors.length] };
    setUsers(p => [...p, nu]);
    setShowInvite(false);
    setInviteForm({ name: "", email: "", role: "Editor" });
    addToast(`Invitation sent to ${inviteForm.email}`, "success");
  };

  const PERMS = { Audience: ["Read", "Write", "Delete"], Templates: ["Read", "Write", "Publish"], Campaigns: ["Read", "Send", "Delete"] };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team Members</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{users.length} members · {users.filter(u => u.status === "Active").length} active</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map(role => {
          const cfg = ROLE_CFG[role];
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{role}</span>
                <cfg.icon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              <p className="text-xs text-gray-400 mt-0.5">member{count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
            <tr>
              {["Member", "Role", "Status", "Campaigns", "Last Active", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
            {filtered.map(u => {
              const roleCfg = ROLE_CFG[u.role] || ROLE_CFG.Viewer;
              return (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {u.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleCfg.cls}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.status === "Active" ? "text-emerald-600 dark:text-emerald-400" : u.status === "Pending" ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : u.status === "Pending" ? "bg-amber-500" : "bg-gray-400"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{u.campaigns}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{u.lastActive}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => addToast("Email sent!", "success")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Mail className="w-4 h-4" /></button>
                      <button onClick={() => addToast("Edit coming soon", "info")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      {u.role !== "Owner" && <button onClick={() => handleRemove(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permissions reference */}
      <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-4">Permissions Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(PERMS).map(([module, perms]) => (
            <div key={module}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{module}</p>
              <div className="space-y-1">
                {perms.map(p => <div key={p} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-[#6D5EF5]" />{p}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)}>
        <div className="px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Invite Team Member</h2>
          <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-lg">×</button>
        </div>
        <div className="p-6 space-y-4">
          {[["name","Full Name","text","John Doe"],["email","Email Address *","email","john@company.com"]].map(([k,l,t,ph]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{l}</label>
              <input type={t} placeholder={ph} value={inviteForm[k]} onChange={e => setInviteForm({...inviteForm,[k]:e.target.value})} className={inputCls} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})} className={inputCls}>
              {["Editor","Viewer","Admin"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3">
            <p className="text-xs text-blue-700 dark:text-blue-400">An invitation email will be sent to this address. They'll be able to join your workspace after accepting.</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowInvite(false)} className="flex-1 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            <button onClick={handleInvite} className="flex-1 py-2 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg transition-all font-medium">Send Invite</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
