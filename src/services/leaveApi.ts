// src/services/leaveApi.ts
import { baseApi } from "./baseApi";
import { asArray, type ApiRow } from "./mappers";
import type { LeaveEntry } from "../types/types";

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Leaves ──
    getLeaves: build.query<ApiRow[], void>({
      query: () => "/leaves",
      transformResponse: asArray,
      providesTags: ["Leave"],
    }),

    createLeave: build.mutation<ApiRow, Partial<LeaveEntry>>({
      query: (body) => ({
        url: "/leaves",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leave"],
    }),

    // ── Audit Logs ──
    getAuditLogs: build.query<ApiRow[], { limit?: number } | void>({
      query: (params) => ({
        url: "/audit-logs",
        params: params || {},
      }),
      transformResponse: asArray,
      providesTags: ["Audit"],
    }),
  }),
});

export const {
  useGetLeavesQuery,
  useCreateLeaveMutation,
  useGetAuditLogsQuery,
} = leaveApi;
