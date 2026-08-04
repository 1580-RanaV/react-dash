import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

function TooltipBox({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <p className="mb-1 font-semibold text-stone-900 dark:text-stone-100">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {Number(item.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function EngagementReportPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const data = widget.meta?.chartPoints as Array<{ date: string; value: number }> | undefined ?? [];
  const color = String(widget.meta?.color ?? "#00AAFF");
  const change = String(widget.meta?.change ?? "");
  const value = String(widget.meta?.value ?? "—");
  const bigSub = String(widget.meta?.bigSub ?? "");
  const isPositive = change.startsWith("+");

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

      <div className="px-4 pt-4 pb-2 pr-11 shrink-0">
        <p className="text-sm font-semibold truncate text-stone-900 dark:text-stone-100">{widget.label}</p>
        <p className="mt-2">
          <span className="text-[22px] font-bold tracking-tight text-stone-900 dark:text-stone-100">{value}</span>{" "}
          {bigSub && <span className="text-[11px] text-stone-400 dark:text-stone-500">{bigSub}</span>}
        </p>
        {change && (
          <p className={`mt-1 text-[11px] font-medium ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {change} vs previous period
          </p>
        )}
      </div>

      <div className="h-[148px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`eng-${widget.id.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={32} />
            <Tooltip content={<TooltipBox />} />
            <Area
              type="monotone"
              dataKey="value"
              name={widget.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#eng-${widget.id.replace(/\W/g, "")})`}
              dot={false}
              activeDot={{ r: 3.5, fill: color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
