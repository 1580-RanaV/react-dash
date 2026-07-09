

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Greeting from "./Greeting";
import ViewTabs from "./ViewTabs";
import HeroVideo from "./HeroVideo";
import RecentDesigns from "./RecentDesigns";
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
const AGENTS = [
  { name: "Support Concierge",  type: "Chat",  conversations: 1842, resolution: 78, csat: 94 },
  { name: "Sales Qualifier",    type: "Chat",  conversations: 1204, resolution: 64, csat: 91 },
  { name: "Onboarding Coach",   type: "Email", conversations:  612, resolution: 82, csat: 96 },
  { name: "Voice Receptionist", type: "Voice", conversations:  348, resolution: 71, csat: 89 },
];
const ANOMALIES = [
  { metric: "Email bounce rate",  status: "critical", expected: "0.9% – 1.6%",    actual: "4.8%",  change: "+220%", ago: "12m ago" },
  { metric: "Open rate",          status: "warning",  expected: "40% – 46%",      actual: "28.4%", change: "−33%",  ago: "48m ago" },
  { metric: "Unsubscribe rate",   status: "warning",  expected: "0.10% – 0.22%",  actual: "0.42%", change: "+110%", ago: "2h ago"  },
  { metric: "Send volume",        status: "critical", expected: "4.6k – 5.8k",    actual: "1.2k",  change: "−76%",  ago: "3h ago"  },
];

// ── Sales dashboard data ─────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { stage: "Prospect",    count: 84, value: 420000, pct: 100 },
  { stage: "Qualified",   count: 52, value: 312000, pct:  74 },
  { stage: "Proposal",    count: 28, value: 224000, pct:  53 },
  { stage: "Negotiation", count: 12, value: 108000, pct:  26 },
  { stage: "Closed Won",  count: 18, value: 126000, pct:  30 },
];
const TOP_OPPORTUNITIES = [
  { company: "FieldsUSA",   deal: "Enterprise Plan",  value: 24000, stage: "Negotiation" },
  { company: "Acme Corp",   deal: "Marketing Suite",  value: 18400, stage: "Proposal"    },
  { company: "BrightCo",    deal: "Pro Annual",       value: 12800, stage: "Qualified"   },
  { company: "Stellar Inc", deal: "Team Tier",        value:  9600, stage: "Proposal"    },
];
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

// ── Design dashboard ──────────────────────────────────────────────────────────

