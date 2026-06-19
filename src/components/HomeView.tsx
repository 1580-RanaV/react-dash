

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Greeting from "./Greeting";
import HeroVideo from "./HeroVideo";
import RecentDesigns from "./RecentDesigns";
import {
  ComposedChart, Bar, Line, AreaChart, Area, LabelList,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";
import {
  Globe, LayoutGrid, Activity, ChevronDown, Info,
  TrendingDown, UserPlus, ShoppingCart, Users, HistoryIcon,
  Send, MailOpen, MousePointerClick, ChevronRight,
} from "lucide-react";
import DateRangePicker from "./DateRangePicker";

// ── static data ───────────────────────────────────────────────────────────────

const DAILY_DATA = [
  { date: "May 14", users: 92, revenue: 0 },
  { date: "May 16", users: 78, revenue: 0 },
  { date: "May 18", users: 80, revenue: 0 },
  { date: "May 19", users: 61, revenue: 0 },
  { date: "May 20", users: 100, revenue: 0 },
  { date: "May 21", users: 93, revenue: 0 },
  { date: "May 22", users: 90, revenue: 0 },
  { date: "May 23", users: 84, revenue: 0 },
  { date: "May 24", users: 103, revenue: 0 },
  { date: "May 25", users: 58, revenue: 0 },
  { date: "May 26", users: 41, revenue: 0 },
  { date: "May 27", users: 90, revenue: 0 },
  { date: "May 28", users: 107, revenue: 0 },
  { date: "May 29", users: 96, revenue: 0 },
  { date: "May 30", users: 81, revenue: 0 },
  { date: "May 31", users: 80, revenue: 0 },
  { date: "Jun 1", users: 74, revenue: 0 },
  { date: "Jun 2", users: 49, revenue: 0 },
  { date: "Jun 3", users: 99, revenue: 0 },
  { date: "Jun 4", users: 106, revenue: 0 },
  { date: "Jun 5", users: 105, revenue: 0 },
  { date: "Jun 6", users: 95, revenue: 0 },
  { date: "Jun 7", users: 71, revenue: 0 },
  { date: "Jun 8", users: 67, revenue: 0 },
  { date: "Jun 9", users: 45, revenue: 0 },
  { date: "Jun 10", users: 81, revenue: 0 },
  { date: "Jun 11", users: 114, revenue: 0 },
  { date: "Jun 12", users: 90, revenue: 0 },
  { date: "Jun 13", users: 74, revenue: 0 },
  { date: "Jun 14", users: 62, revenue: 0 },
];

const CHANNELS = [
  { name: "referral", users: 7, pct: 100 },
  { name: "social", users: 5, pct: 71 },
  { name: "post", users: 3, pct: 43 },
  { name: "click", users: 2, pct: 29 },
];

const PAGES = [
  { name: "/", users: "1.2k", pct: 100 },
  { name: "/pricing", users: 92, pct: 8 },
  { name: "/blog/best-ai-sdr-tools-for-d...", users: 71, pct: 6 },
  { name: "/blog/best-ecommerce-pers...", users: 45, pct: 4 },
];

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States", users: 773, pct: 100 },
  { flag: "🇮🇳", name: "India", users: 205, pct: 26 },
  { flag: "🇸🇬", name: "Singapore", users: 116, pct: 15 },
  { flag: "🇨🇳", name: "China", users: 48, pct: 6 },
  { flag: "", name: "The Netherlands", users: 29, pct: 4 },
  { flag: "🇭🇰", name: "Hong Kong", users: 28, pct: 4 },
  { flag: "🇬🇧", name: "United Kingdom", users: 24, pct: 3 },
  { flag: "🇨🇦", name: "Canada", users: 21, pct: 3 },
  { flag: "🇩🇪", name: "Germany", users: 20, pct: 3 },
  { flag: "🇺🇦", name: "Ukraine", users: 14, pct: 2 },
];

