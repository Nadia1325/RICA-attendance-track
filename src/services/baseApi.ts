// src/services/baseApi.ts
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { loggedOut, setAccessToken } from "../features/auth/authSlice";
import type { ApiRow } from "./mappers";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token && endpoint !== "login") {
      headers.set("Authorization", `Bearer ${token}`);
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
    !url.startsWith("/api/auth/login") &&
    !url.startsWith("/api/auth/refresh")
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
  fallback = "Something went wrong. Please try again."
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