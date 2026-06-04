import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

export const connectionService = {
  getAll:    ()         => getRequest("/connections"),
  getById:   (id)       => getRequest(`/connections/${id}`),
  create:    (data)     => postRequest("/connections", data),
  update:    (id, data) => putRequest(`/connections/${id}`, data),
  delete:    (id)       => deleteRequest(`/connections/${id}`),
  test:      (id)       => postRequest(`/connections/${id}/test`, {}),
};
