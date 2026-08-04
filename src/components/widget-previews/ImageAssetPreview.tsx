import { Image } from "lucide-react";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

export default function ImageAssetPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const image = widget.meta?.image as string | undefined;
  const aspectRatio = Number(widget.meta?.aspectRatio ?? 1);

  return (
    <div
      className="group relative overflow-hidden rounded-xl select-none cursor-grab active:cursor-grabbing"
      style={{
        aspectRatio: Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1,
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
        ...removeStyle,
        ...cardOverlay(isOverlay),
      }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip />
      <div className="absolute inset-0 flex items-center justify-center bg-stone-50 dark:bg-white/4">
        {image ? (
          <img src={image} alt={widget.label} className="h-full w-full object-contain p-3" />
        ) : (
          <Image size={30} className="text-stone-300 dark:text-stone-600" />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-12"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 100%)" }}
      >
        <p className="truncate text-sm font-bold leading-tight text-white">{widget.label}</p>
      </div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
    </div>
  );
}
