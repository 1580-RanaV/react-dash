

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Check, ChevronDown, Copy, Globe, Mail, MessageSquare,
  Phone, TrendingUp, Zap, MousePointer2, FileText,
} from "lucide-react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import DateRangePicker from "./DateRangePicker";
import CodeBlock from "./CodeBlock";
import DashboardTable, { TableColumn } from "./DashboardTable";
import { USERS_DATA } from "./UsersView";

// ── data ─────────────────────────────────────────────────────────────────────

export type AccountData = {
  id: string;
  name: string;
  domain: string;
  domainOld: string;
  facebookPage: string;
  lastEnrichmentTime: string;
  pictureUrl: string;
  firstSeen: string;
  identifier: string;
  intentLevel: "High" | "Medium" | "Low";
  lastSeen: string;
  sessionActivity: string;
  totalEvents: number;
  usersCount: number;
  lifecycleStage: string;
  owner: { initial: string; color: string; name: string };
  tags: string[];
};

export const ACCOUNTS_DATA: AccountData[] = [
  {
    id: "acme-corp",
    name: "Acme Corp",
    domain: "acmecorp.com",
    domainOld: "acme.co",
    facebookPage: "facebook.com/acmecorp",
    lastEnrichmentTime: "Jun 25, 2026 at 03:14 AM",
    pictureUrl: "",
    firstSeen: "Fri, Jan 10, 2025",
    identifier: "acct_acme_162261206273400",
    intentLevel: "High",
    lastSeen: "Tue, Jun 25, 2026",
    sessionActivity: "42 minutes",
    totalEvents: 4218,
    usersCount: 42,
    lifecycleStage: "Customer",
    owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },
    tags: ["Enterprise", "SaaS"],
  },
  {
    id: "globex",
    name: "Globex Inc.",
    domain: "globex.io",
    domainOld: "",
    facebookPage: "facebook.com/globexinc",
    lastEnrichmentTime: "Jun 20, 2026 at 10:30 AM",
    pictureUrl: "",
    firstSeen: "Mon, Mar 3, 2025",
    identifier: "acct_globex_162261206273401",
    intentLevel: "Medium",
    lastSeen: "Tue, Jun 25, 2026",
    sessionActivity: "18 minutes",
    totalEvents: 1043,
    usersCount: 17,
    lifecycleStage: "Prospect",
    owner: { initial: "S", color: "#0D9488", name: "Somya Nayak" },
    tags: ["Mid-market"],
  },
  {
    id: "initech",
    name: "Initech LLC",
    domain: "initech.com",
    domainOld: "initechllc.com",
    facebookPage: "",
    lastEnrichmentTime: "Jun 18, 2026 at 08:00 AM",
    pictureUrl: "",
    firstSeen: "Wed, May 7, 2025",
    identifier: "acct_initech_162261206273402",
    intentLevel: "High",
    lastSeen: "Mon, Jun 24, 2026",
    sessionActivity: "9 minutes",
    totalEvents: 789,
    usersCount: 8,
    lifecycleStage: "Lead",
    owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },
    tags: ["SMB", "Fintech"],
  },
  {
    id: "umbrella-corp",
    name: "Umbrella Corp",
    domain: "umbrella.corp",
    domainOld: "umbrellacorp.com",
    facebookPage: "facebook.com/umbrellacorp",
    lastEnrichmentTime: "Jun 15, 2026 at 06:44 PM",
    pictureUrl: "",
    firstSeen: "Thu, Oct 2, 2024",
    identifier: "acct_umbrella_162261206273403",
    intentLevel: "Medium",
    lastSeen: "Fri, Jun 22, 2026",
    sessionActivity: "27 minutes",
    totalEvents: 11204,
    usersCount: 134,
    lifecycleStage: "Qualified",
    owner: { initial: "S", color: "#0D9488", name: "Sid Chaudhary" },
    tags: ["Enterprise"],
  },
  {
    id: "stark-industries",
    name: "Stark Industries",
    domain: "stark.io",
    domainOld: "starkindustries.com",
    facebookPage: "facebook.com/starkindustries",
    lastEnrichmentTime: "Jun 10, 2026 at 12:00 PM",
    pictureUrl: "",
    firstSeen: "Mon, Jun 1, 2024",
    identifier: "acct_stark_162261206273404",
    intentLevel: "Low",
    lastSeen: "Tue, Jun 18, 2026",
    sessionActivity: "61 minutes",
    totalEvents: 29730,
    usersCount: 261,
    lifecycleStage: "Customer",
    owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },
    tags: ["Enterprise", "Manufacturing"],
  },
  {
    id: "wayne-enterprises",
    name: "Wayne Enterprises",
    domain: "wayneenterprises.com",
    domainOld: "",
    facebookPage: "",
    lastEnrichmentTime: "Jun 5, 2026 at 09:15 AM",
    pictureUrl: "",
    firstSeen: "Tue, Jul 15, 2024",
    identifier: "acct_wayne_162261206273405",
    intentLevel: "Low",
    lastSeen: "Thu, Jun 12, 2026",
    sessionActivity: "5 minutes",
    totalEvents: 312,
    usersCount: 5,
    lifecycleStage: "Churned",
    owner: { initial: "S", color: "#0D9488", name: "Somya Nayak" },
    tags: ["Mid-market", "B2B"],
  },
  {
    id: "oscorp",
    name: "Oscorp",
    domain: "oscorp.com",
    domainOld: "",
    facebookPage: "facebook.com/osborncorp",
    lastEnrichmentTime: "Jun 10, 2026 at 11:00 AM",
    pictureUrl: "",
    firstSeen: "Sat, Feb 22, 2025",
    identifier: "acct_oscorp_162261206273406",
    intentLevel: "High",
    lastSeen: "Tue, Jun 10, 2026",
    sessionActivity: "3 minutes",
    totalEvents: 214,
    usersCount: 3,
    lifecycleStage: "Lead",
    owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },
    tags: ["SMB"],
  },
  {
    id: "cyberdyne",
    name: "Cyberdyne Systems",
    domain: "cyberdyne.ai",
    domainOld: "cyberdyne.com",
    facebookPage: "facebook.com/cyberdynesystems",
    lastEnrichmentTime: "Jun 8, 2026 at 04:20 PM",
    pictureUrl: "",
    firstSeen: "Wed, Sep 10, 2025",
    identifier: "acct_cyberdyne_162261206273407",
    intentLevel: "Medium",
    lastSeen: "Mon, Jun 8, 2026",
    sessionActivity: "14 minutes",
    totalEvents: 1890,
    usersCount: 22,
    lifecycleStage: "Prospect",
    owner: { initial: "S", color: "#0D9488", name: "Sid Chaudhary" },
    tags: ["Enterprise", "AI"],
  },
];

