

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Code, Copy, Edit3, Link, LucideIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type ThreeDotsMenuItem = {
  label: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
  onClick?: () => void;
};

export const DEFAULT_MENU_ITEMS: ThreeDotsMenuItem[] = [
  { label: "Edit", icon: Edit3 },
  { label: "Embed", icon: Code },
  { label: "Copy link", icon: Copy },
  { label: "Delete", icon: Trash2, tone: "danger" },
];

export const BOARDS_MENU_ITEMS: ThreeDotsMenuItem[] = [
  { label: "Rename", icon: Pencil },
  { label: "Delete", icon: Trash2, tone: "danger" },
];

export const ASSET_MENU_ITEMS: ThreeDotsMenuItem[] = [
  { label: "Edit", icon: Edit3 },
  { label: "Copy preview link", icon: Link },
  { label: "Delete", icon: Trash2, tone: "danger" },
];

export default function ThreeDotsMenu({
  items = DEFAULT_MENU_ITEMS,
  align = "right",
}: {
  items?: ThreeDotsMenuItem[];
  align?: "left" | "right";
}) {
  const [clientReady, setClientReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => { setClientReady(true); }, []);

  function openMenu() {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
  }

  function closeMenu() {
    setVisible(false);
    closeTimerRef.current = window.setTimeout(() => setMounted(false), 170);
  }

  function toggleMenu() {
    if (mounted && visible) closeMenu();
    else openMenu();
  }

  useEffect(() => {
    if (!mounted) return;
    function handlePointerDown(event: PointerEvent) {
      if (!buttonRef.current?.contains(event.target as Node)) closeMenu();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const dropdown = mounted ? (
    <div
      style={{
        position: "fixed",
        top: pos.top,
        right: pos.right,
        zIndex: 9999,
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
      }}
      className={`w-40 overflow-hidden rounded-lg shadow-xl transition-all duration-150 ease-out ${
        visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-[0.98] opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        {items.map((item, index) => {
          const Icon = item.icon;
          const danger = item.tone === "danger";
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => { item.onClick?.(); closeMenu(); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors ${
                danger
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  : "text-stone-900 hover:bg-stone-50 dark:text-stone-100 dark:hover:bg-white/6"
              } ${index === items.length - 1 && danger ? "border-t border-stone-200 dark:border-(--border)" : ""}`}
            >
              <Icon size={14} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); toggleMenu(); }}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-white/8 dark:hover:text-stone-100 ${
          mounted ? "bg-stone-100 text-stone-900 dark:bg-white/8 dark:text-stone-100" : ""
        }`}
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {clientReady ? createPortal(dropdown, document.body) : null}
    </>
  );
}
