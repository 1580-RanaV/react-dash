

import { useState } from "react";
import { Check, Copy, RefreshCw, Shuffle } from "lucide-react";
import type { GridCard } from "./GridCardView";
import SlidingSidebar from "./SlidingSidebar";
import BackButton from "./BackButton";

const IMG = "/scene.png";

const SCENE_MD = `# Autumn Harvest

## Category
Seasonal

## Composition
- **Lighting**: Earth Glow
- **Camera**: Top Down
- **Background**: Kraft Paper
- **Surface**: Rough Wood
- **Color Palette**: Terracotta Clay
- **Style**: Wabi Sabi
- **Scene**: Farm
- **Props**: seasonal-props, ingredients

## Compiled Prompt
Lighting: earth glow. Camera: top down. Background: bg kraft paper. Surface: srf rough wood. Color palette: cp terracotta clay. Style: sty wabi sabi. Scene: scn farm. Props: seasonal-props, ingredients.`;

type ActionKey = "details" | "remix" | "scene";

export default function SceneDetailView({ scene, onBack }: { scene: GridCard; onBack: () => void }) {
  const [activeAction, setActiveAction] = useState<ActionKey>("details");
  const [mdOpen, setMdOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 text-sm min-w-0 pr-4">
          <BackButton onClick={onBack} />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{scene.name}</span>
        </div>

        <div className="shrink-0 flex items-center gap-0.5 rounded-lg bg-stone-100 dark:bg-white/8 p-0.5">
          <button
            onClick={() => setActiveAction("details")}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${activeAction === "details" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            Details
          </button>
          <button
            onClick={() => { setActiveAction("remix"); window.dispatchEvent(new Event("open-blu-chat")); }}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${activeAction === "remix" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            <Shuffle size={13} />
            Remix
          </button>
          <button
            onClick={() => { setActiveAction("scene"); setMdOpen(true); }}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${activeAction === "scene" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            scene.md
          </button>
        </div>
      </div>

      {/* Body — 50/50 */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left 50%: landscape image */}
        <div className="flex flex-col items-center justify-center gap-4 p-8" style={{ flexBasis: "50%", flexShrink: 0 }}>
          <div className="relative w-full max-w-120 overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "4/3" }}>
            <img src={IMG} alt={scene.name} className="h-full w-full object-cover" />
            <button className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-xs font-medium text-stone-700 backdrop-blur-sm transition-colors hover:bg-white dark:bg-black/50 dark:text-stone-200 dark:hover:bg-black/70">
              <RefreshCw size={11} />
              Regenerate
            </button>
          </div>
        </div>

        {/* Right 50%: details */}
        <div className="overflow-y-auto px-8 py-6" style={{ flexBasis: "50%" }}>
          <div className="flex flex-col gap-7">
            <Section title="Identity">
              <Row label="Name"     value={scene.name} />
              <Row label="Category" value="Seasonal" />
            </Section>
            <Section title="Block Summary">
              <Row label="Lighting"    value="Earth Glow" />
              <Row label="Camera"      value="Top Down" />
              <Row label="Background"  value="Kraft Paper" />
              <Row label="Surface"     value="Rough Wood" />
            </Section>
            <Section title="Style">
              <Row label="Color Palette" value="Terracotta Clay" />
              <Row label="Style"         value="Wabi Sabi" />
              <Row label="Scene"         value="Farm" />
              <Row label="Props"         value="Seasonal" />
              <Row label="Materials"     value="Ingredients, Raw materials" />
            </Section>
            <Section title="Palette Swatch">
              <div
                className="h-12 w-full rounded-xl"
                style={{ background: "linear-gradient(to right, #E8C4A0, #C4704A, #8B5E3C, #5C3A20)" }}
              />
            </Section>
          </div>
        </div>
      </div>

      {/* scene.md shelf */}
      {mdOpen && (
        <SlidingSidebar
          title="scene.md"
          description={`Markdown spec for ${scene.name}`}
          onClose={() => { setMdOpen(false); setActiveAction("details"); }}
        >
          <SceneMdContent name={scene.name} />
        </SlidingSidebar>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-28 shrink-0 text-sm text-stone-400 dark:text-stone-500">{label}</span>
      <span className="text-sm text-stone-700 dark:text-stone-300">{value}</span>
    </div>
  );
}

function SceneMdContent({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const content = SCENE_MD.replace("# Autumn Harvest", `# ${name}`);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-0 top-0 inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
      >
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300 pt-10">
        {content}
      </pre>
    </div>
  );
}