function DesignDashboard() {
  const creditsUsed = 3840;
  const creditsTotal = 5000;
  const creditsPct = Math.round((creditsUsed / creditsTotal) * 100);

  return (
    <div className="px-6 pt-6 pb-8 space-y-5 animate-fade-up">
      <Greeting />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={FileImage}   label="Assets generated this week"  value="127"  change="+24%"  />
        <MiniStat icon={Wand2}       label="Active recipes"              value="8"    change="+2"    />
        <MiniStat icon={Users}       label="Avatars configured"          value="6"    change="+1"    accent="#C37EE5" />
        <MiniStat icon={DollarSign}  label="Est. cost saved vs shoot"    value="$6.4k" change="+18%" accent="#26a269" />
      </div>

      {/* Generation activity + asset types */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <SectionCard title="Generation Activity — Last 14 Days">
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
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="w-3 h-0.5 rounded-full bg-blue-400 inline-block" />Images
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: "#C37EE5" }} />Videos
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {/* Credits usage */}
          <SectionCard title="Credits Usage">
            <div className="flex items-end justify-between mb-2">
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 leading-none">
                {creditsUsed.toLocaleString()}
                <span className="text-sm font-normal text-stone-400 ml-1">/ {creditsTotal.toLocaleString()}</span>
              </p>
              <span className="text-xs font-semibold text-stone-500">{creditsPct}%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-white/8 rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${creditsPct}%`, background: creditsPct > 80 ? "#f59e0b" : "#0080FF" }}
              />
            </div>
            <p className="text-xs text-stone-400">{(creditsTotal - creditsUsed).toLocaleString()} credits remaining this cycle</p>
          </SectionCard>

          {/* Brand kit health */}
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

      <div className="max-w-2xl"><BrandSetupChecklist /></div>
      <HeroVideo />
      <div className="max-w-2xl"><RecentDesigns /></div>
    </div>
  );
}

// ── Marketing dashboard ───────────────────────────────────────────────────────

function ChannelIcon({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    email: <MailOpen size={11} />,
    sms:   <MessageSquare size={11} />,
    push:  <Bell size={11} />,
    inapp: <Smartphone size={11} />,
  };
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-white/8 text-stone-500">{map[type] ?? null}</span>;
}

function MarketingDashboard() {
  return (
    <div className="px-6 pt-6 pb-8 space-y-5 animate-fade-up">
      <Greeting />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Send}        label="Sends (last 26 days)"   value="24.8k"  change="+12%"  />
        <MiniStat icon={MailOpen}    label="Open rate"              value="42.6%"  change="+4.8%" accent="#C37EE5" />
        <MiniStat icon={MousePointerClick} label="Click rate"       value="7.8%"   change="+0.6%" accent="#59B277" />
        <MiniStat icon={Route}       label="Active journeys"        value="12"     change="+3"    />
      </div>

      {/* Multi-series sends chart */}
      <SectionCard>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Sends, Opens &amp; Clicks</p>
          <div className="flex items-center gap-5">
            {[{ label: "Sends", color: "#0080FF" }, { label: "Opens", color: "#C37EE5" }, { label: "Clicks", color: "#59B277" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-stone-500">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={SENDS_CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="sends"  stroke="#0080FF" strokeWidth={1.5} fill="rgba(0,128,255,0.06)"  dot={false} name="Sends"  />
            <Area type="monotone" dataKey="opens"  stroke="#C37EE5" strokeWidth={1.5} fill="rgba(195,126,229,0.06)" dot={false} name="Opens"  />
            <Area type="monotone" dataKey="clicks" stroke="#59B277" strokeWidth={1.5} fill="rgba(89,178,119,0.06)"  dot={false} name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Engagement funnel + Channel mix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SectionCard title="Engagement Funnel">
          <div className="space-y-0">
            {ENGAGEMENT_FUNNEL.map((step, i) => {
              const pctOfTotal = ((step.value / ENGAGEMENT_FUNNEL[0].value) * 100).toFixed(1);
              const pctOfPrev  = i > 0 ? ((step.value / ENGAGEMENT_FUNNEL[i - 1].value) * 100).toFixed(1) : null;
              return (
                <div key={step.stage}>
                  <div className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{step.stage}</span>
                        {pctOfPrev && (
                          <span className="text-[10px] text-stone-400">{pctOfPrev}% of prev</span>
                        )}
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-blue-400 transition-all" style={{ width: `${Math.max(parseFloat(pctOfTotal), 1)}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-16">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">{step.value.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-400">{pctOfTotal}%</p>
                    </div>
                  </div>
                  {i < ENGAGEMENT_FUNNEL.length - 1 && (
                    <div className="flex justify-start pl-1 -my-0.5">
                      <ArrowDown size={12} className="text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Channel Mix">
          <div className="space-y-3.5">
            {CHANNEL_MIX.map((c) => (
              <div key={c.channel} className="flex items-center gap-3">
                <ChannelIcon type={c.icon} />
                <span className="w-12 shrink-0 text-xs text-stone-600 dark:text-stone-400">{c.channel}</span>
                <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-10 text-right">{c.count.toLocaleString()}</span>
                <span className="text-[10px] text-stone-400 w-6 text-right">{c.pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Active journeys + Live experiences */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <SectionCard title="Active Journeys">
            <div className="space-y-0">
              <div className="grid grid-cols-4 pb-2 border-b text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500" style={{ borderColor: "var(--border)" }}>
                <span className="col-span-2">Journey</span>
                <span className="text-right">24h Sends</span>
                <span className="text-right">Conv %</span>
              </div>
              {ACTIVE_JOURNEYS.map((j) => (
                <div key={j.name} className="grid grid-cols-4 items-center py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="col-span-2 flex items-center gap-2 pr-3">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${j.status === "active" ? "bg-emerald-400" : "bg-stone-300 dark:bg-stone-600"}`} />
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{j.name}</span>
                  </div>
                  <span className="text-xs font-medium text-stone-600 dark:text-stone-300 text-right">{j.sends > 0 ? j.sends.toLocaleString() : "—"}</span>
                  <span className="text-xs font-semibold text-right" style={{ color: j.rate > 0 ? "#59B277" : "#94a3b8" }}>{j.rate > 0 ? `${j.rate}%` : "—"}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {/* Live experiences / A-B */}
          <SectionCard title="Live Experiences">
            <div className="space-y-0">
              {LIVE_EXPERIENCES.map((e) => (
                <div key={e.name} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{e.name}</p>
                    <p className="text-[10px] text-stone-400">{e.variants} variants</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{ color: e.status === "winning" ? "#59B277" : "#94a3b8" }}>+{e.lift}%</p>
                    <p className="text-[10px] text-stone-400 capitalize">{e.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Top segments */}
          <SectionCard title="Top Segments">
            <div className="space-y-0">
              {TOP_SEGMENTS.map((s) => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">{s.name}</p>
                    <p className="text-[10px] text-stone-400">{s.members} members</p>
                  </div>
                  <span className="text-xs font-semibold shrink-0" style={{ color: "#0080FF" }}>{s.rate}%</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Agent performance */}
      <SectionCard title="Agent Performance">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500" style={{ borderColor: "var(--border)" }}>
                <th className="text-left pb-2.5 font-semibold">Agent</th>
                <th className="text-left pb-2.5 font-semibold">Type</th>
                <th className="text-right pb-2.5 font-semibold">Conversations</th>
                <th className="text-right pb-2.5 font-semibold">Resolution %</th>
                <th className="text-right pb-2.5 font-semibold">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((a) => (
                <tr key={a.name} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2.5 text-stone-700 dark:text-stone-300 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-white/8">
                        <Bot size={11} className="text-stone-500" />
                      </span>
                      {a.name}
                    </div>
                  </td>
                  <td className="py-2.5 text-stone-500">{a.type}</td>
                  <td className="py-2.5 text-right font-medium text-stone-700 dark:text-stone-200">{a.conversations.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span style={{ color: a.resolution >= 75 ? "#59B277" : "#f59e0b" }}>{a.resolution}%</span>
                  </td>
                  <td className="py-2.5 text-right font-semibold" style={{ color: a.csat >= 92 ? "#59B277" : "#94a3b8" }}>{a.csat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Anomaly detection */}
      <div>
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3">Anomaly Detection</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ANOMALIES.map((a) => {
            const isCritical = a.status === "critical";
            return (
              <div
                key={a.metric}
                className={`rounded-xl p-4 ${isCritical ? "bg-red-50 dark:bg-red-500/8 border-red-200 dark:border-red-500/20" : "bg-amber-50 dark:bg-amber-500/8 border-amber-200 dark:border-amber-500/20"}`}
                style={{ border: "1px solid" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCritical
                    ? <AlertCircle size={13} className="text-red-500 shrink-0" />
                    : <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  }
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${isCritical ? "text-red-500" : "text-amber-500"}`}>
                    {a.status}
                  </span>
                  <span className="ml-auto text-[10px] text-stone-400">{a.ago}</span>
                </div>
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-200 mb-2">{a.metric}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-bold leading-none ${isCritical ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>{a.actual}</span>
                  <span className="text-xs font-medium" style={{ color: isCritical ? "#ef4444" : "#f59e0b" }}>{a.change}</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">Expected {a.expected}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Analytics dashboard ───────────────────────────────────────────────────────

function AnalyticsDashboard() {
  return (
    <div className="px-6 pt-6 pb-8 space-y-5 animate-fade-up">
      <Greeting />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={DollarSign}   label="Monthly recurring revenue" value="$42.8k"  change="+8.3%"  />
        <MiniStat icon={TrendingDown} label="Churn rate"                value="2.1%"    change="-0.4pp" accent="#26a269" />
        <MiniStat icon={Users}        label="Avg revenue per user"      value="$156"    change="+3.2%"  />
        <MiniStat icon={BarChart3}    label="Custom boards created"     value="14"      change="+4"     />
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

      {/* Conversion funnel + Attribution */}
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
      </div>

      {/* RFM distribution */}
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

      {/* Subscription usage */}
      <SectionCard title="Subscription Usage">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    <div className="px-6 pt-6 pb-8 space-y-5 animate-fade-up">
      <Greeting />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={Briefcase}  label="Pipeline value"           value="$284k"  change="+12%"  />
        <MiniStat icon={ShoppingCart} label="Deals closed this month" value="18"     change="+22%"  />
        <MiniStat icon={Calendar}   label="Meetings scheduled"       value="43"     change="+8"    />
        <MiniStat icon={Target}     label="Conversion rate"          value="14.3%"  change="+1.4%" accent="#26a269" />
      </div>

      <div className="max-w-2xl"><SalesSetupChecklist /></div>

      <div>
        <div className="-ml-4 mb-4"><DateRangePicker /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
          {SALES_METRICS.map((m) => (
            <MetricCard key={m.id} icon={m.icon} label={m.label} value={m.value} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title="Pipeline by Stage">
          <div className="space-y-3">
            {PIPELINE_STAGES.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-stone-600 dark:text-stone-400">{s.stage}</span>
                <div className="flex-1 bg-stone-100 dark:bg-white/8 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400 w-6 text-right">{s.count}</span>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-14 text-right">${(s.value / 1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Top Opportunities">
          <div className="space-y-0">
            {TOP_OPPORTUNITIES.map((o, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-200 truncate">{o.company}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{o.deal}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-100">${o.value.toLocaleString()}</p>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">{o.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Meetings trend */}
      <SectionCard title="Meetings — Scheduled vs. Attended">
        <div className="flex items-center gap-5 mb-3">
          {[{ label: "Scheduled", color: "#0080FF" }, { label: "Attended", color: "#59B277" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-stone-500">
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={MEETINGS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="scheduled" fill="rgba(0,128,255,0.15)" radius={[2, 2, 0, 0]} name="Scheduled" maxBarSize={28} />
            <Line dataKey="attended" stroke="#59B277" strokeWidth={2} dot={{ fill: "#59B277", r: 3, strokeWidth: 0 }} name="Attended" />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>
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
      <ViewTabs tabs={HOME_TABS} activeTab={tab} onChange={setTab} />

      {tab === "design"    && <DesignDashboard     key="design"    />}
      {tab === "marketing" && <MarketingDashboard  key="marketing" />}
      {tab === "sales"     && <SalesTab            key="sales"     />}
      {tab === "analytics" && <AnalyticsDashboard  key="analytics" />}
    </div>
  );
}
