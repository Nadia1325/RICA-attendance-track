// src/pages/UploadPage/UrlImportForm.tsx
import { Link as LinkIcon } from "lucide-react";
import { Button } from "../../components/ui";

interface UrlImportFormProps {
  url: string;
  busy: boolean;
  onUrlChange: (value: string) => void;
  onLoadUrl: () => void;
}

export function UrlImportForm({
  url,
  busy,
  onUrlChange,
  onLoadUrl,
}: UrlImportFormProps) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <LinkIcon size={17} className="text-teal-700" />
        <h3 className="font-semibold text-slate-800">Import from URL</h3>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/attendance.xlsx"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-600/20"
        />
        <Button
          type="button"
          onClick={onLoadUrl}
          disabled={busy || !url.trim()}
        >
          {busy ? "Loading…" : "Load URL"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        The source must allow browser CORS access. After preview, the file is
        uploaded to the RICA server for validation.
      </p>
    </div>
  );
}
