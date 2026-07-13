

import { useState } from "react";
import { Bell, CalendarDays, ChevronDown, Link2, Plus, RefreshCw, Table2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";
import Toggle from "./Toggle";
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
  { id: "desktop-discussion",   href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="Discussion about Desktop a..." />,   startTime: "Jun 4, 2026 03:30 PM", endTime: "Jun 4, 2026 04:00 PM", participants: <Participant initial="A" name="aman.patel@inte..."  more="+2 more"  color="bg-emerald-500"               />, status: <StatusBadge label="Not Allowed In" tone="red"   /> } },
  { id: "test-meeting-1215",    href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="Test Meeting" />,                    startTime: "Jun 4, 2026 12:15 PM", endTime: "Jun 4, 2026 12:30 PM", participants: <Participant initial="G" name="gugushvilibesik..."  more="+1 more"  color="bg-pink-500"                  />, status: <StatusBadge label="Canceled"       tone="red"   /> } },
  { id: "test-meeting-blocked", href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="Test Meeting" />,                    startTime: "Jun 4, 2026 12:15 PM", endTime: "Jun 4, 2026 12:30 PM", participants: <Participant initial="R" name="rana@intempt.c..."    more="+1 more"  color="bg-slate-200 !text-slate-500" />, status: <StatusBadge label="Not Allowed In" tone="red"   /> } },
  { id: "rd-standup-jun4",      href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="R&D Standup" />,                    startTime: "Jun 4, 2026 11:30 AM", endTime: "Jun 4, 2026 12:00 PM", participants: <Participant initial="M" name="matvey@intempt..."   more="+10 more" color="bg-orange-500"               />, status: <StatusBadge label="Denied Entry"   tone="red"   /> } },
  { id: "rd-standup-jun5",      href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="R&D Standup" />,                    startTime: "Jun 5, 2026 11:30 AM", endTime: "Jun 5, 2026 12:00 PM", participants: <Participant initial="M" name="matvey@intempt..."   more="+10 more" color="bg-orange-500"               />, status: <StatusBadge label="Scheduled"     tone="blue"  /> } },
  { id: "rd-checkin-jun3",      href: "/meetings/rd-check-in", cells: { meeting: <MeetingName name="R&D check-in" />,                   startTime: "Jun 3, 2026 08:00 PM", endTime: "Jun 3, 2026 09:03 PM", participants: <Participant initial="K" name="koray@intempt.c..."   more="+11 more" color="bg-red-500"                  />, status: <StatusBadge label="Completed"     tone="green" /> } },
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

// ── Notifications tab ──────────────────────────────────────────────────────────

type NotifItem = { id: string; icon: React.ReactNode; title: string; desc: string; defaultOn: boolean };
type NotifSection = { id: string; label: string; hint: string; items: NotifItem[] };

const NOTIF_SECTIONS: NotifSection[] = [
  {
    id: "booking",
    label: "Booking",
    hint: "Event gets created, changed, or cancelled",
    items: [
      { id: "booking-confirm",   icon: <Bell size={15} />,      title: "Booking confirmation",    desc: "Keep hosts informed when new events are scheduled",          defaultOn: true  },
      { id: "reschedule-notif",  icon: <RefreshCw size={15} />, title: "Rescheduled notification", desc: "Notify host and invitee when an event is rescheduled",       defaultOn: true  },
      { id: "cancel-notif",      icon: <CalendarDays size={15} />, title: "Cancellation notification", desc: "Keep hosts up-to-date with cancelled events",           defaultOn: true  },
    ],
  },
  {
    id: "pre-meeting",
    label: "Pre-Meeting",
    hint: "Before the meeting starts",
    items: [
      { id: "meeting-reminder",  icon: <Bell size={15} />,      title: "Meeting reminder",        desc: "Send a reminder email before the meeting starts",            defaultOn: false },
    ],
  },
  {
    id: "post-meeting",
    label: "Post-Meeting",
    hint: "After the meeting ends",
    items: [
      { id: "recording-ready",   icon: <CalendarDays size={15} />, title: "Recording ready",      desc: "Notify participants when the recording is available",         defaultOn: true  },
      { id: "summary-ready",     icon: <Bell size={15} />,      title: "Summary ready",           desc: "Send meeting summary and action items to all attendees",      defaultOn: false },
    ],
  },
];

function NotificationsTab() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NOTIF_SECTIONS.forEach((s) => s.items.forEach((i) => { init[i.id] = i.defaultOn; }));
    return init;
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl">
        <div className="flex flex-col gap-7">
          {NOTIF_SECTIONS.map((section) => {
            const onCount = section.items.filter((i) => enabled[i.id]).length;
            const isCollapsed = collapsed[section.id];
            return (
              <div key={section.id}>
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [section.id]: !c[section.id] }))}
                  className="flex w-full items-center justify-between mb-3"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
                    <ChevronDown
                      size={15}
                      className={`text-stone-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                    />
                    {section.label}
                    <span className="text-xs font-medium text-stone-400 dark:text-stone-500">{onCount}/{section.items.length}</span>
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">{section.hint}</span>
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-0">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-3.5"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">
                            {item.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{item.title}</p>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <div className="ml-6 shrink-0">
                          <Toggle on={enabled[item.id]} onClick={() => setEnabled((e) => ({ ...e, [item.id]: !e[item.id] }))} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: "table",         label: "Table",         icon: <Table2 size={14} />, count: MEETING_ROWS.length },
  { key: "notifications", label: "Notifications",  icon: <Bell size={14} />,  count: null               },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function MeetingsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab") as TabKey
    : "table";
  function setTab(key: TabKey) { navigate(`/meetings?tab=${key}`, { replace: true }); }

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
      <ViewTabs tabs={TABS} activeTab={tab} onChange={(k) => setTab(k as TabKey)} />

      {tab === "table" && (
        <div key="table" className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
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
                <span className="hidden sm:inline">Add to live meeting</span>
              </button>
            }
          />
        </div>
      )}

      {tab === "notifications" && <NotificationsTab />}

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
