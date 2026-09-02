import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

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
    <div className="mt-1 rounded-xl overflow-hidden" style={{ background: "var(--content-bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pt-2 pb-2">
        <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Running recipe</span>
        <div className="flex-1" />
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
          {doneCount}/{steps.length} done
        </span>
      </div>

      {/* Step rows */}
      <div className="px-1 pb-2 flex flex-col gap-2">
        {steps.map((step, i) => {
          const isDone   = i < current;
          const isActive = i === current && !allDone;
          return (
            <div key={i} className="flex items-center gap-2.5">
              {isDone ? (
                <div className="w-3.75 h-3.75 shrink-0 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </div>
              ) : isActive ? (
                <Loader2 size={15} className="shrink-0 animate-spin text-blue-500" />
              ) : (
                <div className="w-3.75 h-3.75 shrink-0 rounded-full border-[1.5px] border-stone-200 dark:border-stone-700" />
              )}
              <span
                className={`text-sm leading-snug ${
                  isDone
                    ? "text-stone-400 dark:text-stone-500"
                    : isActive
                    ? "font-semibold text-stone-800 dark:text-stone-100"
                    : "text-stone-500 dark:text-stone-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
