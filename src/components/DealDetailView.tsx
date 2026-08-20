

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Check, ChevronDown, Copy, FileText, Mail,
  Phone, TrendingUp, Calendar, SlidersHorizontal, SquareCheck, Info, Users,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import DateRangePicker from "./DateRangePicker";
import CodeBlock from "./CodeBlock";
import DashboardTable, { TableColumn } from "./DashboardTable";

// ── data ─────────────────────────────────────────────────────────────────────

export type DealData = {
  id: string;
  name: string;
  account: string;
  accountId: string;
  stage: "Prospecting" | "Qualification" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
  value: string;
  owner: { initial: string; color: string; name: string };
  type: "New Business" | "Existing Business" | "Renewal" | "Upsell";
  priority: "High" | "Medium" | "Low";
  closeDate: string;
  createdDate: string;
  lastActivityDate: string;
  identifier: string;
  tags: string[];
};

export const DEALS_DATA: DealData[] = [
  { id: "d1", name: "Acme Corp — Enterprise Plan",       account: "Acme Corp",         accountId: "acme-corp",         stage: "Negotiation",   value: "$48,000",  owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },         type: "New Business",       priority: "High",   closeDate: "Jun 30, 2026", createdDate: "Apr 12, 2026", lastActivityDate: "Jun 24, 2026", identifier: "deal_acme_16225120001",      tags: ["Enterprise", "High Priority"] },
  { id: "d2", name: "Globex — Growth Subscription",       account: "Globex Inc.",       accountId: "globex",             stage: "Proposal",      value: "$12,000",  owner: { initial: "S", color: "#0D9488", name: "Somya Nayak" },   type: "Upsell",             priority: "Medium", closeDate: "Jul 15, 2026", createdDate: "May 3, 2026",  lastActivityDate: "Jun 20, 2026", identifier: "deal_globex_16225120002",    tags: ["Mid-market", "Upsell"] },
  { id: "d3", name: "Initech — Starter Onboarding",       account: "Initech LLC",       accountId: "initech",            stage: "Qualification", value: "$3,600",   owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },         type: "New Business",       priority: "High",   closeDate: "Jul 1, 2026",  createdDate: "May 20, 2026", lastActivityDate: "Jun 22, 2026", identifier: "deal_initech_16225120003",   tags: ["Startup", "High Priority"] },
  { id: "d4", name: "Umbrella Corp — Platform Renewal",   account: "Umbrella Corp",     accountId: "umbrella-corp",      stage: "Closed Won",    value: "$96,000",  owner: { initial: "S", color: "#0D9488", name: "Sid Chaudhary" }, type: "Renewal",            priority: "Low",    closeDate: "Jun 2, 2026",  createdDate: "Mar 1, 2026",  lastActivityDate: "Jun 2, 2026",  identifier: "deal_umbrella_16225120004",  tags: ["Enterprise", "Renewal"] },
  { id: "d5", name: "Stark Industries — AI Suite",        account: "Stark Industries",  accountId: "stark-industries",   stage: "Prospecting",   value: "$240,000", owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },         type: "New Business",       priority: "High",   closeDate: "Aug 31, 2026", createdDate: "Jun 10, 2026", lastActivityDate: "Jun 23, 2026", identifier: "deal_stark_16225120005",     tags: ["Enterprise", "High Priority"] },
  { id: "d6", name: "Wayne Enterprises — Re-engagement",  account: "Wayne Enterprises", accountId: "wayne-enterprises",  stage: "Closed Lost",   value: "$18,000",  owner: { initial: "S", color: "#0D9488", name: "Somya Nayak" },   type: "Existing Business",  priority: "Low",    closeDate: "May 31, 2026", createdDate: "Feb 14, 2026", lastActivityDate: "May 31, 2026", identifier: "deal_wayne_16225120006",     tags: ["Mid-market", "Re-engagement"] },
  { id: "d7", name: "Oscorp — Pilot Program",             account: "Oscorp",            accountId: "oscorp",             stage: "Qualification", value: "$6,000",   owner: { initial: "R", color: "#8B5CF6", name: "Rohan" },         type: "New Business",       priority: "Medium", closeDate: "Jul 22, 2026", createdDate: "Jun 1, 2026",  lastActivityDate: "Jun 19, 2026", identifier: "deal_oscorp_16225120007",    tags: ["SMB", "Pilot"] },
  { id: "d8", name: "Cyberdyne — Security Bundle",        account: "Cyberdyne Systems", accountId: "cyberdyne",          stage: "Proposal",      value: "$30,000",  owner: { initial: "S", color: "#0D9488", name: "Sid Chaudhary" }, type: "Upsell",             priority: "Medium", closeDate: "Aug 10, 2026", createdDate: "May 28, 2026", lastActivityDate: "Jun 21, 2026", identifier: "deal_cyberdyne_16225120008", tags: ["Enterprise", "Security"] },
];

