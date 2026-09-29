// src/services/referenceApi.ts
import { baseApi } from "./baseApi";
import { asArray, minutesBetween, type ApiRow } from "./mappers";

export const referenceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDepartments: build.query<ApiRow[], void>({
      query: () => "/api/departments",
      transformResponse: (r: unknown) =>
        asArray(Array.isArray(r) ? r : (r as ApiRow)?.departments),
      providesTags: ["Department"],
    }),
    addDepartment: build.mutation<ApiRow, { name: string; office: string }>({
      query: (body) => ({
        url: "/api/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),
    updateDepartment: build.mutation<
      ApiRow,
      { id: string; name?: string; office?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/departments/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Department"],
    }),

    getEmployees: build.query<ApiRow[], void>({
      query: () => "/api/employees",
      transformResponse: asArray,
      providesTags: ["Employee"],
    }),

    getShifts: build.query<ApiRow[], void>({
      query: () => "/api/shifts",
      transformResponse: asArray,
      providesTags: ["Shift"],
    }),
    addShift: build.mutation<
      ApiRow,
      { name: string; startTime: string; endTime: string }
    >({
      query: (s) => ({
        url: "/api/shifts",
        method: "POST",
        body: {
          name: s.name,
          start_time: s.startTime,
          end_time: s.endTime,
          work_minutes: minutesBetween(s.startTime, s.endTime),
        },
      }),
      invalidatesTags: ["Shift"],
    }),
    updateShift: build.mutation<
      ApiRow,
      {
        id: string;
        name?: string;
        startTime?: string;
        endTime?: string;
        currentStart?: string;
        currentEnd?: string;
      }
    >({
      query: ({ id, name, startTime, endTime, currentStart, currentEnd }) => {
        const start = startTime ?? currentStart;
        const end = endTime ?? currentEnd;
        return {
          url: `/api/shifts/${encodeURIComponent(id)}`,
          method: "PATCH",
          body: {
            ...(name ? { name } : {}),
            ...(start ? { start_time: start } : {}),
            ...(end ? { end_time: end } : {}),
            ...(start && end
              ? { work_minutes: minutesBetween(start, end) }
              : {}),
          },
        };
      },
      invalidatesTags: ["Shift"],
    }),

    getHolidays: build.query<ApiRow[], void>({
      query: () => "/api/holidays",
      transformResponse: asArray,
      providesTags: ["Holiday"],
    }),
    addHoliday: build.mutation<
      ApiRow,
      { name: string; date: string; type: "Public" | "Organizational" }
    >({
      query: (h) => ({
        url: "/api/holidays",
        method: "POST",
        body: {
          name: h.name,
          date: h.date,
          is_recurring: h.type === "Organizational",
        },
      }),
      invalidatesTags: ["Holiday"],
    }),
    deleteHoliday: build.mutation<unknown, string>({
      query: (id) => ({
        url: `/api/holidays/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useGetEmployeesQuery,
  useGetShiftsQuery,
  useAddShiftMutation,
  useUpdateShiftMutation,
  useGetHolidaysQuery,
  useAddHolidayMutation,
  useDeleteHolidayMutation,
} = referenceApi;