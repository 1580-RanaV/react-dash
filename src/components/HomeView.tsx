

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";

import Greeting from "./Greeting";
import ViewTabs from "./ViewTabs";
import InfoTooltip from "./InfoTooltip";
import HeroVideo from "./HeroVideo";
import RecentDesigns from "./RecentDesigns";
import RevenueMetricCard from "./MetricCard";
import {
  ComposedChart, Bar, Line, AreaChart, Area, LabelList, PieChart, Pie, Cell,
  XAxis, YAxis, ZAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend,
  ScatterChart, Scatter, ReferenceLine,
} from "recharts";
import {
  Globe, LayoutGrid, Activity, ChevronDown, Info,
  TrendingDown, TrendingUp, UserPlus, ShoppingCart, Users, HistoryIcon,
  Send, MailOpen, MousePointerClick, ChevronRight,
  DollarSign, Zap, Layers, Briefcase, Calendar, Palette, BarChart3, Target,
  AlertTriangle, AlertCircle, MessageSquare, Bell, Smartphone, Bot,
  ArrowDown, Check, Wand2, FileImage, Route,
  Clapperboard, PenTool, Shuffle, Package, Handshake, CalendarClock,
  Play, X, ClipboardList, Settings, Video, GripVertical, Plus,
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

const ANALYTICS_EVENT_TYPES = [
  { name: "Page viewed", category: "Page", value: "4.06K", lastSeen: "2m ago", icon: Globe },
  { name: "Session started", category: "Session", value: "2.79K", lastSeen: "2m ago", icon: Activity },
  { name: "CTA clicked", category: "Interaction", value: "842", lastSeen: "9m ago", icon: MousePointerClick },
  { name: "Form submitted", category: "Conversion", value: "186", lastSeen: "21m ago", icon: Send },
];

const ANALYTICS_DEVICE_MIX = [
  { name: "Desktop", value: 1420, display: "1.42K", pct: 76 },
  { name: "Mobile", value: 386, display: "386", pct: 21 },
  { name: "Tablet", value: 62, display: "62", pct: 3 },
];

const ANALYTICS_REVENUE_HEALTH = [
  { label: "Current MRR", value: "$25.2K", note: "+2.6% vs prior 30d", tone: "positive" },
  { label: "Subscribers", value: "1,940", note: "+84 net new", tone: "positive" },
  { label: "Trial to paid", value: "32.6%", note: "Needs lift", tone: "watch" },
  { label: "Churn", value: "2.1%", note: "-0.4pp", tone: "positive" },
];

const ANALYTICS_AUDIENCE_SPLIT = [
  { name: "New", value: 49440, display: "49.44K", pct: 75 },
  { name: "Returning", value: 16430, display: "16.43K", pct: 25 },
];

const ANALYTICS_AUDIENCE_RINGS = [
  { label: "DAU", value: "2.1K", pct: 18, tooltip: "Daily active users: unique users active in a single day." },
  { label: "WAU", value: "18.4K", pct: 58, tooltip: "Weekly active users: unique users active in the last 7 days." },
  { label: "MAU", value: "65.87K", pct: 92, tooltip: "Monthly active users: unique users active in the last 30 days." },
];

const ANALYTICS_MRR_TREND = [
  { month: "Oct", mrr: 15594 },
  { month: "Nov", mrr: 16766 },
  { month: "Dec", mrr: 18207 },
  { month: "Jan", mrr: 19597 },
  { month: "Feb", mrr: 20711 },
  { month: "Mar", mrr: 22052 },
  { month: "Apr", mrr: 22914 },
  { month: "May", mrr: 24656 },
  { month: "Jun", mrr: 25203 },
  { month: "Jul", mrr: 24895 },
  { month: "Aug", mrr: 24762 },
];

const ANALYTICS_ACQUISITION_MIX = [
  { name: "Email", value: 1700, display: "1.7K", pct: 55 },
  { name: "Icon", value: 1300, display: "1.3K", pct: 42 },
  { name: "Push", value: 92, display: "92", pct: 3 },
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
const DESIGN_LATEST_GENERATIONS = [
  { name: "Claude design - Email 1",         type: "Email", ago: "2 days ago",  icon: "email" },
  { name: "Flash sale SMS with Liquid vars", type: "SMS",   ago: "3 days ago",  icon: "sms"   },
  { name: "Raw HTML email output",           type: "Email", ago: "1 week ago",  icon: "email" },
  { name: "Brand character holding a can",   type: "Image", ago: "1 month ago", icon: "image" },
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
  { date: "Jul 9",  sends: 890,  opens: 379, clicks: 69  },
  { date: "Jul 10", sends: 760,  opens: 323, clicks: 59  },
  { date: "Jul 11", sends: 1130, opens: 481, clicks: 88  },
  { date: "Jul 12", sends: 1000, opens: 426, clicks: 78  },
];
const ENGAGEMENT_FUNNEL = [
  { stage: "Sent",      value: 24800 },
  { stage: "Delivered", value: 24106 },
  { stage: "Opened",    value: 10269 },
  { stage: "Clicked",   value:  1879 },
  { stage: "Converted", value:   453 },
];
const CHANNEL_MIX = [
  { channel: "Email",  icon: "email",  count: 18400, pct: 74, revenue: 86400, color: "#0080FF" },
  { channel: "SMS",    icon: "sms",    count:  3800, pct: 15, revenue: 34200, color: "#C37EE5" },
  { channel: "Push",   icon: "push",   count:  1700, pct:  7, revenue:  9600, color: "#59B277" },
  { channel: "In-app", icon: "inapp",  count:   900, pct:  4, revenue:  6100, color: "#FFC44D" },
];
const LATEST_JOURNEYS = [
  { name: "Welcome series",     sends24h:  86, status: "active" },
  { name: "Cart abandonment",   sends24h:  64, status: "active" },
  { name: "Re-engagement Q2",   sends24h:   0, status: "paused" },
  { name: "Trial expiry nudge", sends24h:  21, status: "active" },
];
const LATEST_EXPERIMENTS = [
  { name: "Hero CTA color",     variants: 3, status: "winning" },
  { name: "Pricing layout",     variants: 2, status: "running" },
  { name: "Onboarding tips",    variants: 2, status: "winning" },
  { name: "Checkout copy test", variants: 2, status: "running" },
];
const TOP_SEGMENTS = [
  { name: "High-intent visitors",   members: "4.2K", membersCount: 4200, rate: 24.1, change: "+12%" },
  { name: "Active trial users",     members: "1.1K", membersCount: 1100, rate: 38.7, change: "+8%"  },
  { name: "Newsletter subscribers", members: "8.1K", membersCount: 8100, rate:  6.2, change: "+4%"  },
  { name: "Churned (90-day)",       members: "2.4K", membersCount: 2400, rate:  3.1, change: "-6%"  },
];
const SEGMENT_COLORS = ["#0080FF", "#8B5CF6", "#14B8A6", "#F59E0B"];
const SEGMENT_QUADRANTS = [
  { title: "High engagement, smaller audience", hint: "Great for targeted experiments", bg: "rgba(139,92,246,0.08)", text: "#8B5CF6" },
  { title: "High engagement, large audience",   hint: "Scale with journeys",             bg: "rgba(0,128,255,0.08)",  text: "#0080FF" },
  { title: "Lower engagement",                  hint: "Nurture or win back",             bg: "rgba(245,158,11,0.08)", text: "#B45309" },
  { title: "Large audience, growth opportunity", hint: "Build engagement",                bg: "rgba(20,184,166,0.08)", text: "#0F766E" },
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
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex items-center gap-2 w-40 shrink-0 min-w-0">
        {prefix}
        <span className="truncate text-xs font-medium text-stone-700 dark:text-stone-300">{name}</span>
      </div>
      <div className="h-1.5 min-w-0 flex-1 rounded-full bg-stone-100 dark:bg-white/8">
        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.max(pct, 0.5)}%` }} />
      </div>
      <div className="flex w-15 shrink-0 items-center justify-end gap-2 text-xs font-semibold tabular-nums">
        <span className="text-blue-600 dark:text-blue-400">{typeof users === "number" ? users.toLocaleString() : users}</span>
        <span className="text-stone-400 dark:text-stone-500">$0</span>
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

function AcquisitionPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  payload,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  payload?: { name: string; display: string; pct: number };
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number" ||
    !payload
  ) {
    return null;
  }

  const radians = -midAngle * Math.PI / 180;
  const startX = cx + (outerRadius + 2) * Math.cos(radians);
  const startY = cy + (outerRadius + 2) * Math.sin(radians);
  const midX = cx + (outerRadius + 16) * Math.cos(radians);
  const midY = cy + (outerRadius + 16) * Math.sin(radians);
  const endX = midX + (Math.cos(radians) >= 0 ? 16 : -16);
  const textAnchor = Math.cos(radians) >= 0 ? "start" : "end";

  return (
    <g>
      <path d={`M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${midY}`} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.45" strokeWidth="1" />
      <text x={endX} y={midY - 5} textAnchor={textAnchor} fill="var(--foreground)" className="text-[10px] font-semibold">
        {payload.name} ({payload.display})
      </text>
      <text x={endX} y={midY + 9} textAnchor={textAnchor} fill="var(--muted-foreground)" className="text-[10px] font-medium">
        {payload.pct}%
      </text>
    </g>
  );
}

function SectionCard({
  title,
  description,
  tooltip,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      {title && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{title}</p>
            {tooltip && <InfoTooltip content={tooltip} />}
          </div>
          {description && <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Per-card "connected, not enough data yet" empty state ──────────────────────
//
// Shown inside a card's content area when homeState === "partial": the workspace
// has sources connected but doesn't have enough of *this specific card's* data
// yet. Distinct from EmptyHomeDashboard (nothing connected at all).

function CardEmptyState({
  text,
  actionLabel,
  actionHref,
  onAction,
}: {
  text: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const textWidth = 240;
  const logoSize = 144;
  const fadeMask = "linear-gradient(to bottom, black 0%, black 28%, transparent 52%)";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="relative mx-auto overflow-hidden" style={{ width: logoSize, height: logoSize / 2 }}>
        <img
          src="/hq.png"
          alt=""
          style={{
            width: logoSize,
            height: logoSize,
            position: "absolute",
            top: 0,
            left: 0,
            filter: "grayscale(1)",
            opacity: 0.55,
            WebkitMaskImage: fadeMask,
            maskImage: fadeMask,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: logoSize,
            height: logoSize,
            background: "linear-gradient(to top, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
            backgroundSize: "100% 90px",
            backgroundRepeat: "no-repeat",
            animation: "shimmer-sunrise 2s ease-in-out infinite alternate",
            WebkitMaskImage: "url(/hq.png)",
            maskImage: "url(/hq.png)",
            WebkitMaskSize: `${logoSize}px ${logoSize}px`,
            maskSize: `${logoSize}px ${logoSize}px`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            mixBlendMode: "overlay",
          }}
        />
      </div>
      <p className="-mt-0.5 text-xs leading-relaxed text-stone-400 dark:text-stone-500" style={{ width: textWidth }}>
        {text}
      </p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <a
            href={actionHref}
            className="mt-4 text-xs font-medium text-stone-600 underline decoration-dotted decoration-stone-400 underline-offset-4 transition-colors hover:text-stone-800 dark:text-stone-300 dark:decoration-stone-500 dark:hover:text-stone-100"
          >
            {actionLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 text-xs font-medium text-stone-600 underline decoration-dotted decoration-stone-400 underline-offset-4 transition-colors hover:text-stone-800 dark:text-stone-300 dark:decoration-stone-500 dark:hover:text-stone-100"
          >
            {actionLabel}
          </button>
        )
      )}
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
    body: "Your brand kit is 80% complete. The missing dark-bg logo means emails and dark-mode creatives render without proper branding. This affects an estimated 26% of your generated assets based on current usage patterns.",
    impact: "Consistent brand identity across all channels and dark themes",
    action: "Open Brand Kit",
  },
  {
    id: "social-ads",
    priority: "growth",
    tag: "Recipes",
    title: "Social Ads recipe is underutilized: only 9 runs",
    body: "Social Ads represent just 7% of your asset output (9 runs vs 48 for Packshots). Email banners are already well-covered at 31 runs. Expanding to social creatives is the fastest way to increase channel coverage with your existing brand kit.",
    impact: "Est. 3–5× increase in social content output",
    action: "Create Recipe",
  },
  {
    id: "credits",
    priority: "high",
    tag: "Credits",
    title: "Credits at 77%: schedule batches before your cycle ends",
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
    title: "Email bounce rate hit 4.8%: your sender reputation is at risk",
    body: "Detected 12 minutes ago: bounce rate is 4.8%, which is 3× above your expected range (0.9–1.6%). If sustained above 3% for 24 hours, major ESPs may throttle or block delivery. Most likely cause: stale list segment in the paused Re-engagement Q2 journey.",
    impact: "Protect deliverability and maintain your sender score",
    action: "Investigate Now",
  },
  {
    id: "send-volume",
    priority: "urgent",
    tag: "Send Volume",
    title: "Send volume is 76% below target: your pipeline is drying up",
    body: "Only 1,200 sends in the last measurement period vs an expected 4,600–5,800. The paused Re-engagement Q2 journey accounts for most of the gap. It was contributing ~2,100 sends when active. Revenue impact compounds every day this is unaddressed.",
    impact: "Restore expected send volume and re-engage your audience",
    action: "Resume Journey",
  },
  {
    id: "open-rate",
    priority: "high",
    tag: "Engagement",
    title: "Open rate dropped to 28.4%: time for a subject line refresh",
    body: "Open rate has declined 33% over 48 hours (from ~43% to 28.4%). Your last 3 campaigns followed similar \"[First name], don't miss...\" patterns. Subject fatigue is the likely culprit. A/B testing 2 new formats typically recovers 6–8 percentage points.",
    impact: "+6–8pp open rate improvement within 1–2 send cycles",
    action: "A/B Test Subjects",
  },
  {
    id: "ab-winner",
    priority: "high",
    tag: "A/B Testing",
    title: "Onboarding Tips A/B test has a clear winner: ship it now",
    body: "Your Onboarding Tips experience shows a +8.6% lift after 14+ days running, well past statistical significance. Every day the losing variant stays live, you're suppressing conversion by an estimated 3–4%. This is ready to ship today.",
    impact: "+8.6% conversion uplift on the onboarding flow",
    action: "Ship Variant",
  },
  {
    id: "sms-mix",
    priority: "growth",
    tag: "Channel Mix",
    title: "SMS is only 15% of sends: test it for cart abandonment",
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
    title: "Visitor→Paid rate is 1.5%, well below the 2.5–3.5% benchmark",
    body: "Of 18,400 visitors, only 274 convert to paid (1.5%). The steepest drop is Signups→Trial Started at 28.6% (840 of 2,940 signups). This points to onboarding friction. Fixing this single step could unlock the most growth available to you right now.",
    impact: "+$8k MRR at 3% conversion, the industry benchmark",
    action: "Audit Onboarding",
  },
  {
    id: "at-risk",
    priority: "urgent",
    tag: "Retention",
    title: "840 customers are At-Risk: intervene before they become Lost",
    body: "RFM analysis shows 840 formerly active customers have gone quiet. At your $156 ARPU, this cohort represents $131k in annual revenue exposure. A targeted win-back campaign now could save 20–30% of them before they permanently churn.",
    impact: "Est. $26–39k annual revenue recovered",
    action: "Create Win-Back",
  },
  {
    id: "trial-conversion",
    priority: "high",
    tag: "Trial",
    title: "Trial→Paid at 32.6% vs. 45–55% industry average",
    body: "840 trial users, 274 converted to paid (32.6%). Data consistently shows a drop-off cliff at day 7–10 for unconverted trials. Targeted in-app messages at day 7 and day 14 are the highest-ROI fix at this stage: low effort, measurable impact.",
    impact: "+12pp trial conversion = est. +$14k incremental MRR",
    action: "Set Up Nudges",
  },
  {
    id: "seo-organic",
    priority: "growth",
    tag: "Acquisition",
    title: "Organic search is your #1 channel: worth doubling down",
    body: "Organic search drives $42.4k in attributed revenue, 36% more than paid social ($31.2k) at near-zero marginal cost. Your top 2 blog posts drive 10% of total site traffic. A focused SEO sprint targeting 3–5 high-intent keywords could 2× organic traffic in 90 days.",
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
        <SectionCard title="Generation Activity: Last 14 Days" className="lg:col-span-2">
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
        <SectionCard title="Asset Types: This Week">
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


const ANALYTICS_FULL_KPIS: HomeBentoCard[] = [
  {
    id: "analytics-full-active-users",
    perspective: "summary",
    eyebrow: "Engagement",
    title: "Active users",
    value: "1.87K",
    body: "Users active in the last 30 days.",
    icon: Activity,
    signal: "-70%",
  },
  {
    id: "analytics-full-page-views",
    perspective: "summary",
    eyebrow: "Engagement",
    title: "Page views",
    value: "4.06K",
    body: "Tracked page views across sessions.",
    icon: Globe,
    signal: "+239%",
  },
  {
    id: "analytics-full-sessions",
    perspective: "summary",
    eyebrow: "Traffic",
    title: "Sessions",
    value: "2.79K",
    body: "User sessions in the last 30 days.",
    icon: BarChart3,
    signal: "+250%",
  },
  {
    id: "analytics-full-mrr",
    perspective: "summary",
    eyebrow: "Revenue",
    title: "Current MRR",
    value: "$25.2K",
    body: "Subscription MRR from connected revenue data.",
    icon: DollarSign,
    signal: "+2.6%",
  },
  {
    id: "analytics-full-events",
    perspective: "summary",
    eyebrow: "Events",
    title: "Events received",
    value: "1.84M",
    body: "Tracked product and website events.",
    icon: Zap,
    signal: "Live",
  },
];

const ANALYTICS_ACTIVITY_DATA = PAGE_VIEWS_DATA.map((item, index) => ({
  date: item.date,
  pageViews: item.value,
  sessions: SESSIONS_DATA[index]?.value ?? 0,
  activeUsers: ACTIVE_USERS_DATA[index]?.value ?? 0,
}));

function FunnelWaterfallChart({ steps }: { steps: { stage: string; value: number }[] }) {
  const chartWidth = 1000;
  const chartHeight = 172;
  const gap = 62;
  const stepWidth = (chartWidth - gap * (steps.length - 1)) / steps.length;
  const maxValue = Math.max(steps[0]?.value ?? 1, 1);
  const barMeta = steps.map((step, index) => {
    const height = Math.max(10, (step.value / maxValue) * chartHeight);
    return {
      ...step,
      index,
      x: index * (stepWidth + gap),
      y: chartHeight - height,
      height,
      priorPct: index === 0 ? null : (step.value / Math.max(steps[index - 1].value, 1)) * 100,
    };
  });

  return (
    <div className="overflow-hidden">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {barMeta.map((step) => (
          <div key={step.stage} className="min-w-0 border-l-2 border-blue-500 pl-2.5">
            <p className="truncate text-xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">{step.value.toLocaleString()}</p>
            <p className="mt-2 text-xs font-medium leading-tight text-stone-600 dark:text-stone-400">
              {step.stage}
            </p>
            <p className="mt-1 text-[11px] font-medium leading-tight text-stone-500 dark:text-stone-500">
              {step.priorPct === null ? "First step" : `${step.priorPct.toFixed(1)}% of prior`}
            </p>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 34}`} className="mt-4 h-[230px] w-full overflow-visible" role="img" aria-label="Conversion funnel waterfall">
        {barMeta.slice(0, -1).map((step, index) => {
          const next = barMeta[index + 1];
          return (
            <polygon
              key={`connector-${step.stage}`}
              points={`${step.x + stepWidth},${step.y} ${next.x},${next.y} ${next.x},${chartHeight} ${step.x + stepWidth},${chartHeight}`}
              fill="rgba(0,128,255,0.28)"
            />
          );
        })}
        {barMeta.map((step, index) => (
          <g key={step.stage}>
            {step.y > 0 && (
              <rect
                x={step.x}
                y={0}
                width={stepWidth}
                height={step.y}
                rx={4}
                fill="rgba(0,128,255,0.14)"
              />
            )}
            <rect
              x={step.x}
              y={step.y}
              width={stepWidth}
              height={step.height}
              rx={index === 0 ? 4 : 3}
              fill="#0080FF"
              opacity={0.82}
            />
            <text
              x={step.x + stepWidth / 2}
              y={chartHeight + 25}
              textAnchor="middle"
              className="fill-stone-500 dark:fill-stone-400"
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              Step {index + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

const ANALYTICS_DONUT_COLORS = ["#0080FF", "#6BAEFF", "#A7CCFF", "#D7E9FF"];

function DistributionDonutCard({
  title,
  body,
  tooltip,
  data,
}: {
  title: string;
  body: string;
  tooltip?: string;
  data: { name: string; value: number | string; pct: number }[];
}) {
  const chartData = data.map((item) => ({
    name: item.name,
    value: typeof item.value === "number" ? item.value : Number.parseFloat(String(item.value).replace(/[^0-9.]/g, "")) || item.pct,
    pct: item.pct,
  }));
  const topItem = data[0];

  return (
    <SectionCard>
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{body}</p>
      </div>
      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
        <div className="relative h-42 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                stroke="var(--content-bg)"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={ANALYTICS_DONUT_COLORS[index % ANALYTICS_DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm font-semibold leading-none text-stone-900 dark:text-stone-100">Top</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-stone-400">{topItem?.pct}% share</p>
          </div>
        </div>
        <div className="space-y-2">
          {data.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ANALYTICS_DONUT_COLORS[index % ANALYTICS_DONUT_COLORS.length] }} />
                <span className="truncate text-xs font-medium text-stone-700 dark:text-stone-300">{item.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs tabular-nums">
                <span className="font-semibold text-stone-800 dark:text-stone-100">{typeof item.value === "number" ? item.value.toLocaleString() : item.value}</span>
                <span className="w-8 text-right text-stone-400">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function AnalyticsFullDashboard({ noData = false }: { noData?: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const videoSrc = TAB_VIDEOS.analytics;

  return (
    <div className="max-w-full overflow-x-hidden px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />}

      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={() => setChecklistOpen((value) => !value)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            style={{ borderColor: "var(--border)" }}
          >
            <Play size={11} className="fill-current text-blue-500" />
            Watch intro
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
        <AnalyticsSetupChecklist />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <SectionCard className="flex min-h-[390px] flex-col">
          <div className="mb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Activity</p>
                <InfoTooltip content="Used to see overall usage direction from page views, sessions, and active users in the last 30 days." />
              </div>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Page views, sessions, and active users over the last 30 days.</p>
            </div>
          </div>
          {noData ? (
            <CardEmptyState text="Page views, sessions, and active users will appear here once your tracked events start flowing in." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={268}>
                <ComposedChart data={ANALYTICS_ACTIVITY_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="pageViews" stroke="#0080FF" strokeWidth={2} fill="rgba(0,128,255,0.08)" dot={false} name="Page views" />
                  <Line type="monotone" dataKey="sessions" stroke="#7C3AED" strokeWidth={1.8} dot={false} name="Sessions" />
                  <Line type="monotone" dataKey="activeUsers" stroke="#F59E0B" strokeWidth={1.8} dot={false} name="Active users" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "Page views", color: "#0080FF" },
                  { label: "Sessions", color: "#7C3AED" },
                  { label: "Active users", color: "#F59E0B" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <span className="h-3 w-3 rounded" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Audience quality"
          description="Shows if usage is healthy by combining daily, weekly, monthly, new, and returning users."
          tooltip="Used to understand audience stickiness without opening the full Engagement board."
          className="flex min-h-[390px] flex-col"
        >
          {noData ? (
            <CardEmptyState text="Daily, weekly, and monthly active users will show up here once enough activity comes in." />
          ) : (
          <div className="flex h-full flex-col justify-center gap-6 pb-4">
            <div className="grid grid-cols-3 gap-4">
              {ANALYTICS_AUDIENCE_RINGS.map((item) => {
                const ringData = [
                  { name: item.label, value: item.pct },
                  { name: "Remaining", value: 100 - item.pct },
                ];
                return (
                  <div key={item.label} className="flex items-center justify-center">
                    <div className="relative h-32 w-32 xl:h-36 xl:w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ringData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="68%"
                            outerRadius="92%"
                            startAngle={90}
                            endAngle={-270}
                            paddingAngle={2}
                            stroke="var(--content-bg)"
                            strokeWidth={3}
                          >
                            <Cell fill="#0080FF" />
                            <Cell fill="rgba(0,128,255,0.18)" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <p className="text-xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">{item.value}</p>
                        <span className="mt-1.5 flex items-center justify-center gap-1">
                          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-stone-400">{item.label}</span>
                          <InfoTooltip content={item.tooltip} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-4 pt-1">
              {[
                { label: "New", value: "49.44K", note: "75%", tooltip: "Users whose first tracked activity happened in the last 30 days." },
                { label: "Returning", value: "16.43K", note: "25%", tooltip: "Users who were active before and came back during the last 30 days." },
                { label: "DAU / MAU stickiness", value: "3.2%", note: "", tooltip: "Average daily active users divided by monthly active users. Higher means users return more often." },
              ].map((item) => (
                <div key={item.label} className="min-h-[86px] rounded-lg px-4 py-3" style={{ background: "var(--muted)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1">
                        <p className="truncate text-xs font-medium text-stone-500 dark:text-stone-400">{item.label}</p>
                        <InfoTooltip content={item.tooltip} />
                      </div>
                      <p className="mt-2 text-base font-semibold leading-none text-stone-900 dark:text-stone-100">{item.value}</p>
                    </div>
                    {item.note && <span className="shrink-0 text-xs font-semibold text-stone-400">{item.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </SectionCard>

        <SectionCard
          title="Revenue pulse"
          description="Shows whether subscription revenue is growing, leaking, or on track this month."
          tooltip="Used as the quick subscription health check from MRR, subscriber, churn, and NRR data."
          className="flex min-h-[460px] flex-col"
        >
          {noData ? (
            <CardEmptyState
              text="MRR, subscribers, and NRR will appear here once Stripe starts syncing subscription activity."
              actionLabel="Check integrations"
              actionHref="/integrations"
            />
          ) : (
          <div className="flex h-full flex-col justify-center gap-6 pb-10">
            <div className="relative">
              <div className="absolute left-0 top-0 z-10">
                <p className="text-3xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">$24.76K</p>
                <p className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">Current MRR · Aug 2026</p>
              </div>
              <div className="absolute right-0 top-0 z-10">
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-500 dark:bg-red-500/10 dark:text-red-300">-$132.23</span>
              </div>
              <div className="h-48 pt-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_MRR_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.45} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}K`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="mrr" stroke="#0080FF" strokeWidth={2.4} fill="rgba(0,128,255,0.12)" dot={false} activeDot={{ r: 4, fill: "#0080FF", strokeWidth: 0 }} name="MRR" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { label: "Subscribers", value: "2,219", note: "Net -7", tooltip: "Active paid subscribers from connected Stripe subscription data.", tone: "neutral" },
                { label: "Net movement", value: "-$132.23", note: "Churn higher", tooltip: "Month-to-date MRR change after new business and churn.", tone: "negative" },
                { label: "NRR", value: "98.9%", note: "+4.4pp", tooltip: "Net revenue retention after expansion, contraction, and churn.", tone: "positive" },
              ].map((item) => (
                <div key={item.label} className="min-h-[90px] rounded-lg px-4 py-3.5" style={{ background: "var(--muted)" }}>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-xs font-medium text-stone-500 dark:text-stone-400">{item.label}</p>
                    <InfoTooltip content={item.tooltip} />
                  </div>
                  <p className={`mt-2 text-base font-semibold leading-none ${item.tone === "negative" ? "text-red-500 dark:text-red-300" : "text-stone-900 dark:text-stone-100"}`}>{item.value}</p>
                  <p className="mt-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
          )}
        </SectionCard>

        <SectionCard
          title="Acquisition mix"
          description="Shows where useful traffic is coming from and which source/page is tied to revenue."
          tooltip="Used to summarize Traffic board source and page data without repeating top-10 tables."
          className="flex min-h-[390px] flex-col overflow-hidden"
        >
          {noData ? (
            <CardEmptyState text="Traffic channels will rank here once sessions include referrer or UTM data." />
          ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 pb-3">
            <div className="h-64 w-full max-w-[440px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ANALYTICS_ACQUISITION_MIX}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={82}
                    innerRadius={0}
                    paddingAngle={2}
                    stroke="var(--content-bg)"
                    strokeWidth={3}
                    labelLine={false}
                    label={<AcquisitionPieLabel />}
                  >
                    {ANALYTICS_ACQUISITION_MIX.map((entry, index) => (
                      <Cell key={entry.name} fill={ANALYTICS_DONUT_COLORS[index % ANALYTICS_DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex w-full max-w-[420px] items-center justify-center gap-5 pt-1">
              {ANALYTICS_ACQUISITION_MIX.map((item, index) => (
                <div key={item.name} className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ANALYTICS_DONUT_COLORS[index % ANALYTICS_DONUT_COLORS.length] }} />
                  <p className="truncate text-xs font-semibold text-stone-800 dark:text-stone-200">{item.name} <span className="font-medium text-stone-500 dark:text-stone-400">({item.display})</span></p>
                </div>
              ))}
            </div>
          </div>
          )}
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
] as const;

type HomeTabKey = typeof HOME_TABS[number]["key"];
const HOME_TAB_VISIBILITY_KEY = "intempt:home-visible-tabs";

function readVisibleHomeTabs(): HomeTabKey[] {
  try {
    const stored = JSON.parse(localStorage.getItem(HOME_TAB_VISIBILITY_KEY) ?? "[]");
    const valid = new Set(HOME_TABS.map((tab) => tab.key));
    const filtered = Array.isArray(stored) ? stored.filter((key): key is HomeTabKey => valid.has(key)) : [];
    return filtered.length ? filtered : HOME_TABS.map((tab) => tab.key);
  } catch {
    return HOME_TABS.map((tab) => tab.key);
  }
}

function HomeTabsHeader({
  activeTab,
  onChange,
  visibleTabs,
  onVisibleTabsChange,
}: {
  activeTab: HomeTabKey;
  onChange: (key: HomeTabKey) => void;
  visibleTabs: HomeTabKey[];
  onVisibleTabsChange: (keys: HomeTabKey[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const visibleSet = new Set(visibleTabs);
  const tabs = HOME_TABS.filter((tab) => visibleSet.has(tab.key));
  const allVisible = visibleTabs.length === HOME_TABS.length;

  function setVisible(next: HomeTabKey[]) {
    const normalized = next.length ? next : [activeTab];
    localStorage.setItem(HOME_TAB_VISIBILITY_KEY, JSON.stringify(normalized));
    onVisibleTabsChange(normalized);
  }

  function toggleTab(key: HomeTabKey) {
    if (visibleSet.has(key)) {
      setVisible(visibleTabs.filter((tab) => tab !== key));
      return;
    }
    setVisible(HOME_TABS.map((tab) => tab.key).filter((tab) => tab === key || visibleSet.has(tab)));
  }

  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-3 shrink-0">
      <ViewTabs tabs={tabs} activeTab={activeTab} onChange={onChange} className="flex items-center gap-1 min-w-0 flex-wrap" />
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setOpen((value) => !value)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              open || !allVisible
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/6 dark:hover:text-stone-200"
            }`}
            title="Choose home tabs"
          >
            <Settings size={15} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div
                className="absolute right-0 top-11 z-50 w-56 rounded-xl py-1 shadow-lg"
                style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
              >
                <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 dark:text-stone-500">
                  Show home tabs
                </p>
                <button
                  onClick={() => setVisible(HOME_TABS.map((tab) => tab.key))}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                    style={{ background: allVisible ? "#0080FF" : "transparent", border: allVisible ? "none" : "1.5px solid var(--border)" }}
                  >
                    {allVisible && <Check size={10} className="text-white" />}
                  </span>
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-200">All</span>
                </button>
                <div className="my-1" style={{ borderTop: "1px solid var(--border)" }} />
                {HOME_TABS.map((tab) => {
                  const visible = visibleSet.has(tab.key);
                  return (
                    <button
                      key={tab.key}
                      onClick={() => toggleTab(tab.key)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                        style={{ background: visible ? "#0080FF" : "transparent", border: visible ? "none" : "1.5px solid var(--border)" }}
                      >
                        {visible && <Check size={10} className="text-white" />}
                      </span>
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-200">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type HomeMockState = "empty" | "partial" | "full";

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
      { id: "deals-won", perspective: "summary", eyebrow: "Deals", title: "Deals won this week", value: "4", body: "4 deals moved to Closed Won, $68k in recognized revenue.", icon: Handshake, signal: "$68k" },
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
  const signalNegative = card.signal?.trim().startsWith("-");
  const signalPositive = card.signal?.trim().startsWith("+");
  const signalClass = signalNegative
    ? "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400"
    : signalPositive
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300"
      : "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300";

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
          {card.signal && <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${signalClass}`}>{card.signal}</span>}
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
  docsHref,
  docsText = "Read docs",
  logos = [{ kind: "js" }, { kind: "brand", domain: "stripe.com", alt: "Stripe" }] as EmptySourceLogo[],
}: {
  className?: string;
  title?: string;
  body?: string;
  href?: string;
  linkText?: string;
  docsHref?: string;
  docsText?: string;
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
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          <a
            href={href}
            className="inline-flex text-xs font-medium text-stone-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            {linkText}
          </a>
          {docsHref && (
            <a
              href={docsHref}
              className="inline-flex text-xs font-medium text-stone-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              {docsText}
            </a>
          )}
        </div>
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
  welcome: string;
  title: string;
  body: string;
  href: string;
  linkText: string;
  logos: EmptySourceLogo[];
}> = {
  design: {
    welcome: "Set up your brand so every generation feels on-brand.",
    title: "Set up your brand kit",
    body: "Add logo, colors, fonts, and product assets to unlock design workflows.",
    href: "/brand-kit",
    linkText: "Open brand kit",
    logos: [{ kind: "icon", icon: Palette }, { kind: "icon", icon: FileImage }],
  },
  marketing: {
    welcome: "Connect a source and this page fills in with real activity.",
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
    welcome: "Connect your calendar and meetings start showing up right here.",
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
    welcome: "Connect a source and this page turns into a live dashboard.",
    title: "Connect analytics sources",
    body: "Connect tools like JS SDK and Stripe to capture product activity and unlock revenue insights.",
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
  const videoSrc = TAB_VIDEOS[tab] ?? TAB_VIDEOS.analytics;
  const videoId = TAB_VIDEO_IDS[tab] ?? TAB_VIDEO_IDS.analytics;
  const setup = EMPTY_HOME_SETUP[tab] ?? EMPTY_HOME_SETUP.analytics;
  const checklist = TAB_CHECKLIST[tab] ?? TAB_CHECKLIST.analytics;

  return (
    <div className="flex min-h-140 shrink-0 flex-col items-center justify-center px-6 py-10 animate-fade-up">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <Greeting />
          <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">{setup.welcome}</p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
          {inlinePlaying ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={videoSrc}
              title={`${tab} setup overview`}
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

        {checklist}

        <AnalyticsIntegrationsCard
          title={setup.title}
          body={setup.body}
          href={setup.href}
          linkText={setup.linkText}
          docsHref="https://intempt.com/docs"
          logos={setup.logos}
        />
      </div>
    </div>
  );
}

// ── Marketing homepage ────────────────────────────────────────────────────────

function MarketingStatusPill({ status }: { status: string }) {
  const isActive = status === "active" || status === "winning";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      isActive
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300"
        : "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-400"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-stone-400"}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function MarketingChannelPieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  payload,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  payload?: { channel: string; pct: number; revenue: number };
}) {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number" ||
    !payload
  ) {
    return null;
  }
  const radians = -midAngle * Math.PI / 180;
  const startX = cx + (outerRadius + 2) * Math.cos(radians);
  const startY = cy + (outerRadius + 2) * Math.sin(radians);
  const midX = cx + (outerRadius + 16) * Math.cos(radians);
  const midY = cy + (outerRadius + 16) * Math.sin(radians);
  const endX = midX + (Math.cos(radians) >= 0 ? 16 : -16);
  const textAnchor = Math.cos(radians) >= 0 ? "start" : "end";

  return (
    <g>
      <path d={`M ${startX} ${startY} L ${midX} ${midY} L ${endX} ${midY}`} fill="none" stroke="var(--muted-foreground)" strokeOpacity="0.45" strokeWidth="1" />
      <text x={endX} y={midY - 5} textAnchor={textAnchor} fill="var(--foreground)" className="text-[10px] font-semibold">
        {payload.channel} ({payload.pct}%)
      </text>
      <text x={endX} y={midY + 9} textAnchor={textAnchor} fill="var(--muted-foreground)" className="text-[10px] font-medium">
        ${(payload.revenue / 1000).toFixed(1)}K rev
      </text>
    </g>
  );
}

function MarketingChannelMixCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard
      title="Channel mix"
      description="Share of sends and attributed revenue across active channels over the last 30 days."
      tooltip="Used to see which send channels carry volume versus which ones actually convert to revenue."
      className="flex min-h-[390px] flex-col overflow-hidden"
    >
      {noData ? (
        <CardEmptyState text="Channel share will appear here once you send across email, SMS, push, or in-app." />
      ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="h-64 w-full max-w-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CHANNEL_MIX}
                dataKey="count"
                nameKey="channel"
                cx="50%"
                cy="50%"
                outerRadius={82}
                innerRadius={0}
                paddingAngle={2}
                stroke="var(--content-bg)"
                strokeWidth={3}
                labelLine={false}
                label={<MarketingChannelPieLabel />}
              >
                {CHANNEL_MIX.map((entry) => (
                  <Cell key={entry.channel} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-nowrap items-center justify-center gap-5 overflow-x-auto pt-1">
          {CHANNEL_MIX.map((c) => (
            <div key={c.channel} className="flex shrink-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded" style={{ background: c.color }} />
              <p className="whitespace-nowrap text-xs font-semibold text-stone-800 dark:text-stone-200">
                {c.channel} <span className="font-medium text-stone-500 dark:text-stone-400">({c.count.toLocaleString()})</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      )}
    </SectionCard>
  );
}

function MarketingSendPerformanceCard({ noData = false }: { noData?: boolean }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const toggleSeries = (dataKey?: string) => {
    if (!dataKey) return;
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  return (
    <SectionCard
      title="Send performance"
      description="Daily delivery volume and response quality across all channels over the last 30 days."
      tooltip="Used to see overall send health. Click a series in the legend to isolate it."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Sends, opens, and clicks will chart here once your first messages go out."
          actionLabel="Create journey"
          actionHref="/journeys"
        />
      ) : (
      <div className="flex flex-1 flex-col justify-center gap-3">
        <ResponsiveContainer width="100%" height={268}>
          <AreaChart data={SENDS_CHART_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="sends" hide={hidden.has("sends")} stroke="#0080FF" strokeWidth={1.5} fill="rgba(0,128,255,0.06)" dot={false} name="Sends" />
            <Area type="monotone" dataKey="opens" hide={hidden.has("opens")} stroke="#64748b" strokeWidth={1.5} fill="rgba(100,116,139,0.06)" dot={false} name="Opens" />
            <Area type="monotone" dataKey="clicks" hide={hidden.has("clicks")} stroke="#16a34a" strokeWidth={1.5} fill="rgba(22,163,74,0.06)" dot={false} name="Clicks" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            { key: "sends", label: "Sends", color: "#0080FF" },
            { key: "opens", label: "Opens", color: "#64748b" },
            { key: "clicks", label: "Clicks", color: "#16a34a" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => toggleSeries(item.key)}
              className={`flex items-center gap-2 text-sm transition-opacity ${hidden.has(item.key) ? "opacity-40" : "text-stone-600 dark:text-stone-300"}`}
            >
              <span className="h-3 w-3 rounded" style={{ background: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
      )}
    </SectionCard>
  );
}

function MarketingCountBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-400">
      {children}
    </span>
  );
}

function MarketingLatestJourneysCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard
      title="Latest journeys"
      description="Your 4 most recent automated journeys and how much they sent in the last 24 hours."
      tooltip="Used to see which journeys are actively sending right now versus paused or quiet."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Build an automated journey to see send activity show up here."
          actionLabel="Create journey"
          actionHref="/journeys"
        />
      ) : (
      <div className="flex flex-1 flex-col justify-center">
        {LATEST_JOURNEYS.map((j) => (
          <div key={j.name} className="flex items-center justify-between gap-3 border-b py-3.5 last:border-0" style={{ borderColor: "var(--border)" }}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(0,128,255,0.08)" }}>
                <Route size={15} className="text-blue-500" />
              </span>
              <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{j.name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <MarketingCountBadge>{j.sends24h.toLocaleString()} sends</MarketingCountBadge>
              <MarketingStatusPill status={j.status} />
            </div>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}

function MarketingLatestExperimentsCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard
      title="Latest experiments"
      description="Your 4 most recent experiments and how many variants each is testing."
      tooltip="Used to see what's actively being tested right now and how many variants are in play."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Launch an A/B test or personalization to see it show up here."
          actionLabel="Create experience"
          actionHref="/experiences"
        />
      ) : (
      <div className="flex flex-1 flex-col justify-center">
        {LATEST_EXPERIMENTS.map((e) => (
          <div key={e.name} className="flex items-center justify-between gap-3 border-b py-3.5 last:border-0" style={{ borderColor: "var(--border)" }}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(0,128,255,0.08)" }}>
                <Shuffle size={15} className="text-blue-500" />
              </span>
              <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{e.name}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <MarketingCountBadge>{e.variants} variants</MarketingCountBadge>
              <MarketingStatusPill status={e.status} />
            </div>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}

function RadialProgress({ value, size = 56, stroke = 5, showValue = true }: { value: number; size?: number; stroke?: number; showValue?: boolean }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, 100) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#0080FF"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{value}%</span>
        </div>
      )}
    </div>
  );
}

function MarketingSegmentsCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard
      title="Top segments"
      description="Members and engagement rate for the segments driving the most journey and experiment activity."
      tooltip="Used to see which audience segments are worth building the next journey or experiment around."
      className="flex min-h-[300px] flex-col"
    >
      {noData ? (
        <CardEmptyState text="Segments will rank here once there's enough activity to measure engagement." />
      ) : (
      <div className="flex flex-1 flex-col justify-center">
        {TOP_SEGMENTS.map((s, index) => (
          <div key={s.name} className="flex items-center gap-3 border-b py-3 last:border-0" style={{ borderColor: "var(--border)" }}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                index === 0 ? "text-white" : "text-blue-600 dark:text-blue-400"
              }`}
              style={{ background: index === 0 ? "#0080FF" : "rgba(0,128,255,0.1)" }}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{s.name}</p>
              <div className="mt-1">
                <MarketingCountBadge>{s.members} members</MarketingCountBadge>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <ChangeBadge change={s.change} />
              <RadialProgress value={s.rate} />
            </div>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}

function SegmentScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
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
      <p className="mb-1 text-sm font-semibold text-white">{s.name}</p>
      <p className="text-stone-300">{s.rate}% engagement · {s.members} members</p>
    </div>
  );
}

function MarketingSegmentMapCard() {
  return (
    <SectionCard
      title="Segment engagement map"
      description="Engagement rate against audience size for your top segments, split into four action zones."
      tooltip="Used to spot which segments are worth a targeted experiment versus a broad journey."
      className="min-h-[420px]"
    >
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} />
          <XAxis
            type="number"
            dataKey="membersCount"
            name="Members"
            domain={[0, 10000]}
            ticks={[0, 2000, 4000, 6000, 8000, 10000]}
            tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000}k`)}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Members (audience size)", position: "insideBottom", dy: 18, fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            type="number"
            dataKey="rate"
            name="Engagement rate"
            unit="%"
            domain={[0, 50]}
            ticks={[0, 10, 20, 30, 40, 50]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Engagement rate", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }}
          />
          <ZAxis dataKey="membersCount" range={[500, 1800]} />
          <ReferenceLine x={5000} stroke="var(--border)" strokeDasharray="4 4" />
          <ReferenceLine y={20} stroke="var(--border)" strokeDasharray="4 4" />
          <Tooltip content={<SegmentScatterTooltip />} cursor={false} />
          <Scatter data={TOP_SEGMENTS} shape="circle">
            {TOP_SEGMENTS.map((s, index) => (
              <Cell key={s.name} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {TOP_SEGMENTS.map((s, index) => (
          <div key={s.name} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded" style={{ background: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }} />
            <p className="whitespace-nowrap text-xs font-semibold text-stone-800 dark:text-stone-200">
              {s.name} <span className="font-medium text-stone-500 dark:text-stone-400">({s.rate}% / {s.members})</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SEGMENT_QUADRANTS.map((q) => (
          <div key={q.title} className="rounded-lg px-3.5 py-3" style={{ background: q.bg }}>
            <p className="text-xs font-semibold leading-snug" style={{ color: q.text }}>{q.title}</p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{q.hint}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

type AnomalySeverity = "critical" | "warning";

type AnomalyMetric = {
  id: string;
  metric: string;
  severity: AnomalySeverity;
  expectedLow: string;
  expectedHigh: string;
  unit: string;
  value: string;
  change: string;
};

// Only send volume and open rate are included here — both roll up from fields
// Journeys already tracks (Sent, Opens). Bounce rate and unsubscribe rate aren't
// confirmed tracked fields, so they're left out rather than shown as fake anomalies.
const ANOMALY_METRICS: AnomalyMetric[] = [
  { id: "send-volume", metric: "Combined send volume across active journeys", severity: "critical", expectedLow: "4.6k", expectedHigh: "5.8k", unit: "sends", value: "1.2k",  change: "-76%" },
  { id: "open-rate",   metric: "Combined open rate across active journeys",   severity: "warning",  expectedLow: "40%",  expectedHigh: "46%",  unit: "",      value: "28.4%", change: "-33%" },
];

const ANOMALY_SEVERITY_STYLES: Record<AnomalySeverity, { text: string; bg: string; dot: string }> = {
  critical: { text: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/12",     dot: "bg-red-500"   },
  warning:  { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/12", dot: "bg-amber-500" },
};

function MarketingAnomalyRow({ item }: { item: AnomalyMetric }) {
  const style = ANOMALY_SEVERITY_STYLES[item.severity];
  return (
    <div className="flex items-center justify-between gap-3 border-b py-3 last:border-0" style={{ borderColor: "var(--border)" }}>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug text-stone-800 dark:text-stone-100">{item.metric}</p>
        <div className="mt-1.5">
          <MarketingCountBadge>
            Typical range: {item.expectedLow} – {item.expectedHigh}{item.unit ? ` ${item.unit}` : ""}
          </MarketingCountBadge>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${style.bg} ${style.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {item.severity}
        </span>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">Last 24h</p>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {item.value}{item.unit ? ` ${item.unit}` : ""}
          </p>
          <p className={`text-xs font-semibold ${style.text}`}>{item.change} vs. typical</p>
        </div>
      </div>
    </div>
  );
}

function MarketingAnomalyCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard className="flex h-full flex-col">
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Journey anomaly detection</p>
          <InfoTooltip content="Used to catch journey send volume or open rate moving outside its normal range, before it turns into a bigger problem." />
        </div>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Send volume and open rate across your active journeys, compared to their typical range.</p>
      </div>
      {noData ? (
        <CardEmptyState text="We'll flag unusual send volume or open rate here once there's enough send history." />
      ) : (
      <div className="flex flex-1 flex-col justify-center">
        {ANOMALY_METRICS.map((item) => (
          <MarketingAnomalyRow key={item.id} item={item} />
        ))}
      </div>
      )}
    </SectionCard>
  );
}

// ── Design homepage ────────────────────────────────────────────────────────────

const DESIGN_GENERATION_ICONS: Record<string, LucideIcon> = {
  email: MailOpen,
  sms: MessageSquare,
  image: FileImage,
};

function DesignLatestGenerationsCard({ noData = false }: { noData?: boolean }) {
  return (
    <SectionCard
      title="Latest generations"
      description="Your 4 most recent assets generated from Blu and the asset library."
      tooltip="Used to see what's been generated most recently across emails, SMS, and images."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Generate an email, image, or SMS with Blu to see it show up here."
          actionLabel="Open asset library"
          actionHref="/asset-library"
        />
      ) : (
      <div className="flex flex-1 flex-col justify-center">
        {DESIGN_LATEST_GENERATIONS.map((item) => {
          const Icon = DESIGN_GENERATION_ICONS[item.icon] ?? FileImage;
          return (
            <div key={item.name} className="flex items-center justify-between gap-3 border-b py-3.5 last:border-0" style={{ borderColor: "var(--border)" }}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(0,128,255,0.08)" }}>
                  <Icon size={15} className="text-blue-500" />
                </span>
                <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{item.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <MarketingCountBadge>{item.type}</MarketingCountBadge>
                <span className="text-xs text-stone-400">{item.ago}</span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </SectionCard>
  );
}

const DESIGN_REACH = {
  sends: 214000,
  opens: 66340,
  clicks: 9860,
};

function DesignReachCard({ noData = false }: { noData?: boolean }) {
  const { sends, opens, clicks } = DESIGN_REACH;
  const openRate = Math.round((opens / sends) * 100);
  const clickRate = Math.round((clicks / sends) * 1000) / 10;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}K` : `${n}`);

  return (
    <SectionCard
      title="Reach from generated assets"
      description="Reach and click-through where a generated asset was used."
      tooltip="Totals across all sends that include a Blu-generated email, image, or SMS."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Reach and click-through will show up here once a generated asset goes out."
          actionLabel="Open asset library"
          actionHref="/asset-library"
        />
      ) : (
      <div className="flex flex-1 items-center justify-center gap-10">
        {[
          { value: fmt(sends), label: "Reach", tooltip: "Total sends that include a Blu-generated asset." },
          { value: `${openRate}%`, label: "Open rate", tooltip: "Open rate on sends that include a Blu-generated asset." },
          { value: `${clickRate}%`, label: "Click rate", tooltip: "Click-through rate on sends that include a Blu-generated asset." },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-3xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">{item.value}</p>
            <span className="mt-2 flex items-center justify-center gap-1">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{item.label}</span>
              <InfoTooltip content={item.tooltip} />
            </span>
          </div>
        ))}
      </div>
      )}
    </SectionCard>
  );
}

const DESIGN_ASSET_USAGE = {
  generated: 214,
  usedInJourneys: 128,
};

function DesignAssetUsageCard({ noData = false }: { noData?: boolean }) {
  const { generated, usedInJourneys } = DESIGN_ASSET_USAGE;
  const usedPct = Math.round((usedInJourneys / generated) * 100);

  return (
    <SectionCard
      title="Generated vs. used"
      description="How many generated assets have actually been used."
      tooltip="Assets are counted as used once they're attached to a live or draft journey step."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Generated vs. used will show up here once you've generated a few assets."
          actionLabel="Open asset library"
          actionHref="/asset-library"
        />
      ) : (
      <div className="flex flex-1 items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">{generated}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Generated assets</p>
        </div>

        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Used", value: usedInJourneys },
                  { name: "Not used", value: generated - usedInJourneys },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="92%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                stroke="var(--content-bg)"
                strokeWidth={3}
              >
                <Cell fill="#0080FF" />
                <Cell fill="rgba(0,128,255,0.18)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <p className="text-4xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">
              {usedPct}%
            </p>
            <span className="mt-2.5 flex items-center justify-center gap-1">
              <span className="text-[10px] font-medium uppercase leading-tight text-stone-400">Used</span>
              <InfoTooltip content="Share of generated assets attached to at least one journey step." />
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">{usedInJourneys}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Used assets</p>
        </div>
      </div>
      )}
    </SectionCard>
  );
}

const DESIGN_ADOPTION_MIX = { uploaded: 47 };

function DesignAdoptionMixCard({ noData = false }: { noData?: boolean }) {
  const generatedByBlu = DESIGN_ASSET_USAGE.generated;
  const uploaded = DESIGN_ADOPTION_MIX.uploaded;
  const total = generatedByBlu + uploaded;
  const generatedPct = Math.round((generatedByBlu / total) * 100);

  return (
    <SectionCard
      title="Adoption mix"
      description="Share of your asset library generated by Blu versus manually uploaded."
      tooltip="Used to see how much of your asset library is AI generated versus manually uploaded."
      className="flex min-h-[390px] flex-col"
    >
      {noData ? (
        <CardEmptyState
          text="Adoption mix will show up here once you've generated a few assets."
          actionLabel="Open asset library"
          actionHref="/asset-library"
        />
      ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-2">
        <div className="flex items-center gap-1">
          <p className="text-4xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">
            {generatedPct}%
          </p>
          <InfoTooltip content="Share of your asset library created with Blu rather than uploaded manually." />
        </div>
        <p className="-mt-2 text-xs font-medium uppercase tracking-[0.08em] text-stone-400">Generated by Blu</p>

        <div className="w-full max-w-sm">
          <div className="flex h-3.5 w-full overflow-hidden rounded-full" style={{ background: "var(--muted)" }}>
            <div className="h-full" style={{ width: `${generatedPct}%`, background: "#0080FF" }} />
            <div className="h-full" style={{ width: `${100 - generatedPct}%`, background: "rgba(0,128,255,0.35)" }} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "#0080FF" }} />
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Generated by Blu</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{generatedByBlu} assets</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right">
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Manually uploaded</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">{uploaded} assets</p>
              </div>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "rgba(0,128,255,0.35)" }} />
            </div>
          </div>
        </div>
      </div>
      )}
    </SectionCard>
  );
}

function DesignHomeDashboard({ noData = false }: { noData?: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const videoSrc = TAB_VIDEOS.design;

  return (
    <div className="max-w-full overflow-x-hidden px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />}

      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={() => setChecklistOpen((value) => !value)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Brand setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            style={{ borderColor: "var(--border)" }}
          >
            <Play size={11} className="fill-current text-blue-500" />
            Watch intro
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
        <BrandSetupChecklist />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <DesignReachCard noData={noData} />
        <DesignAssetUsageCard noData={noData} />
        <DesignLatestGenerationsCard noData={noData} />
        <DesignAdoptionMixCard noData={noData} />
      </div>
    </div>
  );
}

function MarketingHomeDashboard({ noData = false }: { noData?: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const videoSrc = TAB_VIDEOS.marketing;

  return (
    <div className="max-w-full overflow-x-hidden px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />}

      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={() => setChecklistOpen((value) => !value)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            style={{ borderColor: "var(--border)" }}
          >
            <Play size={11} className="fill-current text-blue-500" />
            Watch intro
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
        <MarketingSetupChecklist />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MarketingSendPerformanceCard noData={noData} />
        <MarketingChannelMixCard noData={noData} />
        <MarketingLatestExperimentsCard noData={noData} />
        <MarketingLatestJourneysCard noData={noData} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <MarketingSegmentsCard noData={noData} />
        <MarketingAnomalyCard noData={noData} />
      </div>

      {/* <MarketingSegmentMapCard /> */}
    </div>
  );
}

// ── Sales homepage ─────────────────────────────────────────────────────────────

const SALES_MEETINGS_TREND = [
  { week: "Jun 9",  scheduled: 12, attended: 9  },
  { week: "Jun 16", scheduled: 15, attended: 13 },
  { week: "Jun 23", scheduled: 11, attended: 10 },
  { week: "Jun 30", scheduled: 14, attended: 12 },
  { week: "Jul 7",  scheduled: 9,  attended: 7  },
];

const SALES_PIPELINE = {
  valueWon: 186400,
  forecast: 240000,
  pipelineHealth: 72,
  winRate: 42,
  winRateChange: "+3%",
  lossRate: 18,
  lossRateChange: "-2%",
  maxWin: 24500,
};

type SalesTask = { id: string; title: string; due: string };

const SALES_OVERDUE_TASKS: SalesTask[] = [
  { id: "t1", title: "Follow up with FieldsUSA on pricing", due: "Jun 18" },
  { id: "t2", title: "Send renewal contract to Linea",      due: "Jun 18" },
  { id: "t3", title: "Update deal stage for Acme Corp",     due: "Jun 18" },
  { id: "t4", title: "Confirm demo attendees for Thursday", due: "Jun 18" },
];

const SALES_TODAY_TASKS: SalesTask[] = [
  { id: "t6", title: "Prep agenda for Linea renewal call", due: "Today" },
];

function SalesTaskRow({ task, overdue, done, onToggle }: { task: SalesTask; overdue: boolean; done: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <button
        onClick={onToggle}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
        style={{ borderColor: done ? "#0080FF" : "var(--border)", background: done ? "#0080FF" : "transparent" }}
        aria-label={done ? "Mark task incomplete" : "Mark task complete"}
      >
        {done && <Check size={10} className="text-white" />}
      </button>
      <GripVertical size={14} className="shrink-0 text-stone-300 dark:text-stone-600" />
      <p className={`min-w-0 flex-1 truncate text-sm ${done ? "text-stone-400 line-through" : "text-stone-800 dark:text-stone-100"}`}>
        {task.title}
      </p>
      <span className={`shrink-0 text-xs font-medium ${overdue && !done ? "text-red-500" : "text-stone-400"}`}>{task.due}</span>
    </div>
  );
}

function SalesTasksCard({ noData = false }: { noData?: boolean }) {
  const [overdueOpen, setOverdueOpen] = useState(true);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [todayTasks, setTodayTasks] = useState<SalesTask[]>(noData ? [] : SALES_TODAY_TASKS);
  const [newTask, setNewTask] = useState("");
  const overdueTasks = noData ? [] : SALES_OVERDUE_TASKS;
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDone = (id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    setTodayTasks((prev) => [...prev, { id: `custom-${Date.now()}`, title, due: "Today" }]);
    setNewTask("");
  };

  return (
    <SectionCard
      title="Tasks"
      description="Overdue and today's tasks across your deals and meetings."
      tooltip="Used to track outstanding to-dos without leaving Home. Add a task directly in the Today section."
      className="flex h-[390px] flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {overdueTasks.length > 0 && (
            <>
              <button onClick={() => setOverdueOpen((value) => !value)} className="flex items-center gap-2 py-2">
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Overdue</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                  {overdueTasks.length}
                </span>
                <ChevronDown size={14} className={`text-stone-400 transition-transform ${overdueOpen ? "" : "-rotate-90"}`} />
              </button>
              {overdueOpen && (
                <div>
                  {overdueTasks.map((task) => (
                    <SalesTaskRow key={task.id} task={task} overdue done={doneIds.has(task.id)} onToggle={() => toggleDone(task.id)} />
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-3 flex items-center gap-2 py-2">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Today</span>
            <span className="text-xs font-medium text-stone-400">{todayTasks.length}</span>
          </div>
          {todayTasks.length > 0 ? (
            <div>
              {todayTasks.map((task) => (
                <SalesTaskRow key={task.id} task={task} overdue={false} done={doneIds.has(task.id)} onToggle={() => toggleDone(task.id)} />
              ))}
            </div>
          ) : (
            noData && (
              <CardEmptyState
                text="No tasks yet."
                actionLabel="Create new task"
                onAction={() => inputRef.current?.focus()}
              />
            )
          )}
        </div>

        <div className="mt-3 flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)" }}>
          <Plus size={14} className="shrink-0 text-stone-400" />
          <input
            ref={inputRef}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
            placeholder="Add a task..."
            className="w-full min-w-0 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100"
          />
        </div>
      </div>
    </SectionCard>
  );
}

function SalesHomeDashboard({ noData = false }: { noData?: boolean }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const videoSrc = TAB_VIDEOS.sales;

  return (
    <div className="max-w-full overflow-x-hidden px-4 pb-4 pt-4 space-y-3 animate-fade-up">
      {videoOpen && videoSrc && <VideoOverlay src={videoSrc} onClose={() => setVideoOpen(false)} />}

      <div className="flex items-start justify-between gap-4">
        <Greeting />
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            onClick={() => setChecklistOpen((value) => !value)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              checklistOpen
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400"
                : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            }`}
            style={{ borderColor: "var(--border)" }}
            title="Setup checklist"
          >
            <ClipboardList size={14} />
          </button>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/6"
            style={{ borderColor: "var(--border)" }}
          >
            <Play size={11} className="fill-current text-blue-500" />
            Watch intro
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

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <SectionCard className="flex min-h-[390px] flex-col">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Coming up</p>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
              Meetings
            </span>
          </div>
          {noData ? (
            <CardEmptyState
              text="Book or sync a meeting to see it show up here."
              actionLabel="Open meetings"
              actionHref="/meetings"
            />
          ) : (
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
          )}
        </SectionCard>

        <SectionCard
          title="Meeting Attendance"
          description="Scheduled vs. completed meetings by week."
          tooltip="Derived from each meeting's status field. There's no dedicated attendance report yet, so this is aggregated client-side from your meetings list."
          className="flex min-h-[390px] flex-col"
        >
          {noData ? (
            <CardEmptyState
              text="Scheduled vs. completed meetings will chart here once you have meeting history."
              actionLabel="Open meetings"
              actionHref="/meetings"
            />
          ) : (
          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="flex items-center justify-center gap-4">
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
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={SALES_MEETINGS_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="scheduled" fill="rgba(0,128,255,0.15)" radius={[2, 2, 0, 0]} name="Scheduled" maxBarSize={28} />
                <Line dataKey="attended" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 3, strokeWidth: 0 }} name="Attended" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          )}
        </SectionCard>

        <SalesTasksCard noData={noData} />

        <SectionCard
          title="Pipeline"
          description="Deal value, win rate, and loss rate for open and closed deals this period."
          tooltip="Used to see how much revenue is currently in active deals and how efficiently they're closing."
          className="flex min-h-[390px] flex-col"
        >
          {noData ? (
            <CardEmptyState
              text="Deal value, win rate, and pipeline health will show up here once you add a deal."
              actionLabel="Open deals"
              actionHref="/deals"
            />
          ) : (
          <div className="flex flex-1 items-stretch gap-6">
            <div className="flex w-1/2 shrink-0 items-center justify-center">
              <div className="relative h-56 w-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Health", value: SALES_PIPELINE.pipelineHealth },
                        { name: "Remaining", value: 100 - SALES_PIPELINE.pipelineHealth },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="68%"
                      outerRadius="92%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={2}
                      stroke="var(--content-bg)"
                      strokeWidth={3}
                    >
                      <Cell fill="#0080FF" />
                      <Cell fill="rgba(0,128,255,0.18)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <p className="text-4xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">
                    {SALES_PIPELINE.pipelineHealth}
                  </p>
                  <span className="mt-2.5 flex items-center justify-center gap-1">
                    <span className="text-[10px] font-medium uppercase leading-tight text-stone-400">Pipeline health</span>
                    <InfoTooltip content="A 0 to 100 score summarizing deal velocity, win rate, and forecast coverage." />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center space-y-4">
              <div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-xl font-semibold leading-none tracking-tight text-stone-900 dark:text-stone-100">
                    ${(SALES_PIPELINE.valueWon / 1000).toFixed(1)}K
                  </p>
                  <span className="text-xs font-medium text-stone-400">of ${(SALES_PIPELINE.forecast / 1000).toFixed(0)}K forecast</span>
                </div>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Value won this period</p>
                <div className="mt-2 h-2 rounded-full bg-stone-100 dark:bg-white/8">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.min((SALES_PIPELINE.valueWon / SALES_PIPELINE.forecast) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {[
                { label: "Win rate", value: SALES_PIPELINE.winRate, change: SALES_PIPELINE.winRateChange, color: "#16a34a" },
                { label: "Loss rate", value: SALES_PIPELINE.lossRate, change: SALES_PIPELINE.lossRateChange, color: "#ef4444" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{item.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.value}%</span>
                      <ChangeBadge change={item.change} />
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-white/8">
                    <div className="h-2 rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--muted)" }}>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Largest deal won</span>
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">${(SALES_PIPELINE.maxWin / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default function HomeView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") ?? "analytics";
  const [requestedTab, previewState] = rawTab.split("/");
  const tab = HOME_TABS.some((t) => t.key === requestedTab)
    ? requestedTab as HomeTabKey
    : "analytics";
  const [visibleHomeTabs, setVisibleHomeTabs] = useState<HomeTabKey[]>(readVisibleHomeTabs);
  const activeTab: HomeTabKey = visibleHomeTabs.includes(tab) ? tab : visibleHomeTabs[0] ?? "analytics";
  const homeState: HomeMockState =
    previewState === "1" || previewState === "empty"
      ? "empty"
      : previewState === "partial"
        ? "partial"
        : "full";

  useEffect(() => {
    if (activeTab !== tab) navigate(`/home?tab=${activeTab}/${homeState}`, { replace: true });
  }, [activeTab, homeState, navigate, tab]);

  function setTab(key: HomeTabKey) {
    navigate(`/home?tab=${key}/${homeState}`, { replace: true });
  }

  // Pinboard manages its own scroll; other tabs scroll via the outer wrapper
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      <HomeTabsHeader
        activeTab={activeTab}
        onChange={setTab}
        visibleTabs={visibleHomeTabs}
        onVisibleTabsChange={setVisibleHomeTabs}
      />
      {homeState === "empty"
        ? <EmptyHomeDashboard key={`${activeTab}-empty`} tab={activeTab} />
        : activeTab === "design"
          ? <DesignHomeDashboard key="design" noData={homeState === "partial"} />
          : activeTab === "marketing"
            ? <MarketingHomeDashboard key="marketing" noData={homeState === "partial"} />
            : activeTab === "sales"
              ? <SalesHomeDashboard key="sales" noData={homeState === "partial"} />
              : <AnalyticsFullDashboard key="analytics-full" noData={homeState === "partial"} />
      }
    </div>
  );
}
