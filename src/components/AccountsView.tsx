

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Table2, TableRowsSplit, Trash2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import CreateAccountDrawer from "./CreateAccountDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SegmentSelector, { Segment } from "./SegmentSelector";

// ── helpers ───────────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/8 dark:text-stone-400">
      {label}
    </span>
  );
}

function LifecycleBadge({ stage }: { stage: string }) {
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {stage}
    </span>
  );
}

function IntentBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
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

const ACCOUNT_SEGMENTS: Segment[] = [
  { id: "all",       name: "All accounts",       icon: <TableRowsSplit size={15} />, count: ROWS.length },
  { id: "new-view",  name: "New accounts view",   icon: <TableRowsSplit size={15} /> },
  { id: "new-view1", name: "New accounts view 1", icon: <TableRowsSplit size={15} /> },
];

// ── view ──────────────────────────────────────────────────────────────────────

export default function AccountsView() {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState(ACCOUNT_SEGMENTS[0]);
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
      <div className="flex items-center gap-2 px-4 pt-3 shrink-0">
        <SegmentSelector
          segments={ACCOUNT_SEGMENTS}
          selected={selectedSegment}
          onSelect={setSelectedSegment}
        />
        <div className="h-5 w-px shrink-0 bg-stone-200 dark:bg-white/10" />
        <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} />, count: displayRows.length }]} activeTab="table" className="flex items-center gap-1" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={displayRows}
          searchPlaceholder="Search accounts..."
          onRowClick={(row) => navigate(`/accounts/${row.id}/overview`)}
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 h-9 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create account</span>
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
