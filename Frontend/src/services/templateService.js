import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

export const templateService = {
  getAll: () => getRequest("/templates"),
  getById: (id) => getRequest(`/templates/${id}`),
  create: (data) => postRequest("/templates", data),
  update: (id, data) => putRequest(`/templates/${id}`, data),
  delete: (id) => deleteRequest(`/templates/${id}`),
  publish: (id) => postRequest(`/templates/${id}/publish`, {}),
};