const DEAL_TABS = [
  { key: "overview",  label: "Overview" },
  { key: "users",     label: "Users" },
  { key: "activity",  label: "Activity" },
  { key: "tasks",     label: "Tasks" },
  { key: "meetings",  label: "Meetings" },
  { key: "calls",     label: "Calls" },
] as const;

type Tab = typeof DEAL_TABS[number]["key"];

const PIPELINE_STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won"];
const STAGE_PROBABILITY: Record<string, number> = {
  Prospecting: 20, Qualification: 40, Proposal: 60, Negotiation: 80, "Closed Won": 100, "Closed Lost": 0,
};

// ── activity events ───────────────────────────────────────────────────────────

type ActivityEvent = {
  id: string;
  day: string;
  type: "stage" | "email" | "call" | "meeting" | "note";
  name: string;
  userLabel: string;
  userInitial: string;
  userColor: string;
  time: string;
  datetime: string;
  fields: { label: string; value: string; isUser?: boolean }[];
};

const DEAL_EVENTS: ActivityEvent[] = [
  {
    id: "de1", day: "Tuesday", type: "stage", name: "Stage changed",
    userLabel: "Rohan", userInitial: "R", userColor: "#8B5CF6",
    time: "10:12 AM", datetime: "June 24, 2026 at 10:12:00 AM GMT+05:30",
    fields: [
      { label: "Changed by",  value: "Rohan", isUser: true },
      { label: "From stage",  value: "Proposal" },
      { label: "To stage",    value: "Negotiation" },
      { label: "Deal ID",     value: "deal_acme_16225120001" },
      { label: "Timestamp",   value: "1782230520000" },
    ],
  },
  {
    id: "de2", day: "Tuesday", type: "email", name: "Email sent",
    userLabel: "Rohan", userInitial: "R", userColor: "#8B5CF6",
    time: "09:40 AM", datetime: "June 24, 2026 at 09:40:00 AM GMT+05:30",
    fields: [
      { label: "Sent by",     value: "Rohan", isUser: true },
      { label: "Subject",     value: "Revised proposal attached" },
      { label: "To",          value: "primary contact" },
      { label: "Message ID",  value: "msg_7a3bcf01_1782228600" },
      { label: "Timestamp",   value: "1782228600000" },
    ],
  },
  {
    id: "de3", day: "Monday", type: "call", name: "Call logged",
    userLabel: "Somya Nayak", userInitial: "S", userColor: "#0D9488",
    time: "04:15 PM", datetime: "June 23, 2026 at 04:15:00 PM GMT+05:30",
    fields: [
      { label: "Logged by",   value: "Somya Nayak", isUser: true },
      { label: "Direction",   value: "Outbound" },
      { label: "Duration",    value: "18 minutes" },
      { label: "Outcome",     value: "Connected — positive" },
      { label: "Timestamp",   value: "1782155700000" },
    ],
  },
  {
    id: "de4", day: "Monday", type: "meeting", name: "Meeting scheduled",
    userLabel: "Rohan", userInitial: "R", userColor: "#8B5CF6",
    time: "11:02 AM", datetime: "June 23, 2026 at 11:02:00 AM GMT+05:30",
    fields: [
      { label: "Scheduled by", value: "Rohan", isUser: true },
      { label: "Meeting",      value: "Contract walkthrough" },
      { label: "When",         value: "Jun 27, 2026 · 3:00 PM" },
      { label: "Attendees",    value: "3" },
      { label: "Timestamp",    value: "1782108120000" },
    ],
  },
  {
    id: "de5", day: "Monday", type: "note", name: "Note added",
    userLabel: "Sid Chaudhary", userInitial: "S", userColor: "#0D9488",
    time: "09:20 AM", datetime: "June 23, 2026 at 09:20:00 AM GMT+05:30",
    fields: [
      { label: "Added by",    value: "Sid Chaudhary", isUser: true },
      { label: "Note",        value: "Champion confirmed budget is approved for Q3" },
      { label: "Visibility",  value: "Team" },
      { label: "Timestamp",   value: "1782101400000" },
    ],
  },
  {
    id: "de6", day: "Friday", type: "email", name: "Email received",
    userLabel: "primary contact", userInitial: "P", userColor: "#64748b",
    time: "02:48 PM", datetime: "June 20, 2026 at 02:48:00 PM GMT+05:30",
    fields: [
      { label: "From",        value: "primary contact", isUser: true },
      { label: "Subject",     value: "Re: Pricing questions" },
      { label: "Message ID",  value: "msg_9c1def45_1781944680" },
      { label: "Timestamp",   value: "1781944680000" },
    ],
  },
  {
    id: "de7", day: "Friday", type: "stage", name: "Stage changed",
    userLabel: "Rohan", userInitial: "R", userColor: "#8B5CF6",
    time: "10:00 AM", datetime: "June 20, 2026 at 10:00:00 AM GMT+05:30",
    fields: [
      { label: "Changed by",  value: "Rohan", isUser: true },
      { label: "From stage",  value: "Qualification" },
      { label: "To stage",    value: "Proposal" },
      { label: "Timestamp",   value: "1781930400000" },
    ],
  },
];

