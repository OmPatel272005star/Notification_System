import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchAllTemplates,
  fetchTemplateById,
  createTemplate as apiCreate,
  updateTemplate as apiUpdate,
  deleteTemplate as apiDelete,
  duplicateTemplate as apiDuplicate,
} from '../services/templateService.js';

// ── Channel maps for normalizing backend ↔ frontend ────────────────────────
const CHANNEL_DB_TO_UI = {
  email:       'Email',
  sms:         'SMS',
  whatsapp:    'WhatsApp',
  in_app:      'In-App Messaging',
  mobile_push: 'Mobile Push',
  rcs:         'RCS',
  mms:         'MMS',
  web_push:    'Web Push',
};

const CHANNEL_UI_TO_DB = {
  'email':              'email',
  'sms':                'sms',
  'whatsapp':           'whatsapp',
  'in-app messaging':   'in_app',
  'mobile push':        'mobile_push',
  'rcs':                'rcs',
  'mms':                'mms',
  'web push':           'web_push',
};

const toUIChannel = (dbVal) => CHANNEL_DB_TO_UI[dbVal] || dbVal || 'Email';
const toDBChannel = (uiVal) => CHANNEL_UI_TO_DB[uiVal?.toLowerCase()] || uiVal?.toLowerCase() || 'email';

/**
 * Normalise a single backend template document into the shape
 * the frontend components (TemplatePage, TemplateEditorPage) expect.
 */
function normalizeTemplate(doc) {
  if (!doc) return null;

  // Derive initials from display_name (populated or string)
  const creatorName =
    typeof doc.created_by === 'object'
      ? doc.created_by?.display_name || doc.created_by?.email || 'Unknown'
      : 'Unknown';
  const initials = creatorName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return {
    // Identity
    id:          doc._id,
    _id:         doc._id,
    name:        doc.name || '',
    description: doc.description || '',

    // Channel — frontend expects "Email", "WhatsApp", etc.
    channel:     toUIChannel(doc.channel_type),

    // Status
    status:      doc.status || 'draft',

    // Content — flatten for easy access by TemplatePage & TemplateEditorPage
    content:     doc.content?.text_preview || '',
    htmlContent: doc.content?.html_body || '',
    projectData: doc.content?.grapesjs_data || null,
    subject:     doc.content?.subject || '',

    // Access control
    // Access control — map "all" → "All Users", "admin" → "Admin"
    visibleTo:   (doc.visible_to || ['all']).map(v => v === 'all' ? 'All Users' : v.charAt(0).toUpperCase() + v.slice(1)),
    editableBy:  (doc.editable_by || ['admin']).map(v => v === 'all' ? 'All Users' : v.charAt(0).toUpperCase() + v.slice(1)),

    // Dates
    createdAt:   doc.createdAt || new Date().toISOString(),
    updatedAt:   doc.updatedAt || '',

    // Creator info for avatar display
    createdBy: {
      name:     creatorName,
      initials: initials || '??',
      color:    '#6D5EF5',
    },

    // Raw backend fields kept for reference
    _raw: doc,
  };
}

/**
 * Convert frontend form data to the shape the backend API expects.
 */
function toBackendPayload(frontendData) {
  const payload = {};

  if (frontendData.name        !== undefined) payload.name         = frontendData.name;
  if (frontendData.description !== undefined) payload.description  = frontendData.description;
  if (frontendData.status      !== undefined) payload.status       = frontendData.status;

  // Channel
  if (frontendData.channel     !== undefined) payload.channel_type = toDBChannel(frontendData.channel);
  if (frontendData.channel_type!== undefined) payload.channel_type = frontendData.channel_type;

  // Access control
  // Access control — normalize "All Users" → "all", "Admin" → "admin"
  const normalizeAccess = (arr) =>
    (arr || []).map((v) => (v === 'All Users' ? 'all' : v.toLowerCase()));

  if (frontendData.visibleTo   !== undefined) payload.visible_to   = normalizeAccess(frontendData.visibleTo);
  if (frontendData.visible_to  !== undefined) payload.visible_to   = normalizeAccess(frontendData.visible_to);
  if (frontendData.editableBy  !== undefined) payload.editable_by  = normalizeAccess(frontendData.editableBy);
  if (frontendData.editable_by !== undefined) payload.editable_by  = normalizeAccess(frontendData.editable_by);

  // Content — can be passed as nested object (from editor) or flat fields
  if (frontendData.content !== undefined && typeof frontendData.content === 'object') {
    payload.content = frontendData.content;
  }

  return payload;
}

// ── Context ─────────────────────────────────────────────────────────────────
const TemplateContext = createContext(null);

export function TemplateProvider({ children }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all templates on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchAllTemplates();
        // Backend returns { success, data: [...] }
        const docs = res?.data || res || [];
        const arr = Array.isArray(docs) ? docs : [];
        setTemplates(arr.map(normalizeTemplate));
      } catch (err) {
        console.error('Failed to load templates', err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getTemplate = useCallback(
    (id) => templates.find((t) => t.id === id || t._id === id),
    [templates]
  );

  const addTemplate = useCallback(async (formData) => {
    const payload = toBackendPayload(formData);
    const res = await apiCreate(payload);
    const doc = res?.data || res;
    const normalized = normalizeTemplate(doc);
    setTemplates((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  const updateTemplate = useCallback(async (id, formData) => {
    const payload = toBackendPayload(formData);
    const res = await apiUpdate(id, payload);
    const doc = res?.data || res;
    const normalized = normalizeTemplate(doc);
    setTemplates((prev) =>
      prev.map((t) => (t.id === id || t._id === id ? normalized : t))
    );
    return normalized;
  }, []);

  const deleteTemplate = useCallback(async (id) => {
    await apiDelete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id && t._id !== id));
  }, []);

  const duplicateTemplate = useCallback(async (id) => {
    const res = await apiDuplicate(id);
    const doc = res?.data || res;
    const normalized = normalizeTemplate(doc);
    setTemplates((prev) => [normalized, ...prev]);
    return normalized;
  }, []);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        loading,
        getTemplate,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplates must be used within TemplateProvider');
  return ctx;
}
