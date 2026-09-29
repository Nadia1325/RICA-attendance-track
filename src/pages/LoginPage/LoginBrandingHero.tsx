// src/pages/LoginPage/LoginBrandingHero.tsx
import { RwandaEmblem } from "../../components/Brand";

const FEATURE_HIGHLIGHTS = [
  "20-column raw import",
  "Anomaly review queue",
  "Leave → LV status",
  "Attendance & punctuality KPIs",
  "Role-based access",
  "Full audit trail",
] as const;

export function LoginBrandingHero() {
  return (
    <div className="text-white">
      <div className="mb-8 flex items-center gap-4">
        <RwandaEmblem className="h-24 w-auto sm:h-28" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-200">
            Republic of Rwanda
          </p>
          <p className="mt-1 text-lg font-semibold leading-snug sm:text-xl">
            Attendance Tracking &amp; Management
          </p>
        </div>
      </div>
      <h1 className="max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
        Centralized attendance for every office, shift, and fingerprint device.
      </h1>
      <p className="mt-4 max-w-lg text-teal-100/80">
        Import daily device exports, resolve anomalies, record leave, and
        deliver an 8-column director report without spreadsheet work.
      </p>
      <ul className="mt-8 grid gap-3 text-sm text-teal-50/90 sm:grid-cols-2">
        {FEATURE_HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}