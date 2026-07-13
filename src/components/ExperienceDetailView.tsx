

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3, Calendar, ChevronDown, ChevronRight, ChevronUp,
  Clock, Copy, ExternalLink, FileText,
  FlaskConical, Info, Minus, MoreHorizontal, Pencil, Plus, Trash2, Users, X,
  type LucideIcon,
} from "lucide-react";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import SlidingSidebar from "./SlidingSidebar";
import DateRangePicker from "./DateRangePicker";
import MetricCard from "./MetricCard";
import ExperienceDecisionButton, { type ExperienceStatus } from "./ExperienceDecisionButton";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── Data ───────────────────────────────────────────────────────────────────────

const EXPERIENCES: Record<string, { title: string; progress: number; daysLeft: number; status: ExperienceStatus }> = {
  "spring-homepage-test":             { title: "Spring homepage hero test",        progress: 4,  daysLeft: 2938, status: "active"  },
  "returning-visitor-personalization":{ title: "Returning visitor personalization", progress: 12, daysLeft: 14,   status: "active"  },
  "pricing-page-cta":                 { title: "Pricing page CTA experiment",      progress: 0,  daysLeft: 0,    status: "draft"   },
  "new-user-banner":                  { title: "New user onboarding banner",        progress: 67, daysLeft: 3,    status: "paused"  },
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
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--muted) text-(--icon)">
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

function VariantMenu({ variantName, onDelete }: { variantName: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.closest("[data-variant-menu]")?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  function openMenu() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpen((o) => !o);
  }

  return (
    <>
      <div data-variant-menu="">
        <button
          ref={btnRef}
          onClick={openMenu}
          className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {open && createPortal(
        <div
          data-variant-menu=""
          className="fixed z-[9998] w-44 rounded-xl overflow-hidden animate-card-in"
          style={{
            top: pos.top,
            right: pos.right,
            background: "var(--popover)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="py-1">
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
            >
              <Pencil size={13} className="text-stone-400" />
              Edit
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-stone-700 dark:text-stone-200 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
            >
              <Copy size={13} className="text-stone-400" />
              Duplicate
            </button>
            <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
            <button
              onClick={() => { setOpen(false); setDeleteOpen(true); }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/8"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>,
        document.body
      )}

      {deleteOpen && (
        <DeleteConfirmDialog
          entityType="variant"
          entityName={variantName}
          onConfirm={() => { onDelete(); setDeleteOpen(false); }}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
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

// ── Variants shelf ─────────────────────────────────────────────────────────────

function VariantsShelfContent() {
  const [control, setControl] = useState(5);
  const [variants, setVariants] = useState([
    { id: "v1", name: "this is the only variant I have", pct: 47 },
    { id: "v2", name: "Variant 3",                       pct: 48 },
  ]);

  function setPct(id: string, pct: number) {
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, pct } : v));
  }

  function deleteVariant(id: string) {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* URL */}
      <div className="flex items-center gap-3">
        <Info size={14} className="shrink-0 text-stone-400" />
        <span className="flex-1 truncate text-xs text-stone-500 dark:text-stone-400">https://intempt.com</span>
        <button className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/8 dark:text-stone-200 dark:hover:bg-white/12">
          Open editor <ExternalLink size={11} />
        </button>
      </div>

      {/* Control + variants */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-stone-50 dark:hover:bg-white/3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">Control</span>
            <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-500 dark:bg-white/8 dark:text-stone-400">original</span>
          </div>
          <div className="flex items-center gap-2">
            <PercentInput value={control} onChange={setControl} />
            <span className="text-xs text-stone-400 dark:text-stone-500">No changes</span>
          </div>
        </div>
        {variants.map((v) => (
          <div key={v.id} className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-stone-50 dark:hover:bg-white/3">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-xs font-medium text-stone-800 dark:text-stone-100">{v.name}</span>
              <button className="shrink-0 text-stone-300 transition-colors hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400">
                <Pencil size={12} />
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PercentInput value={v.pct} onChange={(pct) => setPct(v.id, pct)} />
              <VariantMenu variantName={v.name} onDelete={() => deleteVariant(v.id)} />
            </div>
          </div>
        ))}
      </div>

      <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--border) px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5">
        <Plus size={13} /> Add variant
      </button>
    </div>
  );
}

// ── Metrics shelf ──────────────────────────────────────────────────────────────

function MetricsShelfContent() {
  const [primary, setPrimary] = useState(["creating user"]);
  const [secondary, setSecondary] = useState(["New Metric"]);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Info size={13} className="text-stone-400" />
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Primary Metrics</span>
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {primary.map((m) => (
            <MetricTag key={m} name={m} onRemove={() => setPrimary((p) => p.filter((x) => x !== m))} />
          ))}
        </div>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--border) px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5">
          <Plus size={13} /> Add metric
        </button>
      </div>
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Info size={13} className="text-stone-400" />
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Secondary Metrics</span>
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {secondary.map((m) => (
            <MetricTag key={m} name={m} onRemove={() => setSecondary((p) => p.filter((x) => x !== m))} />
          ))}
        </div>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--border) px-3 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5">
          <Plus size={13} /> Add metric
        </button>
      </div>
    </div>
  );
}

