

import { Filter, Plus } from "lucide-react";

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

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "rgba(0,128,255,0.08)", border: "1px solid rgba(0,128,255,0.15)" }}
        >
          <Filter size={24} className="text-blue-500" />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-stone-800 dark:text-stone-100">
            Build your funnel
          </p>
          <p className="max-w-xs text-sm leading-5 text-stone-500 dark:text-stone-400">
            Add steps to visualize how users progress through key flows in your product.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Plus size={13} />
          Add first step
        </button>
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
