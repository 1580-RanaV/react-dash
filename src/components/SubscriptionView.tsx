

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, Info, Target } from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";

// ── helpers ───────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-1.5">
      <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{children}</span>
      <Info size={13} className="text-stone-400" />
    </div>
  );
}

function Chip({ n }: { n: number }) {
  return (
    <span className="ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10.5px] font-medium bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">{n}</span>
  );
}

function MCell({ value, count, tone = "default" }: {
  value: number | null; count?: number | null;
  tone?: "green" | "red" | "blue" | "amber" | "default";
}) {
  if (value === null) return <span className="text-stone-400 dark:text-stone-500">—</span>;
  const cls = tone === "green" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "red" ? "text-rose-500 dark:text-rose-400"
    : tone === "blue" ? "text-blue-500 dark:text-blue-400"
    : tone === "amber" ? "text-amber-500 dark:text-amber-400"
    : "font-semibold text-stone-800 dark:text-stone-100";
  return <span className={`text-xs ${cls}`}>${value.toFixed(2)}{count != null && <Chip n={count} />}</span>;
}

function NCell({ value, tone = "default" }: {
  value: number | null;
  tone?: "green" | "red" | "blue" | "amber" | "default";
}) {
  if (value === null) return <span className="text-stone-400 dark:text-stone-500">—</span>;
  const cls = tone === "green" ? "text-emerald-600 dark:text-emerald-400"
    : tone === "red" ? "text-rose-500 dark:text-rose-400"
    : tone === "blue" ? "text-blue-500 dark:text-blue-400"
    : tone === "amber" ? "text-amber-500 dark:text-amber-400"
    : "font-semibold text-stone-800 dark:text-stone-100";
  return <span className={`text-xs ${cls}`}>{value.toLocaleString()}</span>;
}

