

import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronRight, Info, ListFilter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThreeDotsMenu, { ThreeDotsMenuItem } from "./ThreeDotsMenu";

export type TableCell = {
  value: React.ReactNode;
  subValue?: React.ReactNode;
  muted?: boolean;
};

export type TableStatus = {
  label: string;
  tone: "green" | "gray" | "blue" | "red";
};

export type TableColumn = {
  key: string;
  label: string;
  width?: string;
  info?: boolean;
  align?: "left" | "center";
};

export type TableRow = {
  id: string;
  type?: "group";
  href?: string;
  cells: Record<string, React.ReactNode | TableCell | TableStatus>;
  children?: TableRow[];
  menuItems?: ThreeDotsMenuItem[];
};

function isCell(value: React.ReactNode | TableCell | TableStatus): value is TableCell {
  return Boolean(value && typeof value === "object" && "value" in value);
}

function isStatus(value: React.ReactNode | TableCell | TableStatus): value is TableStatus {
  return Boolean(value && typeof value === "object" && "tone" in value && "label" in value);
}

function StatusPill({ status }: { status: TableStatus }) {
  const tone = {
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
    gray:  "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300",
    blue:  "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300",
    red:   "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400",
  }[status.tone];

  const dot = {
    green: "bg-emerald-500",
    gray:  "bg-slate-400",
    blue:  "bg-blue-500",
    red:   "bg-red-500",
  }[status.tone];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {status.label}
    </span>
  );
}

function CellContent({ value }: { value: React.ReactNode | TableCell | TableStatus }) {
  if (isStatus(value)) return <StatusPill status={value} />;

  if (isCell(value)) {
    return (
      <div className="min-w-0">
        <div className="text-stone-900 dark:text-stone-100">
          {value.value}
        </div>
        {value.subValue ? (
          <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {value.subValue}
          </div>
        ) : null}
      </div>
    );
  }

  return <>{value}</>;
}

export type FilterGroup = {
  label: string;
  options: { key: string; label: string; icon?: React.ReactNode }[];
};

export type FilterConfig = {
  sortFields?: string[];
  groups?: FilterGroup[];
};

