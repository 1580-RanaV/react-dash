

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronLeft,
  Copy, Filter, Minus, Plus, Trash2, Upload, Zap,
} from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

// ── Trigger node ───────────────────────────────────────────────────────────────

function TriggerNode({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="w-64 rounded-2xl border shadow-md overflow-hidden select-none cursor-pointer hover:shadow-lg transition-shadow"
      style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400">
          <Zap size={15} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          TRIGGER
        </span>
      </div>
      <div className="mx-3 mb-3 rounded-xl bg-stone-50 dark:bg-white/5 px-3.5 py-2.5">
        <span className="text-sm text-stone-400 dark:text-stone-500">Configure trigger</span>
      </div>
    </div>
  );
}

// ── Trigger shelf (inline, minimal) ────────────────────────────────────────────

type MatchLogic = "already" | "and-will" | "will-only";
type EntryFreq  = "once" | "always";

interface FilterRow {
  id: string;
  connector: "who" | "AND";
  did: "did" | "didn't";
  event: string;
  freq: string;
  range: string;
}

const INITIAL_FILTERS: FilterRow[] = [
  { id: "f1", connector: "who", did: "did",    event: "Product viewed", freq: "greater than 4 times", range: "Last 1 months" },
  { id: "f2", connector: "AND", did: "did",    event: "Sign Up",        freq: "at least once",        range: "Jan 1, 2025"   },
  { id: "f3", connector: "AND", did: "didn't", event: "Add to Cart",    freq: "at least once",        range: "Last 1 months" },
];

const MATCH_OPTIONS: { key: MatchLogic; label: string; desc: string }[] = [
  { key: "already",   label: "Include users that already matched the conditions",        desc: "Only users that matched the conditions in the past will enter the journey." },
  { key: "and-will",  label: "Include users that matched and will match the conditions", desc: "Users that matched the conditions in the past and after the journey launch, will enter it" },
  { key: "will-only", label: "Include users that will match the conditions",             desc: "Only users that will match the conditions after the journey launch will enter it" },
];

const ENTRY_OPTIONS: { key: EntryFreq; label: string; desc: string }[] = [
  { key: "once",   label: "Once",   desc: "This journey will only trigger the first time the user/account matches the conditions" },
  { key: "always", label: "Always", desc: "This journey will trigger every time the user/account matches the conditions" },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
      {children}
      <ChevronDown size={11} className="text-stone-400 shrink-0" />
    </button>
  );
}

