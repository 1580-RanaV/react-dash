import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

type Row = { name: string; pct: number; users: number | string; prefixLabel?: string };

export default function TrafficReportPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const rows = widget.meta?.rows as Row[] | undefined ?? [];
  const activeTab = String(widget.meta?.activeTab ?? "");
  const metric = String(widget.meta?.metric ?? "");

  return (
    <div
      className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col h-56"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip />
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}

      <div className="px-4 pt-4 pb-2 pr-11 shrink-0">
        <div className="mb-2 flex items-center gap-1.5">
          {activeTab && (
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-white/8 dark:text-stone-400">
              {activeTab}
            </span>
          )}
          {metric && <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500">{metric}</span>}
        </div>
        <p className="text-sm font-semibold truncate text-stone-900 dark:text-stone-100">{widget.label}</p>
      </div>

      <div className="flex-1 min-h-0 px-4 pb-4 pt-1">
        <div className="space-y-2">
          {rows.slice(0, 5).map((row) => (
            <div key={row.name} className="flex items-center gap-2">
              <div className="flex w-24 shrink-0 items-center gap-1.5 min-w-0">
                {row.prefixLabel && <span className="text-xs leading-none">{row.prefixLabel}</span>}
                <span className="truncate text-[11px] font-medium text-stone-600 dark:text-stone-400">{row.name}</span>
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
                <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.max(row.pct, 0.5)}%` }} />
              </div>
              <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                {typeof row.users === "number" ? row.users.toLocaleString() : row.users}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
