import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { type Plan } from "../lib/usePlan";

export default function UpgradePlanModal({
  plan,
  limit,
  onClose,
}: {
  plan: Plan;
  limit: number;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!mounted) return null;

  void plan; void limit;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-card-in"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)",
        }}
      >
{/* X button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
        >
          <X size={14} className="text-stone-400 dark:text-stone-500" />
        </button>

        {/* Mobile: stack. Desktop: side-by-side */}
        <div className="relative flex flex-col sm:flex-row sm:items-stretch">
          {/* Image — top on mobile, right on desktop */}
          <div className="order-first sm:order-last sm:w-1/2 shrink-0 overflow-hidden">
            <img
              src="/gpt-img.png"
              alt=""
              aria-hidden
              className="w-full object-contain sm:h-full sm:object-cover"
            />
          </div>

          {/* Text + button */}
          <div className="flex flex-col justify-between px-6 pt-6 pb-7 text-center sm:text-left sm:px-7 sm:pt-10 sm:pb-8 sm:w-1/2 min-w-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-stone-900 dark:text-stone-50 mb-2.5">
                Upgrade your plan
              </h2>
              <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                Pin more, automate more, analyse more. Unlock the full power of Intempt and leave limits behind.
              </p>
            </div>
            <a
              href="/settings/billing"
              onClick={onClose}
              className="mt-6 inline-flex h-11 items-center justify-center self-center sm:self-start rounded-xl px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #2a96ff 0%, #0066ee 100%)" }}
            >
              Upgrade
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
