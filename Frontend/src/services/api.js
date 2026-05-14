const API_BASE_URL = process.env.VITE_API_URL || "http://localhost:3000/api";

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
};

export const getRequest = (endpoint) => apiCall(endpoint);

export const postRequest = (endpoint, data) =>
  apiCall(endpoint, { method: "POST", body: JSON.stringify(data) });

export const putRequest = (endpoint, data) =>
  apiCall(endpoint, { method: "PUT", body: JSON.stringify(data) });

export const deleteRequest = (endpoint) =>
  apiCall(endpoint, { method: "DELETE" });
