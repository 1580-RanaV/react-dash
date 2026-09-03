import { useState } from "react";
import { LiveRunProgressCircle, DeclinedBadge } from "./LiveRun";

/* Trigger word: accept-run
 * Same card shell as `run`/`live-run` (width, rounded corners,
 * border, shadow, animation) — heading, a plain wrapping
 * description, and an Accept/Decline button pair while pending.
 * Once decided, it collapses to a single row matching the rest of
 * the run-card family: badge + title, same as a completed `run`. */

const TITLE = "Want me to place this restock order?";
const DESCRIPTION =
  "Reorder waffle cones from Cone King with lead time 7 days. Stock is projected to run out by Friday at current sales pace.";

export function AcceptRun() {
  const [decision, setDecision] = useState<"pending" | "accepted" | "declined">("pending");

  if (decision !== "pending") {
    return (
      <div
        className="mt-1 flex w-full max-w-64 flex-col gap-2 overflow-hidden rounded-xl"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          animation: "fade-up 420ms cubic-bezier(0.23,1,0.32,1) both",
        }}
      >
        <div className="flex w-full items-center gap-3 px-3 py-3 text-left">
          {decision === "accepted" ? <LiveRunProgressCircle progress={1} done /> : <DeclinedBadge />}
          <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-stone-900 dark:text-stone-100">{TITLE}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-1 flex w-full max-w-64 flex-col gap-3 rounded-xl px-3 py-3"
      style={{
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        animation: "fade-up 420ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <p className="text-[13px] font-semibold leading-snug text-stone-900 dark:text-stone-100">{TITLE}</p>
      <p className="text-[12.5px] leading-relaxed text-stone-500 dark:text-stone-400">{DESCRIPTION}</p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setDecision("declined")}
          className="flex h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-stone-200"
          style={{ border: "1px solid var(--border)" }}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => setDecision("accepted")}
          className="flex h-8 items-center rounded-full px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
