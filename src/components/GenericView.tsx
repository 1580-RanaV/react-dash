

import { Plus } from "lucide-react";

export default function GenericView({
  createLabel,
  icon,
  topbarLeft,
}: {
  createLabel: string;
  icon: React.ReactNode;
  topbarLeft?: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center shrink-0 pr-3 pt-3">
        <div className="flex-1">{topbarLeft ?? <div className="h-[49px]" />}</div>
        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ background: "#0080FF" }}
        >
          <Plus size={13} />
          {createLabel}
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex items-center justify-center animate-fade-up">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center mx-auto text-stone-400 dark:text-stone-500">
            {icon}
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            No {createLabel.replace("Create ", "").replace("Add ", "").toLowerCase()}s yet
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Click "{createLabel}" to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
