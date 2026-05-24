import { useState, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { useUsers }           from "../../hooks/useUsers";
import { useInfiniteScroll }  from "../../hooks/useInfiniteScroll";
import { UserTable }          from "../../components/users/UserTable";
import { UserListFooter }     from "../../components/users/UserListFooter";
import { UserFormDialog }     from "../../components/users/UserFormDialog";
import { UserDeleteDialog }   from "../../components/users/UserDeleteDialog";

export default function UsersPage() {
  const {
    users,
    loading,
    actionLoading,
    error,
    isFetchingMore,
    hasNextPage,
    fetchUsers,
    loadMore,
    handleAdd,
    handleEdit,
    handleDelete,
    handleToggleBlock,
  } = useUsers();

  const [search, setSearch]             = useState("");
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stable callback reference so useInfiniteScroll's effect doesn't re-fire
  const stableLoadMore = useCallback(() => loadMore(), [loadMore]);

  // Sentinel div — IntersectionObserver fires stableLoadMore when it enters viewport
  const sentinelRef = useInfiniteScroll(
    stableLoadMore,
    hasNextPage && !loading && !isFetchingMore
  );

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Wrap handlers to close dialogs on success
  const onAdd = async (form) => {
    const ok = await handleAdd(form);
    if (ok) setShowAdd(false);
  };

  const onEdit = async (form) => {
    const ok = await handleEdit(editTarget, form);
    if (ok) setEditTarget(null);
  };

  const onDelete = async () => {
    const ok = await handleDelete(deleteTarget);
    if (ok) setDeleteTarget(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {users.length} user{users.length !== 1 ? "s" : ""} ·{" "}
            {users.filter((u) => u.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#6D5EF5] to-[#8B7CFF] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#6D5EF5]/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-[#E4E7EC] dark:border-[#2A2F3A] bg-white dark:bg-[#161B22] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] transition-all"
        />
      </div>

      {/* Table */}
      <UserTable
        filtered={filtered}
        loading={loading}
        error={error}
        search={search}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onToggleBlock={handleToggleBlock}
        onRetry={fetchUsers}
      />

      {/* ── Infinite scroll area ── */}
      {/* Footer: spinner while loading more / "all loaded" when done */}
      {!loading && users.length > 0 && (
        <UserListFooter
          isFetchingMore={isFetchingMore}
          hasNextPage={hasNextPage}
          totalLoaded={users.length}
        />
      )}

      {/* Invisible sentinel — enters viewport → triggers loadMore */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

      {/* ── Dialogs ── */}
      <UserFormDialog
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={onAdd}
        initial={null}
        loading={actionLoading}
      />

      <UserFormDialog
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSave={onEdit}
        initial={editTarget}
        loading={actionLoading}
      />

      <UserDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        user={deleteTarget}
        loading={actionLoading}
      />
    </div>
  );
}
