

export type SubTab = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

export default function SubTabCorner({
  tabs,
  active,
  onChange,
}: {
  tabs: SubTab[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="max-w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex gap-1 p-1 rounded-xl bg-stone-100 dark:bg-(--input) w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-100 whitespace-nowrap ${
              active === tab.key
                ? "bg-white dark:bg-white/12 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
