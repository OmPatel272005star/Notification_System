import { useState } from "react";
import { Users, Search, Upload, Download, Plus, Trash2, Edit3, Eye } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const INIT_DATA = [
  { id: 1, name: "John Doe", email: "john@example.com", tags: ["Newsletter"], status: "Active", date: "Jan 15, 2024", campaigns: 3 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", tags: ["Premium", "VIP"], status: "Active", date: "Jan 20, 2024", campaigns: 7 },
  { id: 3, name: "Alice Johnson", email: "alice@corp.com", tags: ["Newsletter"], status: "Active", date: "Feb 2, 2024", campaigns: 2 },
  { id: 4, name: "Bob Williams", email: "bob@agency.io", tags: ["Beta"], status: "Inactive", date: "Feb 10, 2024", campaigns: 0 },
  { id: 5, name: "Sara Connor", email: "sara@future.com", tags: ["Premium"], status: "Active", date: "Mar 5, 2024", campaigns: 5 },
  { id: 6, name: "Mike Ross", email: "mike@pearson.com", tags: ["Newsletter", "Premium"], status: "Active", date: "Mar 18, 2024", campaigns: 4 },
];

const EMPTY_FORM = { name: "", email: "", phone: "", tags: "", notes: "" };

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#161B22] rounded-2xl border border-[#E4E7EC] dark:border-[#2A2F3A] shadow-2xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Tag({ label }) {
  const colors = ["bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400", "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"];
  const idx = label.charCodeAt(0) % colors.length;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[idx]}`}>{label}</span>;
}

export default function AudiencePage() {
  const { addToast } = useToast();
  const [audience, setAudience] = useState(INIT_DATA);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState([]);

  const filtered = audience.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) { addToast("Name and email required", "error"); return; }
    const newContact = { id: Date.now(), name: form.name, email: form.email, tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [], status: "Active", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), campaigns: 0 };
    setAudience(prev => [newContact, ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
    addToast("Contact added successfully", "success");
  };

  const handleDelete = (id) => {
    setAudience(prev => prev.filter(a => a.id !== id));
    addToast("Contact removed", "success");
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-[#F7F8FC] dark:bg-[#0F1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audience</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{audience.length} contacts · {audience.filter(a => a.status === "Active").length} active</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => addToast("CSV import coming soon", "info")} className="flex items-center gap-2 px-3 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button onClick={() => addToast("CSV export coming soon", "info")} className="flex items-center gap-2 px-3 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-[#1A2030] border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
                <tr>
                  <th className="w-10 px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaigns</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                    <td className="px-4 py-3.5"><input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} className="rounded" /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">{a.email}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {a.tags.map(t => <Tag key={t} label={t} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${a.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">{a.campaigns}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{a.date}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => addToast("View profile coming soon", "info")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => addToast("Edit coming soon", "info")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E4E7EC] dark:border-[#2A2F3A] text-xs text-gray-500 dark:text-gray-400">
            <span>Showing {filtered.length} of {audience.length} contacts</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded-lg border border-[#E4E7EC] dark:border-[#2A2F3A] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">←</button>
              <button className="px-3 py-1 rounded-lg bg-[#6D5EF5] text-white">1</button>
              <button className="px-3 py-1 rounded-lg border border-[#E4E7EC] dark:border-[#2A2F3A] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">→</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No contacts found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{search ? "Try a different search term" : "Add your first contact to get started"}</p>
          {!search && <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">Add Contact</button>}
        </div>
      )}

      {/* Add Contact Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Contact">
        <div className="space-y-4">
          {[["name","Full Name","text","John Doe"],["email","Email Address","email","john@example.com"],["phone","Phone (optional)","tel","+1 (555) 000-0000"],["tags","Tags (comma separated)","text","Newsletter, Premium"],["notes","Notes","text","Add a note..."]].map(([key,label,type,ph]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} className={inputCls} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2 text-sm bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 transition-all font-medium">Save Contact</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
