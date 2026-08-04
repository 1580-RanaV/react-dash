import { Package } from "lucide-react";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

export default function ProductPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const image = widget.meta?.image as string | undefined;

  return (
    <div
      className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col h-44"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip />
      <div className="flex-1 min-h-0 flex items-center justify-center bg-stone-50 dark:bg-white/4 overflow-hidden">
        {image
          ? <img src={image} alt={widget.label} className="w-full h-full object-contain p-4" />
          : <Package size={32} className="text-stone-300 dark:text-stone-600" />}
      </div>
      <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--content-bg)" }}>
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{widget.label}</p>
      </div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
    </div>
  );
}
