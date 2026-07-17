
import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import DesktopOnlyGate from "./DesktopOnlyGate";

const ASSET_NAMES: Record<string, string> = {
  "a1":  "Claude design - Email 1",
  "a2":  "Built a flash sale SMS using Liquid product variables with a 7-day expiry",
  "a3":  "Removed the JSON wrapper entirely — outputting only the raw HTML",
  "a4":  "Generate an image of the brand character holding a can of Co",
  "a5":  "Generate an image of the brand character holding a water tumbler",
  "a6":  "a beautifully wrapped gift box with a satin ribbon on a clean surface",
  "a7":  "Create an image of the brand character holding a bottle",
  "a8":  "Dev Patel, solo founder, sitting at a rustic desk with a laptop",
  "a9":  "diverse group of tech professionals collaborating in a modern office",
  "a10": "dramatic overhead shot of scattered shopping bags and gift boxes",
  "a11": "Product photography of a pair of classic black leather penny loafers",
  "a12": "change character's pink pants to grey shorts",
};

export default function AssetDetailView({ id, onBack }: { id: string; onBack: () => void }) {
  return <DesktopOnlyGate><AssetDetailViewInner id={id} onBack={onBack} /></DesktopOnlyGate>;
}

function AssetDetailViewInner({ id, onBack }: { id: string; onBack: () => void }) {
  const title = ASSET_NAMES[id] ?? "Untitled asset";
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("open-blu-chat")), 80);
    return () => clearTimeout(t);
  }, []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.2, z * (1 - e.deltaY * 0.001))));
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const el = containerRef.current;
    const lx = el ? el.clientWidth  * 0.65 : 500;
    const ly = el ? el.clientHeight * 0.65 : 400;
    setPan((p) => ({
      x: Math.min(lx, Math.max(-lx, p.x + dx)),
      y: Math.min(ly, Math.max(-ly, p.y + dy)),
    }));
  }

  function stopDrag() { dragging.current = false; }

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden animate-fade-up"
      style={{ background: "var(--main-bg)" }}
    >
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <BackButton onClick={onBack} />
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
          {title}
        </span>
      </div>

      {/* Dotted canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden select-none"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div
          className="flex min-h-full items-center justify-center p-16"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
        />
      </div>
    </div>
  );
}
