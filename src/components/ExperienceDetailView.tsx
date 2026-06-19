

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3, Calendar, ChevronDown, ChevronRight, ChevronUp,
  Clock, Crosshair, ExternalLink, FileText,
  FlaskConical, Info, Minus, MoreHorizontal, Pencil, Plus, X,
} from "lucide-react";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import SlidingSidebar from "./SlidingSidebar";
import DateRangePicker from "./DateRangePicker";
import MetricCard from "./MetricCard";

// ── Data ───────────────────────────────────────────────────────────────────────

const EXPERIENCES: Record<string, { title: string; progress: number; daysLeft: number }> = {
  "spring-homepage-test":             { title: "Spring homepage hero test",        progress: 4,  daysLeft: 2938 },
  "returning-visitor-personalization":{ title: "Returning visitor personalization", progress: 12, daysLeft: 14   },
  "pricing-page-cta":                 { title: "Pricing page CTA experiment",      progress: 0,  daysLeft: 0    },
  "new-user-banner":                  { title: "New user onboarding banner",        progress: 67, daysLeft: 3    },
};

// ── Shared primitives ──────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white dark:bg-transparent ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  icon, title, subtitle, action,
}: {
  icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 pb-3">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
          {subtitle && <p className="text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function PercentInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <span className="px-2.5 text-sm font-medium text-stone-800 dark:text-stone-100 min-w-8 text-center select-none">
          {value}
        </span>
        <div className="flex flex-col border-l" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => onChange(Math.min(100, value + 1))}
            className="flex h-4 w-5 items-center justify-center text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronUp size={9} />
          </button>
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex h-4 w-5 items-center justify-center border-t text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: "var(--border)" }}
          >
            <ChevronDown size={9} />
          </button>
        </div>
      </div>
      <span className="text-xs text-stone-500 dark:text-stone-400">%</span>
    </div>
  );
}

function ThreeDots() {
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
      <MoreHorizontal size={15} />
    </button>
  );
}

function MetricTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 dark:bg-white/8 pl-2.5 pr-1.5 py-1">
      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{name}</span>
      <span className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-white/8 px-1.5 py-0.5">
        <span className="text-stone-500 text-xs font-semibold">#</span>
        <span className="text-xs font-medium text-stone-600 dark:text-stone-300">Event Count</span>
      </span>
      <button
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Variants card ──────────────────────────────────────────────────────────────

