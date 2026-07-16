

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
function between(d: Date, a: Date, b: Date) {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return d > lo && d < hi;
}
function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function calDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const out: { date: Date; cur: boolean }[] = [];
  for (let i = first.getDay() - 1; i >= 0; i--)
    out.push({ date: addDays(first, -(i + 1)), cur: false });
  for (let d = 1; d <= last.getDate(); d++)
    out.push({ date: new Date(year, month, d), cur: true });
  while (out.length < 42)
    out.push({ date: addDays(last, out.length - last.getDate() - first.getDay() + 1), cur: false });
  return out;
}

const PRESETS = [
  { label: "Today",     shortLabel: "1D",   fn: (t: Date) => ({ start: t,            end: t }) },
  { label: "Yesterday", shortLabel: "Yest", fn: (t: Date) => ({ start: addDays(t,-1), end: addDays(t,-1) }) },
  { label: "7D",        shortLabel: "7D",   fn: (t: Date) => ({ start: addDays(t,-6), end: t }) },
  { label: "30D",       shortLabel: "30D",  fn: (t: Date) => ({ start: addDays(t,-29),end: t }) },
  { label: "3M",        shortLabel: "3M",   fn: (t: Date) => ({ start: addDays(t,-89),end: t }) },
  { label: "6M",        shortLabel: "6M",   fn: (t: Date) => ({ start: addDays(t,-179),end: t }) },
  { label: "12M",       shortLabel: "12M",  fn: (t: Date) => ({ start: addDays(t,-364),end: t }) },
];