function ChartTip({ active, payload, label, fmt }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>;
  label?: string; fmt?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const format = fmt ?? ((v) => `$${(v / 1000).toFixed(2)}K`);
  return (
    <div className="rounded-lg px-3 py-2 shadow-xl text-xs" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      <p className="font-semibold text-stone-700 dark:text-stone-200 mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
          <span className="text-stone-500">{item.name}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{format(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

const TICK = { fontSize: 11, fill: "#94A3B8" };
const AXIS = { axisLine: false as const, tickLine: false as const };

// ── MRR data ──────────────────────────────────────────────────────────────────

const MRR_TREND = [
  { month: "Jul '25", mrr: 10530, goal: 100000 }, { month: "Aug '25", mrr: 12143, goal: 100000 },
  { month: "Sep '25", mrr: 13700, goal: 100000 }, { month: "Oct '25", mrr: 15594, goal: 100000 },
  { month: "Nov '25", mrr: 16765, goal: 100000 }, { month: "Dec '25", mrr: 18206, goal: 100000 },
  { month: "Jan '26", mrr: 19597, goal: 100000 }, { month: "Feb '26", mrr: 20711, goal: 100000 },
  { month: "Mar '26", mrr: 22052, goal: 100000 }, { month: "Apr '26", mrr: 22914, goal: 100000 },
  { month: "May '26", mrr: 24568, goal: 100000 }, { month: "Jun '26", mrr: 25212, goal: 100000 },
];

const MOVEMENTS = [
  { month: "Jul 2025",  newBiz: 1191.48, nbc: 113,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react: 9338.99, rec: 919, net: 10530.47, mrr: 10530.47, chg: 0     },
  { month: "Aug 2025",  newBiz: 1382.47, nbc: 147,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  230.99, rec:  16, net:  1613.46, mrr: 12143.93, chg: 15.32 },
  { month: "Sep 2025",  newBiz: 1350.79, nbc: 133,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  206.04, rec:  14, net:  1556.83, mrr: 13700.76, chg: 12.82 },
  { month: "Oct 2025",  newBiz: 1649.53, nbc: 161,  exp: null,  epc: null,  con: null,   coc: null, churn:   9.06, chc:   1,  react:  253.12, rec:  18, net:  1893.59, mrr: 15594.35, chg: 13.82 },
  { month: "Nov 2025",  newBiz:  910.55, nbc: 137,  exp: null,  epc: null,  con: null,   coc: null, churn:  19.16, chc:   1,  react:  279.82, rec:  24, net:  1171.21, mrr: 16765.56, chg:  7.51 },
  { month: "Dec 2025",  newBiz: 1140.71, nbc:  80,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  300.51, rec:  19, net:  1441.22, mrr: 18206.78, chg:  8.60 },
  { month: "Jan 2026",  newBiz: 1118.81, nbc:  88,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  271.85, rec:  22, net:  1390.66, mrr: 19597.44, chg:  7.64 },
  { month: "Feb 2026",  newBiz:  859.90, nbc:  66,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  253.97, rec:  17, net:  1113.87, mrr: 20711.31, chg:  5.68 },
  { month: "Mar 2026",  newBiz:  947.73, nbc:  54,  exp: null,  epc: null,  con: null,   coc: null, churn: null,   chc: null, react:  393.18, rec:  14, net:  1340.91, mrr: 22052.22, chg:  6.47 },
  { month: "Apr 2026",  newBiz:  601.14, nbc:  54,  exp: null,  epc: null,  con:  14.13, coc:   1,  churn: null,   chc: null, react:  274.79, rec:   9, net:   861.80, mrr: 22914.02, chg:  3.91 },
  { month: "May 2026",  newBiz: 2060.31, nbc: 148,  exp:  1.18, epc:   2,   con:  58.06, coc:  15,  churn: 760.64, chc:  54,  react:  411.22, rec:  24, net:  1654.01, mrr: 24568.03, chg:  7.22 },
  { month: "Jun 2026",  newBiz: 1000.73, nbc:  70,  exp: null,  epc: null,  con:  93.67, coc:  20,  churn: 639.40, chc:  44,  react:  376.77, rec:  28, net:   644.43, mrr: 25212.46, chg:  2.62 },
];

const PLAN_COLORS = ["#60A5FA", "#A78BFA", "#FB923C", "#2DD4BF", "#FBBF24", "#34D399"];

const PLAN_CHART = [
  { m: "Jul '25", p0:  800, p1:  400, p2:  500, p3:  7500, p4: 100, p5: 200 },
  { m: "Aug '25", p0:  900, p1:  450, p2:  550, p3:  9000, p4: 110, p5: 220 },
  { m: "Sep '25", p0: 1100, p1:  500, p2:  600, p3: 10000, p4: 120, p5: 250 },
  { m: "Oct '25", p0: 1300, p1:  550, p2:  650, p3: 11000, p4: 130, p5: 280 },
  { m: "Nov '25", p0: 1400, p1:  600, p2:  700, p3: 12000, p4: 140, p5: 300 },
  { m: "Dec '25", p0: 1500, p1:  650, p2:  750, p3: 13000, p4: 150, p5: 320 },
  { m: "Jan '26", p0: 2000, p1:  700, p2:  800, p3: 14000, p4: 150, p5: 350 },
  { m: "Feb '26", p0: 2200, p1:  750, p2:  850, p3: 14500, p4: 150, p5: 370 },
  { m: "Mar '26", p0: 2500, p1:  800, p2:  900, p3: 15500, p4: 150, p5: 400 },
  { m: "Apr '26", p0: 2800, p1:  850, p2:  950, p3: 16000, p4: 150, p5: 420 },
  { m: "May '26", p0: 5500, p1: 1800, p2: 5000, p3:  9000, p4: 150, p5: 450 },
  { m: "Jun '26", p0: 5889, p1: 2799, p2: 6019, p3:  6800, p4: 151, p5: 550 },
];

const PLANS = [
  { name: "3-Month Subscription",               id: "prod_0MwZpc3SsF2GNC", price: "$79.95",  customers:  216, cPct:  2.37, mrr:  5889.65, mPct:  2.79, color: PLAN_COLORS[0] },
  { name: "6-Month Subscription",               id: "prod_0MwZF2iTazQp4b", price: "$149.95", customers:  112, cPct:  1.23, mrr:  2799.07, mPct:  1.33, color: PLAN_COLORS[1] },
  { name: "Monthly Subscription",               id: "prod_0MwZ240JVdPCZh", price: "$29.95",  customers:  201, cPct:  2.21, mrr:  6019.95, mPct:  2.86, color: PLAN_COLORS[2], warn: true },
  { name: "Monthly Subscription",               id: "prod_0MwZox1w6YPwkI", price: "$29.95",  customers: 1375, cPct: 15.11, mrr: 42678.75, mPct: 20.25, color: PLAN_COLORS[3], warn: true },
  { name: "StockInvest.us 3 month - $56.70",    id: "prod_MZMIMQOWDBJlHD", price: "$56.70",  customers:    8, cPct:  0.09, mrr:   151.20, mPct:  0.07, color: PLAN_COLORS[4] },
  { name: "StockInvest.us 3 month - $59.00",    id: "prod_G0UQHLNs13QDBS", price: "$59.00",  customers:   28, cPct:  0.31, mrr:   550.67, mPct:  0.26, color: PLAN_COLORS[5] },
];

// ── Subscriber data ───────────────────────────────────────────────────────────

const SUBS_TREND = [
  { month: "Jul '25", subs: 1032, goal: 5000 }, { month: "Aug '25", subs: 1195, goal: 5000 },
  { month: "Sep '25", subs: 1342, goal: 5000 }, { month: "Oct '25", subs: 1520, goal: 5000 },
  { month: "Nov '25", subs: 1680, goal: 5000 }, { month: "Dec '25", subs: 1779, goal: 5000 },
  { month: "Jan '26", subs: 1889, goal: 5000 }, { month: "Feb '26", subs: 1972, goal: 5000 },
  { month: "Mar '26", subs: 2040, goal: 5000 }, { month: "Apr '26", subs: 2102, goal: 5000 },
  { month: "May '26", subs: 2207, goal: 5000 }, { month: "Jun '26", subs: 1940, goal: 5000 },
];

const SUBS_CHART = [
  { m: "Jul '25", p0:  28, p1:  14, p2:  18, p3: 955, p4: 3, p5:  7 },
  { m: "Aug '25", p0:  40, p1:  18, p2:  24, p3:1090, p4: 4, p5:  9 },
  { m: "Sep '25", p0:  55, p1:  22, p2:  30, p3:1200, p4: 5, p5: 10 },
  { m: "Oct '25", p0:  75, p1:  30, p2:  42, p3:1335, p4: 5, p5: 12 },
  { m: "Nov '25", p0:  95, p1:  38, p2:  55, p3:1450, p4: 6, p5: 14 },
  { m: "Dec '25", p0: 110, p1:  44, p2:  65, p3:1522, p4: 6, p5: 16 },
  { m: "Jan '26", p0: 130, p1:  52, p2:  78, p3:1592, p4: 7, p5: 18 },
  { m: "Feb '26", p0: 148, p1:  60, p2:  90, p3:1642, p4: 7, p5: 20 },
  { m: "Mar '26", p0: 165, p1:  70, p2: 105, p3:1668, p4: 7, p5: 22 },
  { m: "Apr '26", p0: 180, p1:  80, p2: 120, p3:1690, p4: 8, p5: 24 },
  { m: "May '26", p0: 200, p1:  95, p2: 158, p3:1720, p4: 8, p5: 26 },
  { m: "Jun '26", p0: 216, p1: 112, p2: 201, p3:1375, p4: 8, p5: 28 },
];

const SUBS_MOVEMENTS = [
  { month: "Jul 2025",  newSubs:  113, exp: null, con: null, churn: null, react: 919, net: 1032, total: 1032, chg: 0     },
  { month: "Aug 2025",  newSubs:  147, exp: null, con: null, churn: null, react:  16, net:  163, total: 1195, chg: 15.80 },
  { month: "Sep 2025",  newSubs:  133, exp: null, con: null, churn: null, react:  14, net:  147, total: 1342, chg: 12.30 },
  { month: "Oct 2025",  newSubs:  161, exp: null, con: null, churn:    1, react:  18, net:  178, total: 1520, chg: 13.26 },
  { month: "Nov 2025",  newSubs:  137, exp: null, con: null, churn:    1, react:  24, net:  160, total: 1680, chg: 10.53 },
  { month: "Dec 2025",  newSubs:   80, exp: null, con: null, churn: null, react:  19, net:   99, total: 1779, chg:  5.89 },
  { month: "Jan 2026",  newSubs:   88, exp: null, con: null, churn: null, react:  22, net:  110, total: 1889, chg:  6.18 },
  { month: "Feb 2026",  newSubs:   66, exp: null, con: null, churn: null, react:  17, net:   83, total: 1972, chg:  4.39 },
  { month: "Mar 2026",  newSubs:   54, exp: null, con: null, churn: null, react:  14, net:   68, total: 2040, chg:  3.45 },
  { month: "Apr 2026",  newSubs:   54, exp: null, con:    1, churn: null, react:   9, net:   62, total: 2102, chg:  3.04 },
  { month: "May 2026",  newSubs:  148, exp:    2, con:   15, churn:   54, react:  24, net:  105, total: 2207, chg:  4.99 },
  { month: "Jun 2026",  newSubs:   70, exp: null, con:   20, churn:   44, react:  28, net:   34, total: 1940, chg: -3.04 },
];

// ── Shared data ───────────────────────────────────────────────────────────────

const NRR_DATA = [
  { m: "Jan", v: 99.8 }, { m: "Feb", v: 99.5 }, { m: "Mar", v: 99.6 },
  { m: "Apr", v: 99.2 }, { m: "May", v: 97.4 }, { m: "Jun", v: 97.0 },
];

const EXPANSION_DATA = [
  { m: "Jan", v: 0 }, { m: "Feb", v: 0 }, { m: "Mar", v: 0 },
  { m: "Apr", v: 200 }, { m: "May", v: 800 }, { m: "Jun", v: 100 },
];

// ── DashboardTable columns + rows ─────────────────────────────────────────────

const MOV_COLUMNS: TableColumn[] = [
  { key: "month",  label: "Month",            width: "9%"  },
  { key: "newBiz", label: "New Business MRR", width: "11%", info: true },
  { key: "exp",    label: "Expansion MRR",    width: "11%", info: true },
  { key: "con",    label: "Contraction MRR",  width: "11%", info: true },
  { key: "churn",  label: "Churn MRR",        width: "10%", info: true },
  { key: "react",  label: "Reactivation MRR", width: "12%", info: true },
  { key: "net",    label: "Net MRR Movement", width: "12%", info: true },
  { key: "mrr",    label: "MRR",              width: "10%", info: true },
  { key: "change", label: "Change",           width: "8%",  info: true },
];

const MOV_ROWS: TableRow[] = MOVEMENTS.map((r) => ({
  id: r.month,
  cells: {
    month:  <span className="font-medium text-stone-700 dark:text-stone-300">{r.month}</span>,
    newBiz: <MCell value={r.newBiz} count={r.nbc} tone="green" />,
    exp:    <MCell value={r.exp}    count={r.epc} tone="blue" />,
    con:    <MCell value={r.con}    count={r.coc} tone="amber" />,
    churn:  <MCell value={r.churn}  count={r.chc} tone="red" />,
    react:  <MCell value={r.react}  count={r.rec} tone="blue" />,
    net:    <MCell value={r.net}               tone="blue" />,
    mrr:    <MCell value={r.mrr}               tone="default" />,
    change: <span className={`font-medium ${r.chg > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400"}`}>
              {r.chg === 0 ? "0.00%" : `+${r.chg.toFixed(2)}%`}
            </span>,
  },
}));

const PLAN_COLUMNS: TableColumn[] = [
  { key: "plan",      label: "Plan",             info: true, width: "35%" },
  { key: "price",     label: "Price",            info: true, width: "10%" },
  { key: "interval",  label: "Interval",         info: true, width: "12%" },
  { key: "customers", label: "Active Customers", info: true, width: "22%" },
  { key: "mrr",       label: "MRR",              info: true, width: "21%" },
];

const PLAN_ROWS: TableRow[] = PLANS.map((p) => ({
  id: p.id,
  cells: {
    plan: {
      value: (
        <div className="flex items-center gap-1.5">
          <span>{p.name}</span>
          {p.warn && <AlertTriangle size={12} className="shrink-0 text-amber-400" />}
        </div>
      ),
      subValue: p.id,
    },
    price: p.price,
    interval: (
      <span className="rounded-md border border-stone-200 px-2 py-0.5 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
        Monthly
      </span>
    ),
    customers: (
      <div className="flex items-center gap-2">
        <span className="font-medium text-stone-800 dark:text-stone-200">{p.customers.toLocaleString()}</span>
        <span className="text-xs text-stone-400">{p.cPct.toFixed(2)}%</span>
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${Math.min(p.cPct * 6, 100)}%`, background: p.color }} />
        </div>
      </div>
    ),
    mrr: (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-stone-800 dark:text-stone-200">${p.mrr.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        <span className="text-xs text-stone-400">{p.mPct.toFixed(2)}%</span>
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${Math.min(p.mPct * 4, 100)}%`, background: p.color }} />
        </div>
      </div>
    ),
  },
}));

const SUBS_MOV_COLUMNS: TableColumn[] = [
  { key: "month",   label: "Month",              width: "12%" },
  { key: "newSubs", label: "New Subscribers",    width: "14%", info: true },
  { key: "exp",     label: "Expansion",          width: "11%", info: true },
  { key: "con",     label: "Contraction",        width: "11%", info: true },
  { key: "churn",   label: "Churned",            width: "11%", info: true },
  { key: "react",   label: "Reactivated",        width: "12%", info: true },
  { key: "net",     label: "Net Movement",       width: "11%", info: true },
  { key: "total",   label: "Total Subscribers",  width: "13%", info: true },
  { key: "change",  label: "Change",             width: "8%",  info: true },
];

const SUBS_MOV_ROWS: TableRow[] = SUBS_MOVEMENTS.map((r) => ({
  id: r.month,
  cells: {
    month:   <span className="font-medium text-stone-700 dark:text-stone-300">{r.month}</span>,
    newSubs: <NCell value={r.newSubs} tone="green" />,
    exp:     <NCell value={r.exp}     tone="blue" />,
    con:     <NCell value={r.con}     tone="amber" />,
    churn:   <NCell value={r.churn}   tone="red" />,
    react:   <NCell value={r.react}   tone="blue" />,
    net:     <NCell value={r.net}     tone="blue" />,
    total:   <NCell value={r.total}   tone="default" />,
    change:  <span className={`font-medium ${r.chg > 0 ? "text-emerald-600 dark:text-emerald-400" : r.chg < 0 ? "text-rose-500 dark:text-rose-400" : "text-stone-400"}`}>
               {r.chg === 0 ? "0.00%" : `${r.chg > 0 ? "+" : ""}${r.chg.toFixed(2)}%`}
             </span>,
  },
}));

const SUBS_PLAN_COLUMNS: TableColumn[] = [
  { key: "plan",      label: "Plan",             info: true, width: "38%" },
  { key: "price",     label: "Price",            info: true, width: "12%" },
  { key: "interval",  label: "Interval",         info: true, width: "14%" },
  { key: "customers", label: "Subscribers",      info: true, width: "20%" },
  { key: "share",     label: "Share",            info: true, width: "16%" },
];

const SUBS_PLAN_ROWS: TableRow[] = PLANS.map((p) => ({
  id: `subs-${p.id}`,
  cells: {
    plan: {
      value: (
        <div className="flex items-center gap-1.5">
          <span>{p.name}</span>
          {p.warn && <AlertTriangle size={12} className="shrink-0 text-amber-400" />}
        </div>
      ),
      subValue: p.id,
    },
    price: p.price,
    interval: (
      <span className="rounded-md border border-stone-200 px-2 py-0.5 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
        Monthly
      </span>
    ),
    customers: (
      <span className="font-medium text-stone-800 dark:text-stone-200">{p.customers.toLocaleString()}</span>
    ),
    share: (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-400">{p.cPct.toFixed(2)}%</span>
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
          <div className="h-full rounded-full" style={{ width: `${Math.min(p.cPct * 6, 100)}%`, background: p.color }} />
        </div>
      </div>
    ),
  },
}));

// ── sub-sections ──────────────────────────────────────────────────────────────

function MrrTab() {
  const progressPct = (25212.46 / 100000) * 100;
  return (
    <div className="space-y-4">
      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "CURRENT MRR",      value: "$25.21K",  sub: "Jun 2026", subCls: "text-stone-400" },
          { label: "NET MRR MOVEMENT", value: "+$644.43", sub: "+2.62%",   subCls: "text-emerald-500" },
          { label: "NEW BUSINESS MRR", value: "$1.00K",   sub: undefined,  subCls: "" },
          { label: "CHURN MRR",        value: "$639.40",  sub: undefined,  subCls: "" },
        ].map(({ label, value, sub, subCls }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
            <div className="mb-2 flex items-center gap-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</span>
              <Info size={11} className="text-stone-400" />
            </div>
            <p className="text-2xl font-bold leading-tight text-stone-900 dark:text-stone-100">{value}</p>
            {sub && <p className={`mt-1 text-xs ${subCls}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* MRR Trend + Goal + Churn Rate */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <Card>
          <SectionLabel>MRR Trend</SectionLabel>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MRR_TREND} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={TICK} {...AXIS} />
              <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={TICK} {...AXIS} domain={[0, 110000]} />
              <Tooltip content={(p: any) => <ChartTip {...p} />} />
              <Line type="monotone" dataKey="mrr"  name="Actual MRR" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="goal" name="Goal"       stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-5 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-blue-400" />Actual MRR</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-slate-300" />Goal</span>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center gap-1.5">
              <Target size={13} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">MRR Goal</span>
              <Info size={12} className="text-stone-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-stone-500">Goal</span><span className="font-semibold text-stone-800 dark:text-stone-200">$100,000</span></div>
              <div className="flex justify-between text-xs"><span className="text-stone-500">Actual</span><span className="font-semibold text-stone-800 dark:text-stone-200">$25.21K</span></div>
              <div className="relative h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
                <div className="absolute left-0 top-0 h-full rounded-full bg-blue-500" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-xs"><span className="text-stone-500">Progress</span><span className="font-semibold text-rose-500">-74.8%</span></div>
            </div>
          </Card>

          <Card className="flex-1">
            <SectionLabel>Monthly MRR Churn Rate</SectionLabel>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">2.54%</span>
              <span className="text-xs font-semibold text-rose-500">+0.9pp</span>
              <span className="text-xs text-stone-400">vs last month</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-stone-500">Churned MRR</span><span className="font-medium text-rose-500">$639.40</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Total MRR</span><span className="font-medium text-stone-700 dark:text-stone-300">$25,212.46</span></div>
            </div>
          </Card>
        </div>
      </div>

      {/* MRR Movements */}
      <div>
        <SectionLabel>MRR Movements</SectionLabel>
        <DashboardTable columns={MOV_COLUMNS} rows={MOV_ROWS} searchPlaceholder="Search movements..." menuItems={[]} />
      </div>

      {/* MRR by Plan chart */}
      <Card className="flex flex-col">
        <SectionLabel>MRR by Plan</SectionLabel>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={PLAN_CHART} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="m" tick={TICK} {...AXIS} />
            <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={TICK} {...AXIS} />
            <Tooltip content={(p: any) => <ChartTip {...p} fmt={(v) => `$${v.toLocaleString()}`} />} />
            {(["p0","p1","p2","p3","p4","p5"] as const).map((key, i) => (
              <Bar key={key} dataKey={key} name={PLANS[i]?.name ?? key} stackId="a" fill={PLAN_COLORS[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {PLANS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PLAN_COLORS[i] }} />{p.name}
            </div>
          ))}
        </div>
      </Card>

      {/* Plan Breakdown */}
      <div>
        <SectionLabel>Plan Breakdown</SectionLabel>
        <DashboardTable columns={PLAN_COLUMNS} rows={PLAN_ROWS} searchPlaceholder="Search plans..." menuItems={[]} />
      </div>
    </div>
  );
}

function SubscribersTab() {
  const progressPct = (1940 / 5000) * 100;
  return (
    <div className="space-y-4">
      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "TOTAL SUBSCRIBERS", value: "1,940",   sub: "Jun 2026", subCls: "text-stone-400" },
          { label: "NET MOVEMENT",      value: "+34",      sub: "-3.04%",   subCls: "text-rose-500" },
          { label: "NEW SUBSCRIBERS",   value: "70",       sub: undefined,  subCls: "" },
          { label: "CHURNED",           value: "44",       sub: undefined,  subCls: "" },
        ].map(({ label, value, sub, subCls }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
            <div className="mb-2 flex items-center gap-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{label}</span>
              <Info size={11} className="text-stone-400" />
            </div>
            <p className="text-2xl font-bold leading-tight text-stone-900 dark:text-stone-100">{value}</p>
            {sub && <p className={`mt-1 text-xs ${subCls}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Subscriber Trend + Goal + Churn Rate */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr]">
        <Card>
          <SectionLabel>Subscriber Trend</SectionLabel>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={SUBS_TREND} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={TICK} {...AXIS} />
              <YAxis tick={TICK} {...AXIS} domain={[0, 6000]} />
              <Tooltip content={(p: any) => <ChartTip {...p} fmt={(v) => v.toLocaleString()} />} />
              <Line type="monotone" dataKey="subs" name="Subscribers" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="goal" name="Goal"        stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-5 text-xs text-stone-500">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-blue-400" />Subscribers</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-4 rounded-full bg-slate-300" />Goal</span>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center gap-1.5">
              <Target size={13} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Subscriber Goal</span>
              <Info size={12} className="text-stone-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-stone-500">Goal</span><span className="font-semibold text-stone-800 dark:text-stone-200">5,000</span></div>
              <div className="flex justify-between text-xs"><span className="text-stone-500">Actual</span><span className="font-semibold text-stone-800 dark:text-stone-200">1,940</span></div>
              <div className="relative h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/8">
                <div className="absolute left-0 top-0 h-full rounded-full bg-blue-500" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-xs"><span className="text-stone-500">Progress</span><span className="font-semibold text-amber-500">38.8%</span></div>
            </div>
          </Card>

          <Card className="flex-1">
            <SectionLabel>Monthly Subscriber Churn Rate</SectionLabel>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">2.27%</span>
              <span className="text-xs font-semibold text-rose-500">+1.1pp</span>
              <span className="text-xs text-stone-400">vs last month</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-stone-500">Churned</span><span className="font-medium text-rose-500">44 subscribers</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Total</span><span className="font-medium text-stone-700 dark:text-stone-300">1,940 subscribers</span></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Subscriber Movements */}
      <div>
        <SectionLabel>Subscriber Movements</SectionLabel>
        <DashboardTable columns={SUBS_MOV_COLUMNS} rows={SUBS_MOV_ROWS} searchPlaceholder="Search movements..." menuItems={[]} />
      </div>

      {/* Subscribers by Plan chart */}
      <Card className="flex flex-col">
        <SectionLabel>Subscribers by Plan</SectionLabel>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={SUBS_CHART} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="m" tick={TICK} {...AXIS} />
            <YAxis tick={TICK} {...AXIS} />
            <Tooltip content={(p: any) => <ChartTip {...p} fmt={(v) => v.toLocaleString()} />} />
            {(["p0","p1","p2","p3","p4","p5"] as const).map((key, i) => (
              <Bar key={key} dataKey={key} name={PLANS[i]?.name ?? key} stackId="a" fill={PLAN_COLORS[i]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {PLANS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PLAN_COLORS[i] }} />{p.name}
            </div>
          ))}
        </div>
      </Card>

      {/* Subscribers by Plan table */}
      <div>
        <SectionLabel>Plan Breakdown</SectionLabel>
        <DashboardTable columns={SUBS_PLAN_COLUMNS} rows={SUBS_PLAN_ROWS} searchPlaceholder="Search plans..." menuItems={[]} />
      </div>
    </div>
  );
}

// ── view ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "mrr",         label: "MRR" },
  { key: "subscribers", label: "Subscribers" },
] as const;

type Tab = typeof TABS[number]["key"];

export default function SubscriptionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "mrr";
  function setTab(key: Tab) { navigate(`/subscription?tab=${key}`, { replace: true }); }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Tab nav */}
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium transition-colors duration-100
              ${tab === t.key
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={tab} className="px-4 pt-4 animate-fade-up">
        {tab === "mrr" ? <MrrTab /> : <SubscribersTab />}
      </div>

      {/* Shared section */}
      <div className="px-4 pb-4 pt-2">
        <div className="my-4" style={{ borderTop: "1px solid var(--border)" }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NRR */}
          <Card>
            <SectionLabel>Net Revenue Retention</SectionLabel>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">97.0%</span>
              <span className="text-xs font-semibold text-emerald-500">+0.6pp</span>
              <span className="text-xs text-stone-400">vs last month</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={NRR_DATA} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={TICK} {...AXIS} />
                <YAxis domain={[80, 120]} tickFormatter={(v) => `${v}%`} tick={TICK} {...AXIS} />
                <Tooltip content={(p: any) => <ChartTip {...p} fmt={(v) => `${v.toFixed(1)}%`} />} />
                <Line type="monotone" dataKey="v" name="NRR" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Trial-to-Paid */}
          <Card>
            <SectionLabel>Trial-to-Paid Funnel</SectionLabel>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-stone-900 dark:text-stone-100">41.2%</span>
              <span className="text-xs text-stone-400">overall conversion</span>
            </div>
            <div className="flex items-end gap-5">
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">1.13K</p>
                <p className="text-xs text-stone-400 mb-1">Trial Started</p>
                <div className="h-16 w-full rounded-lg bg-blue-500" />
              </div>
              <div className="w-px self-end h-16 bg-stone-200 dark:bg-white/10" />
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">467</p>
                <p className="text-xs text-stone-400 mb-1">Converted · 41.2%</p>
                <div className="flex h-16 w-full gap-1">
                  <div className="flex-1 rounded-lg bg-blue-100 dark:bg-blue-400/20" />
                  <div className="flex-1 self-end rounded-lg bg-blue-500" style={{ height: "55%" }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Expansion Revenue */}
          <Card>
            <SectionLabel>Expansion Revenue</SectionLabel>
            <div className="mb-3">
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">$1.18</span>
              <span className="ml-2 text-xs text-stone-400">last 6 months</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={EXPANSION_DATA} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" tick={TICK} {...AXIS} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={TICK} {...AXIS} />
                <Tooltip content={(p: any) => <ChartTip {...p} fmt={(v) => `$${v}`} />} />
                <Area type="monotone" dataKey="v" name="Revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
