

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2, LayoutDashboard, Plus, Table2 } from "lucide-react";
import CreateEventDrawer from "./CreateEventDrawer";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";

// ── shared helpers ─────────────────────────────────────────────────────────────

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => { e.stopPropagation(); setOn((v) => !v); }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? "bg-blue-500" : "bg-stone-300 dark:bg-stone-600"}`}
    >
      <span className={`inline-block h-3.75 w-3.75 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}

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

const ROWS: TableRow[] = [
  { id: "e1",  cells: { event: "free_tool_generated",             type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 0, events: 0, lastUpdated: "Jun 2, 2026 08:33 AM",  createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e2",  cells: { event: "subscribed v2",                   type: TYPE_BADGE, intent: <Toggle defaultOn={true}  />, users: 1, events: 1, lastUpdated: "May 29, 2026 09:10 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e3",  cells: { event: "Team member invited to a project", type: TYPE_BADGE, intent: <Toggle defaultOn={true}  />, users: 1, events: 3, lastUpdated: "May 28, 2026 06:59 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e4",  cells: { event: "free_tool_lead",                  type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 1, events: 1, lastUpdated: "May 22, 2026 04:06 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e5",  cells: { event: "book-a-demo",                     type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 0, events: 0, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e6",  cells: { event: "Submit on",                       type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 6, events: 6, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="S" color="#0D9488" name="Somya Nayak"   /> } },
  { id: "e7",  cells: { event: "Newsletter Signup",               type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 0, events: 0, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e8",  cells: { event: "Submit on",                       type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 6, events: 6, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
  { id: "e9",  cells: { event: "Submit on",                       type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 6, events: 6, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="S" color="#0D9488" name="Sid Chaudhary" /> } },
  { id: "e10", cells: { event: "Submit on",                       type: TYPE_BADGE, intent: <Toggle defaultOn={false} />, users: 6, events: 6, lastUpdated: "May 12, 2026 11:48 PM", createdBy: <UserAvatar initial="R" color="#8B5CF6" name="Removed User" /> } },
];

// ── live tab ───────────────────────────────────────────────────────────────────

type LiveRow = {
  id: string;
  name: string;
  timestamp: string;
  source: string;
  identifier: string;
  path: string | null;
  location: string | null;
  // sidebar detail fields
  eventId: string;
  sessionId: string;
  profileId: string;
  attributes: Record<string, string | number>;
};

const LIVE_ROWS: LiveRow[] = [
  { id: "l1",  name: "View Page",    timestamp: "Jun 13, 2026 02:05:30 PM", source: "web", identifier: "prof_mqc3of2y_1781339723098_...", path: "/stock-price/MAAT.PA",        location: null, eventId: "evt_mqc3of2y_1781339723098_vp1", sessionId: "ses_mqc3of2y_1781339723098_s1", profileId: "prof_mqc3of2y_1781339723098_m4q5c2ntXW", attributes: { "Page Path": "/stock-price/MAAT.PA", "Page Title": "MAAT.PA - Stock Price", "Referrer": "https://google.com" } },
  { id: "l2",  name: "Session end",  timestamp: "Jun 13, 2026 02:05:30 PM", source: "web", identifier: "prof_mqc19qqk_1781335679132_...", path: null,                          location: null, eventId: "ses_mqc2n553_1781337983943_5mc523qnyW", sessionId: "ses_mqc2n553_1781337983943_5mc523qnyW", profileId: "prof_mqc2n54t_1781337983933_m4q5c2ntXW", attributes: { "Session End Event Name": "View Page", "Session Event Count": 1, "Session Duration": 0 } },
  { id: "l3",  name: "Session start",timestamp: "Jun 13, 2026 02:05:30 PM", source: "web", identifier: "prof_mqc3of2y_1781339723098_...", path: null,                          location: null, eventId: "ses_mqc3of2y_1781339723099_ss1", sessionId: "ses_mqc3of2y_1781339723099_ss1", profileId: "prof_mqc3of2y_1781339723098_m4q5c2ntXW", attributes: { "Referrer": "https://stockinvest.us", "Landing Page": "/stock-price/MAAT.PA" } },
  { id: "l4",  name: "Session end",  timestamp: "Jun 13, 2026 02:05:28 PM", source: "web", identifier: "prof_mqc2lryu_1781337920214_...", path: null,                          location: null, eventId: "ses_mqc2lryu_1781337920214_end1", sessionId: "ses_mqc2lryu_1781337920214_end1", profileId: "prof_mqc2lryu_1781337920214_m4q5c2ntXW", attributes: { "Session End Event Name": "View Page", "Session Event Count": 3, "Session Duration": 142 } },
  { id: "l5",  name: "View Page",    timestamp: "Jun 13, 2026 02:05:28 PM", source: "web", identifier: "prof_mqc3oc82_1781339719394_...", path: "/digest",                     location: null, eventId: "evt_mqc3oc82_1781339719394_vp2", sessionId: "ses_mqc3oc82_1781339719394_s2", profileId: "prof_mqc3oc82_1781339719394_m4q5c2ntXW", attributes: { "Page Path": "/digest", "Page Title": "Digest — StockInvest.us", "Referrer": "https://stockinvest.us" } },
  { id: "l6",  name: "Session end",  timestamp: "Jun 13, 2026 02:05:28 PM", source: "web", identifier: "prof_mqc2ls7g_1781337920524_l...",path: null,                          location: null, eventId: "ses_mqc2ls7g_1781337920524_end1", sessionId: "ses_mqc2ls7g_1781337920524_end1", profileId: "prof_mqc2ls7g_1781337920524_m4q5c2ntXW", attributes: { "Session End Event Name": "View Page", "Session Event Count": 2, "Session Duration": 87 } },
  { id: "l7",  name: "Session start",timestamp: "Jun 13, 2026 02:05:28 PM", source: "web", identifier: "prof_mqc3ob2m_1781339717902_...", path: null,                          location: null, eventId: "ses_mqc3ob2m_1781339717902_ss1", sessionId: "ses_mqc3ob2m_1781339717902_ss1", profileId: "prof_mqc3ob2m_1781339717902_m4q5c2ntXW", attributes: { "Referrer": "", "Landing Page": "/digest/category/analysis" } },
  { id: "l8",  name: "View Page",    timestamp: "Jun 13, 2026 02:05:28 PM", source: "web", identifier: "prof_mqc3ob2m_1781339717902_...", path: "/digest/category/analysis...", location: null, eventId: "evt_mqc3ob2m_1781339717902_vp3", sessionId: "ses_mqc3ob2m_1781339717902_s3", profileId: "prof_mqc3ob2m_1781339717902_m4q5c2ntXW", attributes: { "Page Path": "/digest/category/analysis", "Page Title": "Analysis — Digest", "Referrer": "" } },
  { id: "l9",  name: "View Page",    timestamp: "Jun 13, 2026 02:05:27 PM", source: "web", identifier: "prof_mjqw2ehl_1766996454873_...", path: "/stock/SPCX",                 location: null, eventId: "evt_mjqw2ehl_1766996454873_vp4", sessionId: "ses_mjqw2ehl_1766996454873_s4", profileId: "prof_mjqw2ehl_1766996454873_m4q5c2ntXW", attributes: { "Page Path": "/stock/SPCX", "Page Title": "SPCX - Stock", "Referrer": "https://google.com" } },
  { id: "l10", name: "Session end",  timestamp: "Jun 13, 2026 02:05:27 PM", source: "web", identifier: "prof_mpr9mgps_1780079919904_...", path: null,                          location: null, eventId: "ses_mpr9mgps_1780079919904_end1", sessionId: "ses_mpr9mgps_1780079919904_end1", profileId: "prof_mpr9mgps_1780079919904_m4q5c2ntXW", attributes: { "Session End Event Name": "View Page", "Session Event Count": 5, "Session Duration": 310 } },
  { id: "l11", name: "View Page",    timestamp: "Jun 13, 2026 02:05:26 PM", source: "web", identifier: "prof_mqbnvm9c_1781313185136_...",path: "/stock-price/SFUNDUSD",        location: null, eventId: "evt_mqbnvm9c_1781313185136_vp5", sessionId: "ses_mqbnvm9c_1781313185136_s5", profileId: "prof_mqbnvm9c_1781313185136_m4q5c2ntXW", attributes: { "Page Path": "/stock-price/SFUNDUSD", "Page Title": "SFUNDUSD - Stock Price", "Referrer": "" } },
  { id: "l12", name: "Session end",  timestamp: "Jun 13, 2026 02:05:26 PM", source: "web", identifier: "prof_mqc2lqqu_1781337918630_...", path: null,                          location: null, eventId: "ses_mqc2lqqu_1781337918630_end1", sessionId: "ses_mqc2lqqu_1781337918630_end1", profileId: "prof_mqc2lqqu_1781337918630_m4q5c2ntXW", attributes: { "Session End Event Name": "View Page", "Session Event Count": 1, "Session Duration": 22 } },
];

const LIVE_COLUMNS: TableColumn[] = [
  { key: "name",      label: "Name",              width: "14%" },
  { key: "timestamp", label: "Timestamp",         width: "18%" },
  { key: "source",    label: "Source",            width: "8%"  },
  { key: "identifier",label: "Identifier",        width: "20%" },
  { key: "path",      label: "Path or app screen",width: "17%" },
  { key: "location",  label: "Location",          width: "14%" },
  { key: "action",    label: "Action",            width: "9%"  },
];

const LIVE_TABLE_ROWS: TableRow[] = LIVE_ROWS.map((r) => ({
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

function LiveIndicator({ paused }: { paused: boolean }) {
  return (
    <>
      <style>{`@keyframes livebar{0%,100%{height:3px}50%{height:14px}}`}</style>
      <div className="flex items-end gap-0.5 h-4">
        {(["0ms", "110ms", "55ms", "165ms"] as const).map((delay, i) => (
          <span
            key={i}
            className="w-0.75 rounded-full transition-all duration-300"
            style={
              paused
                ? { height: 2, background: "var(--border)" }
                : { background: "#0080FF", animation: `livebar 0.65s ease-in-out ${delay} infinite` }
            }
          />
        ))}
      </div>
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
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
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

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <DashboardTable
        columns={LIVE_COLUMNS}
        rows={LIVE_TABLE_ROWS}
        searchPlaceholder="Search events..."
        menuItems={[]}
        actionsLabel=""
        onRowClick={(row) => onRowSelect(LIVE_ROWS.find((r) => r.id === row.id) ?? null)}
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
  { key: "table",     label: "Table",     icon: <Table2 size={14} /> },
  { key: "board",     label: "Board",     icon: <LayoutDashboard size={14} /> },
  { key: "analytics", label: "Analytics", icon: <BarChart2 size={14} /> },
  { key: "live",      label: "Live",      icon: null },
] as const;

type Tab = typeof TABS[number]["key"];

export default function EventsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "table";
  function setTab(key: Tab) { navigate(`/events?tab=${key}`, { replace: true }); }
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLive, setSelectedLive] = useState<LiveRow | null>(null);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Tab nav */}
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex h-9 items-center gap-2 px-3 rounded-lg text-sm font-medium transition-colors duration-100
              ${tab === t.key
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6"
              }`}
          >
            {t.icon}
            {t.key === "live" ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                Live
              </span>
            ) : t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pt-4 pb-4 animate-fade-up">
        {tab === "table" && (
          <DashboardTable
            columns={COLUMNS}
            rows={ROWS}
            searchPlaceholder="Search events..."
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                Create event
              </button>
            }
          />
        )}
        {tab === "board" && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="text-center space-y-1.5">
              <LayoutDashboard size={24} className="mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Board view coming soon</p>
            </div>
          </div>
        )}
        {tab === "analytics" && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="text-center space-y-1.5">
              <BarChart2 size={24} className="mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Analytics view coming soon</p>
            </div>
          </div>
        )}
        {tab === "live" && <LiveTab onRowSelect={setSelectedLive} />}
      </div>

      {drawerOpen && <CreateEventDrawer onClose={() => setDrawerOpen(false)} />}
      {selectedLive && <EventDetailSidebar row={selectedLive} onClose={() => setSelectedLive(null)} />}
    </div>
  );
}
