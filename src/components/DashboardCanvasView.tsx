

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import BackButton from "./BackButton";
import {
  ChevronLeft, ChevronRight, Filter, GripVertical,
  MoreHorizontal, Plus, Route, RotateCcw,
  Search, Shuffle, TrendingUp, Type, X, Repeat,
} from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

// ── Mock chart data ────────────────────────────────────────────────────────────

function makeData(base: number, variance: number) {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `Jun ${i + 3}`,
    v: Math.max(0, base + Math.sin(i * 1.2) * variance + Math.random() * variance * 0.4),
  }));
}

type CardDef = { id: number; title: string; x: number; y: number; w: number; h: number; data: { date: string; v: number }[] };

const INITIAL_CARDS: CardDef[] = [
  { id: 1, title: "User Registration Rate",           x: 40,  y: 100, w: 360, h: 280, data: makeData(0.10, 0.06) },
  { id: 2, title: "Total Visits VS View OrderPage %", x: 430, y: 100, w: 360, h: 280, data: makeData(0.70, 0.12) },
  { id: 3, title: "Registered User Vs New Trails %",  x: 820, y: 100, w: 360, h: 280, data: makeData(1.5,  1.8)  },
  { id: 4, title: "Total Visits VS New Trials %",     x: 40,  y: 430, w: 545, h: 280, data: makeData(0.2,  0.3)  },
  { id: 5, title: "OrderPage Visits vs New Trials",   x: 615, y: 430, w: 545, h: 280, data: makeData(0.2,  0.3)  },
];

// ── Existing items per category ────────────────────────────────────────────────

const EXISTING_ITEMS: Record<string, { title: string; date: string }[]> = {
  Insights: [
    { title: "Subscription type breakdown",            date: "Sep 19, 2025" },
    { title: "Page views by country",                  date: "Sep 19, 2025" },
    { title: "Top Menu Buttons Click",                 date: "Jan 20, 2026" },
    { title: "User Registration Rate",                 date: "Sep 18, 2025" },
    { title: "Subscribed broken down by Style Reference", date: "Oct 1, 2025" },
    { title: "Total sales Count",                      date: "Dec 26, 2025" },
    { title: "Total Visits VS View OrderPage %",       date: "Oct 15, 2025" },
    { title: "Trial Banner Mobile Click %",            date: "Nov 18, 2025" },
    { title: "Weekly active sessions",                 date: "Sep 18, 2025" },
    { title: "OrderPage Visits vs New Trials %",       date: "Oct 15, 2025" },
  ],
  Funnels: [
    { title: "Signup to Purchase Funnel",     date: "Oct 5, 2025"  },
    { title: "Onboarding Completion Rate",    date: "Sep 22, 2025" },
    { title: "Checkout Drop-off Analysis",    date: "Nov 3, 2025"  },
    { title: "Feature Adoption Funnel",       date: "Dec 10, 2025" },
    { title: "Mobile App Onboarding",         date: "Jan 8, 2026"  },
  ],
  Retention: [
    { title: "Weekly User Retention",     date: "Sep 30, 2025" },
    { title: "30-Day Cohort Retention",   date: "Oct 12, 2025" },
    { title: "Power User Retention",      date: "Nov 5, 2025"  },
    { title: "New User 7-Day Retention",  date: "Dec 1, 2025"  },
  ],
  "Journey Results": [
    { title: "Welcome Series Performance", date: "Oct 8, 2025"  },
    { title: "Re-engagement Campaign",     date: "Nov 15, 2025" },
    { title: "Onboarding Journey",         date: "Sep 25, 2025" },
    { title: "Upsell Journey Results",     date: "Jan 12, 2026" },
  ],
  "Experience Results": [
    { title: "Homepage A/B Test",            date: "Oct 20, 2025" },
    { title: "Pricing Page Experiment",      date: "Nov 28, 2025" },
    { title: "CTA Button Color Test",        date: "Dec 5, 2025"  },
    { title: "Checkout Flow Optimization",   date: "Jan 3, 2026"  },
  ],
};

const CATEGORY_ICON: Record<string, React.ReactNode> = {
  Insights:           <TrendingUp  size={14} className="text-blue-500 shrink-0" />,
  Funnels:            <Filter      size={14} className="text-blue-500 shrink-0" />,
  Retention:          <RotateCcw   size={14} className="text-blue-500 shrink-0" />,
  "Journey Results":  <Route       size={14} className="text-blue-500 shrink-0" />,
  "Experience Results": <Shuffle   size={14} className="text-blue-500 shrink-0" />,
};

