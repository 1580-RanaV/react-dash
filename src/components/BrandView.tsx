

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  FileText,
  Fingerprint,
  Folder,
  Link2,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";

type Palette = { id: string; name: string; colors: [string, string, string, string] };

const DESIGN_THEMES: Palette[] = [
  { id: "alexandria",  name: "Alexandria",  colors: ["#7B6FA8", "#C9A8D4", "#2D2050", "#F0ECF8"] },
  { id: "ocean-drift", name: "Ocean Drift", colors: ["#1E6FA8", "#5BA8D4", "#0A2840", "#D4ECF8"] },
  { id: "sage-garden", name: "Sage Garden", colors: ["#5A8A6A", "#A8D4B0", "#1C3828", "#E4F4E8"] },
  { id: "ember",       name: "Ember",       colors: ["#C85A3A", "#E8A888", "#5C1A08", "#FCE8D8"] },
  { id: "midnight",    name: "Midnight",    colors: ["#2A3A5C", "#8898C0", "#0A1230", "#D8DCF0"] },
  { id: "blossom",     name: "Blossom",     colors: ["#D868A0", "#F0B8D4", "#5C1840", "#FCE8F4"] },
  { id: "stone-age",   name: "Stone Age",   colors: ["#A89070", "#D4C0A8", "#3C2C1C", "#F4EDE4"] },
  { id: "citrus",      name: "Citrus",      colors: ["#D4A820", "#E8D870", "#5C4000", "#FDF8D8"] },
];

function ColorRect({ colors, className = "" }: { colors: readonly string[]; className?: string }) {
  return (
    <div className={`flex overflow-hidden rounded ${className}`}>
      {colors.map((c, i) => (
        <div key={i} className="flex-1" style={{ background: c }} />
      ))}
    </div>
  );
}

