// src/pages/UploadPage/FileDropzone.tsx
import { type ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "../../components/ui";

interface FileDropzoneProps {
  fileName: string;
  busy: boolean;
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
}

export function FileDropzone({
  fileName,
  busy,
  onFileSelect,
  onDownloadTemplate,
}: FileDropzoneProps) {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.currentTarget.value = "";
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 px-6 py-10 text-center hover:bg-teal-50 transition-colors">
        <UploadCloud className="text-teal-700" size={32} />
        <p className="mt-3 font-semibold text-slate-800">
          {fileName || "Select attendance file"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Excel (.xls, .xlsx) or CSV. The file is previewed before import.
        </p>
        <input
          type="file"
          accept=".xls,.xlsx,.csv"
          className="hidden"
          onChange={handleInputChange}
        />
        <span className="mt-4">
          <Button type="button" disabled={busy}>
            {busy ? "Reading…" : "Choose file"}
          </Button>
        </span>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onDownloadTemplate}>
          Download template
        </Button>
      </div>
    </div>
  );
}