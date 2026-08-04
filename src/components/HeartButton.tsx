import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites, type PinnedWidget } from "../lib/useFavorites";
import { usePlan } from "../lib/usePlan";
import UpgradePlanModal from "./UpgradePlanModal";

interface Props {
  widget: PinnedWidget;
  className?: string;
  hoverOnly?: boolean;
}

export default function HeartButton({ widget, className = "", hoverOnly = false }: Props) {
  const { toggle, isPinned, pinned } = useFavorites();
  const { plan, limit } = usePlan();
  const active = isPinned(widget.id);
  const [burst, setBurst] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!active && limit !== Infinity && pinned.length >= limit) {
      setShowUpgrade(true);
      return;
    }
    if (!active) setBurst(true);
    toggle(widget);
  }

  return (
    <>
      <style>{`
        @keyframes heart-burst {
          0%   { transform: scale(1);    }
          25%  { transform: scale(1.55); }
          55%  { transform: scale(0.85); }
          80%  { transform: scale(1.1);  }
          100% { transform: scale(1);    }
        }
      `}</style>
      <button
        onClick={handleClick}
        onAnimationEnd={() => setBurst(false)}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150
          bg-white dark:bg-stone-900
          ${active
            ? "text-red-500 dark:text-red-400"
            : "text-stone-300 dark:text-stone-600 hover:text-red-400"
          }
          ${hoverOnly && !active ? "opacity-0 group-hover:opacity-100" : ""}
          ${className}`}
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
          border: "1px solid var(--border)",
          animation: burst ? "heart-burst 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards" : undefined,
        }}
        title={active ? "Remove from pinboard" : "Pin to your home"}
      >
        <Heart
          size={13}
          style={{ fill: active ? "currentColor" : "none", transition: "fill 180ms ease" }}
        />
      </button>

      {showUpgrade && (
        <UpgradePlanModal plan={plan} limit={limit} onClose={() => setShowUpgrade(false)} />
      )}
    </>
  );
}
