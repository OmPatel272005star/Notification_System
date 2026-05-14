import { getRequest, postRequest, putRequest, deleteRequest } from "./api";

export const audienceService = {
  getAll: () => getRequest("/audience"),
  getById: (id) => getRequest(`/audience/${id}`),
  create: (data) => postRequest("/audience", data),
  update: (id, data) => putRequest(`/audience/${id}`, data),
  delete: (id) => deleteRequest(`/audience/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch("http://localhost:3000/api/audience/import", {
      method: "POST",
      body: formData,
    });
  },
};
