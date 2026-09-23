import { useEffect, useState } from "react";
import { LiveRunProgressCircle } from "./LiveRun";

/* Recipe execution — fired via the "blu-recipe-run" window event after create-recipe */

export function ExecChecklist({ steps }: { steps: string[] }) {
  const [current, setCurrent] = useState(0);
  const doneCount = Math.min(current, steps.length);
  const allDone = current >= steps.length;

  useEffect(() => {
    if (allDone) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 1050);
    return () => clearTimeout(t);
  }, [current, allDone]);

  return (
    <div className="mt-1 flex w-full max-w-64 flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Running recipe</span>
        <div className="flex-1" />
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
          {doneCount}/{steps.length} done
        </span>
      </div>

      {/* One run card per step, same as a single-task run */}
      {steps.map((step, i) => {
        const isDone = i < current;
        const isActive = i === current && !allDone;
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              animation: `fade-up 420ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms both`,
            }}
          >
            <div className="flex h-13 w-full items-center gap-3 px-3 text-left">
              <LiveRunProgressCircle progress={isDone ? 1 : 0} done={isDone} indeterminate={isActive} />
              <span
                className={`min-w-0 flex-1 truncate text-[13px] font-semibold ${
                  isDone ? "text-stone-400 dark:text-stone-500" : "text-stone-900 dark:text-stone-100"
                }`}
              >
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
