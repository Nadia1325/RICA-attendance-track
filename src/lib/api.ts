/** Frontend-only edition: remote API connections are intentionally disabled. */
export const apiConfigured = false;

export function refreshApiData() {
  // Data changes are propagated through the local React state store.
}

export async function apiRequest<T>(_path: string, _options: RequestInit = {}, _token?: string): Promise<T> {
  throw new Error("This frontend-only edition does not connect to a backend.");
}