// ── Chart card ─────────────────────────────────────────────────────────────────

function ChartCard({ card }: { card: CardDef }) {
  const [pos, setPos] = useState({ x: card.x, y: card.y });
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!drag.current) return;
      setPos({ x: drag.current.px + e.clientX - drag.current.sx, y: drag.current.py + e.clientY - drag.current.sy });
    }
    function onUp() { drag.current = null; }
    function onTouchMove(e: TouchEvent) {
      if (!drag.current || e.touches.length !== 1) return;
      const t = e.touches[0];
      setPos({ x: drag.current.px + t.clientX - drag.current.sx, y: drag.current.py + t.clientY - drag.current.sy });
    }
    function onTouchEnd() { drag.current = null; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const gradId = `cg${card.id}`;

  return (
    <div
      className="absolute rounded-2xl select-none"
      style={{
        left: pos.x, top: pos.y, width: card.w, height: card.h,
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 pt-3 pb-1 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          e.stopPropagation();
          drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
        }}
        onTouchStart={(e) => {
          if (e.touches.length !== 1) return;
          e.stopPropagation();
          const t = e.touches[0];
          drag.current = { sx: t.clientX, sy: t.clientY, px: pos.x, py: pos.y };
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical size={13} className="text-stone-300 dark:text-stone-600 shrink-0" />
          <TrendingUp size={13} className="text-blue-400 shrink-0" />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 truncate">{card.title}</span>
        </div>
        <button
          className="ml-2 shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      <div className="px-2" style={{ height: card.h - 70 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={card.data} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00AAFF" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#00AAFF" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={4} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={38} />
            <Area type="monotone" dataKey="v" stroke="#00AAFF" strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 pb-2">
        <span className="h-2 w-2 rounded-none shrink-0" style={{ background: "#00AAFF" }} />
        <span className="text-xs text-stone-400 dark:text-stone-500">(B/A)*100</span>
      </div>
    </div>
  );
}

// ── Add content drawer ─────────────────────────────────────────────────────────

type DrawerTab = "create" | "existing";

const ICON_BOX = "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400";

const CREATE_SECTIONS = [
  {
    heading: "REPORTS",
    items: [
      { icon: <TrendingUp size={16} />, label: "Insights",  sub: "Trends, metrics, and breakdowns"   },
      { icon: <Filter size={16} />,     label: "Funnels",   sub: "Multi-step conversion analysis"    },
      { icon: <RotateCcw size={16} />,  label: "Retention", sub: "Cohort retention heatmaps"         },
    ],
  },
  {
    heading: "CONTENT",
    items: [
      { icon: <Type size={16} />, label: "Text", sub: "Rich text notes and annotations" },
    ],
  },
];

const EXISTING_SECTIONS = [
  {
    heading: "REPORTS",
    items: [
      { icon: <TrendingUp size={16} />, label: "Insights",   sub: "Trends, metrics, and breakdowns" },
      { icon: <Filter size={16} />,     label: "Funnels",    sub: "Multi-step conversion analysis"  },
      { icon: <RotateCcw size={16} />,  label: "Retention",  sub: "Cohort retention heatmaps"       },
    ],
  },
  {
    heading: "ENGAGEMENT",
    items: [
      { icon: <Route size={16} />,   label: "Journey Results",    sub: "Journey performance metrics"     },
      { icon: <Shuffle size={16} />, label: "Experience Results", sub: "Experience & experiment results" },
    ],
  },
];

function AddContentDrawer({
  open,
  onClose,
  onAddCard,
}: {
  open: boolean;
  onClose: () => void;
  onAddCard: (title: string) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("create");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Reset drill-down when switching tabs
  useEffect(() => {
    setSelectedCategory(null);
    setSearch("");
  }, [tab]);

  // Reset when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedCategory(null);
      setSearch("");
    }
  }, [open]);

  const sections = tab === "create" ? CREATE_SECTIONS : EXISTING_SECTIONS;

  const listItems = selectedCategory ? (EXISTING_ITEMS[selectedCategory] ?? []) : [];
  const filteredItems = search.trim()
    ? listItems.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()))
    : listItems;

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}

      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "min(380px, calc(100vw - 16px))",
          background: "var(--content-bg)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Add content</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab bar — half and half */}
        <div className="flex shrink-0 border-b" style={{ borderColor: "var(--border)" }}>
          {(["create", "existing"] as DrawerTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px text-center ${
                tab === t
                  ? "border-blue-500 text-stone-900 dark:text-stone-100"
                  : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              }`}
            >
              {t === "create" ? "Create new" : "Add existing"}
            </button>
          ))}
        </div>

        {/* Drill-down: category item list */}
        {tab === "existing" && selectedCategory ? (
          <>
            {/* Back nav */}
            <div
              className="flex items-center gap-2 px-5 py-3 shrink-0 border-b text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                onClick={() => { setSelectedCategory(null); setSearch(""); }}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                <ChevronLeft size={14} />
                Back
              </button>
              <span className="text-stone-300 dark:text-stone-600">·</span>
              <span className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-100">
                {CATEGORY_ICON[selectedCategory]}
                {selectedCategory}
              </span>
            </div>

            {/* Search */}
            <div className="px-5 py-3 shrink-0">
              <div
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--border)" }}
              >
                <Search size={13} className="text-stone-400 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                  className="flex-1 text-sm bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-stone-400">No results</p>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div className="shrink-0 mt-0.5">{CATEGORY_ICON[selectedCategory]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug">{item.title}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">{item.date}</p>
                    </div>
                    <button
                      onClick={() => onAddCard(item.title)}
                      className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* Normal section list */
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
            {sections.map((section) => (
              <div key={section.heading}>
                <p className="mb-2 text-xs font-semibold tracking-wider text-stone-400 dark:text-stone-500">
                  {section.heading}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (tab === "existing") setSelectedCategory(item.label);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                    >
                      <div className={ICON_BOX}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{item.label}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500">{item.sub}</p>
                      </div>
                      {tab === "existing" && (
                        <ChevronRight size={15} className="text-stone-300 dark:text-stone-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

export default function DashboardCanvasView({ id }: { id: string }) {
  const [cards, setCards] = useState<CardDef[]>(INITIAL_CARDS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addCard = useCallback((title: string) => {
    setCards((prev) => {
      const col = prev.length % 3;
      const row = Math.floor(prev.length / 3);
      return [
        ...prev,
        {
          id: Date.now(),
          title,
          x: 40 + col * 400,
          y: 100 + row * 330,
          w: 360,
          h: 280,
          data: makeData(Math.random() * 1.5, Math.random() * 1.2),
        },
      ];
    });
  }, []);

  const onCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).closest("[data-canvas-bg]")) return;
    isPanning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    e.currentTarget.style.cursor = "grabbing";
  }, [offset]);

  const onCanvasTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).closest("[data-canvas-bg]")) return;
    const t = e.touches[0];
    isPanning.current = true;
    panStart.current = { mx: t.clientX, my: t.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isPanning.current) return;
      setOffset({ x: panStart.current.ox + e.clientX - panStart.current.mx, y: panStart.current.oy + e.clientY - panStart.current.my });
    }
    function onUp() {
      if (!isPanning.current) return;
      isPanning.current = false;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    }
    function onTouchMove(e: TouchEvent) {
      if (!isPanning.current || e.touches.length !== 1) return;
      const t = e.touches[0];
      setOffset({ x: panStart.current.ox + t.clientX - panStart.current.mx, y: panStart.current.oy + t.clientY - panStart.current.my });
    }
    function onTouchEnd() { isPanning.current = false; }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-up">
      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-1">
        {/* Title row — Filter/Breakdown live here, icon-only on mobile */}
        <div className="flex items-center gap-2 text-sm mb-1">
          <BackButton href="/boards" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">OrderPage</span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              <Filter size={12} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5"
              style={{ borderColor: "var(--border)" }}
            >
              <Repeat size={12} />
              <span className="hidden sm:inline">Breakdown</span>
            </button>
          </div>
        </div>

        {/* DateRangePicker — full width, presets row has room to breathe */}
        <DateRangePicker />
      </div>

      {/* Canvas area */}
      <div className="relative flex-1 overflow-hidden" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          ref={canvasRef}
          data-canvas-bg="true"
          className="absolute inset-0 overflow-hidden select-none cursor-grab bg-[#f0f2f5] dark:bg-[#111315] bg-[radial-gradient(circle,#c8cdd6_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#2c2f33_1px,transparent_1px)] bg-size-[22px_22px]"
          onMouseDown={onCanvasMouseDown}
          onTouchStart={onCanvasTouchStart}
        >
          <div
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, position: "absolute", inset: 0, willChange: "transform" }}
          >
            {cards.map((card) => (
              <ChartCard key={card.id} card={card} />
            ))}
          </div>
        </div>

        {/* Add content "+" button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-200"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <Plus size={16} />
        </button>
      </div>

      <AddContentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onAddCard={addCard} />
    </div>
  );
}
