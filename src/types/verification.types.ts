import type { AttendanceFinal } from "../types/types";

export const STATUS_OPTIONS: AttendanceFinal["status"][] = [
  "Attended",
  "Absent",
  "LV",
  "Holiday",
  "Weekend",
];