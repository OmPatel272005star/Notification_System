import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectionService } from '../services/connectionService.js';

// ── Normaliser — consistent shape for all UI consumers ───────────────────────
function normalizeConnection(doc) {
  if (!doc) return null;
  return {
    _id:              doc._id,
    id:               doc._id,
    name:             doc.name            || '',
    email:            doc.email           || '',
    provider:         doc.provider        || '',
    last_test_status: doc.last_test_status || 'untested',
    last_tested_at:   doc.last_tested_at  || null,
    created_by:       doc.created_by      || null,
    createdAt:        doc.createdAt       || new Date().toISOString(),
  };
}

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const { isAuthenticated }           = useAuth();

  // ── Load all connections on mount ─────────────────────────────────────────
  const loadConnections = useCallback(async () => {
    try {
      const res  = await connectionService.getAll();
      const docs = res?.data || [];
      setConnections(Array.isArray(docs) ? docs.map(normalizeConnection) : []);
    } catch (err) {
      console.error('[ConnectionContext] load failed', err);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    loadConnections();
  }, [isAuthenticated, loadConnections]);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addConnection = useCallback(async (payload) => {
    const res  = await connectionService.create(payload);
    const doc  = res?.data || res;
    const norm = normalizeConnection(doc);
    setConnections((prev) => [norm, ...prev]);
    return norm;
  }, []);

  // ── Update ────────────────────────────────────────────────────────────────
  const editConnection = useCallback(async (id, payload) => {
    const res  = await connectionService.update(id, payload);
    const doc  = res?.data || res;
    const norm = normalizeConnection(doc);
    setConnections((prev) =>
      prev.map((c) => (c._id === id || c.id === id ? norm : c))
    );
    return norm;
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const removeConnection = useCallback(async (id) => {
    await connectionService.delete(id);
    setConnections((prev) => prev.filter((c) => c._id !== id && c.id !== id));
  }, []);

  // ── Test connection ───────────────────────────────────────────────────────
  const testConnection = useCallback(async (id) => {
    const res  = await connectionService.test(id);
    const doc  = res?.data;
    if (doc) {
      const norm = normalizeConnection(doc);
      setConnections((prev) =>
        prev.map((c) => (c._id === id || c.id === id ? norm : c))
      );
    }
    return res;
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        loading,
        loadConnections,
        addConnection,
        editConnection,
        removeConnection,
        testConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnections() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnections must be used within ConnectionProvider');
  return ctx;
}
