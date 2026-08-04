import { GripVertical } from "lucide-react";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart } from "./shared";

export default function DesignPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const colors = (widget.meta?.colors as string[] | undefined) ?? ["#ccc", "#eee", "#aaa", "#f5f5f5"];

  return (
    <div
      className="group relative aspect-video rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <div className="flex flex-1 min-h-0">
        {colors.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
      </div>
      <div className="shrink-0 flex items-center gap-3 px-4 py-3.5" style={{ background: "var(--content-bg)" }}>
        <div
          className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white dark:ring-stone-800"
          style={{ background: `conic-gradient(${colors[0]} 0deg 180deg, ${colors[1]} 180deg 360deg)` }}
        />
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{widget.label}</span>
      </div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2.5 top-2.5"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <span className="absolute left-2 top-3 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-400">
        <GripVertical size={14} />
      </span>
    </div>
  );
}
