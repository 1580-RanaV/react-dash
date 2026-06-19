import { useEffect, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, Pause, Play, StopCircle } from "lucide-react";

export type ExperienceStatus = "draft" | "active" | "paused" | "stopped";
type DurationUnit = "Days" | "Weeks" | "Months";

function ActionItem({
  icon, iconColor, iconBg, title, description, titleColor, onClick,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  titleColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
        {icon}
      </span>
      <div>
        <p className={`text-xs font-semibold ${titleColor ?? "text-stone-800 dark:text-stone-100"}`}>{title}</p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{description}</p>
      </div>
    </button>
  );
}

const STATUS_STYLE: Record<ExperienceStatus, { label: string; cls: string }> = {
  draft:   { label: "Make Decision", cls: "border border-(--border) text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5" },
  active:  { label: "Active",        cls: "border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600" },
  paused:  { label: "Paused",        cls: "border border-amber-500 bg-amber-500 text-white hover:bg-amber-600 hover:border-amber-600" },
  stopped: { label: "Stopped",       cls: "border border-(--border) bg-(--muted) text-(--muted-foreground) cursor-default" },
};

export default function ExperienceDecisionButton({
  initialStatus = "active",
}: {
  initialStatus?: ExperienceStatus;
}) {
  const [status, setStatus] = useState<ExperienceStatus>(initialStatus);
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(7);
  const [unit, setUnit] = useState<DurationUnit>("Days");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const cfg = STATUS_STYLE[status];
  const canOpen = status !== "stopped";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => canOpen && setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-medium transition-colors ${cfg.cls}`}
      >
        {cfg.label}
        {canOpen && <ChevronDown size={11} className="opacity-70" />}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 overflow-hidden rounded-xl animate-card-in"
          style={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="py-1.5">
            {status === "draft" && (
              <ActionItem
                icon={<Play size={13} />}
                iconColor="text-blue-500"
                iconBg="bg-blue-50 dark:bg-blue-500/10"
                title="Start Experiment"
                description="Begin running the experiment"
                onClick={() => { setStatus("active"); setOpen(false); }}
              />
            )}
            {status === "active" && (
              <ActionItem
                icon={<Pause size={13} />}
                iconColor="text-amber-500"
                iconBg="bg-amber-50 dark:bg-amber-500/10"
                title="Pause Experiment"
                description="Temporarily pause the experiment"
                onClick={() => { setStatus("paused"); setOpen(false); }}
              />
            )}
            {status === "paused" && (
              <ActionItem
                icon={<Play size={13} />}
                iconColor="text-emerald-500"
                iconBg="bg-emerald-50 dark:bg-emerald-500/10"
                title="Resume Experiment"
                description="Continue running the experiment"
                onClick={() => { setStatus("active"); setOpen(false); }}
              />
            )}
            {status !== "stopped" && (
              <ActionItem
                icon={<StopCircle size={13} />}
                iconColor="text-red-500"
                iconBg="bg-red-50 dark:bg-red-500/10"
                title="Stop Experiment"
                description="End the experiment now"
                titleColor="text-red-600 dark:text-red-400"
                onClick={() => { setStatus("stopped"); setOpen(false); }}
              />
            )}
          </div>

          {(status === "active" || status === "paused") && (
            <>
              <div className="mx-4 border-t" style={{ borderColor: "var(--border)" }} />
              <div className="space-y-3 px-4 py-3">
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-100">Extend</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 dark:text-stone-400">Duration</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDuration((d) => Math.max(1, d - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-md border text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                      style={{ borderColor: "var(--border)" }}
                    >−</button>
                    <span className="w-5 text-center text-sm font-semibold text-stone-800 dark:text-stone-100">{duration}</span>
                    <button
                      onClick={() => setDuration((d) => d + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md border text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                      style={{ borderColor: "var(--border)" }}
                    >+</button>
                  </div>
                </div>

                <div className="flex overflow-hidden rounded-lg border p-0.5" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                  {(["Days", "Weeks", "Months"] as DurationUnit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                        unit === u
                          ? "bg-white dark:bg-white/12 text-stone-900 dark:text-stone-100 shadow-sm"
                          : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg h-9 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--primary)" }}
                >
                  <CalendarPlus size={13} />
                  Extend by {duration} {unit}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