function ThemeSelect() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(DESIGN_THEMES[0]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  function openDropdown() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setRect({ top: r.bottom, left: r.left, width: r.width });
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(t) &&
        dropdownRef.current && !dropdownRef.current.contains(t)
      ) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Default Theme
      </span>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        className="h-10 w-full flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors hover:border-stone-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100"
      >
        <ColorRect colors={selected.colors} className="h-5 w-10 shrink-0" />
        <span className="flex-1 text-left">{selected.name}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && rect && (
        <div
          ref={dropdownRef}
          className="rounded-xl overflow-hidden py-1"
          style={{
            position: "fixed",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {DESIGN_THEMES.map((theme) => {
            const isActive = theme.id === selected.id;
            return (
              <button
                key={theme.id}
                onClick={() => { setSelected(theme); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-stone-50 dark:bg-white/5"
                    : "hover:bg-stone-50 dark:hover:bg-white/4"
                }`}
              >
                <ColorRect colors={theme.colors} className="h-6 w-14 shrink-0" />
                <span className="flex-1 text-sm text-stone-800 dark:text-stone-100">{theme.name}</span>
                {isActive && <Check size={13} className="text-blue-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const tabs = [
  { key: "identity", label: "Identity", icon: <Fingerprint size={15} /> },
  {
    key: "knowledge",
    label: "Knowledge Base",
    icon: <BookOpen size={15} />,
    emptyIcon: <BookOpen size={20} className="text-stone-300 dark:text-stone-600" />,
    emptyTitle: "Knowledge base is empty",
    emptyDesc: "Upload brand guidelines, messaging frameworks, and tone-of-voice documents.",
  },
];

const products =
  "Firearms - Includes handguns, rifles, and shotguns; Tactical Gear - Reliable accessories for officers; Duty Holsters - Customizable storage solutions for firearms; Body Armor - Protection for law enforcement personnel; Handgun Ammunition - ammunition suitable for handguns; Rifle Ammunition - ammunition specifically for rifles; Shotgun Ammunition - rounds designed for shotguns; LE Duty Ammunition - law enforcement duty-grade ammunition; Hunting Ammunition - designed for hunting purposes; Training Ammunition - made for training scenarios; Less Lethal Ammunition - used for lesser force applications; Ammunition - Various types including handgun, rifle, shotgun, LE duty, hunting, training, and less lethal ammunition; Accessories - Includes holsters, optics, cleaning kits, and more.";

const usage =
  "Supplying tactical gear, body armor, ammunition for duty and training; hunting including small to large game; home defense; personal defense; tactical applications; and recreational shooting and training. Supplying ammunition and equipment for law enforcement, hunting, and shooting sports; facilitating training and preparations for various shooting activities.";

const voiceCards = [
  { title: "Authoritative", desc: "Expert-led, confident, and data-driven. Commands attention with authority and credibility." },
  { title: "Approachable", desc: "Warm, accessible, and friendly. Makes complex topics feel simple and inviting.", active: true },
  { title: "Innovative", desc: "Bold, forward-thinking, and forward-looking. Positions the brand as modern and capable." },
  { title: "Trustworthy", desc: "Reliable, transparent, and proof-backed. Builds confidence through honesty and evidence." },
  { title: "Playful", desc: "Light, memorable, and human. Uses personality carefully without weakening authority." },
];

type IdentitySection = "Company" | "Offer" | "Story" | "Voice";

const KNOWLEDGE_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", width: "36%" },
  { key: "status", label: "Status", width: "14%" },
  { key: "type", label: "Type", width: "14%" },
  { key: "uploadedAt", label: "Uploaded at", width: "20%" },
  { key: "uploadedBy", label: "Uploaded by", width: "16%" },
];

const KNOWLEDGE_ROWS: TableRow[] = [
  {
    id: "design-md",
    cells: {
      name: <span className="inline-flex items-center gap-2"><FileText size={15} className="text-stone-400" />fieldsusa-design.md</span>,
      status: { label: "Uploaded", tone: "green" },
      type: { value: "File", muted: true },
      uploadedAt: { value: "May 22, 2026, 01:27 PM", muted: true },
      uploadedBy: { value: "Somya Nayak", muted: true },
    },
  },
  {
    id: "pricing-email",
    cells: {
      name: <span className="inline-flex items-center gap-2"><FileText size={15} className="text-stone-400" />fieldsusa-officer-pricing-email-2026-05-24.html</span>,
      status: { label: "Uploaded", tone: "green" },
      type: { value: "File", muted: true },
      uploadedAt: { value: "May 28, 2026, 12:17 AM", muted: true },
      uploadedBy: { value: "Eric Gardner", muted: true },
    },
  },
  {
    id: "faq",
    cells: {
      name: <span className="inline-flex items-center gap-2"><FileText size={15} className="text-stone-400" />https://fieldsusa.com/faq/</span>,
      status: { label: "Uploaded", tone: "green" },
      type: { value: "Subdomain", muted: true },
      uploadedAt: { value: "Sep 29, 2025, 10:23 PM", muted: true },
      uploadedBy: { value: "Eric Gardner", muted: true },
    },
  },
  {
    id: "fieldsusa-site",
    type: "group",
    cells: {
      name: <span className="inline-flex items-center gap-2"><Folder size={16} className="text-amber-500" />https://fieldsusa.com <span className="font-medium text-slate-500 dark:text-slate-400">(5 pages)</span></span>,
      status: { label: "Uploaded", tone: "green" },
      type: { value: "Subdomain", muted: true },
      uploadedAt: { value: "Feb 5, 2026, 04:12 PM", muted: true },
      uploadedBy: { value: "Somya Nayak", muted: true },
    },
    children: [
      { id: "ammo-page", cells: { name: "Ammunition | FieldsUSA" } },
      { id: "home-page", cells: { name: "FieldsUSA | Bulk Ammo, Firearms, Optics & More for Police Supply" } },
      { id: "le-page", cells: { name: "Law Enforcement Accessories | FieldsUSA" } },
      { id: "firearms-page", cells: { name: "Firearms | FieldsUSA" } },
      { id: "about-page", cells: { name: "About Us | FieldsUSA" } },
    ],
  },
];

function EditableField({
  label,
  initialValue,
  select = false,
}: {
  label: string;
  initialValue: string;
  select?: boolean;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="relative block">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100 ${select ? "pr-9" : ""}`}
        />
        {select ? (
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        ) : null}
      </span>
    </label>
  );
}

function EditableTextArea({
  label,
  initialValue,
  compact = false,
}: {
  label: string;
  initialValue: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const height = focused ? "h-44" : compact ? "h-20" : "h-28";

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full resize-none rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm leading-6 text-stone-800 outline-none transition-[height,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-200 ${height}`}
      />
    </label>
  );
}

function AccordionSection({
  icon,
  title,
  summary,
  open,
  onToggle,
  locked = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <button
        onClick={onToggle}
        disabled={locked}
        className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors hover:bg-stone-50 disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-white/[0.04] dark:disabled:hover:bg-transparent"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{summary}</p>
        </div>
        {locked ? null : (
          <ChevronDown size={22} strokeWidth={1.8} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      <div className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="ml-11 pb-5 pt-1">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoEditor() {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-xl font-bold tracking-tight text-stone-400 shadow-sm dark:border-(--border) dark:bg-(--muted)">
          F
          <button className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-stone-50 dark:bg-(--raised) dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-white/6">
            <Pencil size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function IdentityContent() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Company: true,
    Offer: false,
    Story: false,
    Voice: false,
  });

  function toggleSection(section: IdentitySection) {
    if (section === "Company") return;
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 pt-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col items-center">
          <LogoEditor />
          <p className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-100">FieldsUSA</p>
        </div>

        <div className="space-y-8">
          <AccordionSection icon={<Building2 size={16} />} title="Company" summary="Core identity fields used everywhere in the dashboard." open onToggle={() => toggleSection("Company")} locked>
              <div className="grid gap-3 lg:grid-cols-3">
                <EditableField label="Name" initialValue="FieldsUSA" />
                <EditableField label="Website" initialValue="https://fieldsusa.com" />
                <ThemeSelect />
              </div>
          </AccordionSection>

          <AccordionSection icon={<BadgeCheck size={16} />} title="Offer" summary="Products, services, use cases, and procurement goals." open={openSections.Offer} onToggle={() => toggleSection("Offer")}>
              <div className="space-y-3">
                <EditableTextArea label="Products & Services" initialValue={products} />
                <EditableTextArea label="How Customers Use It" initialValue={usage} />
                <EditableTextArea label="Mission & Values" initialValue="FieldsUSA aims to provide extensive inventory and competitive pricing to ensure first responders obtain essential gear without exceeding their budget. The brand supports law enforcement officers and departments with mission-critical equipment and ammunition focused on reliability, performance, quality, and affordability." />
                <EditableTextArea label="Goals" initialValue="Increase product awareness among security professionals, facilitate efficient procurement, and emphasize product authenticity and reliability." />
              </div>
          </AccordionSection>

          <AccordionSection icon={<Target size={16} />} title="Story" summary="Positioning, background, competitors, and customer objections." open={openSections.Story} onToggle={() => toggleSection("Story")}>
              <div className="space-y-3">
                <EditableTextArea label="What You Do" initialValue="FieldsUSA is a family-owned supplier of firearms, ammunition, and gear, established in 2010. They focus on providing reliable and high-performance gear for law enforcement personnel, hunters, and shooting enthusiasts, emphasizing performance, reliability, and affordability." />
                <EditableTextArea label="Competitors" initialValue="Other law enforcement supply companies, ammunition retailers focused on tactical or mass-market sales, bulk ammo distributors, and general firearms e-commerce platforms." />
                <EditableTextArea label="Common Objections" initialValue="Cost concerns related to purchasing ammunition and equipment; hesitations regarding product reliability and performance; availability of specific ammunition types; complexity in selecting the right equipment; and trust in long-term supplier relationships." />
              </div>
          </AccordionSection>

          <AccordionSection icon={<MessageSquare size={16} />} title="Voice" summary="Tone profile, language rules, and writing examples." open={openSections.Voice} onToggle={() => toggleSection("Voice")}>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                {voiceCards.map((voice) => (
                  <button key={voice.title} className={`rounded-lg border p-3 text-left transition-colors ${voice.active ? "border-blue-500 bg-white shadow-sm dark:bg-blue-500/10" : "border-stone-200 bg-white/70 hover:bg-white dark:border-(--border) dark:bg-white/[0.025] dark:hover:bg-white/[0.05]"}`}>
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{voice.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{voice.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-3">
                <EditableTextArea label="Selected Voice" initialValue="Approachable. Warm, accessible, and friendly. Makes complex topics feel simple and inviting." compact />
                <EditableTextArea label="Preferred Words" initialValue="ammunition, firearms, tactical gear, law enforcement, military, security supplies, verified access, premium quality" compact />
                <EditableTextArea label="Words to Avoid" initialValue="firearms, ammo, gun, weapon, beginner, cheap, low-quality" compact />
                <EditableTextArea label="Tone & Style" initialValue="Direct, professional, no-fluff, and authoritative. The voice should lean conversational when helping customers, but remain precise and restrained for product and procurement content." compact />
                <EditableTextArea label="On-Brand Example" initialValue="Providing reliable, high-performance gear tailored to law enforcement needs, with a family-oriented approach and customer-focused service." compact />
                <EditableTextArea label="Off-Brand Example" initialValue="Cheap gear for beginners looking for basic weapons and ammo." compact />
              </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
}

function KnowledgeBaseView({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex-1 min-h-0 px-4 pb-4 pt-4 animate-fade-up">
      <DashboardTable
        columns={KNOWLEDGE_COLUMNS}
        rows={KNOWLEDGE_ROWS}
        searchPlaceholder="Search knowledge..."
        action={
          <button
            onClick={onUpload}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 h-9 text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            <Plus size={14} />
            Upload knowledge
          </button>
        }
      />
    </div>
  );
}

function KnowledgeShelf({ onClose }: { onClose: () => void }) {
  const [shelfMethod, setShelfMethod] = useState<"file" | "url" | null>(null);
  const [url, setUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleContinue(close: () => void) {
    if (shelfMethod === "file") { fileRef.current?.click(); close(); }
    else if (shelfMethod === "url" && url.trim()) close();
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.md,.txt" className="sr-only" />
      <SlidingSidebar
        title="Upload knowledge"
        description="Add brand guidelines, messaging frameworks, and tone-of-voice documents."
        onClose={onClose}
        footer={(close) => (
          <>
            <button
              onClick={close}
              className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
            >
              Cancel
            </button>
            <button
              onClick={() => handleContinue(close)}
              disabled={!shelfMethod || (shelfMethod === "url" && !url.trim())}
              className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#0080FF" }}
            >
              Continue
            </button>
          </>
        )}
      >
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setShelfMethod("file")}
            className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
              shelfMethod === "file"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Upload size={17} className={`shrink-0 ${shelfMethod === "file" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
            <div>
              <p className="font-semibold">Upload a file</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">PDF, DOCX, MD, or TXT — we'll parse it into structured knowledge.</p>
            </div>
          </button>

          <button
            onClick={() => setShelfMethod("url")}
            className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
              shelfMethod === "url"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            <Link2 size={17} className={`shrink-0 ${shelfMethod === "url" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
            <div>
              <p className="font-semibold">Enter a URL</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Import content from a webpage or public document link.</p>
            </div>
          </button>

          {shelfMethod === "url" && (
            <div className="mt-1 px-1">
              <input
                autoFocus
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/brand-guide"
                className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100"
              />
            </div>
          )}
        </div>
      </SlidingSidebar>
    </>
  );
}

export default function BrandView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = tabs.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab")! : "identity";
  function setTab(key: string) { navigate(`/brand?tab=${key}`, { replace: true }); }

  const [shelfOpen, setShelfOpen] = useState(false);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <ViewTabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === "identity" ? <IdentityContent /> : <KnowledgeBaseView onUpload={() => setShelfOpen(true)} />}

      {shelfOpen && <KnowledgeShelf onClose={() => setShelfOpen(false)} />}
    </div>
  );
}
