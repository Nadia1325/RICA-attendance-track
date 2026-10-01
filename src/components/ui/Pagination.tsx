import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (total <= pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <span>
        Showing {Math.min((page - 1) * pageSize + 1, total)}-
        {Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="px-2"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="min-w-16 text-center text-xs font-semibold">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          className="px-2"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
