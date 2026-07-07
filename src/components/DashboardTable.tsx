

import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronRight, Info, LayoutGrid, ListFilter, Search, Trash2 } from "lucide-react";
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
  tooltip?: string;
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

function ColInfoBtn({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="flex h-3.5 w-3.5 cursor-default select-none items-center justify-center rounded-full bg-stone-200/80 text-stone-400 transition-colors hover:bg-stone-300/60 dark:bg-white/10 dark:text-stone-500 dark:hover:bg-white/18">
        <Info size={9} />
      </span>
      {show && (
        <span
          className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-200 w-max max-w-52 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs font-normal leading-relaxed whitespace-normal text-white shadow-lg"
          style={{ background: "rgba(24,24,27,0.93)", backdropFilter: "blur(4px)" }}
        >
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderBottomColor: "rgba(24,24,27,0.93)" }}
          />
          {text}
        </span>
      )}
    </span>
  );
}

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
  selectable = false,
  onDeleteSelected,
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
  selectable?: boolean;
  onDeleteSelected?: (ids: string[]) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [colSearch, setColSearch] = useState("");
  const navigate = useNavigate();

  const hasFilter = !!(filterConfig?.sortFields?.length || filterConfig?.groups?.length);
  const activeCount = activeFilters.size + (sortField ? 1 : 0);
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (columnsRef.current && !columnsRef.current.contains(e.target as Node)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (!selectable || !selectAllRef.current) return;
    const visibleCount = rows.filter((r) => selected.has(r.id)).length;
    selectAllRef.current.indeterminate = visibleCount > 0 && visibleCount < rows.length;
  }, [selected, rows, selectable]);

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
      {!hideToolbar && <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input) dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
          <div ref={filterRef} className="relative">
            <button
              onClick={() => hasFilter && setFilterOpen((o) => !o)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-sm font-medium transition-colors
                ${activeCount > 0
                  ? "border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100"
                }
                ${!hasFilter ? "opacity-40 cursor-default" : "cursor-pointer"}`}
            >
              <ListFilter size={13} />
              <span className="hidden sm:inline">Filter</span>
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>

            {filterOpen && filterConfig && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl animate-card-in overflow-hidden"

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
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors
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
                            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${active ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
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

          <div ref={columnsRef} className="relative">
            <button
              onClick={() => setColumnsOpen((o) => !o)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-sm font-medium transition-colors
                ${hiddenCols.size > 0
                  ? "border-stone-200 bg-blue-50 text-blue-600 dark:border-(--border) dark:bg-blue-500/10 dark:text-blue-400"
                  : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100"
                }`}
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Columns ({visibleColumns.length})</span>
              <span className="sm:hidden text-xs">{visibleColumns.length}</span>
            </button>

            {columnsOpen && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-xl animate-card-in overflow-hidden"
                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <div className="px-3 pt-3 pb-2">
                  <div className="relative">
                    <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      value={colSearch}
                      onChange={(e) => setColSearch(e.target.value)}
                      placeholder="Search columns..."
                      className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-7 pr-2.5 text-xs font-medium text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-200 dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto pb-2">
                  {columns
                    .filter((c) => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase()))
                    .map((col) => {
                      const visible = !hiddenCols.has(col.key);
                      return (
                        <button
                          key={col.key}
                          onClick={() => setHiddenCols((prev) => {
                            const next = new Set(prev);
                            visible ? next.add(col.key) : next.delete(col.key);
                            return next;
                          })}
                          className="flex w-full items-center justify-between px-3.5 py-2 text-left text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                        >
                          <span className={visible ? "text-stone-700 dark:text-stone-300" : "text-stone-400 dark:text-stone-500"}>{col.label}</span>
                          <span className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${visible ? "bg-blue-500" : "bg-stone-200 dark:bg-white/15"}`}>
                            <span className={`h-3 w-3 rounded-full bg-white shadow transition-transform ${visible ? "translate-x-3.5" : "translate-x-0.5"}`} />
                          </span>
                        </button>
                      );
                    })}
                </div>
                {hiddenCols.size > 0 && (
                  <div className="border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => { setHiddenCols(new Set()); setColSearch(""); }}
                      className="w-full py-0.5 text-center text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
                    >
                      Show all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {action ? <div className="shrink-0 ml-auto">{action}</div> : null}
      </div>}
      {hideToolbar && action && <div className="mb-3 flex justify-end shrink-0">{action}</div>}
      {selectable && selected.size > 0 && (() => {
        const visibleSelected = rows.filter((r) => selected.has(r.id));
        if (!visibleSelected.length) return null;
        return (
          <div
            className="mb-3 flex shrink-0 items-center justify-between rounded-xl border px-4 py-2.5"
            style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
          >
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              {visibleSelected.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="inline-flex h-8 items-center rounded-lg border px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/6 dark:hover:text-stone-200"
                style={{ borderColor: "var(--border)" }}
              >
                Clear
              </button>
              <button
                onClick={() => {
                  onDeleteSelected?.(visibleSelected.map((r) => r.id));
                  setSelected(new Set());
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <Trash2 size={13} />
                Delete {visibleSelected.length}
              </button>
            </div>
          </div>
        );
      })()}
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
            <tr style={{ background: "var(--muted)" }}>
              {selectable && (
                <th className="border-b border-r px-3 py-3" style={{ width: 44, minWidth: 44, borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-center">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={rows.length > 0 && rows.every((r) => selected.has(r.id))}
                      onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                      className="h-4 w-4 cursor-pointer rounded accent-blue-500"
                    />
                  </div>
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`border-b border-r px-4 py-3 text-xs font-semibold text-slate-500 last:border-r-0 dark:text-slate-400 ${column.align === "center" ? "text-center" : ""}`}
                  style={{ width: column.width, borderColor: "var(--border)" }}
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    {column.label}
                    <ColInfoBtn text={column.tooltip ?? column.label} />
                  </span>
                </th>
              ))}
              <th className="border-b px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400" style={{ width: 44, minWidth: 44, borderColor: "var(--border)" }}>
                {actionsLabel ?? ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1 + (selectable ? 1 : 0)}
                  className="h-36 border-b border-(--border) px-4 py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  {emptyState ?? "No items yet."}
                </td>
              </tr>
            ) : rows.map((row) => {
              const isGroup = row.type === "group" && Boolean(row.children?.length);
              const isExpanded = Boolean(expanded[row.id]);
              const isSelected = selectable && selected.has(row.id);

              return (
                <Fragment key={row.id}>
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`group ${isSelected ? "bg-blue-50/60 dark:bg-blue-500/8" : "hover:bg-stone-50/70 dark:hover:bg-white/3"} ${isGroup || row.href || onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {selectable && (
                      <td
                        className="border-b border-r border-(--border) px-3 py-3"
                        style={{ width: 44, minWidth: 44 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const next = new Set(selected);
                              e.target.checked ? next.add(row.id) : next.delete(row.id);
                              setSelected(next);
                            }}
                            className="h-4 w-4 cursor-pointer rounded accent-blue-500"
                          />
                        </div>
                      </td>
                    )}
                    {visibleColumns.map((column, index) => (
                      <td
                        key={column.key}
                        className={`border-b border-r border-(--border) px-4 py-3 text-sm font-medium text-stone-900 last:border-r-0 dark:text-stone-100 ${column.align === "center" ? "text-center" : ""}`}
                      >
                        <div className={`${column.align === "center" ? "flex justify-center" : index === 0 ? "flex items-center gap-2" : ""}`}>
                          {index === 0 && isGroup ? (
                            <ChevronRight size={14} className={`shrink-0 text-stone-500 transition-transform dark:text-stone-400 ${isExpanded ? "rotate-90" : ""}`} />
                          ) : null}
                          <CellContent value={row.cells[column.key] ?? "--"} />
                        </div>
                      </td>
                    ))}
                    <td className="border-b border-(--border) px-3 py-3" style={{ width: 44, minWidth: 44 }}>
                      <div className="flex items-center justify-center">
                        <ThreeDotsMenu items={row.menuItems ?? menuItems} />
                      </div>
                    </td>
                  </tr>
                  {isGroup && isExpanded
                    ? row.children!.map((child) => (
                        <tr key={child.id} className="bg-stone-50/50 hover:bg-stone-50 dark:bg-(--muted) dark:hover:bg-white/6">
                          {visibleColumns.map((column, index) => (
                            <td
                              key={column.key}
                              className="border-b border-r border-(--border) px-4 py-3 text-sm font-medium text-stone-900 last:border-r-0 dark:text-stone-100"
                            >
                              <div className={index === 0 ? "pl-6" : ""}>
                                <CellContent value={child.cells[column.key] ?? ""} />
                              </div>
                            </td>
                          ))}
                          <td className="border-b border-(--border) px-3 py-3" />
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
