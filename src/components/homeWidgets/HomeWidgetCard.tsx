

import { X } from "lucide-react";
import { ReportChartPreview } from "../CustomReportResult";
import type { HomeWidgetEntry } from "./homeWidgetsStore";

export default function HomeWidgetCard({
  entry,
  onRemove,
}: {
  entry: HomeWidgetEntry;
  onRemove: () => void;
}) {
  return (
    <div
      className={`animate-fade-up rounded-xl p-5 ${entry.width === "full" ? "md:col-span-2" : ""}`}
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{entry.title}</p>
        <button
          type="button"
          onClick={onRemove}
          title="Remove from dashboard"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-300"
        >
          <X size={13} />
        </button>
      </div>
      <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Added from Blu chat</p>
      <div className="mt-2">
        <ReportChartPreview />
      </div>
    </div>
  );
}
