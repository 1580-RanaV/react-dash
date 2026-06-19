

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Copy, Plus, Search, Trash2 } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

// ── data ──────────────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  "Messaged email",
  "Opened email",
  "Clicked email",
  "Bounced email",
  "Deferred email",
  "Marked as spam email",
  "Unsubscribed email",
  "Messaged SMS",
  "Opened SMS",
  "Clicked SMS",
  "Unsubscribed SMS",
  "Page viewed",
  "Form submitted",
  "Button clicked",
  "Custom event",
];

const FILTER_ATTRIBUTES = [
  "Email subject",
  "Email link",
  "Campaign name",
  "Contact email",
  "Contact ID",
  "Tag",
];

const FILTER_OPERATORS = ["Is", "Is not", "Contains", "Does not contain", "Starts with", "Ends with"];

// ── types ─────────────────────────────────────────────────────────────────────

type Filter = { id: string; attribute: string; operator: string };
type FilterGroup = { id: string; joinOperator: "AND" | "OR"; filters: Filter[] };

function uid() { return Math.random().toString(36).slice(2); }
function makeFilter(): Filter { return { id: uid(), attribute: "", operator: "Is" }; }
function makeGroup(): FilterGroup { return { id: uid(), joinOperator: "AND", filters: [makeFilter()] }; }

// ── FieldLabel ────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
      {children}
    </p>
  );
}

// ── EventTypeSelect (portal dropdown) ─────────────────────────────────────────

function EventTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  function openDropdown() {
    setRect(btnRef.current?.getBoundingClientRect() ?? null);
    setOpen(true);
  }

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = EVENT_TYPE_OPTIONS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  const dropdown =
    open && rect
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[200] rounded-xl overflow-hidden shadow-xl"
            style={{
              top: rect.bottom + 6,
              left: rect.left,
              width: rect.width,
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="p-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 bg-stone-50 dark:bg-white/5">
                <Search size={13} className="text-stone-400 shrink-0" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-sm outline-none text-stone-700 dark:text-stone-300 placeholder:text-stone-400"
                />
              </div>
            </div>
            <div className="max-h-[240px] overflow-y-auto py-1">
              {filtered.map((t) => (
                <button
                  key={t}
                  onMouseDown={() => { onChange(t); setOpen(false); setSearch(""); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === t
                      ? "bg-stone-100 dark:bg-white/8 text-stone-900 dark:text-stone-100 font-medium"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/6"
                  }`}
                >
                  {t}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-4 py-3 text-xs text-stone-400">No results</p>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
        style={{
          border: "1px solid var(--border)",
          background: "var(--content-bg)",
          color: value ? "var(--foreground)" : "#94a3b8",
        }}
      >
        <span>{value || "Select event type..."}</span>
        {open
          ? <ChevronUp size={14} className="text-stone-400 shrink-0" />
          : <ChevronDown size={14} className="text-stone-400 shrink-0" />}
      </button>
      {dropdown}
    </>
  );
}

// ── Small inline dropdowns ────────────────────────────────────────────────────

function SmallSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  wide = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${wide ? "flex-1" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-1.5 h-9 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-stone-50 dark:hover:bg-white/5 ${wide ? "w-full" : ""}`}
        style={{
          border: "1px solid var(--border)",
          background: "var(--content-bg)",
          color: value ? "var(--foreground)" : "#94a3b8",
        }}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={11} className="text-stone-400 shrink-0" />
      </button>
      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-xl overflow-hidden shadow-xl"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            minWidth: wide ? "100%" : 160,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                opt === value ? "bg-stone-100 dark:bg-white/8 font-semibold" : "hover:bg-stone-50 dark:hover:bg-white/6"
              } text-stone-700 dark:text-stone-300`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Join operator (AND / OR) button between groups ────────────────────────────

function JoinOperatorToggle({
  value,
  onChange,
}: {
  value: "AND" | "OR";
  onChange: (v: "AND" | "OR") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-center my-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
        style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}
      >
        {value}
        {open
          ? <ChevronUp size={11} className="text-stone-400" />
          : <ChevronDown size={11} className="text-stone-400" />}
      </button>
      {open && (
        <div
          className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 z-50 rounded-xl overflow-hidden shadow-xl"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", minWidth: 88 }}
        >
          {(["OR", "AND"] as const).map((op) => (
            <button
              key={op}
              onMouseDown={() => { onChange(op); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                op === value ? "bg-stone-100 dark:bg-white/8" : "hover:bg-stone-50 dark:hover:bg-white/6"
              } text-stone-700 dark:text-stone-300`}
            >
              {op}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function CreateEventDrawer({ onClose }: { onClose: () => void }) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [groups, setGroups] = useState<FilterGroup[]>([makeGroup()]);

  function addGroup() {
    setGroups((g) => [...g, makeGroup()]);
  }

  function deleteGroup(id: string) {
    setGroups((g) => (g.length > 1 ? g.filter((gr) => gr.id !== id) : g));
  }

  function setGroupJoin(id: string, op: "AND" | "OR") {
    setGroups((g) => g.map((gr) => (gr.id === id ? { ...gr, joinOperator: op } : gr)));
  }

  function addFilter(gid: string) {
    setGroups((g) =>
      g.map((gr) => (gr.id === gid ? { ...gr, filters: [...gr.filters, makeFilter()] } : gr))
    );
  }

  function deleteFilter(gid: string, fid: string) {
    setGroups((g) =>
      g.map((gr) =>
        gr.id === gid ? { ...gr, filters: gr.filters.filter((f) => f.id !== fid) } : gr
      )
    );
  }

  function dupFilter(gid: string, fid: string) {
    setGroups((g) =>
      g.map((gr) => {
        if (gr.id !== gid) return gr;
        const idx = gr.filters.findIndex((f) => f.id === fid);
        const copy = { ...gr.filters[idx], id: uid() };
        const filters = [...gr.filters];
        filters.splice(idx + 1, 0, copy);
        return { ...gr, filters };
      })
    );
  }

  function updateFilter(gid: string, fid: string, patch: Partial<Filter>) {
    setGroups((g) =>
      g.map((gr) =>
        gr.id === gid
          ? { ...gr, filters: gr.filters.map((f) => (f.id === fid ? { ...f, ...patch } : f)) }
          : gr
      )
    );
  }

  return (
    <SlidingSidebar
      title={
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Untitled event"
          className="w-full bg-transparent text-lg font-bold text-stone-900 dark:text-stone-100 outline-none placeholder:text-stone-300 dark:placeholder:text-stone-600"
        />
      }
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create event
          </button>
        </>
      )}
    >
      <div className="space-y-6">
        {/* Event type */}
        <div>
          <FieldLabel>Event type</FieldLabel>
          <EventTypeSelect value={eventType} onChange={setEventType} />
        </div>

        {/* Conditions — shown after event type selected */}
        {eventType && (
          <div>
            <FieldLabel>
              Conditions{" "}
              <span className="normal-case font-normal tracking-normal">(optional)</span>
            </FieldLabel>

            <div>
              {groups.map((group, gi) => (
                <div key={group.id}>
                  {gi > 0 && (
                    <JoinOperatorToggle
                      value={group.joinOperator}
                      onChange={(op) => setGroupJoin(group.id, op)}
                    />
                  )}

                  <div
                    className="rounded-xl p-3 space-y-2"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    {group.filters.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-2">
                        <SmallSelect
                          value={filter.attribute}
                          onChange={(v) => updateFilter(group.id, filter.id, { attribute: v })}
                          options={FILTER_ATTRIBUTES}
                          placeholder="Select"
                          wide
                        />
                        <SmallSelect
                          value={filter.operator}
                          onChange={(v) => updateFilter(group.id, filter.id, { operator: v })}
                          options={FILTER_OPERATORS}
                        />
                        <button
                          type="button"
                          onClick={() => dupFilter(group.id, filter.id)}
                          className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-300"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFilter(group.id, filter.id)}
                          className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Group footer */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => addFilter(group.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-stone-200"
                      >
                        <Plus size={13} />
                        Add filter
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add group */}
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={addGroup}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <Plus size={13} />
                  Add group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SlidingSidebar>
  );
}
