import { getRequest, postRequest, putRequest, patchRequest, deleteRequest } from "./api";

export const campaignService = {
  // ── Read (any authenticated user) ──────────────────────────────────────────
  getAll:   (page = 1, limit = 20) => getRequest(`/campaign?page=${page}&limit=${limit}`),
  getById:  (id)                   => getRequest(`/campaign/${id}`),

  // ── Write (admin only — enforced server-side) ───────────────────────────────
  create:           (data)       => postRequest('/campaign', data),
  update:           (id, data)   => putRequest(`/campaign/${id}`, data),
  delete:           (id)         => deleteRequest(`/campaign/${id}`),
  duplicate:        (id)         => postRequest(`/campaign/${id}/duplicate`, {}),

  // ── Publish flow ────────────────────────────────────────────────────────────
  setPublishDetails: (id, data)  => patchRequest(`/campaign/${id}/publish-details`, data),
  publish:           (id)        => postRequest(`/campaign/${id}/publish`, {}),
};

