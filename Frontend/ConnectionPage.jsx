import { useState } from "react";
import { Button, Badge, Modal, Input, Select, ConfirmModal, EmptyState, ActionMenu } from "../components/ui/index";
import { useToast } from "../hooks/useToast";

const MOCK_CONNECTIONS = [
  { id: 1, name: "Brevo Production", email: "noreply@mailflow.io", source: "SMTP", integration: "Brevo", senderId: "6904844d103974834d45fe53", status: "Active", created: "Jan 5, 2026" },
  { id: 2, name: "AWS SES Main", email: "notify@mailflow.io", source: "API", integration: "AWS SES", senderId: "69ecb972f55ff0117706a737", status: "Active", created: "Feb 10, 2026" },
  { id: 3, name: "Testing SMTP", email: "test@brevo.com", source: "SMTP", integration: "SMTP", senderId: "6907adbe9ca519c9ad4354bb", status: "Active", created: "Mar 1, 2026" },
];

const INIT_FORM = { name: "", email: "", integrationType: "", smtpHost: "", smtpPort: "", smtpEncryption: "", smtpUser: "", smtpPass: "", apiKey: "", domain: "" };

export default function ConnectionPage() {
  const { addToast } = useToast();
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(INIT_FORM);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isSmtp = form.integrationType === "SMTP";

  const filtered = connections.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.email) { addToast("Name and email required.", "error"); return; }
    if (editItem) {
      setConnections((prev) => prev.map((c) => c.id === editItem.id ? { ...c, ...form, source: form.integrationType } : c));
      addToast("Connection updated.", "success");
      setEditItem(null);
    } else {
      setConnections((prev) => [...prev, { ...form, id: Date.now(), source: form.integrationType, integration: form.integrationType, senderId: Math.random().toString(16).slice(2, 18), status: "Active", created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }]);
      addToast("Email connection added.", "success");
      setAddOpen(false);
    }
    setForm(INIT_FORM);
  };

  const handleDelete = () => {
    setConnections((prev) => prev.filter((c) => c.id !== deleteItem.id));
    addToast("Connection deleted.", "success");
    setDeleteItem(null);
  };

  const ConnectionForm = ({ onClose }) => (
    <>
      <div className="px-6 py-4 space-y-4">
        <Input label="Connection Name" value={form.name} onChange={set("name")} required placeholder="e.g. Brevo Production" />
        <Input label="Sender Email Address" type="email" value={form.email} onChange={set("email")} required placeholder="noreply@yourdomain.com" />
        <Select label="Integration Type" value={form.integrationType} onChange={set("integrationType")} required options={["SMTP", "Brevo", "AWS SES", "SendGrid", "Mailgun"]} placeholder="Select integration..." />

        {form.integrationType && (
          isSmtp ? (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SMTP Configuration</p>
              <Input label="SMTP Host" value={form.smtpHost} onChange={set("smtpHost")} required placeholder="smtp.brevo.com" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Port" value={form.smtpPort} onChange={set("smtpPort")} required placeholder="587" />
                <Select label="Encryption" value={form.smtpEncryption} onChange={set("smtpEncryption")} options={["TLS", "SSL", "None"]} />
              </div>
              <Input label="SMTP Username" value={form.smtpUser} onChange={set("smtpUser")} required placeholder="your-smtp-login" />
              <Input label="SMTP Password" type="password" value={form.smtpPass} onChange={set("smtpPass")} required placeholder="••••••••" />
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">API Configuration</p>
              <Input label="API Key" value={form.apiKey} onChange={set("apiKey")} required placeholder="Your API key..." />
              <Input label="Domain (Optional)" value={form.domain} onChange={set("domain")} placeholder="mg.yourdomain.com" />
            </div>
          )
        )}
      </div>
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{editItem ? "Save Changes" : "Test & Save"}</Button>
      </div>
    </>
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search connections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
        <Button size="sm" onClick={() => { setForm(INIT_FORM); setAddOpen(true); }}>+ Add Email</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔌" title="No connections yet" description="Connect an email provider to start sending campaigns." action={<Button onClick={() => setAddOpen(true)}>+ Add Connection</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["Name", "Email", "Source", "Integration", "Sender UUID", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.source}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{c.integration}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{c.senderId?.slice(0, 16)}...</span>
                  </td>
                  <td className="px-4 py-3"><Badge variant="success">{c.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <ActionMenu items={[
                      { label: "✏️ Edit", onClick: () => { setForm({ ...c }); setEditItem(c); } },
                      "divider",
                      { label: "🗑️ Delete", onClick: () => setDeleteItem(c), danger: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Email Integration" size="md">
        <div className="px-6 pt-3 pb-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Connect your email sending provider</p>
        </div>
        <ConnectionForm onClose={() => setAddOpen(false)} />
      </Modal>

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Connection" size="md">
        <ConnectionForm onClose={() => setEditItem(null)} />
      </Modal>

      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Delete Connection?" message={`Remove "${deleteItem?.name}" from your email connections?`} />
    </div>
  );
}