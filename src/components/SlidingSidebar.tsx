import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";

export default function SlidingSidebar({
  title,
  description,
  children,
  footer,
  footerBorder = true,
  contentClassName,
  headerActions,
  onClose,
}: {
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode | ((close: () => void) => React.ReactNode);
  footerBorder?: boolean;
  contentClassName?: string;
  headerActions?: React.ReactNode;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(true);

  // vaul's own scroll-lock only runs on iOS Safari (checked in its source —
  // everything else is a no-op on desktop), so the page behind still shows
  // its native scrollbar the whole time the drawer is open: a thin strip
  // that no amount of overlay color/opacity can cover, since a real
  // scrollbar is browser-drawn UI above all page content. Lock it here
  // instead, same "hide + compensate with padding" approach vaul uses.
  useEffect(() => {
    const html = document.documentElement;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prevOverflow = html.style.overflow;
    const prevPaddingRight = html.style.paddingRight;
    html.style.overflow = "hidden";
    if (scrollbarWidth > 0) html.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPaddingRight;
    };
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={(next) => { if (!next) close(); }}
      // Waits for vaul's own close transition to finish before telling the
      // parent to actually unmount this component, instead of guessing at
      // a timeout — real unmount mid-animation would cut the slide-out short.
      onAnimationEnd={(stillOpen) => { if (!stillOpen) onClose(); }}
      // Passing a container sets data-vaul-custom-container, which turns
      // off vaul's built-in drag/bounce-gap cover (a ::after that paints
      // the panel's own background straight across the floating gap) — a
      // trick this non-dragging, floating drawer has no use for anyway.
      container={document.body}
    >
      <DrawerPortal>
        <DrawerOverlay className="bg-black/60 backdrop-blur-[2px]" />
        <DrawerContent
          className="w-[70vw] sm:w-[54%] sm:max-w-115 rounded-2xl border"
          style={{
            // Inline, not Tailwind inset-y-4/right-4 — the base DrawerContent
            // ships data-[vaul-drawer-direction=right]:inset-y-0/right-0 for
            // the flush-to-edge default, and those fought the utility
            // classes for the same properties instead of losing to them.
            // Inline style always wins the cascade, so the "floating" gap
            // actually renders on every edge instead of just top/bottom.
            top: 16,
            right: 16,
            bottom: 16,
            background: "var(--content-bg)",
            borderColor: "var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div className="shrink-0 px-5 pb-4 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {typeof title === "string" ? (
                  <DrawerTitle className="mb-1 text-lg font-bold text-stone-900 dark:text-stone-100">
                    {title}
                  </DrawerTitle>
                ) : (
                  <DrawerTitle asChild>
                    <div>{title}</div>
                  </DrawerTitle>
                )}
                {description ? (
                  <DrawerDescription className="text-sm leading-5 text-stone-500 dark:text-stone-400">
                    {description}
                  </DrawerDescription>
                ) : null}
              </div>
              {headerActions && (
                <div className="mt-0.5 flex shrink-0 items-center gap-1">{headerActions}</div>
              )}
              <button
                onClick={close}
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto ${contentClassName ?? "px-5 pb-5"}`}>{children}</div>

          {footer ? (
            // Stacked, full-width, primary action on top — every consumer
            // still renders its own buttons in (Cancel, primary) order, so
            // flex-col-reverse puts the primary one first without touching
            // any of their markup. *:w-full stretches whatever they render;
            // *:text-center covers plain-text buttons, *:justify-center
            // covers the (more common) inline-flex ones, where centering is
            // governed by justify-content, not text-align.
            <div className="flex shrink-0 flex-col-reverse gap-2 px-5 py-4 *:w-full *:text-center *:justify-center">
              {typeof footer === "function" ? footer(close) : footer}
            </div>
          ) : null}
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
