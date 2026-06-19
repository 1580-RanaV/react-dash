

import { useEffect, useRef, useState } from "react";

import {
  X,
  Plus,
  ArrowUp,
  AtSign,
  Paperclip,
  Terminal,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  BookOpen,
  UserRound,
  Camera,
  PersonStanding,
  Box,
  Rss,
  SlidersHorizontal,
} from "lucide-react";
import FeedbackQuestionnaire from "./FeedbackQuestionnaire";

type ReferenceAttachment = {
  category: string;
  title: string;
  subtitle: string;
  bg: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "blu";
  text: string;
  attachments?: ReferenceAttachment[];
  feedbackForm?: boolean;
};

const SAMPLE: ChatMessage[] = [
  {
    id: "sample-user",
    role: "user",
    text: "2. Abandoned Cart Email\nGenerate an abandoned cart email for the customer's cart contents. Open with a minimal logo header — no hero. Show each cart item as a row with image, name, variant, and price. One full-width CTA linking directly to the cart. One supporting nudge below the cart — free shipping, return policy, or active offer if one exists. Keep the tone direct and low-pressure.",
  },
  {
    id: "sample-blu",
    role: "blu",
    text: "Generated the FieldsUSA abandoned cart recovery email — minimal dark header, Anton headline, three cart rows with Liquid feed tags, single red CTA, nudge line, and compact dark footer with unsubscribe.",
  },
];

const PLUS_ITEMS = [
  {
    icon: <AtSign size={15} className="text-stone-500 dark:text-stone-400" />,
    label: "References",
    desc: "Brand kit, products, feeds",
    arrow: true,
  },
  {
    icon: <Paperclip size={15} className="text-stone-500 dark:text-stone-400" />,
    label: "Attach Files",
    desc: "File from device",
    arrow: false,
  },
  {
    icon: <Terminal size={15} className="text-stone-500 dark:text-stone-400" />,
    label: "Commands",
    desc: "Slash commands",
    arrow: false,
  },
];

const REFERENCE_ITEMS = [
  { label: "Design system", icon: <BookOpen size={14} /> },
  { label: "Avatar", icon: <UserRound size={14} /> },
  { label: "Scene", icon: <Camera size={14} /> },
  { label: "Pose", icon: <PersonStanding size={14} /> },
  { label: "Products & Feeds", icon: <Box size={14} /> },
  { label: "Feeds", icon: <Rss size={14} /> },
  { label: "Image settings", icon: <SlidersHorizontal size={14} /> },
];

