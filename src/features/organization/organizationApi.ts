// src/features/organization/organizationApi.ts
import { apiSlice } from "../api/apiSlice";
import type { Employee, Department, Unit, Shift } from "../../types/types";

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<Employee[], void>({
      query: () => "/employees",
      providesTags: ["Employee"],
    }),

    getDepartments: builder.query<Department[], void>({
      query: () => "/departments",
      providesTags: ["Department"],
    }),

    getUnits: builder.query<Unit[], { departmentId?: string } | void>({
      query: (params) => ({
        url: "/units",
        params: params || {},
      }),
      providesTags: ["Unit"],
    }),

    getShifts: builder.query<Shift[], void>({
      query: () => "/shifts",
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetDepartmentsQuery,
  useGetUnitsQuery,
  useGetShiftsQuery,
} = organizationApi;