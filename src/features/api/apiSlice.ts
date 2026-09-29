// src/features/api/apiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { KEYS } from "../auth/authSlice";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(KEYS.access);
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Attendance", "Employee", "Department", "Unit", "Leave", "Anomaly", "Batch", "AuditLog"],
  endpoints: () => ({}),
});