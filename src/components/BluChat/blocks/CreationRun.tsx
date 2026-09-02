import { useEffect, useState } from "react";
import type { RunTask } from "../types";

/* Trigger words: run, run-2, run-3 */

export function RunNumberBadge({ index, done, state }: { index: number; done?: boolean; state?: "done" | "active" | "pending" }) {
  const size = 28;
  const stroke = 2.25;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isDone = state ? state === "done" : !!done;
  const isSpinning = state ? state === "active" : !done;

  return (
    <span
      className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors ${
        isDone ? "text-white" : "text-stone-600 dark:text-stone-300"
      }`}
      style={{ background: isDone ? "#0080FF" : "transparent" }}
    >
      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={isSpinning ? { animation: "spin 1.1s linear infinite" } : undefined}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDone ? "#0080FF" : "rgba(120,120,120,0.24)"}
          strokeWidth={stroke}
        />
        {isSpinning && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#0080FF"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.28} ${circumference * 0.72}`}
          />
        )}
      </svg>
      <span className="relative">{index}</span>
    </span>
  );
}

export function CreationRunStatus({ tasks }: { tasks: RunTask[] }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timers = tasks.map((task, index) => (
      setTimeout(() => {
        setCompleted((current) => ({ ...current, [task.id]: true }));
      }, 2000)
    ));

    return () => timers.forEach(clearTimeout);
  }, [tasks]);

  return (
    <div className="mt-1 flex w-full max-w-sm flex-col gap-2">
      {tasks.map((task, index) => {
        const done = completed[task.id];

        return (
          <div
            key={task.id}
            className="overflow-hidden rounded-xl"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              animation: `fade-up 420ms cubic-bezier(0.23,1,0.32,1) ${index * 80}ms both`,
            }}
          >
            <div className="flex h-13 w-full items-center gap-3 px-3 text-left">
              <RunNumberBadge index={index + 1} done={done} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-stone-900 dark:text-stone-100">
                  {task.label}
                </span>
                <span className="block truncate text-[12px] text-stone-400 dark:text-stone-500">
                  {done ? "Completed" : task.detail}
                </span>
              </span>
              {done ? (
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-blue-50 px-2 text-[11.5px] font-semibold text-blue-500 dark:bg-blue-500/12 dark:text-blue-300">
                  Completed
                </span>
              ) : (
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-stone-100 px-2 text-[11.5px] font-medium text-stone-500 dark:bg-white/8 dark:text-stone-400">
                  Pending
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
