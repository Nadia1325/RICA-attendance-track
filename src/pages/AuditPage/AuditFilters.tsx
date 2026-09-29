// src/pages/AuditPage/AuditFilters.tsx
import { Input, Select } from "../../components/ui";

interface AuditFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedAction: string;
  onActionChange: (value: string) => void;
}

export function AuditFilters({
  searchQuery,
  onSearchChange,
  selectedAction,
  onActionChange,
}: AuditFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Input
        placeholder="Search by user, entity, or details…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        value={selectedAction}
        onChange={(e) => onActionChange(e.target.value)}
      >
        <option value="ALL">All actions</option>
        <option value="login">Login</option>
        <option value="upload">Upload</option>
        <option value="edit">Edit</option>
        <option value="export">Export</option>
        <option value="delete">Delete</option>
      </Select>
    </div>
  );
}