
import { useState } from "react";
import { ArrowLeft, Bell, ChevronDown, ChevronUp, Home, Search, Shuffle, Star, User } from "lucide-react";

// ── Color math ────────────────────────────────────────────────────────────────
function hexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, v * 100];
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100; v /= 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const sets: [number, number, number][] = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
  const [r, g, b] = sets[i] ?? [0, 0, 0];
  return `#${[r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

function generateShades(hex: string): string[] {
  const [h, s] = hexToHsl(hex);
  const bs = Math.max(s, 12);
  return [
    hslToHex(h, bs * 0.15, 96),
    hslToHex(h, bs * 0.3, 89),
    hslToHex(h, bs * 0.5, 79),
    hslToHex(h, bs * 0.7, 67),
    hslToHex(h, bs * 0.85, 55),
    hex,
    hslToHex(h, s, 37),
    hslToHex(h, s, 24),
    hslToHex(h, s * 0.8, 14),
    hslToHex(h, s * 0.5, 7),
  ];
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type ThemePalette = {
  id: string;
  name: string;
  colors: [string, string, string, string];
};

type FontOption = { name: string; stack: string };

const HEADLINE_FONTS: FontOption[] = [
  { name: "Playfair Display", stack: '"Playfair Display", Georgia, serif' },
  { name: "Merriweather", stack: '"Merriweather", Georgia, serif' },
  { name: "Lora", stack: '"Lora", Georgia, serif' },
  { name: "DM Serif Display", stack: '"DM Serif Display", Georgia, serif' },
];

const BODY_FONT_GROUPS = [
  {
    label: "Clean Sans",
    options: [
      { name: "Inter", stack: '"Inter", system-ui, sans-serif' },
      { name: "DM Sans", stack: '"DM Sans", system-ui, sans-serif' },
      { name: "Nunito Sans", stack: '"Nunito Sans", system-ui, sans-serif' },
      { name: "Source Sans 3", stack: '"Source Sans 3", system-ui, sans-serif' },
      { name: "IBM Plex Sans", stack: '"IBM Plex Sans", system-ui, sans-serif' },
    ],
  },
  {
    label: "Geometric",
    options: [
      { name: "Poppins", stack: '"Poppins", system-ui, sans-serif' },
      { name: "Nunito", stack: '"Nunito", system-ui, sans-serif' },
    ],
  },
];

const LABEL_FONTS: FontOption[] = [
  { name: "Inter", stack: '"Inter", system-ui, sans-serif' },
  { name: "DM Sans", stack: '"DM Sans", system-ui, sans-serif' },
  { name: "Geist", stack: '"Geist", system-ui, sans-serif' },
];

// ── ColorRoleCard ─────────────────────────────────────────────────────────────
function ColorRoleCard({ label, hex, shades }: { label: string; hex: string; shades: string[] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</span>
        <span className="font-mono text-xs text-stone-500">{hex.toUpperCase()}</span>
      </div>
      <div className="mx-3 h-14 rounded-lg" style={{ background: hex }} />
      <div className="flex gap-px px-3 py-2.5">
        {shades.map((shade, i) => (
          <div
            key={i}
            className="h-4 flex-1 first:rounded-l last:rounded-r"
            style={{ background: shade }}
            title={shade}
          />
        ))}
      </div>
    </div>
  );
}

// ── AccordionSection ──────────────────────────────────────────────────────────
function AccordionSection({
  title, description, expanded, onToggle, children,
}: {
  title: string; description?: string; expanded: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">{title}</span>
        {expanded
          ? <ChevronUp size={14} className="shrink-0 text-stone-400" />
          : <ChevronDown size={14} className="shrink-0 text-stone-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {description && <p className="mb-3 text-xs text-stone-400 dark:text-stone-500">{description}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

// ── SeedColorPicker ───────────────────────────────────────────────────────────
function SeedColorPicker({ color, onChange }: { color: string; onChange: (h: string) => void }) {
  const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(color));
  const [hexInput, setHexInput] = useState(color.toUpperCase());

  const [h, s, v] = hsv;
  const hueHex = hsvToHex(h, 100, 100);

  function applyHsv(next: [number, number, number]) {
    setHsv(next);
    const hex = hsvToHex(...next);
    setHexInput(hex.toUpperCase());
    onChange(hex);
  }

  function onSquareClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const sx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const sy = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    applyHsv([h, sx * 100, (1 - sy) * 100]);
  }

  function onHueClick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const hx = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    applyHsv([hx * 360, s, v]);
  }

  function onHexChange(val: string) {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      applyHsv(hexToHsv(val));
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="relative h-32 w-full cursor-crosshair overflow-hidden rounded-lg"
        style={{ background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, ${hueHex})` }}
        onClick={onSquareClick}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          style={{ left: `${s}%`, top: `${100 - v}%`, background: hsvToHex(h, s, v), boxShadow: "0 0 0 1px rgba(0,0,0,0.3)" }}
        />
      </div>
      <div
        className="relative h-3 w-full cursor-pointer overflow-hidden rounded-full"
        style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
        onClick={onHueClick}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
          style={{ left: `${(h / 360) * 100}%`, background: hueHex, boxShadow: "0 0 0 1px rgba(0,0,0,0.2)" }}
        />
      </div>
      <input
        value={hexInput}
        onChange={(e) => onHexChange(e.target.value)}
        maxLength={7}
        className="h-9 w-full rounded-lg border px-3 text-center font-mono text-sm text-stone-700 outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-stone-200"
        style={{ background: "var(--input)", borderColor: "var(--border)" }}
      />
    </div>
  );
}

