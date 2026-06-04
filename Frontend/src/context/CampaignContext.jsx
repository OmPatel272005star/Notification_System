import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { campaignService } from '../services/campaignService';

// ── Channel normalisation maps ────────────────────────────────────────────────
const CHANNEL_DB_TO_UI = {
  email:        'Email',
  sms:          'SMS',
  whatsapp:     'WhatsApp',
  in_app:       'In-App Messaging',
  mobile_push:  'Mobile Push',
  rcs:          'RCS',
  mms:          'MMS',
  web_push:     'Web Push',
};

const CHANNEL_UI_TO_DB = {
  'email':             'email',
  'sms':               'sms',
  'whatsapp':          'whatsapp',
  'in-app messaging':  'in_app',
  'mobile push':       'mobile_push',
  'rcs':               'rcs',
  'mms':               'mms',
  'web push':          'web_push',
};

export const toUIChannel = (db) => CHANNEL_DB_TO_UI[db] || db || 'Email';
export const toDBChannel = (ui) => CHANNEL_UI_TO_DB[ui?.toLowerCase()] || ui?.toLowerCase() || 'email';

// ── Status / schedule normalisation ──────────────────────────────────────────
const toUIStatus = (s) => {
  const map = { draft: 'Draft', published: 'Published' };
  return map[s] || s || 'Draft';
};

const toUIScheduleStatus = (s) => {
  const map = {
    not_scheduled: 'Not Scheduled',
    scheduled:     'Scheduled',
    completed:     'Completed',
    live:          'Live',
  };
  return map[s] || s || 'Not Scheduled';
};

const toUIScheduleType = (s) => {
  const map = { one_time: 'One Time', periodic: 'Periodic' };
  return map[s] || s || 'One Time';
};

// ── Normalise a single campaign document from the backend ─────────────────────
function normalizeCampaign(doc) {
  if (!doc) return null;

  const creatorName =
    typeof doc.created_by === 'object'
      ? doc.created_by?.display_name || doc.created_by?.email || 'Unknown'
      : 'Unknown';

  return {
    // Identity
    id:   doc._id,
    _id:  doc._id,
    name: doc.name || '',
    description: doc.description || '',

    // Channel
    channelType:    toUIChannel(doc.channel_type),
    channel_type:   doc.channel_type,

    // Status
    status:         toUIStatus(doc.status),
    scheduleStatus: toUIScheduleStatus(doc.schedule_status),
    scheduleType:   toUIScheduleType(doc.schedule_type),

    // Publish details
    publishDetails: doc.publish_details || {},

    // Content
    templateId:   doc.template_id?._id || doc.template_id || null,
    template:     doc.template_id || null,           // populated object
    connectionId: doc.connection_id?._id || doc.connection_id || null,
    connection:   doc.connection_id || null,         // populated object
    emailSettings: doc.email_settings || { sender_name: '', subject: '' },

    // Audience
    audienceIds: doc.audience_ids?.map(a => a._id || a) || [],
    audience:    doc.audience_ids || [],             // populated objects

    // Access control
    visibleTo:  doc.visible_to  || ['all'],
    editableBy: doc.editable_by || ['admin'],

    // Creator
    createdBy: {
      name:     creatorName,
      initials: creatorName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??',
    },

    // Dates
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || '',

    // Delivery stats
    deliveryStats: doc.delivery_stats || {},

    // Raw doc for reference
    _raw: doc,
  };
}

// ── Context ───────────────────────────────────────────────────────────────────
const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const { isAuthenticated }       = useAuth();

  // ── Load campaigns — only when authenticated ───────────────────────────────
  const loadCampaigns = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const res  = await campaignService.getAll(page, limit);
      const docs = res?.data || [];
      const arr  = Array.isArray(docs) ? docs : [];
      setCampaigns(arr.map(normalizeCampaign));
      setTotal(res?.total || arr.length);
    } catch (err) {
      console.error('Failed to load campaigns', err);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadCampaigns();
  }, [isAuthenticated, loadCampaigns]);

  // ── CRUD actions ───────────────────────────────────────────────────────────

  const addCampaign = useCallback(async (formData) => {
    const res = await campaignService.create(formData);
    const doc = res?.data || res;
    const normalized = normalizeCampaign(doc);
    setCampaigns(prev => [normalized, ...prev]);
    setTotal(t => t + 1);
    return normalized;
  }, []);

  const updateCampaign = useCallback(async (id, formData) => {
    const res = await campaignService.update(id, formData);
    const doc = res?.data || res;
    const normalized = normalizeCampaign(doc);
    setCampaigns(prev => prev.map(c => (c.id === id || c._id === id ? normalized : c)));
    return normalized;
  }, []);

  const removeCampaign = useCallback(async (id) => {
    await campaignService.delete(id);
    setCampaigns(prev => prev.filter(c => c.id !== id && c._id !== id));
    setTotal(t => t - 1);
  }, []);

  const duplicateCampaign = useCallback(async (id) => {
    const res = await campaignService.duplicate(id);
    const doc = res?.data || res;
    const normalized = normalizeCampaign(doc);
    setCampaigns(prev => [normalized, ...prev]);
    setTotal(t => t + 1);
    return normalized;
  }, []);

  const setPublishDetails = useCallback(async (id, data) => {
    const res = await campaignService.setPublishDetails(id, data);
    const doc = res?.data || res;
    const normalized = normalizeCampaign(doc);
    setCampaigns(prev => prev.map(c => (c.id === id || c._id === id ? normalized : c)));
    return normalized;
  }, []);

  const publishCampaign = useCallback(async (id) => {
    const res = await campaignService.publish(id);
    const doc = res?.data || res;
    const normalized = normalizeCampaign(doc);
    setCampaigns(prev => prev.map(c => (c.id === id || c._id === id ? normalized : c)));
    return normalized;
  }, []);

  const getCampaign = useCallback(
    (id) => campaigns.find(c => c.id === id || c._id === id),
    [campaigns]
  );

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        loading,
        total,
        loadCampaigns,
        getCampaign,
        addCampaign,
        updateCampaign,
        removeCampaign,
        duplicateCampaign,
        setPublishDetails,
        publishCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignProvider');
  return ctx;
}