const REFERENCE_TILES = [
  { title: "Paper sweep - White", subtitle: "Lighting: high key floor", bg: "linear-gradient(135deg,#f8fafc 0%,#ffffff 55%,#dbe3ea 100%)" },
  { title: "Paper sweep - Cream", subtitle: "Lighting: soft diffused", bg: "linear-gradient(135deg,#f6eedf 0%,#fffaf0 55%,#e8dcc4 100%)" },
  { title: "Vinyl sweep - Charcoal", subtitle: "Lighting: studio", bg: "radial-gradient(circle at 50% 20%,#555 0%,#1f1f1f 50%,#090909 100%)" },
  { title: "Warm gradient", subtitle: "Lighting: vivid backdrop", bg: "linear-gradient(160deg,#ff4d2d 0%,#ff8a35 55%,#ffd27a 100%)" },
  { title: "White showroom", subtitle: "Lighting: natural", bg: "linear-gradient(135deg,#ffffff 0%,#eef2f5 58%,#d7dee6 100%)" },
  { title: "Walnut studio", subtitle: "Lighting: warm accent", bg: "linear-gradient(135deg,#2b1710 0%,#704126 45%,#1d1512 100%)" },
  { title: "Concrete loft", subtitle: "Lighting: soft industrial", bg: "linear-gradient(135deg,#d7d7d4 0%,#a8aaa9 58%,#737678 100%)" },
  { title: "Blue seamless", subtitle: "Lighting: cool studio", bg: "linear-gradient(135deg,#d9ecff 0%,#8bbdf0 58%,#3975bd 100%)" },
  { title: "Forest set", subtitle: "Lighting: moody natural", bg: "linear-gradient(135deg,#0f241a 0%,#2f5c39 50%,#0b1510 100%)" },
  { title: "Retail shelf", subtitle: "Lighting: bright product", bg: "linear-gradient(135deg,#f6f7f8 0%,#ffffff 35%,#d6dde4 36%,#eef1f4 100%)" },
  { title: "Steel table", subtitle: "Lighting: crisp overhead", bg: "linear-gradient(135deg,#c8ced5 0%,#f8fafc 45%,#737b83 100%)" },
  { title: "Black marble", subtitle: "Lighting: premium contrast", bg: "linear-gradient(135deg,#080808 0%,#202020 42%,#4d4d4d 43%,#121212 100%)" },
  { title: "Desert wall", subtitle: "Lighting: warm matte", bg: "linear-gradient(135deg,#c9905d 0%,#e7c198 50%,#925b34 100%)" },
  { title: "Glass room", subtitle: "Lighting: airy daylight", bg: "linear-gradient(135deg,#f5fbff 0%,#dbeeff 48%,#ffffff 49%,#cddbe7 100%)" },
  { title: "Red cyclorama", subtitle: "Lighting: campaign bold", bg: "linear-gradient(135deg,#8c1111 0%,#df2f24 55%,#ff8a64 100%)" },
];

const IMAGE_ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3", "3:4", "4:5"];
const IMAGE_BACKGROUND_OPTIONS = ["Auto", "White", "Transparent", "+ Custom background"];
const IMAGE_STYLE_OPTIONS = ["Auto", "Studio", "Lifestyle", "Editorial", "On White", "Dark & Moody", "Abstract", "Macro", "Bokeh"];

function referenceTitle(label: string) {
  return label === "Products & Feeds" ? "Products & feeds" : `${label}s`;
}

