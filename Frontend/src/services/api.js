// Base URL — reads from Vite env, falls back to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/**
 * Central fetch wrapper.
 * - Automatically attaches Authorization: Bearer <token> if a token is in localStorage.
 * - On 401: clears auth storage and redirects to /login (handles expired tokens globally).
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Read token on every call so it's always fresh
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // Global 401 handler — token expired or invalid
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

export const getRequest    = (endpoint)        => apiCall(endpoint);
export const postRequest   = (endpoint, data)  => apiCall(endpoint, { method: "POST",   body: JSON.stringify(data) });
export const putRequest    = (endpoint, data)  => apiCall(endpoint, { method: "PUT",    body: JSON.stringify(data) });
export const patchRequest  = (endpoint, data)  => apiCall(endpoint, { method: "PATCH",  body: JSON.stringify(data) });
export const deleteRequest = (endpoint)        => apiCall(endpoint, { method: "DELETE" });
