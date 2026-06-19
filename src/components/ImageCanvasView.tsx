

import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";

type CanvasItem =
  | { id: string; state: "generating" }
  | { id: string; state: "done" }
  | { id: string; state: "editing" };

export default function ImageCanvasView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Open Blu Chat on mount
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("open-blu-chat")), 80);
    return () => clearTimeout(t);
  }, []);

  // Listen for message sends from BluChat
  useEffect(() => {
    function handleGenerate() {
      setItems((prev) => {
        const hasDone = prev.some((i) => i.state === "done");
        if (hasDone) {
          // Edit existing image: put done items into editing state
          return prev.map((i) => i.state === "done" ? { ...i, state: "editing" as const } : i);
        }
        // No image yet: add a new generating card
        return [...prev, { id: String(Date.now()), state: "generating" as const }];
      });

      setTimeout(() => {
        setItems((prev) =>
          prev.map((i) => {
            if (i.state === "editing") return { ...i, state: "done" as const };
            if (i.state === "generating") return { ...i, state: "done" as const };
            return i;
          })
        );
      }, 5000);
    }
    window.addEventListener("blu-image-generate", handleGenerate);
    return () => window.removeEventListener("blu-image-generate", handleGenerate);
  }, []);

  // Wheel → zoom toward center
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.2, z * (1 - e.deltaY * 0.001))));
  }

  // Drag → pan with clamp
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
    const limitX = el ? el.clientWidth  * 0.65 : 500;
    const limitY = el ? el.clientHeight * 0.65 : 400;

    setPan((p) => ({
      x: Math.min(limitX, Math.max(-limitX, p.x + dx)),
      y: Math.min(limitY, Math.max(-limitY, p.y + dy)),
    }));
  }

  function stopDrag() { dragging.current = false; }

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--main-bg)" }}>
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <BackButton onClick={onBack} />
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Untitled image</span>
      </div>

      {/* Canvas */}
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
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          {items.length === 0 ? (
            <p className="select-none text-sm text-stone-400 dark:text-stone-600">
              Describe an image in the chat
            </p>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center" style={{ pointerEvents: "none" }}>
              {items.map((item) => (
                <CanvasCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CanvasCard({ item }: { item: CanvasItem }) {
  const isGenerating = item.state === "generating";
  const isEditing = item.state === "editing";

  return (
    <div
      className="relative overflow-hidden shadow-lg"
      style={{
        width: 680,
        aspectRatio: "16/9",
        borderRadius: isGenerating ? 16 : 0,
        transition: "border-radius 0.3s ease",
      }}
    >
      {/* Fresh placeholder */}
      {isGenerating && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, #e7e5e4 0%, #e7e5e4 35%, #f5f5f4 50%, #e7e5e4 65%, #e7e5e4 100%)",
              backgroundSize: "300% 100%",
              animation: "shimmer-sweep 2s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* Existing image — shown for both done and editing */}
      {(item.state === "done" || isEditing) && (
        <img
          src="/hero.png"
          alt="Generated"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            animation: item.state === "done" && !isEditing ? "reveal-image 1.6s ease-out both" : "none",
            filter: isEditing ? "blur(6px)" : "none",
            transition: isEditing ? "none" : "filter 0.6s ease-out",
          }}
        />
      )}

      {/* Edit shimmer overlay */}
      {isEditing && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(105deg, transparent 0%, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%, transparent 100%)",
              backgroundSize: "300% 100%",
              animation: "shimmer-sweep 1.8s ease-in-out infinite",
            }}
          />
        </>
      )}
    </div>
  );
}
