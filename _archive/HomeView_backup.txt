

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";

import Greeting from "./Greeting";
import ViewTabs from "./ViewTabs";
import HeroVideo from "./HeroVideo";
import RecentDesigns from "./RecentDesigns";
import RevenueMetricCard from "./MetricCard";
import {
  ComposedChart, Bar, Line, AreaChart, Area, LabelList,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
} from "recharts";
import {
  Globe, LayoutGrid, Activity, ChevronDown, Info,
  TrendingDown, TrendingUp, UserPlus, ShoppingCart, Users, HistoryIcon,
  Send, MailOpen, MousePointerClick, ChevronRight,
  DollarSign, Zap, Layers, Briefcase, Calendar, Palette, BarChart3, Target,
  AlertTriangle, AlertCircle, MessageSquare, Bell, Smartphone, Bot,
  ArrowDown, Check, Wand2, FileImage, Route,
  Clapperboard, PenTool, Shuffle, Package, Handshake, CalendarClock,
  Play, X, ClipboardList, Settings, Video,
} from "lucide-react";

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

// ── Design dashboard data ────────────────────────────────────────────────────

const DESIGN_GEN_DATA = [
  { date: "Jun 13", images: 8,  videos: 2 },
  { date: "Jun 14", images: 12, videos: 3 },
  { date: "Jun 15", images: 5,  videos: 1 },
  { date: "Jun 16", images: 14, videos: 4 },
  { date: "Jun 17", images: 10, videos: 2 },
  { date: "Jun 18", images: 7,  videos: 2 },
  { date: "Jun 19", images: 18, videos: 5 },
  { date: "Jun 20", images: 15, videos: 3 },
  { date: "Jun 21", images: 9,  videos: 2 },
  { date: "Jun 22", images: 20, videos: 6 },
  { date: "Jun 23", images: 13, videos: 3 },
  { date: "Jun 24", images: 11, videos: 2 },
  { date: "Jun 25", images: 17, videos: 4 },
  { date: "Jun 26", images: 8,  videos: 2 },
];
const DESIGN_ASSET_TYPES = [
  { label: "Product Packshots", count: 48, pct: 100 },
  { label: "Email Banners",     count: 31, pct:  65 },
  { label: "Avatar Portraits",  count: 22, pct:  46 },
  { label: "Scene Renders",     count: 17, pct:  35 },
  { label: "Social Ads",        count:  9, pct:  19 },
];
const DESIGN_TOP_RECIPES = [
  { name: "White-bg Packshot",   avatar: "Avatar A", uses: 48 },
  { name: "Email Hero Banner",   avatar: "Avatar B", uses: 31 },
  { name: "Spokesperson Studio", avatar: "Avatar C", uses: 22 },
  { name: "Lifestyle Scene",     avatar: "Avatar A", uses: 17 },
  { name: "Social Square",       avatar: "Avatar D", uses:  9 },
];
const DESIGN_BRAND_ITEMS = [
  { label: "Brand colors",    ok: true  },
  { label: "Primary font",    ok: true  },
  { label: "Logo (light bg)", ok: true  },
  { label: "Logo (dark bg)",  ok: false },
  { label: "Design system",   ok: true  },
];

// ── Marketing dashboard data ─────────────────────────────────────────────────

const SENDS_CHART_DATA = [
  { date: "Jun 13", sends: 820,  opens: 349, clicks: 64  },
  { date: "Jun 14", sends: 940,  opens: 400, clicks: 73  },
  { date: "Jun 15", sends: 760,  opens: 323, clicks: 59  },
  { date: "Jun 16", sends: 1100, opens: 469, clicks: 86  },
  { date: "Jun 17", sends: 980,  opens: 417, clicks: 76  },
  { date: "Jun 18", sends: 720,  opens: 306, clicks: 56  },
  { date: "Jun 19", sends: 1050, opens: 447, clicks: 82  },
  { date: "Jun 20", sends: 930,  opens: 396, clicks: 73  },
  { date: "Jun 21", sends: 870,  opens: 371, clicks: 68  },
  { date: "Jun 22", sends: 1200, opens: 511, clicks: 94  },
  { date: "Jun 23", sends: 1050, opens: 447, clicks: 82  },
  { date: "Jun 24", sends: 890,  opens: 379, clicks: 69  },
  { date: "Jun 25", sends: 980,  opens: 417, clicks: 76  },
  { date: "Jun 26", sends: 1100, opens: 469, clicks: 86  },
  { date: "Jun 27", sends: 950,  opens: 404, clicks: 74  },
  { date: "Jun 28", sends: 820,  opens: 349, clicks: 64  },
  { date: "Jun 29", sends: 780,  opens: 332, clicks: 61  },
  { date: "Jun 30", sends: 1150, opens: 490, clicks: 90  },
  { date: "Jul 1",  sends: 1020, opens: 434, clicks: 80  },
  { date: "Jul 2",  sends: 870,  opens: 371, clicks: 68  },
  { date: "Jul 3",  sends: 750,  opens: 319, clicks: 59  },
  { date: "Jul 4",  sends: 1080, opens: 460, clicks: 84  },
  { date: "Jul 5",  sends: 960,  opens: 409, clicks: 75  },
  { date: "Jul 6",  sends: 840,  opens: 358, clicks: 66  },
  { date: "Jul 7",  sends: 1150, opens: 490, clicks: 90  },
  { date: "Jul 8",  sends: 1020, opens: 434, clicks: 80  },
];
const ENGAGEMENT_FUNNEL = [
  { stage: "Sent",      value: 24800 },
  { stage: "Delivered", value: 24106 },
  { stage: "Opened",    value: 10269 },
  { stage: "Clicked",   value:  1879 },
  { stage: "Converted", value:   453 },
];
const CHANNEL_MIX = [
  { channel: "Email",  icon: "email",  count: 18400, pct: 74, color: "#0080FF" },
  { channel: "SMS",    icon: "sms",    count:  3800, pct: 15, color: "#C37EE5" },
  { channel: "Push",   icon: "push",   count:  1700, pct:  7, color: "#59B277" },
  { channel: "In-app", icon: "inapp",  count:   900, pct:  4, color: "#FFC44D" },
];
const ACTIVE_JOURNEYS = [
  { name: "Welcome series",       sends: 1240, rate: 12.4, status: "active"  },
  { name: "Cart abandonment",     sends:  842, rate: 18.1, status: "active"  },
  { name: "Re-engagement Q2",     sends:    0, rate:  0,   status: "paused"  },
  { name: "Trial expiry nudge",   sends:  312, rate:  9.6, status: "active"  },
  { name: "VIP loyalty path",     sends:  540, rate: 22.8, status: "active"  },
];
const LIVE_EXPERIENCES = [
  { name: "Hero CTA color",    variants: 3, lift: 4.2, status: "winning" },
  { name: "Pricing layout",    variants: 2, lift: 1.1, status: "running" },
  { name: "Onboarding tips",   variants: 2, lift: 8.6, status: "winning" },
];
const TOP_SEGMENTS = [
  { name: "High-intent visitors",   members: "4.2k", rate: 24.1 },
  { name: "Active trial users",     members: "1.1k", rate: 38.7 },
  { name: "Newsletter subscribers", members: "8.1k", rate:  6.2 },
  { name: "Churned (90-day)",       members: "2.4k", rate:  3.1 },
];
const ANOMALIES = [
  { metric: "Email bounce rate",  status: "critical", expected: "0.9% – 1.6%",    actual: "4.8%",  change: "+220%", ago: "12m ago" },
  { metric: "Open rate",          status: "warning",  expected: "40% – 46%",      actual: "28.4%", change: "−33%",  ago: "48m ago" },
  { metric: "Unsubscribe rate",   status: "warning",  expected: "0.10% – 0.22%",  actual: "0.42%", change: "+110%", ago: "2h ago"  },
  { metric: "Send volume",        status: "critical", expected: "4.6k – 5.8k",    actual: "1.2k",  change: "−76%",  ago: "3h ago"  },
];

// ── Sales dashboard data ─────────────────────────────────────────────────────

const MEETINGS_DATA = [
  { week: "Jun 9", scheduled: 12, attended: 9  },
  { week: "Jun 16", scheduled: 15, attended: 13 },
  { week: "Jun 23", scheduled: 11, attended: 10 },
  { week: "Jun 30", scheduled: 14, attended: 12 },
  { week: "Jul 7",  scheduled: 9,  attended: 7  },
];

// ── Analytics dashboard data ─────────────────────────────────────────────────

const REVENUE_TREND = [
  { date: "Jan", value: 31200 }, { date: "Feb", value: 34800 },
  { date: "Mar", value: 36400 }, { date: "Apr", value: 38200 },
  { date: "May", value: 40100 }, { date: "Jun", value: 42800 },
];
const CONVERSION_FUNNEL = [
  { stage: "Visitors",      value: 18400 },
  { stage: "Signups",       value:  2940 },
  { stage: "Trial Started", value:   840 },
  { stage: "Paid",          value:   274 },
];
const ATTRIBUTION = [
  { channel: "Organic Search", value: 42400, pct: 100 },
  { channel: "Paid Social",    value: 31200, pct:  74 },
  { channel: "Email",          value: 28400, pct:  67 },
  { channel: "Referral",       value: 18200, pct:  43 },
  { channel: "Direct",         value: 14800, pct:  35 },
];
const RFM_ANALYTICS = [
  { label: "Champions",   count: 1240, color: "#26a269", pct: 100 },
  { label: "Loyal",       count: 2180, color: "#0080FF", pct:  88 },
  { label: "Potential",   count: 1640, color: "#C37EE5", pct:  66 },
  { label: "At-Risk",     count:  840, color: "#FFC44D", pct:  34 },
  { label: "Lost",        count:  430, color: "#ef4444", pct:  17 },
];
const SUBSCRIPTION_USAGE = [
  { label: "Events",      used: 1840000, total: 5000000, unit: "M" },
  { label: "MAUs",        used:    3840, total:   10000, unit: "k" },
  { label: "Seats",       used:       7, total:      20, unit: ""  },
  { label: "Boards",      used:      14, total:      25, unit: ""  },
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
      className="rounded-lg px-3.5 py-3 text-xs shadow-2xl"
      style={{
        background: "rgba(24,24,27,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#f8fafc",
        boxShadow: "0 18px 48px rgba(0,0,0,0.28), 0 4px 12px rgba(0,0,0,0.18)",
      }}
    >
      <p className="mb-2 text-sm font-semibold text-white">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="mt-1 flex items-center gap-2 font-medium" style={{ color: p.color ?? p.fill }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span>{p.name}: {p.value}</span>
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
import { type LucideIcon } from "lucide-react";

// ── Shared dashboard helpers ─────────────────────────────────────────────────

function ChangeBadge({ change }: { change: string }) {
  const pos = !change.startsWith("-");
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {change}
    </span>
  );
}

function MiniStat({ label, value, change, icon: Icon, accent = "#0080FF" }: {
  label: string; value: string; change?: string; icon: LucideIcon; accent?: string;
}) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8" style={{ color: accent }}>
          <Icon size={14} />
        </span>
        {change && <ChangeBadge change={change} />}
      </div>
      <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 leading-none">{value}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">{label}</p>
    </div>
  );
}

function SectionCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      {title && <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-4">{title}</p>}
      {children}
    </div>
  );
}

// ── Blu AI ───────────────────────────────────────────────────────────────────

type BluRec = {
  id: string;
  priority: "urgent" | "high" | "growth";
  title: string;
  body: string;
  impact: string;
  action: string;
  tag: string;
};

