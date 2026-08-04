import { ChevronRight, Plug, BarChart3, FileImage, TrendingUp, Activity, FlaskConical, Package, Shuffle } from "lucide-react";
import type { WidgetType } from "../../lib/useFavorites";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

const WIDGET_ICON: Partial<Record<WidgetType, typeof BarChart3>> = {
  kpi:        TrendingUp,
  report:     BarChart3,
  asset:      FileImage,
  journey:    Activity,
  recipe:     FlaskConical,
  custom:     BarChart3,
  product:    Package,
  experience: Shuffle,
};

export default function GenericPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const Icon = WIDGET_ICON[widget.type] ?? BarChart3;
  const disconnected = widget.meta?.disconnected === true;

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
      <div className="px-4 pt-3 pb-0 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex items-center gap-2 mb-2 pr-8">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8">
            <Icon size={12} className="text-stone-500 dark:text-stone-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate text-stone-800 dark:text-stone-100">{widget.label}</p>
            {widget.sublabel && <p className="text-[10px] text-stone-400 dark:text-stone-500">{widget.sublabel}</p>}
          </div>
        </div>
        {disconnected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 rounded-lg px-3 py-4 mb-4" style={{ background: "var(--muted)" }}>
            <Plug size={14} className="text-stone-400" />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
              Connect {widget.source === "stripe" ? "Stripe" : "SDK"} to see this widget
            </p>
            <a href="/integrations" className="inline-flex h-7 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-white" style={{ background: "#0080FF" }}>
              Connect <ChevronRight size={10} />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 rounded-lg p-2" style={{ background: "var(--muted)" }}>
            <FileImage size={14} className="text-stone-400" />
            <p className="text-xs text-stone-500 truncate">{String(widget.meta?.filename ?? "Asset")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