function eventTypeIcon(type: ActivityEvent["type"], size = 14) {
  if (type === "stage")   return <TrendingUp size={size} />;
  if (type === "email")   return <Mail size={size} />;
  if (type === "call")    return <Phone size={size} />;
  if (type === "meeting") return <Calendar size={size} />;
  return <FileText size={size} />;
}

// ── contacts, tasks, meetings, calls (per-deal mock lists) ────────────────────

const CONTACT_COLUMNS: TableColumn[] = [
  { key: "contact", label: "Contact",  width: "26%" },
  { key: "role",    label: "Role",     width: "22%" },
  { key: "email",   label: "Email",    width: "30%" },
  { key: "phone",   label: "Phone",    width: "22%" },
];

const CONTACT_ROLE_TEMPLATES = [
  { role: "Decision Maker", title: "VP of Sales",        color: "#2563EB" },
  { role: "Champion",       title: "Marketing Director",  color: "#16a34a" },
  { role: "Influencer",     title: "CTO",                 color: "#d97706" },
  { role: "End User",       title: "Product Manager",     color: "#7c3aed" },
] as const;

const CONTACT_NAME_POOL = ["Justin Durdell", "Sarah Johnson", "Mike Chen", "Emily Davis", "Priya Shah", "Marcus Webb", "Elena Petrova", "Derek Foss"];

