import { useRef, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * GLIDE MENU
 * A single highlight pill that smoothly slides/resizes to
 * whichever row is hovered, instead of each row's background
 * popping in and out on its own. Rows opt in via a `data-row`
 * attribute (configurable) and keep their own hover state as
 * an instant fallback — the glide pill just rides on top of
 * (and visually replaces) it while the pointer is inside.
 * ───────────────────────────────────────────────────────── */

type GlideRect = { top: number; left: number; width: number; height: number };

export default function GlideMenu({
  children,
  rowSelector = "[data-row]",
  className = "",
  highlightClassName = "",
}: {
  children: ReactNode;
  rowSelector?: string;
  className?: string;
  highlightClassName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<GlideRect | null>(null);
  const [visible, setVisible] = useState(false);

  function updateFromTarget(target: EventTarget | null) {
    const container = containerRef.current;
    if (!container) return;
    const el = (target as Element)?.closest?.(rowSelector) as HTMLElement | null;
    if (!el || !container.contains(el)) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setRect({
      top: elRect.top - containerRect.top,
      left: elRect.left - containerRect.left,
      width: elRect.width,
      height: elRect.height,
    });
    setVisible(true);
  }

  return (
    <div
      ref={containerRef}
      className={`group/glide relative ${className}`}
      onPointerOver={(e) => updateFromTarget(e.target)}
      onPointerLeave={() => setVisible(false)}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 transition-[transform,width,height,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${highlightClassName}`}
        style={{
          width: rect?.width ?? 0,
          height: rect?.height ?? 0,
          transform: `translate3d(${rect?.left ?? 0}px, ${rect?.top ?? 0}px, 0)`,
          opacity: visible && rect ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}
