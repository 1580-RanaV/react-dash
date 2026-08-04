import { TrendingUp, BarChart3 } from "lucide-react";
import type { WidgetType } from "../../lib/useFavorites";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

const WIDGET_ICON: Partial<Record<WidgetType, typeof TrendingUp>> = {
  kpi:        TrendingUp,
  report:     BarChart3,
};

export default function KpiBadgePreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const Icon = WIDGET_ICON[widget.type] ?? TrendingUp;
  const change = widget.meta?.change ? String(widget.meta.change) : "";
  const badge  = widget.meta?.badge  ? String(widget.meta.badge)  : "";
  const isPositive = badge.startsWith("+") || change.startsWith("+");
  const isNegative = badge.startsWith("-") || change.startsWith("-");

  return (
    <div
      className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col h-44"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip />
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <div className="px-4 pt-3 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex items-center gap-2 mb-2 pr-8">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8">
            <Icon size={12} className="text-stone-500 dark:text-stone-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate text-stone-800 dark:text-stone-100">{widget.label}</p>
            {widget.sublabel && <p className="text-[10px] text-stone-400 dark:text-stone-500">{widget.sublabel}</p>}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center pb-3">
          <p className="text-[30px] font-bold tabular-nums tracking-tight leading-none text-stone-900 dark:text-stone-50">
            {String(widget.meta?.value ?? "—")}
          </p>
          {(badge || change) && (
            <div className="mt-2.5 flex items-center gap-1.5">
              {badge && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isPositive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400"
                  : isNegative ? "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400"
                  : "bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400"
                }`}>{badge}</span>
              )}
              {change && <span className="text-[11px] text-stone-400 dark:text-stone-500">{change}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