function dealContacts(deal: DealData) {
  const seed = deal.id.charCodeAt(deal.id.length - 1);
  return CONTACT_ROLE_TEMPLATES.map((tpl, i) => {
    const name = CONTACT_NAME_POOL[(seed + i * 2) % CONTACT_NAME_POOL.length];
    return {
      name,
      title: tpl.title,
      role: tpl.role,
      color: tpl.color,
      initials: initialsOf(name),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@${deal.accountId.replace(/-/g, "")}.com`,
      phone: `+1 (415) 555-0${100 + ((seed + i * 7) % 90)}`,
    };
  });
}

function contactRows(deal: DealData) {
  return dealContacts(deal).map((c, i) => ({
    id: `${deal.id}-c${i}`,
    cells: {
      contact: c.name,
      role:    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">{c.role}</span>,
      email:   { value: c.email, muted: true },
      phone:   { value: c.phone, muted: true },
    },
  }));
}

const TASK_COLUMNS: TableColumn[] = [
  { key: "taskName", label: "Task Name", width: "32%" },
  { key: "status",   label: "Status",    width: "16%" },
  { key: "due",      label: "Due",       width: "16%" },
  { key: "priority", label: "Priority",  width: "16%" },
  { key: "assignee", label: "Assignee",  width: "20%" },
];

function DealStatusChip({ label, tone }: { label: string; tone: "open" | "done" }) {
  const cls = tone === "done"
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300"
    : "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

function DealPriorityChip({ priority }: { priority: "High" | "Medium" | "Low" }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {priority}
    </span>
  );
}

function taskRows(deal: DealData) {
  const TASKS = [
    { name: "Send revised proposal",        status: "Open" as const, due: "Jun 28, 2026", priority: "High" as const },
    { name: "Confirm budget with champion", status: "Open" as const, due: "Jul 2, 2026",  priority: "Medium" as const },
    { name: "Follow up after demo",         status: "Done" as const, due: "Jun 18, 2026", priority: "Low" as const },
  ];
  return TASKS.map((t, i) => ({
    id: `${deal.id}-t${i}`,
    cells: {
      taskName: t.name,
      status:   <DealStatusChip label={t.status} tone={t.status === "Done" ? "done" : "open"} />,
      due:      { value: t.due, muted: true },
      priority: <DealPriorityChip priority={t.priority} />,
      assignee: deal.owner.name,
    },
  }));
}

const MEETING_COLUMNS: TableColumn[] = [
  { key: "meeting",   label: "Meeting",   width: "30%" },
  { key: "date",      label: "Date",      width: "16%" },
  { key: "time",      label: "Time",      width: "14%" },
  { key: "attendees", label: "Attendees", width: "16%" },
  { key: "status",    label: "Status",    width: "20%" },
];

function meetingRows(deal: DealData) {
  const MEETINGS = [
    { name: "Discovery call",         date: "Jun 15, 2026", time: "10:00 AM", attendees: 3, status: "Completed" as const },
    { name: "Demo walkthrough",       date: "Jun 20, 2026", time: "1:30 PM",  attendees: 4, status: "Completed" as const },
    { name: "Contract walkthrough",   date: "Jun 27, 2026", time: "3:00 PM",  attendees: 3, status: "Scheduled" as const },
  ];
  return MEETINGS.map((m, i) => ({
    id: `${deal.id}-m${i}`,
    cells: {
      meeting:   m.name,
      date:      { value: m.date, muted: true },
      time:      { value: m.time, muted: true },
      attendees: String(m.attendees),
      status:    <DealStatusChip label={m.status} tone={m.status === "Completed" ? "done" : "open"} />,
    },
  }));
}

const CALL_COLUMNS: TableColumn[] = [
  { key: "subject",  label: "Subject",   width: "28%" },
  { key: "date",     label: "Date",      width: "16%" },
  { key: "duration", label: "Duration",  width: "14%" },
  { key: "outcome",  label: "Outcome",   width: "22%" },
  { key: "caller",   label: "Caller",    width: "20%" },
];

function callRows(deal: DealData) {
  const CALLS = [
    { subject: "Intro & needs assessment", date: "Jun 12, 2026", duration: "22 min", outcome: "Connected — positive" },
    { subject: "Pricing questions",        date: "Jun 22, 2026", duration: "14 min", outcome: "Connected — neutral" },
    { subject: "Follow-up attempt",        date: "Jun 23, 2026", duration: "0 min",  outcome: "No answer" },
  ];
  return CALLS.map((c, i) => ({
    id: `${deal.id}-call${i}`,
    cells: {
      subject:  c.subject,
      date:     { value: c.date, muted: true },
      duration: { value: c.duration, muted: true },
      outcome:  c.outcome,
      caller:   deal.owner.name,
    },
  }));
}

const CALLS_EMPTY = (
  <div className="flex flex-col items-center gap-3 py-6">
    <img src="/mascot.png" alt="" className="h-16 w-16 object-contain" />
    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No calls yet</p>
  </div>
);

// ── sub-components ────────────────────────────────────────────────────────────

const PRIORITY_TONE: Record<DealData["priority"], string> = {
  High:   "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400",
  Medium: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400",
  Low:    "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300",
};

function accountDomain(deal: DealData) {
  return `${deal.accountId.replace(/-/g, "")}.com`;
}

function initialsOf(name: string, letters = 2) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, letters).toUpperCase();
}

const QUICK_ACTIONS = [
  { key: "email",   label: "Email",   icon: <Mail size={17} /> },
  { key: "call",    label: "Call",    icon: <Phone size={17} /> },
  { key: "task",    label: "Task",    icon: <SquareCheck size={17} /> },
  { key: "meeting", label: "Meeting", icon: <Calendar size={17} /> },
] as const;

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-stone-400 dark:text-stone-500">{label}</p>
      {children}
    </div>
  );
}

function DealSidebar({ deal }: { deal: DealData }) {
  const [copied, setCopied] = useState(false);

  function copyDomain() {
    navigator.clipboard.writeText(accountDomain(deal)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="w-72 shrink-0 flex flex-col gap-5 overflow-y-auto px-6 py-6">
      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{deal.name}</h2>

      {/* Account identity */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ background: deal.owner.color }}
        >
          {deal.account[0]}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{deal.account}</p>
          <button
            onClick={copyDomain}
            className="flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
          >
            {accountDomain(deal)}
            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-1">
        {QUICK_ACTIONS.map((a) => (
          <button key={a.key} type="button" className="group flex flex-col items-center gap-1.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors group-hover:bg-stone-200 dark:bg-white/8 dark:text-stone-300 dark:group-hover:bg-white/14">
              {a.icon}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t" style={{ borderColor: "var(--border)" }} />

      {/* Attributes */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-stone-900 dark:text-stone-100">Attributes</p>
        <button type="button" className="text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300">
          <SlidersHorizontal size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <SidebarField label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {deal.tags.map((t) => (
              <span key={t} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:bg-white/8 dark:text-stone-300">
                {t}
              </span>
            ))}
          </div>
        </SidebarField>

        <SidebarField label="Value">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.value}</p>
        </SidebarField>

        <SidebarField label="Close date">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.closeDate}</p>
        </SidebarField>

        <SidebarField label="Deal owner">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: deal.owner.color }}>
              {deal.owner.initial}
            </span>
            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.owner.name}</span>
          </div>
        </SidebarField>

        <SidebarField label="Deal stage">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.stage}</p>
        </SidebarField>

        <SidebarField label="Deal type">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.type}</p>
        </SidebarField>

        <SidebarField label="Priority">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_TONE[deal.priority]}`}>
            {deal.priority}
          </span>
        </SidebarField>

        <SidebarField label="Account">
          <Link
            to={`/accounts/${deal.accountId}`}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: deal.owner.color }}>
              {initialsOf(deal.account)}
            </span>
            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.account}</span>
          </Link>
        </SidebarField>

        <SidebarField label="Create date">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.createdDate}</p>
        </SidebarField>

        <SidebarField label="Last activity date">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{deal.lastActivityDate}</p>
        </SidebarField>

        <SidebarField label="Currency">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">USD</p>
        </SidebarField>
      </div>
    </div>
  );
}

