/**
 * Backend API base URL.
 * In development, Vite proxies /api to the backend. In production, set VITE_API_URL env.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";
