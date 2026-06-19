

import { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../BackButton";
import SubTabCorner from "../SubTabCorner";
import {
  CalendarDays, ChevronDown, ChevronRight,
  Clock, Copy, Filter, GripVertical, Layers, MapPin, Plus, Tag, Trash2, X,
} from "lucide-react";
import { BOARDS_DATA } from "./boardsData";
import InsightsTab from "./InsightsTab";

type TabKey = "insights" | "funnels" | "retention";

const TABS: { key: TabKey; label: string }[] = [
  { key: "insights",  label: "Insights"  },
  { key: "funnels",   label: "Funnels"   },
  { key: "retention", label: "Retention" },
];

const SERIES = [
  { key: "a", label: "A", color: "#0080FF", event: "Session start", metric: "Total events", total: "1.18M" },
  { key: "b", label: "B", color: "#8B5CF6", event: "Session End",   metric: "Total events", total: "1.10M" },
];

function PanelSection({
  title, icon, children, defaultOpen = true,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        <span className="text-stone-400 dark:text-stone-500 shrink-0">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {open
          ? <ChevronDown size={13} className="text-stone-400 shrink-0" />
          : <ChevronRight size={13} className="text-stone-400 shrink-0" />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function FormatButtons({ active }: { active: string }) {
  const opts = ["$", "%", "#", "ab"];
  return (
    <div className="flex items-center gap-px rounded-md border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      {opts.map((o) => (
        <button
          key={o}
          className={`flex h-6 w-7 items-center justify-center text-xs font-semibold transition-colors
            ${o === active
              ? "bg-blue-500 text-white"
              : "text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 dark:text-stone-500"
            }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function MiniDropdown({ label, fullWidth = true }: { label: string; fullWidth?: boolean }) {
  return (
    <button
      className={`flex items-center justify-between rounded-lg border px-2.5 h-9  text-left text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5 mt-1.5 ${fullWidth ? "w-full" : ""}`}
      style={{ borderColor: "var(--border)" }}
    >
      <span>{label}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400 shrink-0 ml-2">
        <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function SeriesItem({ label, color, event, metric, total }: {
  label: string; color: string; event: string; metric: string; total: string;
}) {
  return (
    <div className="mb-2.5 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold text-white" style={{ background: color }}>
          {label}
        </span>
        <GripVertical size={13} className="text-stone-300 dark:text-stone-600 cursor-grab" />
        <div className="flex-1" />
        <button className="flex h-5 w-5 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors">
          <Filter size={11} />
        </button>
        <button className="flex h-5 w-5 items-center justify-center rounded text-stone-300 hover:text-red-400 dark:text-stone-600 transition-colors">
          <X size={11} />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500 shrink-0">Format</span>
        <FormatButtons active="#" />
        <div className="flex-1" />
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0">{total}</span>
      </div>
      <MiniDropdown label="Event" />
      <MiniDropdown label={event} />
      <div className="w-[65%]">
        <MiniDropdown label={metric} />
      </div>
    </div>
  );
}

function FunnelStepItem({ number, event }: { number: number; event: string }) {
  return (
    <div className="mb-2.5 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2">
        <GripVertical size={13} className="text-stone-300 dark:text-stone-600 cursor-grab shrink-0" />
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "#0080FF" }}>
          {number}
        </span>
        <button
          className="flex flex-1 items-center justify-between rounded-lg border px-2.5 h-9  text-left text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          <span>{event}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400 shrink-0 ml-2">
            <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors">
          <Filter size={12} />
        </button>
        <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-red-400 dark:text-stone-600 transition-colors">
          <X size={12} />
        </button>
      </div>
      <div className="mt-2.5 flex items-center gap-2 pl-1">
        <input type="checkbox" className="h-3.5 w-3.5 rounded accent-blue-500" />
        <span className="text-xs text-stone-500 dark:text-stone-400">First time only</span>
      </div>
    </div>
  );
}

export default function BoardDetailView({ id }: { id: string }) {
  const board = BOARDS_DATA.find((b) => b.id === id) ?? BOARDS_DATA[0];
  const [activeTab, setActiveTab] = useState<TabKey>("insights");
  const [unit, setUnit] = useState<"users" | "accounts">("users");

  return (
    <div className="flex flex-col h-full animate-fade-up">
      {/* Top bar: breadcrumb left, segmented control pinned right */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 text-sm min-w-0 pr-4">
          <BackButton href="/boards" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{board.title}</span>
        </div>

        {/* Segmented control — always pinned right */}
        <div className="shrink-0">
          <SubTabCorner
            tabs={TABS}
            active={activeTab}
            onChange={(k) => setActiveTab(k as TabKey)}
          />
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: tab content — 70% */}
        <div className="flex flex-col overflow-hidden" style={{ flex: "0 0 70%" }}>
          <InsightsTab />
        </div>

        {/* Right: config panel — 30% */}
        <aside className="flex flex-col gap-3 overflow-y-auto px-4 pt-3 pb-6" style={{ flex: "0 0 30%" }}>

          {/* Users / Accounts + Annotations — now at the top */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {(["Users", "Accounts"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u.toLowerCase() as "users" | "accounts")}
                      className={`px-2.5 h-9  rounded-lg text-xs font-medium transition-colors ${
                        unit === u.toLowerCase()
                          ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                          : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                <button className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
                  <MapPin size={13} className="text-stone-400" />
                  Annotations
                </button>
              </div>

              {/* Series / Steps / Events card — mt aligns top with chart start */}
              <div className="rounded-xl border mt-2" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                <PanelSection
                  title={activeTab === "funnels" ? "Steps" : activeTab === "retention" ? "Events" : "Series"}
                  icon={<span className="text-sm font-bold">#</span>}
                >
                  {activeTab === "retention" ? (
                    <div className="flex flex-col gap-3">
                      {[
                        { label: "Anchor event",      event: SERIES[0].event },
                        { label: "Return condition",   event: SERIES[1].event },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="mb-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300">{item.label}</p>
                          <div className="flex items-center gap-1.5">
                            <button
                              className="flex flex-1 items-center justify-between rounded-lg border px-2.5 h-9  text-left text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                              style={{ borderColor: "var(--border)" }}
                            >
                              <span>{item.event}</span>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400 shrink-0 ml-2">
                                <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-stone-300 hover:text-stone-500 transition-colors" style={{ borderColor: "var(--border)" }}>
                              <Filter size={12} />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-2 pl-0.5">
                            <input type="checkbox" className="h-3.5 w-3.5 rounded accent-blue-500" />
                            <span className="text-xs text-stone-500 dark:text-stone-400">First time only</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activeTab === "funnels" ? (
                    <>
                      {SERIES.map((s, i) => (
                        <FunnelStepItem key={s.key} number={i + 1} event={s.event} />
                      ))}
                      <button className="mt-1 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                        <Plus size={13} />
                        Add step
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Formula</span>
                        <div className="relative h-5 w-9 rounded-full cursor-pointer" style={{ background: "var(--border)" }}>
                          <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                        </div>
                      </div>
                      {SERIES.map((s) => (
                        <SeriesItem key={s.key} label={s.label} color={s.color} event={s.event} metric={s.metric} total={s.total} />
                      ))}
                      <button className="mt-1 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                        <Plus size={13} />
                        Add graph series
                      </button>
                    </>
                  )}
                </PanelSection>
              </div>

              {/* Funnel-only: Conversion window */}
              {activeTab === "funnels" && (
                <>
                  <div className="rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                    <PanelSection title="Conversion window" icon={<Clock size={13} />}>
                      <div className="flex items-stretch gap-2">
                        <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                          <input
                            type="number"
                            defaultValue={30}
                            className="w-12 px-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-transparent outline-none h-full"
                          />
                          <div className="flex flex-col border-l self-stretch" style={{ borderColor: "var(--border)" }}>
                            <button className="flex flex-1 w-5 items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-50 dark:hover:bg-white/5">
                              <ChevronDown size={9} className="rotate-180" />
                            </button>
                            <button className="flex flex-1 w-5 items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-50 dark:hover:bg-white/5 border-t" style={{ borderColor: "var(--border)" }}>
                              <ChevronDown size={9} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="flex flex-1 items-center justify-between rounded-lg border px-2.5 h-9  text-left text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <span>days</span>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400 shrink-0 ml-2">
                            <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </PanelSection>
                  </div>
                </>
              )}

              {/* Retention-only: Retention window */}
              {activeTab === "retention" && (
                <div className="rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                  <PanelSection title="Retention window" icon={<CalendarDays size={13} />}>
                    <MiniDropdown label="Daily" />
                  </PanelSection>
                </div>
              )}

              {/* Funnel + Retention: Measuring */}
              {(activeTab === "funnels" || activeTab === "retention") && (
                <div className="rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                  <PanelSection title="Measuring" icon={<Tag size={13} />}>
                    <MiniDropdown label={activeTab === "retention" ? "Retention rate" : "Conversion rate"} />
                  </PanelSection>
                </div>
              )}

              {/* Filter card */}
              <div className="rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                <PanelSection title="Filter" icon={<Filter size={13} />}>
                  <MiniDropdown label="Select" />
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex-1 min-w-0"><MiniDropdown label="is" /></div>
                    <button className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600 dark:border-(--border) dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
                      <Copy size={12} />
                    </button>
                    <button className="mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:border-(--border) dark:hover:bg-red-500/8" style={{ borderColor: "var(--border)" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <button className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                    <Plus size={13} />
                    Add filter
                  </button>
                </PanelSection>
              </div>

              {/* Breakdown card */}
              <div className="rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
                <PanelSection title="Breakdown" icon={<Layers size={13} />}>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                    <Plus size={13} />
                    Add breakdown
                  </button>
                </PanelSection>
              </div>
        </aside>
      </div>
    </div>
  );
}
