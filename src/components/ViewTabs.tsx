
import { useLayoutEffect, useRef, useState } from "react";

export type ViewTab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | null;
  dot?: boolean;
};

type Indicator = { left: number; top: number; width: number; height: number };

export default function ViewTabs<K extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "flex items-center gap-1 px-4 pt-3 shrink-0",
}: {
  tabs: readonly (Omit<ViewTab, "key"> & { key: K })[];
  activeTab: string;
  onChange?: (key: K) => void;
  className?: string;
}) {
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const btn = buttonRefs.current.get(activeTab);
      if (!btn) return;
      setIndicator({ left: btn.offsetLeft, top: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeTab, tabs]);

  return (
    <div className={`relative ${className}`}>
      {indicator && (
        <span
          aria-hidden
          className="absolute rounded-lg bg-blue-50 dark:bg-blue-500/10 transition-[left,top,width,height] duration-300 ease-out"
          style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }}
        />
      )}
      {tabs.map((t) => (
        <button
          key={t.key}
          ref={(el) => { if (el) buttonRefs.current.set(t.key, el); else buttonRefs.current.delete(t.key); }}
          onClick={() => onChange?.(t.key)}
          className={`relative z-10 flex h-9 items-center gap-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200
            ${activeTab === t.key
              ? "text-blue-700 dark:text-blue-400"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6"
            }`}
        >
          {t.icon}
          {t.dot ? (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500 animate-pulse" />
              {t.label}
            </span>
          ) : (
            <>
              {t.label}
              {t.count != null && (
                <span className={`text-xs font-medium ${activeTab === t.key ? "text-blue-700 dark:text-blue-400" : "text-stone-500 dark:text-stone-400"}`}>
                  ({t.count})
                </span>
              )}
            </>
          )}
        </button>
      ))}
    </div>
  );
}
