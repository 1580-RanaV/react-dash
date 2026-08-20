

import { useEffect, useRef, useState } from "react";
import { Plus, Table2, ArrowUpDown, ArrowUp, ArrowDown, X, Search, GripVertical, Eye, Check, SkipForward, Trash2 } from "lucide-react";
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ViewTabs from "./ViewTabs";
import CreateTaskDrawer from "./CreateTaskDrawer";
import TaskDetailDrawer from "./TaskDetailDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import type { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import { StatusBadge, PriorityBadge, TypeBadge, OwnerAvatar, type TaskRecord, type Priority } from "./taskShared";

// ── static data ───────────────────────────────────────────────────────────────

const TASKS_SEED: TaskRecord[] = [
  { id: "t1",  taskName: "Let's explore a solution?",         type: "Email",    userName: "Sandra Jackson",   userInitial: "SJ", userColor: "#8B5CF6", account: "Sendoso",             priority: "Medium", dueDisplay: "1 day ago",    dueRank: -1, overdue: true,  createdDate: "2026-08-05", status: "Open" },
  { id: "t2",  taskName: "Free for a call?",                   type: "Email",    userName: "Ashton Summers",   userInitial: "AS", userColor: "#0D9488", account: "AssemblyAI",          priority: "Medium", dueDisplay: "1 day ago",    dueRank: -1, overdue: true,  createdDate: "2026-08-06", status: "Open" },
  { id: "t3",  taskName: "Free for a call?",                   type: "Email",    userName: "Walter Scott",     userInitial: "WS", userColor: "#6366F1", account: "JustWorks",           priority: "Low",    dueDisplay: "1 day ago",    dueRank: -1, overdue: false, createdDate: "2026-08-04", status: "Completed" },
  { id: "t4",  taskName: "Can you point me in the right direction?", type: "Email", userName: "James Mitchell", userInitial: "JM", userColor: "#D97706", account: "LogRocket",          priority: "Medium", dueDisplay: "1 day ago",    dueRank: -1, overdue: false, createdDate: "2026-08-03", status: "Completed" },
  { id: "t5",  taskName: "Send a connection request",          type: "LinkedIn", userName: "Vanessa Connors",  userInitial: "VC", userColor: "#E11D48", account: "Semgrep",             priority: "Medium", dueDisplay: "1 day ago",    dueRank: -1, overdue: false, createdDate: "2026-08-02", status: "Completed" },
  { id: "t6",  taskName: "View profile",                       type: "LinkedIn", userName: "Jack Rodgers",     userInitial: "JR", userColor: "#0284C7", account: "Varc",                priority: "High",   dueDisplay: "In 1 hour",   dueRank: 0,  overdue: false, createdDate: "2026-08-15", status: "Open" },
  { id: "t7",  taskName: "Schedule a meeting",                 type: "Custom",   userName: "Victor Borodenko", userInitial: "VB", userColor: "#65A30D", account: "TickTock",            priority: "Low",    dueDisplay: "In 1 hour",   dueRank: 0,  overdue: false, createdDate: "2026-08-16", status: "Open" },
  { id: "t8",  taskName: "Get on a demo call",                 type: "Call",     userName: "Jason Wonders",    userInitial: "JW", userColor: "#DB2777", account: "TicketBot",           priority: "High",   dueDisplay: "In 7 minutes", dueRank: 0, overdue: false, createdDate: "2026-08-17", status: "Open" },
  { id: "t9",  taskName: "Follow up with prospects",           type: "Email",    userName: "Luis Hernandez",   userInitial: "LH", userColor: "#0891B2", account: "TechCorp",            priority: "High",   dueDisplay: "Tomorrow",    dueRank: 1,  overdue: false, createdDate: "2026-08-10", status: "Completed" },
  { id: "t10", taskName: "Demo presentation",                  type: "Call",     userName: "Tom Randle",       userInitial: "TR", userColor: "#9333EA", account: "Enterprise Co",       priority: "Medium", dueDisplay: "Next week",   dueRank: 7,  overdue: false, createdDate: "2026-08-09", status: "Completed" },
  { id: "t11", taskName: "Follow up on proposal",               type: "Email",    userName: "Maria Rodriguez",  userInitial: "MR", userColor: "#CA8A04", account: "TechFlow",            priority: "High",   dueDisplay: "3 days ago",  dueRank: -3, overdue: true,  createdDate: "2026-08-01", status: "Open" },
  { id: "t12", taskName: "Connect with decision maker",         type: "LinkedIn", userName: "David Chen",       userInitial: "DC", userColor: "#059669", account: "DataSync",            priority: "Medium", dueDisplay: "2 days ago",  dueRank: -2, overdue: true,  createdDate: "2026-08-07", status: "Open" },
  { id: "t13", taskName: "Quarterly review call",               type: "Call",     userName: "Sarah Williams",   userInitial: "SW", userColor: "#8B5CF6", account: "CloudTech",           priority: "High",   dueDisplay: "5 days ago",  dueRank: -5, overdue: true,  createdDate: "2026-07-28", status: "Open" },
  { id: "t14", taskName: "Send contract details",               type: "Custom",   userName: "Michael Brown",    userInitial: "MB", userColor: "#0D9488", account: "GlobalCorp",          priority: "Medium", dueDisplay: "4 days ago",  dueRank: -4, overdue: true,  createdDate: "2026-07-30", status: "Open" },
  { id: "t15", taskName: "Schedule product demo",               type: "Email",    userName: "Anna Thompson",    userInitial: "AT", userColor: "#6366F1", account: "MarketFlow",          priority: "High",   dueDisplay: "1 week ago",  dueRank: -7, overdue: true,  createdDate: "2026-07-20", status: "Open" },
  { id: "t16", taskName: "Send onboarding checklist",           type: "Email",    userName: "Priya Nair",       userInitial: "PN", userColor: "#6366F1", account: "Loopscale",           priority: "Medium", dueDisplay: "In 2 hours",  dueRank: 0,  overdue: false, createdDate: "2026-08-14", status: "Open" },
  { id: "t17", taskName: "Review renewal pricing",              type: "Custom",   userName: "Marcus Webb",      userInitial: "MW", userColor: "#D97706", account: "Northwind Labs",      priority: "Low",    dueDisplay: "In 3 hours",  dueRank: 0,  overdue: false, createdDate: "2026-08-13", status: "Open" },
  { id: "t18", taskName: "Accept connection invite",            type: "LinkedIn", userName: "Elena Petrova",    userInitial: "EP", userColor: "#E11D48", account: "Brightline",          priority: "Medium", dueDisplay: "Tomorrow",    dueRank: 1,  overdue: false, createdDate: "2026-08-12", status: "Open" },
  { id: "t19", taskName: "Prep contract redlines",              type: "Custom",   userName: "Derek Foss",       userInitial: "DF", userColor: "#0284C7", account: "Vantage Retail",      priority: "High",   dueDisplay: "In 4 hours",  dueRank: 0,  overdue: false, createdDate: "2026-08-11", status: "Open" },
  { id: "t20", taskName: "Cold call new lead",                  type: "Call",     userName: "Natalie Cruz",     userInitial: "NC", userColor: "#65A30D", account: "Fernwood Analytics",  priority: "High",   dueDisplay: "In 30 minutes", dueRank: 0, overdue: false, createdDate: "2026-08-15", status: "Open" },
  { id: "t21", taskName: "Send case study",                     type: "Email",    userName: "Omar Haddad",      userInitial: "OH", userColor: "#DB2777", account: "Circuit Robotics",    priority: "Medium", dueDisplay: "Tomorrow",    dueRank: 1,  overdue: false, createdDate: "2026-08-13", status: "Open" },
  { id: "t22", taskName: "Endorse skills on profile",           type: "LinkedIn", userName: "Grace Lin",        userInitial: "GL", userColor: "#0891B2", account: "Solstice Health",     priority: "Low",    dueDisplay: "Next week",   dueRank: 7,  overdue: false, createdDate: "2026-08-08", status: "Open" },
  { id: "t23", taskName: "Kickoff call with new account",       type: "Call",     userName: "Felix Turner",     userInitial: "FT", userColor: "#9333EA", account: "Beacon Freight",      priority: "High",   dueDisplay: "In 1 hour",   dueRank: 0,  overdue: false, createdDate: "2026-08-16", status: "Open" },
  { id: "t24", taskName: "Send renewal reminder",               type: "Email",    userName: "Priya Nair",       userInitial: "PN", userColor: "#6366F1", account: "Loopscale",           priority: "Medium", dueDisplay: "6 days ago",  dueRank: -6, overdue: true,  createdDate: "2026-07-25", status: "Open" },
  { id: "t25", taskName: "Share integration docs",              type: "Custom",   userName: "Isla Fraser",      userInitial: "IF", userColor: "#CA8A04", account: "Reef Commerce",       priority: "Low",    dueDisplay: "2 days ago",  dueRank: -2, overdue: true,  createdDate: "2026-08-06", status: "Open" },
  { id: "t26", taskName: "Congratulate on promotion",           type: "LinkedIn", userName: "Marcus Webb",      userInitial: "MW", userColor: "#D97706", account: "Northwind Labs",      priority: "Low",    dueDisplay: "3 days ago",  dueRank: -3, overdue: true,  createdDate: "2026-08-04", status: "Open" },
  { id: "t27", taskName: "Escalate support ticket",             type: "Call",     userName: "Dana Kowalski",    userInitial: "DK", userColor: "#059669", account: "Pinehill Studios",    priority: "High",   dueDisplay: "1 day ago",   dueRank: -1, overdue: true,  createdDate: "2026-08-09", status: "Open" },
  { id: "t28", taskName: "Send proposal follow-up",             type: "Email",    userName: "Elena Petrova",    userInitial: "EP", userColor: "#E11D48", account: "Brightline",          priority: "Medium", dueDisplay: "4 days ago",  dueRank: -4, overdue: true,  createdDate: "2026-08-03", status: "Open" },
  { id: "t29", taskName: "Book renewal review",                 type: "Call",     userName: "Tobias Reed",      userInitial: "TR", userColor: "#8B5CF6", account: "Ashgrove Media",      priority: "Medium", dueDisplay: "Tomorrow",    dueRank: 1,  overdue: false, createdDate: "2026-08-11", status: "Completed" },
  { id: "t30", taskName: "Send thank-you note",                 type: "Email",    userName: "Natalie Cruz",     userInitial: "NC", userColor: "#65A30D", account: "Fernwood Analytics",  priority: "Low",    dueDisplay: "1 week ago",  dueRank: -7, overdue: false, createdDate: "2026-07-18", status: "Completed" },
  { id: "t31", taskName: "Complete onboarding call",            type: "Call",     userName: "Omar Haddad",      userInitial: "OH", userColor: "#DB2777", account: "Circuit Robotics",    priority: "Medium", dueDisplay: "Next week",   dueRank: 7,  overdue: false, createdDate: "2026-08-07", status: "Completed" },
  { id: "t32", taskName: "Share ROI calculator",                type: "Email",    userName: "Grace Lin",        userInitial: "GL", userColor: "#0891B2", account: "Solstice Health",     priority: "High",   dueDisplay: "5 days ago",  dueRank: -5, overdue: false, createdDate: "2026-07-29", status: "Completed" },
  { id: "t33", taskName: "Confirm meeting agenda",              type: "Custom",   userName: "Felix Turner",     userInitial: "FT", userColor: "#9333EA", account: "Beacon Freight",      priority: "Medium", dueDisplay: "Tomorrow",    dueRank: 1,  overdue: false, createdDate: "2026-08-14", status: "Completed" },
  { id: "t34", taskName: "Follow up after demo",                type: "Email",    userName: "Isla Fraser",      userInitial: "IF", userColor: "#CA8A04", account: "Reef Commerce",       priority: "High",   dueDisplay: "2 days ago",  dueRank: -2, overdue: false, createdDate: "2026-08-05", status: "Completed" },
  { id: "t35", taskName: "Send NDA for review",                 type: "Custom",   userName: "Dana Kowalski",    userInitial: "DK", userColor: "#059669", account: "Pinehill Studios",    priority: "Low",    dueDisplay: "3 days ago",  dueRank: -3, overdue: false, createdDate: "2026-08-02", status: "Completed" },
];

