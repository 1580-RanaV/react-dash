
import { useState, useRef, useEffect } from "react";
import { Plus, LayoutList, Megaphone, ChevronDown, ChevronUp, Search } from "lucide-react";
import DashboardTable, { TableColumn, TableRow, FilterConfig } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SlidingSidebar from "./SlidingSidebar";

const FEED_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", width: "48%" },
  { key: "type", label: "Type", width: "12%" },
  { key: "status", label: "Status", width: "12%" },
  { key: "lastUpdated", label: "Last Updated", width: "18%" },
  { key: "createdBy", label: "Created By", width: "10%" },
];

const FEED_ROWS: TableRow[] = [
  {
    id: "cart",
    cells: {
      name: "Continue where you left off - items in your cart",
      type: { value: "Regular", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Feb 24, 2026 - 10:06 PM", muted: true },
      createdBy: "rana",
    },
  },
  {
    id: "popular",
    cells: {
      name: "Popular Right Now",
      type: { value: "Regular", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Apr 22, 2026 - 4:53 PM", muted: true },
      createdBy: "Somya Nayak",
    },
  },
  {
    id: "new-arrivals",
    cells: {
      name: "New Arrivals",
      type: { value: "Regular", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Apr 22, 2026 - 4:54 PM", muted: true },
      createdBy: "Somya Nayak",
    },
  },
  {
    id: "top-category",
    cells: {
      name: "Top Sellers in Category",
      type: { value: "Regular", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Apr 22, 2026 - 4:59 PM", muted: true },
      createdBy: "Somya Nayak",
    },
  },
  {
    id: "featured",
    cells: {
      name: "Featured Picks",
      type: { value: "Regular", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Apr 22, 2026 - 5:02 PM", muted: true },
      createdBy: "Somya Nayak",
    },
  },
  {
    id: "sponsored-top",
    cells: {
      name: "Sponsored Products — Top Placement",
      type: { value: "Ad", muted: true },
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "May 10, 2026 - 11:30 AM", muted: true },
      createdBy: "rana",
    },
  },
  {
    id: "sponsored-sidebar",
    cells: {
      name: "Sponsored Products — Sidebar",
      type: { value: "Ad", muted: true },
      status: { label: "Paused", tone: "gray" },
      lastUpdated: { value: "Jun 01, 2026 - 2:15 PM", muted: true },
      createdBy: "Somya Nayak",
    },
  },
];

const FEED_FILTER_CONFIG: FilterConfig = {
  groups: [
    {
      label: "Type",
      single: true,
      options: [
        { key: "all",     label: "All"     },
        { key: "regular", label: "Regular" },
        { key: "ad",      label: "Ad"      },
      ],
    },
  ],
};

const FEED_TYPES = [
  {
    key: "merchandising" as const,
    label: "Merchandising feed",
    desc: "Curate SKUs for on-site collections, search and ranking.",
  },
  {
    key: "ad" as const,
    label: "Ad feed",
    desc: "Render recipes per SKU and publish a CSV your ad networks pull on schedule.",
  },
];

const SORTING_ALGORITHMS = [
  "Recently Added to Cart",
  "New Arrivals (Newest Products)",
  "Your Recently Viewed Items (Click History)",
  "Popular Right Now",
  "Best Sellers (Purchase)",
  "Co-Purchase (Often Purchased with)",
  "Just Purchased (Recently Purchased)",
  "Recommended Based on Your Orders (Session)",
  "Trending Items (Trending)",
  "Price Drop (Price Decrease)",
  "High Rated (Review Score)",
  "Similar Items (Item-Based)",
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </p>
  );
}

function AlgorithmDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = SORTING_ALGORITHMS.filter((a) =>
    !search || a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={containerRef}>
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="flex w-full items-center justify-between rounded-lg border px-3 h-10 text-sm transition-colors"
        style={{
          borderColor: open ? "#0080FF" : "var(--border)",
          background: "var(--content-bg)",
          color: value ? "var(--text)" : undefined,
        }}
      >
        <span className={value ? "text-stone-700 dark:text-stone-200" : "text-stone-400 dark:text-stone-500"}>
          {value || "Select algorithm"}
        </span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-stone-400" />
          : <ChevronDown size={14} className="shrink-0 text-stone-400" />
        }
      </button>

      {open && (
        <div
          className="mt-1 rounded-lg overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--content-bg)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          {/* Search */}
          <div className="px-2 pt-2 pb-1.5">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 w-full rounded-md border border-stone-200 bg-white pl-8 pr-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100"
              />
            </div>
          </div>
          {/* List */}
          <div className="max-h-52 overflow-y-auto pb-1.5">
            {filtered.map((algo) => (
              <button
                key={algo}
                type="button"
                onClick={() => { onChange(algo); setOpen(false); setSearch(""); }}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                style={{ color: value === algo ? "#0080FF" : undefined }}
              >
                <span className={value === algo ? "font-semibold text-blue-600 dark:text-blue-400" : "text-stone-700 dark:text-stone-200"}>
                  {algo}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-3 text-sm text-stone-400">No results for "{search}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedsView() {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  // Sidebar state
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<"merchandising" | "ad">("merchandising");

  // Step 2 — merchandising
  const [feedName, setFeedName] = useState("");
  const [algorithm, setAlgorithm] = useState("");

  // Step 2 — ad feed
  const [adFeedName, setAdFeedName] = useState("");
  const [sourceFeed, setSourceFeed] = useState("");
  const [autoUpdate, setAutoUpdate] = useState(true);

  function openCreate() {
    setStep(1);
    setFeedName("");
    setAlgorithm("");
    setAdFeedName("");
    setSourceFeed("");
    setAutoUpdate(true);
    setSelectedType("merchandising");
    setCreateOpen(true);
  }

  function handleClose() {
    setCreateOpen(false);
  }

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.name) }) }
        : item
    );
  }

  const displayRows = FEED_ROWS
    .filter((r) => !deletedIds.has(r.id))
    .filter((r) => {
      if (typeFilter === "all") return true;
      const rowType = String((r.cells.type as { value: string }).value).toLowerCase();
      return rowType === typeFilter;
    })
    .map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="relative flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 overflow-hidden">
      <DashboardTable
        columns={FEED_COLUMNS}
        rows={displayRows}
        searchPlaceholder="Search feeds..."
        filterConfig={FEED_FILTER_CONFIG}
        defaultActiveFilters={["all"]}
        onFilterChange={(filters) => setTypeFilter([...filters][0] ?? "all")}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "#0080FF" }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create feed</span>
          </button>
        }
      />

      {createOpen && (
        <SlidingSidebar
          title={step === 2 && selectedType === "ad" ? "Create ad feed" : "Create feed"}
          description={
            step === 1
              ? "Choose the type of feed you want to set up."
              : selectedType === "ad"
                ? "Render every product in a catalog-wide feed as an ad using a brand creative."
                : "Configure the recommendation feed algorithm and filters."
          }
          onClose={handleClose}
          footer={(close) =>
            step === 1 ? (
              <>
                <button
                  onClick={close}
                  className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#0080FF" }}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={close}
                  className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-colors"
                  style={{ background: "#0080FF", opacity: (selectedType === "merchandising" ? feedName && algorithm : adFeedName && sourceFeed) ? 1 : 0.5 }}
                >
                  {selectedType === "ad" ? "Create ad feed" : "Create feed"}
                </button>
              </>
            )
          }
        >
          {step === 1 ? (
            <div className="flex flex-col gap-2">
              {FEED_TYPES.map((opt) => {
                const active = selectedType === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedType(opt.key)}
                    className="flex items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-100 hover:bg-stone-50 dark:hover:bg-white/4"
                    style={{ background: active ? "rgba(0,128,255,0.06)" : "transparent" }}
                  >
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                      style={{
                        borderColor: active ? "#0080FF" : "var(--border)",
                        background: active ? "#0080FF" : "transparent",
                      }}
                    >
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-blue-600 dark:text-blue-400" : "text-stone-700 dark:text-stone-200"}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : selectedType === "merchandising" ? (
            <div className="flex flex-col gap-6">
              <div>
                <FieldLabel required>Feed name</FieldLabel>
                <input
                  autoFocus
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  placeholder="e.g., Most Popular Products"
                  className="h-10 w-full rounded-lg border px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 transition-colors focus:border-blue-400 dark:text-stone-200 dark:placeholder:text-stone-500"
                  style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
                />
              </div>
              <div>
                <p className="mb-0.5 text-sm font-bold text-stone-800 dark:text-stone-100">
                  What products should the customers view first?
                </p>
                <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">
                  Choose an algorithm that determines which items to recommend.
                </p>
                <FieldLabel required>Sorting strategy</FieldLabel>
                <AlgorithmDropdown value={algorithm} onChange={setAlgorithm} />
              </div>
            </div>
          ) : (
            /* Ad feed form */
            <div className="flex flex-col gap-6">
              {/* Feed name */}
              <div>
                <FieldLabel required>Feed name</FieldLabel>
                <input
                  autoFocus
                  value={adFeedName}
                  onChange={(e) => setAdFeedName(e.target.value)}
                  placeholder="e.g., Best Sellers Ad Feed"
                  className="h-10 w-full rounded-lg border px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 transition-colors focus:border-blue-400 dark:text-stone-200 dark:placeholder:text-stone-500"
                  style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
                />
              </div>

              {/* Source product feed */}
              <div>
                <FieldLabel required>Source product feed</FieldLabel>
                <div className="relative">
                  <select
                    value={sourceFeed}
                    onChange={(e) => setSourceFeed(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border pl-3 pr-8 text-sm outline-none transition-colors focus:border-blue-400 dark:text-stone-200"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--content-bg)",
                      color: sourceFeed ? undefined : "var(--stone-400)",
                    }}
                  >
                    <option value="" disabled>Pick a catalog-wide feed...</option>
                    <option>Popular Right Now</option>
                    <option>New Arrivals</option>
                    <option>Top Sellers in Category</option>
                    <option>Featured Picks</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
                <p className="mt-1.5 text-xs text-stone-400 dark:text-stone-500">
                  Only feeds whose algorithm needs no user/product context can drive an ad feed.
                </p>
              </div>

              {/* Brand ad */}
              <div>
                <FieldLabel required>Brand ad</FieldLabel>
                <div
                  className="rounded-lg p-4"
                  style={{ border: "1.5px dashed var(--border)" }}
                >
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    No ads with product-image layers yet.
                  </p>
                  <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
                    Open Creative Studio, add a <strong className="font-semibold text-stone-600 dark:text-stone-300">product image</strong> layer to a brand ad, then come back.
                  </p>
                </div>
              </div>

              {/* Auto-update toggle */}
              <div
                className="flex items-center justify-between gap-4 rounded-xl p-4"
                style={{ border: "1px solid var(--border)" }}
              >
                <div>
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Auto-update</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    Refresh the rendered ads when the source feed's catalog changes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoUpdate((v) => !v)}
                  className="relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200"
                  style={{ background: autoUpdate ? "#0080FF" : "var(--border)" }}
                >
                  <span
                    className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                    style={{ transform: autoUpdate ? "translateX(20px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>
          )}
        </SlidingSidebar>
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="feed"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
