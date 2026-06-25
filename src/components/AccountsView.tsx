

import { useState } from "react";
import { Plus, Table2, Trash2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import CreateAccountDrawer from "./CreateAccountDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── helpers ───────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/8 dark:text-stone-400">
      {label}
    </span>
  );
}

function LifecycleBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    Lead:      "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300",
    Prospect:  "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
    Customer:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
    Churned:   "bg-rose-50 text-rose-600 dark:bg-rose-500/12 dark:text-rose-300",
    Qualified: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${map[stage] ?? map.Lead}`}>
      {stage}
    </span>
  );
}

function IntentBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const map = {
    High:   { dot: "bg-rose-500",   text: "text-rose-600 dark:text-rose-400" },
    Medium: { dot: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400" },
    Low:    { dot: "bg-stone-400",  text: "text-stone-500 dark:text-stone-400" },
  };
  const { dot, text } = map[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${text}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {level}
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
  { key: "accountName",    label: "Account name",    width: "22%" },
  { key: "lastSeen",       label: "Last seen",       width: "14%" },
  { key: "tags",           label: "Tags",            width: "16%" },
  { key: "lifecycleStage", label: "Lifecycle stage", width: "13%" },
  { key: "accountOwner",   label: "Account owner",   width: "14%" },
  { key: "intentLevel",    label: "Intent level",    width: "11%" },
  { key: "users",          label: "Users",           width: "10%", align: "center" },
];

const ROWS: TableRow[] = [
  {
    id: "acme-corp",
    cells: {
      accountName:    "Acme Corp",
      lastSeen:       { value: "2 hours ago", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Enterprise" /><Tag label="SaaS" /></div>,
      lifecycleStage: <LifecycleBadge stage="Customer" />,
      accountOwner:   <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      intentLevel:    <IntentBadge level="High" />,
      users:          42,
    },
  },
  {
    id: "globex",
    cells: {
      accountName:    "Globex Inc.",
      lastSeen:       { value: "5 hours ago", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Mid-market" /></div>,
      lifecycleStage: <LifecycleBadge stage="Prospect" />,
      accountOwner:   <OwnerAvatar initial="S" color="#0D9488" name="Somya Nayak" />,
      intentLevel:    <IntentBadge level="Medium" />,
      users:          17,
    },
  },
  {
    id: "initech",
    cells: {
      accountName:    "Initech LLC",
      lastSeen:       { value: "Yesterday", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="SMB" /><Tag label="Fintech" /></div>,
      lifecycleStage: <LifecycleBadge stage="Lead" />,
      accountOwner:   <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      intentLevel:    <IntentBadge level="High" />,
      users:          8,
    },
  },
  {
    id: "umbrella-corp",
    cells: {
      accountName:    "Umbrella Corp",
      lastSeen:       { value: "3 days ago", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Enterprise" /></div>,
      lifecycleStage: <LifecycleBadge stage="Qualified" />,
      accountOwner:   <OwnerAvatar initial="S" color="#0D9488" name="Sid Chaudhary" />,
      intentLevel:    <IntentBadge level="Medium" />,
      users:          134,
    },
  },
  {
    id: "stark-industries",
    cells: {
      accountName:    "Stark Industries",
      lastSeen:       { value: "1 week ago", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Enterprise" /><Tag label="Manufacturing" /></div>,
      lifecycleStage: <LifecycleBadge stage="Customer" />,
      accountOwner:   <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      intentLevel:    <IntentBadge level="Low" />,
      users:          261,
    },
  },
  {
    id: "wayne-enterprises",
    cells: {
      accountName:    "Wayne Enterprises",
      lastSeen:       { value: "2 weeks ago", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Mid-market" /><Tag label="B2B" /></div>,
      lifecycleStage: <LifecycleBadge stage="Churned" />,
      accountOwner:   <OwnerAvatar initial="S" color="#0D9488" name="Somya Nayak" />,
      intentLevel:    <IntentBadge level="Low" />,
      users:          5,
    },
  },
  {
    id: "oscorp",
    cells: {
      accountName:    "Oscorp",
      lastSeen:       { value: "Jun 10, 2026", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="SMB" /></div>,
      lifecycleStage: <LifecycleBadge stage="Lead" />,
      accountOwner:   <OwnerAvatar initial="R" color="#8B5CF6" name="Rohan" />,
      intentLevel:    <IntentBadge level="High" />,
      users:          3,
    },
  },
  {
    id: "cyberdyne",
    cells: {
      accountName:    "Cyberdyne Systems",
      lastSeen:       { value: "Jun 8, 2026", muted: true },
      tags:           <div className="flex flex-wrap gap-1"><Tag label="Enterprise" /><Tag label="AI" /></div>,
      lifecycleStage: <LifecycleBadge stage="Prospect" />,
      accountOwner:   <OwnerAvatar initial="S" color="#0D9488" name="Sid Chaudhary" />,
      intentLevel:    <IntentBadge level="Medium" />,
      users:          22,
    },
  },
];

// ── view ──────────────────────────────────────────────────────────────────────

export default function AccountsView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.accountName) }) }
        : item
    );
  }

  const displayRows = ROWS
    .filter((r) => !deletedIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-x-hidden">
      <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} /> }]} activeTab="table" />

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={displayRows}
          searchPlaceholder="Search accounts..."
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 h-9 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              Create account
            </button>
          }
        />
      </div>

      {drawerOpen && <CreateAccountDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="account"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
