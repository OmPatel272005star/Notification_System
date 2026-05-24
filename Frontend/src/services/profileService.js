import { getRequest, putRequest } from "./api.js";

/**
 * GET /profile/me
 * Returns the full profile document of the currently logged-in user.
 */
export const getMyProfile = () => getRequest("/profile/me");

/**
 * PUT /profile/me
 * Updates the logged-in user's own profile.
 * @param {{ display_name?, gender?, dob?, country?, state?, city?, mobile?, profile_picture? }} data
 */
export const updateMyProfile = (data) => putRequest("/profile/me", data);
