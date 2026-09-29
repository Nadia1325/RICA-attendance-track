// src/services/attendanceApi.ts
import { baseApi } from "./baseApi";
import { asArray, type ApiRow } from "./mappers";

const PAGE = 500;

export interface RawAttendanceFilterParams {
  date?: string;
  search?: string;
  department?: string;
}

export interface RawAttendanceItem {
  id: string | number;
  personId: string;
  name: string;
  department: string;
  position: string;
  gender: string;
  date: string;
  week: string;
  timetable: string;
  checkIn: string;
  checkOut: string;
  work: string;
  ot: string;
  attended: boolean | string;
  late: boolean | string;
  early: boolean | string;
  absent: boolean | string;
  leave: boolean | string;
  status: string;
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRawAttendance: build.query<ApiRow[], void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const rows: ApiRow[] = [];
        for (let skip = 0; skip < 20000; skip += PAGE) {
          const res = await baseQuery(
            `/api/attendance/raw?take=${PAGE}&skip=${skip}`
          );
          if (res.error) return { error: res.error };
          const page = asArray(res.data);
          rows.push(...page);
          if (page.length < PAGE) break;
        }
        return { data: rows };
      },
      providesTags: ["Raw"],
    }),

    getDailyAttendanceRaw: build.query<
      RawAttendanceItem[],
      RawAttendanceFilterParams | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params?.date) queryParams.append("date", params.date);
        if (params?.search) queryParams.append("search", params.search);
        if (params?.department && params.department !== "All departments") {
          queryParams.append("department", params.department);
        }

        const queryString = queryParams.toString();
        return `/api/attendance/daily${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (res: unknown) => {
        if (Array.isArray(res)) return res as RawAttendanceItem[];
        const r = res as { data?: RawAttendanceItem[]; records?: RawAttendanceItem[] };
        return r.data || r.records || [];
      },
      providesTags: ["Raw"],
    }),

    getFinalAttendance: build.query<ApiRow[], void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const rows: ApiRow[] = [];
        for (let skip = 0; skip < 20000; skip += PAGE) {
          const res = await baseQuery(
            `/api/attendance/final?take=${PAGE}&skip=${skip}`
          );
          if (res.error) return { error: res.error };
          const page = asArray(res.data);
          rows.push(...page);
          if (page.length < PAGE) break;
        }
        return { data: rows };
      },
      providesTags: ["Final"],
    }),

    getRawRecord: build.query<ApiRow, string>({
      query: (id) => `/api/attendance/raw/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Raw", id }],
    }),

    verifyRecord: build.mutation<unknown, { id: string; body: ApiRow }>({
      query: ({ id, body }) => ({
        url: `/api/attendance/raw/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Raw", "Final", "Anomaly", "Batch", "Report"],
    }),

    getAnomalies: build.query<ApiRow[], void>({
      query: () => "/api/attendance/anomalies?take=500",
      transformResponse: asArray,
      providesTags: ["Anomaly"],
    }),

    resolveAnomaly: build.mutation<unknown, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/api/attendance/anomalies/${encodeURIComponent(id)}/resolve`,
        method: "POST",
        body: { note: note ?? "" },
      }),
      invalidatesTags: ["Anomaly", "Batch"],
    }),

    getBatches: build.query<ApiRow[], void>({
      query: () => "/api/attendance/batches",
      transformResponse: asArray,
      providesTags: ["Batch"],
    }),

    getBatchAnomalies: build.query<ApiRow[], string>({
      query: (id) =>
        `/api/attendance/batches/${encodeURIComponent(id)}/anomalies`,
      transformResponse: asArray,
      providesTags: (_r, _e, id) => [{ type: "Anomaly", id }],
    }),

    uploadAttendance: build.mutation<ApiRow, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: "/api/attendance/upload",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Raw", "Final", "Anomaly", "Batch", "Report"],
    }),
  }),
});

export const {
  useGetRawAttendanceQuery,
  useGetDailyAttendanceRawQuery,
  useLazyGetDailyAttendanceRawQuery,
  useGetFinalAttendanceQuery,
  useGetRawRecordQuery,
  useVerifyRecordMutation,
  useGetAnomaliesQuery,
  useResolveAnomalyMutation,
  useGetBatchesQuery,
  useLazyGetBatchAnomaliesQuery,
  useUploadAttendanceMutation,
} = attendanceApi;