const BROWSERS = [
  { icon: "chrome", name: "Chrome", users: "1.7k", pct: 100 },
  { icon: "safari", name: "Safari", users: 305, pct: 18 },
  { icon: "edge", name: "Edge", users: 56, pct: 3 },
  { icon: "firefox", name: "Firefox", users: 32, pct: 2 },
  { icon: "unknown", name: "Unknown", users: 28, pct: 2 },
  { icon: "opera", name: "Opera", users: 5, pct: 0.3 },
];

const PAGE_VIEWS_DATA = [
  { date: "May 18", value: 140 }, { date: "May 20", value: 225 },
  { date: "May 22", value: 75 }, { date: "May 24", value: 230 },
  { date: "May 26", value: 300 }, { date: "May 28", value: 150 },
  { date: "May 30", value: 225 }, { date: "Jun 1", value: 180 },
  { date: "Jun 3", value: 225 }, { date: "Jun 5", value: 75 },
  { date: "Jun 7", value: 150 }, { date: "Jun 9", value: 100 },
  { date: "Jun 11", value: 150 }, { date: "Jun 13", value: 60 },
];

const SESSIONS_DATA = [
  { date: "May 18", value: 55 }, { date: "May 20", value: 100 },
  { date: "May 22", value: 20 }, { date: "May 24", value: 165 },
  { date: "May 26", value: 220 }, { date: "May 28", value: 130 },
  { date: "May 30", value: 110 }, { date: "Jun 1", value: 150 },
  { date: "Jun 3", value: 140 }, { date: "Jun 5", value: 100 },
  { date: "Jun 7", value: 140 }, { date: "Jun 9", value: 155 },
  { date: "Jun 11", value: 140 }, { date: "Jun 13", value: 20 },
];

const ACTIVE_USERS_DATA = [
  { date: "May 18", value: 10 }, { date: "May 20", value: 18 },
  { date: "May 22", value: 12 }, { date: "May 24", value: 25 },
  { date: "May 26", value: 40 }, { date: "May 28", value: 35 },
  { date: "May 30", value: 20 }, { date: "Jun 1", value: 32 },
  { date: "Jun 3", value: 25 }, { date: "Jun 5", value: 20 },
  { date: "Jun 7", value: 15 }, { date: "Jun 9", value: 25 },
  { date: "Jun 11", value: 30 }, { date: "Jun 13", value: 8 },
];

const RETENTION_DATA = [
  { date: "May 18", value: 20 }, { date: "May 20", value: 30 },
  { date: "May 22", value: 22 }, { date: "May 24", value: 40 },
  { date: "May 26", value: 30 }, { date: "May 28", value: 35 },
  { date: "May 30", value: 25 }, { date: "Jun 1", value: 30 },
  { date: "Jun 3", value: 20 }, { date: "Jun 5", value: 25 },
  { date: "Jun 7", value: 40 }, { date: "Jun 9", value: 15 },
  { date: "Jun 11", value: 20 }, { date: "Jun 13", value: 0 },
];

// ── constants ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "traffic", label: "Traffic", icon: <Globe size={15} /> },
  { key: "revenue", label: "Revenue", icon: <LayoutGrid size={15} /> },
  { key: "engagement", label: "Engagement", icon: <Activity size={15} /> },
];


const USER_METRICS = [
  { label: "Total Users", value: "3.79K", change: "-45.29% vs Apr 14, 2026 – May 14, 2026", icon: <Users size={14} /> },
  { label: "Active Users", value: "1.87K", change: "-70% vs Apr 14, 2026 – May 14, 2026", icon: <Activity size={14} /> },
  { label: "New Users", value: "1.71K", change: "-71.53% vs Apr 14, 2026 – May 14, 2026", icon: <UserPlus size={14} /> },
  { label: "Returning Users", value: "158", change: "-28.18% vs Apr 14, 2026 – May 14, 2026", icon: <HistoryIcon size={14} /> },
];

// ── shared sub-components ─────────────────────────────────────────────────────

function InfoBadge() {
  return <Info size={12} className="text-stone-400 shrink-0" />;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", color: "var(--foreground)" }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Traffic tab ───────────────────────────────────────────────────────────────

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
    opera:   { bg: "#FF1B2D", fg: "#fff", label: "O" },
  };
  const { bg, fg, label } = map[type] ?? map.unknown;
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

