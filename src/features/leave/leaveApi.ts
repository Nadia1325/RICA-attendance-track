// src/features/leave/leaveApi.ts
import { apiSlice } from "../api/apiSlice";
import type { LeaveEntry, Holiday, AuditLog } from "../../types/types";

export const leaveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<LeaveEntry[], void>({
      query: () => "/leaves",
      providesTags: ["Leave"],
    }),

    createLeave: builder.mutation<LeaveEntry, Partial<LeaveEntry>>({
      query: (body) => ({
        url: "/leaves",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leave"],
    }),

    getHolidays: builder.query<Holiday[], void>({
      query: () => "/holidays",
    }),

    getAuditLogs: builder.query<AuditLog[], { limit?: number } | void>({
      query: (params) => ({
        url: "/audit-logs",
        params: params || {},
      }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const {
  useGetLeavesQuery,
  useCreateLeaveMutation,
  useGetHolidaysQuery,
  useGetAuditLogsQuery,
} = leaveApi;