import Campaign    from '../models/Campaign.js';
import Connection  from '../models/Connection.js';
import Template    from '../models/Template.js';
import Audience    from '../models/Audience.js';
import { sendEmailViaConnection } from './ConnectionController.js';

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

    await campaign.deleteOne();
    console.log(`[deleteCampaign] Deleted campaign ${campaign._id} "${campaign.name}"`);
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
    const { scheduled_at, schedule_type, periodic_settings } = req.body;

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

    const startDate = new Date(scheduled_at);
    const now = new Date();

    if (startDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start date/time must be in the future (IST).',
      });
    }

    campaign.publish_details = { scheduled_at: startDate };

    if (schedule_type === 'periodic' && periodic_settings) {
      const ps = periodic_settings;

      // Validate interval
      if (!['hourly', 'daily', 'weekly'].includes(ps.interval)) {
        return res.status(400).json({ success: false, message: 'Invalid interval. Use hourly, daily, or weekly.' });
      }
      // Validate frequency
      if (!ps.frequency || Number(ps.frequency) < 1) {
        return res.status(400).json({ success: false, message: 'frequency must be at least 1.' });
      }
      // Validate ends_type
      if (!['on', 'after'].includes(ps.ends_type)) {
        return res.status(400).json({ success: false, message: 'ends_type must be "on" or "after".' });
      }
      if (ps.ends_type === 'on') {
        if (!ps.end_date) {
          return res.status(400).json({ success: false, message: 'end_date is required when ends_type is "on".' });
        }
        if (new Date(ps.end_date) <= startDate) {
          return res.status(400).json({ success: false, message: 'end_date must be after the start date.' });
        }
      }
      if (ps.ends_type === 'after') {
        if (!ps.occurrences || Number(ps.occurrences) < 1) {
          return res.status(400).json({ success: false, message: 'occurrences must be at least 1.' });
        }
      }

      campaign.schedule_type = 'periodic';
      campaign.periodic_settings = {
        interval:        ps.interval,
        frequency:       Number(ps.frequency),
        ends_type:       ps.ends_type,
        end_date:        ps.ends_type === 'on'    ? new Date(ps.end_date)         : undefined,
        occurrences:     ps.ends_type === 'after' ? Number(ps.occurrences)        : undefined,
        occurrences_run: 0,
        next_run_at:     startDate,
      };
    } else {
      // One-time: reset schedule type, leave periodic_settings cleared
      campaign.schedule_type = 'one_time';
      campaign.periodic_settings = undefined;
    }

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
    // Periodic campaigns are always 'scheduled' — the scheduler handles completion.
    // One-time: if scheduled time is still future → 'scheduled', else 'completed'.
    if (campaign.schedule_type === 'periodic') {
      campaign.schedule_status = 'scheduled';
    } else {
      campaign.schedule_status = scheduledAt > now ? 'scheduled' : 'completed';
    }

    await campaign.save();

    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error('[publishCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /campaign/:id/send  (admin only)
// Sends the campaign immediately via the linked connection to all audience
// recipients. Works for both draft and published campaigns (demo-friendly).
// ─────────────────────────────────────────────────────────────────────────────
export const sendCampaign = async (req, res) => {
  try {
    // 1. Load campaign
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }
    if (campaign.channel_type !== 'email') {
      return res.status(400).json({
        success: false,
        message: `Send is only supported for email campaigns (this is ${campaign.channel_type}).`,
      });
    }
    if (!campaign.connection_id) {
      return res.status(400).json({
        success: false,
        message: 'No connection linked to this campaign. Edit the campaign and select a connection.',
      });
    }
    if (!campaign.template_id) {
      return res.status(400).json({
        success: false,
        message: 'No template linked to this campaign.',
      });
    }
    if (!campaign.audience_ids || campaign.audience_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No audience selected for this campaign.',
      });
    }

    // 2. Load connection (with raw encrypted creds)
    console.log(`[sendCampaign] campaign=${campaign._id} conn=${campaign.connection_id} tmpl=${campaign.template_id} audience=${campaign.audience_ids?.length}`);
    const conn = await Connection.findById(campaign.connection_id);
    if (!conn) {
      return res.status(404).json({ success: false, message: 'Linked connection not found.' });
    }
    console.log(`[sendCampaign] Using connection: ${conn.name} (${conn.provider}) sender=${conn.email}`);

    // 3. Load template
    const template = await Template.findById(campaign.template_id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Linked template not found.' });
    }

    const htmlBody = template.content?.html_body || '';
    const subject  = campaign.email_settings?.subject ||
                     template.content?.subject       ||
                     campaign.name;

    // 4. Load audience contacts
    const contacts = await Audience.find({
      _id:    { $in: campaign.audience_ids },
      status: 'active',
    }).select('first_name last_name emails');

    if (contacts.length === 0) {
      console.warn(`[sendCampaign] No active contacts found for audience_ids:`, campaign.audience_ids);
      return res.status(400).json({
        success: false,
        message: 'No active audience contacts found for this campaign.',
      });
    }
    console.log(`[sendCampaign] Sending to ${contacts.length} contact(s)`);

    // 5. Send to each recipient
    let sent   = 0;
    let failed = 0;
    const errors = [];

    for (const contact of contacts) {
      const primaryEmail = contact.emails?.find(e => e.is_primary)?.email
                        || contact.emails?.[0]?.email;
      if (!primaryEmail) { failed++; continue; }

      const fullName = `${contact.first_name} ${contact.last_name}`.trim();

      // Simple personalisation — replace {{first_name}} / {{last_name}} / {{full_name}}
      const personalised = htmlBody
        .replace(/\{\{first_name\}\}/gi, contact.first_name)
        .replace(/\{\{last_name\}\}/gi,  contact.last_name)
        .replace(/\{\{full_name\}\}/gi,   fullName)
        .replace(/\{\{email\}\}/gi,       primaryEmail);

      try {
        const result = await sendEmailViaConnection(conn, {
          toEmail:  primaryEmail,
          toName:   fullName,
          subject,
          html:     personalised || undefined,
          text:     template.content?.text_preview || undefined,
        });
        console.log(`[sendCampaign] ✅ Sent to ${primaryEmail}`, result?.messageId || '');
        sent++;
      } catch (sendErr) {
        failed++;
        errors.push({ email: primaryEmail, error: sendErr.message });
        console.error(`[sendCampaign] ❌ Failed to ${primaryEmail}:`, sendErr.message);
      }
    }

    // 6. Update delivery stats
    campaign.delivery_stats.sent   = (campaign.delivery_stats.sent   || 0) + sent;
    campaign.delivery_stats.failed = (campaign.delivery_stats.failed || 0) + failed;
    await campaign.save();

    const statusCode = failed === 0 ? 200 : 207; // 207 Multi-Status for partial success
    return res.status(statusCode).json({
      success: failed === 0,
      message: `Sent ${sent} email(s)${failed > 0 ? `, ${failed} failed` : ''}.`,
      data:    { sent, failed, errors },
    });
  } catch (err) {
    console.error('[sendCampaign]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
