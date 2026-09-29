// src/services/authApi.ts
import { baseApi } from "./baseApi";
import type { ApiRow } from "./mappers";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<ApiRow, { identifier: string; password: string }>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body: { identifier: body.identifier.trim(), password: body.password },
      }),
    }),
    me: build.query<ApiRow, void>({
      query: () => "/api/auth/me",
      providesTags: ["Me"],
    }),
    logout: build.mutation<unknown, { refresh_token: string | null }>({
      query: (body) => ({
        url: "/api/auth/logout",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: build.mutation<
      { message?: string; dev_token?: string },
      { identifier: string }
    >({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPasswordWithToken: build.mutation<
      unknown,
      { token: string; new_password: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    changePassword: build.mutation<
      unknown,
      { current_password: string; new_password: string }
    >({
      query: (body) => ({
        url: "/api/auth/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordWithTokenMutation,
  useChangePasswordMutation,
} = authApi;