

import { useEffect, useMemo, useState } from "react";
import type { EventDefinition, EventUser } from "../mocks/data/eventDefinitions";
import type { LiveRow } from "../mocks/data/liveEvents";
import Toggle from "./Toggle";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Hash, Plus, Search, Table2, Trash2, Users2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import { CartesianGrid, Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CreateEventDrawer from "./CreateEventDrawer";
import DashboardTable, { FilterConfig, TableColumn, TableRow } from "./DashboardTable";
import FilterBuilder from "./FilterBuilder";
import SlidingSidebar from "./SlidingSidebar";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── shared helpers ─────────────────────────────────────────────────────────────


function UserAvatar({ initial, color, name }: { initial: string; color: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: color }}>
        {initial}
      </span>
      <span>{name}</span>
    </div>
  );
}

// ── event detail drawer data ───────────────────────────────────────────────────

const DATE_30 = [
  "May 27","May 28","May 29","May 30","May 31",
  "Jun 1","Jun 2","Jun 3","Jun 4","Jun 5","Jun 6","Jun 7","Jun 8","Jun 9","Jun 10",
  "Jun 11","Jun 12","Jun 13","Jun 14","Jun 15","Jun 16","Jun 17","Jun 18","Jun 19",
  "Jun 20","Jun 21","Jun 22","Jun 23","Jun 24","Jun 25",
];

function eventChartData(id: string, total: number): { date: string; value: number }[] {
  const base = DATE_30.map((date) => ({ date, value: 0 }));
  if (total === 0) return base;
  const hash = id.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  for (let i = 0; i < total; i++) {
    base[(hash * (i + 1)) % 30].value++;
  }
  return base;
}

type EventMeta = {
  id: string;
  name: string;
  totalUsers: number;
  totalEvents: number;
  source: string;
  status: "Ingested" | "Pending";
  users: EventUser[];
  chart: { date: string; value: number }[];
};

function toEventMeta(d: EventDefinition): EventMeta {
  return {
    id: d.id,
    name: d.name,
    totalUsers: d.totalUsers,
    totalEvents: d.totalEvents,
    source: d.source,
    status: d.status,
    users: d.users,
    chart: eventChartData(d.id, d.totalEvents),
  };
}

// ── EventTableDetailDrawer ─────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      {source}
    </span>
  );
}

function EventMetricCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
      <p className="text-xs text-stone-400 dark:text-stone-500">{label}</p>
      <div className="text-sm font-semibold text-stone-800 dark:text-stone-100">{children}</div>
    </div>
  );
}

const DATE_RANGES = ["Custom","Today","Yesterday","7D","30D","3M","6M","12M"] as const;
type DateRange = typeof DATE_RANGES[number];

