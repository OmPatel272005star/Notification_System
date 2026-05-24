import { useState, useCallback, useEffect } from "react";
import { useToast } from "./useToast";
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../services/userService";
import { normalizeUser } from "../components/users/userUtils";

/**
 * Custom hook — owns all user-list state + API interactions.
 * Supports infinite-scroll pagination via loadMore().
 */
export function useUsers() {
  const { addToast } = useToast();

  const [users, setUsers]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [actionLoading, setActionLoading]   = useState(false);
  const [error, setError]                   = useState(null);

  // ── Pagination state ────────────────────────────────────────────────────
  const [page, setPage]                     = useState(1);
  const [hasNextPage, setHasNextPage]       = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Initial load (page 1) ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllUsers(1);
      setUsers((res.data || []).map((u, i) => normalizeUser(u, i)));
      setHasNextPage(res.pagination?.hasNextPage ?? false);
      setPage(1);
    } catch (err) {
      setError("Failed to load users. Please try again.");
      addToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Load next page (called by IntersectionObserver) ─────────────────────
  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasNextPage) return;
    setIsFetchingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getAllUsers(nextPage);
      const incoming = (res.data || []).map((u, i) =>
        normalizeUser(u, users.length + i)
      );
      setUsers((prev) => [...prev, ...incoming]);
      setHasNextPage(res.pagination?.hasNextPage ?? false);
      setPage(nextPage);
    } catch (err) {
      addToast("Failed to load more users", "error");
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, hasNextPage, page, users.length]);

  // ── Add ─────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    if (!form.email.includes("@")) {
      addToast("A valid email is required", "error");
      return false;
    }
    if (!form.password || form.password.length < 8) {
      addToast("Password must be at least 8 characters", "error");
      return false;
    }
    setActionLoading(true);
    try {
      const payload = {
        display_name: form.name || form.email.split("@")[0],
        email:        form.email,
        password:     form.password,
        role:         form.role,
      };
      const res = await addUser(payload);
      const newUser = normalizeUser(res.data, users.length);
      setUsers((prev) => [...prev, newUser]);
      addToast(`${newUser.name} added successfully`, "success");
      return true;
    } catch (err) {
      addToast(err.message || "Failed to add user", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const handleEdit = async (editTarget, form) => {
    if (!editTarget) return false;
    setActionLoading(true);
    try {
      const payload = {
        display_name: form.name || editTarget.name,
        role:         form.role,
      };
      const res = await updateUser(editTarget.id, payload);
      const idx = users.findIndex((u) => u.id === editTarget.id);
      const updated = normalizeUser(res.data, idx);
      setUsers((prev) => prev.map((u) => (u.id === editTarget.id ? updated : u)));
      addToast("User updated", "success");
      return true;
    } catch (err) {
      addToast(err.message || "Failed to update user", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (deleteTarget) => {
    if (!deleteTarget) return false;
    setActionLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      addToast(`${deleteTarget.name || deleteTarget.email} removed`, "success");
      return true;
    } catch (err) {
      addToast(err.message || "Failed to remove user", "error");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // ── Toggle Block (optimistic) ────────────────────────────────────────────
  const handleToggleBlock = async (user) => {
    const nextStatus = user.status === "blocked" ? "active" : "blocked";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    try {
      await toggleUserStatus(user.id, nextStatus);
      addToast(
        `${user.name} ${nextStatus === "blocked" ? "blocked" : "unblocked"}`,
        nextStatus === "blocked" ? "error" : "success"
      );
    } catch (err) {
      // Revert optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      addToast(err.message || "Failed to update status", "error");
    }
  };

  return {
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
  };
}
