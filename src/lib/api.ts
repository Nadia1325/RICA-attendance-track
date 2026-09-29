// src/lib/api.ts
import { KEYS } from "../features/auth/authSlice";

/** Base URL configured from environment variables */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/** Backend connection toggle flag */
export const apiConfigured = true;

/**
 * Standard API request wrapper for custom fetch calls 
 * (e.g. file exports, binary downloads, or external REST endpoints).
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  customToken?: string
): Promise<T> {
  const token = customToken || localStorage.getItem(KEYS.access);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      /* non-JSON error response fallback */
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Utility helper to handle file downloads (e.g., exported Excel/PDF reports)
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = localStorage.getItem(KEYS.access);
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}