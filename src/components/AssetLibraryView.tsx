

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, Plus, Table2 } from "lucide-react";
import CreateAssetDrawer from "./CreateAssetDrawer";
import DashboardTable, { FilterConfig, TableColumn, TableRow } from "./DashboardTable";
import { ASSET_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import ViewTabs from "./ViewTabs";

// ── helpers ───────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: "Email Plain" | "Email HTML" | "SMS" | "Image" }) {
  const map = {
    "Email Plain": "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    "Email HTML":  "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    "SMS":         "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    "Image":       "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${map[type]}`}>
      {type}
    </span>
  );
}

function AssetName({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="shrink-0 text-stone-400 dark:text-stone-500">{icon}</span>
      <span className="truncate">{name}</span>
    </div>
  );
}

function UserAvatar({ initial, color, name, muted }: { initial: string; color: string; name: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${muted ? "opacity-50" : ""}`}
        style={{ background: color }}
      >
        {initial}
      </span>
      <span className={`text-xs ${muted ? "italic text-stone-400 dark:text-stone-500" : "text-stone-700 dark:text-stone-300"}`}>{name}</span>
    </div>
  );
}

function StatusDot() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
      Active
    </span>
  );
}

// ── static data ───────────────────────────────────────────────────────────────

const COLUMNS: TableColumn[] = [
  { key: "name",        label: "Name",       width: "36%" },
  { key: "type",        label: "Type",       width: "12%" },
  { key: "createdBy",   label: "Created by", width: "18%" },
  { key: "status",      label: "Status",     width: "10%" },
  { key: "tags",        label: "Tags",       width: "12%" },
  { key: "lastUpdated", label: "Last updated", width: "12%" },
];

const emailIcon = <Mail size={14} />;
const smsIcon   = <MessageSquare size={14} />;
const imgIcon   = <span style={{width:14,height:14,display:"inline-block"}} />;

