

import { useState } from "react";
import { Plus, Table2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import CreateDealDrawer from "./CreateDealDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";

// ── helpers ───────────────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {stage}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "High" | "Medium" | "Low" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
      {priority}
    </span>
  );
}

function OwnerAvatar({ initial, color, name }: { initial: string; color: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {initial}
      </span>
      <span className="text-xs text-stone-700 dark:text-stone-300">{name}</span>
    </div>
  );
}

// ── static data ───────────────────────────────────────────────────────────────

const COLUMNS: TableColumn[] = [
  { key: "deal",       label: "Deal",        width: "22%" },
  { key: "account",   label: "Account",     width: "14%" },
  { key: "dealStage", label: "Deal stage",  width: "13%" },
  { key: "value",     label: "Value",       width: "10%" },
  { key: "dealOwner", label: "Deal owner",  width: "14%" },
  { key: "dealType",  label: "Deal type",   width: "12%" },
  { key: "priority",  label: "Priority",    width: "9%"  },
  { key: "closeDate", label: "Close date",  width: "12%" },
];

const ROWS: TableRow[] = [
  {
    id: "d1",
    cells: {
      deal:      "Acme Corp — Enterprise Plan",
      account:   "Acme Corp",
      dealStage: <StageBadge stage="Negotiation" />,
      value:     "$48,000",
      dealOwner: <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      dealType:  "New Business",
      priority:  <PriorityBadge priority="High" />,
      closeDate: { value: "Jun 30, 2026", muted: true },
    },
  },
  {
    id: "d2",
    cells: {
      deal:      "Globex — Growth Subscription",
      account:   "Globex Inc.",
      dealStage: <StageBadge stage="Proposal" />,
      value:     "$12,000",
      dealOwner: <OwnerAvatar initial="S" color="#0D9488" name="Somya Nayak" />,
      dealType:  "Upsell",
      priority:  <PriorityBadge priority="Medium" />,
      closeDate: { value: "Jul 15, 2026", muted: true },
    },
  },
  {
    id: "d3",
    cells: {
      deal:      "Initech — Starter Onboarding",
      account:   "Initech LLC",
      dealStage: <StageBadge stage="Qualification" />,
      value:     "$3,600",
      dealOwner: <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      dealType:  "New Business",
      priority:  <PriorityBadge priority="High" />,
      closeDate: { value: "Jul 1, 2026", muted: true },
    },
  },
  {
    id: "d4",
    cells: {
      deal:      "Umbrella Corp — Platform Renewal",
      account:   "Umbrella Corp",
      dealStage: <StageBadge stage="Closed Won" />,
      value:     "$96,000",
      dealOwner: <OwnerAvatar initial="S" color="#0D9488" name="Sid Chaudhary" />,
      dealType:  "Renewal",
      priority:  <PriorityBadge priority="Low" />,
      closeDate: { value: "Jun 2, 2026", muted: true },
    },
  },
  {
    id: "d5",
    cells: {
      deal:      "Stark Industries — AI Suite",
      account:   "Stark Industries",
      dealStage: <StageBadge stage="Prospecting" />,
      value:     "$240,000",
      dealOwner: <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      dealType:  "New Business",
      priority:  <PriorityBadge priority="High" />,
      closeDate: { value: "Aug 31, 2026", muted: true },
    },
  },
  {
    id: "d6",
    cells: {
      deal:      "Wayne Enterprises — Re-engagement",
      account:   "Wayne Enterprises",
      dealStage: <StageBadge stage="Closed Lost" />,
      value:     "$18,000",
      dealOwner: <OwnerAvatar initial="S" color="#0D9488" name="Somya Nayak" />,
      dealType:  "Existing Business",
      priority:  <PriorityBadge priority="Low" />,
      closeDate: { value: "May 31, 2026", muted: true },
    },
  },
  {
    id: "d7",
    cells: {
      deal:      "Oscorp — Pilot Program",
      account:   "Oscorp",
      dealStage: <StageBadge stage="Qualification" />,
      value:     "$6,000",
      dealOwner: <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      dealType:  "New Business",
      priority:  <PriorityBadge priority="Medium" />,
      closeDate: { value: "Jul 22, 2026", muted: true },
    },
  },
  {
    id: "d8",
    cells: {
      deal:      "Cyberdyne — Security Bundle",
      account:   "Cyberdyne Systems",
      dealStage: <StageBadge stage="Proposal" />,
      value:     "$30,000",
      dealOwner: <OwnerAvatar initial="S" color="#0D9488" name="Sid Chaudhary" />,
      dealType:  "Upsell",
      priority:  <PriorityBadge priority="Medium" />,
      closeDate: { value: "Aug 10, 2026", muted: true },
    },
  },
];

// ── view ──────────────────────────────────────────────────────────────────────

export default function DealsView() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-x-hidden">
      <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} /> }]} activeTab="table" />

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={ROWS}
          searchPlaceholder="Search deals..."
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create deal</span>
            </button>
          }
        />
      </div>

      {drawerOpen && <CreateDealDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
