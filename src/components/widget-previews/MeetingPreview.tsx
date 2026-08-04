import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

export default function MeetingPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume]   = useState(0.8);

  function stop(e: React.PointerEvent | React.MouseEvent) { e.stopPropagation(); }

  return (
    <div
      className="group relative aspect-video rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ background: "#0c0c0c", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip light />

      {/* z-10 ensures the heart is above the flex-1 play area which sits in normal flow */}
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2 z-10"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.04), transparent 34%), linear-gradient(to top, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.02) 100%)" }}
      />

      {/* Centre play/pause — pointer-events on the button only, not the wrapper */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <button
          onPointerDown={stop}
          onClick={e => { stop(e); setPlaying(p => !p); }}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-transform pointer-events-auto hover:scale-105"
          style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
        >
          {playing
            ? <Pause size={18} className="text-white" />
            : <Play  size={18} className="text-white fill-white translate-x-px" />}
        </button>
      </div>

      {/* Bottom control bar */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col px-3 pb-3 pt-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 46%, transparent 100%)" }}
      >
        <p className="mb-1.5 pr-9 text-sm font-bold leading-tight text-white truncate">{widget.label}</p>
        <div className="flex items-center gap-2">
          {/* Volume */}
          <div className="ml-auto flex items-center gap-1.5">
            <Volume2 size={11} className="text-white/60 shrink-0" />
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onPointerDown={stop}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-12 cursor-pointer sm:w-14"
              style={{ accentColor: "white", height: 3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
