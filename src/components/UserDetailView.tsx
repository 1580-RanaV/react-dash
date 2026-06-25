

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, CheckCircle2, ChevronDown, Copy, FileText, Globe, Mail, MessageSquare, MousePointer2, Phone, TrendingUp, XCircle, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { USERS_DATA } from "./UsersView";
import BackButton from "./BackButton";
import CodeBlock from "./CodeBlock";
import SubTabCorner from "./SubTabCorner";
import DateRangePicker from "./DateRangePicker";

const TABS = [
  { key: "overview",  label: "Overview" },
  { key: "activity",  label: "Activity" },
  { key: "tasks",     label: "Tasks" },
  { key: "email",     label: "Email" },
  { key: "privacy",   label: "Privacy" },
] as const;

type Tab = typeof TABS[number]["key"];

const CITIES = ["New York", "Austin", "San Francisco", "Chicago", "Seattle", "Boston", "Denver", "Miami", "Portland", "Atlanta"];
const INTENTS = [
  { label: "High",      color: "#16a34a" },
  { label: "Medium",    color: "#f97316" },
  { label: "Undefined", color: "#f97316" },
  { label: "Low",       color: "#64748b" },
];

function userExtra(idx: number) {
  const seed = idx + 1;
  return {
    city:            CITIES[idx % CITIES.length],
    lastSeen:        `Tue, Jun ${17 + (seed % 7)}, 2026`,
    firstSeen:       `Fri, Jun ${1 + (seed % 12)}, 2026`,
    totalEvents:     100 + seed * 37,
    intent:          INTENTS[idx % INTENTS.length],
    sessionActivity: `${6 + (seed % 30)} minutes`,
  };
}

const DATE_LABELS = [
  "May 27","May 30","Jun 1","Jun 3","Jun 5","Jun 7","Jun 9",
  "Jun 11","Jun 13","Jun 15","Jun 17","Jun 19","Jun 21","Jun 23","Jun 25",
];
function chartData(seed: number) {
  return DATE_LABELS.map((date, i) => {
    const spike1 = i === 11 ? 80 + (seed % 30) : 0;
    const spike2 = i === 13 ? 190 + (seed % 40) : 0;
    const noise  = (((seed * (i + 7)) % 11));
    return { date, events: Math.max(spike1, spike2, noise) };
  });
}