function TriggerShelf({ onClose }: { onClose: () => void }) {
  const [filters, setFilters] = useState<FilterRow[]>(INITIAL_FILTERS);
  const [matchLogic, setMatch] = useState<MatchLogic>("will-only");
  const [entryFreq, setFreq]   = useState<EntryFreq>("once");

  function removeFilter(id: string) { setFilters((f) => f.filter((r) => r.id !== id)); }
  function addFilter() {
    setFilters((f) => [...f, { id: `f${Date.now()}`, connector: "AND", did: "did", event: "Select event", freq: "at least once", range: "Last 1 months" }]);
  }

  return (
    <SlidingSidebar
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15">
            <Zap size={14} />
          </span>
          Trigger
        </span>
      }
      onClose={onClose}
      footer={(close) => (
        <>
          <button onClick={close} className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">Cancel</button>
          <button className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>Save</button>
        </>
      )}
    >
      <div className="flex flex-col gap-6 px-5 py-5">
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {filters.map((row, i) => (
            <div key={row.id} className={`px-4 py-3 ${i < filters.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Chip>{row.connector}</Chip>
                <Chip>{row.did}</Chip>
                <Chip><Zap size={12} className="text-emerald-500" />{row.event}</Chip>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip>{row.freq}</Chip>
                <Chip><CalendarDays size={11} className="text-stone-400" />{row.range}</Chip>
                <div className="ml-auto flex items-center gap-1">
                  <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors"><Filter size={11} /></button>
                  <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors"><Copy size={11} /></button>
                  <button onClick={() => removeFilter(row.id)} className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-red-400 dark:text-stone-600 transition-colors"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 border-t bg-stone-50 dark:bg-white/3" style={{ borderColor: "var(--border)" }}>
            <button onClick={addFilter} className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"><Plus size={12} />Add filter</button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"><Plus size={12} />Add group</button>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">Which condition matching logic should be used to enter the journey?</p>
          <div className="flex flex-col gap-2">
            {MATCH_OPTIONS.map((opt) => {
              const active = matchLogic === opt.key;
              return (
                <button key={opt.key} onClick={() => setMatch(opt.key)} className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${active ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/8" : "hover:bg-stone-50 dark:hover:bg-white/4"}`} style={{ borderColor: active ? undefined : "var(--border)" }}>
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-blue-500" : "border-stone-300 dark:border-stone-600"}`}>
                    {active && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-stone-700 dark:text-stone-200"}`}>{opt.label}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">How often should users enter this journey?</p>
          <div className="flex flex-col gap-2">
            {ENTRY_OPTIONS.map((opt) => {
              const active = entryFreq === opt.key;
              return (
                <button key={opt.key} onClick={() => setFreq(opt.key)} className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${active ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/8" : "hover:bg-stone-50 dark:hover:bg-white/4"}`} style={{ borderColor: active ? undefined : "var(--border)" }}>
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-blue-500" : "border-stone-300 dark:border-stone-600"}`}>
                    {active && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-stone-700 dark:text-stone-200"}`}>{opt.label}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SlidingSidebar>
  );
}

// ── Main canvas ────────────────────────────────────────────────────────────────

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.25;
const START_SCALE = 0.5;
const END_SCALE = 1.0;

export default function JourneyNewCanvas() {
  const [scale, setScale]         = useState(START_SCALE);
  const [offset, setOffset]       = useState({ x: 0, y: 0 });
  const [animated, setAnimated]   = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);

  const isPanning = useRef(false);
  const panStart  = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom-in animation on mount
  useEffect(() => {
    const t = setTimeout(() => setScale(END_SCALE), 60);
    return () => clearTimeout(t);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isPanning.current = true;
    setDragging(true);
    panStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    e.currentTarget.style.cursor = "grabbing";
  }, [offset]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isPanning.current) return;
      setOffset({ x: panStart.current.ox + e.clientX - panStart.current.mx, y: panStart.current.oy + e.clientY - panStart.current.my });
    }
    function onUp() {
      if (!isPanning.current) return;
      isPanning.current = false;
      setDragging(false);
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const pct = Math.round(scale * 100);

  const transition = !animated
    ? "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)"
    : dragging
      ? "none"
      : "transform 0.15s ease-out";

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Thin header */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 h-11" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link
          to="/journeys"
          className="flex items-center justify-center h-6 w-6 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
        >
          <ChevronLeft size={15} />
        </Link>
        <span className="text-sm text-stone-400 dark:text-stone-500 italic select-none">Untitled</span>
      </div>

      {/* Canvas area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Floating top-right */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
          <div
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-stone-400 dark:text-stone-500 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm shadow-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <CheckCircle2 size={12} className="text-stone-300 dark:text-stone-600" />
            Minimum two steps required
            <ChevronDown size={11} className="text-stone-300 dark:text-stone-600" />
          </div>
          <button
            disabled
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white shadow-sm cursor-not-allowed"
            style={{ background: "#0080FF", opacity: 0.45 }}
          >
            <Upload size={12} />
            Publish
          </button>
        </div>

        {/* Dot-grid canvas */}
        <div
          ref={canvasRef}
          onMouseDown={onMouseDown}
          className="absolute inset-0 cursor-grab select-none bg-[#f0f2f5] dark:bg-[#111315] bg-[radial-gradient(circle,#c8cdd6_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#2c2f33_1px,transparent_1px)] bg-size-[22px_22px]"
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition,
              willChange: "transform",
            }}
            onTransitionEnd={() => setAnimated(true)}
          >
            <div className="flex flex-col items-center">
              <TriggerNode onClick={() => setShelfOpen(true)} />
              <div className="h-8 w-px bg-stone-300 dark:bg-stone-600" />
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                style={{ background: "var(--content-bg)" }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Zoom controls */}
        <div
          className="absolute bottom-4 right-4 z-10 flex flex-col items-center rounded-xl overflow-hidden shadow-sm"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setScale((s) => Math.min(parseFloat((s + ZOOM_STEP).toFixed(2)), MAX_SCALE))}
            className="flex h-8 w-8 items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
          >
            <Plus size={14} />
          </button>
          <div
            className="text-[10px] font-semibold tabular-nums text-stone-400 dark:text-stone-500 w-full text-center py-1 border-t border-b"
            style={{ borderColor: "var(--border)" }}
          >
            {pct}%
          </div>
          <button
            onClick={() => setScale((s) => Math.max(parseFloat((s - ZOOM_STEP).toFixed(2)), MIN_SCALE))}
            className="flex h-8 w-8 items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors"
          >
            <Minus size={14} />
          </button>
        </div>

        {/* Trigger shelf */}
        {shelfOpen && <TriggerShelf onClose={() => setShelfOpen(false)} />}
      </div>
    </div>
  );
}