function TrafficView() {
  const [channelSub, setChannelSub] = useState<"users" | "revenue">("users");
  const [pageSub, setPageSub] = useState<"users" | "revenue">("users");
  const [channelTab, setChannelTab] = useState("channel");
  const [pageTab, setPageTab] = useState("page");
  const [countrySub, setCountrySub] = useState<"users" | "revenue">("users");
  const [countryTab, setCountryTab] = useState("country");
  const [browserSub, setBrowserSub] = useState<"users" | "revenue">("users");
  const [browserTab, setBrowserTab] = useState("browser");

  return (
    <div className="space-y-3">
      {/* User metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {USER_METRICS.map(({ label, value, change, icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
            <div className="flex items-center gap-1.5 mb-2 text-stone-500 dark:text-stone-400">
              {icon}
              <span className="text-xs font-medium">{label}</span>
              <InfoBadge />
            </div>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-1.5">{value}</p>
            <p className="text-xs text-rose-500 flex items-center gap-1">
              <TrendingDown size={10} className="shrink-0" />
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* Purchase summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Yesterday", icon: <ShoppingCart size={13} />, comp: "vs day before yesterday", special: false },
          { label: "Total Period", icon: <ShoppingCart size={13} />, comp: "vs Apr 14, 2026 – May 14, 2026", special: false },
          { label: "Intempt Attributed", icon: null, comp: "vs Apr 14, 2026 – May 14, 2026", special: true },
        ].map(({ label, icon, comp, special }) => (
          <div key={label} className="rounded-xl p-4" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              {special
                ? <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#0080FF,#00AAFF)" }} />
                : <span className="text-stone-400">{icon}</span>
              }
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{label}</span>
              <InfoBadge />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Purchases</p>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">0</p>
                <p className="text-xs text-stone-400 mt-0.5">0%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Revenue</p>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">$0</p>
                <p className="text-xs text-stone-400 mt-0.5">0%</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 mt-3">{comp}</p>
          </div>
        ))}
      </div>

      {/* Bottom bar charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Traffic by Channel */}
        <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
              {["Channel", "Referrer", "Campaign"].map((t) => (
                <button
                  key={t}
                  onClick={() => setChannelTab(t.toLowerCase())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    channelTab === t.toLowerCase()
                      ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                Top 10 <ChevronDown size={10} />
              </button>
              {(["Users", "Revenue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setChannelSub(s.toLowerCase() as "users" | "revenue")}
                  className={`text-xs font-medium transition-colors ${
                    channelSub === s.toLowerCase() ? "text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="text-base font-semibold text-stone-800 dark:text-stone-200">Traffic by Channel</p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">Where your website visitors are coming from</p>
          <div className="space-y-0.5">
            {CHANNELS.map((c) => <HBar key={c.name} name={c.name} pct={c.pct} users={c.users} />)}
          </div>
        </div>

        {/* Page Performance */}
        <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
              {["Page", "Entry page"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPageTab(t.toLowerCase())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    pageTab === t.toLowerCase()
                      ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                Top 10 <ChevronDown size={10} />
              </button>
              {(["Users", "Revenue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSub(s.toLowerCase() as "users" | "revenue")}
                  className={`text-xs font-medium transition-colors ${
                    pageSub === s.toLowerCase() ? "text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="text-base font-semibold text-stone-800 dark:text-stone-200">Page Performance</p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">Most visited pages ranked by traffic and revenue</p>
          <div className="space-y-0.5">
            {PAGES.map((p) => <HBar key={p.name} name={p.name} pct={p.pct} users={p.users} />)}
          </div>
        </div>
      </div>

      {/* Country + Browser charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Users by Country */}
        <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
              {["Country", "Region", "City"].map((t) => (
                <button
                  key={t}
                  onClick={() => setCountryTab(t.toLowerCase())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    countryTab === t.toLowerCase()
                      ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                Top 10 <ChevronDown size={10} />
              </button>
              {(["Users", "Revenue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setCountrySub(s.toLowerCase() as "users" | "revenue")}
                  className={`text-xs font-medium transition-colors ${
                    countrySub === s.toLowerCase() ? "text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="text-base font-semibold text-stone-800 dark:text-stone-200">Users by Country</p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">Geographic distribution of your website users</p>
          <div className="space-y-0.5">
            {COUNTRIES.map((c) => (
              <HBar
                key={c.name}
                name={c.name}
                pct={c.pct}
                users={c.users}
                prefix={c.flag ? <span className="text-sm leading-none shrink-0">{c.flag}</span> : <span className="w-3.75 shrink-0" />}
              />
            ))}
          </div>
        </div>

        {/* Web Browsers */}
        <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
              {["Browser", "OS", "Device"].map((t) => (
                <button
                  key={t}
                  onClick={() => setBrowserTab(t.toLowerCase())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    browserTab === t.toLowerCase()
                      ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
                style={{ border: "1px solid var(--border)" }}
              >
                Top 10 <ChevronDown size={10} />
              </button>
              {(["Users", "Revenue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setBrowserSub(s.toLowerCase() as "users" | "revenue")}
                  className={`text-xs font-medium transition-colors ${
                    browserSub === s.toLowerCase() ? "text-stone-900 dark:text-stone-100" : "text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <p className="text-base font-semibold text-stone-800 dark:text-stone-200">Web Browsers</p>
          <p className="text-xs text-stone-400 mt-0.5 mb-3">Which browsers your visitors use to access your site</p>
          <div className="space-y-0.5">
            {BROWSERS.map((b) => (
              <HBar
                key={b.name}
                name={b.name}
                pct={b.pct}
                users={b.users}
                prefix={<BrowserIcon type={b.icon} />}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Revenue tab ───────────────────────────────────────────────────────────────

function RevenueView() {
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
            <p className="text-xs text-stone-400 mt-0.5">
              Daily unique visitors (bars) and cumulative revenue (line) over the selected period
            </p>
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
          {
            title: "Purchase Events",
            sub: "Number of completed purchase transactions",
            big: "0",
            bigSub: "total events",
            change: "+0.0%",
            data: DAILY_DATA.map((d) => ({ date: d.date, value: 0 })),
            color: "#00AAFF",
            yTicks: [0, 1, 2, 3, 4],
          },
          {
            title: "Total Purchase Revenue",
            sub: "Total revenue from completed purchases",
            big: "$0",
            bigSub: "total revenue",
            change: "+0.0%",
            data: DAILY_DATA.map((d) => ({ date: d.date, value: 0 })),
            color: "#59B277",
            yTicks: [0, 1, 2, 3, 4],
          },
        ].map(({ title, sub, big, bigSub, change, data, color, yTicks }) => (
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
            <p className="text-xs text-emerald-500 mb-3">{change} vs Apr 14, 2026 – May 14, 2026</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} ticks={yTicks} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="linear"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={1.5}
                  fill="none"
                  dot={{ fill: color, r: 2.5, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  name="Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Engagement tab ────────────────────────────────────────────────────────────

function EngChart({
  title, sub, big, bigSub, change, data, color,
}: {
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
      <p className={`text-xs mb-3 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
        {change} vs Apr 14, 2026 – May 14, 2026
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            name="Value"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EngagementView() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <EngChart title="Page Views" sub="Total number of page views in the selected period" big="4.06K" bigSub="total page views" change="+239.1%" data={PAGE_VIEWS_DATA} color="#00AAFF" />
        <EngChart title="Sessions" sub="Total number of user sessions in the selected period" big="2.79K" bigSub="total sessions" change="+250.4%" data={SESSIONS_DATA} color="#C37EE5" />
        <EngChart title="Active Users" sub="Total number of active users in the selected period" big="1.87K" bigSub="total active users" change="-70.0%" data={ACTIVE_USERS_DATA} color="#59B277" />
        <EngChart title="User Retention" sub="Average user retention rate in the selected period" big="11.4%" bigSub="average retention rate" change="+406.2%" data={RETENTION_DATA} color="#FFC44D" />
      </div>
    </div>
  );
}

// ── Metric card — generic, reusable ───────────────────────────────────────────
//
// Pass any Lucide icon component; the card renders it at two sizes itself.
// Drop it anywhere — it carries its own layout and never leaks outside concerns.

import { type LucideIcon } from "lucide-react";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
};

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", minHeight: 140 }}
    >
      {/* Top row: icon badge + chevron */}
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 dark:bg-white/8 text-blue-500">
          <Icon size={16} />
        </span>
        <ChevronRight size={14} className="text-stone-300 dark:text-stone-600 mt-0.5" />
      </div>

      {/* Value + label */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-stone-800 dark:text-stone-100 leading-none mb-1.5">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
      </div>

      {/* Watermark — same icon rendered large, faint */}
      <span className="pointer-events-none absolute -bottom-2 -right-2 text-blue-500 opacity-[0.07] dark:opacity-[0.1]">
        <Icon size={72} />
      </span>
    </div>
  );
}

// ── Sales tab ─────────────────────────────────────────────────────────────────

type SalesMetricDef = {
  id: string;
  label: string;
  icon: LucideIcon;
  value: number;
};

// TODO: replace with real API data
const SALES_METRICS: SalesMetricDef[] = [
  { id: "emails-sent",   label: "Emails sent",    icon: Send,               value: 1284 },
  { id: "emails-opened", label: "Emails opened",  icon: MailOpen,           value:  437 },
  { id: "links-clicked", label: "Links clicked",  icon: MousePointerClick,  value:   96 },
];

function SalesTab() {
  return (
    <div className="px-6 pt-6 animate-fade-up">
      <div className="max-w-2xl">
        <Greeting />
        <SalesSetupChecklist />
      </div>
      <div className="mt-6 -ml-4">
        <DateRangePicker />
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
        {SALES_METRICS.map((m) => (
          <MetricCard key={m.id} icon={m.icon} label={m.label} value={m.value} />
        ))}
      </div>
    </div>
  );
}

// ── Coming soon placeholder ────────────────────────────────────────────────────

function ComingSoon() {
  return (
    <div className="flex flex-1 items-center justify-center animate-fade-up">
      <div className="text-center">
        <p className="text-base font-semibold text-stone-700 dark:text-stone-200">Coming soon</p>
        <p className="mt-1.5 text-sm text-stone-400 dark:text-stone-500">This section is on the way.</p>
      </div>
    </div>
  );
}

// ── Shared setup checklist ────────────────────────────────────────────────────
//
// Step config (titles/descs/CTAs) is static.
// Completion state is local for demo; swap `initialCompleted` with a real API
// hook at the call-site and the component needs zero changes.

type SetupStepDef = {
  id: string;
  title: string;
  desc: string;
  action: string;
};

type SetupChecklistProps = {
  title: string;
  steps: SetupStepDef[];
  // Seed from API; component manages live state internally for demo interactivity.
  initialCompleted?: Set<string>;
};

function SetupChecklist({ title, steps, initialCompleted = new Set() }: SetupChecklistProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompleted));
  // "fading" tracks steps mid-animation so we can swap icon before opacity settles
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  // card close animation
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

  function handleAction(id: string) {
    if (completedIds.has(id) || fadingIds.has(id)) return;

    // Start fade on this step
    setFadingIds((prev) => new Set([...prev, id]));

    // After row fades out, mark it done and clear fading flag
    setTimeout(() => {
      setFadingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setCompletedIds((prev) => {
        const next = new Set([...prev, id]);
        // All done → collapse the card after a short celebration pause
        if (next.size === steps.length) {
          setTimeout(() => setClosing(true), 900);
        }
        return next;
      });
    }, 420);
  }

  if (closed) return null;

  const completedCount = completedIds.size;
  const total = steps.length;
  const pct = Math.round((completedCount / total) * 100);

  return (
    <div
      style={{
        maxHeight: closing ? 0 : 800,
        opacity: closing ? 0 : 1,
        marginTop: closing ? 0 : undefined,
        overflow: "hidden",
        transition: "max-height 0.45s cubic-bezier(0.4,0,0.8,0.6), opacity 0.32s ease, margin-top 0.45s ease",
      }}
      onTransitionEnd={() => { if (closing) setClosed(true); }}
    >
      <div className="mt-6 mb-2 rounded-xl border border-stone-200 dark:border-(--border) overflow-hidden" style={{ background: "var(--content-bg)" }}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
            <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
              {completedCount} of {total} completed
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-(--muted) overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Steps */}
        <div className="divide-y divide-stone-100 dark:divide-stone-700/40">
          {steps.map((step, i) => {
            const done = completedIds.has(step.id);
            const fading = fadingIds.has(step.id);
            return (
              <div
                key={step.id}
                style={{ opacity: done || fading ? 0.4 : 1, transition: "opacity 0.4s ease" }}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                {/* Circle indicator */}
                {done ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-stone-200 dark:border-(--border)">
                    <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 leading-none">{i + 1}</span>
                  </span>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-none mb-0.5 text-stone-700 dark:text-stone-200">{step.title}</p>
                  {step.desc && <p className="text-xs text-stone-400 dark:text-stone-500 leading-snug">{step.desc}</p>}
                </div>

                {/* Action — hidden once done or fading */}
                {!done && !fading && (
                  <button
                    onClick={() => handleAction(step.id)}
                    className="shrink-0 h-8 px-3.5 rounded-lg border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
                  >
                    {step.action}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Brand checklist (design tab) ──────────────────────────────────────────────

const BRAND_STEPS: SetupStepDef[] = [
  { id: "connect-website",  title: "Connect your website",    desc: "Crawl brand colors, logo, and fonts automatically", action: "Connect" },
  { id: "design-system",    title: "Choose a design system",  desc: "Lock tokens for colors, type, radius, elevation",   action: "Open"    },
  { id: "define-avatars",   title: "Define avatars",          desc: "Models, poses, and wardrobe for visuals",           action: "Open"    },
  { id: "setup-scenes",     title: "Set up scenes",           desc: "Lighting, camera, surface and mood",                action: "Open"    },
];

// TODO: replace with real API call — e.g. useQuery("/api/brand/setup-progress")
function useBrandSetupProgress(): Set<string> { return new Set(["connect-website"]); }

function BrandSetupChecklist() {
  return (
    <SetupChecklist
      title="Finish brand setup to get the best from Blu"
      steps={BRAND_STEPS}
      initialCompleted={useBrandSetupProgress()}
    />
  );
}

// ── Sales checklist (sales tab) ───────────────────────────────────────────────

const SALES_SETUP_STEPS: SetupStepDef[] = [
  { id: "create-account",    title: "Create an account",    desc: "", action: "Open"    },
  { id: "connect-email",     title: "Connect your email",   desc: "", action: "Connect" },
  { id: "connect-calendar",  title: "Connect your calendar",desc: "", action: "Connect" },
];

// TODO: replace with real API call — e.g. useQuery("/api/sales/setup-progress")
function useSalesSetupProgress(): Set<string> {
  return new Set(["create-account"]);
}

function SalesSetupChecklist() {
  return (
    <SetupChecklist
      title="Complete your setup to unlock full potential"
      steps={SALES_SETUP_STEPS}
      initialCompleted={useSalesSetupProgress()}
    />
  );
}

// ── main export ───────────────────────────────────────────────────────────────

const HOME_TABS = [
  { key: "design",    label: "Design" },
  { key: "marketing", label: "Marketing" },
  { key: "sales",     label: "Sales" },
  { key: "analytics", label: "Analytics" },
];

export default function HomeView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = HOME_TABS.some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "design";

  function setTab(key: string) {
    navigate(`/home?tab=${key}`, { replace: true });
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        {HOME_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 h-9 rounded-lg text-sm font-medium transition-colors duration-100 ${
              tab === t.key
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "design" && (
        <div key="design" className="px-6 pt-6 animate-fade-up">
          <div className="max-w-2xl">
            <Greeting />
            <BrandSetupChecklist />
          </div>
          <HeroVideo />
          <div className="max-w-2xl">
            <RecentDesigns />
          </div>
        </div>
      )}
      {tab === "sales"     && <SalesTab key="sales" />}
      {tab === "marketing" && <ComingSoon key="marketing" />}
      {tab === "analytics" && <ComingSoon key="analytics" />}
    </div>
  );
}
