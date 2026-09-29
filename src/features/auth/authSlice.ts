// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/types";

export const KEYS = {
  access: "rica-api-access-token",
  refresh: "rica-api-refresh-token",
  user: "rica-api-user",
  force: "rica-api-force-password-change",
} as const;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  mustChangePassword: boolean;
}

function read(key: string, storage: Storage = localStorage): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function load(): AuthState {
  let user: User | null = null;
  try {
    const raw = read(KEYS.user);
    user = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    user = null;
  }
  const accessToken = read(KEYS.access);

  return {
    user: accessToken ? user : null,
    accessToken,
    refreshToken: read(KEYS.refresh),
    mustChangePassword: read(KEYS.force, sessionStorage) === "1",
  };
}

/** Mirror auth state changes to browser storage */
export function persistAuth(state: AuthState) {
  try {
    if (state.accessToken) {
      localStorage.setItem(KEYS.access, state.accessToken);
    } else {
      localStorage.removeItem(KEYS.access);
    }

    if (state.refreshToken) {
      localStorage.setItem(KEYS.refresh, state.refreshToken);
    } else {
      localStorage.removeItem(KEYS.refresh);
    }

    if (state.user) {
      localStorage.setItem(KEYS.user, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(KEYS.user);
    }

    if (state.mustChangePassword) {
      sessionStorage.setItem(KEYS.force, "1");
    } else {
      sessionStorage.removeItem(KEYS.force);
    }
  } catch {
    /* fallback to in-memory session if storage fails */
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: load,
  reducers: {
    setCredentials(
      state,
      {
        payload,
      }: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken?: string | null;
        mustChangePassword?: boolean;
      }>
    ) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken ?? state.refreshToken;
      state.mustChangePassword = payload.mustChangePassword ?? false;
      persistAuth(state);
    },
    setUser(state, { payload }: PayloadAction<User>) {
      state.user = payload;
      persistAuth(state);
    },
    setAccessToken(state, { payload }: PayloadAction<string>) {
      state.accessToken = payload;
      persistAuth(state);
    },
    passwordChanged(state) {
      state.mustChangePassword = false;
      persistAuth(state);
    },
    loggedOut(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.mustChangePassword = false;
      persistAuth(state);
    },
  },
});

export const {
  setCredentials,
  setUser,
  setAccessToken,
  passwordChanged,
  loggedOut,
} = authSlice.actions;

export default authSlice.reducer;