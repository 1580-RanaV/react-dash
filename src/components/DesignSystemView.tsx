

import { useRef, useState } from "react";
import { ListFilter, Plus, Search, Sparkles, Upload } from "lucide-react";
import GeneratingLoader from "./GeneratingLoader";
import SlidingSidebar from "./SlidingSidebar";
import DesignThemeDetailView, { type ThemePalette } from "./DesignThemeDetailView";

type Palette = ThemePalette;

const DEFAULT_PALETTES: Palette[] = [
  { id: "alexandria",  name: "Alexandria",  colors: ["#7B6FA8", "#C9A8D4", "#2D2050", "#F0ECF8"] },
  { id: "ocean-drift", name: "Ocean Drift", colors: ["#1E6FA8", "#5BA8D4", "#0A2840", "#D4ECF8"] },
  { id: "sage-garden", name: "Sage Garden", colors: ["#5A8A6A", "#A8D4B0", "#1C3828", "#E4F4E8"] },
  { id: "ember",       name: "Ember",       colors: ["#C85A3A", "#E8A888", "#5C1A08", "#FCE8D8"] },
  { id: "midnight",    name: "Midnight",    colors: ["#2A3A5C", "#8898C0", "#0A1230", "#D8DCF0"] },
  { id: "blossom",     name: "Blossom",     colors: ["#D868A0", "#F0B8D4", "#5C1840", "#FCE8F4"] },
  { id: "stone-age",   name: "Stone Age",   colors: ["#A89070", "#D4C0A8", "#3C2C1C", "#F4EDE4"] },
  { id: "citrus",      name: "Citrus",      colors: ["#D4A820", "#E8D870", "#5C4000", "#FDF8D8"] },
];

function makeGeneratedPalette(): Palette {
  return {
    id: `uploaded-${Math.random().toString(36).slice(2, 8)}`,
    name: "Your Brand",
    colors: ["#1A4FD6", "#6B9EF4", "#0A1E5C", "#D6E4FD"],
  };
}

function PaletteCard({ palette, isNew = false, onClick }: { palette: Palette; isNew?: boolean; onClick: () => void }) {
  const { name, colors } = palette;
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <div className="flex h-28">
        {colors.map((color, i) => (
          <div key={i} className="flex-1" style={{ background: color }} />
        ))}
      </div>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white dark:ring-stone-800"
          style={{ background: `conic-gradient(${colors[0]} 0deg 180deg, ${colors[1]} 180deg 360deg)` }}
        />
        <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">{name}</span>
        {isNew && <span className="ml-auto inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">New</span>}
      </div>
    </div>
  );
}

export default function DesignSystemView() {
  const [selected, setSelected] = useState<Palette | null>(null);
  const [search, setSearch]       = useState("");
  const [shelfOpen, setShelfOpen] = useState(false);
  const [shelfMethod, setShelfMethod] = useState<"ai" | "upload" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [palettes, setPalettes]   = useState<Palette[]>(DEFAULT_PALETTES);
  const [newId, setNewId]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (selected) return <DesignThemeDetailView palette={selected} onBack={() => setSelected(null)} />;

  const filtered = search
    ? palettes.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : palettes;

  function handleBluAI() {
    setShelfOpen(false);
    window.dispatchEvent(new Event("open-blu-chat"));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setShelfOpen(false);
    setUploading(true);
    setTimeout(() => {
      const p = makeGeneratedPalette();
      setPalettes((prev) => [p, ...prev]);
      setNewId(p.id);
      setUploading(false);
    }, 2200);
    e.target.value = "";
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-y-auto animate-fade-up">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 pt-4 pb-4 shrink-0 flex-wrap">
        <div className="relative w-50">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search palettes..."
            className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>

        <button className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-stone-200 bg-white px-3.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:border-(--border) dark:bg-white/3 dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100">
          <ListFilter size={13} />
          Filter
        </button>

        <button
          onClick={() => { setShelfOpen(true); setShelfMethod(null); }}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Plus size={14} />
          Create design system
        </button>
      </div>

      {uploading && <GeneratingLoader />}

      {/* Grid */}
      <div className="px-6 pb-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {filtered.map((palette) => (
            <PaletteCard key={palette.id} palette={palette} isNew={palette.id === newId} onClick={() => setSelected(palette)} />
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".md,.txt,.json" className="hidden" onChange={handleFileChange} />

      {/* Create shelf */}
      {shelfOpen && (
        <SlidingSidebar
          title="Create design system"
          description="Choose how you'd like to create your design system."
          onClose={() => setShelfOpen(false)}
          footer={(close) => (
            <>
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (shelfMethod === "ai") handleBluAI();
                  else if (shelfMethod === "upload") fileRef.current?.click();
                }}
                disabled={!shelfMethod}
                className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: "#0080FF" }}
              >
                Continue
              </button>
            </>
          )}
        >
          <div className="flex flex-col gap-1.5">
            {/* Blu AI option */}
            <button
              onClick={() => setShelfMethod("ai")}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                shelfMethod === "ai"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Sparkles size={17} className={`shrink-0 ${shelfMethod === "ai" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
              <div>
                <p className="font-semibold">Generate with Blu AI</p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Describe your brand and Blu will build a design system for you.</p>
              </div>
            </button>

            {/* Upload option */}
            <button
              onClick={() => setShelfMethod("upload")}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                shelfMethod === "upload"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Upload size={17} className={`shrink-0 ${shelfMethod === "upload" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
              <div>
                <p className="font-semibold">Upload design.md</p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Import an existing design file and we'll parse it into a system.</p>
              </div>
            </button>
          </div>
        </SlidingSidebar>
      )}
    </div>
  );
}
