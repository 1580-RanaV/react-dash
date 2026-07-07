

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

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
];

export default function FeedsView() {
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.name) }) }
        : item
    );
  }

  const displayRows = FEED_ROWS
    .filter((r) => !deletedIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4">
      <DashboardTable
        columns={FEED_COLUMNS}
        rows={displayRows}
        searchPlaceholder="Search feeds..."
        action={
          <button
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "#0080FF" }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create feed</span>
          </button>
        }
      />
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
