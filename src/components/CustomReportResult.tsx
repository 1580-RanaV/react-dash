

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, Save, Table2, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import InfoTooltip from "./InfoTooltip";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { useBoards } from "./boards/boardsStore";

/* ─────────────────────────────────────────────────────────
 * CUSTOM REPORT RESULT — the narrative + chart artifact
 * rendered after QueryStages settles for a "custom-report".
 * ───────────────────────────────────────────────────────── */

type DayPoint = { date: string; view: number; cart: number };

const REPORT_DATA: DayPoint[] = [
  { date: "2026-07-26", view: 26, cart: 5 },
  { date: "2026-07-27", view: 21, cart: 4 },
  { date: "2026-07-28", view: 25, cart: 5 },
  { date: "2026-07-29", view: 15, cart: 4 },
  { date: "2026-07-30", view: 11, cart: 1 },
  { date: "2026-07-31", view: 39, cart: 4 },
  { date: "2026-08-01", view: 24, cart: 4 },
  { date: "2026-08-02", view: 36, cart: 0 },
  { date: "2026-08-03", view: 54, cart: 5 },
  { date: "2026-08-04", view: 26, cart: 4 },
  { date: "2026-08-05", view: 21, cart: 3 },
  { date: "2026-08-06", view: 24, cart: 3 },
  { date: "2026-08-07", view: 23, cart: 3 },
  { date: "2026-08-08", view: 30, cart: 5 },
  { date: "2026-08-09", view: 44, cart: 5 },
  { date: "2026-08-10", view: 30, cart: 4 },
  { date: "2026-08-11", view: 46, cart: 6 },
  { date: "2026-08-12", view: 20, cart: 3 },
  { date: "2026-08-13", view: 47, cart: 4 },
  { date: "2026-08-14", view: 17, cart: 2 },
  { date: "2026-08-15", view: 34, cart: 5 },
  { date: "2026-08-16", view: 44, cart: 5 },
  { date: "2026-08-17", view: 59, cart: 6 },
  { date: "2026-08-18", view: 40, cart: 4 },
  { date: "2026-08-19", view: 25, cart: 3 },
  { date: "2026-08-20", view: 42, cart: 11 },
  { date: "2026-08-21", view: 40, cart: 4 },
  { date: "2026-08-22", view: 34, cart: 5 },
  { date: "2026-08-23", view: 51, cart: 6 },
  { date: "2026-08-24", view: 17, cart: 2 },
  { date: "2026-08-25", view: 0, cart: 0 },
];

const VIEW_TOTAL = REPORT_DATA.reduce((sum, d) => sum + d.view, 0);
const CART_TOTAL = REPORT_DATA.reduce((sum, d) => sum + d.cart, 0);
const VIEW_AVG = Math.round(VIEW_TOTAL / REPORT_DATA.length);
const CART_AVG = Math.round(CART_TOTAL / REPORT_DATA.length);

const busiestView = REPORT_DATA.reduce((a, b) => (b.view > a.view ? b : a));
const busiestCart = REPORT_DATA.reduce((a, b) => (b.cart > a.cart ? b : a));
const completeDays = REPORT_DATA.filter((d) => d.date !== "2026-08-25");
const quietest = completeDays.reduce((a, b) => (b.view + b.cart < a.view + a.cart ? b : a));

