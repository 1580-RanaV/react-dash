import { useEffect, useState } from "react";
import type { RunTask } from "../types";
import { LiveRunProgressCircle } from "./LiveRun";

/* Trigger words: run, run-2, run-3 */

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
    <div className="mt-1 flex w-full max-w-64 flex-col gap-2">
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
              <LiveRunProgressCircle progress={done ? 1 : 0} done={!!done} indeterminate />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-stone-900 dark:text-stone-100">
                {task.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
