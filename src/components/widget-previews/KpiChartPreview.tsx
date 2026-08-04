import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

const CHART_H = 160;

function yFmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function KpiChartPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);

  const chartPoints = widget.meta?.chartPoints as Array<{ date: string; value: number }> | undefined;
  const sparkline   = widget.meta?.sparkline   as number[] | undefined ?? [];
  const chartData   = chartPoints ?? sparkline.map((value, i) => ({ date: String(i), value }));
  const hasDates    = !!chartPoints;

  const gradId = `kpiG${widget.id.replace(/\W/g, "")}`;
  const change = widget.meta?.change ? String(widget.meta.change) : "";

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

      <div className="px-4 pt-4 pb-2 pr-10 shrink-0">
        <p className="text-[22px] font-extrabold leading-none tracking-tight text-stone-900 dark:text-stone-100">
          {String(widget.meta?.value ?? "—")}
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 truncate">{widget.label}</p>
        {change && <p className="text-[11px] font-medium text-amber-700 dark:text-amber-500 mt-1">{change}</p>}
      </div>

      {chartData.length > 1 && (
        <div style={{ height: CHART_H, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height={CHART_H}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00AAFF" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#00AAFF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              {hasDates
                ? <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
                : <XAxis hide />}
              <YAxis tickFormatter={yFmt} tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={34} />
              <Area type="linear" dataKey="value" stroke="#00AAFF" strokeWidth={2} fill={`url(#${gradId})`} dot={false} activeDot={{ r: 3, fill: "#00AAFF", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
