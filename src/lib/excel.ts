// src/lib/excel.ts
import * as XLSX from "xlsx";
import type { AttendanceRaw } from "../types/types";
import { RAW_HEADERS } from "./utils";

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parses an uploaded Excel array buffer into raw attendance records on the client side.
 * Useful for pre-upload preview or validation before submitting to the backend via RTK Query.
 */
export function parseRawWorkbook(buffer: ArrayBuffer, batchId: string): AttendanceRaw[] {
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });
  if (!wb.SheetNames.length) throw new Error("The workbook contains no sheets.");

  let rows: (string | number | Date)[][] = [];
  let header: string[] = [];
  let headerRowIndex = -1;

  for (const sheetName of wb.SheetNames) {
    const sheetRows = XLSX.utils.sheet_to_json<(string | number | Date)[]>(
      wb.Sheets[sheetName],
      { header: 1, defval: "", raw: false },
    );
    const candidateIndex = sheetRows.findIndex((row) =>
      row.some((value) => String(value).trim() === "Person ID"),
    );
    if (candidateIndex >= 0) {
      rows = sheetRows;
      headerRowIndex = candidateIndex;
      header = rows[headerRowIndex].map((h) => String(h).trim());
      break;
    }
  }

  if (headerRowIndex < 0) {
    throw new Error("Could not locate the attendance header row.");
  }

  const missing = RAW_HEADERS.filter((h) => !header.includes(h));
  if (missing.length) {
    throw new Error(`Missing columns: ${missing.join(", ")}`);
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const records: AttendanceRaw[] = [];

  rows.slice(headerRowIndex + 1).forEach((row, i) => {
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

/**
 * Triggers a browser download of the standard Excel attendance import template.
 */
export function downloadImportTemplate(): void {
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

/**
 * Generates and downloads an Excel file from JSON array data.
 */
export function exportWorkbook(filename: string, rows: Record<string, unknown>[]): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}