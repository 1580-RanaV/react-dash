

import { Plus } from "lucide-react";

const FUNNEL_STEPS = [
  { label: "View page",        value: "572.42K", pct: 100,  prior: "" },
  { label: "Sign Up Started",  value: "314",     pct: 0.1,  prior: "0.1% of prior step" },
  { label: "Signed up",        value: "85",      pct: 27.1, prior: "27.1% of prior step" },
];

export function FunnelMiniChart({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`w-full ${compact ? "px-3 py-2" : "px-5 py-5"}`}>
      <div className="grid grid-cols-3 gap-3">
        {FUNNEL_STEPS.map((step, index) => (
          <div key={step.label} className="min-w-0">
            <div className="border-l-2 border-blue-500 pl-2.5">
              <p className={`${compact ? "text-lg" : "text-3xl"} font-bold tracking-tight text-stone-900 dark:text-stone-100`}>
                {step.value}
              </p>
              <p className={`${compact ? "text-[11px]" : "text-sm"} truncate text-stone-500 dark:text-stone-400`}>
                {index + 1} - {step.label}
              </p>
              {!compact && step.prior && (
                <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{step.prior}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-4 grid grid-cols-3 gap-3 ${compact ? "h-20" : "h-56"}`}>
        {FUNNEL_STEPS.map((step, index) => (
          <div key={step.label} className="relative overflow-hidden rounded-md bg-blue-100 dark:bg-blue-500/14">
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-blue-500"
              style={{ width: `${index === 0 ? 100 : Math.max(18, step.pct)}%`, opacity: index === 0 ? 0.82 : 0.22 }}
            />
            {index === 0 && (
              <div
                className="absolute right-[-22%] top-0 h-full w-[42%] bg-blue-300/65 dark:bg-blue-400/28"
                style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-3">
        {FUNNEL_STEPS.map((_, index) => (
          <p key={index} className={`${compact ? "text-[10px]" : "text-xs"} text-center text-stone-500 dark:text-stone-400`}>
            Step {index + 1}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function FunnelsTab() {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Controls bar */}
      <div className="shrink-0 px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            <Plus size={13} />
            Add step
          </button>
          <div className="ml-auto flex items-center gap-2">
            <ControlPill label="Unique users" />
            <ControlPill label="Any order" />
            <ControlPill label="within 30 days" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <FunnelMiniChart />
      </div>
    </div>
  );
}

function ControlPill({ label }: { label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400">
        <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
