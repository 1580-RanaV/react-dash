

import { Plus, RotateCcw } from "lucide-react";

export default function RetentionTab() {
  const weeks = ["Week 0", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
  const mockRows = [
    { label: "Jun 1 - Jun 7",  total: 4218,  values: [100, 42, 35, 28, 22, 18, 14] },
    { label: "Jun 8 - Jun 14", total: 3901,  values: [100, 38, 31, 25, 19, 16, null] },
    { label: "May 25 - May 31",total: 5142,  values: [100, 45, 38, 31, 24, null, null] },
    { label: "May 18 - May 24",total: 4876,  values: [100, 41, 34, 27, null, null, null] },
    { label: "May 11 - May 17",total: 4023,  values: [100, 39, 32, null, null, null, null] },
    { label: "May 4 - May 10", total: 3658,  values: [100, 44, null, null, null, null, null] },
    { label: "Apr 27 - May 3", total: 4512,  values: [100, null, null, null, null, null, null] },
  ];

  function cellBg(v: number | null): string {
    if (v === null) return "transparent";
    if (v >= 100) return "rgba(0,128,255,0.85)";
    if (v >= 40) return `rgba(0,128,255,${0.12 + (v - 40) * 0.012})`;
    if (v >= 20) return `rgba(0,128,255,${0.06 + (v - 20) * 0.003})`;
    return "rgba(0,128,255,0.06)";
  }

  function cellText(v: number | null): string {
    if (v === null) return "";
    if (v >= 80) return "text-white";
    return "text-stone-700 dark:text-stone-300";
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Controls bar */}
      <div className="shrink-0 px-6 py-3">
        <div className="flex items-center gap-2">
          <ControlPill label="Weekly" />
          <ControlPill label="Any event" />
          <ControlPill label="returned to Any event" />
          <div className="ml-auto">
            <button
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={13} />
              Add criteria
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-x-auto">
        {/* Cohort legend */}
        <div className="mb-5 flex items-center gap-4">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            Retention by cohort
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">Low</span>
            <div className="flex gap-0.5">
              {[0.06, 0.14, 0.22, 0.34, 0.5, 0.7, 0.9].map((o, i) => (
                <span key={i} className="h-3.5 w-4 rounded-sm" style={{ background: `rgba(0,128,255,${o})` }} />
              ))}
            </div>
            <span className="text-xs text-stone-400">High</span>
          </div>
        </div>

        {/* Retention grid */}
        <table className="border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="pr-4 pb-2 text-xs font-semibold text-stone-400 dark:text-stone-500 whitespace-nowrap">Cohort</th>
              <th className="pr-3 pb-2 text-xs font-semibold text-stone-400 dark:text-stone-500">Users</th>
              {weeks.map((w) => (
                <th key={w} className="px-3 pb-2 text-center text-xs font-semibold text-stone-400 dark:text-stone-500 whitespace-nowrap">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row, ri) => (
              <tr key={ri}>
                <td className="pr-4 py-1 text-xs font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                  {row.label}
                </td>
                <td className="pr-3 py-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                  {row.total.toLocaleString()}
                </td>
                {row.values.map((v, vi) => (
                  <td key={vi} className="px-1 py-1">
                    <div
                      className={`flex h-9 w-14 items-center justify-center rounded-md text-xs font-semibold ${cellText(v)}`}
                      style={{ background: cellBg(v) }}
                    >
                      {v !== null ? `${v}%` : ""}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Average row */}
        <div className="mt-3 flex items-center gap-3 pt-3">
          <span className="pr-1 text-xs font-semibold text-stone-500 dark:text-stone-400">Average</span>
          <span className="pr-3 text-xs text-stone-400">4,333</span>
          {[100, 41, 34, 28, 22, 17, 14].map((v, i) => (
            <div
              key={i}
              className="flex h-9 w-14 items-center justify-center rounded-md text-xs font-semibold"
              style={{ background: cellBg(v), color: v >= 80 ? "white" : undefined }}
            >
              {v}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlPill({ label }: { label: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5" style={{ borderColor: "var(--border)" }}>
      {label}
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-400">
        <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
