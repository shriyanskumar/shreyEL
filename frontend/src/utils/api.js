/**
 * API Configuration for Document Tracker Frontend
 * Uses environment variables for production deployment
 */

import axios from "axios";

// Get API URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Export individual API functions
export const authAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (username, email, password) =>
    api.post("/api/auth/register", { username, email, password }),
  getProfile: () => api.get("/api/auth/profile"),
};

export const documentsAPI = {
  getAll: () => api.get("/api/documents"),
  getById: (id) => api.get(`/api/documents/${id}`),
  create: (data) => api.post("/api/documents", data),
  update: (id, data) => api.put(`/api/documents/${id}`, data),
  delete: (id) => api.delete(`/api/documents/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get("/api/categories"),
  create: (data) => api.post("/api/categories", data),
};

export const remindersAPI = {
  getAll: () => api.get("/api/reminders"),
  create: (data) => api.post("/api/reminders", data),
  update: (id, data) => api.put(`/api/reminders/${id}`, data),
  delete: (id) => api.delete(`/api/reminders/${id}`),
};

export const summariesAPI = {
  generate: (documentId) => api.post(`/api/summaries/generate/${documentId}`),
  getByDocument: (documentId) =>
    api.get(`/api/summaries/document/${documentId}`),
};

export { API_BASE_URL };
export default api;
