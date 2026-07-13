

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart2, CalendarDays, ChevronDown, CheckCircle2, Clock,
  Copy, Filter, Pause, Plus, Route, Settings, Trash2, Upload, Zap, Circle, X,
} from "lucide-react";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import Toggle from "./Toggle";
import SlidingSidebar from "./SlidingSidebar";
import DateRangePicker from "./DateRangePicker";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";

const JOURNEYS: Record<string, { title: string; status: "Running" | "Draft" | "Paused" }> = {
  "browse-abandonment":        { title: "Browse Abandonment Journey",        status: "Running" },
  "product-based-sends":       { title: "Product-based sends",                status: "Running" },
  "negative-review-response":  { title: "Negative Review Response Journey",   status: "Draft"   },
  "cart-abandonment":          { title: "Cart Abandonment Journey",           status: "Running" },
};

type TabKey = "journey" | "analytics" | "settings";

const TABS: { key: TabKey; icon: React.ReactNode; label: string }[] = [
  { key: "journey",   icon: <Route size={13} />,    label: "Journey"   },
  { key: "analytics", icon: <BarChart2 size={13} />, label: "Analytics" },
  { key: "settings",  icon: <Settings size={13} />,  label: "Settings"  },
];

// ── Canvas nodes ───────────────────────────────────────────────────────────────

type NodeType = "trigger" | "step";

interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  subtitle: string;
}

const INITIAL_NODES: CanvasNode[] = [
  { id: "trigger", type: "trigger", label: "TRIGGER",  subtitle: "Configure trigger" },
  { id: "s1",      type: "step",    label: "STEP",     subtitle: "Send email"        },
  { id: "s2",      type: "step",    label: "STEP",     subtitle: "Wait 1 day"        },
  { id: "s3",      type: "step",    label: "STEP",     subtitle: "Check condition"   },
  { id: "s4",      type: "step",    label: "STEP",     subtitle: "Configure step"    },
];

