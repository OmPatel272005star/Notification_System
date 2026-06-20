import Audience from '../shared/models/Audience.js';
import { createLogger } from '../shared/utils/logger.js';

const logger = createLogger('audience-service');

export const getAllAudience = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter = { $or: [{ first_name: regex }, { last_name: regex }, { 'emails.email': regex }] };
    }
    const audiences = await Audience.find(filter)
      .populate('created_by','display_name email')
      .populate('last_edited_by','display_name email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: audiences });
  } catch (err) { logger.error('getAllAudience error', { error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const getAudienceById = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id)
      .populate('created_by','display_name email').populate('last_edited_by','display_name email');
    if (!audience) return res.status(404).json({ success: false, message: 'Audience not found' });
    return res.status(200).json({ success: true, data: audience });
  } catch (err) { logger.error('getAudienceById error', { audienceId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const createAudience = async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, emails, phone_numbers, address, social_media_handles, status } = req.body;
    if (!first_name?.trim() || !last_name?.trim())
      return res.status(400).json({ success: false, message: 'First name and last name are required' });
    const newAudience = await Audience.create({
      first_name: first_name.trim(), last_name: last_name.trim(), dob, gender,
      emails: emails || [], phone_numbers: phone_numbers || [], address: address || {},
      social_media_handles: social_media_handles || [], status: status || 'active',
      created_by: req.user.id,
      edit_history: [{ edited_by: req.user.id, edited_at: new Date(), action: 'created', change_note: 'Audience member created' }],
    });
    await newAudience.populate('created_by','display_name email');
    logger.info('audience created', { audienceId: newAudience._id, userId: req.user.id });
    return res.status(201).json({ success: true, message: 'Audience created successfully', data: newAudience });
  } catch (err) {
    logger.error('createAudience error', { error: err.message });
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'An audience member with this email already exists' });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateAudience = async (req, res) => {
  try {
    const id = req.params.id;
    const oldDoc = await Audience.findById(id);
    if (!oldDoc) return res.status(404).json({ success: false, message: 'Audience not found' });
    const { first_name, last_name, dob, gender, emails, phone_numbers, address, social_media_handles, status, change_note } = req.body;
    const changedFields = [];
    const set = {};
    if (first_name !== undefined && first_name.trim() !== oldDoc.first_name) { set.first_name = first_name.trim(); changedFields.push('first_name'); }
    if (last_name  !== undefined && last_name.trim()  !== oldDoc.last_name)  { set.last_name  = last_name.trim();  changedFields.push('last_name');  }
    if (dob        !== undefined) { set.dob = dob; changedFields.push('dob'); }
    if (gender     !== undefined && gender !== oldDoc.gender) { set.gender = gender; changedFields.push('gender'); }
    if (emails     !== undefined) { set.emails = emails; changedFields.push('emails'); }
    if (phone_numbers !== undefined) { set.phone_numbers = phone_numbers; changedFields.push('phone_numbers'); }
    if (address    !== undefined) { set.address = address; changedFields.push('address'); }
    if (social_media_handles !== undefined) { set.social_media_handles = social_media_handles; changedFields.push('social_media_handles'); }
    if (status     !== undefined && status !== oldDoc.status) { set.status = status; changedFields.push('status'); }
    set.last_edited_by = req.user.id;
    const historyEntry = { edited_by: req.user.id, edited_at: new Date(), action: 'updated', changed_fields: changedFields, change_note: change_note?.trim() || '' };
    const updated = await Audience.findByIdAndUpdate(id, { $set: set, $push: { edit_history: historyEntry } }, { new: true })
      .populate('created_by','display_name email').populate('last_edited_by','display_name email');
    logger.info('audience updated', { audienceId: req.params.id, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Audience updated successfully', data: updated });
  } catch (err) { logger.error('updateAudience error', { audienceId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const deleteAudience = async (req, res) => {
  try {
    const deleted = await Audience.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Audience not found' });
    logger.info('audience deleted', { audienceId: req.params.id, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Audience deleted successfully' });
  } catch (err) { logger.error('deleteAudience error', { audienceId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: 'Internal server error' }); }
};

export const getAudienceTimeline = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id).select('edit_history').populate('edit_history.edited_by','display_name email');
    if (!audience) return res.status(404).json({ success: false, message: 'Audience not found' });
    const timeline = audience.edit_history.sort((a, b) => b.edited_at - a.edited_at);
    return res.status(200).json({ success: true, data: timeline });
  } catch { return res.status(500).json({ success: false, message: 'Internal server error' }); }
};