const VISITED_PAGES = [
  { title: "DASHBOARD | FieldsUS…", events: 25 },
  { title: "Items in my cart | F…",  events: 11 },
  { title: "Checkout | FieldsUSA",   events: 6 },
  { title: "PMC 223A Bronze .223…",  events: 5 },
  { title: "PMC 9G Bronze 9mm 12…",  events: 5 },
];

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

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: "ev1", day: "Tuesday", type: "charge", name: "Charge",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "05:23 AM", datetime: "June 24, 2026 at 05:23:04 AM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_6a3acf08674894.91425672_1782238984" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "No value" },
      { label: "Page ID",     value: "pag_mqquni4a_1782231556474_qiqmnu4a7Z" },
      { label: "Timestamp",   value: "1782238984000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312000" },
      { label: "Data Status", value: "Pending payment" },
      { label: "Data Amount", value: "13907" },
    ],
  },
  {
    id: "ev2", day: "Tuesday", type: "click", name: "Click on",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:43 AM", datetime: "June 24, 2026 at 02:43:00 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_b7d2ef09123456.78901234_1782228180" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_xyz789_1782228000000_abc123def456" },
      { label: "Timestamp",   value: "1782228180000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312001" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev3", day: "Tuesday", type: "click", name: "Click on",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:43 AM", datetime: "June 24, 2026 at 02:43:12 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_c8e3fg01234567.89012345_1782228192" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_xyz789_1782228000000_abc123def456" },
      { label: "Timestamp",   value: "1782228192000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312002" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev4", day: "Tuesday", type: "view", name: "View page",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:43 AM", datetime: "June 24, 2026 at 02:43:21 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_d9f4gh12345678.90123456_1782228201" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_home_1782228000000_xyz987uvw654" },
      { label: "Timestamp",   value: "1782228201000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312003" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev5", day: "Tuesday", type: "click", name: "Click on",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:42 AM", datetime: "June 24, 2026 at 02:42:55 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_e0g5hi23456789.01234567_1782228175" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_xyz789_1782228000000_abc123def456" },
      { label: "Timestamp",   value: "1782228175000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312004" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev6", day: "Tuesday", type: "view", name: "View page",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:42 AM", datetime: "June 24, 2026 at 02:42:40 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_f1h6ij34567890.12345678_1782228160" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_checkout_1782228000000_lmn321opq654" },
      { label: "Timestamp",   value: "1782228160000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312005" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev7", day: "Tuesday", type: "click", name: "Click on",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:42 AM", datetime: "June 24, 2026 at 02:42:30 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_g2i7jk45678901.23456789_1782228150" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_checkout_1782228000000_lmn321opq654" },
      { label: "Timestamp",   value: "1782228150000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312006" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev8", day: "Tuesday", type: "view", name: "View page",
    userLabel: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", userInitial: "P", userColor: "#64748b",
    time: "02:42 AM", datetime: "June 24, 2026 at 02:42:10 AM GMT+05:30",
    fields: [
      { label: "User",        value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT", isUser: true },
      { label: "Event ID",    value: "event_h3j8kl56789012.34567890_1782228130" },
      { label: "Profile ID",  value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Session ID",  value: "sess_ab12cd34ef56" },
      { label: "Page ID",     value: "pag_product_1782228000000_rst654uvw987" },
      { label: "Timestamp",   value: "1782228130000" },
      { label: "User ID",     value: "prof_mqjyp7v4_1781815091728_y4vmp7qjcT" },
      { label: "Source ID",   value: "1612612062733312007" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev9", day: "Monday", type: "charge", name: "Charge",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "11:47 PM", datetime: "June 23, 2026 at 11:47:02 PM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_z9k1mn67890123.45678901_1782141822" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "No value" },
      { label: "Page ID",     value: "pag_order_1782141600000_rst987uvw321" },
      { label: "Timestamp",   value: "1782141822000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312008" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "24750" },
    ],
  },
  {
    id: "ev10", day: "Monday", type: "view", name: "View page",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "11:46 PM", datetime: "June 23, 2026 at 11:46:55 PM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_a0l2op78901234.56789012_1782141815" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "sess_zl99mn12op34" },
      { label: "Page ID",     value: "pag_cart_1782141600000_uvw654xyz987" },
      { label: "Timestamp",   value: "1782141815000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312009" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev11", day: "Monday", type: "click", name: "Click on",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "11:46 PM", datetime: "June 23, 2026 at 11:46:40 PM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_b1m3pq89012345.67890123_1782141800" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "sess_zl99mn12op34" },
      { label: "Page ID",     value: "pag_cart_1782141600000_uvw654xyz987" },
      { label: "Timestamp",   value: "1782141800000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312010" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev12", day: "Monday", type: "view", name: "View page",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "11:45 PM", datetime: "June 23, 2026 at 11:45:30 PM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_c2n4qr90123456.78901234_1782141730" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "sess_zl99mn12op34" },
      { label: "Page ID",     value: "pag_product_1782141600000_abc111def222" },
      { label: "Timestamp",   value: "1782141730000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312011" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev13", day: "Monday", type: "click", name: "Click on",
    userLabel: "zlane@beltonpd.org", userInitial: "Z", userColor: "#0d9488",
    time: "11:44 PM", datetime: "June 23, 2026 at 11:44:18 PM GMT+05:30",
    fields: [
      { label: "User",        value: "zlane@beltonpd.org", isUser: true },
      { label: "Event ID",    value: "event_d3o5rs01234567.89012345_1782141658" },
      { label: "Profile ID",  value: "zlane@beltonpd.org" },
      { label: "Session ID",  value: "sess_zl99mn12op34" },
      { label: "Page ID",     value: "pag_search_1782141600000_ghi333jkl444" },
      { label: "Timestamp",   value: "1782141658000" },
      { label: "User ID",     value: "zlane@beltonpd.org" },
      { label: "Source ID",   value: "1612612062733312012" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
  {
    id: "ev14", day: "Sunday", type: "charge", name: "Charge",
    userLabel: "s.mitchell@apexdyn.com", userInitial: "S", userColor: "#7c3aed",
    time: "03:12 PM", datetime: "June 22, 2026 at 03:12:44 PM GMT+05:30",
    fields: [
      { label: "User",        value: "s.mitchell@apexdyn.com", isUser: true },
      { label: "Event ID",    value: "event_e4p6st12345678.90123456_1782055964" },
      { label: "Profile ID",  value: "s.mitchell@apexdyn.com" },
      { label: "Session ID",  value: "No value" },
      { label: "Page ID",     value: "pag_billing_1782055000000_mno555pqr666" },
      { label: "Timestamp",   value: "1782055964000" },
      { label: "User ID",     value: "s.mitchell@apexdyn.com" },
      { label: "Source ID",   value: "1612612062733312013" },
      { label: "Data Status", value: "Pending payment" },
      { label: "Data Amount", value: "8900" },
    ],
  },
  {
    id: "ev15", day: "Sunday", type: "view", name: "View page",
    userLabel: "s.mitchell@apexdyn.com", userInitial: "S", userColor: "#7c3aed",
    time: "03:10 PM", datetime: "June 22, 2026 at 03:10:21 PM GMT+05:30",
    fields: [
      { label: "User",        value: "s.mitchell@apexdyn.com", isUser: true },
      { label: "Event ID",    value: "event_f5q7uv23456789.01234567_1782055821" },
      { label: "Profile ID",  value: "s.mitchell@apexdyn.com" },
      { label: "Session ID",  value: "sess_sm77rs45tu67" },
      { label: "Page ID",     value: "pag_billing_1782055000000_mno555pqr666" },
      { label: "Timestamp",   value: "1782055821000" },
      { label: "User ID",     value: "s.mitchell@apexdyn.com" },
      { label: "Source ID",   value: "1612612062733312014" },
      { label: "Data Status", value: "Completed" },
      { label: "Data Amount", value: "0" },
    ],
  },
];

function eventTypeIcon(type: ActivityEvent["type"], size = 14) {
  if (type === "view")   return <MousePointer2 size={size} />;
  if (type === "charge") return <Zap size={size} />;
  return null;
}

function eventTypeBg(_type: ActivityEvent["type"]) {
  return "bg-blue-50 text-blue-500 dark:bg-blue-500/10";
}

// ── sub-components ─────────────────────────────────────────────

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

function ProfileSidebar({ user, idx }: { user: typeof USERS_DATA[number]; idx: number }) {
  const extra    = userExtra(idx);
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  const profileFields = [
    { label: "Name",                   value: user.name },
    { label: "City",                   value: extra.city },
    { label: "Last seen",              value: extra.lastSeen },
    { label: "First seen",             value: extra.firstSeen },
    { label: "Total events performed", value: String(extra.totalEvents) },
    {
      label: "Intent level",
      value: (
        <span className="flex items-center gap-1 text-sm font-medium" style={{ color: extra.intent.color }}>
          <TrendingUp size={13} />
          {extra.intent.label}
        </span>
      ),
    },
    { label: "Session activity", value: extra.sessionActivity },
  ];

  return (
    <div className="w-56 shrink-0 flex flex-col gap-5 px-6 py-6">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white"
        style={{ background: "#16a34a" }}
      >
        {initials}
      </div>

      <div>
        <p className="font-bold text-stone-900 dark:text-stone-100">{user.name}</p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{user.email}</p>
      </div>

      <DraftAIButton />

      <div className="flex flex-col gap-3.5">
        {profileFields.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <p className="text-xs text-stone-400 dark:text-stone-500">{label}</p>
            {typeof value === "string"
              ? <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{value}</p>
              : value}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTab() {
  const [selectedId, setSelectedId] = useState<string>(ACTIVITY_EVENTS[0].id);
  const [detailTab, setDetailTab]   = useState<"info" | "raw">("info");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  function copyField(label: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  }

  const visibleEvents = ACTIVITY_EVENTS;
  const selected = visibleEvents.find((e) => e.id === selectedId) ?? visibleEvents[0];

  // Group events by day
  const days: { label: string; events: ActivityEvent[] }[] = [];
  for (const ev of visibleEvents) {
    const last = days[days.length - 1];
    if (last && last.label === ev.day) last.events.push(ev);
    else days.push({ label: ev.day, events: [ev] });
  }

  const rawJson = JSON.stringify(
    Object.fromEntries([
      ["id",        selected.fields.find(f => f.label === "Event Id")?.value ?? ""],
      ["type",      selected.type],
      ["timestamp", Number(selected.fields.find(f => f.label === "Timestamp")?.value ?? 0)],
      ["eventId",   selected.fields.find(f => f.label === "Event Id")?.value ?? ""],
      ["status",    selected.fields.find(f => f.label === "Data Status")?.value ?? ""],
      ["amount",    Number(selected.fields.find(f => f.label === "Data Amount")?.value ?? 0)],
      ["profileId", selected.fields.find(f => f.label === "Profile Id")?.value ?? ""],
      ["sessionId", selected.fields.find(f => f.label === "Session Id")?.value ?? ""],
      ["pageId",    selected.fields.find(f => f.label === "Page Id")?.value ?? ""],
      ["userId",    selected.fields.find(f => f.label === "User Id")?.value ?? ""],
      ["sourceId",  selected.fields.find(f => f.label === "Source Id")?.value ?? ""],
    ]),
    null,
    2
  );

  return (
    <div className="flex h-full min-h-0 gap-4 px-4 pb-4">
      {/* Left: event list */}
      <div className="w-160 shrink-0 overflow-y-auto py-4">
        {days.map(({ label, events }) => (
          <div key={label} className="mb-5">
            <p className="mb-2 px-2 text-xs font-semibold text-stone-400 dark:text-stone-500">{label}</p>
            <div className="flex flex-col">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => { setSelectedId(ev.id); setDetailTab("info"); }}
                  className={`group relative w-full cursor-pointer rounded-xl px-3 py-3 transition-colors ${
                    selectedId === ev.id
                      ? "bg-blue-50/60 dark:bg-blue-500/8"
                      : "hover:bg-stone-50/70 dark:hover:bg-white/3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${eventTypeBg(ev.type)}`}>
                      {eventTypeIcon(ev.type, 14) ?? <div className="h-2 w-2 rounded-full bg-stone-300 dark:bg-stone-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{ev.name}</span>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{ev.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-400 dark:text-stone-500 font-mono">
                        {ev.fields.find(f => f.label === "Event Id")?.value}
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
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-3.5">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${eventTypeBg(selected.type)}`}>
            {eventTypeIcon(selected.type, 15) ?? <div className="h-3 w-3 rounded-full bg-stone-300 dark:bg-stone-500" />}
          </div>
          <div>
            <p className="font-semibold text-stone-900 dark:text-stone-100">{selected.name}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">{selected.datetime}</p>
          </div>
        </div>

        {/* Info / Raw tabs — ViewTabs visual style */}
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

        {/* Content */}
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

function OverviewTab({ user, idx }: { user: typeof USERS_DATA[number]; idx: number }) {
  const data = chartData(idx + 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold text-stone-900 dark:text-stone-100">Event activity</p>
            <div
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium text-stone-600 dark:text-stone-300"
              style={{ borderColor: "var(--border)" }}
            >
              All events
              <ChevronDown size={11} className="text-stone-400" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradUser" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "var(--stone-400, #a8a29e)" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: "var(--stone-400, #a8a29e)" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="events" stroke="#60a5fa" strokeWidth={2} fill="url(#areaGradUser)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-5 font-semibold text-stone-900 dark:text-stone-100">Most visited pages</p>
          <div className="flex flex-col gap-4">
            {VISITED_PAGES.map(({ title, events }) => (
              <div key={title} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Globe size={13} className="shrink-0 text-stone-400" />
                    <span className="truncate text-sm text-stone-700 dark:text-stone-200">{title}</span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-stone-800 dark:text-stone-100">{events}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-white/8">
                  <div className="h-1.5 rounded-full" style={{ width: `${(events / 25) * 100}%`, background: "#0080FF" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-3 font-semibold text-stone-900 dark:text-stone-100">Most triggered defined events</p>
          <NoData label="No data yet" />
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-1 font-semibold text-stone-900 dark:text-stone-100">Past meetings</p>
          <NoData label="No data yet" />
        </div>
      </div>
    </div>
  );
}

function PrivacyTab() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    general:    true,
    newsletter: false,
  });

  function toggle(key: string) {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }

  const CATEGORIES = [
    {
      key: "general",
      label: "General",
      description: "Get the emails that keep you in the loop. Order and shipping updates, delivery confirmations, returns and support info, back in stock alerts, price drops on items you viewed, plus important account or policy updates.",
    },
    {
      key: "newsletter",
      label: "Newsletter",
      description: "A round-up from FieldsUSA. Best deals, bulk savings, new arrivals, and timely buying tips. Short, practical, and focused on helping you find what you need faster.",
    },
  ];

  const consented = CATEGORIES.filter((c) => toggles[c.key]);
  const revoked   = CATEGORIES.filter((c) => !toggles[c.key]);

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {/* Consent status */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
        <p className="font-semibold text-stone-900 dark:text-stone-100">Consent status</p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Snapshot of what this user has opted into. Last updated: Jun 25, 2026 · Source: website
        </p>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Consented</p>
            <div className="flex flex-wrap gap-2">
              {consented.length === 0
                ? <span className="text-xs text-stone-400">None</span>
                : consented.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <CheckCircle2 size={12} />
                      {c.label}
                    </span>
                  ))
              }
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Revoked</p>
            <div className="flex flex-wrap gap-2">
              {revoked.length === 0
                ? <span className="text-xs text-stone-400">None</span>
                : revoked.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 dark:bg-red-500/10 dark:text-red-400">
                      <XCircle size={12} />
                      {c.label}
                    </span>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Consent categories */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
        <p className="font-semibold text-stone-900 dark:text-stone-100">Consent categories</p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Toggle each category. Changes are confirmed on reject and saved immediately.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-white/8">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{c.label}</p>
                  <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 leading-relaxed">{c.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(c.key)}
                className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${toggles[c.key] ? "bg-blue-500" : "bg-stone-200 dark:bg-white/15"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${toggles[c.key] ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Legitimate interest */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)" }}>
        <p className="font-semibold text-stone-900 dark:text-stone-100">Legitimate interest</p>
        <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">
          Lawful basis: subscription communication. End users may request objection (Art. 21). Toggle each category. Changes are confirmed on reject and saved immediately.
        </p>
        <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">No legitimate interest categories available.</p>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────

export default function UserDetailView() {
  const { id, "*": splat } = useParams<{ id: string; "*": string }>();
  const navigate = useNavigate();
  const validTabs = TABS.map((t) => t.key) as Tab[];
  const activeTab: Tab = validTabs.includes(splat as Tab) ? (splat as Tab) : "overview";

  useEffect(() => {
    if (!splat || !validTabs.includes(splat as Tab)) {
      navigate(`/users/${id}/overview`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idx  = USERS_DATA.findIndex((u) => u.id === id);
  const user = USERS_DATA[idx];

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-stone-400">User not found.</p>
      </div>
    );
  }

  const isActivity = activeTab === "activity";

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div
        className="flex shrink-0 items-center gap-3 border-b px-5 py-2.5"
        style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <BackButton href="/users" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{user.name}</span>
        </div>
        <div className="flex-1" />
        <SubTabCorner
          tabs={TABS as unknown as { key: string; label: string }[]}
          active={activeTab}
          onChange={(k) => navigate(`/users/${id}/${k}`)}
        />
      </div>

      {/* Body: persistent left sidebar + right column */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: always-visible profile sidebar */}
        <div className="shrink-0 overflow-y-auto">
          <ProfileSidebar user={user} idx={idx} />
        </div>

        {/* Right: date picker + tab content */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Date range — right side only, no border */}
          <div className="shrink-0 px-7 py-3">
            <DateRangePicker className="flex flex-wrap items-center gap-x-4 gap-y-2" />
          </div>

          <div className={`flex-1 min-h-0 ${isActivity ? "overflow-hidden" : "overflow-y-auto px-7 pb-6"}`}>
          {activeTab === "overview" && <OverviewTab user={user} idx={idx} />}
          {activeTab === "activity" && <ActivityTab />}

          {activeTab === "tasks" && (
            <div className="flex max-w-2xl flex-col gap-3">
              {["Follow up on demo request","Send onboarding email","Schedule check-in call"].map((t, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)" }}>
                  <div className="h-4 w-4 shrink-0 rounded border-2 border-stone-300 dark:border-stone-600" />
                  <span className="text-sm text-stone-700 dark:text-stone-200">{t}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "email" && (
            <div className="flex max-w-2xl flex-col gap-3">
              {["Welcome email","Monthly newsletter — June","Product update announcement"].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)" }}>
                  <span className="text-sm text-stone-700 dark:text-stone-200">{s}</span>
                  <span className="text-xs text-stone-400">Jun {20 - i * 3}, 2026</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "privacy" && <PrivacyTab />}
          </div>{/* tab content */}
        </div>{/* right column */}
      </div>{/* body */}
    </div>
  );
}
