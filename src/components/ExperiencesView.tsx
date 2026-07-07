

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, PenLine, Plus, Trash2 } from "lucide-react";
import CreateExperienceDrawer from "./CreateExperienceDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DateRangePicker from "./DateRangePicker";
import MetricCard from "./MetricCard";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const CHART_DATA = [
  { date:"May 3",  value:0 },       { date:"May 4",  value:12000 },
  { date:"May 5",  value:175000 },  { date:"May 6",  value:230000 },
  { date:"May 7",  value:260000 },  { date:"May 8",  value:290000 },
  { date:"May 9",  value:310000 },  { date:"May 10", value:340000 },
  { date:"May 11", value:370000 },  { date:"May 12", value:400000 },
  { date:"May 13", value:430000 },  { date:"May 14", value:460000 },
  { date:"May 15", value:490000 },  { date:"May 16", value:510000 },
  { date:"May 17", value:530000 },  { date:"May 18", value:560000 },
  { date:"May 19", value:900000 },  { date:"May 20", value:1300000 },
  { date:"May 21", value:3600000 }, { date:"May 22", value:4700000 },
  { date:"May 23", value:5400000 }, { date:"May 24", value:6100000 },
  { date:"May 25", value:6200000 }, { date:"May 26", value:14900000 },
  { date:"May 27", value:15047484 },{ date:"May 28", value:15047484 },
  { date:"May 29", value:15047484 },{ date:"May 30", value:15047484 },
  { date:"Jun 1",  value:15047484 },{ date:"Jun 2",  value:15047484 },
];
const CHART_DATA_HALF = CHART_DATA.map(d => ({ ...d, value: Math.round(d.value * 0.5) }));

const EXPERIENCE_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", width: "34%", info: true },
  { key: "status", label: "Status", width: "14%", info: true },
  { key: "type", label: "Type", width: "20%", info: true },
  { key: "duration", label: "Duration", width: "18%", info: true },
  { key: "createdBy", label: "Created by", width: "14%", info: true },
];

const EXPERIENCE_MENU: ThreeDotsMenuItem[] = [
  { label: "View Details", icon: ExternalLink },
  { label: "Open Editor",  icon: PenLine      },
  { label: "Delete",       icon: Trash2, tone: "danger" },
];