export default function BluChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  const [planMode, setPlanMode] = useState(false);
  const [imageSettings, setImageSettings] = useState({
    aspect: "1:1",
    background: "Auto",
    style: "Auto",
  });
  const [plusOpen, setPlusOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusOpen(false);
        setReferencesOpen(false);
        setSelectedReference(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function addAttachment(tile: (typeof REFERENCE_TILES)[number]) {
    if (!selectedReference) return;
    const next = {
      category: selectedReference,
      title: tile.title,
      subtitle: tile.subtitle,
      bg: tile.bg,
    };

    setAttachments((current) => [...current.filter((item) => item.category !== selectedReference), next]);
    setPlusOpen(false);
    setReferencesOpen(false);
    setSelectedReference(null);
  }

  function removeAttachment(category: string) {
    setAttachments((current) => current.filter((item) => item.category !== category));
  }

  function updateImageSetting(key: keyof typeof imageSettings, value: string) {
    const nextSettings = { ...imageSettings, [key]: value };
    setImageSettings(nextSettings);
    setAttachments((current) => [
      ...current.filter((item) => item.category !== "Image settings"),
      {
        category: "Image settings",
        title: `${nextSettings.aspect} · ${nextSettings.background} · ${nextSettings.style}`,
        subtitle: "Generation settings",
        bg: "linear-gradient(135deg,#dbeafe 0%,#f8fafc 100%)",
      },
    ]);
  }

  function sendMessage(overrideText?: string) {
    const text = overrideText ?? input.trim();
    if (!text && attachments.length === 0) return;

    const isFeedback = !overrideText && text.toLowerCase() === "feedback";

    setMessages((current) => {
      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: "user", text, attachments };
      const next: ChatMessage[] = [...current, userMsg];
      if (isFeedback) {
        next.push({
          id: `blu-feedback-${Date.now()}`,
          role: "blu",
          text: "I'd love to help capture that! Answer a few quick questions so your feedback reaches the right people.",
          feedbackForm: true,
        });
      }
      return next;
    });

    if (!overrideText) {
      setInput("");
      setAttachments([]);
      setPlusOpen(false);
      setReferencesOpen(false);
      setSelectedReference(null);
    }

    if (!isFeedback) {
      window.dispatchEvent(new CustomEvent("blu-image-generate", { detail: { text } }));
    }
  }

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{
        background: "var(--content-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.75 shrink-0"
      >
        <img src="/mascot.png" alt="Blu" width={28} height={28} className="rounded-full shrink-0 object-contain" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-stone-800 dark:text-stone-100 leading-none">Blu</p>
        </div>
        <button className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400">
          <History size={13} />
        </button>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
        >
          <X size={13} />
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5 chat-scroll">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2.5 items-start animate-fade-up">
            {/* Avatar */}
            {msg.role === "user" ? (
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5">
                <img src="/dp.png" alt="You" width={24} height={24} className="w-full h-full object-cover" />
              </div>
            ) : (
              <img src="/mascot.png" alt="Blu" width={24} height={24} className="rounded-full shrink-0 mt-0.5 object-contain" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {msg.role === "user" ? "Rana" : "Blu"}
                </span>
                <span className="text-xs text-stone-400 dark:text-stone-500">Just now</span>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
              {msg.feedbackForm && (
                <FeedbackQuestionnaire onSubmit={(text) => sendMessage(text)} />
              )}
              {msg.attachments?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.attachments.map((item) => (
                    <span
                      key={`${msg.id}-${item.category}`}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 dark:border-(--border) dark:bg-white/[0.04] dark:text-stone-300"
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: item.bg }} />
                      <span className="truncate">{item.category}: {item.title}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 shrink-0">
        <div
          className="rounded-xl px-4 pt-3 pb-2.5"
          style={{ border: "1px solid var(--border)" }}
        >
          {attachments.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((item) => (
                <span
                  key={item.category}
                  className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1.5 dark:border-(--border) dark:bg-white/[0.04]"
                >
                  <span className="h-7 w-7 shrink-0 rounded-md border border-stone-200 dark:border-(--border)" style={{ background: item.bg }} />
                  <span className="min-w-0">
                    <span className="block max-w-[170px] truncate text-xs font-semibold text-stone-800 dark:text-stone-100">{item.title}</span>
                    <span className="block max-w-[170px] truncate text-xs font-medium text-stone-500 dark:text-stone-400">{item.category}</span>
                  </span>
                  <button
                    onClick={() => removeAttachment(item.category)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-white/10 dark:hover:text-stone-200"
                    aria-label={`Remove ${item.category}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Describe the content you want to create..."
            className="w-full bg-transparent text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 outline-none"
          />
          <div className="flex items-center justify-between mt-3">
            {/* + with dropup */}
            <div ref={plusRef} className="relative">
              <button
                onClick={() => {
                  setPlusOpen((open) => {
                    if (open) {
                      setReferencesOpen(false);
                      setSelectedReference(null);
                    }
                    return !open;
                  });
                }}
                className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                  plusOpen
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
                }`}
              >
                <Plus size={15} />
              </button>

              {plusOpen && (
                <div
                  className="absolute bottom-[calc(100%+8px)] left-0 z-20"
                >
                  {selectedReference ? (
                    <div
                      className="absolute bottom-[calc(100%+8px)] left-0 w-[336px] max-h-[460px] rounded-xl overflow-hidden animate-card-in transition-all duration-200"
                      style={{
                        background: "var(--content-bg)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="flex items-center justify-between px-3.5 py-3">
                        <button
                          onClick={() => {
                            setSelectedReference(null);
                            setReferencesOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                        >
                          <ChevronLeft size={13} />
                          Back to References
                        </button>
                        <button
                          onClick={() => {
                            setPlusOpen(false);
                            setReferencesOpen(false);
                            setSelectedReference(null);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {selectedReference === "Image settings" ? (
                        <div className="space-y-4 px-3.5 pb-4">
                          {[
                            { title: "Aspect ratio", key: "aspect" as const, options: IMAGE_ASPECT_OPTIONS },
                            { title: "Background", key: "background" as const, options: IMAGE_BACKGROUND_OPTIONS },
                            { title: "Style", key: "style" as const, options: IMAGE_STYLE_OPTIONS },
                          ].map((group) => (
                            <div key={group.title}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                                {group.title}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {group.options.map((option) => {
                                  const isActive = imageSettings[group.key] === option;
                                  return (
                                    <button
                                      key={option}
                                      onClick={() => updateImageSetting(group.key, option)}
                                      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                        isActive
                                          ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300"
                                          : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 dark:border-(--border) dark:bg-white/[0.03] dark:text-stone-400 dark:hover:bg-white/6"
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3.5 pb-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                            {referenceTitle(selectedReference)}
                          </p>
                          <div className="relative mb-3">
                            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                            <input
                              type="search"
                              placeholder={`Search ${selectedReference.toLowerCase()} by name...`}
                              className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.03] dark:text-stone-100 dark:placeholder:text-stone-500"
                            />
                          </div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                            Presets
                          </p>
                          <div className="grid max-h-[260px] grid-cols-3 gap-3 overflow-y-auto pr-1">
                            {REFERENCE_TILES.map((tile) => (
                              <button
                                key={tile.title}
                                onClick={() => addAttachment(tile)}
                                className="min-w-0 text-left"
                              >
                                <span
                                  className="block aspect-square rounded-md border border-stone-200 dark:border-(--border)"
                                  style={{ background: tile.bg }}
                                />
                                <span className="mt-1.5 block truncate text-xs font-semibold text-stone-800 dark:text-stone-100">
                                  {tile.title}
                                </span>
                                <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                                  {tile.subtitle}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : referencesOpen ? (
                    <div
                      className="absolute bottom-[calc(100%+8px)] left-0 w-64 rounded-xl overflow-hidden animate-card-in transition-all duration-200"
                      style={{
                        background: "var(--content-bg)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="px-3.5 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        References
                      </div>
                      <div className="pb-1">
                        {REFERENCE_ITEMS.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => setSelectedReference(item.label)}
                            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-stone-500 dark:text-stone-400">
                              {item.icon}
                            </span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div
                    className="w-56 rounded-xl overflow-hidden animate-card-in transition-all duration-200"
                    style={{
                      background: "var(--content-bg)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                    }}
                  >
                    {PLUS_ITEMS.map((item, i) => (
                      <button
                        key={item.label}
                        onMouseEnter={() => item.label === "References" && setReferencesOpen(true)}
                        onClick={() => {
                          if (item.label === "References") {
                            setReferencesOpen(true);
                            return;
                          }
                          setPlusOpen(false);
                          setReferencesOpen(false);
                          setSelectedReference(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-white/5 transition-colors
                          ${i > 0 ? "border-t" : ""}`}
                        style={i > 0 ? { borderColor: "var(--border)" } : undefined}
                      >
                        <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/6 flex items-center justify-center shrink-0">
                          {item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-200 leading-none mb-0.5">{item.label}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 leading-none">{item.desc}</p>
                        </div>
                        {item.arrow && <ChevronRight size={12} className="text-stone-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlanMode((mode) => !mode)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  planMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${planMode ? "bg-blue-600 dark:bg-blue-300" : "bg-stone-400 dark:bg-stone-500"}`}
                />
                Plan {planMode ? "on" : "off"}
              </button>
              <button
                onClick={() => sendMessage()}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
                style={{ background: input.trim() || attachments.length ? "#0080FF" : "var(--border)" }}
              >
                <ArrowUp size={13} className={input.trim() || attachments.length ? "text-white" : "text-stone-400 dark:text-stone-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
