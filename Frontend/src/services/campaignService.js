import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

export const campaignService = {
  getAll: () => getRequest("/campaigns"),
  getById: (id) => getRequest(`/campaigns/${id}`),
  create: (data) => postRequest("/campaigns", data),
  update: (id, data) => putRequest(`/campaigns/${id}`, data),
  delete: (id) => deleteRequest(`/campaigns/${id}`),
  send: (id) => postRequest(`/campaigns/${id}/send`, {}),
  schedule: (id, data) => postRequest(`/campaigns/${id}/schedule`, data),
  getAnalytics: (id) => getRequest(`/campaigns/${id}/analytics`),
};
