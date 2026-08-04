import { useState, useEffect, useRef } from "react";
import { EMAIL_TEMPLATES } from "../AssetDetailView";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart } from "./shared";
import { GripVertical } from "lucide-react";

function EmailPreviewFrame({ html }: { html: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ scale: 0.5, height: 1 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setFrame({ scale: width / 600, height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="w-full h-full overflow-hidden relative"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <iframe
        srcDoc={html}
        style={{
          width: 600,
          height: Math.ceil(frame.height / frame.scale),
          border: "none",
          display: "block",
          transformOrigin: "top left",
          transform: `scale(${frame.scale})`,
          pointerEvents: "auto",
        }}
        title="Email preview"
      />
    </div>
  );
}

export default function EmailAssetPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const html = EMAIL_TEMPLATES[widget.meta!.assetId as string];

  return (
    <div
      className="group relative aspect-[8/9] rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col"
      style={{ border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <div className="flex-1 min-h-0"><EmailPreviewFrame html={html} /></div>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <span className="absolute left-2 top-1/3 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-stone-400">
        <GripVertical size={14} />
      </span>
    </div>
  );
}
