import {
  Area,
  AreaChart,
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

function TooltipBox({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; fill?: string; name?: string }>;
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
        <p key={item.name} style={{ color: item.color ?? item.fill }}>
          {item.name}: {Number(item.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function RevenueReportPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const chartKind = String(widget.meta?.chartKind ?? "area");
  const data = widget.meta?.chartPoints as Array<Record<string, number | string>> | undefined ?? [];
  const color = String(widget.meta?.color ?? "#00AAFF");
  const change = String(widget.meta?.change ?? "");
  const value = String(widget.meta?.value ?? "");
  const bigSub = String(widget.meta?.bigSub ?? "");

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
        {value && (
          <p className="mt-2">
            <span className="text-[22px] font-bold tracking-tight text-stone-900 dark:text-stone-100">{value}</span>{" "}
            {bigSub && <span className="text-[11px] text-stone-400 dark:text-stone-500">{bigSub}</span>}
          </p>
        )}
        {change && <p className="mt-1 text-[11px] font-medium text-emerald-500">{change} vs previous period</p>}
      </div>

      <div className="h-[156px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartKind === "traffic-revenue" ? (
            <ComposedChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
              <YAxis yAxisId="u" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={28} />
              <YAxis yAxisId="r" orientation="right" hide />
              <Tooltip content={<TooltipBox />} />
              <Bar yAxisId="u" dataKey="users" name="Users" fill="#00AAFF" radius={[2, 2, 0, 0]} maxBarSize={14} />
              <Line yAxisId="r" dataKey="revenue" name="Revenue ($)" stroke="#59B277" strokeWidth={2} dot={false} activeDot={{ r: 3.5, fill: "#59B277", strokeWidth: 0 }} />
            </ComposedChart>
          ) : (
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`rev-${widget.id.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={28} />
              <Tooltip content={<TooltipBox />} />
              <Area
                type="linear"
                dataKey="value"
                name={widget.label}
                stroke={color}
                strokeWidth={2}
                fill={`url(#rev-${widget.id.replace(/\W/g, "")})`}
                dot={{ fill: color, r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
