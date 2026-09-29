// src/services/reportApi.ts
import { baseApi } from "./baseApi";
import type { ApiRow } from "./mappers";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDailyReport: build.query<{ rows?: ApiRow[] }, string>({
      query: (date) => `/api/reports/daily?date=${encodeURIComponent(date)}`,
      providesTags: ["Report"],
    }),
    getMonthlyReport: build.query<
      { rows?: ApiRow[] },
      { year: number; month: number }
    >({
      query: ({ year, month }) =>
        `/api/reports/monthly?year=${year}&month=${month}`,
      providesTags: ["Report"],
    }),
    getPeriodReport: build.query<
      { rows?: ApiRow[] },
      {
        period: "month" | "quarter" | "year";
        year: number;
        month: number;
        quarter: number;
      }
    >({
      query: ({ period, year, month, quarter }) =>
        period === "month"
          ? `/api/reports/monthly?year=${year}&month=${month}`
          : period === "quarter"
          ? `/api/reports/quarterly?year=${year}&quarter=${quarter}`
          : `/api/reports/yearly?year=${year}`,
      providesTags: ["Report"],
    }),
    getKpis: build.query<
      ApiRow,
      {
        period: "month" | "quarter" | "year";
        year: number;
        month: number;
        quarter: number;
      }
    >({
      query: ({ period, year, month, quarter }) =>
        `/api/reports/kpis?${
          period === "month"
            ? `year=${year}&month=${month}`
            : period === "quarter"
            ? `year=${year}&quarter=${quarter}`
            : `year=${year}`
        }`,
      providesTags: ["Report"],
    }),
    getMyDepartment: build.query<ApiRow, { from: string; to: string }>({
      query: ({ from, to }) =>
        `/api/reports/my-department?from=${from}&to=${to}`,
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useGetDailyReportQuery,
  useGetMonthlyReportQuery,
  useGetPeriodReportQuery,
  useGetKpisQuery,
  useGetMyDepartmentQuery,
} = reportApi;