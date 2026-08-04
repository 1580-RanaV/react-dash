import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

export default function PortraitAssetPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const gradient = widget.meta!.gradient as string[];
  const image    = widget.meta?.image as string | undefined;

  return (
    <div
      className="group relative aspect-3/4 overflow-hidden rounded-xl select-none cursor-grab active:cursor-grabbing"
      style={{ background: `linear-gradient(145deg, ${gradient[0]}, ${gradient[1]})`, ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      {image && <img src={image} alt={widget.label} className="absolute inset-0 h-full w-full object-cover" />}
      <div
        className="absolute inset-x-0 bottom-0 px-3.5 pb-4 pt-16"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
      >
        <p className="text-base font-bold leading-tight text-white">{widget.label}</p>
      </div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <CardGrip light />
    </div>
  );
}
