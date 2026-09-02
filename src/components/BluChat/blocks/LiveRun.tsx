import { useEffect, useRef, useState } from "react";
import { ChevronDown, CheckCheck } from "lucide-react";
import { STAGE_ROWS, STAGE_MS, TOTAL_MS, ASKED_FOR, fmtDuration } from "./QueryStages";

/* Trigger word: live-run */

export function LiveRunProgressCircle({ progress, done, indeterminate }: { progress: number; done: boolean; indeterminate?: boolean }) {
  const size = 28;
  const stroke = 2.25;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  const [tickDrawn, setTickDrawn] = useState(false);
  useEffect(() => {
    if (!done) { setTickDrawn(false); return; }
    const id = requestAnimationFrame(() => setTickDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [done]);

  return (
    <span
      className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
      style={{ background: done ? "#0080FF" : "transparent" }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={indeterminate && !done ? { animation: "spin 1s linear infinite" } : { transform: "rotate(-90deg)" }}
      >
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(120,120,120,0.24)" strokeWidth={stroke} />
        {!done && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#0080FF"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={indeterminate ? `${circumference * 0.28} ${circumference * 0.72}` : circumference}
            strokeDashoffset={indeterminate ? undefined : dashOffset}
            style={indeterminate ? undefined : { transition: "stroke-dashoffset 500ms cubic-bezier(0.23,1,0.32,1)" }}
          />
        )}
      </svg>
      {done && (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" className="relative">
          <polyline
            points="20 6 9 17 4 12"
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={24}
            strokeDashoffset={tickDrawn ? 0 : 24}
            style={{ transition: "stroke-dashoffset 350ms ease-out" }}
          />
        </svg>
      )}
    </span>
  );
}

export function LiveRun({ onDone }: { onDone?: () => void } = {}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const done = stageIndex >= STAGE_ROWS.length;
  const currentLabel = STAGE_ROWS[done ? STAGE_ROWS.length - 1 : stageIndex].label;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setStageIndex((i) => i + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [stageIndex, done]);

  const doneRef = useRef(false);
  useEffect(() => {
    if (!done || doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  }, [done, onDone]);

  return (
    <div className="mt-1 flex w-full max-w-64 flex-col gap-2">
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          animation: "fade-up 420ms cubic-bezier(0.23,1,0.32,1) both",
        }}
      >
        <div className="flex h-13 w-full items-center gap-3 px-3 text-left">
          <LiveRunProgressCircle progress={stageIndex / STAGE_ROWS.length} done={done} />
          {done ? (
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-stone-900 dark:text-stone-100" style={{ animation: "fade-up 250ms ease-out both" }}>
              {currentLabel}
            </span>
          ) : (
            <span
              key={currentLabel}
              className="min-w-0 flex-1 truncate bg-clip-text text-[13px] font-semibold text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-text 1.4s linear infinite, fade-up 250ms ease-out both",
              }}
            >
              {currentLabel}
            </span>
          )}
          {done && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200"
              style={{ background: "var(--raised)" }}
            >
              <ChevronDown
                size={14}
                className="transition-transform duration-300"
                style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>
          )}
        </div>

        {done && (
          <div
            className="grid transition-[grid-template-rows,opacity] duration-300"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
              opacity: expanded ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-1 px-3 py-2">
                {STAGE_ROWS.map((stage) => (
                  <div key={stage.label} className="flex min-h-7 w-full items-center gap-2 rounded-md px-1 py-0.5">
                    <CheckCheck size={14} strokeWidth={2.5} className="shrink-0 text-stone-400 dark:text-stone-500" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-stone-700 dark:text-stone-200">{stage.label}</span>
                    <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-stone-400 dark:text-stone-500">{fmtDuration(stage.ms)}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between gap-3 border-t px-1 pt-2" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[12.5px] font-medium text-stone-700 dark:text-stone-200">Total time</span>
                  <span className="shrink-0 font-mono text-[11.5px] font-semibold tabular-nums text-stone-700 dark:text-stone-200">{fmtDuration(TOTAL_MS)}</span>
                </div>
              </div>

              <div className="px-3 pb-2 pt-1">
                <p className="text-[12.5px] font-semibold text-stone-700 dark:text-stone-200">What was asked for</p>
                <div className="mt-1 flex items-center justify-between gap-3 px-1">
                  <span className="text-[12.5px] text-stone-400 dark:text-stone-500">{ASKED_FOR.label}</span>
                  <span className="text-[12.5px] text-stone-600 dark:text-stone-300">{ASKED_FOR.value}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
