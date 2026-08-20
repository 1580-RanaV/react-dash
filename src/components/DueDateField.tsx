

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// Fixed "today" reference — keeps the mock console's dates consistent regardless of when it's actually run,
// matching the convention already used by DateRangePicker.tsx.
const TODAY = new Date(2026, 7, 20);

type Preset = "today" | "tomorrow" | "2-business-days" | "3-business-days" | "1-week" | "2-weeks" | "custom";

const PRESET_OPTIONS: { key: Preset; label: string }[] = [
  { key: "today",            label: "Today" },
  { key: "tomorrow",         label: "Tomorrow" },
  { key: "2-business-days",  label: "In 2 business days" },
  { key: "3-business-days",  label: "In 3 business days" },
  { key: "1-week",           label: "In 1 week" },
  { key: "2-weeks",          label: "In 2 weeks" },
  { key: "custom",           label: "Custom date" },
];

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addBusinessDays(d: Date, n: number) {
  let r = new Date(d);
  let added = 0;
  while (added < n) {
    r = addDays(r, 1);
    if (r.getDay() !== 0 && r.getDay() !== 6) added++;
  }
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
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function calDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const out: { date: Date; cur: boolean }[] = [];
  for (let i = first.getDay() - 1; i >= 0; i--) out.push({ date: addDays(first, -(i + 1)), cur: false });
  for (let d = 1; d <= last.getDate(); d++) out.push({ date: new Date(year, month, d), cur: true });
  while (out.length < 42) out.push({ date: addDays(last, out.length - last.getDate() - first.getDay() + 1), cur: false });
  return out;
}

function presetDate(key: Preset): Date {
  switch (key) {
    case "tomorrow":         return addDays(TODAY, 1);
    case "2-business-days":  return addBusinessDays(TODAY, 2);
    case "3-business-days":  return addBusinessDays(TODAY, 3);
    case "1-week":           return addDays(TODAY, 7);
    case "2-weeks":          return addDays(TODAY, 14);
    default:                 return TODAY;
  }
}

function MiniCalendar({
  base, selected, onPick, onPrev, onNext,
}: {
  base: Date;
  selected: Date | null;
  onPick: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const days = calDays(base.getFullYear(), base.getMonth());

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={onPrev} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/8">
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{monthLabel(base)}</span>
        <button type="button" onClick={onNext} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/8">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-medium text-stone-400 dark:text-stone-600">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, cur }, i) => {
          const isToday = cur && sameDay(date, TODAY);
          const isSelected = cur && selected && sameDay(date, selected);
          return (
            <button
              key={i}
              type="button"
              disabled={!cur}
              onClick={() => onPick(date)}
              className={`flex h-9 items-center justify-center rounded-md text-xs transition-colors ${
                !cur
                  ? "pointer-events-none text-transparent"
                  : isSelected
                  ? "bg-blue-500 font-semibold text-white"
                  : isToday
                  ? "font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 dark:text-stone-100 dark:ring-stone-600"
                  : "text-stone-800 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/8"
              }`}
            >
              {cur ? date.getDate() : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DueDateField({ onChange }: { onChange?: (isoDate: string) => void }) {
  const [preset, setPreset] = useState<Preset>("today");
  const [open, setOpen] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calBase, setCalBase] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.(toISODate(TODAY));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function selectPreset(key: Preset) {
    setPreset(key);
    setOpen(false);
    if (key === "custom") {
      setCalendarOpen(true);
      if (customDate) onChange?.(toISODate(customDate));
    } else {
      onChange?.(toISODate(presetDate(key)));
    }
  }

  function pickDate(d: Date) {
    setCustomDate(d);
    setCalendarOpen(false);
    onChange?.(toISODate(d));
  }

  const activeLabel = PRESET_OPTIONS.find((p) => p.key === preset)?.label ?? "Select...";

  return (
    <div ref={ref}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm font-medium text-stone-900 outline-none transition-colors border-stone-200 bg-white hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:hover:bg-white/6"
        >
          <span>{activeLabel}</span>
          <ChevronDown size={13} className="shrink-0 text-stone-400" />
        </button>

        {open && (
          <div
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl shadow-xl animate-card-in"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
          >
            {PRESET_OPTIONS.map((p) => (
              <button
                key={p.key}
                type="button"
                onMouseDown={() => selectPreset(p.key)}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                  preset === p.key
                    ? "bg-stone-100 font-semibold text-stone-900 dark:bg-white/8 dark:text-stone-100"
                    : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
                }`}
              >
                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  {preset === p.key && <Check size={13} />}
                </span>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {preset === "custom" && (
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setCalendarOpen((o) => !o)}
            className={`flex h-10 w-full items-center gap-2 rounded-lg border px-3 text-left text-sm font-medium outline-none transition-colors ${
              calendarOpen
                ? "border-blue-400 ring-2 ring-blue-500/15"
                : "border-stone-200 hover:bg-stone-50 dark:border-(--border) dark:hover:bg-white/6"
            } bg-white text-stone-900 dark:bg-white/3 dark:text-stone-100`}
          >
            <CalendarIcon size={14} className="shrink-0 text-stone-400" />
            <span className={customDate ? "" : "text-stone-400 dark:text-stone-500"}>
              {customDate ? fmtDate(customDate) : "Pick a date"}
            </span>
          </button>

          {calendarOpen && (
            <div
              className="absolute left-0 top-[calc(100%+4px)] z-50 w-72 rounded-2xl p-4 animate-card-in"
              style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <MiniCalendar
                base={calBase}
                selected={customDate}
                onPick={pickDate}
                onPrev={() => setCalBase(addMonths(calBase, -1))}
                onNext={() => setCalBase(addMonths(calBase, 1))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