type DealSnapshot = {
  movedDaysAgo: number;
  stageRecommendation: string;
  intentLevel: "High" | "Medium" | "Low";
  intentTrend: string;
  signalsCount: number;
  signalsText: string;
  intentRecommendation: string;
  healthLabel: "Strong" | "Moderate" | "Weak";
  healthTrend: string;
  progressScore: number;
  lastTouchpoint: string;
  daysInStage: number;
  stakeholderEngagement: "High" | "Medium" | "Low";
  healthRecommendation: string;
  askBluSummary: string;
  sparkline: number[];
};

const DEAL_SNAPSHOTS: Record<string, DealSnapshot> = {
  d1: {
    movedDaysAgo: 3,
    stageRecommendation: "Continue engaging with stakeholders to move toward a signed contract.",
    intentLevel: "High", intentTrend: "+45%",
    signalsCount: 12, signalsText: "Pricing page viewed 3x, demo scheduled, contract template downloaded",
    intentRecommendation: "High intent detected. Prioritize immediate follow-up and send proposal.",
    healthLabel: "Strong", healthTrend: "+12%", progressScore: 78,
    lastTouchpoint: "2 days ago", daysInStage: 3, stakeholderEngagement: "High",
    healthRecommendation: "Deal is progressing well. Continue maintaining regular touchpoints with key stakeholders.",
    askBluSummary: "Deal progressing well with strong stakeholder engagement",
    sparkline: [4, 6, 5, 8, 9, 8, 11, 13, 12, 15],
  },
  d2: {
    movedDaysAgo: 6,
    stageRecommendation: "Proposal has been out for a week — follow up before it goes cold.",
    intentLevel: "Medium", intentTrend: "+18%",
    signalsCount: 7, signalsText: "Proposal opened 2x, pricing page revisited, no reply yet",
    intentRecommendation: "Engagement is steady but slowing. Send a nudge with a time-boxed offer.",
    healthLabel: "Moderate", healthTrend: "+4%", progressScore: 55,
    lastTouchpoint: "4 days ago", daysInStage: 6, stakeholderEngagement: "Medium",
    healthRecommendation: "Momentum is cooling. Re-engage the champion before the proposal ages further.",
    askBluSummary: "Proposal sent, awaiting response — momentum is slowing",
    sparkline: [8, 7, 9, 6, 8, 7, 6, 8, 7, 9],
  },
  d3: {
    movedDaysAgo: 2,
    stageRecommendation: "Qualify budget and timeline with the economic buyer before advancing.",
    intentLevel: "Medium", intentTrend: "+22%",
    signalsCount: 5, signalsText: "Case studies page viewed, pricing page visited once",
    intentRecommendation: "Early signals are positive. Schedule a discovery call to confirm fit.",
    healthLabel: "Moderate", healthTrend: "+8%", progressScore: 40,
    lastTouchpoint: "1 day ago", daysInStage: 2, stakeholderEngagement: "Medium",
    healthRecommendation: "Early stage but active. Keep discovery moving with a clear next step.",
    askBluSummary: "Early-stage deal with promising initial engagement",
    sparkline: [3, 4, 5, 4, 6, 7, 6, 8, 7, 9],
  },
  d4: {
    movedDaysAgo: 0,
    stageRecommendation: "Deal closed — kick off onboarding and introduce the customer success team.",
    intentLevel: "High", intentTrend: "+5%",
    signalsCount: 3, signalsText: "Contract signed, kickoff call requested, welcome email opened",
    intentRecommendation: "Deal won. Shift focus to a smooth handoff into onboarding.",
    healthLabel: "Strong", healthTrend: "+20%", progressScore: 100,
    lastTouchpoint: "Today", daysInStage: 0, stakeholderEngagement: "High",
    healthRecommendation: "Closed won. Schedule the kickoff call within the week to maintain momentum.",
    askBluSummary: "Deal closed won — ready for onboarding handoff",
    sparkline: [10, 11, 12, 13, 14, 15, 16, 17, 18, 20],
  },
  d5: {
    movedDaysAgo: 5,
    stageRecommendation: "Still early — focus on uncovering pain points before pitching the AI suite.",
    intentLevel: "High", intentTrend: "+30%",
    signalsCount: 9, signalsText: "AI suite landing page viewed 4x, whitepaper downloaded",
    intentRecommendation: "Strong top-of-funnel interest. Move quickly to book a discovery call.",
    healthLabel: "Moderate", healthTrend: "+6%", progressScore: 25,
    lastTouchpoint: "3 days ago", daysInStage: 5, stakeholderEngagement: "Medium",
    healthRecommendation: "High interest but early. Don't let the deal stall in prospecting.",
    askBluSummary: "Strong early interest — move to qualify quickly",
    sparkline: [5, 7, 6, 9, 8, 10, 9, 12, 11, 14],
  },
  d6: {
    movedDaysAgo: 0,
    stageRecommendation: "Deal lost — log the reason and flag for a future re-engagement campaign.",
    intentLevel: "Low", intentTrend: "-15%",
    signalsCount: 2, signalsText: "No site visits in 30 days, last email unopened",
    intentRecommendation: "Interest has dropped off. Consider a win-back sequence in 90 days.",
    healthLabel: "Weak", healthTrend: "-10%", progressScore: 10,
    lastTouchpoint: "26 days ago", daysInStage: 0, stakeholderEngagement: "Low",
    healthRecommendation: "Deal closed lost. Capture the loss reason for future re-engagement.",
    askBluSummary: "Deal closed lost — candidate for future re-engagement",
    sparkline: [9, 8, 7, 6, 5, 4, 4, 3, 3, 2],
  },
  d7: {
    movedDaysAgo: 4,
    stageRecommendation: "Confirm pilot success criteria with the technical buyer this week.",
    intentLevel: "Medium", intentTrend: "+12%",
    signalsCount: 4, signalsText: "Docs page viewed, pilot terms page opened",
    intentRecommendation: "Engagement is modest. A short call could accelerate qualification.",
    healthLabel: "Moderate", healthTrend: "+3%", progressScore: 35,
    lastTouchpoint: "5 days ago", daysInStage: 4, stakeholderEngagement: "Medium",
    healthRecommendation: "Deal is moving but slowly. Set a clear pilot timeline to keep it active.",
    askBluSummary: "Pilot deal moving steadily — needs a clear timeline",
    sparkline: [4, 5, 4, 6, 5, 7, 6, 7, 8, 7],
  },
  d8: {
    movedDaysAgo: 2,
    stageRecommendation: "Security review is the main blocker — loop in your security engineer.",
    intentLevel: "High", intentTrend: "+28%",
    signalsCount: 8, signalsText: "Security whitepaper downloaded, compliance page viewed 2x",
    intentRecommendation: "High intent around security fit. Offer a technical deep-dive call.",
    healthLabel: "Strong", healthTrend: "+9%", progressScore: 60,
    lastTouchpoint: "1 day ago", daysInStage: 2, stakeholderEngagement: "High",
    healthRecommendation: "Strong technical engagement. Keep security stakeholders looped in.",
    askBluSummary: "Strong technical interest — security review in progress",
    sparkline: [6, 7, 8, 7, 9, 10, 9, 11, 12, 13],
  },
};