export default function DashboardTable({
  columns,
  rows,
  action,
  searchPlaceholder = "Search",
  emptyState,
  menuItems,
  actionsLabel,
  onRowClick,
  filterConfig,
  hideToolbar = false,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  action?: React.ReactNode;
  searchPlaceholder?: string;
  emptyState?: React.ReactNode;
  menuItems?: ThreeDotsMenuItem[];
  actionsLabel?: string;
  onRowClick?: (row: TableRow) => void;
  filterConfig?: FilterConfig;
  hideToolbar?: boolean;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const hasFilter = !!(filterConfig?.sortFields?.length || filterConfig?.groups?.length);
  const activeCount = activeFilters.size + (sortField ? 1 : 0);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleRow(row: TableRow) {
    if (row.type !== "group" || !row.children?.length) return;
    setExpanded((current) => ({ ...current, [row.id]: !current[row.id] }));
  }

  function handleRowClick(row: TableRow) {
    if (row.type === "group") {
      toggleRow(row);
      return;
    }
    if (onRowClick) {
      onRowClick(row);
      return;
    }
    if (row.href) navigate(row.href);
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {!hideToolbar && <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative w-full max-w-70 min-w-35">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-stone-700 dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
          <div ref={filterRef} className="relative">
            <button
              onClick={() => hasFilter && setFilterOpen((o) => !o)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 text-xs font-medium transition-colors
                ${activeCount > 0
                  ? "border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-700 dark:bg-white/3 dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100"
                }
                ${!hasFilter ? "opacity-40 cursor-default" : "cursor-pointer"}`}
            >
              <ListFilter size={13} />
              Filter
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>

            {filterOpen && filterConfig && (
              <div
                className="absolute left-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl animate-card-in overflow-hidden"
                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {/* Sort by */}
                {filterConfig.sortFields && filterConfig.sortFields.length > 0 && (
                  <div className="px-3 pt-3 pb-2">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Sort by</p>
                    <div className="space-y-0.5">
                      {filterConfig.sortFields.map((field) => {
                        const active = sortField === field;
                        return (
                          <button
                            key={field}
                            onClick={() => {
                              if (active) setSortDir((d) => d === "asc" ? "desc" : "asc");
                              else { setSortField(field); setSortDir("asc"); }
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors
                              ${active ? "bg-stone-100 text-stone-900 dark:bg-white/8 dark:text-stone-100" : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"}`}
                          >
                            <span>{field}</span>
                            {active && (
                              <span className="text-xs font-semibold text-stone-400 dark:text-stone-500">
                                {sortDir === "asc" ? "A-Z" : "Z-A"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filter groups */}
                {filterConfig.groups?.map((group, gi) => (
                  <div key={group.label} className={`px-3 pb-2 ${gi === 0 && filterConfig.sortFields?.length ? "pt-2 border-t" : "pt-3"}`} style={gi === 0 && filterConfig.sortFields?.length ? { borderColor: "var(--border)" } : {}}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">{group.label}</p>
                    <div className="space-y-0.5">
                      {group.options.map((opt) => {
                        const active = activeFilters.has(opt.key);
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setActiveFilters((prev) => {
                              const next = new Set(prev);
                              active ? next.delete(opt.key) : next.add(opt.key);
                              return next;
                            })}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                          >
                            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${active ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-stone-600"}`}>
                              {active && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </span>
                            {opt.icon && <span className="text-stone-400 dark:text-stone-500">{opt.icon}</span>}
                            <span className={active ? "text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Clear all */}
                {activeCount > 0 && (
                  <div className="border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => { setActiveFilters(new Set()); setSortField(null); setFilterOpen(false); }}
                      className="w-full text-center text-xs font-medium text-blue-500 transition-colors hover:text-blue-600 py-0.5"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>}
      {hideToolbar && action && <div className="mb-3 flex justify-end shrink-0">{action}</div>}
      <div
        className="flex-1 min-h-0 overflow-hidden rounded-xl flex flex-col"
        style={{
          border: "1px solid var(--border)",
          background: "var(--content-bg)",
        }}
      >
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-stone-50 dark:bg-white/[0.035]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-r border-stone-200/80 px-4 py-3 text-xs font-semibold text-slate-500 last:border-r-0 dark:border-stone-700/70 dark:text-slate-400 ${column.align === "center" ? "text-center" : ""}`}
                  style={{ width: column.width }}
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    {column.label}
                    {column.info ? <Info size={12} className="text-slate-400" /> : null}
                  </span>
                </th>
              ))}
              <th className="border-b border-stone-200/80 px-3 py-3 text-xs font-semibold text-slate-500 dark:border-stone-700/70 dark:text-slate-400" style={{ width: 44, minWidth: 44 }}>
                {actionsLabel ?? ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="h-36 border-b border-stone-200/70 px-4 py-8 text-center text-sm font-medium text-slate-500 dark:border-stone-700/60 dark:text-slate-400"
                >
                  {emptyState ?? "No items yet."}
                </td>
              </tr>
            ) : rows.map((row) => {
              const isGroup = row.type === "group" && Boolean(row.children?.length);
              const isExpanded = Boolean(expanded[row.id]);

              return (
                <Fragment key={row.id}>
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`group hover:bg-stone-50/70 dark:hover:bg-white/[0.03] ${isGroup || row.href || onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {columns.map((column, index) => (
                      <td
                        key={column.key}
                        className={`border-b border-r border-stone-200/70 px-4 py-3 text-sm font-medium text-stone-900 last:border-r-0 dark:border-stone-700/60 dark:text-stone-100 ${column.align === "center" ? "text-center" : ""}`}
                      >
                        <div className={`${column.align === "center" ? "flex justify-center" : index === 0 ? "flex items-center gap-2" : ""}`}>
                          {index === 0 && isGroup ? (
                            <ChevronRight size={14} className={`shrink-0 text-stone-500 transition-transform dark:text-stone-400 ${isExpanded ? "rotate-90" : ""}`} />
                          ) : null}
                          <CellContent value={row.cells[column.key] ?? "--"} />
                        </div>
                      </td>
                    ))}
                    <td className="border-b border-stone-200/70 px-3 py-3 dark:border-stone-700/60" style={{ width: 44, minWidth: 44 }}>
                      <div className="flex items-center justify-center">
                        <ThreeDotsMenu items={row.menuItems ?? menuItems} />
                      </div>
                    </td>
                  </tr>
                  {isGroup && isExpanded
                    ? row.children!.map((child) => (
                        <tr key={child.id} className="bg-stone-50/50 hover:bg-stone-50 dark:bg-white/[0.018] dark:hover:bg-white/[0.035]">
                          {columns.map((column, index) => (
                            <td
                              key={column.key}
                              className="border-b border-r border-stone-200/70 px-4 py-3 text-sm font-medium text-stone-900 last:border-r-0 dark:border-stone-700/60 dark:text-stone-100"
                            >
                              <div className={index === 0 ? "pl-6" : ""}>
                                <CellContent value={child.cells[column.key] ?? ""} />
                              </div>
                            </td>
                          ))}
                          <td className="border-b border-stone-200/70 px-3 py-3 dark:border-stone-700/60" />
                        </tr>
                      ))
                    : null}
                </Fragment>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
