

import { Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";

interface DataPoint { date: string; value: number }

interface Props {
  value: string;
  label: string;
  labelSub?: string;
  change: string;
  data: DataPoint[];
  noResults?: boolean;
  variantLabel?: { letter: string; name: string; color: string };
}

function yFmt(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
      }}
    >
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-[#0080FF]">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function MetricCard({
  value,
  label,
  labelSub,
  change,
  data,
  noResults = false,
  variantLabel,
}: Props) {
  return (
    <div
      className="flex-1 rounded-xl p-5 flex flex-col min-w-0 overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        background: "var(--content-bg)",
      }}
    >
      {/* Metric header */}
      <div className="mb-8">
        <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 leading-none tracking-tight">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {label}
            {labelSub && <span className="text-stone-400 dark:text-stone-500"> {labelSub}</span>}
          </span>
          <Info size={12} className="text-stone-400 shrink-0" />
        </div>
        <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-4">{change}</p>
      </div>

      {/* Chart or no-results */}
      {noResults ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6 min-h-[180px]">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,128,255,0.2)]"
            style={{ background: "linear-gradient(135deg,#c7dcfa 0%,#dde8fc 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0080FF" strokeWidth="1.6">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No results found</p>
        </div>
      ) : (
        <div className="min-h-[220px] min-w-0">
          <ResponsiveContainer width="100%" height={220} minWidth={0}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="bluGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00AAFF" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#00AAFF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={yFmt}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#0080FF", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area
                type="linear"
                dataKey="value"
                stroke="#00AAFF"
                strokeWidth={2}
                fill="url(#bluGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#00AAFF", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Variant label */}
      {variantLabel && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: variantLabel.color }}>
            {variantLabel.letter}
          </span>
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{variantLabel.name}</span>
          <span className="text-xs text-stone-400 dark:text-stone-500">Impressions: 0 (0.0%) · Users: 0 (0.0%)</span>
        </div>
      )}
    </div>
  );
}