function JourneyNode({ node, onClick }: { node: CanvasNode; onClick?: () => void }) {
  const isTrigger = node.type === "trigger";
  return (
    <div
      onClick={onClick}
      className="w-60 rounded-2xl border shadow-sm overflow-hidden select-none cursor-pointer hover:shadow-md transition-shadow"
      style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
    >
      {/* Header: icon + type label */}
      <div className="flex items-center gap-3 px-4 pt-3.5 pb-2.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isTrigger
              ? "bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-stone-100 text-stone-400 dark:bg-white/8 dark:text-stone-500"
          }`}
        >
          {isTrigger ? <Zap size={15} /> : <Circle size={14} />}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {node.label}
        </span>
      </div>

      {/* Subtitle row */}
      <div className="mx-3 mb-3 rounded-xl bg-stone-50 dark:bg-white/5 px-3.5 py-2.5">
        <span className="text-sm text-stone-500 dark:text-stone-400">{node.subtitle}</span>
      </div>
    </div>
  );
}

function Connector({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />
      <button
        onClick={onAdd}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-stone-300 dark:border-(--border) text-stone-400 dark:text-stone-500 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 transition-colors z-10"
        style={{ background: "var(--content-bg)" }}
      >
        <Plus size={12} />
      </button>
      <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />
    </div>
  );
}

// ── Trigger shelf ──────────────────────────────────────────────────────────────

type MatchLogic = "already" | "and-will" | "will-only";
type EntryFreq  = "once" | "always";

const MATCH_OPTIONS: { key: MatchLogic; label: string; desc: string }[] = [
  { key: "already",  label: "Include users that already matched the conditions",         desc: "Only users that matched the conditions in the past will enter the journey." },
  { key: "and-will", label: "Include users that matched and will match the conditions",  desc: "Users that matched the conditions in the past and after the journey launch, will enter it" },
  { key: "will-only",label: "Include users that will match the conditions",              desc: "Only users that will match the conditions after the journey launch will enter it" },
];

const ENTRY_OPTIONS: { key: EntryFreq; label: string; desc: string }[] = [
  { key: "once",   label: "Once",   desc: "This journey will only trigger the first time the user/account matches the conditions" },
  { key: "always", label: "Always", desc: "This journey will trigger every time the user/account matches the conditions" },
];

interface FilterRow {
  id: string;
  connector: "who" | "AND";
  did: "did" | "didn't";
  event: string;
  freq: string;
  range: string;
}

const INITIAL_FILTERS: FilterRow[] = [
  { id: "f1", connector: "who", did: "did",    event: "Product viewed", freq: "greater than 4 times", range: "Last 1 months" },
  { id: "f2", connector: "AND", did: "did",    event: "Sign Up",        freq: "at least once",        range: "Jan 1, 2025"   },
  { id: "f3", connector: "AND", did: "didn't", event: "Add to Cart",    freq: "at least once",        range: "Last 1 months" },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors" style={{ borderColor: "var(--border)" }}>
      {children}
      <ChevronDown size={11} className="text-stone-400 shrink-0" />
    </button>
  );
}

function TriggerShelf({ onClose }: { onClose: () => void }) {
  const [filters, setFilters]   = useState<FilterRow[]>(INITIAL_FILTERS);
  const [matchLogic, setMatch]  = useState<MatchLogic>("will-only");
  const [entryFreq, setFreq]    = useState<EntryFreq>("once");

  function removeFilter(id: string) {
    setFilters((f) => f.filter((r) => r.id !== id));
  }

  function addFilter() {
    setFilters((f) => [...f, { id: `f${Date.now()}`, connector: "AND", did: "did", event: "Select event", freq: "at least once", range: "Last 1 months" }]);
  }

  return (
    <SlidingSidebar
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15">
            <Zap size={14} />
          </span>
          Trigger
        </span>
      }
      onClose={onClose}
      footer={(close) => (
        <>
          <button onClick={close} className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">
            Cancel
          </button>
          <button className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
            Save
          </button>
        </>
      )}
    >
      <div className="flex flex-col gap-6 px-5 py-5">

        {/* Filter rows */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {filters.map((row, i) => (
            <div key={row.id} className={`px-4 py-3 ${i < filters.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border)" }}>
              {/* Row 1: connector + did + event */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Chip>{row.connector}</Chip>
                <Chip>{row.did}</Chip>
                <Chip>
                  <Zap size={12} className="text-emerald-500" />
                  {row.event}
                </Chip>
              </div>
              {/* Row 2: freq + range + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Chip>{row.freq}</Chip>
                <Chip>
                  <CalendarDays size={11} className="text-stone-400" />
                  {row.range}
                </Chip>
                <div className="ml-auto flex items-center gap-1">
                  <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors"><Filter size={11} /></button>
                  <button className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 transition-colors"><Copy size={11} /></button>
                  <button onClick={() => removeFilter(row.id)} className="flex h-6 w-6 items-center justify-center rounded text-stone-300 hover:text-red-400 dark:text-stone-600 transition-colors"><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          ))}

          {/* Add filter + Add group */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t bg-stone-50 dark:bg-white/3" style={{ borderColor: "var(--border)" }}>
            <button onClick={addFilter} className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
              <Plus size={12} />
              Add filter
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              <Plus size={12} />
              Add group
            </button>
          </div>
        </div>

        {/* Match logic */}
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">
            Which condition matching logic should be used to enter the journey?
          </p>
          <div className="flex flex-col gap-2">
            {MATCH_OPTIONS.map((opt) => {
              const active = matchLogic === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setMatch(opt.key)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    active
                      ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/8"
                      : "hover:bg-stone-50 dark:hover:bg-white/4"
                  }`}
                  style={{ borderColor: active ? undefined : "var(--border)" }}
                >
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                    {active && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-stone-700 dark:text-stone-200"}`}>{opt.label}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entry frequency */}
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800 dark:text-stone-100">
            How often should users enter this journey?
          </p>
          <div className="flex flex-col gap-2">
            {ENTRY_OPTIONS.map((opt) => {
              const active = entryFreq === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFreq(opt.key)}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    active
                      ? "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/8"
                      : "hover:bg-stone-50 dark:hover:bg-white/4"
                  }`}
                  style={{ borderColor: active ? undefined : "var(--border)" }}
                >
                  <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${active ? "border-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                    {active && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                  </span>
                  <div>
                    <p className={`text-xs font-semibold ${active ? "text-blue-700 dark:text-blue-300" : "text-stone-700 dark:text-stone-200"}`}>{opt.label}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </SlidingSidebar>
  );
}

// ── Journey canvas ─────────────────────────────────────────────────────────────

function JourneyCanvas({ onTriggerOpen }: { onTriggerOpen: () => void }) {
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_NODES);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const [readyOpen, setReadyOpen] = useState(false);
  const readyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (readyRef.current && !readyRef.current.contains(e.target as Node)) setReadyOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function addAfter(index: number) {
    const newNode: CanvasNode = {
      id: `s${Date.now()}`,
      type: "step",
      label: "STEP",
      subtitle: "Configure step",
    };
    setNodes((prev) => [
      ...prev.slice(0, index + 1),
      newNode,
      ...prev.slice(index + 1),
    ]);
  }

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    isPanning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
    e.currentTarget.style.cursor = "grabbing";
  }, [offset]);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!isPanning.current) return;
      setOffset({ x: panStart.current.ox + e.clientX - panStart.current.mx, y: panStart.current.oy + e.clientY - panStart.current.my });
    }
    function onUp() {
      if (!isPanning.current) return;
      isPanning.current = false;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Floating action buttons — no wrapper bg */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
        <div ref={readyRef} className="pointer-events-auto relative">
          <button
            onClick={() => setReadyOpen((o) => !o)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm shadow-sm transition-colors hover:bg-white dark:hover:bg-zinc-800"
            style={{ borderColor: "var(--border)" }}
          >
            <CheckCircle2 size={13} className="text-emerald-500" />
            Ready
            <ChevronDown size={11} className="text-stone-400" />
          </button>

          {readyOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] w-64 rounded-xl shadow-lg border overflow-hidden z-20"
              style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
            >
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide">Pre-publish checklist</p>
              </div>
              <div>
                {[
                  { icon: <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />, label: "Trigger", sub: "Configured" },
                  { icon: <Clock size={15} className="text-amber-400 shrink-0" />, label: "Goal", sub: "Not set (optional)" },
                  { icon: <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />, label: "Journey steps", sub: "2 steps configured" },
                ].map(({ icon, label, sub }) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-sm shadow-sm transition-colors hover:bg-white dark:hover:bg-zinc-800" style={{ borderColor: "var(--border)" }}>
          <Pause size={12} />
          Pause
        </button>
        <button
          className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Upload size={12} />
          Publish
        </button>
      </div>

      <div
        ref={canvasRef}
        onMouseDown={onMouseDown}
        className="absolute inset-0 cursor-grab select-none bg-[#f0f2f5] dark:bg-[#111315] bg-[radial-gradient(circle,#c8cdd6_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#2c2f33_1px,transparent_1px)] bg-size-[22px_22px]"
      >
        <div
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, willChange: "transform" }}
          className="flex flex-col items-center py-16"
        >
          {nodes.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center">
              <JourneyNode
                node={node}
                onClick={node.type === "trigger" ? onTriggerOpen : undefined}
              />
              {i < nodes.length - 1 && <Connector onAdd={() => addAfter(i)} />}
            </div>
          ))}

          <div className="flex flex-col items-center">
            <div className="h-6 w-px bg-stone-300 dark:bg-stone-600" />
            <button
              onClick={() => addAfter(nodes.length - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-stone-300 dark:border-(--border) text-stone-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              style={{ background: "var(--content-bg)" }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Analytics tab ──────────────────────────────────────────────────────────────

const MSG_COLUMNS: TableColumn[] = [
  { key: "name",      label: "Message name",    width: "24%", info: true },
  { key: "sent",      label: "Sent",            width: "8%",  info: true },
  { key: "opens",     label: "Opens",           width: "10%", info: true },
  { key: "clicks",    label: "Clicks",          width: "10%", info: true },
  { key: "replies",   label: "Replies",         width: "10%", info: true },
  { key: "conv",      label: "Conversions",     width: "12%", info: true },
  { key: "revenue",   label: "Revenue",         width: "12%", info: true },
  { key: "revPerMsg", label: "Revenue/Message", width: "14%", info: true },
];

const MSG_ROWS: TableRow[] = [
  {
    id: "all",
    cells: {
      name:      { label: "All messages", tone: "blue" },
      sent:      "0",
      opens:     { value: "0", subValue: "0%" },
      clicks:    { value: "0", subValue: "0%" },
      replies:   { value: "0", subValue: "0%" },
      conv:      { value: "0", subValue: "0%" },
      revenue:   "$0",
      revPerMsg: "$0",
    },
  },
];

function MiniSelect({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
      style={{ borderColor: "var(--border)" }}
    >
      {icon}
      {label}
      <ChevronDown size={11} className="text-stone-400" />
    </button>
  );
}

function JourneyAnalytics() {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Date picker row */}
      <div className="flex items-center shrink-0 pr-3 pt-3">
        <div className="flex-1"><DateRangePicker /></div>
      </div>

      <div className="flex flex-col gap-8 px-4 py-4">
        {/* Message Performance */}
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Message Performance</p>
          <p className="mt-0.5 mb-3 text-xs text-stone-400 dark:text-stone-500">
            Performance metrics for each message in this journey. Compare messages to identify top performers.
          </p>
          <DashboardTable columns={MSG_COLUMNS} rows={MSG_ROWS} hideToolbar />
        </div>

        {/* Journey Funnel Performance */}
        <div
          className="rounded-2xl border"
          style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
        >
          <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Journey Funnel Performance</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                See how journey recipients progress from email engagement through your conversion funnel.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <MiniSelect label="All messages" icon={<BarChart2 size={12} className="text-stone-400" />} />
              <MiniSelect label="No funnel selected" icon={<BarChart2 size={12} className="text-stone-400" />} />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No data yet</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">Select a funnel to see performance data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings tab ───────────────────────────────────────────────────────────────


function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border px-6 py-5" style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}>
      <p className="mb-2 text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      {children}
    </div>
  );
}

type ExitRule = "goal" | "trigger" | "either" | "none";

function JourneySettings() {
  const [setGoal, setSetGoal]             = useState(false);
  const [inboxRotation, setInboxRotation] = useState(false);
  const [recipientTz, setRecipientTz]     = useState(false);
  const [exitRule, setExitRule]           = useState<ExitRule>("none");

  const EXIT_OPTIONS: { key: ExitRule; label: string }[] = [
    { key: "goal",    label: "They achieve the goal" },
    { key: "trigger", label: "They stop matching the trigger conditions" },
    { key: "either",  label: "They achieve the goal or they stop matching the trigger conditions" },
    { key: "none",    label: "Users don't exit early, they move through the entire journey" },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {/* Goal */}
        <SettingCard title="Goal">
          <div className="flex items-center gap-3">
            <Toggle on={setGoal} onClick={() => setSetGoal(v => !v)} />
            <span className="text-sm text-stone-600 dark:text-stone-400">Set goal</span>
          </div>
        </SettingCard>

        {/* Consent */}
        <SettingCard title="Consent">
          <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">
            Only users who are subscribed to this consent will receive the messages:
          </p>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-lg border bg-white dark:bg-(--input) px-3 py-2 text-sm text-stone-700 dark:text-stone-200 outline-none transition-colors hover:bg-stone-50 dark:hover:bg-white/8"
              style={{ borderColor: "var(--border)" }}
              defaultValue="general"
            >
              <option value="general">General</option>
              <option value="marketing">Marketing</option>
              <option value="transactional">Transactional</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </SettingCard>

        {/* Exit Rules */}
        <SettingCard title="Exit Rules">
          <p className="mb-3 text-xs text-stone-500 dark:text-stone-400">A user will exit the journey early, when:</p>
          <div className="flex flex-col gap-3">
            {EXIT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setExitRule(opt.key)}
                className="flex items-center gap-3 text-left"
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${exitRule === opt.key ? "border-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                  {exitRule === opt.key && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </span>
                <span className="text-sm text-stone-700 dark:text-stone-200">{opt.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-400 dark:text-stone-500">
            The exit conditions are checked before sending every message in a journey.
          </p>
        </SettingCard>

        {/* Deliverability */}
        <SettingCard title="Deliverability">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-700 dark:text-stone-200">Inbox rotation</span>
              <Toggle on={inboxRotation} onClick={() => setInboxRotation(v => !v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-700 dark:text-stone-200">Send in recipients timezone</span>
              <Toggle on={recipientTz} onClick={() => setRecipientTz(v => !v)} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">Daily limit</p>
              <input
                type="number"
                placeholder="e.g. 100"
                className="w-36 rounded-lg border bg-white dark:bg-(--input) px-3 py-2 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">Time gap</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 30"
                  className="w-28 rounded-lg border bg-white dark:bg-(--input) px-3 py-2 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                />
                <div className="relative">
                  <select
                    className="appearance-none rounded-lg border bg-white dark:bg-(--input) px-3 py-2 pr-8 text-sm text-stone-700 dark:text-stone-200 outline-none transition-colors hover:bg-stone-50 dark:hover:bg-white/8"
                    style={{ borderColor: "var(--border)" }}
                    defaultValue="hours"
                  >
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
            </div>
          </div>
        </SettingCard>

      </div>
    </div>
  );
}

// ── Main view ──────────────────────────────────────────────────────────────────

export default function JourneyDetailView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabKey) ?? "journey";
  const journey = JOURNEYS[id] ?? JOURNEYS["browse-abandonment"];
  const [triggerOpen, setTriggerOpen] = useState(false);

  function setTab(key: TabKey) {
    navigate(`?tab=${key}`, { replace: true });
  }

  const isLive = journey.status === "Running";

  return (
    <div className="relative flex flex-col h-full overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div
        className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-2.5 gap-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <BackButton href="/journeys" />
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isLive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-stone-400"}`} />
            {isLive ? "Live" : journey.status}
          </span>
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{journey.title}</span>
        </div>

        {/* Segmented tabs */}
        <div className="shrink-0">
          <SubTabCorner
            tabs={TABS.map((t) => ({ key: t.key, label: t.label, icon: t.icon }))}
            active={activeTab}
            onChange={(k) => setTab(k as TabKey)}
          />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "journey" && <JourneyCanvas onTriggerOpen={() => setTriggerOpen(true)} />}
      {activeTab === "analytics" && <JourneyAnalytics />}
      {activeTab === "settings" && <JourneySettings />}

      {triggerOpen && <TriggerShelf onClose={() => setTriggerOpen(false)} />}
    </div>
  );
}