const COLUMNS: TableColumn[] = [
  { key: "taskName",   label: "Task Name",   width: "24%" },
  { key: "type",       label: "Type",        width: "13%" },
  { key: "user",       label: "User",        width: "15%" },
  { key: "account",    label: "Account",     width: "15%" },
  { key: "priority",   label: "Priority",    width: "11%" },
  { key: "due",        label: "Due",         width: "11%" },
  { key: "status",     label: "Status",      width: "11%" },
];

function toTableRow(t: TaskRecord, menuItems: ThreeDotsMenuItem[]): TableRow {
  return {
    id: t.id,
    menuItems,
    cells: {
      taskName: t.taskName,
      type:     <TypeBadge type={t.type} />,
      user:     <OwnerAvatar initial={t.userInitial} color={t.userColor} name={t.userName} />,
      account:  t.account,
      priority: <PriorityBadge priority={t.priority} />,
      due:      t.overdue
        ? { value: t.dueDisplay, subValue: <span className="font-semibold text-red-500 dark:text-red-400">Overdue</span> }
        : { value: t.dueDisplay, muted: true },
      status:   <StatusBadge status={t.status} />,
    },
  };
}

function buildTaskMenuItems(
  t: TaskRecord,
  actions: { onView: (id: string) => void; onComplete: (id: string) => void; onDelete: (id: string) => void }
): ThreeDotsMenuItem[] {
  return [
    { label: "View", icon: Eye, onClick: () => actions.onView(t.id) },
    { label: "Complete", icon: Check, onClick: () => actions.onComplete(t.id) },
    { label: "Skip", icon: SkipForward },
    { label: "Delete", icon: Trash2, tone: "danger", onClick: () => actions.onDelete(t.id) },
  ];
}

