import { useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

/* Trigger word: plan */

export function PlanCard({ content, onApprove, onSkip, fullscreen }: {
  content: string;
  onApprove: () => void;
  onSkip: () => void;
  fullscreen?: boolean;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [decided, setDecided] = useState<"approved" | "skipped" | null>(null);
  const firstLine = content.split("\n")[0];
  const steps = content
    .split("\n")
    .filter((line) => /^\d+\./.test(line.trim()))
    .slice(0, 4);

  function handleApprove() {
    setDecided("approved");
    onApprove();
  }
  function handleSkip() {
    setDecided("skipped");
    onSkip();
  }

  return (
    <>
      <div className={`shrink-0 px-3 pb-2 pt-2 ${fullscreen ? "w-full max-w-3xl mx-auto" : ""}`}>
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            border: "1px solid var(--border)",
            background: "var(--content-bg)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-4 py-4">
            <p className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">
              Want me to execute this plan?
            </p>
            <p
              className="mt-1.5 min-h-12 text-[13px] leading-[1.6] text-stone-600 dark:text-stone-300"
              style={{ animation: "fade-in 180ms ease-out both" }}
            >
              {firstLine}
            </p>
          </div>

          <div
            className="grid transition-[grid-template-rows,opacity] duration-300"
            style={{
              gridTemplateRows: detailsOpen ? "1fr" : "0fr",
              opacity: detailsOpen ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="overflow-hidden">
              <div className="px-3 pb-3">
                <div className="rounded-xl bg-stone-50 px-3 py-2.5 dark:bg-white/[0.04]">
                  <p className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                    Steps
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {steps.map((step) => (
                      <p key={step} className="text-[12.5px] leading-snug text-stone-600 dark:text-stone-300">
                        {step}
                      </p>
                    ))}
                    <button
                      type="button"
                      onClick={() => setReviewOpen(true)}
                      className="mt-0.5 self-start text-[12.5px] font-semibold text-blue-500 transition-colors hover:text-blue-600"
                    >
                      Open full review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <button
              onClick={handleSkip}
              className="h-7 rounded-lg px-2.5 text-[12.5px] font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-stone-100"
            >
              Skip
            </button>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-expanded={detailsOpen}
                onClick={() => setDetailsOpen((current) => !current)}
                className={`h-7 rounded-lg px-2.5 text-[12.5px] font-medium transition-[background-color,transform] duration-100 active:scale-[0.96] ${
                  detailsOpen
                    ? "bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-stone-100"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
                }`}
              >
                Details
              </button>
              <button
                onClick={handleApprove}
                className="h-7 rounded-lg px-3 text-[12.5px] font-semibold text-white transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
                style={{ background: decided === "approved" ? "#0080FF" : "#0080FF" }}
              >
                {decided === "approved" ? "Approved" : "Approve"}
              </button>
            </span>
          </div>
        </div>
      </div>

      {reviewOpen && createPortal(
        <div className="fixed inset-0 z-9999 flex bg-white dark:bg-stone-950">
          {/* Scrollable content — centered with comfortable reading width */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="w-full max-w-xl mx-auto px-10 py-16">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-5">Plan</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          </div>

          {/* Right action panel */}
          <div className="shrink-0 w-52 flex flex-col">
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-800 dark:bg-white/8 dark:text-stone-400 dark:hover:bg-white/14 dark:hover:text-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1" />
            {!decided && (
              <div className="flex flex-col gap-2.5 p-5">
                <button
                  onClick={() => { setReviewOpen(false); handleApprove(); }}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#0080FF" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => { setReviewOpen(false); handleSkip(); }}
                  className="w-full h-10 text-sm font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
