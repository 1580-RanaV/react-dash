

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Shuffle, UserCircle2 } from "lucide-react";
import type { GridCard } from "./GridCardView";
import SlidingSidebar from "./SlidingSidebar";
import BackButton from "./BackButton";

const IMG = "/avatar.png";

const IMAGES = [
  { label: "Main Reference" },
  { label: "Three-quarter" },
  { label: "Full body" },
  { label: "Product in hand" },
];

type ActionKey = "details" | "remix" | "avatar";

export default function AvatarDetailView({ avatar, onBack }: { avatar: GridCard; onBack: () => void }) {
  const [activeAction, setActiveAction] = useState<ActionKey>("details");
  const [mdOpen, setMdOpen] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 text-sm min-w-0 pr-4">
          <BackButton onClick={onBack} />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">@{avatar.name}</span>
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
            onClick={() => { setActiveAction("avatar"); setMdOpen(true); }}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${activeAction === "avatar" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            <UserCircle2 size={13} />
            avatar.md
          </button>
        </div>
      </div>

      {/* Body — 50/50 */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left 50%: image switcher */}
        <div className="flex items-center justify-center gap-3 p-8" style={{ flexBasis: "50%", flexShrink: 0 }}>
          <button
            onClick={() => setImgIdx((i) => (i - 1 + IMAGES.length) % IMAGES.length)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="flex flex-col items-center gap-2">
            <div className="w-100 overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "3/4" }}>
              <img src={IMG} alt={IMAGES[imgIdx].label} className="h-full w-full object-cover object-top" />
            </div>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {IMAGES[imgIdx].label} · {imgIdx + 1} / {IMAGES.length}
            </span>
          </div>
          <button
            onClick={() => setImgIdx((i) => (i + 1) % IMAGES.length)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/5 dark:hover:bg-white/10"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Right 50%: details */}
        <div className="overflow-y-auto px-8 py-6" style={{ flexBasis: "50%" }}>
          <div className="flex flex-col gap-7">
            <Section title="Identity">
              <Row label="Name"        value={avatar.name} />
              <Row label="Category"    value="Tech & Startup" />
              <Row label="Language"    value="EN" />
              <Row label="Description" value="Black founder — SaaS, fintech, B2B leadership." />
            </Section>
            <Section title="Demographics">
              <Row label="Gender"    value="Male" />
              <Row label="Age Range" value="32–42" />
              <Row label="Ethnicity" value="Black" />
              <Row label="Build"     value="Athletic" />
            </Section>
            <Section title="Characteristics">
              <Row label="Use Cases"   value="SaaS, Fintech, B2B, Agency" />
              <Row label="Expressions" value="Confident, Engaged" />
              <Row label="Posing"      value="Three-quarter, Talking-head, Office candid" />
              <Row label="Mood"        value="Confident, Direct, Warm" />
            </Section>
            <Section title="Appearance">
              <Row label="Hair"   value="Short" />
              <Row label="Build"  value="Athletic" />
              <Row label="Gender" value="Male" />
              <Row label="Age"    value="32–42" />
            </Section>
            <Section title="Wardrobe">
              <Row label="Style 1" value="Blazer over tee" />
              <Row label="Style 2" value="Crewneck" />
              <Row label="Style 3" value="Button-down" />
              <Row label="Setting" value="Office or modern interior." />
            </Section>
            <Section title="Voice">
              <Row label="Stability"  value="0.6" />
              <Row label="Similarity" value="0.8" />
              <Row label="Style"      value="0.3" />
              <Row label="Speed"      value="1" />
            </Section>
          </div>
        </div>
      </div>

      {/* avatar.md shelf */}
      {mdOpen && (
        <SlidingSidebar
          title="avatar.md"
          description={`Markdown spec for @${avatar.name}`}
          onClose={() => { setMdOpen(false); setActiveAction("details"); }}
        >
          <AvatarMdContent name={avatar.name} />
        </SlidingSidebar>
      )}
    </div>
  );
}

/* ── avatar.md content ───────────────────────────────────────────────────── */

const AVATAR_MD = `# Ada

## Description

Universal commerce face. Warm, approachable, neutral wardrobe — sells beauty, fashion, wellness, food, and home without competing with the product.

## Category

Beauty & Fashion

## Visual Identity

- **Face**: oval face, soft jawline, subtle cheekbones
- **Eyes**: almond shape, medium size, green, natural lashes
- **Eyebrows**: arched, medium thickness, natural style
- **Hair**: light brown, long, wavy, voluminous, natural
- **Facial hair**: None
- **Skin tone**: light tone, neutral undertone, smooth texture
- **Expression**: calm and relaxed
- **Build & posture**: slim build, relaxed posture
- **Distinctive features**: none visible
- **Overall vibe**: natural elegance with serene confidence

## Reference Images

- **Headshot (Neutral)**: /assets/f1-muse-white-DG9Rf9ok.png
- **Three-Quarter**: /assets/f1-muse-white-DG9Rf9ok.png
- **Lifestyle**: /assets/f1-muse-white-DG9Rf9ok.png
- **Product-in-Hand**: /assets/f1-muse-white-DG9Rf9ok.png

## Expressions

warm, confident, natural-smile

## Voice

- **Voice ID**: EXAVITQu4vr4xnSDxMaL
- **Stability**: 0.55
- **Similarity**: 0.8
- **Style**: 0.25
- **Speed**: 0.95

## Appearance

- **Gender**: Female
- **Age Range**: 24-30
- **Hair**: Long wavy
- **Build**: Slim

## Wardrobe

- Cream knit
- White tee
- Slip dress
- Linen blazer

## Photography Notes

Soft natural light. Highest-remix hero.`;

function AvatarMdContent({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const content = AVATAR_MD.replace("# Ada", `# ${name}`);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-0 top-0 inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
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

/* ── Helpers ──────────────────────────────────────────────────────────────── */

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
      <span className="w-24 shrink-0 text-sm text-stone-400 dark:text-stone-500">{label}</span>
      <span className="text-sm text-stone-700 dark:text-stone-300">{value}</span>
    </div>
  );
}
