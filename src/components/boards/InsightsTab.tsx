

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import DateRangePicker from "../DateRangePicker";

const CHART_DATA = [
  { date: "Jun 9",  a: 104178,  b: 90965  },
  { date: "Jun 10", a: 119411,  b: 108647 },
  { date: "Jun 11", a: 97841,   b: 87614  },
  { date: "Jun 12", a: 266438,  b: 247978 },
  { date: "Jun 13", a: 108066,  b: 102799 },
  { date: "Jun 14", a: 481404,  b: 465457 },
  { date: "Jun 15", a: 0,       b: 0      },
];

const SERIES = [
  { key: "a", color: "#0080FF", event: "Session start" },
  { key: "b", color: "#9580FF", event: "Session End"   },
];

const TABLE_DATES = ["Jun 9", "Jun 10", "Jun 11", "Jun 12", "Jun 13", "Jun 14", "Jun 15"];
const TABLE_ROWS = [
  { key: "a", label: "Session start", color: "#0080FF", total: 1177338, avg: 168191, values: [104178, 119411, 97841, 266438, 108066, 481404, 0] },
  { key: "b", label: "Session End",   color: "#9580FF", total: 1103460, avg: 157637, values: [90965, 108647, 87614, 247978, 102799, 465457, 0] },
];

function fmtY(v: number) {
  if (v === 0) return "0";
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
}
function fmtFull(v: number) { return v.toLocaleString(); }

function ControlDropdown({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5"
      style={{ borderColor: "var(--border)" }}
    >
      {icon && <span className="text-stone-400">{icon}</span>}
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400 shrink-0">
        <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-3 text-xs"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160 }}
    >
      <p className="mb-2 font-semibold text-stone-600 dark:text-stone-300">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-none shrink-0" style={{ background: item.color }} />
            <span className="text-stone-500 dark:text-stone-400">{item.name}</span>
          </div>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{fmtFull(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function InsightsTab() {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Controls bar */}
      <div className="shrink-0">
        <DateRangePicker />
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-5">
          <ControlDropdown label="No exclusion" />
          <ControlDropdown label="No comparison" />
          <ControlDropdown
            label="Line"
            icon={
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 9L4 5L7 7L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Chart + legend */}
      <div className="px-5 pt-5 pb-8">
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0080FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0080FF" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9580FF" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#9580FF" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.7} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tickFormatter={fmtY} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="a" name="Session start" stroke="#0080FF" strokeWidth={2} fill="url(#gradA)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="b" name="Session End"   stroke="#9580FF" strokeWidth={2} fill="url(#gradB)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 pt-4">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-none shrink-0" style={{ background: s.color }} />
              <span className="text-xs text-stone-500 dark:text-stone-400">{s.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-5 pb-6">
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-stone-50 dark:bg-white/[0.035]">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-r whitespace-nowrap" style={{ borderColor: "var(--border)" }}>Event</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-r whitespace-nowrap" style={{ borderColor: "var(--border)" }}>Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-r whitespace-nowrap" style={{ borderColor: "var(--border)" }}>Average</th>
                {TABLE_DATES.map((d, i) => (
                  <th
                    key={d}
                    className={`px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b whitespace-nowrap ${i < TABLE_DATES.length - 1 ? "border-r" : ""}`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row) => (
                <tr key={row.key} className="hover:bg-stone-50/70 dark:hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 border-b border-r text-sm font-medium text-stone-900 dark:text-stone-100" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="h-2 w-2 rounded-none shrink-0" style={{ background: row.color }} />
                      {row.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-r text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap" style={{ borderColor: "var(--border)" }}>{fmtFull(row.total)}</td>
                  <td className="px-4 py-3 border-b border-r text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap" style={{ borderColor: "var(--border)" }}>{fmtFull(row.avg)}</td>
                  {row.values.map((v, vi) => (
                    <td
                      key={vi}
                      className={`px-4 py-3 border-b text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap ${vi < row.values.length - 1 ? "border-r" : ""}`}
                      style={{ borderColor: "var(--border)" }}
                    >
                      {v === 0 ? <span className="text-stone-400 dark:text-stone-600">—</span> : fmtFull(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
