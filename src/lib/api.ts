const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
export const apiConfigured = Boolean(API_BASE_URL);
export function refreshApiData() { window.dispatchEvent(new Event("rica-api-data-refresh")); }
export function apiToken() {
  const token = localStorage.getItem("rica-api-access-token");
  if (!token) throw new Error("Sign in again to continue.");
  return token;
}
async function send(path: string, options: RequestInit, token?: string): Promise<Response> {
  if (!API_BASE_URL) throw new Error("Set VITE_API_BASE_URL to the RICA backend URL.");
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  try { return await fetch(`${API_BASE_URL}${path}`, { ...options, headers }); }
  catch { throw new Error("Could not reach the RICA backend. Check the API URL and server CORS settings."); }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response = await send(path, options, token);
  if (response.status === 401 && path !== "/api/auth/refresh") {
    const refreshToken = localStorage.getItem("rica-api-refresh-token");
    if (refreshToken) {
      const refreshed = await send("/api/auth/refresh", {}, refreshToken);
      if (refreshed.ok) {
        const payload = await refreshed.json() as { access_token?: string };
        if (payload.access_token) {
          localStorage.setItem("rica-api-access-token", payload.access_token);
          response = await send(path, options, payload.access_token);
        }
      }
    }
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let message = body;
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      message = String(parsed.message ?? parsed.error ?? body);
    } catch { /* response may be plain text */ }
    throw new Error(message || `RICA API request failed (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