const ROWS: TableRow[] = [
  {
    id: "a1",
    cells: {
      name:        <AssetName icon={emailIcon} name="Claude design - Email 1" />,
      type:        <TypeBadge type="Email Plain" />,
      createdBy:   <UserAvatar initial="SN" color="#0D9488" name="Somya Nayak" />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "2 days ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a2",
    cells: {
      name:        <AssetName icon={smsIcon} name="Built a flash sale SMS using Liquid product variables with a 7-day..." />,
      type:        <TypeBadge type="SMS" />,
      createdBy:   <UserAvatar initial="R" color="#8B5CF6" name="rana" />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "3 days ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a3",
    cells: {
      name:        <AssetName icon={emailIcon} name="Removed the JSON wrapper entirely — outputting only the raw H..." />,
      type:        <TypeBadge type="Email Plain" />,
      createdBy:   <UserAvatar initial="SN" color="#0D9488" name="Somya Nayak" />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 week ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a4",
    cells: {
      name:        <AssetName icon={imgIcon} name="Generate an image of the brand character holding a can of Co" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a5",
    cells: {
      name:        <AssetName icon={imgIcon} name="Generate an image of the brand character holding a water tum" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a6",
    cells: {
      name:        <AssetName icon={imgIcon} name="a beautifully wrapped gift box with a satin ribbon on a clea" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a7",
    cells: {
      name:        <AssetName icon={imgIcon} name="Create an image of the brand character holding a bottle. Use" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a8",
    cells: {
      name:        <AssetName icon={imgIcon} name="Dev Patel, solo founder, sitting at a rustic desk with a lap" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a9",
    cells: {
      name:        <AssetName icon={imgIcon} name="diverse group of tech professionals collaborating in a moder" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a10",
    cells: {
      name:        <AssetName icon={imgIcon} name="dramatic overhead shot of scattered shopping bags and gift b" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a11",
    cells: {
      name:        <AssetName icon={imgIcon} name="Product photography of a pair of classic black leather penny" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="R" color="#6366F1" name="Removed User" muted />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
  {
    id: "a12",
    cells: {
      name:        <AssetName icon={imgIcon} name="change character's pink pants to grey shorts" />,
      type:        <TypeBadge type="Image" />,
      createdBy:   <UserAvatar initial="TS" color="#F59E0B" name="Trishik Shrestha" />,
      status:      <StatusDot />,
      tags:        <span className="text-stone-400">—</span>,
      lastUpdated: { value: "1 month ago", muted: true },
    },
    menuItems: ASSET_MENU_ITEMS,
  },
];

// ── Name lookup (cells.name is JSX so we keep a plain-string map) ─────────────

const ASSET_NAME: Record<string, string> = {
  "a1":  "Claude design - Email 1",
  "a2":  "Built a flash sale SMS using Liquid product variables with a 7-day...",
  "a3":  "Removed the JSON wrapper entirely — outputting only the raw H...",
  "a4":  "Generate an image of the brand character holding a can of Co",
  "a5":  "Generate an image of the brand character holding a water tum",
  "a6":  "a beautifully wrapped gift box with a satin ribbon on a clea",
  "a7":  "Create an image of the brand character holding a bottle. Use",
  "a8":  "Dev Patel, solo founder, sitting at a rustic desk with a lap",
  "a9":  "diverse group of tech professionals collaborating in a moder",
  "a10": "dramatic overhead shot of scattered shopping bags and gift b",
  "a11": "Product photography of a pair of classic black leather penny",
  "a12": "change character's pink pants to grey shorts",
};

// ── row metadata for filter/sort ──────────────────────────────────────────────

const ROW_META: Record<string, { type: string; updatedRank: number }> = {
  a1:  { type: "Email Plain", updatedRank: 1 },
  a2:  { type: "SMS",         updatedRank: 2 },
  a3:  { type: "Email Plain", updatedRank: 3 },
  a4:  { type: "Image",       updatedRank: 4 },
  a5:  { type: "Image",       updatedRank: 5 },
  a6:  { type: "Image",       updatedRank: 6 },
  a7:  { type: "Image",       updatedRank: 7 },
  a8:  { type: "Image",       updatedRank: 8 },
  a9:  { type: "Image",       updatedRank: 9 },
  a10: { type: "Image",       updatedRank: 10 },
  a11: { type: "Image",       updatedRank: 11 },
  a12: { type: "Image",       updatedRank: 12 },
};

const FILTER_CONFIG: FilterConfig = {
  sortFields: ["Updated", "Name", "Type"],
  groups: [
    {
      label: "Type",
      options: [
        { key: "Email Plain", label: "Email Plain" },
        { key: "SMS",         label: "SMS" },
        { key: "Image",       label: "Image" },
      ],
    },
  ],
};

// ── view ──────────────────────────────────────────────────────────────────────

export default function AssetLibraryView() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return ASSET_MENU_ITEMS.map((item) => {
      if (item.label === "Edit") return { ...item, onClick: () => navigate(`/asset-library/${row.id}`) };
      if (item.label === "Delete") return { ...item, onClick: () => setDeleteTarget({ id: row.id, name: ASSET_NAME[row.id] ?? row.id }) };
      return item;
    });
  }

  const displayRows = useMemo(() => {
    let rows = ROWS.filter((r) => !deletedIds.has(r.id));
    if (activeFilters.size > 0) {
      rows = rows.filter((r) => activeFilters.has(ROW_META[r.id]?.type ?? ""));
    }
    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let cmp = 0;
        if (sortField === "Updated") cmp = (ROW_META[a.id]?.updatedRank ?? 99) - (ROW_META[b.id]?.updatedRank ?? 99);
        else if (sortField === "Name") cmp = (ASSET_NAME[a.id] ?? "").localeCompare(ASSET_NAME[b.id] ?? "");
        else if (sortField === "Type") cmp = (ROW_META[a.id]?.type ?? "").localeCompare(ROW_META[b.id]?.type ?? "");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows.map((r) => ({ ...r, menuItems: makeMenu(r) }));
  }, [deletedIds, activeFilters, sortField, sortDir]);

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-x-hidden">
      <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} />, count: displayRows.length }]} activeTab="table" />

      <div className="flex flex-1 min-h-0 flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={displayRows}
          searchPlaceholder="Search assets..."
          onRowClick={(row) => navigate(`/asset-library/${row.id}`)}
          filterConfig={FILTER_CONFIG}
          onFilterChange={(f) => setActiveFilters(f)}
          onSortChange={(f, d) => { setSortField(f); setSortDir(d); }}
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create asset</span>
            </button>
          }
        />
      </div>

      {drawerOpen && <CreateAssetDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="asset"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
