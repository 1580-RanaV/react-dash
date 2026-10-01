

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThreeDotsMenu, { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import InfoTooltip from "./InfoTooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow as UITableRow,
  TableHead as UITableHead,
  TableCell as UITableCell,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  rowActions?: React.ReactNode;
};

function isCell(value: React.ReactNode | TableCell | TableStatus): value is TableCell {
  return Boolean(value && typeof value === "object" && "value" in value);
}

function isStatus(value: React.ReactNode | TableCell | TableStatus): value is TableStatus {
  return Boolean(value && typeof value === "object" && "tone" in value && "label" in value);
}

const STATUS_TONE_VARS: Record<TableStatus["tone"], { bg: string; fg: string; dot: string }> = {
  green: { bg: "var(--success-background)",     fg: "var(--success)",     dot: "var(--success)" },
  gray:  { bg: "var(--muted)",                  fg: "var(--muted-foreground)", dot: "var(--icon)" },
  blue:  { bg: "var(--info-background)",        fg: "var(--info)",        dot: "var(--info)" },
  red:   { bg: "var(--destructive-background)", fg: "var(--destructive)", dot: "var(--destructive)" },
};

function StatusPill({ status }: { status: TableStatus }) {
  const tone = STATUS_TONE_VARS[status.tone];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: tone.dot }} />
      {status.label}
    </span>
  );
}

