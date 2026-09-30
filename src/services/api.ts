// src/services/api.ts
// Re-export everything from services/index so legacy imports work.
export * from "./index";
// src/services/api.ts
export { useGetRawAttendanceQuery } from "./attendanceApi";


export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  return fallback;
}
