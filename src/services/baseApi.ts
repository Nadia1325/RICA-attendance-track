// src/services/baseApi.ts
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { KEYS, loggedOut, setAccessToken } from "../features/auth/authSlice";
import type { ApiRow } from "./mappers";

/**
 * Base URL from env without trailing slash or /api suffix.
 * Handled so endpoints can start with /api/... safely.
 */
const rawEnvUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/+$/,
  "",
);

export const API_URL = rawEnvUrl
  ? rawEnvUrl.replace(/\/api$/, "")
  : "https://rica-attendance-backend.onrender.com/api";

const rawBaseQuery = fetchBaseQuery({
  // Clean base URL without trailing /api (endpoints will supply /api/...)
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    // 1. Get token from Redux state or fallback directly to localStorage
    const stateToken = (getState() as RootState).auth?.accessToken;
    const localToken = localStorage.getItem(KEYS.access);

    const token = stateToken || localToken;

    if (token && endpoint !== "login") {
      // 2. Prevent duplicate Bearer prefixes
      const cleanToken = token.replace(/^Bearer\s+/i, "");
      headers.set("Authorization", `Bearer ${cleanToken}`);
    }

    return headers;
  },
});

let refreshing: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra);
  const url = typeof args === "string" ? args : args.url;

  if (
    result.error?.status === 401 &&
    !url.includes("/auth/login") &&
    !url.includes("/auth/refresh")
  ) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;
    if (refreshToken) {
      refreshing ??= (async () => {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        if (!res.ok) return null;
        const body = (await res.json()) as ApiRow;
        return String(body.access_token ?? body.accessToken ?? "") || null;
      })()
        .catch(() => null)
        .finally(() => {
          refreshing = null;
        });

      const fresh = await refreshing;
      if (fresh) {
        api.dispatch(setAccessToken(fresh));
        result = await rawBaseQuery(args, api, extra);
        return result;
      }
    }
    api.dispatch(loggedOut());
  }
  return result;
};

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error || typeof error !== "object") return fallback;
  const e = error as {
    status?: number | string;
    data?: unknown;
    message?: string;
    error?: string;
  };
  if (e.status === "FETCH_ERROR") {
    return "Cannot reach the RICA server. Check your connection or the API address.";
  }
  const data = e.data as ApiRow | string | undefined;
  if (data && typeof data === "object") {
    const message = data.message ?? data.error ?? data.msg ?? data.detail;
    if (typeof message === "string") return message;
  }
  if (typeof data === "string" && data && data.length < 200) return data;
  return e.message ?? e.error ?? fallback;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Me",
    "Department",
    "Employee",
    "Shift",
    "Holiday",
    "Raw",
    "Final",
    "Anomaly",
    "Batch",
    "Leave",
    "User",
    "Audit",
    "Report",
  ],
  endpoints: () => ({}),
});
