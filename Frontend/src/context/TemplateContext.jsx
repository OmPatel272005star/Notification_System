import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nf_templates_v2';

const SAMPLE = [
  { id: '1', name: 'whatsapp_utility_144_v2', channel: 'WhatsApp', content: 'This is body', htmlContent: '', projectData: null, status: 'Approved', createdAt: '2026-05-14', visibleTo: ['All Users'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
  { id: '2', name: 'whatsapp_language144_v2', channel: 'WhatsApp', content: 'This is Body', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-14', visibleTo: ['All Users'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
  { id: '3', name: 'SMS_direct_text_v1', channel: 'SMS', content: 'Hi this is for testing only', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-14', visibleTo: ['All Users'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
  { id: '4', name: 'sample_welcome', channel: 'WhatsApp', content: 'Thanks for subscribing. Please keep a tab here for all the latest updates.', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-13', visibleTo: ['All Users'], createdBy: { name: 'Uma Lee', initials: 'UL', color: '#10B981' } },
  { id: '5', name: 'RCS_language_Testing', channel: 'RCS', content: 'Tata Motors is one of the leading automobile companies in India.', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-13', visibleTo: ['All Users'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
  { id: '6', name: 'SMS_testing_kaleyra', channel: 'SMS', content: 'This is for testing', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-13', visibleTo: ['All Users'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
  { id: '7', name: 'Email_welcome_series', channel: 'Email', content: 'Welcome! We are excited to have you on board.', htmlContent: '', projectData: null, status: 'Published', createdAt: '2026-05-12', visibleTo: ['All Users'], createdBy: { name: 'Uma Lee', initials: 'UL', color: '#10B981' } },
  { id: '8', name: 'push_promo_may', channel: 'Mobile Push', content: 'Exclusive May deals just for you — tap to claim!', htmlContent: '', projectData: null, status: 'Draft', createdAt: '2026-05-12', visibleTo: ['Admin'], createdBy: { name: 'Sam Smith', initials: 'SS', color: '#6D5EF5' } },
];

const TemplateContext = createContext(null);

export function TemplateProvider({ children }) {
  const [templates, setTemplates] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : SAMPLE;
    } catch { return SAMPLE; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const getTemplate = useCallback((id) => templates.find(t => t.id === id), [templates]);

  const addTemplate = useCallback((data) => {
    const t = {
      id: Date.now().toString(),
      htmlContent: '',
      projectData: null,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: { name: 'You', initials: 'YO', color: '#6D5EF5' },
      ...data,
    };
    setTemplates(p => [t, ...p]);
    return t;
  }, []);

  const updateTemplate = useCallback((id, patch) => {
    setTemplates(p => p.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  const deleteTemplate = useCallback((id) => {
    setTemplates(p => p.filter(t => t.id !== id));
  }, []);

  const duplicateTemplate = useCallback((id) => {
    setTemplates(p => {
      const src = p.find(t => t.id === id);
      if (!src) return p;
      const copy = { ...src, id: Date.now().toString(), name: `copy_of_${src.name}`, status: 'Draft', createdAt: new Date().toISOString().split('T')[0] };
      return [copy, ...p];
    });
  }, []);

  return (
    <TemplateContext.Provider value={{ templates, getTemplate, addTemplate, updateTemplate, deleteTemplate, duplicateTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplates() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplates must be used within TemplateProvider');
  return ctx;
}
