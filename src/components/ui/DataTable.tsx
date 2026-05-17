import { ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  title,
  description,
  toolbar,
  emptyTitle,
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  title: string;
  description?: string;
  toolbar?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [currentPage, data]);

  return (
    <div className="panel rounded-3xl">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {toolbar}
      </div>
      {data.length === 0 ? (
        <div className="p-6">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/90">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${
                        column.className ?? ""
                      }`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((item, rowIndex) => (
                  <tr key={rowIndex} className="transition hover:bg-slate-50/80">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-6 py-4 align-top text-sm text-slate-700 ${column.className ?? ""}`}>
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
            <span>{data.length} ta yozuv</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {currentPage} / {pages}
              </span>
              <button
                type="button"
                disabled={currentPage >= pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
                className="rounded-xl border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
