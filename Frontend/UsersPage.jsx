import { useState } from "react";
import { Button, Badge, Modal, Input, Select, ConfirmModal, EmptyState, ActionMenu, Avatar } from "../components/ui/index";
import { useToast } from "../hooks/useToast";

const ROLE_COLORS = { Admin: "purple", Editor: "info", Viewer: "default", Owner: "orange" };

const MOCK_USERS = [
  { id: 1, name: "Om Patel", email: "om@mailflow.io", role: "Owner", status: "Active", lastActive: "Today" },
  { id: 2, name: "Aaditya Shah", email: "aaditya@mailflow.io", role: "Admin", status: "Active", lastActive: "Yesterday" },
  { id: 3, name: "Priya Verma", email: "priya@mailflow.io", role: "Editor", status: "Active", lastActive: "May 12, 2026" },
  { id: 4, name: "Rajan Mehta", email: "rajan@mailflow.io", role: "Viewer", status: "Deactivated", lastActive: "Apr 5, 2026" },
];

const INIT = { name: "", email: "", role: "", status: "Active" };

export default function UsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [form, setForm] = useState(INIT);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const filtered = users.filter((u) => {
    const matchSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || u.role === filter;
    return matchSearch && matchFilter;
  });

  const handleSave = () => {
    if (!form.name || !form.email || !form.role) { addToast("All fields required.", "error"); return; }
    if (editItem) {
      setUsers((prev) => prev.map((u) => u.id === editItem.id ? { ...u, ...form } : u));
      addToast("User updated.", "success");
      setEditItem(null);
    } else {
      setUsers((prev) => [...prev, { ...form, id: Date.now(), lastActive: "Just now" }]);
      addToast("User added.", "success");
      setAddOpen(false);
    }
    setForm(INIT);
  };

  const handleDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== deleteItem.id));
    addToast("User removed.", "success");
    setDeleteItem(null);
  };

  const UserForm = ({ onClose }) => (
    <>
      <div className="px-6 py-4 space-y-4">
        <Input label="Full Name" value={form.name} onChange={set("name")} required placeholder="John Doe" />
        <Input label="Email Address" type="email" value={form.email} onChange={set("email")} required placeholder="john@example.com" />
        <Select label="Role" value={form.role} onChange={set("role")} required options={["Owner", "Admin", "Editor", "Viewer"]} />
        <Select label="Status" value={form.status} onChange={set("status")} options={["Active", "Deactivated"]} />
      </div>
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>{editItem ? "Save Changes" : "Add User"}</Button>
      </div>
    </>
  );

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Users</option>
            {["Owner", "Admin", "Editor", "Viewer"].map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>
        </div>
        <Button size="sm" onClick={() => { setForm(INIT); setAddOpen(true); }}>+ Add User</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="👤" title="No users found" description="Add team members to collaborate." action={<Button onClick={() => setAddOpen(true)}>+ Add User</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {["User", "Email", "Role", "Status", "Last Active", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={ROLE_COLORS[u.role] || "default"}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={u.status === "Active" ? "success" : "default"}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{u.lastActive}</td>
                  <td className="px-4 py-3 text-right">
                    <ActionMenu items={[
                      { label: "✏️ Edit", onClick: () => { setForm({ ...u }); setEditItem(u); } },
                      "divider",
                      { label: "🗑️ Remove", onClick: () => setDeleteItem(u), danger: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User"><UserForm onClose={() => setAddOpen(false)} /></Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit User"><UserForm onClose={() => setEditItem(null)} /></Modal>
      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} title="Remove User?" message={`Remove ${deleteItem?.name} from the platform?`} />
    </div>
  );
}