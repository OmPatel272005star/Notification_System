import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchAllAudience,
  fetchAudienceById,
  createAudience as apiCreate,
  updateAudience as apiUpdate,
  deleteAudience as apiDelete,
  fetchAudienceTimeline as apiTimeline
} from '../services/audienceService.js';

function normalizeAudience(doc) {
  if (!doc) return null;

  return {
    _id: doc._id,
    id: doc._id, // For components expecting 'id'
    first_name: doc.first_name || '',
    last_name: doc.last_name || '',
    dob: doc.dob || '',
    gender: doc.gender || '',
    emails: doc.emails || [],
    phone_numbers: doc.phone_numbers || [],
    address: doc.address || {},
    social_media_handles: (doc.social_media_handles || []).map(h => h.platform),
    status: doc.status || 'active',
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || '',
    // Original doc for reference
    _raw: doc
  };
}

function toBackendPayload(formData) {
  const payload = { ...formData };

  // Convert array of string handles like ["email", "whatsapp"] to [{platform: "email", handle: ""}]
  if (formData.handles) {
    payload.social_media_handles = formData.handles.map(h => ({ platform: h, handle: "" }));
    delete payload.handles;
  }
  
  if (formData.social_media_handles) {
    if (Array.isArray(formData.social_media_handles) && typeof formData.social_media_handles[0] === 'string') {
        payload.social_media_handles = formData.social_media_handles.map(h => ({ platform: h, handle: "" }));
    }
  }

  return payload;
}

const AudienceContext = createContext(null);

export function AudienceProvider({ children }) {
  const [audience, setAudience] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadAudience = useCallback(async (search = '') => {
    try {
      const res = await fetchAllAudience(search);
      const docs = res?.data || res || [];
      const arr = Array.isArray(docs) ? docs : [];
      setAudience(arr.map(normalizeAudience));
    } catch (err) {
      console.error('Failed to load audience', err);
      setAudience([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load audience on mount — only when authenticated.
  // Primary guard: this provider is mounted inside ProtectedRoute.
  // Secondary guard: the isAuthenticated check below handles edge-cases.
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadAudience();
  }, [isAuthenticated, loadAudience]);

  const getAudience = useCallback(
    (id) => audience.find((a) => a._id === id || a.id === id),
    [audience]
  );

  const addAudience = useCallback(async (formData) => {
    const payload = toBackendPayload(formData);
    const res = await apiCreate(payload);
    const doc = res?.data || res;
    const normalized = normalizeAudience(doc);
    setAudience((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateAudience = useCallback(async (id, formData) => {
    const payload = toBackendPayload(formData);
    const res = await apiUpdate(id, payload);
    const doc = res?.data || res;
    const normalized = normalizeAudience(doc);
    setAudience((prev) =>
      prev.map((a) => (a._id === id || a.id === id ? normalized : a))
    );
    return normalized;
  }, []);

  const removeAudience = useCallback(async (id) => {
    await apiDelete(id);
    setAudience((prev) => prev.filter((a) => a._id !== id && a.id !== id));
  }, []);

  const getTimeline = useCallback(async (id) => {
    const res = await apiTimeline(id);
    return res?.data || res || [];
  }, []);

  return (
    <AudienceContext.Provider
      value={{
        audience,
        loading,
        loadAudience,
        getAudience,
        addAudience,
        updateAudience,
        removeAudience,
        getTimeline
      }}
    >
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error('useAudience must be used within AudienceProvider');
  return ctx;
}