// ── Setup card ─────────────────────────────────────────────────────────────────

function SetupCard({
  icon: Icon, title, value, label, meta, onOpen,
}: {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  label: string;
  meta?: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      className="relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl p-4 transition-shadow hover:shadow-md"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", minHeight: 140 }}
    >
      {/* Top row: icon badge + title + chevron */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-blue-500 dark:bg-white/8">
            <Icon size={16} />
          </span>
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</span>
        </div>
        <ChevronRight size={14} className="shrink-0 text-stone-300 dark:text-stone-600" />
      </div>

      {/* Value + label */}
      <div className="mt-4">
        <p className="mb-1.5 text-3xl font-bold leading-none text-stone-800 dark:text-stone-100">
          {value}
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
        {meta && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
            {meta}
          </div>
        )}
      </div>

      {/* Watermark */}
      <span className="pointer-events-none absolute -bottom-2 -right-2 text-blue-500 opacity-[0.07] dark:opacity-[0.10]">
        <Icon size={72} />
      </span>
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

      <div className="h-4 w-px bg-stone-200 dark:bg-white/12 shrink-0" />

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

// ── Schedule shelf ────────────────────────────────────────────────────────────

const DAYS_FULL = [
  { key: "Mon", label: "Monday"    },
  { key: "Tue", label: "Tuesday"   },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday"  },
  { key: "Fri", label: "Friday"    },
  { key: "Sat", label: "Saturday"  },
  { key: "Sun", label: "Sunday"    },
];

function ScheduleShelfContent() {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set(["Mon"]));

  function toggleDay(day: string) {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  const dateRow = (label: string) => (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">{label}</p>
      <div className="flex gap-1.5">
        <button className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-(--border) bg-(--input) px-3 text-sm text-stone-400 dark:text-stone-500">
          <Calendar size={13} className="shrink-0" />
          Pick date
        </button>
        <div className="relative flex-1">
          <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-7 text-sm text-stone-400 dark:text-stone-500 outline-none">
            <option>Time</option>
          </select>
          <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Activation Period */}
      <div>
        <div className="mb-3 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Activation Period</span>
          <span className="text-xs text-stone-400 dark:text-stone-500">(Optional)</span>
          <Info size={13} className="text-stone-400" />
        </div>
        <div className="space-y-3">
          {dateRow("Start Date")}
          {dateRow("End Date")}
        </div>
      </div>

      {/* Daily Schedule */}
      <div>
        <div className="mb-3 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Daily Schedule</span>
          <span className="text-xs text-stone-400 dark:text-stone-500">(Optional)</span>
          <Info size={13} className="text-stone-400" />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Start Time</p>
            <div className="relative">
              <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-400 dark:text-stone-500 outline-none">
                <option>Start time</option>
                {Array.from({ length: 24 }, (_, h) => <option key={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">End Time</p>
            <div className="relative">
              <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-400 dark:text-stone-500 outline-none">
                <option>End time</option>
                {Array.from({ length: 24 }, (_, h) => <option key={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Active Days — full names, stacked */}
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Active Days</p>
        <div className="space-y-px">
          {DAYS_FULL.map(({ key, label }) => {
            const active = activeDays.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                {label}
                {active && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-stone-400 dark:text-stone-500">
        Runs continuously (24/7) · Times shown in Project timezone · Runs until manually stopped.
      </p>
    </div>
  );
}

// ── Targeting shelf ────────────────────────────────────────────────────────────

function TargetingShelfContent() {
  const [rules, setRules] = useState([{ op: "contains", value: "" }]);

  function addRule() {
    setRules((prev) => [...prev, { op: "contains", value: "" }]);
  }

  function updateRule(i: number, field: "op" | "value", v: string) {
    setRules((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: v } : r));
  }

  return (
    <div className="space-y-5">
      {/* Audience */}
      <div>
        <div className="mb-1.5 flex items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Audience</p>
          <Info size={11} className="text-stone-400" />
        </div>
        <div className="relative">
          <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400">
            <option>All users</option>
            <option>Specific users</option>
            <option>Anonymous users</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Segment */}
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Segment</p>
        <div className="relative">
          <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-400 dark:text-stone-500 outline-none focus:border-blue-400">
            <option value="">Select segment</option>
            <option>All visitors</option>
            <option>New users</option>
            <option>Returning users</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <div className="mb-1.5 flex items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Frequency</p>
          <Info size={11} className="text-stone-400" />
        </div>
        <div className="relative">
          <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400">
            <option>Always</option>
            <option>Once per user</option>
            <option>Once per session</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Devices */}
      <div>
        <div className="mb-1.5 flex items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Devices</p>
          <Info size={11} className="text-stone-400" />
        </div>
        <div className="relative">
          <select className="h-9 w-full appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-8 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400">
            <option>All devices</option>
            <option>Desktop only</option>
            <option>Mobile only</option>
            <option>Tablet only</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Pages */}
      <div>
        <div className="mb-2 flex items-center gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Pages</p>
          <Info size={11} className="text-stone-400" />
        </div>
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={rule.op}
                  onChange={(e) => updateRule(i, "op", e.target.value)}
                  className="h-9 w-28 appearance-none rounded-lg border border-(--border) bg-(--input) pl-3 pr-7 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400"
                >
                  <option>contains</option>
                  <option>starts with</option>
                  <option>equals</option>
                  <option>not contains</option>
                </select>
                <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
              <input
                type="text"
                value={rule.value}
                onChange={(e) => updateRule(i, "value", e.target.value)}
                placeholder="https://example.com/page"
                className="h-9 flex-1 rounded-lg border border-(--border) bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addRule}
          className="mt-2.5 flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-600"
        >
          <Plus size={13} />
          Add rule
        </button>
      </div>
    </div>
  );
}

// ── Inline cards (setup view 2) ───────────────────────────────────────────────

function InlineCard({
  icon: Icon, title, description, action, children,
}: {
  icon: LucideIcon; title: string; description?: string;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/15">
            <Icon size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</p>
            {description && <p className="text-xs text-stone-400 dark:text-stone-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ConfigTileV2({
  icon: Icon, title, description, summary, onEdit,
}: {
  icon: LucideIcon; title: string; description: string; summary: string; onEdit: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border p-5" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
      <div className="mb-2 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-500/15">
          <Icon size={15} />
        </span>
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{title}</span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-stone-400 dark:text-stone-500">{description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm text-stone-600 dark:text-stone-300">{summary}</span>
        <button
          onClick={onEdit}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          <Pencil size={12} className="text-stone-400" /> Edit
        </button>
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
  const [shelf, setShelf] = useState<null | "variants" | "metrics" | "schedule" | "targeting">(null);
  const [setupView, setSetupView] = useState<1 | 2>(1);
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
    <div className="relative flex h-full flex-col overflow-hidden bg-white animate-fade-up dark:bg-(--card)">
      {/* Top bar */}
      <div
        className="shrink-0 flex flex-col sm:flex-row sm:items-center px-5 py-2.5 gap-2 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0 sm:flex-1">
          <BackButton href="/experiences" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{exp.title}</span>
        </div>

        {/* Status + progress + tabs row */}
        <div className="flex items-center gap-2.5 shrink-0">
          {exp.progress > 0 && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              <span className="font-semibold text-stone-600 dark:text-stone-300">{exp.progress}%</span> progress
            </span>
          )}
          {exp.daysLeft > 0 && (
            <span className="text-xs text-stone-400 dark:text-stone-500">
              <span className="font-semibold text-stone-600 dark:text-stone-300">{exp.daysLeft.toLocaleString()}</span> days left
            </span>
          )}
          <ExperienceDecisionButton initialStatus={exp.status} />
          <div className="h-4 w-px bg-stone-200 dark:bg-white/10 shrink-0" />
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
        <>
          {/* View toggle */}
          <div className="flex shrink-0 justify-end px-5 pt-3 pb-1">
            <div className="inline-flex overflow-hidden rounded-lg border text-xs font-medium" style={{ borderColor: "var(--border)" }}>
              {([1, 2] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setSetupView(v)}
                  className={`px-3 py-1.5 transition-colors ${setupView === v ? "bg-stone-800 text-white dark:bg-white dark:text-stone-900" : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"} ${v === 2 ? "border-l" : ""}`}
                  style={v === 2 ? { borderColor: "var(--border)" } : {}}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {setupView === 1 ? (
            /* View 1 — metric card grid */
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-4">
              <div className="grid w-full max-w-2xl grid-cols-2 grid-rows-2 gap-3" style={{ height: "460px" }}>
                <SetupCard icon={FlaskConical} title="Variants"  value="3"          label="Variants configured"    onOpen={() => setShelf("variants")}  />
                <SetupCard icon={BarChart3}   title="Metrics"   value="2"          label="Metrics configured"     onOpen={() => setShelf("metrics")}   />
                <SetupCard icon={Clock}       title="Schedule"  value="Always on"  label="Runs 24/7"              onOpen={() => setShelf("schedule")}  />
                <SetupCard icon={Users}       title="Targeting" value="All users"  label="Desktop only · Always"  onOpen={() => setShelf("targeting")} />
              </div>
            </div>
          ) : (
            /* View 2 — inline expanded cards */
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5 pt-2">
              <InlineCard
                icon={FlaskConical}
                title="Variants"
                description="Define what you're testing"
                action={
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10">
                    <Plus size={13} /> Add variant
                  </button>
                }
              >
                <VariantsShelfContent />
              </InlineCard>

              <InlineCard icon={BarChart3} title="Metrics">
                <MetricsShelfContent />
              </InlineCard>

              <div className="grid grid-cols-2 gap-3">
                <ConfigTileV2
                  icon={Clock}
                  title="Schedule"
                  description="This experience runs continuously unless restricted by a schedule."
                  summary="Runs continuously (24/7)"
                  onEdit={() => setShelf("schedule")}
                />
                <ConfigTileV2
                  icon={Users}
                  title="Targeting"
                  description="Defines which users, devices, and conditions determine who sees this experience."
                  summary="All users · Always · Desktop only"
                  onEdit={() => setShelf("targeting")}
                />
              </div>
            </div>
          )}
        </>
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
              variantLabel={{ letter: "A", name: "Control", color: "#3F8CB2" }}
            />
            <MetricCard
              value="24,276"
              label="Cumulative impressions"
              change="-- vs. previous period"
              data={IMPRESSIONS_DATA}
              variantLabel={{ letter: "B", name: "Variant 1", color: "#9580FF" }}
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
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Hypothesis</p>
                <p className="text-sm text-stone-400 dark:text-stone-500 italic">No hypothesis recorded.</p>
              </div>
            </div>

            {/* Setup */}
            <div className="rounded-xl border" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Setup</p>
                <div className="flex items-center gap-8">
                  {[
                    { letter: "A", name: "Control",   color: "#3F8CB2" },
                    { letter: "B", name: "Variant 1", color: "#9580FF" },
                  ].map(({ letter, name, color }) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: color }}>
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
          title={
            shelf === "variants" ? "Variants" :
            shelf === "metrics"  ? "Metrics"  :
            shelf === "schedule" ? "Schedule" : "Targeting"
          }
          description={
            shelf === "variants" ? "Configure variants and traffic allocation." :
            shelf === "metrics"  ? "Select primary and secondary success metrics." :
            shelf === "schedule" ? "Control when this experience runs." :
            "Define who is eligible for this experience."
          }
          onClose={() => setShelf(null)}
          footerBorder={false}
          footer={(close) => (
            <>
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "var(--primary)" }}>
                Save
              </button>
            </>
          )}
        >
          {shelf === "variants" ? <VariantsShelfContent /> :
           shelf === "metrics"  ? <MetricsShelfContent /> :
           shelf === "schedule" ? <ScheduleShelfContent /> :
           <TargetingShelfContent />}
        </SlidingSidebar>
      ) : null}
    </div>
  );
}
