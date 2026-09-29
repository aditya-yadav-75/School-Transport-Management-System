const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = async (path, options = {}) => {
  const token = localStorage.getItem("transport_token");

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};
