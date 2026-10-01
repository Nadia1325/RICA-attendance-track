// src/services/adminApi.ts
import { baseApi } from "./baseApi";
import { asArray, type ApiRow } from "./mappers";

export interface CreateUserArgs {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
}

export interface UpdateUserArgs {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  departmentId?: string | null;
  active?: boolean;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<ApiRow[], void>({
      query: () => "/users",
      transformResponse: (r: unknown) =>
        asArray(Array.isArray(r) ? r : (r as ApiRow)?.users),
      providesTags: ["User"],
    }),

    getUser: build.query<ApiRow, string>({
      query: (id) => `/users/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    createUser: build.mutation<ApiRow, CreateUserArgs>({
      query: (u) => ({
        url: "/users",
        method: "POST",
        body: {
          full_name: u.name,
          username: u.username,
          email: u.email,
          temp_password: u.password,
          role: u.role.toUpperCase(),
          ...(u.departmentId ? { department_id: u.departmentId } : {}),
        },
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: build.mutation<ApiRow, UpdateUserArgs>({
      query: ({ id, name, email, role, departmentId, active }) => ({
        url: `/users/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: {
          ...(name !== undefined ? { full_name: name } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(role !== undefined ? { role: role.toUpperCase() } : {}),
          ...(departmentId !== undefined
            ? { department_id: departmentId }
            : {}),
          ...(active !== undefined ? { is_active: active } : {}),
        },
      }),
      invalidatesTags: ["User"],
    }),

    resetUserPassword: build.mutation<
      unknown,
      { id: string; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/users/${encodeURIComponent(id)}/reset-password`,
        method: "POST",
        body: { new_password: newPassword },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
} = adminApi;
