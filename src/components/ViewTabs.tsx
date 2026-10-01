import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export type ViewTab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number | null;
  dot?: boolean;
};

export default function ViewTabs<K extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "px-4 pt-3 shrink-0",
}: {
  tabs: readonly (Omit<ViewTab, "key"> & { key: K })[];
  activeTab: string;
  onChange?: (key: K) => void;
  className?: string;
}) {
  return (
    <Tabs value={activeTab} onValueChange={(key) => onChange?.(key as K)} className={className}>
      {/* When there are more tabs than fit, this scrolls instead of being
          clipped by an ancestor's overflow-hidden (TabsList itself is
          `w-fit` and never wraps or shrinks). scrollbar-none because a
          visible bar shows up even for a few px of slack in tight rows
          (e.g. Home's tabs next to its settings button) — the cut-off
          trailing tab is cue enough that there's more to scroll to. */}
      <div className="scrollbar-none overflow-x-auto">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-1.5 shrink-0">
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
                    <span className="text-xs font-medium opacity-70">({t.count})</span>
                  )}
                </>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
