import { InsightsMiniChart } from "../boards/InsightsTab";
import { FunnelMiniChart } from "../boards/FunnelsTab";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

const CHART_H = 148;

export default function ReportPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const reportType = String(widget.meta?.reportType ?? "insights");

  return (
    <div
      className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <CardGrip />
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <div className="px-4 pt-3 pb-1 shrink-0 pr-10">
        <p className="text-xs font-semibold truncate text-stone-800 dark:text-stone-100">{widget.label}</p>
        {reportType !== "insights" && (
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
            {reportType}
          </p>
        )}
      </div>
      <div style={{ height: CHART_H, flexShrink: 0 }}>
        {reportType === "funnels" ? <FunnelMiniChart compact /> : <InsightsMiniChart height={CHART_H} />}
      </div>
    </div>
  );
}
