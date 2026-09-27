import * as XLSX from "xlsx";
import type { AttendanceRaw } from "../types";
import { RAW_HEADERS } from "./utils";

function cell(v: unknown) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseRawWorkbook(buffer: ArrayBuffer, batchId: string) {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  if (!rows.length) throw new Error("The workbook is empty.");
  const header = rows[0].map((h) => String(h).trim());
  const missing = RAW_HEADERS.filter((h) => !header.includes(h));
  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(", ")}`);
  }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const records: AttendanceRaw[] = [];
  rows.slice(1).forEach((row, i) => {
    const personId = cell(row[idx["Person ID"]]);
    const name = cell(row[idx["Name"]]);
    if (!personId && !name) return;
    records.push({
      id: `${batchId}-${i + 1}`,
      batchId,
      no: num(row[idx["No."]]) || i + 1,
      personId,
      name,
      department: cell(row[idx["Department"]]),
      position: cell(row[idx["Position"]]),
      gender: cell(row[idx["Gender"]]),
      date: cell(row[idx["Date"]]).slice(0, 10),
      week: cell(row[idx["Week"]]),
      timetable: cell(row[idx["Timetable"]]),
      checkIn: cell(row[idx["Check-in"]]),
      checkOut: cell(row[idx["Check-out"]]),
      work: num(row[idx["Work"]]),
      ot: num(row[idx["OT"]]),
      attended: num(row[idx["Attended"]]),
      late: num(row[idx["Late"]]),
      early: num(row[idx["Early"]]),
      absent: num(row[idx["Absent"]]),
      leave: num(row[idx["Leave"]]),
      status: cell(row[idx["Status"]]),
      records: cell(row[idx["Records"]]),
    });
  });
  return records;
}

export function downloadImportTemplate() {
  const header = [...RAW_HEADERS];
  const sample = [
    1,
    "RICA-1999",
    "Sample Employee",
    "ICT",
    "Analyst",
    "Female",
    "2026-09-24",
    "Thu",
    "08:00-17:00",
    "07:58",
    "17:04",
    480,
    0,
    480,
    0,
    0,
    0,
    0,
    "Attended",
    "07:58,17:04",
  ];
  const ws = XLSX.utils.aoa_to_sheet([header, sample]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, "RICA_attendance_import_template.xlsx");
}

export function exportWorkbook(filename: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}
