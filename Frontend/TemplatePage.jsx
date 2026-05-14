import { useState } from "react";
import { Button, Badge, Modal, Input, Select, ConfirmModal, EmptyState, ActionMenu } from "../components/ui/index";
import { useToast } from "../hooks/useToast";

const INIT = { name: "", scope: "", viewRights: "All Users", editRights: "All Users" };

const MOCK_TEMPLATES = [
  { id: 1, name: "email_gujrati", scope: "Marketing Campaign", status: "Approved", updated: "May 13, 2026", preview: "Tata Motors is one of India's leading automobile..." },
  { id: 2, name: "Email HTML template", scope: "Marketing Campaign", status: "Approved", updated: "May 4, 2026", preview: "Hello, World! {{Audience: First Name}}" },
  { id: 3, name: "seff", scope: "Marketing Campaign", status: "Draft", updated: "Apr 13, 2026", preview: "Heading" },
  { id: 4, name: "temaplate_testing", scope: "Marketing Campaign", status: "Pending Approval", updated: "May 4, 2026", preview: "TATA MOTORS CLICK HERE" },
  { id: 5, name: "Test109", scope: "Marketing Campaign", status: "Pending Approval", updated: "Jan 27, 2026", preview: "Click Me" },
  { id: 6, name: "Nilesh - Test Template", scope: "Marketing Campaign", status: "Pending Approval", updated: "Jan 23, 2026", preview: "Test Email" },
];

const STATUS_VARIANT = {
  Approved: "success",
  Draft: "default",
  "Pending Approval": "warning",
};

export default function TemplatePage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid"); // grid | list
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(INIT);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name) { addToast("Template name required.", "error"); return; }
    if (editItem) {
      setTemplates((prev) => prev.map((t) => t.id === editItem.id ? { ...t, name: form.name, scope: form.scope } : t));
      addToast("Template updated.", "success");
      setEditItem(null);
    } else {
      setTemplates((prev) => [...prev, { id: Date.now(), name: form.name, scope: form.scope, status: "Draft", updated: "Today", preview: "" }]);
      addToast("Template created. Click 'Edit Template' to design it.", "success");
      setAddOpen(false);
    }
    setForm(INIT);
  };

  const handleDelete = () => {
    setTemplates((prev) => prev.filter((t) => t.id !== deleteItem.id));
    addToast("Template deleted.", "success");
    setDeleteItem(null);
  };

  const handleDuplicate = (t) => {
    setTemplates((prev) => [...prev, { ...t, id: Date.now(), name: `Copy of ${t.name}`, status: "Draft", updated: "Today" }]);
    addToast(`Duplicated "${t.name}".`, "success");
  };

  const TemplateForm = ({ onClose }) => (
    <>
      <div className="flex">
        {/* Left */}
        <div className="flex-1 px-6 py-4 space-y-4 border-r border-gray-100 dark:border-gray-800">
          <Input
            label="Name"
            value={form.name}
            onChange={set("name")}
            required
            placeholder="Enter template name"
            maxLength={512}
            helper={`${form.name.length}/512`}
          />
          <Select
            label="Applicable Scopes"
            value={form.scope}
            onChange={set("scope")}
            required
            options={["Marketing Campaign", "Transactional", "Newsletter", "Announcement", "Welcome"]}
          />
          <Select
            label="Select Users with View Rights"
            value={form.viewRights}
            onChange={set("viewRights")}
            required
            options={["All Users", "Admin Only", "Custom"]}
          />
          <p className="text-xs text-red-500">All Users are Selected</p>
          <Select
            label="Select Users with Edit Rights"
            value={form.editRights}
            onChange={set("editRights")}
            required
            options={["All Users", "Admin Only", "Custom"]}
          />
          <p className="text-xs text-red-500">All Users are Selected</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">All users with Edit Rights will also get View Rights.</p>
        </div>
        {/* Right — template preview */}
        <div className="w-60 flex-shrink-0 px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</span>
            <button
              className="px-3 py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors"
              onClick={() => {
                addToast("Template editor would open here (GrapesJS / Unlayer integration).", "info");
              }}
            >
              Edit Template
            </button>
          </div>
          <div className="flex-1 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center min-h-[180px]">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-4">Template preview will show up here</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{editItem ? "Save" : "Add"}</Button>
      </div>
    </>
  );

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} templates</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Grid/List toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {["grid", "list"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-2 text-xs transition-colors ${view === v ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400" : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                {v === "grid" ? "⊞" : "≡"}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => { setForm(INIT); setAddOpen(true); }}>+ Add New Template</Button>
        </div>
      </div>

      {/* Template info note */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        💡 For template editing, integrate <strong>GrapesJS</strong> (<code>npm install grapesjs grapesjs-preset-newsletter</code>) or <strong>Unlayer</strong> (<code>npm install react-email-editor</code>). Both are free and open-source.
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📄" title="No templates found" description="Create your first email template to get started." action={<Button onClick={() => setAddOpen(true)}>+ Add Template</Button>} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group">
              {/* Preview area */}
              <div className="h-32 bg-gray-50 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-800">
                <div className="text-center px-4">
                  <span className="text-3xl">📧</span>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{t.preview || "No preview"}</p>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Updated {t.updated}</p>
                  </div>
                  <ActionMenu items={[
                    { label: "👁 Preview", onClick: () => addToast("Preview: " + t.name, "info") },
                    { label: "✏️ Edit", onClick: () => { setForm({ name: t.name, scope: t.scope, viewRights: "All Users", editRights: "All Users" }); setEditItem(t); } },
                    { label: "📋 Duplicate", onClick: () => handleDuplicate(t) },
                    "divider",
                    { label: "🗑️ Delete", onClick: () => setDeleteItem(t), danger: true },
                  ]} />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="info">Email</Badge>
                  {t.scope && <Badge variant="default">{t.scope}</Badge>}
                  <Badge variant={STATUS_VARIANT[t.status] || "default"}>{t.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["Name", "Scope", "Status", "Updated", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{t.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t.scope || "—"}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[t.status] || "default"}>{t.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t.updated}</td>
                  <td className="px-4 py-3 text-right">
                    <ActionMenu items={[
                      { label: "✏️ Edit", onClick: () => { setForm({ name: t.name, scope: t.scope, viewRights: "All Users", editRights: "All Users" }); setEditItem(t); } },
                      { label: "📋 Duplicate", onClick: () => handleDuplicate(t) },
                      "divider",
                      { label: "🗑️ Delete", onClick: () => setDeleteItem(t), danger: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Email Template" size="lg">
        <TemplateForm onClose={() => setAddOpen(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Template" size="lg">
        <TemplateForm onClose={() => setEditItem(null)} />
      </Modal>
      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Template?" message={`Permanently delete "${deleteItem?.name}"?`} />
    </div>
  );
}