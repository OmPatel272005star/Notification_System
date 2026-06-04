import Campaign    from '../models/Campaign.js';
import '../models/Connection.js';   // registers Connection schema so populate works

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Populate template, connection, audience, and creator for rich responses.
 */
const POPULATE_OPTS = [
  { path: 'template_id',  select: 'name channel_type status' },
  { path: 'connection_id', select: 'name email channel_type' },
  { path: 'audience_ids',  select: 'first_name last_name emails status' },
  { path: 'created_by',   select: 'display_name email role' },
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /campaign  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const createCampaign = async (req, res) => {
  try {
    const {
      name,
      description,
      channel_type,
      template_id,
      connection_id,
      email_settings,
      audience_ids,
      visible_to,
      editable_by,
      schedule_type,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Campaign name is required.' });
    }
    if (!channel_type) {
      return res.status(400).json({ success: false, message: 'channel_type is required.' });
    }

    const campaign = await Campaign.create({
      name:           name.trim(),
      description:    description?.trim() || '',
      channel_type,
      template_id:    template_id    || null,
      connection_id:  connection_id  || null,
      email_settings: email_settings || {},
      audience_ids:   audience_ids   || [],
      visible_to:     visible_to     || ['all'],
      editable_by:    editable_by    || ['admin'],
      schedule_type:  schedule_type  || 'one_time',
      created_by:     req.user.id,
      // status, schedule_status default to 'draft' / 'not_scheduled'
    });

    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('[createCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /campaign  (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCampaigns = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    // Viewers only see campaigns where visible_to contains 'all' or their own id
    const isAdmin = req.user.role === 'admin';
    const filter  = isAdmin
      ? {}
      : { $or: [{ visible_to: 'all' }, { created_by: req.user.id }] };

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(POPULATE_OPTS),
      Campaign.countDocuments(filter),
    ]);

    return res.status(200).json({
      success:    true,
      data:       campaigns,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[getAllCampaigns]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /campaign/:id  (any authenticated user)
// ─────────────────────────────────────────────────────────────────────────────
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(POPULATE_OPTS);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    return res.status(200).json({ success: true, data: campaign });
  } catch (err) {
    console.error('[getCampaignById]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /campaign/:id  (admin only)
// Edit is only allowed while status === 'draft'
// ─────────────────────────────────────────────────────────────────────────────
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    if (campaign.status === 'published') {
      return res.status(403).json({
        success: false,
        message: 'Published campaigns cannot be edited.',
      });
    }

    const allowed = [
      'name', 'description', 'template_id', 'connection_id',
      'email_settings', 'audience_ids', 'visible_to', 'editable_by', 'schedule_type',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) campaign[key] = req.body[key];
    });

    await campaign.save();
    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error('[updateCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /campaign/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    if (['live', 'scheduled'].includes(campaign.schedule_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete a campaign with schedule status "${campaign.schedule_status}".`,
      });
    }

    await campaign.deleteOne();
    return res.status(200).json({ success: true, message: 'Campaign deleted.' });
  } catch (err) {
    console.error('[deleteCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /campaign/:id/duplicate  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
export const duplicateCampaign = async (req, res) => {
  try {
    const original = await Campaign.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const copy = await Campaign.create({
      name:           `Copy of ${original.name}`,
      description:    original.description,
      channel_type:   original.channel_type,
      template_id:    original.template_id,
      connection_id:  original.connection_id,
      email_settings: original.email_settings,
      audience_ids:   original.audience_ids,
      visible_to:     original.visible_to,
      editable_by:    original.editable_by,
      schedule_type:  original.schedule_type,
      created_by:     req.user.id,
      // Always starts fresh: draft + not_scheduled
      status:          'draft',
      schedule_status: 'not_scheduled',
    });

    const populated = await Campaign.findById(copy._id).populate(POPULATE_OPTS);
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('[duplicateCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /campaign/:id/publish-details  (admin only)
// Saves the scheduled_at ISO datetime and marks campaign ready for publish.
// ─────────────────────────────────────────────────────────────────────────────
export const setPublishDetails = async (req, res) => {
  try {
    const { scheduled_at } = req.body;

    if (!scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'scheduled_at (ISO datetime) is required.',
      });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    if (campaign.status === 'published') {
      return res.status(403).json({
        success: false,
        message: 'Campaign is already published.',
      });
    }

    campaign.publish_details = { scheduled_at: new Date(scheduled_at) };
    await campaign.save();

    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error('[setPublishDetails]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /campaign/:id/publish  (admin only)
// Final publish action — locks campaign, sets schedule_status based on time.
// ─────────────────────────────────────────────────────────────────────────────
export const publishCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    if (campaign.status === 'published') {
      return res.status(400).json({ success: false, message: 'Campaign is already published.' });
    }
    if (!campaign.publish_details?.scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'Set publish details (scheduled_at) before publishing.',
      });
    }

    const now = new Date();
    const scheduledAt = new Date(campaign.publish_details.scheduled_at);

    campaign.status                       = 'published';
    campaign.publish_details.published_at = now;
    // If the scheduled time is still in the future → 'scheduled'
    // If it has already passed (immediate or past) → 'completed'
    campaign.schedule_status = scheduledAt > now ? 'scheduled' : 'completed';

    await campaign.save();

    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error('[publishCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
