

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, ChevronDown, Filter, Globe, HandCoins, HistoryIcon, Info, LayoutDashboard, Pencil, Plus, RotateCcw, Trash2, TrendingDown, TrendingUp, UserPlus, Users } from "lucide-react";
import {
  AreaChart, Area, ComposedChart, Bar, Line, LabelList,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import ViewTabs from "./ViewTabs";
import DashboardTable, { FilterConfig, TableColumn, TableRow } from "./DashboardTable";
import { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import SlidingSidebar from "./SlidingSidebar";
import { BOARDS_DATA, BoardEntry, BoardType } from "./boards/boardsData";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── Chart data ────────────────────────────────────────────────────────────────

const DAILY_DATA = [
  { date: "May 14", users: 92,  revenue: 0 }, { date: "May 16", users: 78,  revenue: 0 },
  { date: "May 18", users: 80,  revenue: 0 }, { date: "May 19", users: 61,  revenue: 0 },
  { date: "May 20", users: 100, revenue: 0 }, { date: "May 21", users: 93,  revenue: 0 },
  { date: "May 22", users: 90,  revenue: 0 }, { date: "May 23", users: 84,  revenue: 0 },
  { date: "May 24", users: 103, revenue: 0 }, { date: "May 25", users: 58,  revenue: 0 },
  { date: "May 26", users: 41,  revenue: 0 }, { date: "May 27", users: 90,  revenue: 0 },
  { date: "May 28", users: 107, revenue: 0 }, { date: "May 29", users: 96,  revenue: 0 },
  { date: "May 30", users: 81,  revenue: 0 }, { date: "May 31", users: 80,  revenue: 0 },
  { date: "Jun 1",  users: 74,  revenue: 0 }, { date: "Jun 2",  users: 49,  revenue: 0 },
  { date: "Jun 3",  users: 99,  revenue: 0 }, { date: "Jun 4",  users: 106, revenue: 0 },
  { date: "Jun 5",  users: 105, revenue: 0 }, { date: "Jun 6",  users: 95,  revenue: 0 },
  { date: "Jun 7",  users: 71,  revenue: 0 }, { date: "Jun 8",  users: 67,  revenue: 0 },
  { date: "Jun 9",  users: 45,  revenue: 0 }, { date: "Jun 10", users: 81,  revenue: 0 },
  { date: "Jun 11", users: 114, revenue: 0 }, { date: "Jun 12", users: 90,  revenue: 0 },
  { date: "Jun 13", users: 74,  revenue: 0 }, { date: "Jun 14", users: 62,  revenue: 0 },
];

const CHANNELS = [
  { name: "referral", users: 7, pct: 100 }, { name: "social", users: 5, pct: 71 },
  { name: "post", users: 3, pct: 43 },      { name: "click", users: 2, pct: 29 },
];
const PAGES = [
  { name: "/", users: "1.2k", pct: 100 },
  { name: "/pricing", users: 92, pct: 8 },
  { name: "/blog/best-ai-sdr-tools-for-d...", users: 71, pct: 6 },
  { name: "/blog/best-ecommerce-pers...", users: 45, pct: 4 },
];
const COUNTRIES = [
  { flag: "🇺🇸", name: "United States", users: 773, pct: 100 },
  { flag: "🇮🇳", name: "India",          users: 205, pct: 26  },
  { flag: "🇸🇬", name: "Singapore",      users: 116, pct: 15  },
  { flag: "🇨🇳", name: "China",          users: 48,  pct: 6   },
  { flag: "",    name: "The Netherlands", users: 29,  pct: 4   },
  { flag: "🇬🇧", name: "United Kingdom", users: 24,  pct: 3   },
  { flag: "🇨🇦", name: "Canada",         users: 21,  pct: 3   },
  { flag: "🇩🇪", name: "Germany",        users: 20,  pct: 3   },
];
const BROWSERS = [
  { icon: "chrome",  name: "Chrome",  users: "1.7k", pct: 100 },
  { icon: "safari",  name: "Safari",  users: 305,    pct: 18  },
  { icon: "edge",    name: "Edge",    users: 56,     pct: 3   },
  { icon: "firefox", name: "Firefox", users: 32,     pct: 2   },
  { icon: "unknown", name: "Unknown", users: 28,     pct: 2   },
];

const PAGE_VIEWS_DATA = [
  { date: "May 18", value: 140 }, { date: "May 20", value: 225 },
  { date: "May 22", value: 75  }, { date: "May 24", value: 230 },
  { date: "May 26", value: 300 }, { date: "May 28", value: 150 },
  { date: "May 30", value: 225 }, { date: "Jun 1",  value: 180 },
  { date: "Jun 3",  value: 225 }, { date: "Jun 5",  value: 75  },
  { date: "Jun 7",  value: 150 }, { date: "Jun 9",  value: 100 },
  { date: "Jun 11", value: 150 }, { date: "Jun 13", value: 60  },
];
const SESSIONS_DATA = [
  { date: "May 18", value: 55  }, { date: "May 20", value: 100 },
  { date: "May 22", value: 20  }, { date: "May 24", value: 165 },
  { date: "May 26", value: 220 }, { date: "May 28", value: 130 },
  { date: "May 30", value: 110 }, { date: "Jun 1",  value: 150 },
  { date: "Jun 3",  value: 140 }, { date: "Jun 5",  value: 100 },
  { date: "Jun 7",  value: 140 }, { date: "Jun 9",  value: 155 },
  { date: "Jun 11", value: 140 }, { date: "Jun 13", value: 20  },
];
const ACTIVE_USERS_DATA = [
  { date: "May 18", value: 10 }, { date: "May 20", value: 18 },
  { date: "May 22", value: 12 }, { date: "May 24", value: 25 },
  { date: "May 26", value: 40 }, { date: "May 28", value: 35 },
  { date: "May 30", value: 20 }, { date: "Jun 1",  value: 32 },
  { date: "Jun 3",  value: 25 }, { date: "Jun 5",  value: 20 },
  { date: "Jun 7",  value: 15 }, { date: "Jun 9",  value: 25 },
  { date: "Jun 11", value: 30 }, { date: "Jun 13", value: 8  },
];
const RETENTION_DATA = [
  { date: "May 18", value: 20 }, { date: "May 20", value: 30 },
  { date: "May 22", value: 22 }, { date: "May 24", value: 40 },
  { date: "May 26", value: 30 }, { date: "May 28", value: 35 },
  { date: "May 30", value: 25 }, { date: "Jun 1",  value: 30 },
  { date: "Jun 3",  value: 20 }, { date: "Jun 5",  value: 25 },
  { date: "Jun 7",  value: 40 }, { date: "Jun 9",  value: 15 },
  { date: "Jun 11", value: 20 }, { date: "Jun 13", value: 0  },
];

const USER_METRICS = [
  { label: "Total Users",     value: "3.79K", change: "-45.29% vs Apr 14 – May 14, 2026", icon: <Users size={14} /> },
  { label: "Active Users",    value: "1.87K", change: "-70% vs Apr 14 – May 14, 2026",    icon: <Activity size={14} /> },
  { label: "New Users",       value: "1.71K", change: "-71.53% vs Apr 14 – May 14, 2026", icon: <UserPlus size={14} /> },
  { label: "Returning Users", value: "158",   change: "-28.18% vs Apr 14 – May 14, 2026", icon: <HistoryIcon size={14} /> },
];

// ── Chart sub-components ──────────────────────────────────────────────────────

function InfoBadge() {
  return <Info size={12} className="text-stone-400 shrink-0" />;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color?: string; fill?: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: "var(--content-bg)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color ?? p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

function HBar({ name, pct, users, prefix }: { name: string; pct: number; users: number | string; prefix?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-2 w-40 shrink-0 min-w-0">
        {prefix}
        <span className="text-xs text-stone-600 dark:text-stone-400 truncate">{name}</span>
      </div>
      <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-2 min-w-0">
        <div className="h-2 rounded-full bg-blue-400" style={{ width: `${Math.max(pct, 0.5)}%` }} />
      </div>
      <div className="flex items-center gap-2 text-xs font-medium shrink-0 w-15 justify-end">
        <span className="text-teal-600 dark:text-teal-400">{typeof users === "number" ? users.toLocaleString() : users}</span>
        <span className="text-stone-400">$0</span>
      </div>
    </div>
  );
}

function BrowserIcon({ type }: { type: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    chrome:  { bg: "#4285F4", fg: "#fff", label: "C" },
    safari:  { bg: "#0D8AF5", fg: "#fff", label: "S" },
    edge:    { bg: "#0078D4", fg: "#fff", label: "E" },
    firefox: { bg: "#FF6611", fg: "#fff", label: "F" },
    unknown: { bg: "#6B7280", fg: "#fff", label: "?" },
  };
  const { bg, fg, label } = map[type] ?? map.unknown;
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}

function SubToggle({ options, active, onChange }: { options: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt.toLowerCase())}
          className={`text-xs font-medium transition-colors ${active === opt.toLowerCase() ? "text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function HBarCard({ title, sub, tabs, activeTab, onTab, sub2Active, onSub2, data }: {
  title: string; sub: string;
  tabs: string[]; activeTab: string; onTab: (v: string) => void;
  sub2Active: string; onSub2: (v: string) => void;
  data: { name: string; pct: number; users: number | string; prefix?: React.ReactNode }[];
}) {
  return (
    <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-0.5">
          {tabs.map((t) => (
            <button key={t} onClick={() => onTab(t.toLowerCase())}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activeTab === t.toLowerCase() ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}
            >{t}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors" style={{ border: "1px solid var(--border)" }}>
            Top 10 <ChevronDown size={10} />
          </button>
          <SubToggle options={["Users", "Revenue"]} active={sub2Active} onChange={onSub2} />
        </div>
      </div>
      <p className="text-base font-semibold text-stone-800 dark:text-stone-200">{title}</p>
      <p className="text-xs text-stone-400 mt-0.5 mb-3">{sub}</p>
      <div className="space-y-0.5">
        {data.map((d) => <HBar key={d.name} name={d.name} pct={d.pct} users={d.users} prefix={d.prefix} />)}
      </div>
    </div>
  );
}

function TrafficCharts() {
  const [channelTab, setChannelTab] = useState("channel");
  const [channelSub, setChannelSub] = useState("users");
  const [pageTab, setPageTab] = useState("page");
  const [pageSub, setPageSub] = useState("users");
  const [countryTab, setCountryTab] = useState("country");
  const [countrySub, setCountrySub] = useState("users");
  const [browserTab, setBrowserTab] = useState("browser");
  const [browserSub, setBrowserSub] = useState("users");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {USER_METRICS.map(({ label, value, change, icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
            <div className="flex items-center gap-1.5 mb-2 text-stone-500 dark:text-stone-400">
              {icon}
              <span className="text-xs font-medium">{label}</span>
              <InfoBadge />
            </div>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1.5">{value}</p>
            <p className="text-xs text-rose-500 flex items-center gap-1"><TrendingDown size={10} className="shrink-0" />{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HBarCard
          title="Traffic by Channel" sub="Where your website visitors are coming from"
          tabs={["Channel", "Referrer", "Campaign"]} activeTab={channelTab} onTab={setChannelTab}
          sub2Active={channelSub} onSub2={setChannelSub}
          data={CHANNELS}
        />
        <HBarCard
          title="Page Performance" sub="Most visited pages ranked by traffic and revenue"
          tabs={["Page", "Entry page"]} activeTab={pageTab} onTab={setPageTab}
          sub2Active={pageSub} onSub2={setPageSub}
          data={PAGES}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HBarCard
          title="Users by Country" sub="Geographic distribution of your website users"
          tabs={["Country", "Region", "City"]} activeTab={countryTab} onTab={setCountryTab}
          sub2Active={countrySub} onSub2={setCountrySub}
          data={COUNTRIES.map((c) => ({ ...c, prefix: c.flag ? <span className="text-sm leading-none shrink-0">{c.flag}</span> : <span className="w-3.5 shrink-0" /> }))}
        />
        <HBarCard
          title="Web Browsers" sub="Which browsers your visitors use to access your site"
          tabs={["Browser", "OS", "Device"]} activeTab={browserTab} onTab={setBrowserTab}
          sub2Active={browserSub} onSub2={setBrowserSub}
          data={BROWSERS.map((b) => ({ ...b, prefix: <BrowserIcon type={b.icon} /> }))}
        />
      </div>
    </div>
  );
}

function RevenueCharts() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
        <div className="flex items-start gap-2 mb-1">
          <InfoBadge />
          <div>
            <p className="text-base font-semibold text-stone-800 dark:text-stone-200">
              Traffic &amp; Revenue Overview{" "}
              <span className="text-xs font-normal text-stone-400">(May 15, 2026 – Jun 13, 2026)</span>
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Daily unique visitors (bars) and cumulative revenue (line) over the selected period</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={DAILY_DATA} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
            <YAxis yAxisId="u" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} ticks={[0, 30, 60, 90, 120]} />
            <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} ticks={[0, 1, 2, 3, 4]} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
            <Bar yAxisId="u" dataKey="users" fill="#00AAFF" radius={[2, 2, 0, 0]} name="Users" maxBarSize={18}>
              <LabelList dataKey="users" position="top" style={{ fontSize: 9, fill: "#94a3b8" }} />
            </Bar>
            <Line yAxisId="r" dataKey="revenue" stroke="#59B277" strokeWidth={1.5} dot={{ fill: "#59B277", r: 2.5, strokeWidth: 0 }} name="Revenue ($)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { title: "Purchase Events", sub: "Number of completed purchase transactions", big: "0", bigSub: "total events", color: "#00AAFF" },
          { title: "Total Purchase Revenue", sub: "Total revenue from completed purchases", big: "$0", bigSub: "total revenue", color: "#59B277" },
        ].map(({ title, sub, big, bigSub, color }) => (
          <div key={title} className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
            <p className="text-base font-semibold text-stone-800 dark:text-stone-200">
              {title}{" "}
              <span className="text-xs font-normal text-stone-400">(May 15, 2026 – Jun 13, 2026)</span>
            </p>
            <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
            <p className="mt-3 mb-0.5">
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">{big}</span>{" "}
              <span className="text-xs text-stone-400">{bigSub}</span>
            </p>
            <p className="text-xs text-emerald-500 mb-3">+0.0% vs Apr 14, 2026 – May 14, 2026</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={DAILY_DATA.map((d) => ({ date: d.date, value: 0 }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} ticks={[0, 1, 2, 3, 4]} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="linear" dataKey="value" stroke={color} strokeWidth={1.5} fill="none" dot={{ fill: color, r: 2.5, strokeWidth: 0 }} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} name="Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngChart({ title, sub, big, bigSub, change, data, color }: {
  title: string; sub: string; big: string; bigSub: string;
  change: string; data: { date: string; value: number }[]; color: string;
}) {
  const isPositive = change.startsWith("+");
  return (
    <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
      <p className="text-base font-semibold text-stone-800 dark:text-stone-200">
        {title}{" "}
        <span className="text-xs font-normal text-stone-400">(May 15, 2026 – Jun 13, 2026)</span>
      </p>
      <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
      <p className="mt-3 mb-0.5">
        <span className="text-xl font-bold text-stone-900 dark:text-stone-100">{big}</span>{" "}
        <span className="text-xs text-stone-400">{bigSub}</span>
      </p>
      <p className={`text-xs mb-3 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>{change} vs Apr 14, 2026 – May 14, 2026</p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="none" dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} name="Value" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EngagementCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <EngChart title="Page Views"    sub="Total number of page views in the selected period"         big="4.06K"  bigSub="total page views"       change="+239.1%"  data={PAGE_VIEWS_DATA}    color="#00AAFF" />
      <EngChart title="Sessions"      sub="Total number of user sessions in the selected period"      big="2.79K"  bigSub="total sessions"          change="+250.4%"  data={SESSIONS_DATA}      color="#C37EE5" />
      <EngChart title="Active Users"  sub="Total number of active users in the selected period"       big="1.87K"  bigSub="total active users"      change="-70.0%"   data={ACTIVE_USERS_DATA}  color="#59B277" />
      <EngChart title="User Retention" sub="Average user retention rate in the selected period"       big="11.4%"  bigSub="average retention rate"  change="+406.2%"  data={RETENTION_DATA}     color="#FFC44D" />
    </div>
  );
}

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

      {activeTab === "traffic" || activeTab === "revenue" || activeTab === "engagement" ? (
        <div key={activeTab} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 animate-fade-up">
          {activeTab === "traffic"    && <TrafficCharts />}
          {activeTab === "revenue"    && <RevenueCharts />}
          {activeTab === "engagement" && <EngagementCharts />}
        </div>
      ) : (
        <div key={activeTab} className="flex-1 min-h-0 px-4 py-4 flex flex-col animate-fade-up">
          <DashboardTable
            columns={COLUMNS}
            rows={tableRows}
            searchPlaceholder="Search boards..."
            filterConfig={BOARDS_FILTER}
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Create board</span>
              </button>
            }
          />
        </div>
      )}
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
