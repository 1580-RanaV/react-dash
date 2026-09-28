import { useState } from "react";
import { Box, ChevronDown } from "lucide-react";
import type { Citation } from "../types";

/* Reference list under a Blu reply — which fields/attributes the answer
   drew from, numbered to match inline [n] markers a real citation system
   would place in the text itself (not modeled here — this is just the list).
   Collapsed by default behind a simple "Citations (n)" toggle, same
   grid-template-rows expand technique LiveRun uses for its stage list. */

export function Citations({ items }: { items: Citation[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
      >
        <Box size={12} className="shrink-0" />
        Citations ({items.length})
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-100 dark:bg-white/8">
          <ChevronDown
            size={11}
            className="transition-transform duration-300"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)" }}
          />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows,opacity] duration-300"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 pt-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ animation: "fade-up 250ms ease-out both" }}>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">[{i + 1}]</span>
                <span className="text-stone-600 dark:text-stone-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
