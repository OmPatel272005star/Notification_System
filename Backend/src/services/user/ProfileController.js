import User from '../../shared/models/User.js';

/**
 * GET /profile/me
 * Returns the full profile of the currently logged-in user (no password).
 */
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PUT /profile/me
 * Updates the logged-in user's own profile.
 * Body: { display_name?, gender?, dob?, country?, state?, city?, mobile?, profile_picture? }
 *
 * profile_picture = compressed Base64 dataURL (max ~200 KB ≈ 270,000 chars).
 * Only fields that are present in the body are updated ($set with dot-notation).
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, gender, dob, country, state, city, mobile, profile_picture } = req.body;

    // Guard: base64 picture must be reasonably small
    if (profile_picture && profile_picture.length > 270_000) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture is too large. Please use an image under 200 KB.',
      });
    }

    // Build $set with only the fields that were actually sent
    const updates = {};
    if (display_name  !== undefined) updates.display_name           = display_name.trim();
    if (gender        !== undefined) updates['profile.gender']       = gender.toLowerCase();
    if (dob           !== undefined) updates['profile.dob']          = dob || null;
    if (country       !== undefined) updates['profile.country']      = country;
    if (state         !== undefined) updates['profile.state']        = state;
    if (city          !== undefined) updates['profile.city']         = city;
    if (mobile        !== undefined) updates['profile.mobile']       = mobile;
    if (profile_picture !== undefined) updates['profile.profile_picture'] = profile_picture;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password_hash');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getMyProfile, updateMyProfile };