// ── multi-sort menu ────────────────────────────────────────────────────────────

type SortRule = { id: string; field: string; dir: "asc" | "desc" };

const SORT_ATTRS: { key: string; label: string }[] = [
  { key: "taskName",    label: "Task name" },
  { key: "userName",    label: "Assignee" },
  { key: "dueRank",     label: "Due date" },
  { key: "priority",    label: "Priority" },
  { key: "status",      label: "Status" },
  { key: "type",        label: "Type" },
  { key: "createdDate", label: "Created date" },
  { key: "account",     label: "Account" },
];

const PRIORITY_RANK: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };

function compareTasks(a: TaskRecord, b: TaskRecord, field: string): number {
  if (field === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (field === "dueRank") return a.dueRank - b.dueRank;
  if (field === "createdDate") return a.createdDate.localeCompare(b.createdDate);
  const av = String(a[field as keyof TaskRecord] ?? "");
  const bv = String(b[field as keyof TaskRecord] ?? "");
  return av.localeCompare(bv);
}

function sortTasks(tasks: TaskRecord[], rules: SortRule[]): TaskRecord[] {
  if (!rules.length) return tasks;
  return [...tasks].sort((a, b) => {
    for (const rule of rules) {
      const cmp = compareTasks(a, b, rule.field);
      if (cmp !== 0) return rule.dir === "asc" ? cmp : -cmp;
    }
    return 0;
  });
}

function SortRuleRow({
  rule, index, onDirChange, onRemove,
}: {
  rule: SortRule;
  index: number;
  onDirChange: (dir: "asc" | "desc") => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id });
  const label = SORT_ATTRS.find((a) => a.key === rule.field)?.label ?? rule.field;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-2 rounded-lg px-1.5 py-1.5"
    >
      <button type="button" {...attributes} {...listeners} className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-stone-300 active:cursor-grabbing dark:text-stone-600">
        <GripVertical size={14} />
      </button>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600 dark:bg-white/8 dark:text-stone-300">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</span>
      <div className="flex shrink-0 items-center gap-0.5 rounded-lg p-0.5" style={{ background: "var(--muted)" }}>
        <button
          type="button"
          onClick={() => onDirChange("asc")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            rule.dir === "asc" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-400 hover:text-stone-600 dark:text-stone-500"
          }`}
        >
          <ArrowUp size={11} /> Asc
        </button>
        <button
          type="button"
          onClick={() => onDirChange("desc")}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            rule.dir === "desc" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-400 hover:text-stone-600 dark:text-stone-500"
          }`}
        >
          <ArrowDown size={11} /> Desc
        </button>
      </div>
      <button type="button" onClick={onRemove} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-200">
        <X size={13} />
      </button>
    </div>
  );
}

