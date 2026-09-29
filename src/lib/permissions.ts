// src/lib/permissions.ts
import type { Role } from "../types/types";

export type Feature =
  | "upload"
  | "verify"
  | "leave"
  | "viewAll"
  | "viewDept"
  | "viewUnit"
  | "dailyReport"
  | "monthlyReport"
  | "kpis"
  | "manageUsers";

const matrix: Record<Feature, Role[]> = {
  upload: ["admin"],
  verify: ["admin"],
  leave: ["admin", "hod"],
  viewAll: ["admin", "director"],
  viewDept: ["admin", "hod", "director"],
  viewUnit: ["admin", "hod", "director"],
  dailyReport: ["admin", "hod", "director"],
  monthlyReport: ["admin", "hod", "director"],
  kpis: ["admin", "hod", "director"],
  manageUsers: ["admin"],
};

/**
 * Checks whether a user role has permission to access a specific feature.
 */
export function can(role: Role, feature: Feature): boolean {
  return matrix[feature]?.includes(role) ?? false;
}

/**
 * Returns a human-readable string indicating data visibility scope based on role.
 */
export function scopeLabel(role: Role): string {
  if (role === "admin" || role === "director") return "All departments";
  return "Own department";
}