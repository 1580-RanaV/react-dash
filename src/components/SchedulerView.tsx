

import { useState } from "react";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import CreateBookingDrawer from "./CreateBookingDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Plus } from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────────

const BOOKING_TYPES: {
  id: string;
  name: string;
  tags: string[];
  duration: string;
}[] = [
  { id: "1",  name: "test-meeting",     tags: ["Individual"],                    duration: "30m" },
  { id: "2",  name: "Test Meeting",     tags: ["Round robin", "Product Team"],   duration: "15m" },
  { id: "3",  name: "Product Demo",     tags: ["All",         "Product Team"],   duration: "30m" },
  { id: "4",  name: "Test Booking 123", tags: ["Round robin", "Product Team"],   duration: "30m" },
  { id: "5",  name: "Discovery Call",   tags: ["Round robin", "Product Team"],   duration: "30m" },
  { id: "6",  name: "Onboarding-2",     tags: ["Round robin", "Product Team"],   duration: "1h"  },
  { id: "7",  name: "Test meeting 3",   tags: ["Round robin", "Product Team"],   duration: "30m" },
  { id: "8",  name: "Business",         tags: ["Round robin", "Product Team"],   duration: "30m" },
  { id: "9",  name: "Onboarding",       tags: ["All",         "Product Team"],   duration: "1h"  },
  { id: "10", name: "Product Query",    tags: ["Round robin", "Product Team"],   duration: "30m" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md border border-stone-200 bg-white px-2.5 text-xs font-medium text-stone-600 dark:border-(--border) dark:bg-white/3 dark:text-stone-300">
      {label}
    </span>
  );
}

function DurationBadge({ value }: { value: string }) {
  return (
    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{value}</span>
  );
}

function VisibilityToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setOn((v) => !v); }}
      className={`relative h-6 w-11 rounded-full shadow-sm transition-colors duration-200 ${on ? "bg-blue-600" : "bg-stone-300 dark:bg-stone-600"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${on ? "right-1 left-auto" : "left-1 right-auto"}`}
      />
    </button>
  );
}

// ── Table config ───────────────────────────────────────────────────────────────

const COLUMNS: TableColumn[] = [
  { key: "name",       label: "Name",       width: "28%"   },
  { key: "tags",       label: "Type / Team", width: "280px" },
  { key: "duration",   label: "Duration",   width: "120px" },
  { key: "visibility", label: "Visibility", width: "100px", align: "center" },
];


const ROW_MENU: ThreeDotsMenuItem[] = [
  { label: "Open booking page", icon: ExternalLink },
  { label: "Copy link",         icon: Copy         },
  { label: "Rename",            icon: Pencil       },
  { label: "Delete",            icon: Trash2, tone: "danger" },
];

// ── Main view ──────────────────────────────────────────────────────────────────

export default function SchedulerView() {
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const rows: TableRow[] = BOOKING_TYPES.filter((item) => !deletedIds.has(item.id)).map((item) => ({
    id: item.id,
    menuItems: ROW_MENU.map((mi) =>
      mi.label === "Delete"
        ? { ...mi, onClick: () => setDeleteTarget({ id: item.id, name: item.name }) }
        : mi
    ),
    cells: {
      name: (
        <span className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
          {item.name}
        </span>
      ),
      tags: (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      ),
      duration: <DurationBadge value={item.duration} />,
      visibility: <VisibilityToggle />,
    },
  }));

  return (
    <div className="flex flex-1 flex-col min-h-0 px-4 py-4 animate-fade-up">
      <DashboardTable
        columns={COLUMNS}
        rows={rows}
        searchPlaceholder="Search booking types..."
        action={
          <button
            onClick={() => setShowCreateBooking(true)}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "#0080FF" }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create a booking</span>
          </button>
        }
      />
      {showCreateBooking && <CreateBookingDrawer onClose={() => setShowCreateBooking(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="booking type"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