function VariantsCard() {
  const [control, setControl] = useState(5);
  const [variants, setVariants] = useState([
    { id: "v1", name: "this is the only variant I have", pct: 47 },
    { id: "v2", name: "Variant 3",                       pct: 48 },
  ]);

  function setPct(id: string, pct: number) {
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, pct } : v));
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        icon={<FlaskConical size={15} />}
        title="Variants"
        action={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-stone-200 dark:hover:bg-white/12">
            <Plus size={14} />
            Add variant
          </button>
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700/70">
        {/* URL row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200/80 dark:border-stone-700/70">
          <Info size={14} className="text-stone-400 shrink-0" />
          <span className="flex-1 truncate text-xs text-stone-500 dark:text-stone-400">https://intempt.com</span>
          <button
            className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-stone-200 dark:hover:bg-white/12"
          >
            Open editor
            <ExternalLink size={11} />
          </button>
        </div>

        {/* Control */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200/80 dark:border-stone-700/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Control</span>
            <span className="rounded-md bg-stone-100 dark:bg-white/8 px-1.5 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">original</span>
          </div>
          <div className="flex items-center gap-2">
            <PercentInput value={control} onChange={setControl} />
            <span className="text-xs text-stone-400 dark:text-stone-500">No changes</span>
          </div>
        </div>

        {/* Variant rows */}
        {variants.map((v, i) => (
          <div
            key={v.id}
            className={`flex items-center justify-between px-4 py-3 ${i < variants.length - 1 ? "border-b border-stone-200/80 dark:border-stone-700/70" : ""}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-medium text-stone-800 dark:text-stone-100 truncate">{v.name}</span>
              <button className="shrink-0 text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors">
                <Pencil size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PercentInput value={v.pct} onChange={(pct) => setPct(v.id, pct)} />
              <ThreeDots />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Metrics card ───────────────────────────────────────────────────────────────

function MetricsCard() {
  const [primary, setPrimary] = useState(["creating user"]);
  const [secondary, setSecondary] = useState(["New Metric"]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader icon={<BarChart3 size={15} />} title="Metrics" />

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto rounded-xl border border-stone-200 px-4 py-4 dark:border-stone-700/70">
        {/* Primary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info size={13} className="text-stone-400" />
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Primary Metrics</span>
            <button className="flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
              <Plus size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {primary.map((m) => (
              <MetricTag key={m} name={m} onRemove={() => setPrimary((p) => p.filter((x) => x !== m))} />
            ))}
          </div>
        </div>

        {/* Secondary */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info size={13} className="text-stone-400" />
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Secondary Metrics</span>
            <button className="flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
              <Plus size={13} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {secondary.map((m) => (
              <MetricTag key={m} name={m} onRemove={() => setSecondary((p) => p.filter((x) => x !== m))} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Schedule + Targeting cards ─────────────────────────────────────────────────

function ConfigTile({
  icon, title, summary, onConfigure,
}: {
  icon: React.ReactNode; title: string; summary: string; onConfigure: () => void;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border bg-white dark:bg-stone-900 px-5 py-4"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">{summary}</p>
      </div>
      <button
        onClick={onConfigure}
        className="shrink-0 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
        style={{ borderColor: "var(--border)" }}
      >
        Configure
        <ChevronRight size={12} className="text-stone-400" />
      </button>
    </div>
  );
}

// ── Results chart data ─────────────────────────────────────────────────────────

const USERS_DATA = [
  { date: "Jun 1",  value: 0       },
  { date: "Jun 2",  value: 120     },
  { date: "Jun 3",  value: 340     },
  { date: "Jun 4",  value: 580     },
  { date: "Jun 5",  value: 920     },
  { date: "Jun 6",  value: 1340    },
  { date: "Jun 7",  value: 1820    },
  { date: "Jun 8",  value: 2410    },
  { date: "Jun 9",  value: 3050    },
  { date: "Jun 10", value: 3780    },
  { date: "Jun 11", value: 4530    },
  { date: "Jun 12", value: 5390    },
  { date: "Jun 13", value: 6270    },
  { date: "Jun 14", value: 7140    },
];

const IMPRESSIONS_DATA = USERS_DATA.map((d) => ({ ...d, value: Math.round(d.value * 3.4) }));

// ── Hypothesis card ────────────────────────────────────────────────────────────

function HypothesisCard() {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add your hypothesis here..."
        rows={4}
        className="w-full resize-none rounded-xl border bg-stone-50 dark:bg-white/3 px-4 py-3 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

// ── Results control bar ────────────────────────────────────────────────────────

const CI_OPTIONS = [
  { ci: 80, alpha: 0.2  },
  { ci: 85, alpha: 0.15 },
  { ci: 90, alpha: 0.1  },
  { ci: 95, alpha: 0.05 },
  { ci: 98, alpha: 0.02 },
  { ci: 99, alpha: 0.01 },
];

function SelectChip({ label }: { label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
      {label}
      <ChevronDown size={11} className="text-stone-400" />
    </button>
  );
}

function CIBadge() {
  const [selected, setSelected] = useState(CI_OPTIONS[1]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
        style={{ borderColor: "var(--border)" }}
      >
        <Info size={11} className="text-stone-400 shrink-0" />
        CI: {selected.ci}%&nbsp;&nbsp;α = {selected.alpha}
      </button>

      {open && (
        <div
          className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-44 rounded-xl overflow-hidden animate-card-in"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {CI_OPTIONS.map((opt) => {
            const active = opt.ci === selected.ci;
            return (
              <button
                key={opt.ci}
                onClick={() => { setSelected(opt); setOpen(false); }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                  active
                    ? "bg-stone-100 dark:bg-white/8 font-semibold text-stone-900 dark:text-stone-100"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                <span>{opt.ci}%</span>
                <span className={active ? "text-stone-500 dark:text-stone-400" : "text-stone-400 dark:text-stone-500"}>
                  α = {opt.alpha}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleBadge({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
        on
          ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
          : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5"
      }`}
      style={{ borderColor: on ? undefined : "var(--border)" }}
    >
      <Info size={11} className={on ? "text-blue-400 shrink-0" : "text-stone-400 shrink-0"} />
      {label} : {on ? "Yes" : "No"}
    </button>
  );
}

function ResultsControlBar() {
  const [zoom, setZoom] = useState(50);

  return (
    <div
      className="mx-5 flex items-center gap-3 px-4 py-2.5"
    >
      {/* Compare */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-stone-400 dark:text-stone-500">Compare</span>
        <SelectChip label="All" />
        <span className="text-xs text-stone-400 dark:text-stone-500">relative to</span>
        <SelectChip label="Control" />
      </div>

      <div className="flex-1" />

      {/* Zoom */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-stone-400 dark:text-stone-500">Zoom</span>
        <button
          onClick={() => setZoom((z) => Math.max(0, z - 10))}
          className="flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          <Minus size={11} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-20 accent-blue-500"
        />
        <button
          onClick={() => setZoom((z) => Math.min(100, z + 10))}
          className="flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="h-4 w-px bg-stone-200 dark:bg-stone-700 shrink-0" />

      {/* Stat badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <CIBadge />
        <ToggleBadge label="CUPED" />
        <ToggleBadge label="Sequential Testing" />
        <ToggleBadge label="BH" />
      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

type TabKey = "setup" | "results" | "report";

export default function ExperienceDetailView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabKey) ?? "setup";
  const [shelf, setShelf] = useState<null | "schedule" | "targeting">(null);
  const exp = EXPERIENCES[id] ?? EXPERIENCES["spring-homepage-test"];

  function setActiveTab(key: TabKey) {
    navigate(`?tab=${key}`, { replace: true });
  }

  const TABS: { key: TabKey; icon: React.ReactNode }[] = [
    { key: "setup",   icon: <FlaskConical size={15} /> },
    { key: "results", icon: <BarChart3 size={15} />    },
    { key: "report",  icon: <FileText size={15} />     },
  ];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white animate-fade-up dark:bg-stone-950">
      {/* Top bar: breadcrumb left, segmented control pinned right */}
      <div
        className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0 pr-4">
          <BackButton href="/experiences" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{exp.title}</span>
        </div>

        {/* Segmented control — always pinned right */}
        <div className="shrink-0">
          <SubTabCorner
            tabs={TABS.map((t) => ({
              key: t.key,
              label: t.key === "setup" ? "Setup" : t.key === "results" ? "Results" : "Summary",
              icon: t.icon,
            }))}
            active={activeTab}
            onChange={(k) => setActiveTab(k as TabKey)}
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "setup" && (
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 pb-5 pt-3">
          <div className="flex shrink-0 items-center justify-end gap-4">
            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="text-stone-700 dark:text-stone-300">Active</span>
                <ChevronDown size={11} className="text-stone-400" />
              </button>
              {exp.progress > 0 ? (
                <span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{exp.progress}%</span> progress
                </span>
              ) : null}
              {exp.daysLeft > 0 ? (
                <span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300">{exp.daysLeft.toLocaleString()}</span> days left
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setShelf("schedule")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-100 px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-stone-200 dark:hover:bg-white/12"
              >
                <Clock size={14} />
                Schedule
              </button>
              <button
                onClick={() => setShelf("targeting")}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-100 px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-stone-200 dark:hover:bg-white/12"
              >
                <Crosshair size={14} />
                Targeting
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] gap-4">
            <div className="flex min-h-0 flex-col">
              <VariantsCard />
            </div>
            <div className="flex min-h-0 flex-col">
              <MetricsCard />
            </div>
          </div>
        </div>
      )}

      {activeTab === "results" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-5 pt-4 pb-1">
            <HypothesisCard />
          </div>

          <div className="flex items-center shrink-0 pr-3 pt-1">
            <div className="flex-1"><DateRangePicker /></div>
          </div>

          {/* Metric cards */}
          <div className="flex gap-4 px-4 pt-3 pb-3 animate-fade-up">
            <MetricCard
              value="7,140"
              label="Cumulative users"
              change="-- vs. previous period"
              data={USERS_DATA}
              variantLabel={{ letter: "A", name: "Control", color: "#3B82F6" }}
            />
            <MetricCard
              value="24,276"
              label="Cumulative impressions"
              change="-- vs. previous period"
              data={IMPRESSIONS_DATA}
              variantLabel={{ letter: "B", name: "Variant 1", color: "#8B5CF6" }}
            />
          </div>

          {/* Control bar */}
          <div className="pb-4">
            <ResultsControlBar />
          </div>

          {/* Metrics sections */}
          <div className="flex flex-col gap-4 px-5 pb-6">
            {/* Primary Metrics */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Primary Metrics</p>
              </div>
              <div className="flex items-center justify-center px-5 py-12">
                <p className="text-sm text-stone-400 dark:text-stone-500">Primary metrics will appear once the experience collects data</p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Secondary Metrics</p>
              </div>
              <div className="flex items-center justify-center px-5 py-12">
                <p className="text-sm text-stone-400 dark:text-stone-500">Secondary metrics will appear once the experience collects data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 px-5 py-5 max-w-3xl mx-auto">

            {/* Header row */}
            <div className="flex items-start justify-between gap-6">
              {/* Left: title + status */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{exp.title}</span>
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              {/* Right: date + day pills */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300" style={{ borderColor: "var(--border)" }}>
                  <Calendar size={11} className="text-stone-400 shrink-0" />
                  Feb 23, 2026 – Jul 1, 2034
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium text-stone-500 dark:text-stone-400" style={{ borderColor: "var(--border)" }}>3050 days planned</span>
                  <span className="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400" style={{ borderColor: "var(--border)" }}>113 days completed</span>
                  <span className="inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400" style={{ borderColor: "var(--border)" }}>2937 days left</span>
                </div>
              </div>
            </div>

            {/* Hypothesis */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Hypothesis</p>
                <p className="text-sm text-stone-400 dark:text-stone-500 italic">No hypothesis recorded.</p>
              </div>
            </div>

            {/* Setup */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Setup</p>
                <div className="flex items-center gap-8">
                  {[
                    { letter: "A", name: "Control",   color: "#3B82F6" },
                    { letter: "B", name: "Variant 1", color: "#8B5CF6" },
                  ].map(({ letter, name, color }) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: color }}>
                        {letter}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{name}</span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">Impressions: 0 (0.0%) · Users: 0 (0.0%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings row */}
            <div className="rounded-xl border px-5 py-4 flex items-center gap-6" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              {/* Left: compare */}
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">Compare</span>
                <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 whitespace-nowrap" style={{ borderColor: "var(--border)" }}>All <ChevronDown size={10} className="text-stone-400" /></span>
                <span className="text-xs text-stone-500 dark:text-stone-400 whitespace-nowrap">relative to</span>
                <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 whitespace-nowrap" style={{ borderColor: "var(--border)" }}>Control <ChevronDown size={10} className="text-stone-400" /></span>
              </div>
              <div className="flex-1" />
              {/* Right: 2×2 grid of pills */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                {[
                  { label: "CI: 90%  α = 0.1",         active: false },
                  { label: "CUPED : Yes",               active: true  },
                  { label: "Sequential Testing : Yes",  active: true  },
                  { label: "BH : No",                   active: false },
                ].map(({ label, active }) => (
                  <span key={label} className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium whitespace-nowrap ${active ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400" : "text-stone-500 dark:text-stone-400"}`} style={{ borderColor: active ? undefined : "var(--border)" }}>
                    <Info size={10} className={active ? "text-blue-400 shrink-0" : "text-stone-400 shrink-0"} />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Metrics */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Primary Metrics</p>
              </div>
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c7dcfa 0%,#dde8fc 100%)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0080FF" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0 1 12 0v1" /></svg>
                </div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No data for selected metrics</p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Secondary Metrics</p>
              </div>
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#c7dcfa 0%,#dde8fc 100%)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0080FF" strokeWidth="1.6"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0 1 12 0v1" /></svg>
                </div>
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">This experience doesn&apos;t have selected secondary metrics.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {shelf ? (
        <SlidingSidebar
          title={shelf === "schedule" ? "Schedule" : "Targeting"}
          description={shelf === "schedule" ? "Control when this experience runs." : "Define who is eligible for this experience."}
          onClose={() => setShelf(null)}
          footerBorder={false}
          footer={(close) => (
            <>
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button className="inline-flex h-9 items-center rounded-lg px-5 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
                Save
              </button>
            </>
          )}
        >
          {shelf === "schedule" ? (
            <div className="space-y-6">
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">Run mode</p>
                <div className="mt-3 rounded-xl bg-stone-100 p-1 dark:bg-white/8">
                  <button className="w-full rounded-lg bg-white px-3 py-2 text-left text-[13px] font-medium text-stone-900 shadow-sm dark:bg-white/10 dark:text-stone-100">
                    Runs continuously
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">Start</p>
                <p className="mt-2 text-[13px] font-medium text-stone-500 dark:text-stone-400">Immediately after publishing</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">End</p>
                <p className="mt-2 text-[13px] font-medium text-stone-500 dark:text-stone-400">No scheduled end date</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">Audience</p>
                <p className="mt-2 text-[13px] font-medium text-stone-500 dark:text-stone-400">All users</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">Frequency</p>
                <p className="mt-2 text-[13px] font-medium text-stone-500 dark:text-stone-400">Always eligible</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-stone-900 dark:text-stone-100">Devices</p>
                <p className="mt-2 text-[13px] font-medium text-stone-500 dark:text-stone-400">Desktop only</p>
              </div>
            </div>
          )}
        </SlidingSidebar>
      ) : null}
    </div>
  );
}
