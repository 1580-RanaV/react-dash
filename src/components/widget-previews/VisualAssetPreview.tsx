import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

function getKind(widgetType: unknown) {
  const value = String(widgetType ?? "").toLowerCase();
  if (value.includes("avatar")) return "Avatar";
  if (value.includes("scene")) return "Scene";
  if (value.includes("pose")) return "Pose";
  return "Asset";
}

export default function VisualAssetPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const gradient = widget.meta?.gradient as string[] | undefined;
  const image = widget.meta?.image as string | undefined;
  const kind = getKind(widget.meta?.widgetType);

  return (
    <div
      className="group relative aspect-video overflow-hidden rounded-xl select-none cursor-grab active:cursor-grabbing"
      style={{
        background: gradient ? `linear-gradient(145deg, ${gradient[0]}, ${gradient[1]})` : "var(--content-bg)",
        border: "1px solid var(--border)",
        ...removeStyle,
        ...cardOverlay(isOverlay),
      }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      {image && (
        <img
          src={image}
          alt={widget.label}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div
        className="absolute inset-x-0 bottom-0 px-3.5 pb-3 pt-14"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
      >
        <p className="text-sm font-bold leading-tight text-white truncate">{widget.label}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/55">{kind}</p>
      </div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <CardGrip light />
    </div>
  );
}