const OVERVIEW_TASKS = [
  { name: "Follow up on proposal",          desc: "Deal showing strong momentum. Follow up with decision maker to address any final questions.", priority: "High" as const,   due: "Tomorrow" },
  { name: "Prepare pricing proposal",       desc: "Create customized pricing proposal based on their requirements.",                              priority: "Medium" as const, due: "In 3 days" },
  { name: "Schedule implementation call",   desc: "Coordinate with technical team for implementation planning.",                                   priority: "Low" as const,    due: "Next week" },
];

function SnapshotCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-stone-900 dark:text-stone-100">{title}</p>
        <Info size={14} className="text-stone-300 dark:text-stone-600" />
      </div>
      {children}
    </div>
  );
}

function DealStageCard({ deal, snap }: { deal: DealData; snap: DealSnapshot }) {
  const progress = STAGE_PROBABILITY[deal.stage];
  const currentIdx = PIPELINE_STAGES.indexOf(deal.stage);

  return (
    <SnapshotCard title="Deal Stage">
      <span className="inline-flex w-fit items-center rounded-full bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-800 dark:bg-white/8 dark:text-stone-100">
        {deal.stage}
      </span>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-stone-400 dark:text-stone-500">Progress</span>
          <span className="font-semibold text-stone-700 dark:text-stone-200">{progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-white/8">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              i === currentIdx ? "bg-blue-500 text-white" : "bg-stone-100 text-stone-400 dark:bg-white/8 dark:text-stone-500"
            }`}
          >
            {i + 1}
          </span>
        ))}
      </div>
      <p className="text-xs text-stone-400 dark:text-stone-500">
        Moved to {deal.stage} {snap.movedDaysAgo === 0 ? "today" : `${snap.movedDaysAgo} day${snap.movedDaysAgo === 1 ? "" : "s"} ago`}
      </p>
      <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <p className="mb-1 text-xs font-semibold text-stone-700 dark:text-stone-200">Recommendation</p>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{snap.stageRecommendation}</p>
      </div>
    </SnapshotCard>
  );
}

function IntentCard({ snap }: { snap: DealSnapshot }) {
  const positive = !snap.intentTrend.startsWith("-");
  const tone = snap.intentLevel === "High"
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300"
    : snap.intentLevel === "Medium"
    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400"
    : "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300";
  const sparkData = snap.sparkline.map((v, i) => ({ i, v }));

  return (
    <SnapshotCard title="Intent">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{snap.intentLevel}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
          <TrendingUp size={12} className={positive ? "" : "rotate-180"} />
          {snap.intentTrend} vs prev
        </span>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={1.5} fill="none" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <p className="mb-1 text-xs font-semibold text-stone-700 dark:text-stone-200">Recent signals ({snap.signalsCount})</p>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{snap.signalsText}</p>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-stone-700 dark:text-stone-200">Recommendation</p>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{snap.intentRecommendation}</p>
      </div>
    </SnapshotCard>
  );
}

function DealHealthCard({ snap }: { snap: DealSnapshot }) {
  const positive = !snap.healthTrend.startsWith("-");
  const tone = snap.healthLabel === "Strong"
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300"
    : snap.healthLabel === "Moderate"
    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400"
    : "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400";

  return (
    <SnapshotCard title="Deal Health">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{snap.healthLabel}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
          <TrendingUp size={12} className={positive ? "" : "rotate-180"} />
          {snap.healthTrend}
        </span>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-stone-400 dark:text-stone-500">Progress Score</span>
          <span className="font-semibold text-stone-700 dark:text-stone-200">{snap.progressScore}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-white/8">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${snap.progressScore}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-stone-400 dark:text-stone-500">Last touchpoint</span>
          <span className="font-medium text-stone-700 dark:text-stone-200">{snap.lastTouchpoint}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-400 dark:text-stone-500">Days in stage</span>
          <span className="font-medium text-stone-700 dark:text-stone-200">{snap.daysInStage} days</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-400 dark:text-stone-500">Stakeholder engagement</span>
          <span className="font-medium text-stone-700 dark:text-stone-200">{snap.stakeholderEngagement}</span>
        </div>
      </div>
      <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <p className="mb-1 text-xs font-semibold text-stone-700 dark:text-stone-200">Recommendation</p>
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{snap.healthRecommendation}</p>
      </div>
    </SnapshotCard>
  );
}

function AskBluBanner({ summary }: { summary: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="flex w-full items-center gap-2.5 rounded-xl px-5 py-4 text-left transition-colors hover:opacity-90"
      style={{ background: "rgba(0,128,255,0.06)", border: "1px solid rgba(0,128,255,0.16)" }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,128,255,0.14)" }}>
        <img src="/mascot.png" alt="" width={13} height={13} className="object-contain" />
      </span>
      <span className="shrink-0 font-semibold text-blue-600 dark:text-blue-400">Ask Blu</span>
      <span className="shrink-0 text-stone-300 dark:text-stone-600">·</span>
      <span className="min-w-0 flex-1 truncate text-sm text-stone-600 dark:text-stone-300">{summary}</span>
      <ChevronDown size={16} className={`shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function OverviewTab({ deal }: { deal: DealData }) {
  const snap = DEAL_SNAPSHOTS[deal.id];
  const contacts = dealContacts(deal);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-3 font-semibold text-stone-900 dark:text-stone-100">Snapshot</p>
        <div className="grid grid-cols-3 gap-5">
          <DealStageCard deal={deal} snap={snap} />
          <IntentCard snap={snap} />
          <DealHealthCard snap={snap} />
        </div>
      </div>

      <AskBluBanner summary={snap.askBluSummary} />

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
              <SquareCheck size={15} className="text-blue-500" />
              Upcoming tasks
            </p>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-100 px-2 text-xs font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-300">
              {OVERVIEW_TASKS.length}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {OVERVIEW_TASKS.map((t) => (
              <div key={t.name} className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
                <div className="mb-1 flex items-center gap-2">
                  <SquareCheck size={13} className="text-blue-500" />
                  <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{t.name}</span>
                </div>
                <p className="mb-2 text-xs text-stone-500 dark:text-stone-400">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-stone-200/70 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-white/10 dark:text-stone-300">
                    {t.priority} Priority
                  </span>
                  <span className="text-xs text-stone-400 dark:text-stone-500">{t.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
              <Users size={15} className="text-blue-500" />
              Associated users
            </p>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-100 px-2 text-xs font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-300">
              {contacts.length}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {contacts.map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-stone-50 dark:hover:bg-white/5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: c.color }}>
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{c.name}</p>
                  <p className="truncate text-xs text-stone-400 dark:text-stone-500">{c.title}</p>
                </div>
                <span className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-stone-500 dark:text-stone-400" style={{ background: "var(--muted)" }}>
                  {c.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ deal }: { deal: DealData }) {
  return (
    <DashboardTable
      columns={CONTACT_COLUMNS}
      rows={contactRows(deal)}
      searchPlaceholder="Search contacts..."
    />
  );
}

function ActivityTab() {
  const [selectedId, setSelectedId] = useState<string>(DEAL_EVENTS[0].id);
  const [detailTab, setDetailTab]   = useState<"info" | "raw">("info");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  function copyField(label: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  }

  const selected = DEAL_EVENTS.find((e) => e.id === selectedId) ?? DEAL_EVENTS[0];

  const days: { label: string; events: ActivityEvent[] }[] = [];
  for (const ev of DEAL_EVENTS) {
    const last = days[days.length - 1];
    if (last && last.label === ev.day) last.events.push(ev);
    else days.push({ label: ev.day, events: [ev] });
  }

  const rawJson = JSON.stringify(
    {
      id: selected.id,
      type: selected.type,
      timestamp: Number(selected.fields.find((f) => f.label === "Timestamp")?.value ?? 0),
      ...Object.fromEntries(selected.fields.map((f) => [f.label, f.value])),
    },
    null,
    2
  );

  return (
    <div className="flex h-full min-h-0 gap-4 px-4 pb-4">
      {/* Left: event list */}
      <div className="w-96 shrink-0 overflow-y-auto py-4">
        {days.map(({ label, events }) => (
          <div key={label} className="mb-5">
            <p className="mb-2 px-2 text-xs font-semibold text-stone-400 dark:text-stone-500">{label}</p>
            <div className="flex flex-col">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => { setSelectedId(ev.id); setDetailTab("info"); }}
                  className={`cursor-pointer rounded-xl px-3 py-3 transition-colors ${
                    selectedId === ev.id ? "bg-blue-50/60 dark:bg-blue-500/8" : "hover:bg-stone-50/70 dark:hover:bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                      {eventTypeIcon(ev.type, 14)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{ev.name}</span>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{ev.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500">
                        {ev.fields[1]?.value ?? ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-11">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style={{ fontSize: 9, background: ev.userColor }}>
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
            {eventTypeIcon(selected.type, 15)}
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
                  <span className="w-32 shrink-0 text-sm text-stone-500 dark:text-stone-400">{label}</span>
                  <div className="flex-1 min-w-0">
                    {isUser ? (
                      <div className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5" style={{ borderColor: "var(--border)" }}>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ fontSize: 9, background: selected.userColor }}>
                          {selected.userInitial}
                        </span>
                        <span className="text-sm text-stone-700 dark:text-stone-200">{value}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-stone-700 dark:text-stone-200">{value}</span>
                    )}
                  </div>
                  <button
                    onClick={() => copyField(label, value)}
                    className="shrink-0 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-stone-100 dark:hover:bg-white/8"
                  >
                    {copiedLabel === label ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-stone-400" />}
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

function TasksTab({ deal }: { deal: DealData }) {
  return (
    <DashboardTable
      columns={TASK_COLUMNS}
      rows={taskRows(deal)}
      searchPlaceholder="Search tasks..."
    />
  );
}

function MeetingsTab({ deal }: { deal: DealData }) {
  return (
    <DashboardTable
      columns={MEETING_COLUMNS}
      rows={meetingRows(deal)}
      searchPlaceholder="Search meetings..."
    />
  );
}

function CallsTab({ deal }: { deal: DealData }) {
  const rows = callRows(deal);
  return (
    <DashboardTable
      columns={CALL_COLUMNS}
      rows={rows}
      searchPlaceholder="Search calls..."
      emptyState={CALLS_EMPTY}
    />
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function DealDetailView() {
  const { id, "*": splat } = useParams<{ id: string; "*": string }>();
  const navigate = useNavigate();
  const validTabs = DEAL_TABS.map((t) => t.key) as Tab[];
  const activeTab: Tab = validTabs.includes(splat as Tab) ? (splat as Tab) : "overview";

  useEffect(() => {
    if (!splat || !validTabs.includes(splat as Tab)) {
      navigate(`/deals/${id}/overview`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deal = DEALS_DATA.find((d) => d.id === id);

  if (!deal) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-stone-400">Deal not found.</p>
      </div>
    );
  }

  const isTableTab = activeTab === "activity" || activeTab === "users" || activeTab === "tasks" || activeTab === "meetings" || activeTab === "calls";

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div
        className="flex shrink-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b px-5 py-2.5"
        style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <BackButton href="/deals" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{deal.name}</span>
        </div>
        <div className="shrink-0">
          <SubTabCorner
            tabs={DEAL_TABS as unknown as { key: string; label: string }[]}
            active={activeTab}
            onChange={(k) => navigate(`/deals/${id}/${k}`)}
          />
        </div>
      </div>

      {/* Body: persistent left sidebar + right column */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: always-visible deal sidebar */}
        <div className="shrink-0 overflow-y-auto">
          <DealSidebar deal={deal} />
        </div>

        {/* Right: date picker + tab content */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 px-7 py-3">
            <DateRangePicker className="flex flex-wrap items-center gap-x-4 gap-y-2" />
          </div>

          <div className={`flex-1 min-h-0 ${isTableTab ? "overflow-hidden flex flex-col px-4 pb-4 pt-0" : "overflow-y-auto px-7 pb-6"}`}>
            {activeTab === "overview" && <OverviewTab deal={deal} />}
            {activeTab === "users"    && <UsersTab deal={deal} />}
            {activeTab === "activity" && <ActivityTab />}
            {activeTab === "tasks"    && <TasksTab deal={deal} />}
            {activeTab === "meetings" && <MeetingsTab deal={deal} />}
            {activeTab === "calls"    && <CallsTab deal={deal} />}
          </div>
        </div>
      </div>
    </div>
  );
}
