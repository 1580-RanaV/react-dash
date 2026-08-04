import { useState } from "react";
import { Heart, GripVertical } from "lucide-react";
import type { PinnedWidget } from "../../lib/useFavorites";

// ── Shared type ───────────────────────────────────────────────────────────────

export type PreviewProps = {
  widget: PinnedWidget;
  onUnpin?: () => void;
  isOverlay?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
};

// ── Shared keyframes ──────────────────────────────────────────────────────────

export const CARD_STYLES = `
  @keyframes heartbeat {
    0%   { transform: scale(1);    }
    20%  { transform: scale(1.6);  }
    40%  { transform: scale(1);    }
    65%  { transform: scale(1.35); }
    100% { transform: scale(1);    }
  }
  @keyframes card-out {
    0%   { opacity: 1; transform: scale(1);    }
    40%  { opacity: 1; transform: scale(1.01); }
    100% { opacity: 0; transform: scale(0.94); }
  }
`;

// ── Shared hooks / helpers ────────────────────────────────────────────────────

export function useCardRemove(onUnpin?: () => void) {
  const [removing, setRemoving] = useState(false);
  function handleUnpin() {
    if (!onUnpin) return;
    setRemoving(true);
    setTimeout(onUnpin, 680);
  }
  const removeStyle: React.CSSProperties = removing
    ? { animation: "card-out 0.65s ease-in forwards" }
    : {};
  return { removing, handleUnpin, removeStyle };
}

export function cardOverlay(isOverlay: boolean): React.CSSProperties {
  return isOverlay
    ? { boxShadow: "0 16px 48px rgba(0,0,0,0.22)", transform: "scale(1.03)", cursor: "grabbing" }
    : {};
}

// ── Shared sub-components ─────────────────────────────────────────────────────

export function PinboardHeart({ onClick, removing }: { onClick: () => void; removing: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onPointerDown={e => e.stopPropagation()}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-stone-900 text-red-500 transition-transform hover:scale-110"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        border: "1px solid var(--border)",
        animation: removing ? "heartbeat 0.55s ease-in-out" : undefined,
      }}
      title="Remove from pinboard"
    >
      <Heart size={13} className="fill-current" />
    </button>
  );
}

export function CardGrip({ light = false }: { light?: boolean }) {
  return (
    <span className={`absolute left-2 top-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none ${light ? "text-white/40" : "text-stone-300 dark:text-stone-600"}`}>
      <GripVertical size={14} />
    </span>
  );
}