const EXPERIENCE_ROWS: TableRow[] = [
  {
    id: "spring-homepage-test",
    href: "/experiences/spring-homepage-test",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Spring homepage hero test",
      status: { label: "Running", tone: "green" },
      type: "Client-side Experiment",
      duration: "May 3, 2026 - Jun 2, 2026",
      createdBy: "Rohan",
    },
  },
  {
    id: "returning-visitor-personalization",
    href: "/experiences/returning-visitor-personalization",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Returning visitor personalization",
      status: { label: "Running", tone: "green" },
      type: "Client-side Personalization",
      duration: "May 18, 2026 - Jun 2, 2026",
      createdBy: "Rohan",
    },
  },
  {
    id: "pricing-page-cta",
    href: "/experiences/pricing-page-cta",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Pricing page CTA experiment",
      status: { label: "Draft", tone: "gray" },
      type: "Client-side Experiment",
      duration: "--",
      createdBy: "Rohan",
    },
  },
  {
    id: "new-user-banner",
    href: "/experiences/new-user-banner",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "New user onboarding banner",
      status: { label: "Paused", tone: "blue" },
      type: "Client-side Personalization",
      duration: "Apr 28, 2026 - May 27, 2026",
      createdBy: "Rohan",
    },
  },
  {
    id: "checkout-urgency-nudge",
    href: "/experiences/checkout-urgency-nudge",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Checkout urgency nudge",
      status: { label: "Running", tone: "green" },
      type: "Client-side Experiment",
      duration: "May 10, 2026 - Jun 9, 2026",
      createdBy: "Somya",
    },
  },
  {
    id: "mobile-nav-redesign",
    href: "/experiences/mobile-nav-redesign",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Mobile nav redesign A/B",
      status: { label: "Running", tone: "green" },
      type: "Client-side Experiment",
      duration: "May 20, 2026 - Jun 19, 2026",
      createdBy: "Aman",
    },
  },
  {
    id: "geo-based-banner",
    href: "/experiences/geo-based-banner",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Geo-based homepage banner",
      status: { label: "Draft", tone: "gray" },
      type: "Server-side Personalization",
      duration: "--",
      createdBy: "Rohan",
    },
  },
  {
    id: "loyalty-member-upsell",
    href: "/experiences/loyalty-member-upsell",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Loyalty member upsell widget",
      status: { label: "Running", tone: "green" },
      type: "Client-side Personalization",
      duration: "Apr 15, 2026 - Jun 15, 2026",
      createdBy: "Somya",
    },
  },
  {
    id: "search-result-boost",
    href: "/experiences/search-result-boost",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Search result relevance boost",
      status: { label: "Paused", tone: "blue" },
      type: "Server-side Experiment",
      duration: "Mar 1, 2026 - Apr 30, 2026",
      createdBy: "Aman",
    },
  },
  {
    id: "pdp-social-proof",
    href: "/experiences/pdp-social-proof",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "PDP social proof block",
      status: { label: "Running", tone: "green" },
      type: "Client-side Experiment",
      duration: "May 22, 2026 - Jun 21, 2026",
      createdBy: "Rohan",
    },
  },
  {
    id: "abandoned-cart-overlay",
    href: "/experiences/abandoned-cart-overlay",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Abandoned cart exit overlay",
      status: { label: "Draft", tone: "gray" },
      type: "Client-side Personalization",
      duration: "--",
      createdBy: "Somya",
    },
  },
  {
    id: "first-purchase-discount",
    href: "/experiences/first-purchase-discount",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "First-purchase discount bar",
      status: { label: "Running", tone: "green" },
      type: "Server-side Personalization",
      duration: "Jun 1, 2026 - Jun 30, 2026",
      createdBy: "Aman",
    },
  },
  {
    id: "recommended-products-rail",
    href: "/experiences/recommended-products-rail",
    menuItems: EXPERIENCE_MENU,
    cells: {
      name: "Recommended products rail",
      status: { label: "Running", tone: "green" },
      type: "Server-side Experiment",
      duration: "May 5, 2026 - Jun 4, 2026",
      createdBy: "Rohan",
    },
  },
];

const EXPERIENCE_NAMES = [
  "All Experiences",
  ...EXPERIENCE_ROWS.map((r) => r.cells.name as string),
];

function ExperienceDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All Experiences");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:text-stone-200 dark:hover:bg-white/6"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="max-w-45 truncate">{selected}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-stone-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-xl overflow-hidden py-1 animate-card-in"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          {EXPERIENCE_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => { setSelected(name); setOpen(false); }}
              className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors truncate ${
                selected === name
                  ? "font-semibold text-stone-900 dark:text-stone-100"
                  : "font-medium text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExperiencesView() {
  const [rows, setRows] = useState<TableRow[]>(EXPERIENCE_ROWS);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return [
      { label: "View Details", icon: ExternalLink },
      { label: "Open Editor",  icon: PenLine },
      { label: "Delete", icon: Trash2, tone: "danger", onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.name) }) },
    ];
  }

  const displayRows = rows.map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto relative overflow-x-hidden">
      {/* Topbar */}
      <div className="flex items-center shrink-0 pr-3 pt-3 gap-2">
        <div className="flex-1"><DateRangePicker /></div>
        <ExperienceDropdown />
      </div>

      {/* Metric cards */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 pt-3 pb-4 animate-fade-up">
        <MetricCard
          value="$15,047,484.74"
          label="Total revenue"
          change="-- vs. previous period"
          data={CHART_DATA}
        />
        <MetricCard
          value="$7,523,742.37"
          label="Intempt attributed revenue"
          change="-- vs. previous period"
          data={CHART_DATA_HALF}
        />
      </div>

      <div className="sticky top-0 flex flex-col px-4 pb-4" style={{ height: "calc(100vh - 60px)" }}>
        <DashboardTable
          columns={EXPERIENCE_COLUMNS}
          rows={displayRows}
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create experience</span>
            </button>
          }
        />
      </div>

      {drawerOpen && <CreateExperienceDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="experience"
          entityName={deleteTarget.name}
          onConfirm={() => {
            setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
