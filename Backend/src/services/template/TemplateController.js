import Template from './Template.js';

/* ─────────────────────────────────────────────────────────────────────────────
 * Helper — normalises a frontend channel label to the DB enum value
 * e.g. "In-App Messaging" → "in_app", "Mobile Push" → "mobile_push"
 * ───────────────────────────────────────────────────────────────────────── */
const CHANNEL_MAP = {
  'email':              'email',
  'sms':                'sms',
  'whatsapp':           'whatsapp',
  'in-app messaging':   'in_app',
  'in_app':             'in_app',
  'mobile push':        'mobile_push',
  'mobile_push':        'mobile_push',
  'rcs':                'rcs',
  'mms':                'mms',
  'web push':           'web_push',
  'web_push':           'web_push',
};

const toChannelEnum = (raw = '') => CHANNEL_MAP[raw.toLowerCase()] || raw.toLowerCase();

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /template
 * Returns all templates.
 * Admin → sees all templates regardless of visible_to.
 * Viewer → only sees templates where visible_to includes "all".
 * ───────────────────────────────────────────────────────────────────────── */
export const getAllTemplates = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { visible_to: 'all' };

    const templates = await Template.find(filter)
      .populate('created_by', 'display_name email')
      .populate('edit_history.edited_by', 'display_name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: templates });
  } catch (err) {
    console.error('getAllTemplates error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /template/:id
 * Returns a single template by _id.
 * ───────────────────────────────────────────────────────────────────────── */
export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('created_by', 'display_name email')
      .populate('edit_history.edited_by', 'display_name email');

    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Viewers can only see templates visible to "all"
    if (req.user.role !== 'admin' && !template.visible_to.includes('all')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, data: template });
  } catch (err) {
    console.error('getTemplateById error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * POST /template  [admin only]
 * Creates a new template.
 * Body: { name, description?, channel_type, status?, content?, visible_to?, editable_by? }
 * ───────────────────────────────────────────────────────────────────────── */
export const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      channel_type,
      status,
      content,
      visible_to,
      editable_by,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Template name is required' });
    }
    if (!channel_type) {
      return res.status(400).json({ success: false, message: 'channel_type is required' });
    }

    const template = await Template.create({
      name:         name.trim(),
      description:  description?.trim() || '',
      channel_type: toChannelEnum(channel_type),
      status:       status || 'draft',
      content:      content || {},
      visible_to:   visible_to  || ['all'],
      editable_by:  editable_by || ['admin'],
      created_by:   req.user.id,
      // First history entry — creation
      edit_history: [{
        edited_by:   req.user.id,
        edited_at:   new Date(),
        change_note: 'Template created',
      }],
    });

    await template.populate('created_by', 'display_name email');

    return res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (err) {
    console.error('createTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * PUT /template/:id  [admin only]
 * Updates any fields on the template.
 * Always pushes a new entry to edit_history for full audit trail.
 * Body: { name?, description?, channel_type?, status?, content?, visible_to?, editable_by?, change_note? }
 * ───────────────────────────────────────────────────────────────────────── */
export const updateTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      channel_type,
      status,
      content,
      visible_to,
      editable_by,
      change_note,
    } = req.body;

    // Build the $set object — only include fields that were sent
    const set = {};
    if (name        !== undefined) set.name         = name.trim();
    if (description !== undefined) set.description  = description.trim();
    if (channel_type!== undefined) set.channel_type = toChannelEnum(channel_type);
    if (status      !== undefined) set.status        = status;
    if (visible_to  !== undefined) set.visible_to   = visible_to;
    if (editable_by !== undefined) set.editable_by  = editable_by;

    // Merge content fields individually so a partial content update
    // (e.g. only saving grapesjs_data) doesn't wipe out other content fields
    if (content !== undefined) {
      if (content.html_body     !== undefined) set['content.html_body']     = content.html_body;
      if (content.text_preview  !== undefined) set['content.text_preview']  = content.text_preview;
      if (content.grapesjs_data !== undefined) set['content.grapesjs_data'] = content.grapesjs_data;
      if (content.subject       !== undefined) set['content.subject']       = content.subject;
    }

    // Always record who made this change and when
    const historyEntry = {
      edited_by:   req.user.id,
      edited_at:   new Date(),
      change_note: change_note?.trim() || '',
    };

    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      {
        $set:  set,
        $push: { edit_history: historyEntry },
      },
      { new: true }
    )
      .populate('created_by', 'display_name email')
      .populate('edit_history.edited_by', 'display_name email');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: updated,
    });
  } catch (err) {
    console.error('updateTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * DELETE /template/:id  [admin only]
 * Hard-deletes the template.
 * ───────────────────────────────────────────────────────────────────────── */
export const deleteTemplate = async (req, res) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    return res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (err) {
    console.error('deleteTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * POST /template/:id/duplicate  [admin only]
 * Creates a copy of the template.
 * The copy starts as "draft", gets a fresh edit_history, and a new created_by.
 * ───────────────────────────────────────────────────────────────────────── */
export const duplicateTemplate = async (req, res) => {
  try {
    const source = await Template.findById(req.params.id);
    if (!source) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const copy = await Template.create({
      name:         `copy_of_${source.name}`,
      description:  source.description,
      channel_type: source.channel_type,
      status:       'draft',
      content:      source.content,
      visible_to:   source.visible_to,
      editable_by:  source.editable_by,
      created_by:   req.user.id,
      edit_history: [{
        edited_by:   req.user.id,
        edited_at:   new Date(),
        change_note: `Duplicated from template "${source.name}"`,
      }],
    });

    await copy.populate('created_by', 'display_name email');

    return res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      data: copy,
    });
  } catch (err) {
    console.error('duplicateTemplate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
