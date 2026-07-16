

import { useEffect, useRef, useState } from "react";
import { Check, Search, TableRowsSplit } from "lucide-react";

export type Segment = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count?: number;
};

export default function SegmentSelector({
  segments,
  selected,
  onSelect,
}: {
  segments: Segment[];
  selected: Segment;
  onSelect: (seg: Segment) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = segments.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors bg-white text-stone-700 hover:bg-stone-50 dark:bg-(--muted) dark:text-stone-200 dark:hover:bg-white/6"
        style={{ borderColor: "var(--border)" }}
      >
        <TableRowsSplit size={14} className="shrink-0 text-stone-400 dark:text-stone-500" />
        <span>{selected.name}</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-64 rounded-xl overflow-hidden animate-card-in"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          {/* Search */}
          <div className="p-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search segments"
                className="h-9 w-full rounded-lg border bg-stone-50 pl-8 pr-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:bg-white/4 dark:text-stone-200 dark:border-(--border) dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-sm text-stone-400 dark:text-stone-500">
                No segments found
              </p>
            ) : (
              filtered.map((seg) => {
                const active = seg.id === selected.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => { onSelect(seg); setOpen(false); setQuery(""); }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
                      ${active ? "bg-blue-50 dark:bg-blue-500/8" : "hover:bg-stone-50 dark:hover:bg-white/5"}`}
                  >
                    <span className={`shrink-0 ${active ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`}>
                      {seg.icon ?? <TableRowsSplit size={15} />}
                    </span>
                    <span className={`flex-1 min-w-0 truncate font-medium
                      ${active ? "text-blue-700 dark:text-blue-400" : "text-stone-700 dark:text-stone-300"}`}>
                      {seg.name}
                    </span>
                    {active && <Check size={14} className="shrink-0 text-blue-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