function fmtShort(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtChange(cur: number, prev: number) {
  if (prev === 0) return "—";
  const pct = ((cur - prev) / prev) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function fmtShare(value: number, total: number) {
  return `${((value / total) * 100).toFixed(1)}%`;
}

const EXPORT_FORMATS = ["CSV", "PDF", "PNG"];

const TABLE_COLUMNS: TableColumn[] = [
  { key: "date", label: "Date", width: "110px" },
  { key: "viewValue", label: "View page · Value", width: "130px" },
  { key: "viewChange", label: "View page · Change vs previous", width: "170px" },
  { key: "viewShare", label: "View page · Share of total", width: "150px" },
  { key: "cartValue", label: "Cart Event · Value", width: "130px" },
  { key: "cartChange", label: "Cart Event · Change vs previous", width: "170px" },
  { key: "cartShare", label: "Cart Event · Share of total", width: "150px" },
];

const TABLE_ROWS: TableRow[] = REPORT_DATA.map((row, i) => {
  const prev = REPORT_DATA[i - 1];
  return {
    id: row.date,
    cells: {
      date: row.date,
      viewValue: String(row.view),
      viewChange: prev ? fmtChange(row.view, prev.view) : "—",
      viewShare: fmtShare(row.view, VIEW_TOTAL),
      cartValue: String(row.cart),
      cartChange: prev ? fmtChange(row.cart, prev.cart) : "—",
      cartShare: fmtShare(row.cart, CART_TOTAL),
    },
  };
});

export default function CustomReportResult() {
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("Page views and cart events — last 30 days");
  const exportRef = useRef<HTMLDivElement>(null);
  const { addEntry } = useBoards();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function confirmSave() {
    addEntry({
      id: `blu-${Date.now()}`,
      title: saveName.trim() || "Untitled Blu report",
      type: "blu-report",
      lastUpdated: "Aug 20, 2026 04:32 PM",
      createdBy: { initials: "R", color: "#0080FF", name: "Rana V" },
    });
    setSaved(true);
    setSaveModalOpen(false);
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div>
        <p className="text-sm font-semibold leading-relaxed text-stone-800 dark:text-stone-100">
          Over the last 30 days, there were {VIEW_TOTAL} page views and {CART_TOTAL} cart events, averaging {VIEW_AVG} and {CART_AVG} per day respectively.
        </p>
        <ul className="mt-2 space-y-1 text-[13px] leading-relaxed text-stone-600 dark:text-stone-300">
          <li>• Busiest day for page views: {fmtShort(busiestView.date)} with {busiestView.view} events; busiest for cart events: {fmtShort(busiestCart.date)} with {busiestCart.cart}</li>
          <li>• Quietest day for both: {fmtShort(quietest.date)} with {quietest.view} page views and {quietest.cart} cart event{quietest.cart === 1 ? "" : "s"}</li>
          <li>• The two series broadly move together — days with higher page views tend to see more cart activity, with the cart-to-pageview ratio spiking on {fmtShort(busiestCart.date)}</li>
        </ul>
        <p className="mt-2 text-[13px] italic text-stone-400 dark:text-stone-500">
          Aug 25 shows 0 for both series and is likely still in progress, so today's figures are incomplete.
        </p>
      </div>

      <div className="rounded-xl px-5 py-4" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
        <p className="text-[15px] font-bold text-stone-900 dark:text-stone-100">
          plot page views and cart events per day over the last 30 days
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          {REPORT_DATA[0].date} to {REPORT_DATA[REPORT_DATA.length - 1].date} · daily buckets · bucketed in UTC ·
          <span className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-2">
            assumptions
            <InfoTooltip
              variant="plain"
              content="Excludes internal team traffic and bot-filtered sessions. Days are bucketed by UTC midnight-to-midnight."
            />
          </span>
        </p>

        <div className="mt-3 flex gap-3">
          <div className="flex-1 rounded-lg px-3 py-2.5" style={{ border: "1px solid var(--border)" }}>
            <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-1)" }} />
              View page
            </span>
            <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{VIEW_TOTAL}</p>
          </div>
          <div className="flex-1 rounded-lg px-3 py-2.5" style={{ border: "1px solid var(--border)" }}>
            <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--chart-2)" }} />
              Cart Event
            </span>
            <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{CART_TOTAL}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "var(--chart-1)" }} /> View page · Value</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "var(--chart-2)" }} /> Cart Event · Value</span>
        </div>

        <div className="mt-2 h-56 w-full pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REPORT_DATA} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtShort}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={1}
                angle={-40}
                textAnchor="end"
                height={36}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "Page view events", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#94a3b8", textAnchor: "middle" } }}
              />
              <Line type="monotone" dataKey="view" name="View page" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: "var(--chart-1)" }} isAnimationActive={false} activeDot={false} />
              <Line type="monotone" dataKey="cart" name="Cart Event" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: "var(--chart-2)" }} isAnimationActive={false} activeDot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTableModalOpen(true)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Table2 size={13} className="shrink-0" />
          Show in table
        </button>

        <div ref={exportRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setExportOpen((o) => !o)}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            {exported ? <Check size={13} className="shrink-0" /> : <Download size={13} className="shrink-0" />}
            Export
          </button>
          {exportOpen && (
            <div
              className="absolute left-0 bottom-[calc(100%+4px)] z-50 w-32 overflow-hidden rounded-xl animate-card-in"
              style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
            >
              {EXPORT_FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => {
                    setExported(true);
                    setExportOpen(false);
                    setTimeout(() => setExported(false), 2000);
                  }}
                  className="flex w-full items-center px-3.5 py-2 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/6"
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => (saved ? setSaved(false) : setSaveModalOpen(true))}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Save size={13} className="shrink-0" />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {tableModalOpen && createPortal(
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          onClick={() => setTableModalOpen(false)}
        >
          <div
            className="flex h-[88vh] w-[96vw] max-w-[1400px] flex-col overflow-hidden rounded-2xl p-5 animate-card-in"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <div>
                <p className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  plot page views and cart events per day over the last 30 days
                </p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                  {REPORT_DATA[0].date} to {REPORT_DATA[REPORT_DATA.length - 1].date} · daily buckets
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setTableModalOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              <DashboardTable columns={TABLE_COLUMNS} rows={TABLE_ROWS} searchPlaceholder="Search dates..." />
            </div>
          </div>
        </div>,
        document.body
      )}

      {saveModalOpen && createPortal(
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          onClick={() => setSaveModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-5 animate-card-in"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSaveModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
            >
              <X size={14} />
            </button>
            <p className="pr-8 text-base font-semibold text-stone-900 dark:text-stone-100">Save report</p>
            <p className="mt-1 pr-8 text-xs text-stone-400 dark:text-stone-500">Give this report a name to find it later in Boards.</p>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmSave();
                if (e.key === "Escape") setSaveModalOpen(false);
              }}
              className="mt-4 h-10 w-full rounded-lg border px-3 text-sm font-medium text-stone-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100"
              style={{ borderColor: "var(--border)", background: "var(--input)" }}
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSaveModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                disabled={!saveName.trim()}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: "#0080FF" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
