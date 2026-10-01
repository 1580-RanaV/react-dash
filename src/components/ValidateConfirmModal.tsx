import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Coins, CircleAlert, X } from "lucide-react";

// Shared by RecipeCanvasView and RecipesView's draft Validate button — same
// two-stage confirm, used by both Validate entry points so the copy and the
// one-time "insufficient credits" mock stay in sync regardless of which
// surface the user validated from. Same portal/backdrop/card language as
// DeleteConfirmDialog, so every confirm-style modal in the app reads as one
// system.

export type ValidateModalStage = "confirm" | "insufficient";

export default function ValidateConfirmModal({
  stage, onCancel, onContinue, onTryAgain,
}: {
  stage: ValidateModalStage;
  onCancel: () => void;
  onContinue: () => void;
  onTryAgain: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  if (!mounted) return null;

  const isConfirm = stage === "confirm";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onCancel} />

      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-card-in"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex flex-col gap-8 px-7 py-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className={`flex items-center gap-2 text-base font-semibold ${isConfirm ? "text-stone-800 dark:text-stone-100" : "text-red-500"}`}>
                {isConfirm
                  ? <Coins size={16} className="text-blue-500 shrink-0" />
                  : <CircleAlert size={16} className="text-red-500 shrink-0" />}
                {isConfirm ? "Validate this recipe?" : "Not enough credits"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-500 dark:text-stone-400">
                {isConfirm
                  ? "This checks every step and draws credits from your workspace balance. Once it passes, anyone on your team can run this recipe."
                  : "Your workspace is out of credits right now. Please top up your balance to continue validating."}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Footer */}
          {isConfirm ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 items-center rounded-lg border border-stone-200 px-5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#3b82f6" }}
              >
                Continue
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onTryAgain}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold bg-(--border) text-stone-600 hover:bg-stone-300 dark:text-stone-300 dark:hover:bg-white/14 transition-colors active:scale-[0.98]"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