// ── FontDropdown ──────────────────────────────────────────────────────────────
function FontDropdown({
  roleLabel, selected, groups, isOpen, onOpen, onSelect,
}: {
  roleLabel: string; selected: FontOption;
  groups: { label: string; options: FontOption[] }[];
  isOpen: boolean; onOpen: () => void; onSelect: (f: FontOption) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors"
        style={{ background: "var(--input)", borderColor: isOpen ? "#3b82f6" : "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-semibold text-stone-700 dark:text-stone-200" style={{ fontFamily: selected.stack }}>Aa</span>
          <div>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{selected.name}</p>
            <p className="text-xs text-stone-400">{roleLabel}</p>
          </div>
        </div>
        {isOpen
          ? <ChevronUp size={13} className="shrink-0 text-stone-400" />
          : <ChevronDown size={13} className="shrink-0 text-stone-400" />}
      </button>
      {isOpen && (
        <div
          className="mt-1 overflow-hidden rounded-xl border"
          style={{ background: "var(--content-bg)", borderColor: "var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "border-t" : ""} style={{ borderColor: "var(--border)" }}>
              <p className="px-3 pt-2.5 pb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">{group.label}</p>
              {group.options.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => onSelect(opt)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-white/5 ${
                    selected.name === opt.name
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-stone-600 dark:text-stone-400"
                  }`}
                >
                  <span style={{ fontFamily: opt.stack }}>Aa</span>
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PreviewSelect ─────────────────────────────────────────────────────────────
function PreviewSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full appearance-none rounded-lg border px-3 pr-8 text-sm font-medium text-stone-700 outline-none dark:text-stone-200"
          style={{ background: "var(--input)", borderColor: "var(--border)" }}
        >
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function DesignThemeDetailView({
  palette, onBack,
}: {
  palette: ThemePalette; onBack: () => void;
}) {
  const [p, se, t, n] = palette.colors;

  const [seed, setSeed] = useState(p);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [expanded, setExpanded] = useState(new Set(["seed", "palette", "typography", "radius", "components"]));
  const [headlineFont, setHeadlineFont] = useState(HEADLINE_FONTS[0]);
  const [bodyFont, setBodyFont] = useState(BODY_FONT_GROUPS[0].options[3]);
  const [labelFont, setLabelFont] = useState(LABEL_FONTS[0]);
  const [openFont, setOpenFont] = useState<"headline" | "body" | "label" | null>(null);
  const [cornerRadius, setCornerRadius] = useState(1);
  const [buttonStyle, setButtonStyle] = useState("Filled");
  const [cardStyle, setCardStyle] = useState("Elevated");
  const [inputStyle, setInputStyle] = useState("Outlined");

  const shades = {
    p: generateShades(p),
    se: generateShades(se),
    t: generateShades(t),
    n: generateShades(n),
  };

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const isDark = previewMode === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const bg2 = isDark ? "#252525" : "#f8f9fa";
  const bd = isDark ? "#2e2e2e" : "#e5e7eb";
  const tx = isDark ? "#f3f4f6" : "#111827";
  const txm = isDark ? "#9ca3af" : "#6b7280";

  const radii = [0, 4, 8, 16];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top nav */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{palette.name}</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6" style={{ borderColor: "var(--border)" }}>
            Preset
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6" style={{ borderColor: "var(--border)" }}>
            <Shuffle size={12} /> Remix
          </button>
        </div>
      </div>

      {/* 3-col body */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left: color roles ── */}
        <div className="w-52 shrink-0 overflow-y-auto border-r p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
          <ColorRoleCard label="Primary"   hex={p}  shades={shades.p}  />
          <ColorRoleCard label="Secondary" hex={se} shades={shades.se} />
          <ColorRoleCard label="Tertiary"  hex={t}  shades={shades.t}  />
          <ColorRoleCard label="Neutral"   hex={n}  shades={shades.n}  />
        </div>

        {/* ── Center: preview ── */}
        <div className="flex-1 overflow-y-auto p-4" style={{ background: "var(--page)" }}>
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">

            {/* Typography column */}
            <div className="flex flex-col gap-3">
              {[
                { label: "HEADLINE", font: headlineFont, size: "text-6xl font-bold" },
                { label: "BODY",     font: bodyFont,     size: "text-5xl font-normal" },
                { label: "LABEL",    font: labelFont,    size: "text-4xl font-medium" },
              ].map(({ label, font, size }) => (
                <div key={label} className="flex flex-col rounded-xl p-5" style={{ background: bg, border: `1px solid ${bd}` }}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>{label}</p>
                  <div className={`${size} leading-none`} style={{ fontFamily: font.stack, color: tx }}>Aa</div>
                  <p className="mt-3 text-xs" style={{ color: txm }}>{font.name}</p>
                </div>
              ))}
            </div>

            {/* Right sections */}
            <div className="flex flex-col gap-3">

              {/* BUTTONS */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>BUTTONS</p>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: p }}>Primary</button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ border: `1.5px solid ${p}`, color: p }}>Secondary</button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: t }}>Accent</button>
                  <button className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ color: txm }}>Ghost</button>
                </div>
              </div>

              {/* ACCENT BARS */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>ACCENT BARS</p>
                <div className="space-y-2">
                  {[{ c: p, l: "primary" }, { c: se, l: "secondary" }, { c: t, l: "tertiary" }, { c: n, l: "neutral" }].map(({ c, l }) => (
                    <div key={l} className="flex items-center gap-2">
                      <div className="h-5 flex-1 rounded-sm" style={{ background: c }} />
                      <span className="w-16 text-right text-xs" style={{ color: txm }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ELEMENTS */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>ELEMENTS</p>
                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: p }}>+</button>
                  <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: se + "30", color: se }}>Active</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: n, color: txm }}>Pending</span>
                  <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: t + "25", color: t }}>Alert</span>
                </div>
              </div>

              {/* INPUT */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>INPUT</p>
                <div className="relative">
                  <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: txm }} />
                  <input readOnly placeholder="Search..." className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none" style={{ background: bg2, border: `1px solid ${bd}`, color: txm }} />
                </div>
              </div>

              {/* ICONS */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>ICONS</p>
                <div className="flex items-center gap-4">
                  {[Home, Search, User, Star, Bell].map((Icon, i) => (
                    <Icon key={i} size={20} style={{ color: tx }} />
                  ))}
                </div>
              </div>

              {/* CARD */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>CARD</p>
                <div className="rounded-xl p-4" style={{ background: bg2, border: `1px solid ${bd}`, boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h3 className="mb-1 text-sm font-semibold" style={{ color: tx }}>Card Title</h3>
                  <p className="mb-3 text-xs leading-relaxed" style={{ color: txm }}>A preview of how cards render with your chosen fonts.</p>
                  <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: p + "18", color: p }}>Label</span>
                </div>
              </div>

              {/* TYPE SCALE */}
              <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${bd}` }}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: txm }}>TYPE SCALE</p>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold" style={{ fontFamily: headlineFont.stack, color: tx }}>Display</p>
                  <p className="text-xl font-semibold" style={{ fontFamily: headlineFont.stack, color: tx }}>Title</p>
                  <p className="text-sm" style={{ fontFamily: bodyFont.stack, color: tx }}>Body</p>
                  <p className="text-xs font-medium" style={{ fontFamily: labelFont.stack, color: txm }}>Caption</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Right: config panel ── */}
        <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-l" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>

          {/* Preview toggle */}
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">PREVIEW</span>
            <div className="inline-flex overflow-hidden rounded-lg border text-xs font-medium" style={{ borderColor: "var(--border)" }}>
              {(["light", "dark"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`px-3 py-1.5 transition-colors ${
                    previewMode === mode
                      ? "bg-stone-800 text-white dark:bg-white dark:text-stone-900"
                      : "text-stone-500 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
                  } ${mode === "dark" ? "border-l" : ""}`}
                  style={mode === "dark" ? { borderColor: "var(--border)" } : {}}
                >
                  {mode === "light" ? "☀" : "☽"} {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Accordions */}
          <div className="flex-1">
            <AccordionSection title="SEED COLOR" description="The source color that generates your entire palette." expanded={expanded.has("seed")} onToggle={() => toggle("seed")}>
              <SeedColorPicker color={seed} onChange={setSeed} />
            </AccordionSection>

            <AccordionSection title="COLOR THEME" expanded={expanded.has("theme")} onToggle={() => toggle("theme")}>
              <div className="space-y-0.5">
                {["Analogous", "Complementary", "Triadic", "Monochromatic"].map((t) => (
                  <button key={t} className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5">{t}</button>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="COLOR PALETTE" description="Four derived color roles. Click any swatch to override — switches to Custom theme." expanded={expanded.has("palette")} onToggle={() => toggle("palette")}>
              <div className="space-y-1">
                {[{ label: "Primary", color: p }, { label: "Secondary", color: se }, { label: "Tertiary", color: t }, { label: "Neutral", color: n }].map(({ label, color }) => (
                  <div key={label} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-stone-50 dark:hover:bg-white/4">
                    <div className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white dark:ring-stone-700" style={{ background: color }} />
                    <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-200">{label}</span>
                    <span className="font-mono text-xs text-stone-400">{color.toUpperCase()}</span>
                    <ChevronDown size={12} className="shrink-0 text-stone-300" />
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="TYPOGRAPHY" description="Headline = titles, Body = paragraphs, Label = buttons & UI." expanded={expanded.has("typography")} onToggle={() => toggle("typography")}>
              <div className="space-y-2">
                <FontDropdown
                  roleLabel="Headline" selected={headlineFont}
                  groups={[{ label: "Serif", options: HEADLINE_FONTS }]}
                  isOpen={openFont === "headline"}
                  onOpen={() => setOpenFont(openFont === "headline" ? null : "headline")}
                  onSelect={(f) => { setHeadlineFont(f); setOpenFont(null); }}
                />
                <FontDropdown
                  roleLabel="Body" selected={bodyFont}
                  groups={BODY_FONT_GROUPS}
                  isOpen={openFont === "body"}
                  onOpen={() => setOpenFont(openFont === "body" ? null : "body")}
                  onSelect={(f) => { setBodyFont(f); setOpenFont(null); }}
                />
                <FontDropdown
                  roleLabel="Label" selected={labelFont}
                  groups={[{ label: "Sans", options: LABEL_FONTS }]}
                  isOpen={openFont === "label"}
                  onOpen={() => setOpenFont(openFont === "label" ? null : "label")}
                  onSelect={(f) => { setLabelFont(f); setOpenFont(null); }}
                />
              </div>
            </AccordionSection>

            <AccordionSection title="CORNER RADIUS" description="Controls roundness of buttons, cards, and inputs." expanded={expanded.has("radius")} onToggle={() => toggle("radius")}>
              <div className="flex gap-2">
                {radii.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setCornerRadius(i)}
                    title={["None", "Small", "Medium", "Large"][i]}
                    className={`flex h-11 flex-1 items-center justify-center rounded-lg border transition-colors ${
                      cornerRadius === i
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-stone-50 dark:hover:bg-white/5"
                    }`}
                    style={{ borderColor: cornerRadius === i ? "#3b82f6" : "var(--border)" }}
                  >
                    <div
                      style={{
                        width: 18, height: 18,
                        borderTop: "2px solid currentColor",
                        borderRight: "2px solid currentColor",
                        borderTopRightRadius: r,
                        color: cornerRadius === i ? "#3b82f6" : "#9ca3af",
                      }}
                    />
                  </button>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="OVERVIEW" expanded={expanded.has("overview")} onToggle={() => toggle("overview")}>
              <div className="space-y-2 text-xs">
                {[["Theme", "Custom"], ["Color roles", "4"], ["Font families", "3"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-stone-500">{k}</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">{v}</span>
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="ELEVATION" expanded={expanded.has("elevation")} onToggle={() => toggle("elevation")}>
              <div className="space-y-3">
                {[
                  { label: "Low",  shadow: "0 2px 6px rgba(0,0,0,0.06)",  detail: "0 4px 12px rgba(61,44,94,0.08)" },
                  { label: "Mid",  shadow: "0 4px 14px rgba(0,0,0,0.10)", detail: "0 8px 24px rgba(61,44,94,0.12)" },
                  { label: "High", shadow: "0 8px 24px rgba(0,0,0,0.14)", detail: "0 16px 40px rgba(61,44,94,0.16)" },
                ].map(({ label, shadow, detail }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="h-8 w-14 rounded-lg" style={{ background: "var(--content-bg)", boxShadow: shadow, border: "1px solid var(--border)" }} />
                    <div>
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-300">{label}</p>
                      <p className="font-mono text-xs text-stone-400">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title="COMPONENTS" description="Configure button, card, and input styling." expanded={expanded.has("components")} onToggle={() => toggle("components")}>
              <div className="space-y-3">
                <PreviewSelect label="BUTTONS" value={buttonStyle} options={["Filled", "Outlined", "Soft"]} onChange={setButtonStyle} />
                <PreviewSelect label="CARDS"   value={cardStyle}   options={["Elevated", "Flat", "Outlined"]} onChange={setCardStyle} />
                <PreviewSelect label="INPUTS"  value={inputStyle}  options={["Outlined", "Filled", "Underlined"]} onChange={setInputStyle} />
              </div>
            </AccordionSection>
          </div>

          {/* Save */}
          <div className="shrink-0 border-t p-4" style={{ borderColor: "var(--border)" }}>
            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#2563eb" }}
            >
              Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