const ACCOUNT_TABS = [
  { key: "overview",  label: "Overview" },
  { key: "users",     label: "Users" },
  { key: "activity",  label: "Activity" },
  { key: "tasks",     label: "Tasks" },
  { key: "emails",    label: "Emails" },
] as const;

type Tab = typeof ACCOUNT_TABS[number]["key"];

const INTENT_COLORS = { High: "#16a34a", Medium: "#f97316", Low: "#64748b" };

// ── chart data ────────────────────────────────────────────────────────────────

const DATE_LABELS = [
  "May 27","May 30","Jun 1","Jun 3","Jun 5","Jun 7","Jun 9",
  "Jun 11","Jun 13","Jun 15","Jun 17","Jun 19","Jun 21","Jun 23","Jun 25",
];

function chartData(seed: number) {
  return DATE_LABELS.map((date, i) => {
    const spike1 = i === 9  ? 140 + (seed % 50) : 0;
    const spike2 = i === 13 ? 280 + (seed % 80) : 0;
    const noise  = (seed * (i + 3)) % 17;
    return { date, events: Math.max(spike1, spike2, noise) };
  });
}

// ── activity events ───────────────────────────────────────────────────────────

type ActivityEvent = {
  id: string;
  day: string;
  type: "charge" | "click" | "view";
  name: string;
  userLabel: string;
  userInitial: string;
  userColor: string;
  time: string;
  datetime: string;
  fields: { label: string; value: string; isUser?: boolean }[];
};

