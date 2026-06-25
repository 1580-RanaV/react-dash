
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
  className = "flex items-center gap-1 px-4 pt-3 shrink-0",
}: {
  tabs: readonly (Omit<ViewTab, "key"> & { key: K })[];
  activeTab: string;
  onChange?: (key: K) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange?.(t.key)}
          className={`flex h-9 items-center gap-2 px-3 rounded-lg text-sm font-medium transition-colors duration-100
            ${activeTab === t.key
              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
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