const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Single month grid ────────────────────────────────────────
function MonthGrid({
  base, start, end, hover, picking,
  onHover, onPick,
  showPrev, showNext, onPrev, onNext,
}: {
  base: Date; start: Date; end: Date; hover: Date | null; picking: boolean;
  onHover: (d: Date | null) => void; onPick: (d: Date) => void;
  showPrev?: boolean; showNext?: boolean; onPrev?: () => void; onNext?: () => void;
}) {
  const days = calDays(base.getFullYear(), base.getMonth());
  const hiEnd = picking && hover ? hover : end;

  return (
    <div className="flex-1 min-w-0">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3 px-1">
        {showPrev
          ? <button onClick={onPrev} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400">
              <ChevronLeft size={14} />
            </button>
          : <span className="w-7" />}
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{monthLabel(base)}</span>
        {showNext
          ? <button onClick={onNext} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400">
              <ChevronRight size={14} />
            </button>
          : <span className="w-7" />}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 dark:text-stone-600 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map(({ date, cur }, i) => {
          const col = i % 7;
          const isStart = cur && sameDay(date, start);
          const isEnd   = cur && sameDay(date, hiEnd);
          const inRange = cur && between(date, start, hiEnd);
          const roundL  = isStart || (inRange && col === 0);
          const roundR  = isEnd   || (inRange && col === 6);

          return (
            <button
              key={i}
              disabled={!cur}
              onClick={() => onPick(date)}
              onMouseEnter={() => onHover(cur ? date : null)}
              onMouseLeave={() => onHover(null)}
              className={[
                "relative h-9 text-xs flex items-center justify-center transition-colors",
                !cur ? "pointer-events-none text-transparent" : "text-stone-800 dark:text-stone-200",
                (isStart || isEnd)
                  ? "text-white font-semibold"
                  : inRange ? "text-blue-700 dark:text-blue-200 font-medium" : "",
                (isStart || isEnd)
                  ? "bg-[#0080FF] z-10"
                  : inRange ? "bg-[#0080FF]/8 dark:bg-[#0080FF]/12" : "hover:bg-stone-100 dark:hover:bg-white/8",
                roundL || isStart ? "rounded-l-full" : "",
                roundR || isEnd   ? "rounded-r-full" : "",
                !inRange && !isStart && !isEnd ? "rounded-full" : "",
              ].filter(Boolean).join(" ")}
            >
              {cur ? date.getDate() : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Granularity = "Day" | "Week" | "Month";
const GRANULARITIES: Granularity[] = ["Day", "Week", "Month"];

// ─── Main component ───────────────────────────────────────────
export default function DateRangePicker({ className }: { className?: string }) {
  const today = new Date(2026, 5, 2); // Jun 2, 2026 (matches session date)
  const [start, setStart]       = useState(addDays(today, -29));
  const [end,   setEnd]         = useState(today);
  const [picking, setPicking]   = useState(false);
  const [hover,   setHover]     = useState<Date | null>(null);
  const [preset,  setPreset]    = useState("30D");
  const [open,    setOpen]      = useState(false);
  const [leftBase, setLeft]     = useState(addMonths(today, -1));
  const [granularity, setGran]  = useState<Granularity>("Day");
  const [granOpen, setGranOpen] = useState(false);
  const ref     = useRef<HTMLDivElement>(null);
  const granRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (granRef.current && !granRef.current.contains(e.target as Node)) setGranOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const rightBase = addMonths(leftBase, 1);

  function handlePick(date: Date) {
    if (!picking) {
      setStart(date); setEnd(date); setPicking(true); setPreset("");
    } else {
      const [s, e] = date < start ? [date, start] : [start, date];
      setStart(s); setEnd(e); setPicking(false); setOpen(false);
    }
  }

  function applyPreset(p: typeof PRESETS[0]) {
    const { start: s, end: e } = p.fn(today);
    setStart(s); setEnd(e); setPicking(false); setPreset(p.label);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger bar */}
      <div className={className ?? "flex items-center gap-1 px-4 py-2.5 flex-wrap"}>
        {/* Date range label */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
        >
          <Calendar size={15} />
          <span>{fmt(start)} – {fmt(end)}</span>
        </button>

        {/* Presets + granularity row */}
        <div className="flex items-center gap-0.5">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`px-2 sm:px-2.5 py-1 rounded-md text-xs transition-colors ${
                preset === p.label
                  ? "font-bold text-stone-900 dark:text-stone-100"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
              }`}
            >
              <span className="sm:hidden">{p.shortLabel}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </button>
          ))}
          <div ref={granRef} className="relative ml-2">
            <button
              onClick={() => setGranOpen((o) => !o)}
              className="flex h-9 items-center gap-1.5 px-2.5 rounded-lg border border-stone-200 dark:border-(--border) text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
            >
              {granularity} <ChevronDown size={11} className="text-stone-400" />
            </button>

            {granOpen && (
              <div
                className="absolute right-0 top-[calc(100%+4px)] z-50 w-28 overflow-hidden rounded-xl animate-card-in"
                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {GRANULARITIES.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGran(g); setGranOpen(false); }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors
                      ${granularity === g
                        ? "bg-stone-50 text-stone-900 font-medium dark:bg-white/5 dark:text-stone-100"
                        : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 animate-card-in rounded-2xl overflow-hidden w-[calc(100vw-24px)] sm:w-auto"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Mobile: single month with both arrows */}
          <div className="sm:hidden px-4 py-5">
            <MonthGrid
              base={leftBase}
              start={start} end={end} hover={hover} picking={picking}
              onHover={setHover} onPick={handlePick}
              showPrev onPrev={() => setLeft(addMonths(leftBase, -1))}
              showNext onNext={() => setLeft(addMonths(leftBase, 1))}
            />
          </div>

          {/* Desktop: two months side by side */}
          <div className="hidden sm:flex gap-8 px-7 py-6" style={{ minWidth: 620 }}>
            <MonthGrid
              base={leftBase}
              start={start} end={end} hover={hover} picking={picking}
              onHover={setHover} onPick={handlePick}
              showPrev onPrev={() => setLeft(addMonths(leftBase, -1))}
            />
            <div className="w-px bg-stone-100 dark:bg-(--input) shrink-0" />
            <MonthGrid
              base={rightBase}
              start={start} end={end} hover={hover} picking={picking}
              onHover={setHover} onPick={handlePick}
              showNext onNext={() => setLeft(addMonths(leftBase, 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