const DESIGN_RECS: BluRec[] = [
  {
    id: "dark-logo",
    priority: "high",
    tag: "Brand Kit",
    title: "Upload your dark background logo",
    body: "Your brand kit is 80% complete — the missing dark-bg logo means emails and dark-mode creatives render without proper branding. This affects an estimated 26% of your generated assets based on current usage patterns.",
    impact: "Consistent brand identity across all channels and dark themes",
    action: "Open Brand Kit",
  },
  {
    id: "social-ads",
    priority: "growth",
    tag: "Recipes",
    title: "Social Ads recipe is underutilized — only 9 runs",
    body: "Social Ads represent just 7% of your asset output (9 runs vs 48 for Packshots). Email banners are already well-covered at 31 runs. Expanding to social creatives is the fastest way to increase channel coverage with your existing brand kit.",
    impact: "Est. 3–5× increase in social content output",
    action: "Create Recipe",
  },
  {
    id: "credits",
    priority: "high",
    tag: "Credits",
    title: "Credits at 77% — schedule batches before your cycle ends",
    body: "You've used 3,840 of 5,000 credits (77%). At the current pace of ~14 images per day, you'll hit the 80% warning threshold in about 2 days. Scheduling remaining runs in off-peak hours avoids throttling and ensures smooth delivery.",
    impact: "Prevent credit overage and keep generation uninterrupted",
    action: "View Schedule",
  },
  {
    id: "avatars",
    priority: "growth",
    tag: "Avatars",
    title: "Add 2 more avatars to reduce visual fatigue",
    body: "With 6 avatars configured, Avatar A and B account for 79% of all recipe runs. Research shows visual fatigue sets in after 4–6 exposures to the same model. Adding B2B and retail-specific personas would diversify creative output significantly.",
    impact: "Higher engagement and CTR on personalized creative assets",
    action: "Add Avatar",
  },
];

const MARKETING_RECS: BluRec[] = [
  {
    id: "bounce-rate",
    priority: "urgent",
    tag: "Email Health",
    title: "Email bounce rate hit 4.8% — your sender reputation is at risk",
    body: "Detected 12 minutes ago: bounce rate is 4.8%, which is 3× above your expected range (0.9–1.6%). If sustained above 3% for 24 hours, major ESPs may throttle or block delivery. Most likely cause: stale list segment in the paused Re-engagement Q2 journey.",
    impact: "Protect deliverability and maintain your sender score",
    action: "Investigate Now",
  },
  {
    id: "send-volume",
    priority: "urgent",
    tag: "Send Volume",
    title: "Send volume is 76% below target — your pipeline is drying up",
    body: "Only 1,200 sends in the last measurement period vs an expected 4,600–5,800. The paused Re-engagement Q2 journey accounts for most of the gap — it was contributing ~2,100 sends when active. Revenue impact compounds every day this is unaddressed.",
    impact: "Restore expected send volume and re-engage your audience",
    action: "Resume Journey",
  },
  {
    id: "open-rate",
    priority: "high",
    tag: "Engagement",
    title: "Open rate dropped to 28.4% — time for a subject line refresh",
    body: "Open rate has declined 33% over 48 hours (from ~43% to 28.4%). Your last 3 campaigns followed similar \"[First name], don't miss...\" patterns. Subject fatigue is the likely culprit — A/B testing 2 new formats typically recovers 6–8 percentage points.",
    impact: "+6–8pp open rate improvement within 1–2 send cycles",
    action: "A/B Test Subjects",
  },
  {
    id: "ab-winner",
    priority: "high",
    tag: "A/B Testing",
    title: "Onboarding Tips A/B test has a clear winner — ship it now",
    body: "Your Onboarding Tips experience shows a +8.6% lift after 14+ days running — well past statistical significance. Every day the losing variant stays live, you're suppressing conversion by an estimated 3–4%. This is ready to ship today.",
    impact: "+8.6% conversion uplift on the onboarding flow",
    action: "Ship Variant",
  },
  {
    id: "sms-mix",
    priority: "growth",
    tag: "Channel Mix",
    title: "SMS is only 15% of sends — test it for cart abandonment",
    body: "Email dominates at 74% of sends. Industry data shows SMS delivers 3–5× higher open rates for time-sensitive flows like cart abandonment. With only 3,800 SMS sends currently, shifting 10% of cart abandonment sends to SMS is a low-risk, high-reward test.",
    impact: "Est. +12% conversion rate on cart abandonment flow",
    action: "Create SMS Journey",
  },
];

const ANALYTICS_RECS: BluRec[] = [
  {
    id: "conversion-gap",
    priority: "urgent",
    tag: "Conversion",
    title: "Visitor→Paid rate is 1.5% — well below the 2.5–3.5% benchmark",
    body: "Of 18,400 visitors, only 274 convert to paid (1.5%). The steepest drop is Signups→Trial Started at 28.6% (840 of 2,940 signups). This points to onboarding friction — fixing this single step could unlock the most growth available to you right now.",
    impact: "+$8k MRR at 3% conversion — the industry benchmark",
    action: "Audit Onboarding",
  },
  {
    id: "at-risk",
    priority: "urgent",
    tag: "Retention",
    title: "840 customers are At-Risk — intervene before they become Lost",
    body: "RFM analysis shows 840 formerly active customers have gone quiet. At your $156 ARPU, this cohort represents $131k in annual revenue exposure. A targeted win-back campaign now could save 20–30% of them before they permanently churn.",
    impact: "Est. $26–39k annual revenue recovered",
    action: "Create Win-Back",
  },
  {
    id: "trial-conversion",
    priority: "high",
    tag: "Trial",
    title: "Trial→Paid at 32.6% vs. 45–55% industry average",
    body: "840 trial users, 274 converted to paid (32.6%). Data consistently shows a drop-off cliff at day 7–10 for unconverted trials. Targeted in-app messages at day 7 and day 14 are the highest-ROI fix at this stage — low effort, measurable impact.",
    impact: "+12pp trial conversion = est. +$14k incremental MRR",
    action: "Set Up Nudges",
  },
  {
    id: "seo-organic",
    priority: "growth",
    tag: "Acquisition",
    title: "Organic search is your #1 channel — worth doubling down",
    body: "Organic search drives $42.4k in attributed revenue — 36% more than paid social ($31.2k) at near-zero marginal cost. Your top 2 blog posts drive 10% of total site traffic. A focused SEO sprint targeting 3–5 high-intent keywords could 2× organic traffic in 90 days.",
    impact: "Est. 2× organic traffic and $20k+ additional attributed revenue in 90 days",
    action: "Plan SEO Sprint",
  },
];

