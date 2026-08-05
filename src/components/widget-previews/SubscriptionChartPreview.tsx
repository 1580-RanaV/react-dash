import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

const COLORS = ["#00AAFF", "#C37EE5", "#FF8066", "#57C3D9", "#FFC44D", "#59B277"];

function Tip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; color?: string; fill?: string; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      <p className="mb-1 font-semibold text-stone-900 dark:text-stone-100">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color ?? item.fill }}>
          {item.name}: {Number(item.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function SubscriptionChartPreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const kind = String(widget.meta?.chartKind ?? "line");
  const data = widget.meta?.chartPoints as Array<Record<string, number | string>> | undefined ?? [];
  const value = String(widget.meta?.value ?? "");
  const sub = String(widget.meta?.sub ?? "");
  const keys = widget.meta?.keys as string[] | undefined ?? ["v"];
  const names = widget.meta?.names as string[] | undefined ?? keys;

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
            <span className="text-[22px] font-bold tracking-tight text-stone-900 dark:text-stone-100">{value}</span>
            {sub && <span className="ml-2 text-[11px] text-stone-400 dark:text-stone-500">{sub}</span>}
          </p>
        )}
      </div>
      <div className="h-[156px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "stacked-bar" ? (
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<Tip />} />
              {keys.map((key, i) => <Bar key={key} dataKey={key} name={names[i] ?? key} stackId="a" fill={COLORS[i % COLORS.length]} />)}
            </BarChart>
          ) : kind === "area" ? (
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`sub-${widget.id.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3F8CB2" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#3F8CB2" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} dy={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey={keys[0]} name={names[0]} stroke="#3F8CB2" strokeWidth={2} fill={`url(#sub-${widget.id.replace(/\W/g, "")})`} />
            </AreaChart>
          ) : kind === "funnel" ? (
            <div className="flex h-full items-end gap-5 px-4 pb-4 pt-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">1.13K</p>
                <p className="text-[11px] text-stone-400">Trial Started</p>
                <div className="h-16 w-full rounded-lg bg-blue-500" />
              </div>
              <div className="w-px self-end h-16 bg-stone-200 dark:bg-white/10" />
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">467</p>
                <p className="text-[11px] text-stone-400">Converted · 41.2%</p>
                <div className="flex h-16 w-full gap-1">
                  <div className="flex-1 rounded-lg bg-blue-100 dark:bg-blue-400/20" />
                  <div className="flex-1 self-end rounded-lg bg-blue-500" style={{ height: "55%" }} />
                </div>
              </div>
            </div>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" dy={3} />
              <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey={keys[0]} name={names[0]} stroke="#3F8CB2" strokeWidth={2} dot={false} />
              {keys[1] && <Line type="monotone" dataKey={keys[1]} name={names[1]} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
