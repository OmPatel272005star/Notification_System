import Audience from '../models/Audience.js';

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /audience
 * Returns all audience members, sorted by newest first.
 * Populates created_by and edit_history.edited_by.
 * Supports ?search= query param for text search.
 * ───────────────────────────────────────────────────────────────────────── */
export const getAllAudience = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim() !== '') {
      // Use text index if we want, or regex for partial matches.
      // A simple regex approach across first_name, last_name, and emails is often easier for partial matches:
      const regex = new RegExp(search.trim(), 'i');
      filter = {
        $or: [
          { first_name: regex },
          { last_name: regex },
          { 'emails.email': regex }
        ]
      };
    }

    const audiences = await Audience.find(filter)
      .populate('created_by', 'display_name email')
      .populate('last_edited_by', 'display_name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: audiences });
  } catch (err) {
    console.error('getAllAudience error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /audience/:id
 * Returns single audience member.
 * ───────────────────────────────────────────────────────────────────────── */
export const getAudienceById = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id)
      .populate('created_by', 'display_name email')
      .populate('last_edited_by', 'display_name email');

    if (!audience) {
      return res.status(404).json({ success: false, message: 'Audience not found' });
    }

    return res.status(200).json({ success: true, data: audience });
  } catch (err) {
    console.error('getAudienceById error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * POST /audience
 * Creates new audience member.
 * Sets created_by: req.user.id
 * Pushes initial edit_history entry with action: 'created'.
 * ───────────────────────────────────────────────────────────────────────── */
export const createAudience = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      gender,
      emails,
      phone_numbers,
      address,
      social_media_handles,
      status
    } = req.body;

    if (!first_name?.trim() || !last_name?.trim()) {
      return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }

    const newAudience = await Audience.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      dob,
      gender,
      emails: emails || [],
      phone_numbers: phone_numbers || [],
      address: address || {},
      social_media_handles: social_media_handles || [],
      status: status || 'active',
      created_by: req.user.id,
      edit_history: [{
        edited_by: req.user.id,
        edited_at: new Date(),
        action: 'created',
        change_note: 'Audience member created'
      }]
    });

    await newAudience.populate('created_by', 'display_name email');

    return res.status(201).json({
      success: true,
      message: 'Audience created successfully',
      data: newAudience
    });
  } catch (err) {
    console.error('createAudience error:', err);
    if (err.code === 11000) {
       return res.status(400).json({ success: false, message: 'An audience member with this email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * PUT /audience/:id
 * Partial update.
 * Detects changed fields.
 * Pushes edit_history entry with changed_fields array.
 * Sets last_edited_by: req.user.id.
 * ───────────────────────────────────────────────────────────────────────── */
export const updateAudience = async (req, res) => {
  try {
    const id = req.params.id;
    const oldDoc = await Audience.findById(id);
    if (!oldDoc) {
      return res.status(404).json({ success: false, message: 'Audience not found' });
    }

    const {
      first_name,
      last_name,
      dob,
      gender,
      emails,
      phone_numbers,
      address,
      social_media_handles,
      status,
      change_note
    } = req.body;

    const changedFields = [];
    const set = {};

    if (first_name !== undefined && first_name.trim() !== oldDoc.first_name) {
      set.first_name = first_name.trim();
      changedFields.push('first_name');
    }
    if (last_name !== undefined && last_name.trim() !== oldDoc.last_name) {
      set.last_name = last_name.trim();
      changedFields.push('last_name');
    }
    if (dob !== undefined) {
      const newDob = new Date(dob).getTime();
      const oldDob = oldDoc.dob ? new Date(oldDoc.dob).getTime() : null;
      if (newDob !== oldDob) {
        set.dob = dob;
        changedFields.push('dob');
      }
    }
    if (gender !== undefined && gender !== oldDoc.gender) {
      set.gender = gender;
      changedFields.push('gender');
    }
    if (emails !== undefined) {
      set.emails = emails;
      changedFields.push('emails');
    }
    if (phone_numbers !== undefined) {
      set.phone_numbers = phone_numbers;
      changedFields.push('phone_numbers');
    }
    if (address !== undefined) {
      set.address = address;
      changedFields.push('address');
    }
    if (social_media_handles !== undefined) {
      set.social_media_handles = social_media_handles;
      changedFields.push('social_media_handles');
    }
    if (status !== undefined && status !== oldDoc.status) {
      set.status = status;
      changedFields.push('status');
    }

    set.last_edited_by = req.user.id;

    const historyEntry = {
      edited_by: req.user.id,
      edited_at: new Date(),
      action: 'updated',
      changed_fields: changedFields,
      change_note: change_note?.trim() || ''
    };

    const updated = await Audience.findByIdAndUpdate(
      id,
      {
        $set: set,
        $push: { edit_history: historyEntry }
      },
      { new: true }
    )
      .populate('created_by', 'display_name email')
      .populate('last_edited_by', 'display_name email');

    return res.status(200).json({
      success: true,
      message: 'Audience updated successfully',
      data: updated
    });
  } catch (err) {
    console.error('updateAudience error:', err);
    if (err.code === 11000) {
       return res.status(400).json({ success: false, message: 'An audience member with this email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * DELETE /audience/:id
 * Hard-deletes the audience record.
 * ───────────────────────────────────────────────────────────────────────── */
export const deleteAudience = async (req, res) => {
  try {
    const deleted = await Audience.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Audience not found' });
    }
    return res.status(200).json({ success: true, message: 'Audience deleted successfully' });
  } catch (err) {
    console.error('deleteAudience error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * GET /audience/:id/timeline
 * Returns edit_history array populated with user names.
 * ───────────────────────────────────────────────────────────────────────── */
export const getAudienceTimeline = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id)
      .select('edit_history')
      .populate('edit_history.edited_by', 'display_name email avatar');

    if (!audience) {
      return res.status(404).json({ success: false, message: 'Audience not found' });
    }
    
    // Sort newest first
    const timeline = audience.edit_history.sort((a, b) => b.edited_at - a.edited_at);

    return res.status(200).json({ success: true, data: timeline });
  } catch (err) {
    console.error('getAudienceTimeline error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
