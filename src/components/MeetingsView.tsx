

import { useState } from "react";
import { CalendarDays, Link2, Plus, Table2, Trash2 } from "lucide-react";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── Table data ─────────────────────────────────────────────────────────────────

const MEETING_COLUMNS: TableColumn[] = [
  { key: "meeting",      label: "Meeting",      width: "28%" },
  { key: "startTime",    label: "Start time",   width: "18%" },
  { key: "endTime",      label: "End time",     width: "18%" },
  { key: "participants", label: "Participants", width: "22%" },
  { key: "status",       label: "Status",       width: "14%" },
];

function MeetingName({ name }: { name: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
        <CalendarDays size={15} />
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
}

function Participant({ initial, name, more, color }: { initial: string; name: string; more: string; color: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${color}`}>{initial}</span>
      <span className="truncate">{name}</span>
      <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{more}</span>
    </span>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "blue" | "red" | "green" }) {
  const color = {
    blue:  "bg-blue-50 text-blue-700 dark:bg-blue-500/12 dark:text-blue-300",
    red:   "bg-red-50 text-red-500 dark:bg-red-500/12 dark:text-red-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
  }[tone];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>{label}</span>;
}

const MEETING_ROWS: TableRow[] = [
  { id: "product-sync-jun4",   href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="Product Sync" />,                    startTime: "Jun 4, 2026 07:00 PM", endTime: "Jun 4, 2026 07:30 PM", participants: <Participant initial="R" name="rana@intempt.c..."    more="+4 more"  color="bg-slate-200 !text-slate-500" />, status: <StatusBadge label="Scheduled"     tone="blue"  /> } },
  { id: "rd-checkin-jun4",     href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="R&D check-in" />,                    startTime: "Jun 4, 2026 08:00 PM", endTime: "Jun 4, 2026 08:30 PM", participants: <Participant initial="M" name="matvey@intempt..."   more="+10 more" color="bg-orange-500"               />, status: <StatusBadge label="Scheduled"     tone="blue"  /> } },
  { id: "desktop-discussion",                                  cells: { meeting: <MeetingName name="Discussion about Desktop a..." />,   startTime: "Jun 4, 2026 03:30 PM", endTime: "Jun 4, 2026 04:00 PM", participants: <Participant initial="A" name="aman.patel@inte..."  more="+2 more"  color="bg-emerald-500"               />, status: <StatusBadge label="Not Allowed In" tone="red"   /> } },
  { id: "test-meeting-1215",                                   cells: { meeting: <MeetingName name="Test Meeting" />,                    startTime: "Jun 4, 2026 12:15 PM", endTime: "Jun 4, 2026 12:30 PM", participants: <Participant initial="G" name="gugushvilibesik..."  more="+1 more"  color="bg-pink-500"                  />, status: <StatusBadge label="Canceled"       tone="red"   /> } },
  { id: "test-meeting-blocked",                                cells: { meeting: <MeetingName name="Test Meeting" />,                    startTime: "Jun 4, 2026 12:15 PM", endTime: "Jun 4, 2026 12:30 PM", participants: <Participant initial="R" name="rana@intempt.c..."    more="+1 more"  color="bg-slate-200 !text-slate-500" />, status: <StatusBadge label="Not Allowed In" tone="red"   /> } },
  { id: "rd-standup-jun4",                                     cells: { meeting: <MeetingName name="R&D Standup" />,                    startTime: "Jun 4, 2026 11:30 AM", endTime: "Jun 4, 2026 12:00 PM", participants: <Participant initial="M" name="matvey@intempt..."   more="+10 more" color="bg-orange-500"               />, status: <StatusBadge label="Denied Entry"   tone="red"   /> } },
  { id: "rd-standup-jun5",                                     cells: { meeting: <MeetingName name="R&D Standup" />,                    startTime: "Jun 5, 2026 11:30 AM", endTime: "Jun 5, 2026 12:00 PM", participants: <Participant initial="M" name="matvey@intempt..."   more="+10 more" color="bg-orange-500"               />, status: <StatusBadge label="Scheduled"     tone="blue"  /> } },
  { id: "rd-checkin-jun3",                                     cells: { meeting: <MeetingName name="R&D check-in" />,                   startTime: "Jun 3, 2026 08:00 PM", endTime: "Jun 3, 2026 09:03 PM", participants: <Participant initial="K" name="koray@intempt.c..."   more="+11 more" color="bg-red-500"                  />, status: <StatusBadge label="Completed"     tone="green" /> } },
];

// ── Add to live meeting drawer ─────────────────────────────────────────────────

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Turkish", "Arabic", "Japanese", "Chinese"];

function AddToLiveMeetingDrawer({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState("English");

  return (
    <SlidingSidebar
      title="Add to live meeting"
      description="Join a live meeting by providing the meeting link below."
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
            Join meeting
          </button>
        </>
      )}
    >
      <div className="space-y-5">
        {/* Name */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">
            Name your meeting{" "}
            <span className="font-normal text-stone-400 dark:text-stone-500">(Optional)</span>
          </span>
          <input
            placeholder="E.g. Product team sync"
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500"
          />
        </label>

        {/* Meeting link */}
        <label className="block">
          <span className="mb-0.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">Meeting link</span>
          <p className="mb-1.5 text-xs text-stone-400 dark:text-stone-500">
            Capture meetings from GMeet, Zoom, MS Teams, and more.
          </p>
          <div
            className="flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 transition-colors focus-within:border-stone-400 dark:border-(--border) dark:bg-white/3 dark:focus-within:border-stone-500"
          >
            <Link2 size={14} className="shrink-0 text-stone-400" />
            <input
              placeholder="https://meet.google.com/..."
              className="flex-1 bg-transparent text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
        </label>

        {/* Meeting language */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">Meeting language</span>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 pr-9 text-sm font-medium text-stone-900 outline-none transition-colors focus:border-stone-400 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:focus:border-stone-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </label>
      </div>
    </SlidingSidebar>
  );
}

// ── Name lookup (cells.meeting is JSX so we keep a plain-string map) ──────────

const MEETING_NAME: Record<string, string> = {
  "product-sync-jun4":    "Product Sync",
  "rd-checkin-jun4":      "R&D check-in",
  "desktop-discussion":   "Discussion about Desktop",
  "test-meeting-1215":    "Test Meeting",
  "test-meeting-blocked": "Test Meeting",
  "rd-standup-jun4":      "R&D Standup",
  "rd-standup-jun5":      "R&D Standup",
  "rd-checkin-jun3":      "R&D check-in",
};

// ── Main view ──────────────────────────────────────────────────────────────────

export default function MeetingsView() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: MEETING_NAME[row.id] ?? row.id }) }
        : item
    );
  }

  const displayRows = MEETING_ROWS
    .filter((r) => !deletedIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="flex flex-1 flex-col min-h-0 relative overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        <button className="flex h-9 items-center gap-2 px-3 rounded-lg bg-blue-50 text-sm font-medium text-blue-600 transition-colors duration-100 dark:bg-blue-500/10 dark:text-blue-400">
          <Table2 size={15} />
          Table
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={MEETING_COLUMNS}
          rows={displayRows}
          searchPlaceholder="Search meetings..."
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              Add to live meeting
            </button>
          }
        />
      </div>

      {drawerOpen && <AddToLiveMeetingDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="meeting"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
