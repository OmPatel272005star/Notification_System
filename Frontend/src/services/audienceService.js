import { getRequest, postRequest, putRequest, deleteRequest } from "./api.js";

export const fetchAllAudience      = (search) => getRequest(`/audience${search ? `?search=${search}` : ''}`);
export const fetchAudienceById     = (id)     => getRequest(`/audience/${id}`);
export const createAudience        = (data)   => postRequest("/audience", data);
export const updateAudience        = (id, d)  => putRequest(`/audience/${id}`, d);
export const deleteAudience        = (id)     => deleteRequest(`/audience/${id}`);
export const fetchAudienceTimeline = (id)     => getRequest(`/audience/${id}/timeline`);
