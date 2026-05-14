import { useState } from "react";
import { Search, Plus, LayoutGrid, List, Copy, Trash2, Eye, Edit3, FileText } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const CATEGORIES = ["All", "Welcome", "Newsletter", "Promotion", "Product Launch", "Transactional", "Announcement"];

const TEMPLATES = [
  { id: 1, name: "Welcome Email", category: "Welcome", status: "Published", updated: "May 10, 2026", description: "Warm welcome for new subscribers" },
  { id: 2, name: "Monthly Newsletter", category: "Newsletter", status: "Published", updated: "May 8, 2026", description: "Monthly digest with latest updates" },
  { id: 3, name: "Product Launch", category: "Product Launch", status: "Draft", updated: "May 5, 2026", description: "Announce your new product launch" },
  { id: 4, name: "Spring Sale Promo", category: "Promotion", status: "Published", updated: "Apr 28, 2026", description: "Seasonal promotional email" },
  { id: 5, name: "Order Confirmation", category: "Transactional", status: "Published", updated: "Apr 20, 2026", description: "Transactional order receipt" },
  { id: 6, name: "Feature Announcement", category: "Announcement", status: "Draft", updated: "Apr 15, 2026", description: "Announce new features to users" },
];

const STATUS_COLORS = {
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  Draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const CATEGORY_COLORS = [
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
];

const EMAIL_PREVIEWS = {
  Welcome: { bg: "bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/30 dark:to-transparent", lines: ["Welcome to MailFlow! 🎉", "Get started with your first campaign", "Click to begin →"] },
  Newsletter: { bg: "bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-transparent", lines: ["📰 Monthly Newsletter", "Latest updates & insights", "Read more →"] },
  "Product Launch": { bg: "bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/30 dark:to-transparent", lines: ["🚀 New Product Launch", "Discover what's new", "Shop now →"] },
  Promotion: { bg: "bg-gradient-to-b from-pink-50 to-white dark:from-pink-950/30 dark:to-transparent", lines: ["🎁 Special Offer Inside", "Save up to 40%", "Claim now →"] },
  Transactional: { bg: "bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/30 dark:to-transparent", lines: ["✅ Order Confirmed", "Your order #12345", "Track order →"] },
  Announcement: { bg: "bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-transparent", lines: ["📢 New Feature!", "We've shipped something big", "See what's new →"] },
};

export default function TemplatePage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState(TEMPLATES);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [view, setView] = useState("grid");

  const filtered = templates.filter(t =>
    (activeCategory === "All" || t.category === activeCategory) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    addToast("Template deleted", "success");
  };

  const handleDuplicate = (t) => {
    const copy = { ...t, id: Date.now(), name: `${t.name} (Copy)`, status: "Draft" };
    setTemplates(prev => [copy, ...prev]);
    addToast("Template duplicated", "success");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{templates.length} templates · {templates.filter(t => t.status === "Published").length} published</p>
        </div>
        <button onClick={() => addToast("Template editor (GrapesJS) launching in Phase 2", "info")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all" />
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl p-1">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-[#6D5EF5] text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg transition-colors ${view === "list" ? "bg-[#6D5EF5] text-white" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-[#6D5EF5] text-white shadow-sm" : "bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] text-gray-600 dark:text-gray-400 hover:border-[#6D5EF5]/50 dark:hover:border-[#6D5EF5]/50"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid/List view */}
      {filtered.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t, i) => {
              const preview = EMAIL_PREVIEWS[t.category] || EMAIL_PREVIEWS.Newsletter;
              const catColor = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={t.id} className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  {/* Preview area */}
                  <div className={`h-36 ${preview.bg} p-4 relative overflow-hidden`}>
                    <div className="space-y-2">
                      {preview.lines.map((line, j) => (
                        <div key={j} className={`rounded ${j === 0 ? "text-xs font-semibold text-gray-800 dark:text-gray-200" : j === preview.lines.length - 1 ? "text-xs text-[#6D5EF5] font-medium" : "text-xs text-gray-500 dark:text-gray-400"}`}>{line}</div>
                      ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[#161B22]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                      <button onClick={() => addToast("Preview coming soon", "info")} className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-[#E4E7EC] dark:border-[#2A2F3A] text-xs font-medium rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button onClick={() => addToast("Editor launching in Phase 2", "info")} className="flex items-center gap-1 px-3 py-1.5 bg-[#6D5EF5] text-white text-xs font-medium rounded-lg shadow hover:bg-[#5D4EE5] transition-colors">
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </div>
                  {/* Card footer */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>{t.category}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Updated {t.updated}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl divide-y divide-[#E4E7EC] dark:divide-[#2A2F3A]">
            {filtered.map((t, i) => {
              const catColor = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#1A2030] transition-colors group">
                  <div className="w-10 h-10 bg-[#6D5EF5]/10 dark:bg-[#6D5EF5]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#6D5EF5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.description} · Updated {t.updated}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>{t.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => addToast("Edit in Phase 2", "info")} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-[#161B22] border border-[#E4E7EC] dark:border-[#2A2F3A] rounded-xl py-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#6D5EF5]/10 rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-[#6D5EF5]" />
          </div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No templates found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first email template to get started</p>
          <button onClick={() => addToast("Editor coming in Phase 2", "info")} className="px-4 py-2 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">Create Template</button>
        </div>
      )}
    </div>
  );
}
