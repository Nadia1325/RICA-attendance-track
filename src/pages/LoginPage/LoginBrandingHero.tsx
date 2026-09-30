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
    <div className="text-white space-y-6">
      <div className="flex items-center gap-4">
        <RwandaEmblem className="h-20 w-auto filter drop-shadow-md sm:h-24" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-rica-400">
            Republic of Rwanda
          </p>
          <p className="mt-1 text-lg font-bold leading-tight sm:text-xl text-slate-100">
            Attendance Tracking &amp; Management
          </p>
        </div>
      </div>

      <h1 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-[1.15]">
        Centralized attendance for every office, shift, and fingerprint device.
      </h1>

      <p className="max-w-xl text-base text-slate-300 leading-relaxed">
        Import daily device exports, resolve anomalies, record leave, and
        deliver an 8-column director report without spreadsheet work.
      </p>

      <ul className="grid gap-3 text-sm text-slate-200 sm:grid-cols-2 pt-2">
        {FEATURE_HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:border-rica-500/40 hover:bg-slate-800/80"
          >
            <span className="h-2 w-2 rounded-full bg-rica-500 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