function EventAnalyticsTab({ meta }: { meta: EventMeta }) {
  const [range, setRange] = useState<DateRange>("30D");
  const [metric, setMetric] = useState<"events" | "users">("events");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const displayedData = meta.chart;
  const shown = displayedData.filter((_, i) => i % 2 === 0 || i === displayedData.length - 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <EventMetricCard label="Event">
          <span className="font-mono text-xs text-stone-700 dark:text-stone-200">{meta.name}</span>
        </EventMetricCard>
        <EventMetricCard label="Source">
          <SourceBadge source={meta.source} />
        </EventMetricCard>
        <EventMetricCard label="Total users">
          {meta.totalUsers}
        </EventMetricCard>
        <EventMetricCard label="Total events">
          {meta.totalEvents}
        </EventMetricCard>
      </div>

      <div className="flex flex-col gap-3">
      {/* Date range */}
      <div className="flex flex-wrap gap-0.5">
        {DATE_RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              range === r
                ? "bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-stone-100"
                : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart controls */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <select className="h-8 appearance-none rounded-lg border pl-3 pr-7 text-xs font-medium text-stone-600 outline-none dark:text-stone-300" style={{ background: "var(--input)", borderColor: "var(--border)" }}>
            <option>Day</option>
            <option>Week</option>
            <option>Month</option>
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div className="flex items-center gap-1">
          {(["events","users"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize ${
                metric === m
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                  : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-stone-200 dark:bg-white/10" />
          <button
            onClick={() => setChartType("line")}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${chartType === "line" ? "bg-stone-100 dark:bg-white/10" : "text-stone-400 hover:bg-stone-50"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${chartType === "bar" ? "bg-stone-100 dark:bg-white/10" : "text-stone-400 hover:bg-stone-50"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={shown} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 4 }} />
            </LineChart>
          ) : (
            <BarChart data={shown} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}

function EventUsersTab({ users }: { users: EventUser[] }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:placeholder:text-stone-500"
          style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">
          {users.length === 0 ? "No users have triggered this event." : "No users match your search."}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((user) => (
            <div key={user.name} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-stone-50 dark:hover:bg-white/4">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: user.color }}
              >
                {user.initials}
              </span>
              <span className="flex-1 text-sm font-medium text-stone-800 dark:text-stone-100">{user.name}</span>
              <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{user.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventTableDetailDrawer({
  meta,
  onClose,
  onDelete,
}: {
  meta: EventMeta;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [tab, setTab] = useState<"analytics" | "users">("analytics");

  return (
    <SlidingSidebar
      title={
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{meta.name}</h2>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            meta.status === "Ingested"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
          }`}>
            {meta.status}
          </span>
        </div>
      }
      onClose={onClose}
      contentClassName="flex flex-col"
      footer={
        <button
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <Trash2 size={14} />
          Delete event
        </button>
      }
    >
      {/* Tab nav */}
      <div className="shrink-0 flex items-center gap-1 px-7 pb-4 pt-1">
        {([
          { key: "analytics", label: "Analytics" },
          { key: "users",     label: "Users" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-100 ${
              tab === key
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-400 dark:hover:bg-white/6 dark:hover:text-stone-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-7 pb-5">
        {tab === "analytics"
          ? <EventAnalyticsTab meta={meta} />
          : <EventUsersTab users={meta.users} />
        }
      </div>
    </SlidingSidebar>
  );
}

// ── shared helpers ─────────────────────────────────────────────────────────────

const TYPE_BADGE = (
  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/12 dark:text-blue-300">
    Created
  </span>
);

// ── events table data ──────────────────────────────────────────────────────────

const COLUMNS: TableColumn[] = [
  { key: "event",       label: "Event",        info: true },
  { key: "type",        label: "Type",         width: "110px",  info: true },
  { key: "intent",      label: "Intent event", width: "130px",  info: true, align: "center" },
  { key: "users",       label: "# of users",   width: "110px",  info: true, align: "center" },
  { key: "events",      label: "# of events",  width: "110px",  info: true, align: "center" },
  { key: "lastUpdated", label: "Last updated", width: "210px",  info: true },
  { key: "createdBy",   label: "Created by",   width: "180px",  info: true },
];

function toEventRows(defs: EventDefinition[]): TableRow[] {
  return defs.map((d) => ({
    id: d.id,
    cells: {
      event: d.name,
      type: TYPE_BADGE,
      intent: <Toggle fake on={d.intentEvent} />,
      users: d.totalUsers,
      events: d.totalEvents,
      lastUpdated: d.lastUpdated,
      createdBy: <UserAvatar initial={d.createdBy.initial} color={d.createdBy.color} name={d.createdBy.name} />,
    },
  }));
}

const EVENTS_FILTER_CONFIG: FilterConfig = {
  sortFields: ["Event", "# of users", "# of events", "Last updated"],
};

// ── live tab ───────────────────────────────────────────────────────────────────

const LIVE_COLUMNS: TableColumn[] = [
  { key: "name",      label: "Name",              width: "14%" },
  { key: "timestamp", label: "Timestamp",         width: "18%" },
  { key: "source",    label: "Source",            width: "8%"  },
  { key: "identifier",label: "Identifier",        width: "20%" },
  { key: "path",      label: "Path or app screen",width: "17%" },
  { key: "location",  label: "Location",          width: "14%" },
  { key: "action",    label: "Action",            width: "9%"  },
];

function toLiveTableRows(rows: LiveRow[]): TableRow[] {
  return rows.map((r) => ({
  id: r.id,
  cells: {
    name:       <span className="font-medium text-stone-800 dark:text-stone-100">{r.name}</span>,
    timestamp:  <span className="tabular-nums text-stone-500 dark:text-stone-400">{r.timestamp}</span>,
    source:     <span className="text-stone-500 dark:text-stone-400">{r.source}</span>,
    identifier: <span className="font-mono text-xs text-stone-500 dark:text-stone-400">{r.identifier}</span>,
    path:       r.path
      ? <span className="font-mono text-xs text-stone-700 dark:text-stone-300">{r.path}</span>
      : <span className="text-stone-400 dark:text-stone-500">–</span>,
    location:   <span className="italic text-stone-400 dark:text-stone-500">{r.location ?? "No location received"}</span>,
    action: (
      <button className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Create event
      </button>
    ),
  },
  }));
}

function LiveIndicator({ paused }: { paused: boolean }) {
  return (
    <>
      <style>{`
        @keyframes livewave {
          from { stroke-dashoffset: 12; }
          to   { stroke-dashoffset: -46; }
        }
      `}</style>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
        {/* Full shape — dim base */}
        <polyline
          points="22 12 18 12 15 21 9 3 6 12 2 12"
          stroke={paused ? "#d1d5db" : "#0080FF"}
          strokeOpacity={paused ? 1 : 0.18}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Traveling bright segment */}
        {!paused && (
          <polyline
            points="22 12 18 12 15 21 9 3 6 12 2 12"
            stroke="#0080FF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 34"
            style={{ animation: "livewave 1.4s linear infinite" }}
          />
        )}
      </svg>
    </>
  );
}

function PauseResumeButton({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg px-3.5 text-xs font-semibold text-white transition-colors duration-150"
      style={{ background: paused ? "#59B277" : "#FFC44D" }}
    >
      <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {/* Pause icon: two bars */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="white"
          className={`absolute inset-0 transition-all duration-200 ${paused ? "scale-75 opacity-0" : "scale-100 opacity-100"}`}
        >
          <rect x="2" y="1" width="4" height="12" rx="1.5" />
          <rect x="8" y="1" width="4" height="12" rx="1.5" />
        </svg>
        {/* Play icon: triangle */}
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="white"
          className={`absolute inset-0 transition-all duration-200 ${paused ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        >
          <polygon points="2,1 13,7 2,13" />
        </svg>
      </span>
      <span>{paused ? "Resume" : "Pause"}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">{children}</p>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{label}</span>
      <span className="text-right text-xs font-medium text-stone-800 dark:text-stone-200 break-all">{value}</span>
    </div>
  );
}

function EventDetailSidebar({ row, onClose }: { row: LiveRow; onClose: () => void }) {
  return (
    <SlidingSidebar
      title={row.name}
      onClose={onClose}
      footerBorder={false}
      footer={
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          View Event JSON
        </button>
      }
    >
      <div className="space-y-6">
        <div>
          <SectionTitle>General</SectionTitle>
          <DetailRow label="Event Name" value={row.name} />
          <DetailRow label="Event Id"   value={<span className="font-mono text-xs">{row.eventId}</span>} />
          <DetailRow label="Timestamp"  value={row.timestamp} />
          <DetailRow label="Identifier" value={<span className="font-mono text-xs">{row.profileId}</span>} />
          <DetailRow label="Session Id" value={<span className="font-mono text-xs">{row.sessionId}</span>} />
        </div>

        <div>
          <SectionTitle>Source</SectionTitle>
          <DetailRow label="Source Type" value={row.source} />
        </div>

        <div>
          <SectionTitle>User Identities</SectionTitle>
          <DetailRow label="Profile ID" value={<span className="font-mono text-xs">{row.profileId}</span>} />
        </div>

        <div>
          <SectionTitle>Event Attributes</SectionTitle>
          {Object.entries(row.attributes).map(([k, v]) => (
            <DetailRow key={k} label={k} value={String(v)} />
          ))}
        </div>
      </div>
    </SlidingSidebar>
  );
}

function LiveTab({ onRowSelect }: { onRowSelect: (row: LiveRow | null) => void }) {
  const [paused, setPaused] = useState(false);
  const [liveRows, setLiveRows] = useState<LiveRow[]>([]);

  useEffect(() => {
    fetch("/api/events/live")
      .then((r) => r.json())
      .then(setLiveRows);
  }, []);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <DashboardTable
        columns={LIVE_COLUMNS}
        rows={toLiveTableRows(liveRows)}
        searchPlaceholder="Search events..."
        menuItems={[]}
        actionsLabel=""
        onRowClick={(row) => onRowSelect(liveRows.find((r) => r.id === row.id) ?? null)}
        action={
          <div className="flex items-center gap-3">
            <LiveIndicator paused={paused} />
            <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/6">
              Clear
            </button>
            <PauseResumeButton paused={paused} onToggle={() => setPaused((p) => !p)} />
          </div>
        }
      />
    </div>
  );
}

// ── view ───────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "table", label: "Table", icon: <Table2 size={14} /> },
  { key: "live",  label: "Live",  icon: <Activity size={14} /> },
] as const;

type Tab = typeof TABS[number]["key"];

export default function EventsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "table";
  function setTab(key: Tab) { navigate(`/events?tab=${key}`, { replace: true }); }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<LiveRow | null>(null);
  const [selectedTableEvent, setSelectedTableEvent] = useState<EventMeta | null>(null);
  const [deletedEventIds, setDeletedEventIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<EventMeta | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [events, setEvents] = useState<EventDefinition[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents);
  }, []);

  const eventMetaById = useMemo(
    () => Object.fromEntries(events.map((d) => [d.id, toEventMeta(d)])),
    [events],
  );

  const displayRows = useMemo(() => {
    let defs = events.filter((d) => !deletedEventIds.has(d.id));
    if (sortField) {
      defs = [...defs].sort((a, b) => {
        let cmp = 0;
        if (sortField === "Event")             cmp = a.name.localeCompare(b.name);
        else if (sortField === "# of users")   cmp = a.totalUsers - b.totalUsers;
        else if (sortField === "# of events")  cmp = a.totalEvents - b.totalEvents;
        else if (sortField === "Last updated") cmp = a.lastUpdatedSort.localeCompare(b.lastUpdatedSort);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return toEventRows(defs);
  }, [events, deletedEventIds, sortField, sortDir]);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <ViewTabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {/* Content */}
      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pt-4 pb-4 animate-fade-up">
        {tab === "table" && (
          <DashboardTable
            columns={COLUMNS}
            rows={displayRows}
            searchPlaceholder="Search events..."
            filterConfig={EVENTS_FILTER_CONFIG}
            filterPanel={<FilterBuilder />}
            onSortChange={(f, d) => { setSortField(f); setSortDir(d); }}
            onRowClick={(row) => {
              const meta = eventMetaById[row.id];
              if (meta) setSelectedTableEvent(meta);
            }}
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Create event</span>
              </button>
            }
          />
        )}
        {tab === "live" && <LiveTab onRowSelect={setSelectedLive} />}
      </div>

      {drawerOpen && <CreateEventDrawer onClose={() => setDrawerOpen(false)} />}
      {selectedLive && <EventDetailSidebar row={selectedLive} onClose={() => setSelectedLive(null)} />}
      {selectedTableEvent && (
        <EventTableDetailDrawer
          meta={selectedTableEvent}
          onClose={() => setSelectedTableEvent(null)}
          onDelete={() => setDeleteTarget(selectedTableEvent)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="event"
          entityName={deleteTarget.name}
          onConfirm={() => {
            setDeletedEventIds((s) => new Set([...s, deleteTarget.id]));
            setDeleteTarget(null);
            setSelectedTableEvent(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