const PRIORITY_STYLES = {
  urgent: { label: "Urgent",      color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
  high:   { label: "High",        color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  growth: { label: "Opportunity", color: "#0080FF", bg: "rgba(0,128,255,0.10)"  },
};

function BluCard({ rec }: { rec: BluRec }) {
  const p = PRIORITY_STYLES[rec.priority];
  return (
    <div
      className="rounded-xl p-5 flex flex-col"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", borderLeft: `3px solid ${p.color}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>
            {p.label}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">
            {rec.tag}
          </span>
        </div>
        <img src="/mascot.png" alt="Blu" width={22} height={22} className="object-contain shrink-0 opacity-75" />
      </div>
      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-2 leading-snug">{rec.title}</p>
      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed flex-1">{rec.body}</p>
      <div className="flex items-center justify-between gap-3 pt-3 mt-4 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 flex-1 min-w-0 leading-snug">
          <span className="font-medium text-stone-600 dark:text-stone-300">Impact: </span>
          {rec.impact}
        </p>
        <button
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
          style={{ background: p.color }}
        >
          {rec.action} <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

// ── Design dashboard ──────────────────────────────────────────────────────────

function DesignDashboard() {
  const creditsUsed = 3840;
  const creditsTotal = 5000;
  const creditsPct = Math.round((creditsUsed / creditsTotal) * 100);

  return (
    <div className="px-6 pt-6 pb-8 space-y-3 animate-fade-up">
      <Greeting />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={FileImage}   label="Assets generated this week"  value="127"   change="+24%"  />
        <MiniStat icon={Wand2}       label="Active recipes"              value="8"     change="+2"    />
        <MiniStat icon={Users}       label="Avatars configured"          value="6"     change="+1"    accent="#C37EE5" />
        <MiniStat icon={DollarSign}  label="Est. cost saved vs shoot"    value="$6.4k" change="+18%"  accent="#26a269" />
      </div>

      {/* Generation chart + Credits + Brand kit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SectionCard title="Generation Activity — Last 14 Days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DESIGN_GEN_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="images" stroke="#0080FF" strokeWidth={1.5} fill="rgba(0,128,255,0.07)" dot={false} name="Images" />
              <Area type="monotone" dataKey="videos" stroke="#C37EE5" strokeWidth={1.5} fill="rgba(195,126,229,0.07)" dot={false} name="Videos" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500"><span className="w-3 h-0.5 rounded-full bg-blue-400 inline-block" />Images</div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500"><span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#C37EE5" }} />Videos</div>
          </div>
        </SectionCard>

        <div className="space-y-3">
          <SectionCard title="Credits Usage">
            <div className="flex items-end justify-between mb-2">
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 leading-none">
                {creditsUsed.toLocaleString()}<span className="text-sm font-normal text-stone-400 ml-1">/ {creditsTotal.toLocaleString()}</span>
              </p>
              <span className="text-xs font-semibold text-stone-500">{creditsPct}%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-white/8 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all" style={{ width: `${creditsPct}%`, background: creditsPct > 80 ? "#f59e0b" : "#0080FF" }} />
            </div>
            <p className="text-xs text-stone-400">{(creditsTotal - creditsUsed).toLocaleString()} credits remaining this cycle</p>
          </SectionCard>
          <SectionCard title="Brand Kit">
            <div className="space-y-2">
              {DESIGN_BRAND_ITEMS.map((b) => (
                <div key={b.label} className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 dark:text-stone-400">{b.label}</span>
                  {b.ok
                    ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15"><Check size={9} className="text-emerald-600 dark:text-emerald-400" /></span>
                    : <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10">Missing</span>
                  }
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Blu row 1 — brand + recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BluCard rec={DESIGN_RECS[0]} />
        <BluCard rec={DESIGN_RECS[1]} />
      </div>

      {/* Asset types + top recipes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Asset Types — This Week">
          <div className="space-y-3">
            {DESIGN_ASSET_TYPES.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-stone-600 dark:text-stone-400">{t.label}</span>
                <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${t.pct}%` }} />
                </div>
                <span className="w-7 text-right text-xs font-semibold text-stone-700 dark:text-stone-300">{t.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Top Recipes by Usage">
          <div className="space-y-0">
            {DESIGN_TOP_RECIPES.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{r.name}</p>
                  <p className="text-[10px] text-stone-400">{r.avatar}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{r.uses}</p>
                  <p className="text-[10px] text-stone-400">runs</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Blu row 2 — credits + avatars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BluCard rec={DESIGN_RECS[2]} />
        <BluCard rec={DESIGN_RECS[3]} />
      </div>

      <div className="max-w-2xl"><BrandSetupChecklist /></div>
      <HeroVideo />
      <RecentDesigns />
    </div>
  );
}

// ── Analytics dashboard ───────────────────────────────────────────────────────

function AnalyticsDashboard() {
  return (
    <div className="px-6 pt-6 pb-8 space-y-3 animate-fade-up">
      <Greeting />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={DollarSign}   label="Monthly recurring revenue" value="$42.8k"  change="+8.3%"  />
        <MiniStat icon={TrendingDown} label="Churn rate"                value="2.1%"    change="-0.4pp" accent="#26a269" />
        <MiniStat icon={Users}        label="Avg revenue per user"      value="$156"    change="+3.2%"  />
        <MiniStat icon={BarChart3}    label="Custom boards created"     value="14"      change="+4"     />
      </div>

      {/* Blu urgent row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BluCard rec={ANALYTICS_RECS[0]} />
        <BluCard rec={ANALYTICS_RECS[1]} />
      </div>

      {/* MRR trend chart */}
      <EngChart
        title="Monthly Recurring Revenue"
        sub="MRR trend over the past 6 months"
        big="$42,800"
        bigSub="Jun 2026 MRR"
        change="+8.3%"
        data={REVENUE_TREND}
        color="#0080FF"
      />

      {/* Conversion funnel + Blu trial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Conversion Funnel">
          <div className="space-y-0">
            {CONVERSION_FUNNEL.map((f, i) => {
              const pct    = (f.value / CONVERSION_FUNNEL[0].value) * 100;
              const prevPct = i > 0 ? ((f.value / CONVERSION_FUNNEL[i - 1].value) * 100).toFixed(1) : null;
              return (
                <div key={f.stage}>
                  <div className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{f.stage}</span>
                        {prevPct && <span className="text-[10px] text-stone-400">{prevPct}% of prev</span>}
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-400 transition-all" style={{ width: `${Math.max(pct, 1)}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-14">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{f.value.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-400">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  {i < CONVERSION_FUNNEL.length - 1 && (
                    <div className="flex justify-start pl-1 -my-0.5">
                      <ArrowDown size={12} className="text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
        <BluCard rec={ANALYTICS_RECS[2]} />
      </div>

      {/* RFM distribution + Blu SEO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Audience Segments (RFM)">
          <div className="space-y-3">
            {RFM_ANALYTICS.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-stone-600 dark:text-stone-400">{s.label}</span>
                <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-14 text-right">{s.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <BluCard rec={ANALYTICS_RECS[3]} />
      </div>

      {/* Revenue by channel + Subscription usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Revenue by Channel">
          <div className="space-y-3">
            {ATTRIBUTION.map((a) => (
              <div key={a.channel} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-stone-600 dark:text-stone-400 truncate">{a.channel}</span>
                <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${a.pct}%` }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-12 text-right">${(a.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Subscription Usage">
          <div className="grid grid-cols-2 gap-4">
            {SUBSCRIPTION_USAGE.map((u) => {
              const pct = Math.round((u.used / u.total) * 100);
              const fmt = (n: number) => u.unit === "M" ? `${(n / 1000000).toFixed(1)}M` : u.unit === "k" ? `${(n / 1000).toFixed(1)}k` : `${n}`;
              return (
                <div key={u.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400">{u.label}</span>
                    <span className="text-[10px] font-semibold text-stone-500">{pct}%</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-white/8 rounded-full h-1.5 mb-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: pct > 80 ? "#f59e0b" : "#0080FF" }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400">{fmt(u.used)} / {fmt(u.total)}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
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
      <div className="mt-0 mb-4 rounded-xl border border-stone-200 dark:border-(--border) overflow-hidden" style={{ background: "var(--content-bg)" }}>
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
  { id: "connect-calendar",  title: "Connect your calendar",      desc: "Sync availability for meetings and booking links", action: "Connect" },
  { id: "create-booking",    title: "Create a booking type",      desc: "Publish reusable scheduler links",                 action: "Open"    },
  { id: "enable-reminders",  title: "Enable meeting reminders",   desc: "Send 24 hour and 1 hour reminders",                action: "Open"    },
];

// TODO: replace with real API call — e.g. useQuery("/api/sales/setup-progress")
function useSalesSetupProgress(): Set<string> {
  return new Set(["connect-calendar"]);
}

function SalesSetupChecklist() {
  return (
    <SetupChecklist
      title="Finish scheduler setup"
      steps={SALES_SETUP_STEPS}
      initialCompleted={useSalesSetupProgress()}
    />
  );
}

// ── Marketing checklist ───────────────────────────────────────────────────────

const MARKETING_SETUP_STEPS: SetupStepDef[] = [
  { id: "connect-catalog",  title: "Connect your catalog",      desc: "Sync products and feeds for personalization",        action: "Connect" },
  { id: "create-journey",   title: "Create your first journey", desc: "Design a multi-step automation in the canvas",       action: "Open"    },
  { id: "launch-experience",title: "Launch an experience",      desc: "Deploy an onboarding flow or popup to your product", action: "Open"    },
  { id: "setup-segment",    title: "Define an audience segment",desc: "Target users by behavior, attributes, or lifecycle", action: "Open"    },
];

function MarketingSetupChecklist() {
  return (
    <SetupChecklist
      title="Get your marketing engine ready"
      steps={MARKETING_SETUP_STEPS}
      initialCompleted={new Set(["connect-catalog"])}
    />
  );
}

// ── Analytics checklist ───────────────────────────────────────────────────────

const ANALYTICS_SETUP_STEPS: SetupStepDef[] = [
  { id: "connect-tracking",  title: "Connect event tracking",     desc: "Install the Intempt SDK on your web or app",       action: "Connect" },
  { id: "create-board",      title: "Create your first board",    desc: "Build a custom analytics dashboard",               action: "Open"    },
  { id: "setup-funnel",      title: "Set up a funnel",            desc: "Track conversion steps from signup to paid",       action: "Open"    },
  { id: "review-retention",  title: "Review your retention chart",desc: "Understand where users drop off after activation", action: "Open"    },
];

function AnalyticsSetupChecklist() {
  return (
    <SetupChecklist
      title="Set up analytics to unlock insights"
      steps={ANALYTICS_SETUP_STEPS}
      initialCompleted={new Set(["connect-tracking"])}
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

type HomeBentoCard = {
  id: string;
  perspective: "summary" | "blu";
  title: string;
  eyebrow: string;
  value?: string;
  body: string;
  action?: string;
  icon: LucideIcon;
  signal?: string;
  href?: string;
  status?: "warning" | "good";
  chart?: {
    type: "bars" | "line" | "stack" | "progress";
    label?: string;
    values: number[];
    labels?: string[];
  };
};

const brandLogoUrl = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

const HOME_BENTO: Record<string, { title: string; subtitle: string; cards: HomeBentoCard[] }> = {
  design: {
    title: "Design wrapped",
    subtitle: "What Blu saw across Brand, Asset Library, Avatars, Scenes, Poses, and Design System in the last 24 hours.",
    cards: [
      { id: "assets", perspective: "summary", eyebrow: "Asset Library", title: "Assets generated", value: "127", body: "Packshots and email banners carried most of the creative output today.", icon: FileImage, signal: "+24%", href: "/asset-library" },
      { id: "recipes", perspective: "summary", eyebrow: "Recipes", title: "Active recipes", value: "8", body: "Reusable generation recipes currently producing brand assets.", icon: Wand2 },
      { id: "brand", perspective: "summary", eyebrow: "Brand", title: "Brand readiness", value: "80%", body: "Brand colors, font, and theme are set. Dark logo is still missing.", icon: Palette, signal: "Missing logo", href: "/brand-kit" },
      { id: "creative-variety", perspective: "summary", eyebrow: "Creative", title: "Creative variety", value: "Warning", body: "Most generations are coming from the same avatars and scenes.", icon: AlertTriangle, signal: "2 avatars", status: "warning" },
      { id: "rec-logo", perspective: "blu", eyebrow: "Blu recommendation", title: "Upload the dark logo today", body: "Dark-mode email previews and generated creatives need the missing logo to keep branding consistent.", action: "Open Brand", icon: Bot, signal: "High impact" },
      { id: "rec-social", perspective: "blu", eyebrow: "Blu recommendation", title: "Turn packshots into social ads", body: "Social ad recipes are underused. Recycle the highest-performing packshots into square placements.", action: "Create recipe", icon: Target },
      { id: "rec-avatars", perspective: "blu", eyebrow: "Blu recommendation", title: "Add two more personas", body: "Reduce visual fatigue by adding a B2B buyer and retail shopper avatar.", action: "Add avatar", icon: UserPlus },
      { id: "rec-scenes", perspective: "blu", eyebrow: "Blu recommendation", title: "Create one lifestyle scene", body: "Most output is studio-style. Add a lifestyle scene to make product visuals feel less repetitive.", action: "Add scene", icon: Clapperboard },
      { id: "rec-system", perspective: "blu", eyebrow: "Blu recommendation", title: "Lock design tokens before scaling", body: "Design System is set, but locking radius, type, and spacing will keep future assets cleaner.", action: "Review tokens", icon: PenTool },
    ],
  },
  marketing: {
    title: "Marketing wrapped",
    subtitle: "What happened across Catalog, Feeds, Journeys, Experiences, messages, and conversion flows in the last 24 hours.",
    cards: [
      { id: "live-journeys", perspective: "summary", eyebrow: "Journeys", title: "Live journeys", value: "9", body: "Running journeys currently sending or waiting on triggers.", icon: Route, signal: "+2" },
      { id: "sent-mails", perspective: "summary", eyebrow: "Journeys", title: "Sent mails", value: "3.4k", body: "Journey emails sent across active flows.", icon: Send, signal: "+12%" },
      { id: "opens", perspective: "summary", eyebrow: "Journeys", title: "Opens", value: "3.2k", body: "Email opens from active journeys.", icon: MailOpen, signal: "+8%" },
      { id: "clicks-replies", perspective: "summary", eyebrow: "Journeys", title: "Clicks / replies", value: "1.6k", body: "Combined clicks and replies from journey messages.", icon: MousePointerClick, signal: "+6%" },
      { id: "journey-health", perspective: "summary", eyebrow: "Journeys", title: "Journey health", value: "Warning", body: "Revenue spiked sharply on May 26.", icon: AlertTriangle, signal: "+140%", status: "warning" },
      { id: "journeys", perspective: "summary", eyebrow: "Summary", title: "Journey revenue", value: "$15,047,484.74", body: "Total revenue from running journeys over the current period.", icon: Route, chart: { type: "line", label: "journey-revenue", values: [0, 12000, 175000, 230000, 260000, 290000, 310000, 340000, 370000, 400000, 430000, 460000, 490000, 510000, 530000, 560000, 900000, 1300000, 3600000, 4700000, 5400000, 6100000, 6200000, 14900000, 15047484, 15047484, 15047484, 15047484, 15047484, 15047484] } },
      { id: "ab", perspective: "summary", eyebrow: "Summary", title: "Experience attributed revenue", value: "$7,523,742.37", body: "Intempt attributed revenue from active experiences and personalization.", icon: Shuffle, chart: { type: "line", label: "experience-revenue", values: [0, 6000, 87500, 115000, 130000, 145000, 155000, 170000, 185000, 200000, 215000, 230000, 245000, 255000, 265000, 280000, 450000, 650000, 1800000, 2350000, 2700000, 3050000, 3100000, 7450000, 7523742, 7523742, 7523742, 7523742, 7523742, 7523742] } },
      { id: "bounce", perspective: "summary", eyebrow: "Summary", title: "Deliverability needs attention", value: "4.8%", body: "Bounce rate is above the safe range.", icon: AlertCircle },
      { id: "rec-bounce", perspective: "blu", eyebrow: "Blu recommendation", title: "Pause stale audiences first", body: "Suppress old re-engagement segments before the next send to protect sender reputation.", action: "Clean segment", icon: Bot, signal: "Urgent" },
      { id: "rec-subject", perspective: "blu", eyebrow: "Blu recommendation", title: "Test two sharper subject lines", body: "Run a short A/B on curiosity vs. outcome-led copy to recover open rate.", action: "Create test", icon: Wand2 },
      { id: "rec-ship", perspective: "blu", eyebrow: "Blu recommendation", title: "Ship the winning onboarding variant", body: "Keeping the loser live is leaving conversion lift on the table.", action: "Ship winner", icon: Check },
      { id: "rec-sms", perspective: "blu", eyebrow: "Blu recommendation", title: "Move cart abandonment to SMS", body: "Use SMS for the second reminder only. Low risk, clearer conversion read.", action: "Add SMS step", icon: Smartphone },
      { id: "rec-feed", perspective: "blu", eyebrow: "Blu recommendation", title: "Refresh product feed images", body: "Top catalog items can reuse the newest packshots from Design for stronger email clicks.", action: "Sync feed", icon: Package },
    ],
  },
  sales: {
    title: "Sales wrapped",
    subtitle: "A 24-hour read across Accounts, Deals, Meetings, Scheduler, and revenue movement.",
    cards: [
      { id: "sales-users", perspective: "summary", eyebrow: "Accounts", title: "Active accounts", value: "142", body: "Known accounts with recent activity available for follow-up.", icon: Users, signal: "+8" },
      { id: "attended-meetings", perspective: "summary", eyebrow: "Meetings", title: "Meetings attended", value: "7", body: "Meetings attended in the last 7 days.", icon: Calendar, signal: "Last 7d" },
      { id: "deals-won", perspective: "summary", eyebrow: "Deals", title: "Deals won this week", value: "4", body: "4 deals moved to Closed Won — $68k in recognized revenue.", icon: Handshake, signal: "$68k" },
      { id: "pipeline", perspective: "summary", eyebrow: "Deals", title: "Active pipeline", value: "$284k", body: "Most value sits between Qualified and Proposal.", icon: Briefcase, signal: "+12%" },
      { id: "sales-health", perspective: "summary", eyebrow: "Health", title: "Sales health", value: "Warning", body: "Meeting attendance is lagging behind qualified deal growth.", icon: AlertTriangle, signal: "Watch", status: "warning" },
      { id: "upcoming-meetings", perspective: "summary", eyebrow: "Meetings", title: "Upcoming 3 meetings", value: "3", body: "Next meetings from your scheduler with join actions.", icon: Calendar },
      { id: "pipeline-stages", perspective: "summary", eyebrow: "Pipeline", title: "Pipeline by stage", value: "194", body: "Active deals distributed across all pipeline stages.", icon: Briefcase },
      { id: "rec-followup", perspective: "blu", eyebrow: "Blu recommendation", title: "Touch FieldsUSA today", body: "Send a crisp next-step email and book the final decision call while the deal is warm.", action: "Schedule follow-up", icon: Bot, signal: "Urgent" },
      { id: "rec-reminders", perspective: "blu", eyebrow: "Blu recommendation", title: "Enable meeting reminders", body: "Add 24h and 1h reminders to recover no-shows with minimal effort.", action: "Enable reminders", icon: Bell },
      { id: "rec-sequence", perspective: "blu", eyebrow: "Blu recommendation", title: "Create a qualified-deal sequence", body: "A 4-step follow-up path should move more qualified deals into Proposal.", action: "Build sequence", icon: MailOpen },
      { id: "rec-prospects", perspective: "blu", eyebrow: "Blu recommendation", title: "Nurture cold prospects", body: "84 prospects are stalling. Use education-led messaging before direct selling.", action: "Create nurture", icon: Users },
      { id: "rec-calendar", perspective: "blu", eyebrow: "Blu recommendation", title: "Tighten scheduler availability", body: "Keep two clean booking windows per day to reduce back-and-forth and speed up conversion.", action: "Open scheduler", icon: CalendarClock },
    ],
  },
  analytics: {
    title: "Analytics wrapped",
    subtitle: "A 24-hour executive read across Out-of-the-box reports, Boards, Subscription, audiences, and revenue signals.",
    cards: [
      { id: "active-users", perspective: "summary", eyebrow: "Out-of-the-box", title: "Active users", value: "1.87K", body: "Users who were active in the selected period across tracked web and product events.", icon: Users, signal: "-70%", chart: { type: "line", label: "Active users", values: [10, 18, 12, 25, 40, 35, 20, 32, 25, 20, 15, 25, 30, 8] } },
      { id: "traffic-users", perspective: "summary", eyebrow: "Traffic", title: "Total users", value: "3.79K", body: "Total tracked users from the traffic report.", icon: Globe, signal: "-45%" },
      // { id: "revenue-channel", perspective: "summary", eyebrow: "Revenue", title: "Top revenue channel", value: "$42.4K", body: "Organic Search is the highest attributed revenue source.", icon: DollarSign, signal: "#1" },
      { id: "page-views", perspective: "summary", eyebrow: "Engagement", title: "Page views", value: "4.06K", body: "Total page views across tracked sessions.", icon: Activity, signal: "+239%" },
      { id: "mrr", perspective: "summary", eyebrow: "MRR", title: "Current MRR", value: "$25.21K", body: "Subscription MRR for Jun 2026.", icon: DollarSign, signal: "+2.62%", chart: { type: "line", label: "MRR", values: [10530, 12144, 13701, 15594, 16766, 18207, 19597, 20711, 22052, 22914, 24568, 25212] } },
      { id: "subscribers", perspective: "summary", eyebrow: "Subscribers", title: "Total subscribers", value: "1,940", body: "Active subscribers at the end of Jun 2026.", icon: Users, signal: "-3.04%" },
      { id: "rec-onboarding", perspective: "blu", eyebrow: "Blu recommendation", title: "Audit onboarding first", body: "Improving signup to trial start is the highest-leverage conversion move.", action: "Audit flow", icon: Bot, signal: "Highest ROI" },
      { id: "rec-winback", perspective: "blu", eyebrow: "Blu recommendation", title: "Launch a win-back campaign", body: "Target at-risk users before they slide into the lost segment.", action: "Create campaign", icon: Route },
      { id: "rec-trial", perspective: "blu", eyebrow: "Blu recommendation", title: "Add day-7 trial nudges", body: "Send in-app and email prompts when users are most likely to drop off.", action: "Set nudges", icon: MessageSquare },
      { id: "rec-seo", perspective: "blu", eyebrow: "Blu recommendation", title: "Double down on SEO winners", body: "Turn the top two posts into a focused high-intent content cluster.", action: "Plan sprint", icon: TrendingUp },
      { id: "rec-board", perspective: "blu", eyebrow: "Blu recommendation", title: "Pin this as an executive board", body: "Track MRR, churn, trial conversion, RFM, and organic revenue in one board.", action: "Create board", icon: LayoutGrid },
    ],
  },
};

function MiniBentoChart({ chart }: { chart: NonNullable<HomeBentoCard["chart"]> }) {
  const max = Math.max(...chart.values, 1);

  if (chart.type === "line") {
    const points = chart.values.map((value, index) => {
      const x = chart.values.length === 1 ? 0 : (index / (chart.values.length - 1)) * 100;
      const y = 32 - (value / max) * 28;
      return `${x},${y}`;
    }).join(" ");

    return (
      <div className="mt-auto pt-3">
        {chart.label && <p className="mb-1.5 text-[10px] font-medium text-stone-400">{chart.label}</p>}
        <svg viewBox="0 0 100 36" className="h-12 w-full overflow-visible">
          <polyline points={points} fill="none" stroke="#0080FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={`0,36 ${points} 100,36`} fill="rgba(0,128,255,0.08)" stroke="none" />
        </svg>
      </div>
    );
  }

  if (chart.type === "stack") {
    const total = chart.values.reduce((sum, value) => sum + value, 0) || 1;
    let offset = 0;

    return (
      <div className="mt-auto pt-3">
        {chart.label && <p className="mb-1.5 text-[10px] font-medium text-stone-400">{chart.label}</p>}
        <div className="flex h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
          {chart.values.map((value, index) => {
            const width = (value / total) * 100;
            offset += width;
            return (
              <span
                key={`${value}-${index}`}
                className="h-full"
                style={{
                  width: `${width}%`,
                  background: index === 0 ? "#0080FF" : `rgba(0,128,255,${Math.max(0.18, 0.42 - index * 0.07)})`,
                }}
              />
            );
          })}
        </div>
        {chart.labels && (
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
            {chart.labels.slice(0, 4).map((label, index) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-stone-500 dark:text-stone-400">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: index === 0 ? "#0080FF" : `rgba(0,128,255,${Math.max(0.22, 0.48 - index * 0.08)})` }} />
                <span className="truncate">{label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (chart.type === "progress") {
    return (
      <div className="mt-auto space-y-2 pt-3">
        {chart.label && <p className="text-[10px] font-medium text-stone-400">{chart.label}</p>}
        {chart.values.slice(0, 4).map((value, index) => (
          <div key={`${value}-${index}`} className="grid grid-cols-[44px_1fr_28px] items-center gap-2">
            <span className="truncate text-[10px] text-stone-500 dark:text-stone-400">{chart.labels?.[index] ?? `Item ${index + 1}`}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
              <span className="block h-full rounded-full bg-blue-500" style={{ width: `${Math.min(value, 100)}%` }} />
            </span>
            <span className="text-right text-[10px] font-medium text-stone-500 dark:text-stone-400">{value}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-auto pt-3">
      {chart.label && <p className="mb-1.5 text-[10px] font-medium text-stone-400">{chart.label}</p>}
      <div className="flex h-12 items-end gap-1.5">
        {chart.values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="flex-1 rounded-t-md bg-blue-500/80"
            style={{ height: `${Math.max(12, (value / max) * 48)}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function LargeBentoChart({ chart }: { chart: NonNullable<HomeBentoCard["chart"]> }) {
  const gradientId = `homePanelGrad-${(chart.label ?? "line").replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const data = chart.values.map((value, index) => ({
    label: chart.labels?.[index] ?? `${index + 1}`,
    value,
  }));

  if (chart.type === "progress") {
    return (
      <div className="grid h-full content-center gap-4">
        {chart.values.slice(0, 4).map((value, index) => (
          <div key={`${value}-${index}`} className="grid grid-cols-[72px_1fr_40px] items-center gap-3">
            <span className="truncate text-xs font-medium text-stone-500 dark:text-stone-400">{chart.labels?.[index] ?? `Item ${index + 1}`}</span>
            <span className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
              <span className="block h-full rounded-full bg-blue-500" style={{ width: `${Math.min(value, 100)}%` }} />
            </span>
            <span className="text-right text-xs font-semibold text-stone-700 dark:text-stone-200">{value}%</span>
          </div>
        ))}
      </div>
    );
  }

  if (chart.type === "stack") {
    const total = chart.values.reduce((sum, value) => sum + value, 0) || 1;
    return (
      <div className="flex h-full flex-col justify-center">
        <div className="flex h-4 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
          {chart.values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="h-full"
              style={{
                width: `${(value / total) * 100}%`,
                background: index === 0 ? "#0080FF" : `rgba(0,128,255,${Math.max(0.2, 0.48 - index * 0.08)})`,
              }}
            />
          ))}
        </div>
        {chart.labels && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {chart.labels.slice(0, 4).map((label, index) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 dark:bg-white/4">
                <span className="flex min-w-0 items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: index === 0 ? "#0080FF" : `rgba(0,128,255,${Math.max(0.24, 0.52 - index * 0.08)})` }} />
                  <span className="truncate">{label}</span>
                </span>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{chart.values[index]}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (chart.type === "bars") {
    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -26 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.45} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,128,255,0.06)" }} />
          <Bar dataKey="value" fill="#0080FF" fillOpacity={0.78} radius={[5, 5, 0, 0]} maxBarSize={34} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -26 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0080FF" stopOpacity={0.26} />
            <stop offset="100%" stopColor="#0080FF" stopOpacity={0.07} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.45} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={34} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#0080FF", strokeWidth: 1, strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#0080FF"
          strokeWidth={2.25}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: "#0080FF", strokeWidth: 0 }}
          name={chart.label ?? "Value"}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SummaryKpiCard({ card }: { card: HomeBentoCard }) {
  const navigate = useNavigate();
  const Icon = card.icon;
  const displayValue = card.value === "$15,047,484.74"
    ? "$15.0M"
    : card.value === "$7,523,742.37"
      ? "$7.5M"
      : card.value;

  const statusBg =
    card.status === "warning" ? "rgba(239,68,68,0.05)"
    : card.status === "good"  ? "rgba(34,197,94,0.05)"
    : "var(--content-bg)";

  const iconClass =
    card.status === "warning" ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
    : card.status === "good"  ? "bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400"
    : "bg-stone-100 text-blue-500 dark:bg-white/8";

  const valueClass =
    card.status === "warning" ? "text-red-600 dark:text-red-400"
    : card.status === "good"  ? "text-green-600 dark:text-green-400"
    : "text-stone-900 dark:text-stone-50";

  const watermarkClass =
    card.status === "warning" ? "text-red-500"
    : card.status === "good"  ? "text-green-500"
    : "text-blue-500";

  return (
    <div
      onClick={card.href ? () => navigate(card.href!) : undefined}
      className={`relative min-h-[116px] overflow-hidden rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm ${card.href ? "cursor-pointer" : ""}`}
      style={{ background: statusBg, border: "1px solid var(--border)" }}
    >
      <div className="relative z-10 flex h-full flex-col justify-between gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon size={15} />
          </span>
          {card.signal && <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">{card.signal}</span>}
        </div>
        <div>
          {displayValue && <p className={`text-2xl font-semibold leading-none tracking-tight ${valueClass}`}>{displayValue}</p>}
          <p className="mt-2 truncate text-sm font-medium leading-snug text-stone-700 dark:text-stone-200">{card.title}</p>
        </div>
      </div>
      <span className={`pointer-events-none absolute -bottom-5 -right-5 opacity-[0.05] ${watermarkClass}`}>
        <Icon size={86} />
      </span>
    </div>
  );
}

function EmptyAnalyticsCard({
  title,
  label,
  action,
  className = "",
}: {
  title: string;
  label?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-[116px] overflow-hidden rounded-xl p-4 ${className}`}
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <img
        src="/logo.png"
        alt=""
        className="pointer-events-none absolute -bottom-7 -right-7 h-24 w-24 object-contain opacity-[0.035] grayscale dark:opacity-[0.055]"
      />
      <div className="relative z-10 flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-white/8 dark:text-stone-500">
            <span className="h-3 w-3 rounded-full border border-current" />
          </span>
          {label && <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-500 dark:bg-white/8 dark:text-stone-400">{label}</span>}
        </div>
        <div>
          <p className="text-sm font-medium leading-snug text-stone-700 dark:text-stone-200">{title}</p>
          {action && <p className="mt-1 text-xs font-medium text-stone-400 dark:text-stone-500">{action}</p>}
        </div>
      </div>
    </div>
  );
}

function EmptyAnalyticsPanel({
  title,
  action,
  provider,
  href,
  linkText,
  className = "",
}: {
  title: string;
  action: string;
  provider?: "stripe" | "javascript";
  href?: string;
  linkText?: string;
  className?: string;
}) {
  const providerDomain = provider === "stripe" ? "stripe.com" : null;
  const providerName = provider === "stripe" ? "Stripe" : provider === "javascript" ? "JavaScript" : "";

  return (
    <div
      className={`relative grid min-h-[168px] place-items-center overflow-hidden rounded-xl p-5 ${className}`}
      style={{ background: "var(--content-bg)", border: "1px solid color-mix(in srgb, var(--border) 58%, transparent)" }}
    >
      <img
        src="/logo.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 object-contain opacity-[0.035] grayscale dark:opacity-[0.055]"
      />
      <div className="relative z-10 text-center">
        {provider && (
          <span className="mx-auto mb-4 flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-stone-100 dark:bg-white/8">
            {provider === "javascript" ? (
              <span className="flex h-full w-full items-center justify-center bg-[#F7DF1E] text-xs font-bold text-black">
                JS
              </span>
            ) : providerDomain ? (
              <img
                src={brandLogoUrl(providerDomain)}
                alt={providerName}
                className="h-full w-full object-contain"
              />
            ) : null}
          </span>
        )}
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
        <p className="mt-1 text-xs font-medium text-stone-400 dark:text-stone-500">{action}</p>
        {href && linkText && (
          <a
            href={href}
            className="mt-4 inline-flex text-xs font-medium text-stone-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
}

type EmptySourceLogo =
  | { kind: "js" }
  | { kind: "brand"; domain: string; alt: string }
  | { kind: "icon"; icon: LucideIcon };

function EmptySourceMark({ logo, index }: { logo: EmptySourceLogo; index: number }) {
  const rotate = index % 2 === 0 ? "rotate-[-8deg]" : "rotate-[8deg]";
  const offset = index === 0 ? "" : "-ml-3";

  return (
    <span
      className={`${offset} ${rotate} relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-stone-100 dark:bg-white/8`}
      style={{ border: "1px solid var(--border)", zIndex: 10 - index }}
    >
      {logo.kind === "js" ? (
        <span className="flex h-full w-full items-center justify-center bg-[#F7DF1E] text-sm font-bold text-black">
          JS
        </span>
      ) : logo.kind === "brand" ? (
        <img
          src={brandLogoUrl(logo.domain)}
          alt={logo.alt}
          className="h-full w-full object-contain"
        />
      ) : (
        <logo.icon size={18} className="text-stone-500 dark:text-stone-400" />
      )}
    </span>
  );
}

function AnalyticsIntegrationsCard({
  className = "",
  title = "Connect analytics sources",
  body = "Unlock users, page views, MRR, subscribers, and more.",
  href = "/integrations",
  linkText = "Go to integrations",
  logos = [{ kind: "js" }, { kind: "brand", domain: "stripe.com", alt: "Stripe" }] as EmptySourceLogo[],
}: {
  className?: string;
  title?: string;
  body?: string;
  href?: string;
  linkText?: string;
  logos?: EmptySourceLogo[];
}) {
  return (
    <div className={`relative grid min-h-[260px] place-items-center overflow-hidden p-6 ${className}`}>
      <div className="relative z-10 max-w-md text-center">
        <div className="mb-5 flex items-center justify-center">
          {logos.map((logo, index) => (
            <EmptySourceMark key={`${logo.kind}-${index}`} logo={logo} index={index} />
          ))}
        </div>
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
        <p className="mt-1.5 text-xs font-medium leading-relaxed text-stone-400 dark:text-stone-500">
          {body}
        </p>
        <a
          href={href}
          className="mt-5 inline-flex text-xs font-medium text-stone-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          {linkText}
        </a>
      </div>
    </div>
  );
}

function GraphPanel({ card }: { card: HomeBentoCard }) {
  const isRevenueMetric = card.id === "journeys" || card.id === "ab" || card.id === "mrr";
  const graphBadge =
    card.id === "journeys" ? "Journeys" :
    card.id === "ab" ? "Experiences" :
    card.id === "mrr" ? "Analytics" :
    card.id === "active-users" ? "Out-of-the-box" :
    card.id === "upcoming-meetings" ? "Meetings" :
    card.id === "pipeline-stages" ? "Deals" :
    card.eyebrow;

  if (card.id === "upcoming-meetings") {
    const meetings = [
      { name: "FieldsUSA demo", date: "JUN 10", time: "7:00 PM", due: "in 4 hours" },
      { name: "Linea renewal call", date: "JUN 10", time: "8:00 PM", due: "in 5 hours" },
      { name: "StockInvest onboarding", date: "JUN 13", time: "12:15 PM", due: "in 3 days" },
    ];

    return (
      <div
        className="relative min-h-[260px] overflow-hidden rounded-xl p-5"
        style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Coming up</p>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">{graphBadge}</span>
        </div>
        <div className="space-y-2.5">
          {meetings.map((meeting) => (
            <div key={meeting.name} className="flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-white/4">
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
                <span className="text-[10px] font-semibold leading-none">{meeting.date.split(" ")[0]}</span>
                <span className="mt-0.5 text-base font-semibold leading-none">{meeting.date.split(" ")[1]}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{meeting.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400">{meeting.time}</span>
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-500/12 dark:text-orange-300">
                    {meeting.due}
                  </span>
                </div>
              </div>
              <button className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-600">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m16 13 5 3V8l-5 3" />
                  <rect x="3" y="6" width="13" height="12" rx="2" />
                </svg>
                Join now
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (card.id === "pipeline-stages") {
    const STAGE_COLORS: Record<string, string> = {
      "Prospect":    "#0080FF",
      "Qualified":   "#0080FF",
      "Proposal":    "#0080FF",
      "Negotiation": "#0080FF",
      "Closed Won":  "#0080FF",
    };
    const stages = [
      { name: "Prospect",    deals: 84, value: "$420k", pct: 100 },
      { name: "Qualified",   deals: 52, value: "$312k", pct: 74  },
      { name: "Proposal",    deals: 28, value: "$224k", pct: 53  },
      { name: "Negotiation", deals: 12, value: "$108k", pct: 26  },
      { name: "Closed Won",  deals: 18, value: "$126k", pct: 30  },
    ];
    const totalDeals = stages.reduce((s, r) => s + r.deals, 0);

    return (
      <div
        className="relative min-h-[260px] overflow-hidden rounded-xl p-5"
        style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-extrabold leading-none tracking-tight text-stone-900 dark:text-stone-100">{totalDeals}</p>
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Active deals across all stages</p>
            <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400">$284k weighted pipeline value</p>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">{graphBadge}</span>
        </div>
        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.name}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STAGE_COLORS[stage.name] }} />
                  <span className="truncate">{stage.name}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-stone-400">{stage.value}</span>
                  <span className="w-6 text-right text-xs font-semibold text-stone-900 dark:text-stone-100">{stage.deals}</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
                <div className="h-full rounded-full transition-all" style={{ width: `${stage.pct}%`, background: STAGE_COLORS[stage.name] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isRevenueMetric && card.chart) {
    const dates = card.id === "mrr"
      ? ["Jan 1", "Jan 10", "Jan 20", "Feb 1", "Feb 10", "Feb 20", "Mar 1", "Mar 10", "Mar 20", "Apr 1", "Apr 10", "Apr 20", "May 1", "May 10", "May 20", "Jun 1", "Jun 10", "Jun 20"]
      : [
        "May 3", "May 4", "May 5", "May 6", "May 7", "May 8", "May 9", "May 10", "May 11", "May 12",
        "May 13", "May 14", "May 15", "May 16", "May 17", "May 18", "May 19", "May 20", "May 21", "May 22",
        "May 23", "May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30", "Jun 1", "Jun 2",
      ];
    const metricData = card.chart.values.map((value, index) => ({
      date: [
        ...dates,
      ][index] ?? `Day ${index + 1}`,
      value,
    }));

    return (
      <div className="relative min-w-0">
        <span className="absolute right-4 top-4 z-20 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
          {graphBadge}
        </span>
        <RevenueMetricCard
          value={card.value ?? ""}
          label={card.id === "journeys" ? "Total revenue" : card.id === "ab" ? "Intempt attributed revenue" : "Monthly recurring revenue"}
          change={card.id === "mrr" ? "+8.3% vs. previous period" : "-- vs. previous period"}
          data={metricData}
        />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-[260px] overflow-hidden rounded-xl p-5"
      style={{
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {card.value && <p className="text-3xl font-extrabold leading-none tracking-tight text-stone-900 dark:text-stone-100">{card.value}</p>}
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{card.title}</p>
            <p className="mt-1.5 text-xs font-medium text-amber-700 dark:text-amber-500">{card.signal ? `${card.signal} vs. previous period` : "-- vs. previous period"}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
            {graphBadge}
          </span>
        </div>

        {card.chart && <div className="min-h-0 flex-1"><LargeBentoChart chart={card.chart} /></div>}
      </div>
    </div>
  );
}

function BluSuggestionCard({ card }: { card: HomeBentoCard }) {
  const toneColor = card.signal?.toLowerCase().includes("urgent")
    ? "#ef4444"
    : card.signal?.toLowerCase().includes("high")
      ? "#f59e0b"
      : "#0080FF";

  return (
    <div
      className="group flex min-h-[116px] flex-col overflow-hidden rounded-xl p-4 transition-all duration-150"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      {/* Top row: priority badge + mascot */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {card.signal ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: `${toneColor}18`, color: toneColor }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: toneColor }} />
            {card.signal}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500 dark:bg-white/8 dark:text-stone-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-500" />
            Suggestion
          </span>
        )}
        <img src="/mascot.png" alt="Blu" width={20} height={20} className="shrink-0 object-contain opacity-40 dark:opacity-30" />
      </div>

      {/* Title + body */}
      <p className="text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">{card.title}</p>
      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{card.body}</p>

    </div>
  );
}

function LatestGenerationsCard() {
  const navigate = useNavigate();
  const items = [
    { name: "Claude design - Email 1", type: "Email", ago: "2 days ago", icon: MailOpen },
    { name: "Flash sale SMS with Liquid variables", type: "SMS", ago: "3 days ago", icon: MessageSquare },
    { name: "Raw HTML email output", type: "Email", ago: "1 week ago", icon: MailOpen },
    { name: "Brand character holding a can", type: "Image", ago: "1 month ago", icon: FileImage },
    { name: "Brand character with water tumbler", type: "Image", ago: "1 month ago", icon: FileImage },
  ];

  return (
    <div className="rounded-xl px-5 py-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Latest generations</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Recent assets generated from Blu and the asset library</p>
        </div>
        <button onClick={() => navigate("/asset-library")} className="h-8 rounded-md bg-blue-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-blue-600">
          Show all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className="group min-w-0 rounded-xl bg-stone-50 p-3 text-left transition-colors hover:bg-blue-50 dark:bg-white/4 dark:hover:bg-blue-500/10"
            >
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/12">
                <Icon size={15} />
              </span>
              <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-800 dark:text-stone-100">{item.name}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-white/8 dark:text-blue-300">{item.type}</span>
                <span className="truncate text-[11px] text-stone-400">{item.ago}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TAB_VIDEOS: Record<string, string> = {
  design:     "https://www.youtube.com/embed/XAyYkqmHzhc?autoplay=1&rel=0&modestbranding=1",
  sales:      "https://www.youtube.com/embed/UQNNQb7JPvw?autoplay=1&rel=0&modestbranding=1",
  marketing:  "https://www.youtube.com/embed/9LuIOESoiCc?autoplay=1&rel=0&modestbranding=1",
  analytics:  "https://www.youtube.com/embed/Z0KjV40InIo?autoplay=1&rel=0&modestbranding=1",
};

const TAB_VIDEO_IDS: Record<string, string> = {
  design: "XAyYkqmHzhc",
  sales: "UQNNQb7JPvw",
  marketing: "9LuIOESoiCc",
  analytics: "Z0KjV40InIo",
};

const EMPTY_HOME_SETUP: Record<string, {
  title: string;
  body: string;
  href: string;
  linkText: string;
  logos: EmptySourceLogo[];
}> = {
  design: {
    title: "Set up your brand kit",
    body: "Add logo, colors, fonts, and product assets to unlock design workflows.",
    href: "/brand-kit",
    linkText: "Open brand kit",
    logos: [{ kind: "icon", icon: Palette }, { kind: "icon", icon: FileImage }],
  },
  marketing: {
    title: "Connect marketing sources",
    body: "Sync catalog, site activity, audiences, journeys, and more.",
    href: "/integrations",
    linkText: "Go to integrations",
    logos: [
      { kind: "brand", domain: "hubspot.com", alt: "HubSpot" },
      { kind: "brand", domain: "sendgrid.com", alt: "SendGrid" },
      { kind: "js" },
      { kind: "brand", domain: "shopify.com", alt: "Shopify" },
    ],
  },
  sales: {
    title: "Set up meetings and scheduler",
    body: "Connect calendar, create booking types, reminders, and more.",
    href: "/meetings",
    linkText: "Open meetings",
    logos: [
      { kind: "brand", domain: "calendar.google.com", alt: "Google Calendar" },
      { kind: "brand", domain: "gmail.com", alt: "Gmail" },
    ],
  },
  analytics: {
    title: "Connect analytics sources",
    body: "Unlock users, page views, MRR, subscribers, and more.",
    href: "/integrations",
    linkText: "Go to integrations",
    logos: [{ kind: "js" }, { kind: "brand", domain: "stripe.com", alt: "Stripe" }],
  },
};

function VideoOverlay({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.24)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
          aria-label="Close"
        >
          <X size={14} />
        </button>
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src={src}
            title="Introduction video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

const TAB_CHECKLIST: Record<string, React.ReactNode> = {
  design:    <BrandSetupChecklist />,
  sales:     <SalesSetupChecklist />,
  marketing: <MarketingSetupChecklist />,
  analytics: <AnalyticsSetupChecklist />,
};

function HomeBentoDashboard({ tab }: { tab: string }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dashboard = HOME_BENTO[tab] ?? HOME_BENTO.design;
  const allSummaryCards = dashboard.cards.filter((card) => card.perspective === "summary");
  const summaryCount = tab === "analytics" ? 5 : tab === "design" ? 4 : 5;
  const allSlicedCards = allSummaryCards.slice(0, summaryCount);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());
  const summaryCards = allSlicedCards.filter((card) => !hiddenCards.has(card.id));
  const preferredChartIds = tab === "marketing" ? new Set(["journeys", "ab"]) : tab === "sales" ? new Set(["upcoming-meetings", "pipeline-stages"]) : null;
  const chartCards = (preferredChartIds
    ? allSummaryCards.filter((card) => preferredChartIds.has(card.id))
    : allSummaryCards.filter((card) => card.chart)
  ).slice(0, 2);
  const fallbackChartCards = chartCards.length >= 2 ? chartCards : allSummaryCards.slice(0, 2);
  const bluCards = dashboard.cards.filter((card) => card.perspective === "blu").slice(0, 4);
  const videoSrc = TAB_VIDEOS[tab];

  function toggleCard(id: string) {
    setHiddenCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="px-6 pt-6 pb-8 animate-fade-up">
      {videoOpen && videoSrc && <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />}

      <div className="mb-4 flex items-start justify-between gap-4">
        <Greeting />
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setChecklistOpen((o) => !o)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${checklistOpen ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400" : "hover:bg-stone-50 dark:hover:bg-white/6 text-stone-500 dark:text-stone-400"}`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          {videoSrc && (
            <button
              onClick={() => setVideoOpen(true)}
              className="flex items-center gap-1.5 h-8 rounded-lg px-3 text-xs font-medium border transition-colors hover:bg-stone-50 dark:hover:bg-white/6 text-stone-600 dark:text-stone-400"
              style={{ borderColor: "var(--border)" }}
            >
              <Play size={11} className="fill-current text-blue-500" />
              Watch intro
            </button>
          )}
          {/* Gear — card visibility dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
                settingsOpen || hiddenCards.size > 0
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                  : "hover:bg-stone-50 dark:hover:bg-white/6 text-stone-500 dark:text-stone-400"
              }`}
              style={{ borderColor: "var(--border)" }}
              title="Customize cards"
            >
              <Settings size={14} />
            </button>

            {settingsOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                {/* Dropdown */}
                <div
                  className="absolute right-0 top-10 z-50 w-56 rounded-xl py-1 shadow-lg"
                  style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
                >
                  <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 dark:text-stone-500">
                    Visible cards
                  </p>
                  {allSlicedCards.map((card) => {
                    const Icon = card.icon;
                    const visible = !hiddenCards.has(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                      >
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                          style={{
                            background: visible ? "#0080FF" : "transparent",
                            border: visible ? "none" : "1.5px solid var(--border)",
                          }}
                        >
                          {visible && <Check size={10} className="text-white" />}
                        </span>
                        <Icon size={12} className="shrink-0 text-stone-400 dark:text-stone-500" />
                        <span className="text-xs text-stone-700 dark:text-stone-200">{card.title}</span>
                      </button>
                    );
                  })}
                  {hiddenCards.size > 0 && (
                    <div style={{ borderTop: "1px solid var(--border)" }} className="mt-1 pt-1 pb-1">
                      <button
                        onClick={() => setHiddenCards(new Set())}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
                      >
                        Show all
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible checklist */}
      <div
        style={{
          maxHeight: checklistOpen ? 600 : 0,
          opacity: checklistOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        }}
      >
        {TAB_CHECKLIST[tab]}
      </div>

      <div className="space-y-3">
        {summaryCards.length > 0 && (
          <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${tab === "analytics" ? "lg:grid-cols-5" : tab === "design" ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
            {summaryCards.map((card) => (
              <SummaryKpiCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {tab === "design" ? (
          <LatestGenerationsCard />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {fallbackChartCards.map((card) => (
              <GraphPanel key={`graph-${card.id}`} card={card} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {bluCards.map((card) => (
            <BluSuggestionCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyHomeDashboard({ tab }: { tab: string }) {
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
  const videoSrc = TAB_VIDEOS[tab] ?? TAB_VIDEOS.analytics;
  const videoId = TAB_VIDEO_IDS[tab] ?? TAB_VIDEO_IDS.analytics;
  const setup = EMPTY_HOME_SETUP[tab] ?? EMPTY_HOME_SETUP.analytics;

  return (
    <div className="relative overflow-hidden px-6 pt-6 pb-8 animate-fade-up">
      <img
        src="/logo.png"
        alt=""
        className="pointer-events-none fixed -bottom-22 -right-22 z-0 h-90 w-90 -rotate-12 object-contain opacity-[0.014] grayscale dark:opacity-[0.03]"
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <Greeting />
        <button
          onClick={() => {
            setVideoCollapsed(false);
            setInlinePlaying(false);
          }}
          className={`inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border text-xs font-medium text-stone-600 transition-all duration-300 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6 ${
            videoCollapsed ? "w-28 px-3 opacity-100" : "pointer-events-none w-0 px-0 opacity-0"
          }`}
          style={{ borderColor: "var(--border)" }}
          aria-hidden={!videoCollapsed}
          tabIndex={videoCollapsed ? 0 : -1}
        >
          <Play size={11} className="fill-current text-blue-500" />
          <span className="whitespace-nowrap">Watch video</span>
        </button>
      </div>

      <div className="relative z-10 mt-4 flex min-h-140 items-center">
        <div className={`grid w-full items-stretch gap-3 ${videoCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
          {!videoCollapsed && (
            <div className="relative aspect-video overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
              <button
                onClick={() => {
                  setVideoCollapsed(true);
                  setInlinePlaying(false);
                }}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-white transition-colors hover:bg-white/20"
                style={{ borderColor: "rgba(255,255,255,0.34)", background: "rgba(0,0,0,0.28)" }}
                aria-label="Close video"
              >
                <X size={14} />
              </button>
              {inlinePlaying ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={videoSrc}
                  title="Analytics setup video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button onClick={() => setInlinePlaying(true)} className="absolute inset-0 group text-left">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                    alt={`${tab} setup overview`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.64) 0%, rgba(0,0,0,0.22) 58%, rgba(0,0,0,0.06) 100%)" }}
                  />
                  <span
                    className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.34)" }}
                  >
                    <Play size={18} className="ml-0.5 fill-white text-white" />
                  </span>
                </button>
              )}
            </div>
          )}

          <div className={`grid ${videoCollapsed ? "mx-auto w-full max-w-xl" : "lg:h-full"}`}>
            <AnalyticsIntegrationsCard
              className="h-full"
              title={setup.title}
              body={setup.body}
              href={setup.href}
              linkText={setup.linkText}
              logos={setup.logos}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Marketing homepage ────────────────────────────────────────────────────────

type MarketingKpi = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: "good" | "warning" | "critical";
  icon: LucideIcon;
};

const MARKETING_HOME_KPIS: MarketingKpi[] = [
  {
    label: "Attributed revenue",
    value: "$22.6M",
    detail: "Combined impact from journeys and experiments",
    trend: "+18%",
    tone: "good",
    icon: DollarSign,
  },
  {
    label: "Experiment lift",
    value: "+8.6%",
    detail: "Best active personalization result is ready to ship",
    trend: "Winner",
    tone: "good",
    icon: Shuffle,
  },
  {
    label: "Feed coverage",
    value: "68%",
    detail: "Catalog items eligible for personalized blocks",
    trend: "+11%",
    tone: "warning",
    icon: Package,
  },
  {
    label: "Bounce rate",
    value: "4.8%",
    detail: "Above the 3% sender risk threshold",
    trend: "Critical",
    tone: "critical",
    icon: AlertCircle,
  },
];

const MARKETING_OPERATIONS = [
  { name: "Welcome series", type: "Journey", status: "active", metric: "1,240 sends", result: "12.4% conv." },
  { name: "Cart abandonment", type: "Journey", status: "active", metric: "842 sends", result: "18.1% conv." },
  { name: "Onboarding tips", type: "Experience", status: "winning", metric: "2 variants", result: "+8.6% lift" },
  { name: "Popular right now", type: "Feed", status: "active", metric: "428 items", result: "68% coverage" },
  { name: "Re-engagement Q2", type: "Journey", status: "paused", metric: "0 sends", result: "Needs review" },
];

const MARKETING_HOME_ACTIONS = [
  {
    priority: "Urgent",
    title: "Clean stale audiences before the next send",
    body: "Bounce rate is above the sender-risk threshold. Suppress old re-engagement segments first, then resume volume.",
    impact: "Protect deliverability",
    action: "Clean segment",
    tone: "critical" as const,
  },
  {
    priority: "High",
    title: "Ship the winning onboarding experience",
    body: "The onboarding variant has a clear lift. Moving the winner live is more useful than keeping the test running.",
    impact: "+8.6% conversion lift",
    action: "Ship winner",
    tone: "warning" as const,
  },
];

function MarketingKpiCard({ item }: { item: MarketingKpi }) {
  const Icon = item.icon;
  const tone =
    item.tone === "critical"
      ? { text: "text-red-600 dark:text-red-400", bg: "rgba(239,68,68,0.08)" }
      : item.tone === "warning"
        ? { text: "text-amber-600 dark:text-amber-400", bg: "rgba(245,158,11,0.08)" }
        : { text: "text-blue-600 dark:text-blue-400", bg: "rgba(0,128,255,0.08)" };

  return (
    <div
      className="flex min-h-[128px] flex-col rounded-xl p-4"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: tone.bg }}>
          <Icon size={14} className={tone.text} />
        </span>
        <span className={`text-xs font-semibold ${tone.text}`}>{item.trend}</span>
      </div>
      <p className="text-2xl font-bold leading-none text-stone-900 dark:text-stone-50">{item.value}</p>
      <p className="mt-2 text-xs font-medium text-stone-700 dark:text-stone-300">{item.label}</p>
      <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">{item.detail}</p>
    </div>
  );
}

function MarketingStatusPill({ status }: { status: string }) {
  const isActive = status === "active" || status === "winning";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300"
        : "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-400"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-stone-400"}`} />
      {status}
    </span>
  );
}

function MarketingBluActionCard({ rec }: { rec: typeof MARKETING_HOME_ACTIONS[number] }) {
  const isCritical = rec.tone === "critical";
  const color = isCritical ? "#ef4444" : "#f59e0b";

  return (
    <div
      className="flex h-full min-h-[204px] flex-col rounded-xl p-5"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: isCritical ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)" }}>
            <Bot size={14} style={{ color }} />
          </span>
          <div>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">Blu recommendation</p>
            <p className="text-xs text-stone-400">{rec.impact}</p>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: isCritical ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)", color }}>
          {rec.priority}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">{rec.title}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{rec.body}</p>
      <button
        className="mt-5 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
        style={{ background: "#0080FF" }}
      >
        {rec.action}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

type SalesHomeKpi = {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: "good" | "warning" | "neutral";
  icon: LucideIcon;
};

const SALES_HOME_KPIS: SalesHomeKpi[] = [
  {
    label: "Upcoming meetings",
    value: "3",
    detail: "Scheduled meetings in the next 7 days",
    trend: "Next 7d",
    tone: "good",
    icon: Calendar,
  },
  {
    label: "Attended rate",
    value: "77%",
    detail: "Meetings attended across the current period",
    trend: "-6pp",
    tone: "warning",
    icon: Activity,
  },
  {
    label: "Booking types",
    value: "4",
    detail: "Reusable scheduler links available to share",
    trend: "2 live",
    tone: "good",
    icon: CalendarClock,
  },
  {
    label: "Calendar setup",
    value: "1/3",
    detail: "Calendar is connected, reminders still need setup",
    trend: "Setup",
    tone: "neutral",
    icon: ClipboardList,
  },
];

const SALES_HOME_ACTIONS = [
  {
    priority: "High",
    title: "Enable meeting reminders",
    body: "Meetings and booking are supported now. Add 24 hour and 1 hour reminders to reduce no-shows.",
    impact: "Improve attendance",
    action: "Enable reminders",
    tone: "warning" as const,
  },
  {
    priority: "Setup",
    title: "Publish the onboarding booking type",
    body: "The scheduler can already manage reusable booking links. Review the draft onboarding slot and publish it.",
    impact: "Make handoff bookable",
    action: "Review booking",
    tone: "neutral" as const,
  },
];

function SalesKpiCard({ item }: { item: SalesHomeKpi }) {
  const Icon = item.icon;

  return (
    <div
      className="relative flex h-full min-h-[128px] overflow-hidden rounded-xl p-4"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <Icon
        size={86}
        className="pointer-events-none absolute -bottom-5 -right-5 text-blue-500 opacity-[0.05]"
      />
      <div className="relative z-10 flex min-h-full w-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-blue-500 dark:bg-white/8"
          >
            <Icon size={15} />
          </span>
          <span
            className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium leading-none text-blue-600 dark:bg-blue-500/12 dark:text-blue-300"
          >
            {item.trend}
          </span>
        </div>
        <div className="mt-auto">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[34px] font-bold leading-none tracking-normal text-stone-950 dark:text-stone-50">{item.value}</p>
              <p className="mt-2 text-sm font-semibold leading-tight text-stone-800 dark:text-stone-100">{item.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesActionCard({ rec }: { rec: typeof SALES_HOME_ACTIONS[number] }) {
  const isWarning = rec.tone === "warning";
  const color = isWarning ? "#f59e0b" : "#0080FF";

  return (
    <div className="flex h-full min-h-[204px] flex-col rounded-xl p-5" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: isWarning ? "rgba(245,158,11,0.08)" : "rgba(0,128,255,0.08)" }}>
            <Bot size={14} style={{ color }} />
          </span>
          <div>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">Blu recommendation</p>
            <p className="text-xs text-stone-400">{rec.impact}</p>
          </div>
        </div>
        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: isWarning ? "rgba(245,158,11,0.08)" : "rgba(0,128,255,0.08)", color }}>
          {rec.priority}
        </span>
      </div>
      <p className="text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">{rec.title}</p>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{rec.body}</p>
      <button className="mt-5 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#0080FF" }}>
        {rec.action}
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

// ── Design homepage ────────────────────────────────────────────────────────────

function DesignHomeDashboard() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const videoSrc = TAB_VIDEOS.design;

  const kpis = [
    { label: "ASSETS CREATED",  value: "127",  sub: "+24% this week",       icon: FileImage, accent: "#0080FF" },
    { label: "BRAND READINESS", value: "80%",  sub: "4 of 5 items complete", icon: Palette,   accent: "#26a269" },
    { label: "DESIGN SYSTEMS",  value: "3",    sub: "+1 added this month",   icon: PenTool,   accent: "#C37EE5" },
    { label: "AVATARS",         value: "6",    sub: "+1 added recently",     icon: Users,     accent: "#f59e0b" },
  ] as const;

  return (
    <div className="px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && (
        <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <Greeting />
        <button
          onClick={() => setChecklistOpen((o) => !o)}
          className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
            checklistOpen
              ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
              : "hover:bg-stone-50 dark:hover:bg-white/6 text-stone-500 dark:text-stone-400"
          }`}
          style={{ borderColor: "var(--border)" }}
          title="Brand setup checklist"
        >
          <ClipboardList size={14} />
        </button>
      </div>

      {/* Collapsible checklist */}
      <div
        style={{
          maxHeight: checklistOpen ? 600 : 0,
          opacity: checklistOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        }}
      >
        <BrandSetupChecklist />
      </div>

      {/* ── Hero: video + 4 KPI tiles ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-stretch">
        {/* Video card */}
        <button
          onClick={() => setVideoOpen(true)}
          className="lg:col-span-3 relative overflow-hidden rounded-xl group text-left"
          style={{ minHeight: 232, border: "1px solid var(--border)" }}
        >
          <img
            src="https://img.youtube.com/vi/XAyYkqmHzhc/maxresdefault.jpg"
            alt="Intempt Design overview"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.08) 100%)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
              style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.34)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            >
              <Play size={18} className="fill-white text-white ml-0.5" />
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span
              className="inline-flex items-center gap-1.5 mb-2.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
              style={{ background: "rgba(0,128,255,0.22)", border: "1px solid rgba(0,128,255,0.32)" }}
            >
              <Play size={8} className="fill-current" /> WATCH INTRO
            </span>
            <p className="text-[17px] font-semibold text-white leading-snug">How Intempt Design works</p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
              Brand kits, design systems, avatars &amp; AI-generated creative assets — channel-ready in minutes.
            </p>
          </div>
        </button>

        {/* 2×2 KPI tiles */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {kpis.map(({ label, value, sub, icon: Icon, accent }) => (
            <div
              key={label}
              className="rounded-xl p-4 flex flex-col"
              style={{ background: "var(--content-bg)", border: "1px solid var(--border)", minHeight: 110 }}
            >
              <div className="flex items-center gap-1.5 mb-3">
                <Icon size={11} style={{ color: accent }} className="shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 dark:text-stone-500 leading-none">
                  {label}
                </span>
              </div>
              <p className="text-[27px] font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50 leading-none mt-auto">
                {value}
              </p>
              <p className="text-[11px] mt-2 text-stone-500 dark:text-stone-400">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Brand kit + Asset types ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Brand kit completeness */}
        <div className="rounded-xl p-5" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100">Brand Kit</p>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.10)", color: "#d97706" }}
            >
              1 missing
            </span>
          </div>
          <div className="w-full h-1 rounded-full mb-4" style={{ background: "var(--muted)" }}>
            <div className="h-1 rounded-full bg-blue-500 transition-all" style={{ width: "80%" }} />
          </div>
          <div>
            {DESIGN_BRAND_ITEMS.map((b, i) => (
              <div
                key={b.label}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < DESIGN_BRAND_ITEMS.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <span className="text-xs text-stone-600 dark:text-stone-400">{b.label}</span>
                {b.ok ? (
                  <span
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={{ background: "rgba(37,184,100,0.12)" }}
                  >
                    <Check size={9} className="text-emerald-600 dark:text-emerald-400" />
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: "rgba(245,158,11,0.10)", color: "#d97706" }}
                  >
                    Missing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asset type breakdown */}
        <div className="rounded-xl p-5" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
          <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100 mb-4">
            Asset Types
            <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.08em] text-stone-400 dark:text-stone-500">
              this week
            </span>
          </p>
          <div className="space-y-3.5">
            {DESIGN_ASSET_TYPES.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className="text-xs text-stone-600 dark:text-stone-400 shrink-0 w-36 truncate">{t.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                  <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${t.pct}%` }} />
                </div>
                <span className="text-xs font-semibold tabular-nums text-stone-700 dark:text-stone-300 w-6 text-right shrink-0">
                  {t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Generation chart + Credits ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100">Generation Activity</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Images and videos created — last 14 days</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {[
                { label: "Images", color: "#0080FF" },
                { label: "Videos", color: "#C37EE5" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-stone-500">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DESIGN_GEN_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="images" stroke="#0080FF" strokeWidth={1.5} fill="rgba(0,128,255,0.06)"   dot={false} name="Images" />
              <Area type="monotone" dataKey="videos" stroke="#C37EE5" strokeWidth={1.5} fill="rgba(195,126,229,0.06)" dot={false} name="Videos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Credits */}
        <div className="rounded-xl p-5 flex flex-col" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
          <p className="text-[13px] font-semibold text-stone-800 dark:text-stone-100 mb-4">Credits</p>
          <div>
            <p className="text-[32px] font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50 leading-none">3,840</p>
            <p className="text-xs text-stone-400 mt-1 mb-4">of 5,000 used · 77%</p>
          </div>
          <div className="w-full h-2 rounded-full mb-3" style={{ background: "var(--muted)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: "77%", background: "#f59e0b" }} />
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">1,160 credits remaining this cycle</p>
          <div
            className="mt-auto flex items-start gap-2 rounded-lg p-3"
            style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
          >
            <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Approaching 80% limit — schedule batch runs to avoid throttling.
            </p>
          </div>
        </div>
      </div>

      {/* ── Recent designs ── */}
      <LatestGenerationsCard />

      {/* ── Blu recommendations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <BluCard rec={DESIGN_RECS[0]} />
        <BluCard rec={DESIGN_RECS[1]} />
      </div>
    </div>
  );
}

function MarketingHomeDashboard() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const videoSrc = TAB_VIDEOS.marketing;

  return (
    <div className="px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && (
        <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />
      )}

      <div className="flex items-start justify-between gap-4 mb-1">
        <Greeting />
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setChecklistOpen((o) => !o)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "hover:bg-stone-50 dark:hover:bg-white/6 text-stone-500 dark:text-stone-400"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className={`inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border text-xs font-medium text-stone-600 transition-all duration-300 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6 ${
              videoCollapsed ? "w-[112px] px-3 opacity-100" : "pointer-events-none w-0 px-0 opacity-0"
            }`}
            style={{ borderColor: "var(--border)" }}
            aria-hidden={!videoCollapsed}
            tabIndex={videoCollapsed ? 0 : -1}
          >
            <Play size={11} className="fill-current text-blue-500" />
            <span className="whitespace-nowrap">Watch video</span>
          </button>
        </div>
      </div>

      {/* Collapsible setup checklist */}
      <div
        style={{
          maxHeight: checklistOpen ? 600 : 0,
          opacity: checklistOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        }}
      >
        <MarketingSetupChecklist />
      </div>

      <div className="space-y-3">
        <div className={`transition-all duration-300 ease-out ${videoCollapsed ? "max-h-0 overflow-hidden opacity-0" : "max-h-[260px] opacity-100"}`}>
          <div
            className="relative min-h-[220px] overflow-hidden rounded-xl"
            style={{ border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => {
                setVideoCollapsed(true);
                setInlinePlaying(false);
              }}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-white transition-colors hover:bg-white/20"
              style={{ borderColor: "rgba(255,255,255,0.34)", background: "rgba(0,0,0,0.28)" }}
              aria-label="Close video"
            >
              <X size={14} />
            </button>
            {inlinePlaying ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={videoSrc}
                title="Marketing overview video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button onClick={() => setInlinePlaying(true)} className="absolute inset-0 group text-left">
                <img
                  src="https://img.youtube.com/vi/9LuIOESoiCc/maxresdefault.jpg"
                  alt="Intempt Marketing overview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.30) 58%, rgba(0,0,0,0.08) 100%)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.34)" }}
                  >
                    <Play size={18} className="fill-white text-white ml-0.5" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span
                    className="inline-flex items-center gap-1.5 mb-2.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
                    style={{ background: "rgba(0,128,255,0.22)", border: "1px solid rgba(0,128,255,0.32)" }}
                  >
                    <Play size={8} className="fill-current" /> Play video
                  </span>
                  <p className="text-[17px] font-semibold text-white leading-snug">
                    Marketing command center
                  </p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                    Journeys, experiments, catalog feeds, and channel performance in one operating view.
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MARKETING_HOME_KPIS.map((item) => (
            <MarketingKpiCard key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div>
          <SectionCard className="h-full">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Message performance</p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Daily delivery volume and response quality over the last 26 days.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {[
                  { label: "Sends",  color: "#0080FF" },
                  { label: "Opens",  color: "#64748b" },
                  { label: "Clicks", color: "#16a34a" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={SENDS_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sends"  stroke="#0080FF" strokeWidth={1.5} fill="rgba(0,128,255,0.06)"   dot={false} name="Sends"  />
                <Area type="monotone" dataKey="opens"  stroke="#64748b" strokeWidth={1.5} fill="rgba(100,116,139,0.06)" dot={false} name="Opens"  />
                <Area type="monotone" dataKey="clicks" stroke="#16a34a" strokeWidth={1.5} fill="rgba(22,163,74,0.06)"  dot={false} name="Clicks" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Marketing Operations" className="h-full">
            <div className="space-y-0">
              <div
                className="grid grid-cols-4 gap-3 pb-2 border-b text-xs font-semibold text-slate-500 dark:text-slate-400"
                style={{ borderColor: "var(--border)" }}
              >
                <span>Item</span>
                <span>Status</span>
                <span className="text-right">Metric</span>
                <span className="text-right">Result</span>
              </div>
              {MARKETING_OPERATIONS.map((j) => (
                <div
                  key={j.name}
                  className="grid grid-cols-4 gap-3 items-center py-3 border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{j.name}</p>
                    <p className="mt-0.5 text-xs text-stone-400">{j.type}</p>
                  </div>
                  <MarketingStatusPill status={j.status} />
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300 text-right">
                    {j.metric}
                  </span>
                  <span
                    className="text-sm font-semibold text-right"
                    style={{ color: j.result.includes("Needs") ? "#f59e0b" : j.result.includes("+") || j.result.includes("conv") ? "#16a34a" : "#64748b" }}
                  >
                    {j.result}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        <SectionCard title="Anomaly Detection" className="h-full">
          <div className="space-y-3">
            {ANOMALIES.slice(0, 3).map((a) => {
              const isCritical = a.status === "critical";
              const color = isCritical ? "#ef4444" : "#f59e0b";
              return (
                <div key={a.metric} className="rounded-lg p-3" style={{ background: "var(--muted)" }}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{a.metric}</span>
                    <span className="text-xs font-medium" style={{ color }}>{a.status}</span>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-bold leading-none" style={{ color }}>{a.actual}</p>
                      <p className="mt-1 text-xs text-stone-400">Expected {a.expected}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold" style={{ color }}>{a.change}</p>
                      <p className="mt-1 text-xs text-stone-400">{a.ago}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
        {MARKETING_HOME_ACTIONS.map((rec) => (
          <MarketingBluActionCard key={rec.title} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function SalesHomeDashboard() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const videoSrc = TAB_VIDEOS.sales;

  return (
    <div className="px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && (
        <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />
      )}

      <div className="flex items-start justify-between gap-4 mb-1">
        <Greeting />
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setChecklistOpen((o) => !o)}
            className={`flex items-center justify-center h-8 w-8 rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "hover:bg-stone-50 dark:hover:bg-white/6 text-stone-500 dark:text-stone-400"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className={`inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-lg border text-xs font-medium text-stone-600 transition-all duration-300 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6 ${
              videoCollapsed ? "w-[112px] px-3 opacity-100" : "pointer-events-none w-0 px-0 opacity-0"
            }`}
            style={{ borderColor: "var(--border)" }}
            aria-hidden={!videoCollapsed}
            tabIndex={videoCollapsed ? 0 : -1}
          >
            <Play size={11} className="fill-current text-blue-500" />
            <span className="whitespace-nowrap">Watch video</span>
          </button>
        </div>
      </div>

      <div
        style={{
          maxHeight: checklistOpen ? 600 : 0,
          opacity: checklistOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
        }}
      >
        <SalesSetupChecklist />
      </div>

      <div className={`grid grid-cols-1 gap-3 ${videoCollapsed ? "" : "lg:grid-cols-2"} items-stretch`}>
        <div className={`transition-all duration-300 ease-out ${videoCollapsed ? "max-h-0 overflow-hidden opacity-0" : "max-h-[420px] opacity-100"}`}>
          <div className="relative aspect-video overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <button
              onClick={() => {
                setVideoCollapsed(true);
                setInlinePlaying(false);
              }}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-white transition-colors hover:bg-white/20"
              style={{ borderColor: "rgba(255,255,255,0.34)", background: "rgba(0,0,0,0.28)" }}
              aria-label="Close video"
            >
              <X size={14} />
            </button>
            {inlinePlaying ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={videoSrc}
                title="Sales overview video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button onClick={() => setInlinePlaying(true)} className="absolute inset-0 group text-left">
                <img
                  src="https://img.youtube.com/vi/UQNNQb7JPvw/hqdefault.jpg"
                  alt="Intempt Sales overview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.30) 58%, rgba(0,0,0,0.08) 100%)" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.34)" }}
                  >
                    <Play size={18} className="fill-white text-white ml-0.5" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[17px] font-semibold text-white leading-snug">
                    Sales command center
                  </p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.58)" }}>
                    Meetings, scheduler links, calendar setup, and attendance health in one operating view.
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${videoCollapsed ? "xl:grid-cols-4" : "lg:h-full lg:grid-rows-2"}`}>
          {SALES_HOME_KPIS.map((item) => (
            <SalesKpiCard key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title="Meeting Attendance" className="h-full">
          <div className="mb-3 flex items-center gap-4">
            {[
              { label: "Scheduled", color: "#0080FF" },
              { label: "Attended", color: "#16a34a" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: item.color }} />
                {item.label}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <ComposedChart data={MEETINGS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="scheduled" fill="rgba(0,128,255,0.15)" radius={[2, 2, 0, 0]} name="Scheduled" maxBarSize={28} />
              <Line dataKey="attended" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 3, strokeWidth: 0 }} name="Attended" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <div className="h-full rounded-xl p-5" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Coming up</p>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
              Meetings
            </span>
          </div>
          <div className="space-y-4">
            {[
              { date: "JUN 10", title: "FieldsUSA demo", time: "7:00 PM", due: "in 4 hours" },
              { date: "JUN 10", title: "Linea renewal call", time: "8:00 PM", due: "in 5 hours" },
              { date: "JUN 13", title: "StockInvest onboarding", time: "12:15 PM", due: "in 3 days" },
            ].map((meeting) => {
              const [month, day] = meeting.date.split(" ");
              return (
                <div key={meeting.title} className="grid grid-cols-[56px_1fr_auto] items-center gap-4">
                  <span className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
                    <span className="text-[10px] font-semibold leading-none">{month}</span>
                    <span className="mt-0.5 text-xl font-semibold leading-none">{day}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{meeting.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm text-stone-500 dark:text-stone-400">{meeting.time}</span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-500/12 dark:text-orange-300">
                        {meeting.due}
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold text-white transition-colors hover:opacity-90" style={{ background: "#0080FF" }}>
                    <Video size={13} />
                    Join now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
        <SectionCard title="Setup Health" className="h-full">
          <div className="space-y-3">
            {[
              { label: "Calendar connected", status: "Done", done: true },
              { label: "Booking types created", status: "2 live", done: true },
              { label: "Reminders configured", status: "Missing", done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ background: "var(--muted)" }}>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{item.label}</span>
                <span className={`text-xs font-semibold ${item.done ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {SALES_HOME_ACTIONS.map((rec) => (
          <SalesActionCard key={rec.title} rec={rec} />
        ))}
      </div>
    </div>
  );
}

export default function HomeView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "design";
  const [requestedTab, previewState] = rawTab.split("/");
  const tab = HOME_TABS.some((t) => t.key === requestedTab)
    ? requestedTab
    : "design";
  const showEmptyPreview = previewState === "1";

  function setTab(key: string) {
    navigate(`/home?tab=${key}`, { replace: true });
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      <ViewTabs tabs={HOME_TABS} activeTab={tab} onChange={setTab} />
      {showEmptyPreview
        ? <EmptyHomeDashboard key={`${tab}-empty`} tab={tab} />
        : tab === "design"
          ? <DesignHomeDashboard key="design" />
          : tab === "marketing"
            ? <MarketingHomeDashboard key="marketing" />
            : tab === "sales"
              ? <SalesHomeDashboard key="sales" />
              : <HomeBentoDashboard key={tab} tab={tab} />
      }
    </div>
  );
}
