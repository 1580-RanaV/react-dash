

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Filter, Globe, HandCoins, LayoutDashboard, Pencil, Plus, RotateCcw, Trash2, TrendingUp } from "lucide-react";
import ViewTabs from "./ViewTabs";
import DashboardTable, { FilterConfig, TableColumn, TableRow } from "./DashboardTable";
import { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import SlidingSidebar from "./SlidingSidebar";
import { BOARDS_DATA, BoardEntry, BoardType } from "./boards/boardsData";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

function TypeBadge({ type }: { type: BoardType }) {
  const config: Record<BoardType, { icon: React.ReactNode; label: string }> = {
    retention:  { icon: <RotateCcw size={12} />,     label: "Retention"  },
    dashboard:  { icon: <LayoutDashboard size={12} />, label: "Dashboard" },
    insights:   { icon: <TrendingUp size={12} />,     label: "Insights"   },
    funnel:     { icon: <Filter size={12} />,         label: "Funnel"     },
    traffic:    { icon: <Globe size={12} />,          label: "Traffic"    },
    revenue:    { icon: <HandCoins size={12} />,      label: "Revenue"    },
    engagement: { icon: <Activity size={12} />,       label: "Engagement" },
  };
  const { icon, label } = config[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 dark:border-(--border) dark:bg-white/4 dark:text-stone-300">
      {icon}
      {label}
    </span>
  );
}

function UserAvatar({ initials, color, name }: { initials: string; color: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {initials}
      </span>
      <span>{name}</span>
    </div>
  );
}

function InlineEditor({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave(val)}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); onSave(val); }
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-blue-400 bg-white px-2 py-0.5 text-sm font-medium text-stone-900 outline-none ring-2 ring-blue-500/15 dark:bg-(--input) dark:text-stone-100"
    />
  );
}


const BOARD_TYPES = [
  { key: "insights",   Icon: TrendingUp,     label: "Insights"   },
  { key: "funnel",     Icon: Filter,         label: "Funnel"     },
  { key: "retention",  Icon: RotateCcw,      label: "Retention"  },
  { key: "dashboard",  Icon: LayoutDashboard, label: "Dashboard" },
  { key: "traffic",    Icon: Globe,          label: "Traffic"    },
  { key: "revenue",    Icon: HandCoins,      label: "Revenue"    },
  { key: "engagement", Icon: Activity,       label: "Engagement" },
] as const;

const VIEW_TABS = [
  { key: "all",        label: "All",        icon: null },
  { key: "insights",   label: "Insights",   icon: <TrendingUp size={14} /> },
  { key: "funnel",     label: "Funnels",    icon: <Filter size={14} /> },
  { key: "retention",  label: "Retention",  icon: <RotateCcw size={14} /> },
  { key: "traffic",    label: "Traffic",    icon: <Globe size={14} /> },
  { key: "revenue",    label: "Revenue",    icon: <HandCoins size={14} /> },
  { key: "engagement", label: "Engagement", icon: <Activity size={14} /> },
  { key: "dashboard",  label: "Dashboards", icon: <LayoutDashboard size={14} /> },
];

function CreateBoardDrawer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string>("insights");

  return (
    <SlidingSidebar
      title="Create board"
      description="Choose the type of board you want to create."
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create board
          </button>
        </>
      )}
    >
      <div className="space-y-1.5">
        {BOARD_TYPES.map(({ key, Icon, label }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all duration-100"
              style={{
                border: isSelected ? "1.5px solid #0080FF" : "1.5px solid var(--border)",
                background: isSelected ? "rgba(0,128,255,0.04)" : "var(--content-bg)",
              }}
            >
              <span className={isSelected ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}>
                <Icon size={17} />
              </span>
              <span className={`text-sm font-medium ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-stone-700 dark:text-stone-300"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </SlidingSidebar>
  );
}

const COLUMNS: TableColumn[] = [
  { key: "title", label: "Title", width: "30%" },
  { key: "type", label: "Type", width: "160px" },
  { key: "lastUpdated", label: "Last Updated", width: "210px" },
  { key: "createdBy", label: "Created By", width: "200px" },
];

const BOARDS_FILTER: FilterConfig = {
  sortFields: ["Name", "Type", "Last updated"],
};

function defaultHref(entry: BoardEntry) {
  if (entry.href) return entry.href;
  if (entry.type === "dashboard") return `/dashboards/${entry.id}`;
  return `/boards/${entry.id}`;
}

export default function BoardsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = VIEW_TABS.some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "all";
  function setTab(key: string) { navigate(`/boards?tab=${key}`, { replace: true }); }

  const [entries, setEntries] = useState<BoardEntry[]>(BOARDS_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  function startEditing(id: string) { setEditingId(id); }
  function saveEdit(id: string, newTitle: string) {
    const trimmed = newTitle.trim();
    if (trimmed) setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title: trimmed } : e)));
    setEditingId(null);
  }
  function cancelEdit() { setEditingId(null); }

  function menuItemsFor(entry: BoardEntry): ThreeDotsMenuItem[] {
    return [
      { label: "Rename", icon: Pencil, onClick: () => startEditing(entry.id) },
      { label: "Delete", icon: Trash2, tone: "danger", onClick: () => setDeleteTarget({ id: entry.id, title: entry.title }) },
    ];
  }

  const filtered = activeTab === "all" ? entries : entries.filter((e) => e.type === activeTab);

  const tabsWithCounts = VIEW_TABS.map((t) => ({
    ...t,
    count: t.key === "all" ? entries.length : entries.filter((e) => e.type === t.key).length || null,
  }));

  const tableRows: TableRow[] = filtered.map((entry) => ({
    id: entry.id,
    href: defaultHref(entry),
    menuItems: menuItemsFor(entry),
    cells: {
      title: editingId === entry.id
        ? <InlineEditor value={entry.title} onSave={(val) => saveEdit(entry.id, val)} onCancel={cancelEdit} />
        : entry.title,
      type: <TypeBadge type={entry.type} />,
      lastUpdated: entry.lastUpdated,
      createdBy: <UserAvatar {...entry.createdBy} />,
    },
  }));

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <ViewTabs tabs={tabsWithCounts} activeTab={activeTab} onChange={setTab} />

      <div key={activeTab} className="flex-1 min-h-0 px-4 py-4 flex flex-col animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={tableRows}
          searchPlaceholder="Search boards..."
          filterConfig={BOARDS_FILTER}
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create board</span>
            </button>
          }
        />
      </div>
      {drawerOpen && <CreateBoardDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="board"
          entityName={deleteTarget.title}
          onConfirm={() => {
            setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
