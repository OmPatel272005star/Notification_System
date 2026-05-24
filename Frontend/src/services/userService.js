import {
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
  deleteRequest,
} from "./api.js";

/**
 * GET /user/getBulkUser?page=&limit=
 * Fetches a paginated page of users.
 * @param {number} page  - 1-based page number (default: 1)
 * @param {number} limit - records per page   (default: 20)
 */
export const getAllUsers = (page = 1, limit = 20) =>
  getRequest(`/user/getBulkUser?page=${page}&limit=${limit}`);

/**
 * POST /user/add
 * Creates a new user.
 * @param {{ display_name: string, email: string, password_hash: string, role: string }} data
 */
export const addUser = (data) =>
  postRequest("/user/add", data);

/**
 * PUT /user/:id
 * Updates display_name, role, and/or nested profile fields.
 * @param {string} id  - MongoDB _id of the user
 * @param {{ display_name?: string, role?: string, profile?: object }} data
 */
export const updateUser = (id, data) =>
  putRequest(`/user/${id}`, data);

/**
 * PATCH /user/:id/status
 * Toggles the user status.
 * @param {string} id     - MongoDB _id of the user
 * @param {string} status - One of: 'active' | 'blocked' | 'pending' | 'suspended' | 'deleted'
 */
export const toggleUserStatus = (id, status) =>
  patchRequest(`/user/${id}/status`, { status });

/**
 * DELETE /user/:id
 * Hard-deletes a user by MongoDB _id.
 * @param {string} id - MongoDB _id of the user
 */
export const deleteUser = (id) =>
  deleteRequest(`/user/${id}`);