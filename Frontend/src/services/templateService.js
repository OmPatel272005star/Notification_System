import { getRequest, postRequest, putRequest, deleteRequest } from "./api.js";

/**
 * GET /template
 * All templates (admin sees all; viewers get only visible_to:"all").
 */
export const fetchAllTemplates  = ()       => getRequest("/template");

/**
 * GET /template/:id
 */
export const fetchTemplateById  = (id)     => getRequest(`/template/${id}`);

/**
 * POST /template  [admin only]
 * @param {{ name, channel_type, description?, status?, content?, visible_to?, editable_by? }} data
 */
export const createTemplate     = (data)   => postRequest("/template", data);

/**
 * PUT /template/:id  [admin only]
 * Partial update — only send the fields you want to change.
 * Every call automatically pushes a new entry to edit_history in the DB.
 */
export const updateTemplate     = (id, data) => putRequest(`/template/${id}`, data);

/**
 * DELETE /template/:id  [admin only]
 */
export const deleteTemplate     = (id)     => deleteRequest(`/template/${id}`);

/**
 * POST /template/:id/duplicate  [admin only]
 * Creates a copy with name "copy_of_<original>" and status "draft".
 */
export const duplicateTemplate  = (id)     => postRequest(`/template/${id}/duplicate`);
