// src/features/attendance/attendanceApi.ts
import { apiSlice } from "../api/apiSlice";
import type {
  AttendanceFinal,
  AttendanceRaw,
  Anomaly,
  UploadBatch,
} from "../../types/types";

export interface AttendanceResponse {
  raw: AttendanceRaw[];
  finals: AttendanceFinal[];
  anomalies: Anomaly[];
}

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAttendance: builder.query<AttendanceResponse, { startDate?: string; endDate?: string; departmentId?: string } | void>({
      query: (params) => ({
        url: "/attendance",
        params: params || {},
      }),
      providesTags: ["Attendance", "Anomaly"],
    }),

    getBatches: builder.query<UploadBatch[], void>({
      query: () => "/attendance/batches",
      providesTags: ["Batch"],
    }),

    uploadAttendanceBatch: builder.mutation<UploadBatch, FormData>({
      query: (formData) => ({
        url: "/attendance/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Attendance", "Batch", "Anomaly"],
    }),

    resolveAnomaly: builder.mutation<Anomaly, { id: string; note: string }>({
      query: ({ id, note }) => ({
        url: `/attendance/anomalies/${id}/resolve`,
        method: "PATCH",
        body: { note },
      }),
      invalidatesTags: ["Anomaly", "Attendance"],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetBatchesQuery,
  useUploadAttendanceBatchMutation,
  useResolveAnomalyMutation,
} = attendanceApi;