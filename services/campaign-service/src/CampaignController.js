import Campaign   from '../shared/models/Campaign.js';
import { producer } from '../shared/config/kafka.js';
import { createLogger } from '../shared/utils/logger.js';

const logger = createLogger('campaign-service');

const POPULATE_OPTS = [
  { path: 'template_id',   select: 'name channel_type status' },
  { path: 'connection_id', select: 'name email channel_type' },
  { path: 'audience_ids',  select: 'first_name last_name emails status' },
  { path: 'created_by',    select: 'display_name email role' },
];

export const createCampaign = async (req, res) => {
  try {
    const { name, description, channel_type, template_id, connection_id, email_settings, audience_ids, visible_to, editable_by, schedule_type } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Campaign name is required.' });
    if (!channel_type) return res.status(400).json({ success: false, message: 'channel_type is required.' });
    const campaign = await Campaign.create({ name: name.trim(), description: description?.trim() || '', channel_type,
      template_id: template_id || null, connection_id: connection_id || null, email_settings: email_settings || {},
      audience_ids: audience_ids || [], visible_to: visible_to || ['all'], editable_by: editable_by || ['admin'],
      schedule_type: schedule_type || 'one_time', created_by: req.user.id });
    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    logger.info('campaign created', { campaignId: campaign._id, name: campaign.name, channel_type, userId: req.user.id });
    return res.status(201).json({ success: true, data: populated });
  } catch (err) { logger.error('createCampaign error', { error: err.message, userId: req.user?.id }); return res.status(500).json({ success: false, message: err.message }); }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const isAdmin = req.user.role === 'admin';
    const filter  = isAdmin ? {} : { $or: [{ visible_to: 'all' }, { created_by: req.user.id }] };
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(POPULATE_OPTS),
      Campaign.countDocuments(filter),
    ]);
    return res.status(200).json({ success: true, data: campaigns, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate(POPULATE_OPTS);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    return res.status(200).json({ success: true, data: campaign });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    if (campaign.status === 'published') return res.status(403).json({ success: false, message: 'Published campaigns cannot be edited.' });
    ['name','description','template_id','connection_id','email_settings','audience_ids','visible_to','editable_by','schedule_type']
      .forEach((k) => { if (req.body[k] !== undefined) campaign[k] = req.body[k]; });
    await campaign.save();
    const populated = await Campaign.findById(campaign._id).populate(POPULATE_OPTS);
    logger.info('campaign updated', { campaignId: campaign._id, userId: req.user.id });
    return res.status(200).json({ success: true, data: populated });
  } catch (err) { logger.error('updateCampaign error', { campaignId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: err.message }); }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    await campaign.deleteOne();
    logger.info('campaign deleted', { campaignId: req.params.id, name: campaign.name, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Campaign deleted.' });
  } catch (err) { logger.error('deleteCampaign error', { campaignId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: err.message }); }
};

export const duplicateCampaign = async (req, res) => {
  try {
    const original = await Campaign.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    const copy = await Campaign.create({ ...original.toObject(), _id: undefined, name: `Copy of ${original.name}`,
      status: 'draft', schedule_status: 'not_scheduled', created_by: req.user.id });
    const populated = await Campaign.findById(copy._id).populate(POPULATE_OPTS);
    return res.status(201).json({ success: true, data: populated });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const setPublishDetails = async (req, res) => {
  try {
    const { scheduled_at, schedule_type, periodic_settings } = req.body;
    if (!scheduled_at) return res.status(400).json({ success: false, message: 'scheduled_at (ISO datetime) is required.' });
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)                return res.status(404).json({ success: false, message: 'Campaign not found.' });
    if (campaign.status === 'published') return res.status(403).json({ success: false, message: 'Campaign is already published.' });
    const startDate = new Date(scheduled_at);
    if (startDate <= new Date()) return res.status(400).json({ success: false, message: 'Start date/time must be in the future.' });
    campaign.publish_details = { scheduled_at: startDate };
    if (schedule_type === 'periodic' && periodic_settings) {
      const ps = periodic_settings;
      if (!['hourly','daily','weekly'].includes(ps.interval)) return res.status(400).json({ success: false, message: 'Invalid interval.' });
      if (!ps.frequency || Number(ps.frequency) < 1)         return res.status(400).json({ success: false, message: 'frequency must be >= 1.' });
      if (!['on','after'].includes(ps.ends_type))            return res.status(400).json({ success: false, message: 'ends_type must be "on" or "after".' });
      if (ps.ends_type === 'on'    && !ps.end_date)          return res.status(400).json({ success: false, message: 'end_date required.' });
      if (ps.ends_type === 'after' && (!ps.occurrences || Number(ps.occurrences) < 1)) return res.status(400).json({ success: false, message: 'occurrences >= 1 required.' });
      campaign.schedule_type = 'periodic';
      campaign.periodic_settings = { interval: ps.interval, frequency: Number(ps.frequency), ends_type: ps.ends_type,
        end_date: ps.ends_type === 'on' ? new Date(ps.end_date) : undefined,
        occurrences: ps.ends_type === 'after' ? Number(ps.occurrences) : undefined,
        occurrences_run: 0, next_run_at: startDate };
    } else {
      campaign.schedule_type = 'one_time';
      campaign.periodic_settings = undefined;
    }
    await campaign.save();
    return res.status(200).json({ success: true, data: await Campaign.findById(campaign._id).populate(POPULATE_OPTS) });
  } catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

export const publishCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });
    if (campaign.status === 'published') return res.status(400).json({ success: false, message: 'Already published.' });
    if (!campaign.publish_details?.scheduled_at) return res.status(400).json({ success: false, message: 'Set publish details before publishing.' });
    const now = new Date();
    campaign.status = 'published';
    campaign.publish_details.published_at = now;
    campaign.schedule_status = campaign.schedule_type === 'periodic' ? 'scheduled'
      : (new Date(campaign.publish_details.scheduled_at) > now ? 'scheduled' : 'completed');
    await campaign.save();
    logger.info('campaign published', { campaignId: campaign._id, name: campaign.name, schedule_type: campaign.schedule_type, schedule_status: campaign.schedule_status, userId: req.user.id });
    return res.status(200).json({ success: true, data: await Campaign.findById(campaign._id).populate(POPULATE_OPTS) });
  } catch (err) { logger.error('publishCampaign error', { campaignId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: err.message }); }
};

export const sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)                     return res.status(404).json({ success: false, message: 'Campaign not found.' });
    if (campaign.channel_type !== 'email') return res.status(400).json({ success: false, message: 'Send only supported for email campaigns.' });
    if (!campaign.connection_id)       return res.status(400).json({ success: false, message: 'No connection linked.' });
    if (!campaign.template_id)         return res.status(400).json({ success: false, message: 'No template linked.' });
    if (!campaign.audience_ids?.length) return res.status(400).json({ success: false, message: 'No audience selected.' });

    await producer.send({ topic: 'campaign.trigger', messages: [{
      key:   campaign._id.toString(),
      value: JSON.stringify({ campaignId: campaign._id, triggeredBy: req.user.id, triggerType: 'manual' }),
    }] });

    logger.info('campaign.trigger emitted', { campaignId: campaign._id, triggeredBy: req.user.id, triggerType: 'manual' });
    return res.status(202).json({ success: true, message: 'Campaign queued for dispatch. Emails will be sent asynchronously.', data: { campaignId: campaign._id, status: 'queued' } });
  } catch (err) { logger.error('sendCampaign error', { campaignId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: err.message }); }
};
