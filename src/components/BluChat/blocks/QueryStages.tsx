

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CheckCheck, ChevronDown, Sparkle } from "lucide-react";

/* ─────────────────────────────────────────────────────────
 * QUERY TRACE — the "Ran N stages · 1 query" disclosure
 * shown after a custom-report query resolves. Each stage
 * genuinely runs for STAGE_MS before the next one starts —
 * a ticking-clock icon spins while it's working, then swaps
 * to a sparkle once every stage has settled.
 * ───────────────────────────────────────────────────────── */

export const STAGE_ROWS: { label: string; ms: number }[] = [
  { label: "Everything else", ms: 18 },
  { label: "Choosing the route", ms: 4114 },
  { label: "Running the query", ms: 13757 },
  { label: "Reading the catalog", ms: 1443 },
  { label: "Composing the query", ms: 10980 },
  { label: "Writing the reading", ms: 12690 },
];
export const TOTAL_MS = STAGE_ROWS.reduce((sum, r) => sum + r.ms, 0);
export const ASKED_FOR = { label: "Profile", value: "users" };

export function fmtDuration(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

const WARMUP_MS = 400;
export const STAGE_MS = 4000;
const SETTLE_DELAY_MS = 900;

function TickingClock({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0 text-stone-400 dark:text-stone-500">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line
        x1="12" y1="12" x2="12" y2="7.5"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className="animate-spin"
        style={{ transformBox: "view-box", transformOrigin: "12px 12px", animationDuration: "6s" }}
      />
      <line
        x1="12" y1="12" x2="15.5" y2="12"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        className="animate-spin"
        style={{ transformBox: "view-box", transformOrigin: "12px 12px", animationDuration: "1.6s" }}
      />
    </svg>
  );
}

function StageIcon({ state }: { state: "active" | "done" }) {
  if (state === "active") {
    return <span className="size-3 shrink-0 rounded-full border-[1.5px] border-stone-300 border-t-stone-500 dark:border-white/15 dark:border-t-stone-300" style={{ animation: "spin 700ms linear infinite" }} />;
  }
  return <CheckCheck size={14} strokeWidth={2.5} className="shrink-0 text-stone-400 dark:text-stone-500" />;
}

type Phase = "warmup" | "running" | "settled";

export default function QueryStages({ onSettled }: { onSettled?: () => void }) {
  const [phase, setPhase] = useState<Phase>("warmup");
  const [completed, setCompleted] = useState(0);
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  useEffect(() => {
    if (phase === "warmup") {
      const t = setTimeout(() => setPhase("running"), WARMUP_MS);
      return () => clearTimeout(t);
    }
    if (phase === "running") {
      if (completed >= STAGE_ROWS.length) {
        const t = setTimeout(() => setPhase("settled"), SETTLE_DELAY_MS);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setCompleted((c) => c + 1), STAGE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, completed]);

  const working = phase !== "settled";
  const autoExpanded = phase !== "settled";
  const expanded = manualExpanded ?? autoExpanded;
  const visibleCount = phase === "warmup" ? 0 : phase === "settled" ? STAGE_ROWS.length : Math.min(completed + 1, STAGE_ROWS.length);

  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);
  useLayoutEffect(() => {
    if (traceRef.current) setLineHeight(traceRef.current.offsetHeight);
  }, [visibleCount, expanded, phase]);

  const settledRef = useRef(false);
  useEffect(() => {
    if (phase !== "settled" || settledRef.current) return;
    settledRef.current = true;
    onSettled?.();
  }, [phase, onSettled]);

  return (
    <div className="flex w-full max-w-[460px] flex-col">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((cur) => !(cur ?? autoExpanded))}
        className="-mx-1.5 flex w-fit items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors duration-100 hover:bg-stone-100 dark:hover:bg-white/6"
      >
        {working ? (
          <TickingClock />
        ) : (
          <span
            className="relative flex shrink-0 items-center justify-center text-stone-500 dark:text-stone-400"
            style={{ width: 14, height: 14, animation: "fade-up 300ms ease-out both" }}
          >
            <Sparkle size={14} fill="currentColor" strokeWidth={0} className="absolute inset-0" />
            <Sparkle size={14} fill="currentColor" strokeWidth={0} className="absolute inset-0" style={{ transform: "rotate(45deg)" }} />
          </span>
        )}
        {working ? (
          <span
            className="bg-clip-text text-[13px] font-semibold whitespace-nowrap text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
              backgroundSize: "200% 100%",
              animation: "shimmer-text 1.4s linear infinite",
            }}
          >
            Running query…
          </span>
        ) : (
          <span
            className="text-[13px] font-normal whitespace-nowrap text-stone-500 dark:text-stone-400"
            style={{ animation: "fade-up 350ms ease-out both" }}
          >
            Ran {STAGE_ROWS.length} stages · 1 query
          </span>
        )}
        <ChevronDown
          size={13}
          className="shrink-0 text-stone-400 transition-transform duration-300"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-400"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ml-[5px] pl-4">
            <span
              aria-hidden
              className="absolute left-[3px] w-px"
              style={{
                top: -8,
                height: lineHeight ? lineHeight - 2 : 0,
                background: "var(--border)",
                transition: "height 500ms cubic-bezier(0.23,1,0.32,1)",
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-1 py-1">
              {STAGE_ROWS.slice(0, visibleCount).map((row, i) => {
                const isDone = i < completed || phase === "settled";
                return (
                  <div key={row.label} className="flex min-h-7 w-full items-center gap-2 rounded-[6px] px-1.5 py-0.5" style={{ animation: "fade-up 320ms cubic-bezier(0.23,1,0.32,1) both" }}>
                    <StageIcon state={isDone ? "done" : "active"} />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-stone-900 dark:text-stone-100">{row.label}</span>
                    <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-stone-400 dark:text-stone-500">
                      {isDone ? fmtDuration(row.ms) : "…"}
                    </span>
                  </div>
                );
              })}
              {phase === "settled" && (
                <div
                  className="mt-0.5 flex items-center justify-between gap-3 px-1.5 pt-1"
                  style={{ animation: "fade-up 320ms cubic-bezier(0.23,1,0.32,1) both" }}
                >
                  <span className="text-[12.5px] font-medium text-stone-700 dark:text-stone-200">Total time</span>
                  <span className="shrink-0 font-mono text-[11.5px] font-semibold tabular-nums text-stone-700 dark:text-stone-200">
                    {fmtDuration(TOTAL_MS)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {phase === "settled" && (
            <div className="mt-3 ml-[5px] pl-4" style={{ animation: "fade-up 320ms cubic-bezier(0.23,1,0.32,1) both" }}>
              <p className="text-[12.5px] font-semibold text-stone-700 dark:text-stone-200">What was asked for</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[12.5px] text-stone-400 dark:text-stone-500">{ASKED_FOR.label}</span>
                <span className="text-[12.5px] text-stone-600 dark:text-stone-300">{ASKED_FOR.value}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
