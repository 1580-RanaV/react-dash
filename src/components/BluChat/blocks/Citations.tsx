import { useState, type ReactNode } from "react";
import { Asterisk, ChevronDown } from "lucide-react";
import type { Citation } from "../types";

/* Citation system for Blu replies, in two parts that work together:
   - CitationBadge / renderWithCitations: small monochrome inline markers
     dropped directly into the reply text at the point they support (via a
     `[[n]]` or grouped `[[n,m]]` marker in the raw string), same neutral
     chip style everywhere — no blue "look at me" color, just a subtle
     off-shade background, so a paragraph with several of these doesn't
     read as scattered colored noise.
   - Citations: the collapsed "Citations (n)" list at the end of a reply,
     mapping each number back to the attribute/field it came from. Same
     badge component as the inline markers, so the two halves of the
     system visually agree with each other. */

export function CitationBadge({ n }: { n: number | string }) {
  return (
    <span
      className="inline-flex h-4.25 min-w-4.25 items-center justify-center rounded px-1 text-[10px] font-semibold tabular-nums text-stone-600 dark:text-stone-300"
      style={{ background: "var(--border)" }}
    >
      {n}
    </span>
  );
}

const CITATION_MARKER_RE = /\[\[([\d,]+)\]\]/g;

// Splits a chunk of reply text on `[[n]]` / `[[n,m,...]]` markers and
// renders each as a tight cluster of CitationBadges, so callers (the
// streaming and settled text renderers) both get the same inline result.
export function renderWithCitations(text: string, keyPrefix: string): ReactNode {
  if (!text.includes("[[")) return text;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  CITATION_MARKER_RE.lastIndex = 0;
  while ((match = CITATION_MARKER_RE.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const nums = match[1].split(",");
    parts.push(
      <span key={`${keyPrefix}-cite-${i}`} className="inline-flex items-center gap-0.5 mx-0.5 align-super">
        {nums.map((n) => <CitationBadge key={n} n={n} />)}
      </span>
    );
    lastIndex = CITATION_MARKER_RE.lastIndex;
    i++;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

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
        <Asterisk size={16} className="shrink-0" />
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
                <CitationBadge n={i + 1} />
                <span className="text-stone-600 dark:text-stone-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
