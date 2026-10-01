// src/services/attendanceApi.ts
import { baseApi } from "./baseApi";
import { asArray, type ApiRow } from "./mappers";

const PAGE = 500;
// Fixed: Removed leading /api to prevent /api/api/ duplication
const RAW_URL = "/attendance/daily";

export interface RawAttendanceFilterParams {
  date?: string;
  search?: string;
  department?: string;
}
export interface RawAttendanceParams {
  date?: string;
  month?: string;
  year?: string;
  mode?: string;
  take?: number;
  skip?: number;
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
    getRawAttendance: build.query<ApiRow[], RawAttendanceParams | void>({
      async queryFn(arg, _api, _extra, baseQuery) {
        const filters = new URLSearchParams();
        if (arg?.date) filters.set("date", arg.date);
        if (arg?.month) filters.set("month", arg.month);
        if (arg?.year) filters.set("year", arg.year);

        const rows: ApiRow[] = [];
        for (let skip = 0; skip < 20000; skip += PAGE) {
          const qs = new URLSearchParams(filters);
          qs.set("take", String(PAGE));
          qs.set("skip", String(skip));
          const res = await baseQuery(`${RAW_URL}?${qs.toString()}`);
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
      RawAttendanceParams | void
    >({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.date) qs.set("date", params.date);
        if (params?.month) qs.set("month", params.month);
        if (params?.year) qs.set("year", params.year);
        if (params?.mode) qs.set("mode", params.mode);
        if (params?.take) qs.set("take", String(params.take));
        if (params?.skip) qs.set("skip", String(params.skip));

        const queryString = qs.toString();
        return `/attendance/daily${queryString ? `?${queryString}` : ""}`;
      },

      transformResponse: (res: any) => {
        if (Array.isArray(res)) return res;
        return res.data || res.records || res.items || [];
      },

      providesTags: ["Raw"],
    }),

    getFinalAttendance: build.query<ApiRow[], void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const rows: ApiRow[] = [];
        for (let skip = 0; skip < 20000; skip += PAGE) {
          const res = await baseQuery(
            `/attendance/final?take=${PAGE}&skip=${skip}`,
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
      // Fixed: Removed leading /api to match normalized base URL
      query: (id) => `/attendance/raw/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Raw", id }],
    }),

    verifyRecord: build.mutation<unknown, { id: string; body: ApiRow }>({
      query: ({ id, body }) => ({
        url: `/attendance/raw/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Raw", "Final", "Anomaly", "Batch", "Report"],
    }),

    getAnomalies: build.query<ApiRow[], void>({
      query: () => "/attendance/anomalies?take=500",
      transformResponse: asArray,
      providesTags: ["Anomaly"],
    }),

    resolveAnomaly: build.mutation<unknown, { id: string; note?: string }>({
      query: ({ id, note }) => ({
        url: `/attendance/anomalies/${encodeURIComponent(id)}/resolve`,
        method: "POST",
        body: { note: note ?? "" },
      }),
      invalidatesTags: ["Anomaly", "Batch"],
    }),

    getBatches: build.query<ApiRow[], void>({
      query: () => "/attendance/batches",
      transformResponse: asArray,
      providesTags: ["Batch"],
    }),

    getBatchAnomalies: build.query<ApiRow[], string>({
      query: (id) => `/attendance/batches/${encodeURIComponent(id)}/anomalies`,
      transformResponse: asArray,
      providesTags: (_r, _e, id) => [{ type: "Anomaly", id }],
    }),
    deleteBatch: build.mutation<unknown, string>({
      query: (id) => ({
        url: `/attendance/batches/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Batch", "Raw", "Final", "Anomaly", "Report"],
    }),

    uploadAttendance: build.mutation<ApiRow, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file, file.name);
        return {
          url: "/attendance/upload",
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
  useGetBatchAnomaliesQuery,
  useGetBatchesQuery,
  useDeleteBatchMutation,
  useLazyGetBatchAnomaliesQuery,
  useUploadAttendanceMutation,
} = attendanceApi;