function SortMenu({ rules, setRules }: { rules: SortRule[]; setRules: (r: SortRule[]) => void }) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const usedFields = new Set(rules.map((r) => r.field));
  const available = SORT_ATTRS.filter((a) => !usedFields.has(a.key) && a.label.toLowerCase().includes(query.toLowerCase()));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = rules.findIndex((r) => r.id === active.id);
    const newIdx = rules.findIndex((r) => r.id === over.id);
    setRules(arrayMove(rules, oldIdx, newIdx));
  }

  function addRule(field: string) {
    setRules([...rules, { id: `sort-${field}-${rules.length}`, field, dir: "asc" }]);
    setPickerOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-sm font-medium transition-colors ${
          rules.length > 0
            ? "border-stone-200 bg-blue-50 text-blue-600 dark:border-(--border) dark:bg-blue-500/10 dark:text-blue-400"
            : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100"
        }`}
      >
        <ArrowUpDown size={13} />
        <span className="hidden sm:inline">Sort</span>
        {rules.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-400 dark:text-stone-900">
            {rules.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-80 rounded-xl p-3 animate-card-in"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-start justify-between px-1 pb-2">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Sort by</p>
              <p className="text-xs text-stone-400 dark:text-stone-500">{rules.length} {rules.length === 1 ? "priority" : "priorities"}</p>
            </div>
            {rules.length > 0 && (
              <button type="button" onClick={() => setRules([])} className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-600">
                Clear all
              </button>
            )}
          </div>

          {rules.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <div className="mb-2 flex flex-col gap-1">
                  {rules.map((rule, i) => (
                    <SortRuleRow
                      key={rule.id}
                      rule={rule}
                      index={i}
                      onDirChange={(dir) => setRules(rules.map((r) => (r.id === rule.id ? { ...r, dir } : r)))}
                      onRemove={() => setRules(rules.filter((r) => r.id !== rule.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((o) => !o)}
              disabled={available.length === 0 && !pickerOpen}
              className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-default disabled:opacity-50 dark:text-stone-300 dark:hover:bg-white/6"
              style={{ background: "var(--muted)" }}
            >
              <Plus size={14} />
              Add sort priority
            </button>

            {pickerOpen && (
              <div
                className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl animate-card-in"
                style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
              >
                <div className="border-b p-2" style={{ borderColor: "var(--border)" }}>
                  <div className="relative">
                    <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search attributes..."
                      className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-7 pr-2 text-xs font-medium text-stone-800 outline-none transition-colors focus:border-blue-400 dark:border-(--border) dark:bg-white/3 dark:text-stone-100"
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {available.length === 0 ? (
                    <p className="px-3 py-3 text-center text-xs text-stone-400 dark:text-stone-500">No matching attributes</p>
                  ) : (
                    available.map((a) => (
                      <button
                        key={a.key}
                        type="button"
                        onMouseDown={() => addRule(a.key)}
                        className="block w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
                      >
                        {a.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── view ──────────────────────────────────────────────────────────────────────

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskRecord[]>(TASKS_SEED);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sortRules, setSortRules] = useState<SortRule[]>([{ id: "sort-dueRank-0", field: "dueRank", dir: "asc" }]);

  function handleComplete(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Completed" } : t)));
  }
  function handleStatusChange(id: string, status: TaskRecord["status"]) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }
  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTaskId((current) => (current === id ? null : current));
  }

  const rows = sortTasks(tasks, sortRules).map((t) =>
    toTableRow(t, buildTaskMenuItems(t, { onView: setSelectedTaskId, onComplete: handleComplete, onDelete: handleDelete }))
  );
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-x-hidden">
      <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} /> }]} activeTab="table" />

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={COLUMNS}
          rows={rows}
          searchPlaceholder="Search tasks..."
          sortControl={<SortMenu rules={sortRules} setRules={setSortRules} />}
          onRowClick={(row) => setSelectedTaskId(row.id)}
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create task</span>
            </button>
          }
        />
      </div>

      {drawerOpen && <CreateTaskDrawer onClose={() => setDrawerOpen(false)} />}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
          onDelete={() => handleDelete(selectedTask.id)}
        />
      )}
    </div>
  );
}