function CellContent({ value }: { value: React.ReactNode | TableCell | TableStatus }) {
  if (isStatus(value)) return <StatusPill status={value} />;

  if (isCell(value)) {
    return (
      <div className="min-w-0">
        <div className="text-foreground">
          {value.value}
        </div>
        {value.subValue ? (
          <div className="mt-1 text-xs font-medium text-(--muted-foreground)">
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
  single?: boolean;
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
  filterPanel,
  defaultActiveFilters,
  onFilterChange,
  onSortChange,
  hideToolbar = false,
  selectable = false,
  onDeleteSelected,
  sortControl,
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
  filterPanel?: React.ReactNode;
  defaultActiveFilters?: string[];
  onFilterChange?: (activeFilters: Set<string>) => void;
  onSortChange?: (field: string | null, dir: "asc" | "desc") => void;
  hideToolbar?: boolean;
  selectable?: boolean;
  onDeleteSelected?: (ids: string[]) => void;
  /** Overrides the built-in single-field Sort button with a custom control (e.g. a multi-sort menu). */
  sortControl?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(defaultActiveFilters ?? []));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const hasFilter = !!(filterConfig?.groups?.length);
  const hasSort = !!(filterConfig?.sortFields?.length);
  const singleGroupKeys = new Set(
    filterConfig?.groups?.filter((g) => g.single).flatMap((g) => g.options.map((o) => o.key)) ?? []
  );
  const activeCount = [...activeFilters].filter((k) => !singleGroupKeys.has(k)).length;
  const visibleColumns = columns.filter((c) => !hiddenCols.has(c.key));

  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const resizeRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const active = resizeRef.current;
      if (!active) return;
      const next = Math.max(50, active.startWidth + (e.clientX - active.startX));
      setColWidths((prev) => ({ ...prev, [active.key]: next }));
    }
    function onUp() {
      resizeRef.current = null;
      setResizingKey(null);
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  function startColumnResize(e: React.MouseEvent<HTMLDivElement>, key: string) {
    e.preventDefault();
    e.stopPropagation();
    const th = (e.currentTarget as HTMLElement).closest("th");
    const startWidth = th?.getBoundingClientRect().width ?? 150;
    resizeRef.current = { key, startX: e.clientX, startWidth };
    setResizingKey(key);
    document.body.style.userSelect = "none";
  }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
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
      {!hideToolbar && <div className={`flex shrink-0 flex-wrap items-center gap-4 ${filterPanelOpen ? "mb-3" : "mb-4"}`}>
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="max-w-sm"
          />
          {(hasFilter || filterPanel) && (
          <div ref={filterRef} className="relative">
            <Button
              variant="outline"
              onClick={() => {
                if (filterPanel) { setFilterPanelOpen((o) => !o); return; }
                hasFilter && setFilterOpen((o) => !o);
              }}
              className={
                activeCount > 0 || filterPanelOpen
                  ? "border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  : ""
              }
            >
              Filter
              {activeCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </Button>

            {filterOpen && filterConfig && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl animate-card-in overflow-hidden"

                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {/* Filter groups */}
                {filterConfig.groups?.map((group, gi) => (
                  <div key={group.label} className={`px-3 pb-2 ${gi === 0 ? "pt-3" : "pt-2 border-t"}`} style={gi > 0 ? { borderColor: "var(--border)" } : {}}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">{group.label}</p>
                    <div className="space-y-0.5">
                      {group.options.map((opt) => {
                        const active = activeFilters.has(opt.key);
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setActiveFilters((prev) => {
                              let next: Set<string>;
                              if (group.single) {
                                next = new Set([opt.key]);
                              } else {
                                next = new Set(prev);
                                active ? next.delete(opt.key) : next.add(opt.key);
                              }
                              onFilterChange?.(next);
                              return next;
                            })}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                          >
                            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center transition-colors ${group.single ? "rounded-full border-2" : "rounded border"} ${active ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                              {active && !group.single && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                              {active && group.single && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            {opt.icon && <span className="text-stone-400 dark:text-stone-500">{opt.icon}</span>}
                            <span className={active ? "text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {activeCount > 0 && (
                  <div className="border-t px-3 py-2" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => { setActiveFilters(new Set()); onFilterChange?.(new Set()); setFilterOpen(false); }}
                      className="w-full text-center text-xs font-medium text-blue-500 transition-colors hover:text-blue-600 py-0.5"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* Sort button */}
          {sortControl ?? (hasSort && (
          <div ref={sortRef} className="relative">
            <Button
              variant="outline"
              onClick={() => setSortOpen((o) => !o)}
              className={
                sortField
                  ? "border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  : ""
              }
            >
              <ArrowUpDown size={13} />
              Sort by
              {sortField && (
                <span className="text-xs font-semibold opacity-70">· {sortField}</span>
              )}
            </Button>

            {sortOpen && filterConfig?.sortFields && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 rounded-xl animate-card-in p-4"
                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">Sort</p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={sortField ?? ""}
                      onChange={(e) => {
                        const f = e.target.value || null;
                        setSortField(f);
                        setSortDir("asc");
                        onSortChange?.(f, "asc");
                      }}
                      className="h-9 w-full appearance-none rounded-lg border border-stone-200 bg-white pl-3 pr-8 text-sm font-medium text-stone-700 outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200"
                    >
                      <option value="">Select attribute</option>
                      {filterConfig.sortFields.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                  <div className="relative w-32">
                    <select
                      value={sortField ? sortDir : ""}
                      disabled={!sortField}
                      onChange={(e) => {
                        const dir = e.target.value as "asc" | "desc";
                        setSortDir(dir);
                        if (sortField) onSortChange?.(sortField, dir);
                      }}
                      className="h-9 w-full appearance-none rounded-lg border border-stone-200 bg-white pl-3 pr-8 text-sm font-medium text-stone-700 outline-none focus:border-blue-400 disabled:opacity-50 dark:border-(--border) dark:bg-(--input) dark:text-stone-200"
                    >
                      <option value="" disabled>Sort</option>
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
                {sortField && (
                  <div className="mt-3 border-t pt-2.5" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => { setSortField(null); setSortDir("asc"); onSortChange?.(null, "asc"); setSortOpen(false); }}
                      className="w-full py-0.5 text-center text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
                    >
                      Clear sort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={!hiddenCols.has(col.key)}
                  onCheckedChange={(checked) => setHiddenCols((prev) => {
                    const next = new Set(prev);
                    checked ? next.delete(col.key) : next.add(col.key);
                    return next;
                  })}
                  onSelect={(e) => e.preventDefault()}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>}
      {filterPanel && filterPanelOpen && (
        <div className="mb-3 shrink-0">{filterPanel}</div>
      )}
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
        className="flex-1 min-h-0 overflow-hidden rounded-md flex flex-col"
        style={{
          border: "1px solid var(--border)",
          background: "var(--card)",
        }}
      >
        <div className="tabs-scroll chat-scroll flex-1 min-h-0 overflow-auto">
          <Table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0 text-left">
          <TableHeader className="sticky top-0 z-10">
            <UITableRow className="hover:bg-transparent" style={{ background: "var(--card)" }}>
              {selectable && (
                <UITableHead className="border-b px-3 py-3 whitespace-normal" style={{ width: 44, minWidth: 44, borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        rows.length > 0 && rows.every((r) => selected.has(r.id))
                          ? true
                          : rows.some((r) => selected.has(r.id))
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(checked) => setSelected(checked ? new Set(rows.map((r) => r.id)) : new Set())}
                    />
                  </div>
                </UITableHead>
              )}
              {visibleColumns.map((column, index) => {
                const isLast = index === visibleColumns.length - 1;
                const isResizing = resizingKey === column.key;
                return (
                  <UITableHead
                    key={column.key}
                    className={`relative border-b px-4 py-3 text-sm font-medium text-foreground whitespace-normal ${column.align === "center" ? "text-center" : ""}`}
                    style={{ width: colWidths[column.key] ?? column.width, borderColor: "var(--border)" }}
                  >
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {column.label}
                      <InfoTooltip content={column.tooltip ?? column.label} />
                    </span>
                    {!isLast && (
                      <>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 opacity-40"
                          style={{ background: "var(--muted-foreground)" }}
                        />
                        <div
                          title="Drag to resize column"
                          onMouseDown={(e) => startColumnResize(e, column.key)}
                          className={`absolute right-0 top-0 bottom-0 z-20 w-1 cursor-col-resize transition-all hover:w-1.5 hover:bg-blue-500 ${isResizing ? "w-1.5 bg-blue-500" : ""}`}
                          style={{ marginRight: "-2px" }}
                        />
                      </>
                    )}
                  </UITableHead>
                );
              })}
              <UITableHead className="border-b px-3 py-3 text-sm font-medium text-foreground whitespace-normal" style={{ width: 44, minWidth: 44, borderColor: "var(--border)" }}>
                {actionsLabel ?? ""}
              </UITableHead>
            </UITableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <UITableRow className="hover:bg-transparent">
                <UITableCell
                  colSpan={visibleColumns.length + 1 + (selectable ? 1 : 0)}
                  className="h-36 border-b border-(--border) px-4 py-8 text-center text-sm font-medium text-(--muted-foreground) whitespace-normal"
                >
                  {emptyState ?? "No items yet."}
                </UITableCell>
              </UITableRow>
            ) : rows.map((row) => {
              const isGroup = row.type === "group" && Boolean(row.children?.length);
              const isExpanded = Boolean(expanded[row.id]);
              const isSelected = selectable && selected.has(row.id);
              const rowMenuItems = row.menuItems ?? menuItems;
              const isNavigable = !isGroup && Boolean(row.href || onRowClick);
              const showChevron = isNavigable && !row.rowActions && !(rowMenuItems && rowMenuItems.length);

              return (
                <Fragment key={row.id}>
                  <UITableRow
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className={`group/row transition-colors ${isSelected ? "bg-(--state-selected)" : "hover:bg-(--state-hover)"} ${isGroup || row.href || onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {selectable && (
                      <UITableCell
                        className="border-b border-(--border) px-3 py-3 whitespace-normal"
                        style={{ width: 44, minWidth: 44 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const next = new Set(selected);
                              checked ? next.add(row.id) : next.delete(row.id);
                              setSelected(next);
                            }}
                          />
                        </div>
                      </UITableCell>
                    )}
                    {visibleColumns.map((column, index) => (
                      <UITableCell
                        key={column.key}
                        className={`border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground whitespace-normal ${column.align === "center" ? "text-center" : ""}`}
                      >
                        <div className={`${column.align === "center" ? "flex justify-center" : index === 0 ? "flex items-center gap-2" : ""}`}>
                          {index === 0 && isGroup ? (
                            <ChevronRight size={14} className={`shrink-0 text-(--muted-foreground) transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          ) : null}
                          <CellContent value={row.cells[column.key] ?? "--"} />
                        </div>
                      </UITableCell>
                    ))}
                    <UITableCell className="border-b border-(--border) px-3 py-3 whitespace-normal" style={{ width: row.rowActions ? 80 : 44, minWidth: row.rowActions ? 80 : 44 }}>
                      <div className="flex items-center justify-center gap-1">
                        {row.rowActions}
                        {showChevron ? (
                          <ChevronRight
                            size={15}
                            className="shrink-0 text-(--muted-foreground) opacity-0 transition-opacity group-hover/row:opacity-100"
                          />
                        ) : (
                          <ThreeDotsMenu items={rowMenuItems} />
                        )}
                      </div>
                    </UITableCell>
                  </UITableRow>
                  {isGroup && isExpanded
                    ? row.children!.map((child) => (
                        <UITableRow key={child.id} className="bg-(--muted)/40 transition-colors hover:bg-(--state-hover)">
                          {visibleColumns.map((column, index) => (
                            <UITableCell
                              key={column.key}
                              className="border-b border-(--border) px-4 py-3 text-sm font-medium text-foreground whitespace-normal"
                            >
                              <div className={index === 0 ? "pl-6" : ""}>
                                <CellContent value={child.cells[column.key] ?? ""} />
                              </div>
                            </UITableCell>
                          ))}
                          <UITableCell className="border-b border-(--border) px-3 py-3 whitespace-normal" />
                        </UITableRow>
                      ))
                    : null}
                </Fragment>
              );
            })}
          </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
