import type { Role } from "../types";

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
  verify: ["admin", "hou"],
  leave: ["admin", "hou"],
  viewAll: ["admin", "director"],
  viewDept: ["admin", "hod", "hou", "director"],
  viewUnit: ["admin", "hod", "hou", "director"],
  dailyReport: ["admin", "hod", "hou", "director"],
  monthlyReport: ["admin", "hod", "hou", "director"],
  kpis: ["admin", "hod", "hou", "director"],
  manageUsers: ["admin"],
};

export function can(role: Role, feature: Feature) {
  return matrix[feature].includes(role);
}

export function scopeLabel(role: Role) {
  if (role === "admin" || role === "director") return "All departments";
  if (role === "hod") return "Own department";
  return "Own office/unit";
}