const ACCT_EVENTS: ActivityEvent[] = [
  {
    id: "ae1", day: "Tuesday", type: "view", name: "View page",
    userLabel: "admin@acmecorp.com", userInitial: "A", userColor: "#8B5CF6",
    time: "09:14 AM", datetime: "June 24, 2026 at 09:14:32 AM GMT+05:30",
    fields: [
      { label: "User",        value: "admin@acmecorp.com", isUser: true },
      { label: "Event ID",    value: "event_aa1bb2cc3dd4ee5_1782260072" },
      { label: "Profile ID",  value: "admin@acmecorp.com" },
      { label: "Session ID",  value: "sess_acme01ab02cd03" },
      { label: "Page ID",     value: "pag_dashboard_1782260000000_aabbcc" },
      { label: "Timestamp",   value: "1782260072000" },
      { label: "User ID",     value: "admin@acmecorp.com" },
      { label: "Source ID",   value: "1612612062733312100" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ae2", day: "Tuesday", type: "click", name: "Click on",
    userLabel: "admin@acmecorp.com", userInitial: "A", userColor: "#8B5CF6",
    time: "09:12 AM", datetime: "June 24, 2026 at 09:12:15 AM GMT+05:30",
    fields: [
      { label: "User",        value: "admin@acmecorp.com", isUser: true },
      { label: "Event ID",    value: "event_ff6gg7hh8ii9jj0_1782259935" },
      { label: "Profile ID",  value: "admin@acmecorp.com" },
      { label: "Session ID",  value: "sess_acme01ab02cd03" },
      { label: "Page ID",     value: "pag_settings_1782259800000_ccddee" },
      { label: "Timestamp",   value: "1782259935000" },
      { label: "User ID",     value: "admin@acmecorp.com" },
      { label: "Source ID",   value: "1612612062733312101" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ae3", day: "Tuesday", type: "charge", name: "Charge",
    userLabel: "billing@acmecorp.com", userInitial: "B", userColor: "#0D9488",
    time: "07:30 AM", datetime: "June 24, 2026 at 07:30:00 AM GMT+05:30",
    fields: [
      { label: "User",        value: "billing@acmecorp.com", isUser: true },
      { label: "Event ID",    value: "event_kk1ll2mm3nn4oo5_1782253800" },
      { label: "Profile ID",  value: "billing@acmecorp.com" },
      { label: "Session ID",  value: "No value" },
      { label: "Page ID",     value: "pag_billing_1782253000000_ffeedd" },
      { label: "Timestamp",   value: "1782253800000" },
      { label: "User ID",     value: "billing@acmecorp.com" },
      { label: "Source ID",   value: "1612612062733312102" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "4900" },
    ],
  },
  {
    id: "ae4", day: "Monday", type: "view", name: "View page",
    userLabel: "dev@acmecorp.com", userInitial: "D", userColor: "#0080FF",
    time: "11:55 PM", datetime: "June 23, 2026 at 11:55:40 PM GMT+05:30",
    fields: [
      { label: "User",        value: "dev@acmecorp.com", isUser: true },
      { label: "Event ID",    value: "event_pp6qq7rr8ss9tt0_1782168940" },
      { label: "Profile ID",  value: "dev@acmecorp.com" },
      { label: "Session ID",  value: "sess_dev99zz88yy77" },
      { label: "Page ID",     value: "pag_docs_1782168000000_gghhii" },
      { label: "Timestamp",   value: "1782168940000" },
      { label: "User ID",     value: "dev@acmecorp.com" },
      { label: "Source ID",   value: "1612612062733312103" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
];

// ── account users table ──────────────────────────────────────────────────────

const ACCT_USER_COLUMNS: TableColumn[] = [
  { key: "user",        label: "User",         width: "22%" },
  { key: "accountName", label: "Account name", width: "22%" },
  { key: "email",       label: "Email",        width: "24%" },
  { key: "jobTitle",    label: "Job title",    width: "16%" },
  { key: "intemptTags", label: "Intempt tags", width: "16%" },
];

function UserTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {label}
    </span>
  );
}

const ALL_USER_ROWS = USERS_DATA.map(({ id, name, account, email, title, tags }) => ({
  id,
  href: `/users/${id}`,
  cells: {
    user:         name,
    accountName:  account,
    email:        { value: email, muted: true },
    jobTitle:     title,
    intemptTags: (
      <div className="flex flex-wrap gap-1">
        {tags.map(([label]) => <UserTag key={label} label={label} />)}
      </div>
    ),
  },
}));

// ── tasks table ──────────────────────────────────────────────────────────────

const TASK_COLUMNS: TableColumn[] = [
  { key: "rank",     label: "Rank",      width: "8%",  info: true },
  { key: "taskName", label: "Task Name", width: "22%", info: true },
  { key: "status",   label: "Status",    width: "12%", info: true },
  { key: "due",      label: "Due",       width: "12%", info: true },
  { key: "priority", label: "Priority",  width: "12%", info: true },
  { key: "user",     label: "User",      width: "14%", info: true },
  { key: "type",     label: "Type",      width: "10%", info: true },
  { key: "account",  label: "Account",   width: "10%", info: true },
];

const TASK_EMPTY_STATE = (
  <div className="flex flex-col items-center gap-3 py-6">
    <img src="/mascot.png" alt="" className="h-16 w-16 object-contain" />
    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No data yet</p>
  </div>
);

// ── helpers ──────────────────────────────────────────────────────────────────

function eventTypeIcon(type: ActivityEvent["type"], size = 14) {
  if (type === "view")   return <MousePointer2 size={size} />;
  if (type === "charge") return <Zap size={size} />;
  return null;
}

function NoData({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
        <TrendingUp size={18} className="text-blue-400" />
      </div>
      <p className="text-sm text-stone-400 dark:text-stone-500">{label}</p>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function DraftAIButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const OPTIONS = [
    { icon: <Mail size={13} />,          label: "Email" },
    { icon: <FileText size={13} />,      label: "LinkedIn" },
    { icon: <MessageSquare size={13} />, label: "SMS" },
    { icon: <Phone size={13} />,         label: "Cold call script" },
  ];

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
        style={{ background: "#0080FF" }}
      >
        Draft AI message
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl overflow-hidden animate-card-in"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {OPTIONS.map(({ icon, label }) => (
            <button
              key={label}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5"
            >
              <span className="text-stone-400">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountSidebar({ account }: { account: AccountData }) {
  const initials = account.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const intentColor = INTENT_COLORS[account.intentLevel];

  const fields = [
    { label: "Account domain",             value: account.domain },
    { label: "Account domain old",         value: account.domainOld || "—" },
    { label: "Account facebook page",      value: account.facebookPage || "—" },
    { label: "Account Last Enrichment",    value: account.lastEnrichmentTime },
    { label: "Account name",               value: account.name },
    { label: "Account picture url",        value: account.pictureUrl || "No value" },
    { label: "First seen",                 value: account.firstSeen },
    { label: "Identifier",                 value: account.identifier },
    {
      label: "Intent level",
      value: (
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: intentColor }}>
          <TrendingUp size={13} />
          {account.intentLevel}
        </span>
      ),
    },
    { label: "Last seen",                  value: account.lastSeen },
    { label: "Session activity",           value: account.sessionActivity },
    { label: "Total events performed",     value: String(account.totalEvents) },
    { label: "Users count",                value: String(account.usersCount) },
  ];

  return (
    <div className="w-72 shrink-0 flex flex-col gap-5 px-6 py-6">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white"
        style={{ background: "#0080FF" }}
      >
        {initials}
      </div>

      <div>
        <p className="font-bold text-stone-900 dark:text-stone-100">{account.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          <Globe size={11} />
          {account.domain}
        </p>
      </div>

      <DraftAIButton />

      <div className="flex flex-col gap-3.5">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="text-xs text-stone-400 dark:text-stone-500">{label}</p>
            {typeof value === "string"
              ? <p className={`text-sm font-medium ${value === "No value" || value === "—" ? "text-stone-400 dark:text-stone-500 italic" : "text-stone-800 dark:text-stone-100"}`}>{value}</p>
              : value}
          </div>
        ))}
      </div>
    </div>
  );
}

const DAU_DATA = [
  { date: "Jun 20", users: 4 }, { date: "Jun 21", users: 2 }, { date: "Jun 22", users: 5 },
  { date: "Jun 23", users: 4 }, { date: "Jun 24", users: 3 }, { date: "Jun 25", users: 2 },
  { date: "Jun 26", users: 1 }, { date: "Jun 27", users: 2 }, { date: "Jun 28", users: 3 },
  { date: "Jun 29", users: 2 }, { date: "Jun 30", users: 1 }, { date: "Jul 1",  users: 1 },
  { date: "Jul 2",  users: 2 }, { date: "Jul 3",  users: 2 }, { date: "Jul 4",  users: 1 },
  { date: "Jul 5",  users: 0 }, { date: "Jul 6",  users: 2 }, { date: "Jul 7",  users: 3 },
  { date: "Jul 8",  users: 4 }, { date: "Jul 9",  users: 6 }, { date: "Jul 10", users: 5 },
  { date: "Jul 11", users: 6 }, { date: "Jul 12", users: 4 }, { date: "Jul 13", users: 3 },
  { date: "Jul 14", users: 5 }, { date: "Jul 15", users: 6 }, { date: "Jul 16", users: 7 },
];

const POWER_USERS = [
  { rank: 1, initials: "RB", name: "Roman Bohdan",         events: 11789, color: "#8B5CF6" },
  { rank: 2, initials: "T",  name: "Tarif",                events: 1608,  color: "#0D9488" },
  { rank: 3, initials: "BG", name: "Besik Gugushvili",     events: 1101,  color: "#f97316" },
  { rank: 4, initials: "YB", name: "Yaroslav Bezruchenko", events: 1057,  color: "#64748b" },
  { rank: 5, initials: "KA", name: "Koray Akbakir",        events: 417,   color: "#64748b" },
];

const RANK_COLORS: Record<number, string> = { 1: "#F59E0B", 2: "#94A3B8", 3: "#CD7C3E" };

function OverviewTab({ account }: { account: AccountData }) {
  const data = chartData(account.usersCount);
  const intentColor = INTENT_COLORS[account.intentLevel];
  const maxEvents = POWER_USERS[0].events;

  const DEALS = [
    { name: "Q3 Enterprise Renewal", value: "$48,000", stage: "Negotiation" },
    { name: "Add-on Seats — July",   value: "$6,400",  stage: "Proposal" },
  ];

  const UPCOMING = [
    { label: "Send renewal proposal", due: "Jun 28" },
    { label: "Quarterly business review", due: "Jul 3" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Row 1: Daily active users + Power users */}
      <div className="grid grid-cols-2 gap-5">
        {/* Daily active users */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-1 flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Daily active users</p>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-100 px-2 text-xs font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-300">
              7
            </span>
          </div>
          <p className="mb-4 text-xs text-stone-400 dark:text-stone-500">Last 30 days</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DAU_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "var(--stone-400,#a8a29e)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--stone-400,#a8a29e)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#60a5fa" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power users */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Power users</p>
            <span className="text-xs text-stone-400 dark:text-stone-500">Last 30 days</span>
          </div>
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400">
            <span>User</span>
            <span className="flex items-center gap-0.5">Total events <TrendingUp size={11} className="ml-0.5" /></span>
          </div>
          <div className="flex flex-col gap-3">
            {POWER_USERS.map(({ rank, initials, name, events, color }) => (
              <div key={rank} className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: RANK_COLORS[rank] ? `${RANK_COLORS[rank]}20` : "var(--stone-100,#f5f5f4)",
                    color: RANK_COLORS[rank] ?? "#64748b",
                  }}
                >
                  {rank}
                </span>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: color }}
                >
                  {initials}
                </span>
                <span className="w-28 shrink-0 text-xs text-stone-700 dark:text-stone-200 leading-tight">{name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-white/8 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${(events / maxEvents) * 100}%`, background: "#60a5fa" }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-semibold text-stone-800 dark:text-stone-100">
                  {events.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Event activity + Intent/Lifecycle */}
      <div className="grid grid-cols-2 gap-5">
        {/* Event activity */}
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Event activity</p>
            <div
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium text-stone-600 dark:text-stone-300"
              style={{ borderColor: "var(--border)" }}
            >
              All events <ChevronDown size={11} className="text-stone-400" />
            </div>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradAcct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--stone-400,#a8a29e)" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: "var(--stone-400,#a8a29e)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="events" stroke="#60a5fa" strokeWidth={2} fill="url(#areaGradAcct)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent + Lifecycle */}
        <div className="flex flex-col gap-5">
          <div className="flex-1 rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Lifecycle Stage</p>
            <span className="inline-flex items-center self-start rounded-md px-2.5 py-1 text-sm font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
              {account.lifecycleStage}
            </span>
          </div>

          <div className="flex-1 rounded-xl border p-5 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
            <p className="font-semibold text-stone-900 dark:text-stone-100">Intent level</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: intentColor }} />
              <span className="text-sm font-semibold" style={{ color: intentColor }}>{account.intentLevel}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-white/8">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: account.intentLevel === "High" ? "80%" : account.intentLevel === "Medium" ? "50%" : "25%",
                  background: intentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Upcoming tasks + Deals */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-4 font-semibold text-stone-900 dark:text-stone-100">Upcoming tasks</p>
          {UPCOMING.length === 0 ? (
            <NoData label="No upcoming tasks" />
          ) : (
            <div className="flex flex-col gap-2">
              {UPCOMING.map(({ label, due }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)" }}>
                  <div className="h-4 w-4 shrink-0 rounded border-2 border-stone-300 dark:border-stone-600" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span className="text-sm text-stone-700 dark:text-stone-200">{label}</span>
                    <span className="shrink-0 text-xs text-stone-400">{due}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-4 font-semibold text-stone-900 dark:text-stone-100">Deals</p>
          {DEALS.length === 0 ? (
            <NoData label="No active deals" />
          ) : (
            <div className="flex flex-col gap-2">
              {DEALS.map(({ name, value, stage }) => (
                <div key={name} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{name}</span>
                    <span className="text-xs text-stone-400">{stage}</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <DashboardTable
      columns={ACCT_USER_COLUMNS}
      rows={ALL_USER_ROWS}
      searchPlaceholder="Search users..."
    />
  );
}

function ActivityTab() {
  const [selectedId, setSelectedId] = useState<string>(ACCT_EVENTS[0].id);
  const [detailTab, setDetailTab]   = useState<"info" | "raw">("info");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  function copyField(label: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  }

  const selected = ACCT_EVENTS.find((e) => e.id === selectedId) ?? ACCT_EVENTS[0];

  const days: { label: string; events: ActivityEvent[] }[] = [];
  for (const ev of ACCT_EVENTS) {
    const last = days[days.length - 1];
    if (last && last.label === ev.day) last.events.push(ev);
    else days.push({ label: ev.day, events: [ev] });
  }

  const rawJson = JSON.stringify(
    {
      id:        selected.id,
      type:      selected.type,
      timestamp: Number(selected.fields.find(f => f.label === "Timestamp")?.value ?? 0),
      status:    selected.fields.find(f => f.label === "Data Status")?.value ?? "",
      amount:    Number(selected.fields.find(f => f.label === "Data Amount")?.value ?? 0),
      profileId: selected.fields.find(f => f.label === "Profile ID")?.value ?? "",
      sessionId: selected.fields.find(f => f.label === "Session ID")?.value ?? "",
      pageId:    selected.fields.find(f => f.label === "Page ID")?.value ?? "",
      userId:    selected.fields.find(f => f.label === "User ID")?.value ?? "",
      sourceId:  selected.fields.find(f => f.label === "Source ID")?.value ?? "",
    },
    null,
    2
  );

  return (
    <div className="flex h-full min-h-0 gap-4 px-4 pb-4">
      {/* Left: event list */}
      <div className="flex-1 min-w-0 overflow-y-auto py-4">
        {days.map(({ label, events }) => (
          <div key={label} className="mb-5">
            <p className="mb-2 px-2 text-xs font-semibold text-stone-400 dark:text-stone-500">{label}</p>
            <div className="flex flex-col">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => { setSelectedId(ev.id); setDetailTab("info"); }}
                  className={`cursor-pointer rounded-xl px-3 py-3 transition-colors ${
                    selectedId === ev.id
                      ? "bg-blue-50/60 dark:bg-blue-500/8"
                      : "hover:bg-stone-50/70 dark:hover:bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                      {eventTypeIcon(ev.type, 14) ?? <div className="h-2 w-2 rounded-full bg-stone-300 dark:bg-stone-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{ev.name}</span>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{ev.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500 font-mono">
                        {ev.fields.find(f => f.label === "Event ID")?.value}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-11">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ fontSize: 9, background: ev.userColor }}
                    >
                      {ev.userInitial}
                    </span>
                    <span className="max-w-45 truncate text-xs text-stone-400 dark:text-stone-500">{ev.userLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right: event detail */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <div className="flex shrink-0 items-center gap-3 px-5 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
            {eventTypeIcon(selected.type, 15) ?? <div className="h-3 w-3 rounded-full bg-stone-300 dark:bg-stone-500" />}
          </div>
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">{selected.name}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{selected.datetime}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 px-4 py-2">
          {(["info", "raw"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDetailTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                detailTab === t
                  ? "bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-stone-100"
                  : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              {t === "info" ? "Info" : "Raw"}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {detailTab === "info" && (
            <div className="flex flex-col">
              {selected.fields.map(({ label, value, isUser }) => (
                <div key={label} className="group flex items-center gap-4 px-5 py-4">
                  <span className="w-36 shrink-0 text-sm text-stone-500 dark:text-stone-400">{label}</span>
                  <div className="flex-1 min-w-0">
                    {isUser ? (
                      <div className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5" style={{ borderColor: "var(--border)" }}>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ fontSize: 9, background: selected.userColor }}
                        >
                          {selected.userInitial}
                        </span>
                        <span className="text-sm text-stone-700 dark:text-stone-200">{value}</span>
                      </div>
                    ) : (
                      <span className={`text-sm font-mono ${value === "No value" ? "text-stone-400 dark:text-stone-500 italic" : "text-stone-700 dark:text-stone-200"}`}>
                        {value}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyField(label, value)}
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-stone-100 dark:hover:bg-white/8"
                  >
                    {copiedLabel === label
                      ? <Check size={11} className="text-green-500" />
                      : <Copy size={11} className="text-stone-400" />}
                  </button>
                </div>
              ))}
            </div>
          )}
          {detailTab === "raw" && (
            <div className="p-5">
              <CodeBlock code={rawJson} language="json" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── emails tab ────────────────────────────────────────────────────────────────

type EmailTag = { label: string };

type EmailItem = {
  id: string;
  avatarInitial: string;
  avatarColor: string;
  senderName: string;
  senderEmail: string;
  timeAgo: string;
  subject: string;
  preview: string;
  tags: EmailTag[];
  messageCount: number;
  summary: string[];
};

const EMAILS: EmailItem[] = [
  {
    id: "e1",
    avatarInitial: "S", avatarColor: "#64748b",
    senderName: "Sid Chaudhary", senderEmail: "sid@intempt.com",
    timeAgo: "1 days ago",
    subject: "Accepted: blu chat doubts @ Wed Jul 15, 2026 1:30pm – 2pm (IST) (Rana)",
    preview: "blu chat doubts Sid Chaudhary has accepted this invitation. Join with Google Meet Meeting link...",
    tags: [{ label: "Meeting update" }],
    messageCount: 1,
    summary: [
      "Sid Chaudhary has accepted a meeting invitation.",
      "The meeting is scheduled for July 15, 2026, from 1:30 PM to 2 PM IST.",
      "The meeting can be joined via Google Meet link or phone.",
    ],
  },
  {
    id: "e2",
    avatarInitial: "A", avatarColor: "#0D9488",
    senderName: "Aman Tiwari, Sid Chaudhary, Roman Bohdan, Koray Akbakir",
    senderEmail: "aman@intempt.com, sid@intempt.com, roman@intempt.com, koray@intempt.com",
    timeAgo: "8 days ago",
    subject: "Re: Recording feature meeting Request",
    preview: "Guys — I'm not deep enough on this competitively. @Aman Tiwari is back tomorrow. @Aman please...",
    tags: [{ label: "Meeting update" }],
    messageCount: 4,
    summary: [
      "Thread about the recording feature meeting request.",
      "Aman Tiwari is returning tomorrow and will follow up.",
      "The team is reviewing competitive positioning for the feature.",
    ],
  },
  {
    id: "e3",
    avatarInitial: "I", avatarColor: "#0080FF",
    senderName: "Intempt", senderEmail: "no-reply@intempt.com",
    timeAgo: "20 days ago",
    subject: "R&D Standup – Summary",
    preview: "Meeting Summary Monday, Jun 22 2026 R&D Standup 4h 58m · 12 attendees Roman Bohdan ·...",
    tags: [
      { label: "Meeting update" },
      { label: "FYI" },
      { label: "Comment" },
    ],
    messageCount: 1,
    summary: [
      "R&D Standup held on Monday, Jun 22 2026 for 4h 58m.",
      "12 attendees including Roman Bohdan and the team.",
      "Summary auto-generated by Intempt.",
    ],
  },
  {
    id: "e4",
    avatarInitial: "A", avatarColor: "#0D9488",
    senderName: "Aman Tiwari, Sid Chaudhary",
    senderEmail: "aman@intempt.com, sid@intempt.com",
    timeAgo: "20 days ago",
    subject: "Re: Clay Audiences.",
    preview: "Thanks, I'll check it out @Sid Chaudhary. On Thu, Jun 25, 2026 at 11:26 PM Sid Chaudhary...",
    tags: [{ label: "Comment" }],
    messageCount: 2,
    summary: [
      "Discussion about Clay Audiences integration.",
      "Aman Tiwari will review the suggestion from Sid Chaudhary.",
      "Follow-up expected after review.",
    ],
  },
];

function EmailsTab() {
  const [selectedId, setSelectedId] = useState<string>(EMAILS[0].id);
  const [search, setSearch] = useState("");

  const filtered = EMAILS.filter(
    (e) =>
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.senderName.toLowerCase().includes(search.toLowerCase())
  );

  const selected = EMAILS.find((e) => e.id === selectedId) ?? EMAILS[0];

  return (
    <div className="flex h-full min-h-0">
      {/* Left: email list */}
      <div className="w-96 shrink-0 flex flex-col overflow-hidden pr-2">
        <div className="shrink-0 px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full rounded-xl border px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-blue-400 dark:text-stone-200 dark:placeholder:text-stone-500"
            style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {filtered.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedId(email.id)}
              className={`w-full text-left px-3 py-4 rounded-xl transition-colors ${
                selectedId === email.id
                  ? "bg-blue-50/60 dark:bg-blue-500/8"
                  : "hover:bg-stone-50/70 dark:hover:bg-white/3"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: email.avatarColor }}
                >
                  {email.avatarInitial}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{email.senderName}</p>
                    <span className="shrink-0 text-xs text-stone-400">{email.timeAgo}</span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate mb-1">{email.senderEmail}</p>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate mb-1">{email.subject}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-2 mb-2">{email.preview}</p>
                  <div className="flex flex-wrap gap-1">
                    {email.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300"
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: email detail */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Summary card — above the email */}
          <div className="rounded-xl p-4 bg-stone-50 dark:bg-white/4">
            <p className="mb-3 text-sm font-semibold text-stone-900 dark:text-stone-100">Summary</p>
            <ul className="flex flex-col gap-2">
              {selected.summary.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Subject + message count */}
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-0.5">{selected.subject}</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500">{selected.messageCount} message{selected.messageCount !== 1 ? "s" : ""}</p>
          </div>

          {/* Thread item — subtle bg, no border */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-stone-50 dark:bg-white/4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: selected.avatarColor }}
            >
              {selected.avatarInitial}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{selected.senderName.split(",")[0]}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{selected.timeAgo}</span>
                  <ChevronDown size={14} className="text-stone-400" />
                </div>
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{selected.preview}</p>
            </div>
          </div>
        </div>

        {/* Reply bar */}
        <div className="shrink-0 flex items-center gap-3 px-6 py-4">
          <button className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
            <Mail size={14} />
            Reply
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
            <MessageSquare size={14} />
            Reply All
          </button>
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AccountDetailView() {
  const { id, "*": splat } = useParams<{ id: string; "*": string }>();
  const navigate = useNavigate();
  const validTabs = ACCOUNT_TABS.map((t) => t.key) as Tab[];
  const activeTab: Tab = validTabs.includes(splat as Tab) ? (splat as Tab) : "overview";

  useEffect(() => {
    if (!splat || !validTabs.includes(splat as Tab)) {
      navigate(`/accounts/${id}/overview`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const account = ACCOUNTS_DATA.find((a) => a.id === id);

  if (!account) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-stone-400">Account not found.</p>
      </div>
    );
  }

  const isActivity = activeTab === "activity" || activeTab === "users" || activeTab === "tasks" || activeTab === "emails";

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div
        className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b px-5 py-2.5"
        style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <BackButton href="/accounts" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{account.name}</span>
        </div>
        <div className="shrink-0">
          <SubTabCorner
            tabs={ACCOUNT_TABS as unknown as { key: string; label: string }[]}
            active={activeTab}
            onChange={(k) => navigate(`/accounts/${id}/${k}`)}
          />
        </div>
      </div>

      {/* Body: persistent left sidebar + right column */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: always-visible account sidebar */}
        <div className="shrink-0 overflow-y-auto">
          <AccountSidebar account={account} />
        </div>

        {/* Right: date picker + tab content */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 px-7 py-3">
            <DateRangePicker className="flex flex-wrap items-center gap-x-4 gap-y-2" />
          </div>

          <div className={`flex-1 min-h-0 ${isActivity ? "overflow-hidden flex flex-col px-4 pb-4 pt-0" : "overflow-y-auto px-7 pb-6"}`}>
            {activeTab === "overview"  && <OverviewTab account={account} />}
            {activeTab === "users"     && <UsersTab />}
            {activeTab === "activity"  && <ActivityTab />}

            {activeTab === "tasks" && (
              <DashboardTable
                columns={TASK_COLUMNS}
                rows={[]}
                searchPlaceholder="Search tasks..."
                emptyState={TASK_EMPTY_STATE}
              />
            )}

            {activeTab === "emails" && <EmailsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
