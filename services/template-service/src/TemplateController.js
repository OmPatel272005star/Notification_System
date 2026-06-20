import Template from '../shared/models/Template.js';
import { createLogger } from '../shared/utils/logger.js';

const logger = createLogger('template-service');

const CHANNEL_MAP = {
  'email':'email','sms':'sms','whatsapp':'whatsapp',
  'in-app messaging':'in_app','in_app':'in_app',
  'mobile push':'mobile_push','mobile_push':'mobile_push',
  'rcs':'rcs','mms':'mms','web push':'web_push','web_push':'web_push',
};
const toChannelEnum = (raw = '') => CHANNEL_MAP[raw.toLowerCase()] || raw.toLowerCase();

export const getAllTemplates = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { visible_to: 'all' };
    const templates = await Template.find(filter)
      .populate('created_by','display_name email')
      .populate('edit_history.edited_by','display_name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: templates });
  } catch (err) { logger.error('getAllTemplates error', { error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('created_by','display_name email')
      .populate('edit_history.edited_by','display_name email');
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    if (req.user.role !== 'admin' && !template.visible_to.includes('all'))
      return res.status(403).json({ success: false, message: 'Access denied' });
    return res.status(200).json({ success: true, data: template });
  } catch (err) { logger.error('getTemplateById error', { templateId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, description, channel_type, status, content, visible_to, editable_by } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Template name is required' });
    if (!channel_type) return res.status(400).json({ success: false, message: 'channel_type is required' });
    const template = await Template.create({
      name: name.trim(), description: description?.trim() || '', channel_type: toChannelEnum(channel_type),
      status: status || 'draft', content: content || {}, visible_to: visible_to || ['all'],
      editable_by: editable_by || ['admin'], created_by: req.user.id,
      edit_history: [{ edited_by: req.user.id, edited_at: new Date(), change_note: 'Template created' }],
    });
    await template.populate('created_by','display_name email');
    logger.info('template created', { templateId: template._id, name: template.name, userId: req.user.id });
    return res.status(201).json({ success: true, message: 'Template created successfully', data: template });
  } catch (err) { logger.error('createTemplate error', { error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, description, channel_type, status, content, visible_to, editable_by, change_note } = req.body;
    const set = {};
    if (name         !== undefined) set.name         = name.trim();
    if (description  !== undefined) set.description  = description.trim();
    if (channel_type !== undefined) set.channel_type = toChannelEnum(channel_type);
    if (status       !== undefined) set.status       = status;
    if (visible_to   !== undefined) set.visible_to   = visible_to;
    if (editable_by  !== undefined) set.editable_by  = editable_by;
    if (content !== undefined) {
      if (content.html_body     !== undefined) set['content.html_body']     = content.html_body;
      if (content.text_preview  !== undefined) set['content.text_preview']  = content.text_preview;
      if (content.grapesjs_data !== undefined) set['content.grapesjs_data'] = content.grapesjs_data;
      if (content.subject       !== undefined) set['content.subject']       = content.subject;
    }
    const historyEntry = { edited_by: req.user.id, edited_at: new Date(), change_note: change_note?.trim() || '' };
    const updated = await Template.findByIdAndUpdate(req.params.id, { $set: set, $push: { edit_history: historyEntry } }, { new: true })
      .populate('created_by','display_name email').populate('edit_history.edited_by','display_name email');
    if (!updated) return res.status(404).json({ success: false, message: 'Template not found' });
    logger.info('template updated', { templateId: req.params.id, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Template updated successfully', data: updated });
  } catch (err) { logger.error('updateTemplate error', { templateId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const deleteTemplate = async (req, res) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Template not found' });
    logger.info('template deleted', { templateId: req.params.id, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (err) { logger.error('deleteTemplate error', { templateId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const duplicateTemplate = async (req, res) => {
  try {
    const source = await Template.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Template not found' });
    const copy = await Template.create({
      name: `copy_of_${source.name}`, description: source.description, channel_type: source.channel_type,
      status: 'draft', content: source.content, visible_to: source.visible_to, editable_by: source.editable_by,
      created_by: req.user.id,
      edit_history: [{ edited_by: req.user.id, edited_at: new Date(), change_note: `Duplicated from "${source.name}"` }],
    });
    await copy.populate('created_by','display_name email');
    logger.info('template duplicated', { sourceId: req.params.id, newId: copy._id, userId: req.user.id });
    return res.status(201).json({ success: true, message: 'Template duplicated successfully', data: copy });
  } catch (err) { logger.error('duplicateTemplate error', { templateId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};
