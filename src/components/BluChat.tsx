

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
  Route,
  Shuffle,
  UserCircle,
  Clapperboard,
  PenTool,
  Package,
  Activity,
  Pin,
  Globe,
  Library,
  Database,
  Users,
  LayoutDashboard,
  PackageOpen,
  CornerLeftUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AppWindow,
  Mail,
  Bell,
  MessageSquare,
  Type,
  Zap,
  Eye,
  ChefHat,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import FeedbackQuestionnaire from "./FeedbackQuestionnaire";
import TypingDots from "./TypingDots";
import JourneyPreviewOverlay from "./JourneyPreviewOverlay";

type MentionChip = {
  id: string;
  categoryKey: string;
  label: string;
};

type QueueItem = {
  id: string;
  text: string;
};

const MENTION_CATEGORIES = [
  { key: "journeys", label: "Journeys" },
  { key: "experiences", label: "Experiences" },
  { key: "avatars", label: "Avatars" },
  { key: "scenes", label: "Scenes" },
  { key: "poses", label: "Poses" },
  { key: "design-system", label: "Design System" },
  { key: "catalog", label: "Catalog Feed" },
  { key: "events", label: "Events" },
];

const MENTION_ITEMS: Record<string, string[]> = {
  journeys: ["Onboarding Flow", "Abandoned Cart Recovery", "Post-Purchase Nurture", "Win-Back Campaign", "Product Education Series", "VIP Loyalty Path"],
  experiences: ["Summer Sale Banner", "Exit Intent Popup", "Welcome Modal", "Loyalty Badge", "Free Shipping Bar", "New Arrivals Spotlight"],
  avatars: ["Aria", "Max", "Sophia", "Jordan", "Riley", "Blake"],
  scenes: ["Paper sweep - White", "Vinyl sweep - Charcoal", "Warm gradient", "Blue seamless", "Walnut studio", "Concrete loft"],
  poses: ["Standing Neutral", "Pointing Right", "Waving", "Crossed Arms", "Casual Lean", "Seated Relaxed"],
  "design-system": ["FieldsUSA Dark", "FieldsUSA Light", "Minimal Clean", "Bold & Modern"],
  catalog: ["Main Product Feed", "Sale Items", "New Arrivals", "Featured Collection", "Clearance Rack"],
  events: ["Page View", "Add to Cart", "Purchase Complete", "Email Open", "Button Click", "Search Query"],
};

type HistoryItem = { id: string; title: string; preview: string; time: string };

const PINNED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "FieldsUSA Summer Campaign", preview: "Abandoned cart email — dark header, Anton headline, three cart rows with feed tags, red CTA", time: "2 days ago" },
  { id: "h2", title: "Q3 Email Templates", preview: "Four-part series: welcome, nurture, win-back, and re-engage — all using your brand kit", time: "Last week" },
];

const RECENT_HISTORY: HistoryItem[] = [
  { id: "h3", title: "Product launch announcement", preview: "Launch copy for the new catalog integration — punchy, benefit-led, mobile-first layout", time: "2h ago" },
  { id: "h4", title: "Welcome email series", preview: "Three-part onboarding sequence with progressive disclosure and personalised subject lines", time: "Yesterday" },
  { id: "h5", title: "Post-purchase nurture flow", preview: "Five-email journey starting 24h after first order, pulling live order data from feed", time: "Yesterday" },
  { id: "h6", title: "Win-back campaign copy", preview: "Re-engagement sequence targeting customers inactive for 90+ days with a discount hook", time: "2 days ago" },
  { id: "h7", title: "Summer sale banner text", preview: "Headline variants for the hero banner — bold, punchy, benefit-led across three tones", time: "3 days ago" },
  { id: "h8", title: "Onboarding email #1", preview: "First email in the welcome series focusing on product discovery and key features", time: "Last week" },
  { id: "h9", title: "Abandoned cart — footwear", preview: "Recovery email for the footwear category with size-specific urgency copy and CTA", time: "Last week" },
];

const PLAN_SAMPLE = `Create a new brand avatar: a distinguished South Asian male healthcare spokesperson in his 50s+ with a sharp, commanding personality, traditional-modern wardrobe blend, and authoritative yet approachable tone.

Use this avatar across email campaigns, social media content, and product shot backgrounds.

Steps:
1. Generate base avatar in 3 poses — standing neutral, seated professional, casual lean
2. Apply brand color palette and wardrobe guidelines
3. Export in square and portrait formats for all channels
4. Review against brand identity guidelines before publishing

Target: medical professionals aged 40–65, South Asian market.`;

function PlanCard({ content, onApprove, onSkip }: {
  content: string;
  onApprove: () => void;
  onSkip: () => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [decided, setDecided] = useState<"approved" | "skipped" | null>(null);

  function handleApprove() {
    setDecided("approved");
    onApprove();
  }
  function handleSkip() {
    setDecided("skipped");
    onSkip();
  }

  return (
    <>
      <div className="shrink-0 px-3 pb-2 pt-2">
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Plan</p>
          </div>
          <div className="relative px-4 pb-1" style={{ minHeight: "4.5rem" }}>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-4 whitespace-pre-wrap">
              {content.split("\n")[0]}
            </p>
            <div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, var(--content-bg))", backdropFilter: "blur(1px)", WebkitBackdropFilter: "blur(1px)", maskImage: "linear-gradient(to bottom, transparent, black)" }}
            />
          </div>
          <div className="px-4 pt-3 pb-3 flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
            >
              Skip
            </button>
            <div className="flex-1" />
            <button
              onClick={() => setReviewOpen(true)}
              className="h-8 px-4 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/8 transition-colors"
            >
              Review
            </button>
            <button
              onClick={handleApprove}
              className="h-8 px-4 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#0080FF" }}
            >
              Approve
            </button>
          </div>
        </div>
      </div>

      {reviewOpen && createPortal(
        <div className="fixed inset-0 z-9999 flex bg-white dark:bg-stone-950">
          {/* Scrollable content — centered with comfortable reading width */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="w-full max-w-xl mx-auto px-10 py-16">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-5">Plan</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          </div>

          {/* Right action panel */}
          <div className="shrink-0 w-52 flex flex-col">
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition hover:bg-stone-200 hover:text-stone-800 dark:bg-white/8 dark:text-stone-400 dark:hover:bg-white/14 dark:hover:text-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1" />
            {!decided && (
              <div className="flex flex-col gap-2.5 p-5">
                <button
                  onClick={() => { setReviewOpen(false); handleApprove(); }}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#0080FF" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => { setReviewOpen(false); handleSkip(); }}
                  className="w-full h-10 text-sm font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function RecipeRow({ recipe, onSelect }: { recipe: SlashRecipe; onSelect: (r: SlashRecipe) => void }) {
  return (
    <button
      onClick={() => onSelect(recipe)}
      className="flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: "rgb(239,246,255)", color: "rgb(37,99,235)" }}
      >
        {recipe.icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{recipe.label}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">{recipe.desc}</p>
      </div>
    </button>
  );
}

function getMentionIcon(key: string, size = 13): React.ReactNode {
  switch (key) {
    case "journeys": return <Route size={size} />;
    case "experiences": return <Shuffle size={size} />;
    case "avatars": return <UserCircle size={size} />;
    case "scenes": return <Clapperboard size={size} />;
    case "poses": return <PersonStanding size={size} />;
    case "design-system": return <PenTool size={size} />;
    case "catalog": return <Package size={size} />;
    case "events": return <Activity size={size} />;
    default: return null;
  }
}

type ReferenceAttachment = {
  category: string;
  title: string;
  subtitle: string;
  bg: string;
};

type RecipeChip = { key: string; label: string };

type ChatMessage = {
  id: string;
  role: "user" | "blu";
  text: string;
  attachments?: ReferenceAttachment[];
  mentions?: MentionChip[];
  recipes?: RecipeChip[];
  feedbackForm?: boolean;
  isTyping?: boolean;
  isError?: boolean;
  isPlan?: boolean;
  planContent?: string;
  journeyChip?: { name: string };
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
];

const REFERENCE_ITEMS = [
  { label: "Assets", icon: <Library size={14} /> },
  { label: "Attributes", icon: <Database size={14} /> },
  { label: "Users", icon: <Users size={14} /> },
  { label: "Events", icon: <Activity size={14} /> },
  { label: "Avatars", icon: <UserCircle size={14} /> },
  { label: "Scenes", icon: <Clapperboard size={14} /> },
  { label: "Poses", icon: <PersonStanding size={14} /> },
  { label: "Design System", icon: <PenTool size={14} /> },
  { label: "Catalog", icon: <Package size={14} /> },
  { label: "Feeds", icon: <Rss size={14} /> },
  { label: "Journeys", icon: <Route size={14} /> },
  { label: "Experiences", icon: <Shuffle size={14} /> },
  { label: "Out of the box", icon: <PackageOpen size={14} /> },
  { label: "Boards", icon: <LayoutDashboard size={14} /> },
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

const BLU_REPLIES = [
  "On it — generating that for you now.",
  "Got it! Putting that together.",
  "Sure thing. Working on it now.",
  "Let me craft that for you right away.",
  "Great — I'll have that ready in a moment.",
  "Understood. Creating that now.",
  "I can do that! Give me just a sec.",
  "All good — working on it.",
];

type Placeholder = { text: string; shortcut?: string };
const PLACEHOLDERS: Placeholder[] = [
  { text: "Ask Blu to create anything..." },
  { text: " for recipes and prompt templates", shortcut: "/" },
  { text: " to reference journeys, events, assets", shortcut: "@" },
  { text: " to attach files, feeds, or brand kit", shortcut: "+" },
  { text: "Generate a banner, email, or product shot..." },
];

const CONTEXT_RECIPE_KEYS: { match: RegExp; keys: string[] }[] = [
  { match: /\/journeys/,     keys: ["nurture", "welcome", "email", "subject"] },
  { match: /\/experiences/,  keys: ["banner", "email", "push", "landing"] },
  { match: /\/users/,        keys: ["email", "sms", "push", "subject"] },
  { match: /\/accounts/,     keys: ["email", "sms", "subject"] },
  { match: /\/catalog/,      keys: ["product", "banner", "social"] },
  { match: /\/subscription/, keys: ["email", "subject", "sms"] },
  { match: /\/home/,         keys: ["email", "banner", "subject"] },
  { match: /\/connections/,  keys: ["email", "push"] },
];

type SlashRecipe = { key: string; icon: React.ReactNode; label: string; desc: string };
const SLASH_RECIPES: SlashRecipe[] = [
  { key: "email",    icon: <Mail size={13} />,           label: "Email campaign",      desc: "Campaign or transactional email"     },
  { key: "sms",      icon: <MessageSquare size={13} />,  label: "SMS message",          desc: "Short message for mobile"            },
  { key: "push",     icon: <Bell size={13} />,           label: "Push notification",    desc: "App or browser push"                 },
  { key: "social",   icon: <Globe size={13} />,          label: "Social post",          desc: "Instagram, LinkedIn, X"              },
  { key: "banner",   icon: <Camera size={13} />,         label: "Banner creative",      desc: "Visual ad or hero banner"            },
  { key: "subject",  icon: <Type size={13} />,           label: "Subject lines",        desc: "Email subject line variants"         },
  { key: "product",  icon: <Package size={13} />,        label: "Product shot",         desc: "AI-generated product image"          },
  { key: "landing",  icon: <LayoutDashboard size={13} />,label: "Landing page",         desc: "Full landing page copy"              },
  { key: "nurture",  icon: <Route size={13} />,          label: "Nurture flow",         desc: "Multi-step email sequence"           },
  { key: "welcome",  icon: <Zap size={13} />,            label: "Welcome series",       desc: "Onboarding email sequence"           },
];

const REFERENCE_LIST_ITEMS: Record<string, string[]> = {
  Assets: ["Brand logo – Dark", "Brand logo – Light", "Hero banner – Summer", "Product shot – White BG", "Campaign header – Q3", "Email footer template", "Social post – Square", "Ad creative – 16:9"],
  Attributes: ["First Name", "Last Name", "Email", "Phone", "Company", "Plan", "Country", "Created At", "Last Seen", "Total Spend"],
  Users: ["Rana V.", "Alex Chen", "Sarah Kim", "Mike Johnson", "Emma Davis", "Tom Wilson", "Priya Patel", "James Lee"],
  Events: ["Page View", "Add to Cart", "Purchase Complete", "Email Open", "Button Click", "Form Submit", "Sign Up", "Login", "Search Query", "Checkout Started"],
  Avatars: ["Aria", "Max", "Sophia", "Jordan", "Riley", "Blake", "Morgan", "Casey"],
  Scenes: ["Paper sweep – White", "Vinyl sweep – Charcoal", "Warm gradient", "Blue seamless", "Walnut studio", "Concrete loft", "Desert wall", "Glass room"],
  Poses: ["Standing Neutral", "Pointing Right", "Waving", "Crossed Arms", "Casual Lean", "Seated Relaxed", "Walking Forward", "Hands on Hips"],
  "Design System": ["FieldsUSA Dark", "FieldsUSA Light", "Minimal Clean", "Bold & Modern"],
  Catalog: ["Main Product Feed", "Sale Items", "New Arrivals", "Featured Collection", "Clearance Rack", "Bundle Deals"],
  Feeds: ["Main Product Feed", "Sale Items Feed", "New Arrivals Feed", "Seasonal Feed", "Custom Feed #1", "Custom Feed #2"],
  Journeys: ["Onboarding Flow", "Abandoned Cart Recovery", "Post-Purchase Nurture", "Win-Back Campaign", "Product Education Series", "VIP Loyalty Path"],
  Experiences: ["Summer Sale Banner", "Exit Intent Popup", "Welcome Modal", "Loyalty Badge", "Free Shipping Bar", "New Arrivals Spotlight"],
  "Out of the box": ["Welcome Series", "Cart Recovery", "Post-Purchase", "Win-Back", "Browse Abandonment", "Order Confirmation", "Re-engagement"],
  Boards: ["Marketing Overview", "Campaign Tracker", "Content Calendar", "Sales Pipeline", "Team Tasks"],
};

const IMAGE_ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3", "3:4", "4:5"];
const IMAGE_BACKGROUND_OPTIONS = ["Auto", "White", "Transparent", "+ Custom background"];
const IMAGE_STYLE_OPTIONS = ["Auto", "Studio", "Lifestyle", "Editorial", "On White", "Dark & Moody", "Abstract", "Macro", "Bokeh"];

function referenceTitle(label: string) {
  return label === "Products & Feeds" ? "Products & feeds" : `${label}s`;
}

export type BluMode = "panel" | "float" | "fullscreen";

export default function BluChat({
  onClose,
  mode = "panel",
  onFloat,
  onFullscreen,
  onBackToPanel,
  onHeaderMouseDown,
}: {
  onClose: () => void;
  mode?: BluMode;
  onFloat?: () => void;
  onFullscreen?: () => void;
  onBackToPanel?: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
}) {
  const { pathname } = useLocation();
  const contextKeys = CONTEXT_RECIPE_KEYS.find(c => c.match.test(pathname))?.keys ?? [];
  const suggestedRecipes = contextKeys.map(k => SLASH_RECIPES.find(r => r.key === k)).filter(Boolean) as SlashRecipe[];
  const otherRecipes = SLASH_RECIPES.filter(r => !contextKeys.includes(r.key));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionTime, setSessionTime] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<{ content: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  const [planMode, setPlanMode] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [imageSettings, setImageSettings] = useState({
    aspect: "1:1",
    background: "Auto",
    style: "Auto",
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [referenceListSearch, setReferenceListSearch] = useState("");
  const [editorEmpty, setEditorEmpty] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionCategory, setMentionCategory] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionItemQuery, setMentionItemQuery] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const savedSlashRangeRef = useRef<Range | null>(null);
  const [plusPickerOpen, setPlusPickerOpen] = useState(false);
  const savedPlusRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);
  const [editingQueueText, setEditingQueueText] = useState("");
  const plusRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const mentionSearchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [msgTopFade, setMsgTopFade] = useState(false);
  const [msgBottomFade, setMsgBottomFade] = useState(true);
  const [journeyPreviewName, setJourneyPreviewName] = useState<string | null>(null);

  function checkMsgFades() {
    const el = messagesRef.current;
    if (!el) return;
    setMsgTopFade(el.scrollTop > 8);
    setMsgBottomFade(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 8);
  }

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
    function handle(e: MouseEvent) {
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setMentionOpen(false);
        setMentionCategory(null);
        setSlashOpen(false);
        setPlusPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (mentionCategory) {
      setTimeout(() => mentionSearchRef.current?.focus(), 30);
    }
  }, [mentionCategory]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function addAttachment(name: string) {
    if (!selectedReference) return;
    const next = { category: selectedReference, title: name, subtitle: "", bg: "" };
    setAttachments((current) => [...current.filter((item) => item.category !== selectedReference), next]);
    setPlusOpen(false);
    setReferencesOpen(false);
    setSelectedReference(null);
    setReferenceListSearch("");
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

  function getCategoryIconPaths(key: string): string {
    switch (key) {
      case "journeys": return '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>';
      case "experiences": return '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="m18 22 4-4-4-4"/><path d="M21.8 16H20c-1.3 0-2.5-.6-3.3-1.7l-.5-.7"/>';
      case "avatars": return '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>';
      case "scenes": return '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1-.3 2.1.3 2.4 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.8"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>';
      case "poses": return '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>';
      case "design-system": return '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>';
      case "catalog": return '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
      case "events": return '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
      default: return "";
    }
  }

  function createMentionChipEl(categoryKey: string, label: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.contentEditable = "false";
    span.className = "mention-chip";
    span.dataset.mention = "true";
    span.dataset.categoryKey = categoryKey;
    span.dataset.label = label;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "11"); svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = getCategoryIconPaths(categoryKey);
    const lbl = document.createElement("span");
    lbl.textContent = label;
    span.appendChild(svg);
    span.appendChild(lbl);
    return span;
  }

  function updateEditorEmpty() {
    const editor = editorRef.current;
    if (!editor) return;
    const text = (editor.textContent ?? "").replace(/ /g, " ").trim();
    const hasChip = editor.querySelectorAll("[data-mention], [data-reference]").length > 0;
    setEditorEmpty(!text && !hasChip);
  }

  function handleEditorInput() {
    const sel = window.getSelection();
    updateEditorEmpty();
    if (!sel?.rangeCount) { setMentionOpen(false); setSlashOpen(false); return; }
    const range = sel.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) { setMentionOpen(false); setMentionCategory(null); setSlashOpen(false); return; }
    const textBefore = (container.textContent ?? "").slice(0, range.startOffset);

    // @ mention
    const mentionMatch = textBefore.match(/@([^\s@]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1];
      const atPos = range.startOffset - query.length - 1;
      const saved = document.createRange();
      saved.setStart(container, atPos);
      saved.setEnd(container, range.startOffset);
      savedRangeRef.current = saved;
      setMentionOpen(true);
      setMentionQuery(query.toLowerCase());
      if (!query) setMentionCategory(null);
      setSlashOpen(false);
      return;
    }

    // / recipe
    const slashMatch = textBefore.match(/(^|\s)\/([^\s/]*)$/);
    if (slashMatch) {
      const query = slashMatch[2];
      const slashPos = range.startOffset - query.length - 1;
      const saved = document.createRange();
      saved.setStart(container, slashPos);
      saved.setEnd(container, range.startOffset);
      savedSlashRangeRef.current = saved;
      setSlashOpen(true);
      setSlashQuery(query.toLowerCase());
      setMentionOpen(false);
      setMentionCategory(null);
      setPlusPickerOpen(false);
      return;
    }

    // + attach
    const plusMatch = textBefore.match(/(^|\s)\+$/);
    if (plusMatch) {
      const plusPos = range.startOffset - 1;
      const saved = document.createRange();
      saved.setStart(container, plusPos);
      saved.setEnd(container, range.startOffset);
      savedPlusRangeRef.current = saved;
      setPlusPickerOpen(true);
      setMentionOpen(false);
      setMentionCategory(null);
      setSlashOpen(false);
      return;
    }

    setMentionOpen(false);
    setMentionCategory(null);
    setSlashOpen(false);
    setPlusPickerOpen(false);
  }

  function selectCategory(key: string) {
    setMentionCategory(key);
    setMentionItemQuery("");
  }

  function selectMentionItem(item: string) {
    if (!mentionCategory || !savedRangeRef.current) return;
    const range = savedRangeRef.current;
    range.deleteContents();
    const chip = createMentionChipEl(mentionCategory, item);
    range.insertNode(chip);
    // place cursor just after chip
    const sel = window.getSelection();
    const after = document.createRange();
    after.setStartAfter(chip);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    savedRangeRef.current = null;
    setMentionOpen(false);
    setMentionCategory(null);
    setMentionQuery("");
    editorRef.current?.focus();
    updateEditorEmpty();
  }

  function openFilePicker() {
    if (savedPlusRangeRef.current) {
      savedPlusRangeRef.current.deleteContents();
      savedPlusRangeRef.current = null;
    }
    setPlusPickerOpen(false);
    editorRef.current?.focus();
    updateEditorEmpty();
    fileInputRef.current?.click();
  }

  function selectRecipe(recipe: SlashRecipe) {
    if (!savedSlashRangeRef.current) return;
    const range = savedSlashRangeRef.current;
    range.deleteContents();
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.recipe = "true";
    chip.dataset.recipeKey = recipe.key;
    chip.dataset.label = recipe.label;
    chip.style.cssText = "display:inline-flex;align-items:center;gap:3px;background:rgb(239,246,255);color:rgb(37,99,235);border-radius:4px;padding:1px 7px 1px 5px;font-size:12px;font-weight:600;white-space:nowrap;cursor:default;user-select:none;";
    chip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>${recipe.label}`;
    range.insertNode(chip);
    const sel = window.getSelection();
    const after = document.createRange();
    after.setStartAfter(chip);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    savedSlashRangeRef.current = null;
    setSlashOpen(false);
    setSlashQuery("");
    editorRef.current?.focus();
    updateEditorEmpty();
  }

  function getEditorText(): string {
    const editor = editorRef.current;
    if (!editor) return "";
    let text = "";
    function walk(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.mention) {
        text += `@${node.dataset.label}`;
      } else if (node instanceof HTMLElement && node.dataset.recipe) {
        // skip — recipes render as chips, not inline text
      } else {
        node.childNodes.forEach(walk);
      }
    }
    walk(editor);
    return text.trim();
  }

  function getEditorRecipes(): RecipeChip[] {
    const editor = editorRef.current;
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-recipe]")).map((el) => {
      const e = el as HTMLElement;
      return { key: e.dataset.recipeKey ?? "", label: e.dataset.label ?? "" };
    });
  }

  function getEditorMentions(): MentionChip[] {
    const editor = editorRef.current;
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-mention]")).map((el, i) => {
      const e = el as HTMLElement;
      return { id: `msg-m-${i}`, categoryKey: e.dataset.categoryKey ?? "", label: e.dataset.label ?? "" };
    });
  }

  function clearEditor() {
    if (editorRef.current) editorRef.current.innerHTML = "";
    setEditorEmpty(true);
  }

  function getReferenceIconPaths(label: string): string {
    switch (label) {
      case "Assets": return '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>';
      case "Attributes": return '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>';
      case "Users": return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
      case "Events": return '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
      case "Avatars": return '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>';
      case "Scenes": return '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1-.3 2.1.3 2.4 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.8"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>';
      case "Poses": return '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>';
      case "Design System": return '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>';
      case "Catalog": return '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
      case "Feeds": return '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>';
      case "Journeys": return '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>';
      case "Experiences": return '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="m18 22 4-4-4-4"/>';
      case "Out of the box": return '<path d="M12 22v-9"/><path d="M3.17 8 12 13l8.83-5"/><path d="M3 13.5v5.37a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V13.5"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v1l9 5 9-5Z"/>';
      case "Boards": return '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>';
      default: return "";
    }
  }

  function createReferenceChipEl(category: string, name: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.contentEditable = "false";
    span.className = "reference-chip";
    span.dataset.reference = "true";
    span.dataset.category = category;
    span.dataset.refName = name;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "12"); svg.setAttribute("height", "12");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = getReferenceIconPaths(category);
    const lbl = document.createElement("span");
    lbl.textContent = name;
    span.appendChild(svg);
    span.appendChild(lbl);
    return span;
  }

  function insertReferenceChip(category: string, name: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const chip = createReferenceChipEl(category, name);
    const space = document.createTextNode(" ");
    editor.appendChild(chip);
    editor.appendChild(space);
    editor.focus();
    const range = document.createRange();
    range.setStartAfter(space);
    range.collapse(true);
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    updateEditorEmpty();
  }

  function removeQueueItem(id: string) {
    setQueue((q) => q.filter((item) => item.id !== id));
    if (editingQueueId === id) setEditingQueueId(null);
  }

  function saveQueueEdit(id: string) {
    const trimmed = editingQueueText.trim();
    if (trimmed) setQueue((q) => q.map((item) => item.id === id ? { ...item, text: trimmed } : item));
    setEditingQueueId(null);
  }

  function sendMessage(overrideText?: string) {
    const text = overrideText ?? getEditorText();
    const currentMentions = overrideText ? [] : getEditorMentions();
    const currentRecipes = overrideText ? [] : getEditorRecipes();
    if (!text && attachments.length === 0 && currentMentions.length === 0 && currentRecipes.length === 0) return;

    // Queue intercept — "q1", "q2", etc.
    if (!overrideText && /^q\d+$/i.test(text.trim()) && queue.length < 4) {
      setQueue((q) => [...q, { id: `q-${Date.now()}`, text: text.trim() }]);
      clearEditor();
      return;
    }

    if (!sessionTime) {
      const now = new Date();
      setSessionTime(now.toLocaleDateString("en-US", { weekday: "long" }) + " " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }
    const isFeedback = !overrideText && text.toLowerCase() === "feedback";
    const isFailed = !overrideText && text.toLowerCase() === "failed";
    const isError = !overrideText && text.toLowerCase() === "error";
    const isPlan = !overrideText && text.toLowerCase() === "plan";
    const isCreateJourney = /create (a )?journey/i.test(text);
    const journeyName = isCreateJourney ? "Demo" : null;

    setMessages((current) => {
      const ts = Date.now();
      const userMsg: ChatMessage = { id: `user-${ts}`, role: "user", text, attachments, mentions: currentMentions, recipes: currentRecipes.length ? currentRecipes : undefined };
      const next: ChatMessage[] = [...current, userMsg];
      if (isPlan) {
        next.push({
          id: `blu-plan-${ts}`,
          role: "blu",
          text: "Here's a plan based on your request.",
          isPlan: true,
          planContent: PLAN_SAMPLE,
        });
        setTimeout(() => setPendingPlan({ content: PLAN_SAMPLE }), 50);
      } else if (isFailed || isError) {
        next.push({
          id: `blu-error-${ts}`,
          role: "blu",
          text: isFailed
            ? "Something went wrong while processing your request."
            : "Blu didn't respond properly. This might be a temporary issue — try again or report it if it keeps happening.",
          isError: true,
        });
      } else if (isFeedback) {
        next.push({
          id: `blu-feedback-${ts}`,
          role: "blu",
          text: "I'd love to help capture that! Answer a few quick questions so your feedback reaches the right people.",
          feedbackForm: true,
        });
      } else if (isCreateJourney) {
        next.push({ id: `blu-typing-${ts}`, role: "blu", text: "", isTyping: true });
      } else {
        next.push({
          id: `blu-${ts}`,
          role: "blu",
          text: BLU_REPLIES[(current.length) % BLU_REPLIES.length],
        });
      }
      return next;
    });

    if (isCreateJourney && journeyName) {
      setTimeout(() => {
        setMessages((current) => {
          const typingIdx = current.findIndex((m) => m.isTyping);
          if (typingIdx === -1) return current;
          const ts = Date.now();
          const next = [...current];
          next[typingIdx] = {
            id: `blu-journey-${ts}`,
            role: "blu",
            text: `Created journey "${journeyName}". It starts with a signup trigger, sends a welcome email, waits 2 days, then branches based on whether the email was opened.`,
            journeyChip: { name: journeyName },
          };
          return next;
        });
      }, 3000);
    }

    if (!overrideText) {
      clearEditor();
      setAttachments([]);
      setMentionOpen(false);
      setMentionCategory(null);
      setPlusOpen(false);
      setReferencesOpen(false);
      setSelectedReference(null);
    }

    if (!isFeedback) {
      window.dispatchEvent(new CustomEvent("blu-image-generate", { detail: { text } }));
    }
  }

  useEffect(() => {
    function handleSuggestedPrompt(event: Event) {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt?.trim();
      if (prompt) sendMessage(prompt);
    }

    window.addEventListener("blu-suggested-prompt", handleSuggestedPrompt);
    return () => window.removeEventListener("blu-suggested-prompt", handleSuggestedPrompt);
  });

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
        className={`flex items-center gap-2.5 px-4 py-2.75 shrink-0 ${onHeaderMouseDown ? "cursor-move select-none" : ""}`}
        onMouseDown={onHeaderMouseDown}
      >
        <img src="/mascot.png" alt="Blu" width={28} height={28} className="rounded-full shrink-0 object-contain pointer-events-none" />
        <div className="flex-1 min-w-0 pointer-events-none">
          <p className="text-base font-semibold text-stone-800 dark:text-stone-100 leading-none">Blu</p>
        </div>

        {/* Mode action buttons — stop propagation so they don't trigger drag */}
        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          {mode === "panel" && (
            <>
              {onFloat && (
                <button
                  onClick={onFloat}
                  title="Float window"
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <AppWindow size={13} />
                </button>
              )}
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  title="Fullscreen"
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <Maximize2 size={13} />
                </button>
              )}
            </>
          )}
          {mode === "float" && (
            <>
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  title="Fullscreen"
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <Maximize2 size={13} />
                </button>
              )}
              {onBackToPanel && (
                <button
                  onClick={onBackToPanel}
                  title="Back to panel"
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <AppWindow size={13} />
                </button>
              )}
            </>
          )}
          {mode === "fullscreen" && onBackToPanel && (
            <button
              onClick={onBackToPanel}
              title="Exit fullscreen"
              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
            >
              <Minimize2 size={13} />
            </button>
          )}

          <button
            onClick={() => { setHistoryOpen((o) => !o); setHistorySearch(""); }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              historyOpen
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                : "hover:bg-stone-100 dark:hover:bg-white/8 text-stone-400"
            }`}
          >
            <History size={13} />
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* History panel */}
      {historyOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs font-medium text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll pb-3">
            {/* Pinned */}
            {PINNED_HISTORY.filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase())).length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-4 pb-1 pt-3">
                  <Pin size={11} className="text-stone-400 dark:text-stone-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Pinned</p>
                </div>
                {PINNED_HISTORY
                  .filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setHistoryOpen(false)}
                      className="group w-full text-left px-4 py-2.5 transition-colors hover:bg-stone-50 dark:hover:bg-white/4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{item.title}</p>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500 pt-px">{item.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-400 dark:text-stone-500">{item.preview}</p>
                    </button>
                  ))}
              </>
            )}

            {/* Recent */}
            {RECENT_HISTORY.filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase())).length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-4 pb-1 pt-4">
                  <History size={11} className="text-stone-400 dark:text-stone-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Recent</p>
                </div>
                {RECENT_HISTORY
                  .filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setHistoryOpen(false)}
                      className="group w-full text-left px-4 py-2.5 transition-colors hover:bg-stone-50 dark:hover:bg-white/4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-stone-700 dark:text-stone-200">{item.title}</p>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500 pt-px">{item.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-400 dark:text-stone-500">{item.preview}</p>
                    </button>
                  ))}
              </>
            )}

            {/* Empty state */}
            {!PINNED_HISTORY.concat(RECENT_HISTORY).some((h) => h.title.toLowerCase().includes(historySearch.toLowerCase())) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History size={24} className="mb-3 text-stone-300 dark:text-stone-600" />
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No results for "{historySearch}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {!historyOpen && <div className="relative flex-1 min-h-0" style={{ filter: pendingPlan ? "blur(2px)" : "none", transition: "filter 0.2s", pointerEvents: pendingPlan ? "none" : undefined }}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 transition-opacity duration-300"
          style={{ opacity: msgTopFade ? 1 : 0, background: "linear-gradient(to bottom, var(--content-bg) 0%, transparent 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 transition-opacity duration-300"
          style={{ opacity: msgBottomFade ? 1 : 0, background: "linear-gradient(to top, var(--content-bg) 0%, transparent 100%)" }}
        />
        <div ref={messagesRef} onScroll={checkMsgFades} className="h-full overflow-y-auto px-4 py-4 space-y-5 chat-scroll">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-1 pb-8 select-none text-center">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Ask Blu anything</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">What are you working on today?</p>
          </div>
        )}
        {sessionTime && (
          <div className="flex items-center justify-center">
            <span className="text-xs text-stone-400 dark:text-stone-500">{sessionTime}</span>
          </div>
        )}
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
              </div>
              {msg.isTyping ? (
                <TypingDots />
              ) : msg.isError ? (
                <div
                  className="inline-flex flex-col gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{msg.text}</p>
                  </div>
                  <button
                    onClick={() => window.open("mailto:support@intempt.com?subject=Bug+Report", "_blank")}
                    className="self-start inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                    style={{ background: "rgba(239,68,68,0.1)", color: "rgb(220,38,38)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/>
                      <path d="M18.5 2.5a2.5 2.5 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Report bug
                  </button>
                </div>
              ) : (
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>
              )}
              {msg.journeyChip && (
                <div className="mt-2.5">
                  <button
                    onClick={() => setJourneyPreviewName(msg.journeyChip!.name)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                    style={{
                      background: "rgb(245,243,255)",
                      color: "rgb(109,40,217)",
                      border: "1px solid rgb(221,214,254)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="19" r="3"/>
                      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                      <circle cx="18" cy="5" r="3"/>
                    </svg>
                    {msg.journeyChip.name}
                    <span className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px]" style={{ background: "rgb(237,233,254)" }}>
                      <Eye size={9} />
                      Preview
                    </span>
                  </button>
                </div>
              )}
              {msg.feedbackForm && (
                <FeedbackQuestionnaire onSubmit={(text) => sendMessage(text)} />
              )}
              {msg.mentions?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.mentions.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/12"
                    >
                      <span className="shrink-0">{getMentionIcon(m.categoryKey, 11)}</span>
                      {m.label}
                    </span>
                  ))}
                </div>
              ) : null}
              {msg.recipes?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.recipes.map((r) => (
                    <span
                      key={r.key}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/12"
                    >
                      <ChefHat size={11} strokeWidth={2.5} className="shrink-0" />
                      {r.label}
                    </span>
                  ))}
                </div>
              ) : null}
              {msg.attachments?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.attachments.map((item) => (
                    <span
                      key={`${msg.id}-${item.category}`}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 dark:border-(--border) dark:bg-white/4 dark:text-stone-300"
                    >
                      <span className="truncate">{item.category}: {item.title}</span>
                    </span>
                  ))}
                </div>
              ) : null}
              {msg.role === "blu" && !msg.feedbackForm && !msg.isTyping && !msg.isError && !msg.isPlan && (
                <div className="mt-2 flex items-center gap-0.5">
                  {/* Copy */}
                  <div className="group/tip relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        setCopiedId(msg.id);
                        setTimeout(() => setCopiedId((id) => id === msg.id ? null : id), 1500);
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        copiedId === msg.id
                          ? "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"
                          : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      }`}
                    >
                      {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                      {copiedId === msg.id ? "Copied!" : "Copy"}
                    </span>
                  </div>
                  {/* Upvote */}
                  <div className="group/tip relative">
                    <button
                      onClick={() => setReactions((r) => ({ ...r, [msg.id]: r[msg.id] === "up" ? undefined as never : "up" }))}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        reactions[msg.id] === "up"
                          ? "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"
                          : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      }`}
                    >
                      <ThumbsUp size={13} fill={reactions[msg.id] === "up" ? "currentColor" : "none"} />
                    </button>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                      Upvote
                    </span>
                  </div>
                  {/* Downvote */}
                  <div className="group/tip relative">
                    <button
                      onClick={() => setReactions((r) => ({ ...r, [msg.id]: r[msg.id] === "down" ? undefined as never : "down" }))}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        reactions[msg.id] === "down"
                          ? "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"
                          : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      }`}
                    >
                      <ThumbsDown size={13} fill={reactions[msg.id] === "down" ? "currentColor" : "none"} />
                    </button>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                      Downvote
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>}

      {/* Pending plan card */}
      {!historyOpen && pendingPlan && (
        <PlanCard
          content={pendingPlan.content}
          onApprove={() => {
            setPendingPlan(null);
            const ts = Date.now();
            setMessages(c => [...c, { id: `blu-plan-approved-${ts}`, role: "blu", text: "Plan approved. Starting execution now." }]);
          }}
          onSkip={() => {
            setPendingPlan(null);
            const ts = Date.now();
            setMessages(c => [...c, { id: `blu-plan-skipped-${ts}`, role: "blu", text: "Got it, plan skipped. Let me know how you'd like to proceed." }]);
          }}
        />
      )}

      {/* Input */}
      {!historyOpen && <div ref={mentionRef} className="relative px-3 pb-3 shrink-0" style={{ opacity: pendingPlan ? 0.4 : 1, pointerEvents: pendingPlan ? "none" : undefined }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach((file) => {
              setAttachments((prev) => [
                ...prev.filter((a) => a.category !== "File"),
                { category: "File", title: file.name, subtitle: "", bg: "" },
              ]);
            });
            e.target.value = "";
          }}
        />

        {/* + attach picker — floats above input */}
        {plusPickerOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <button
              onClick={openFilePicker}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">
                <Paperclip size={14} />
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Attach files</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">Upload from your device · Press Enter to open</p>
              </div>
            </button>
          </div>
        )}

        {/* Slash / recipe picker — floats above input */}
        {slashOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ background: "rgb(239,246,255)", color: "rgb(37,99,235)" }}
              >
                <ChefHat size={11} strokeWidth={2.5} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Recipes</p>
            </div>
            <div className="pb-2 max-h-64 overflow-y-auto">
              {(() => {
                const filtered = slashQuery
                  ? SLASH_RECIPES.filter(r => r.label.toLowerCase().includes(slashQuery))
                  : null;

                if (filtered) {
                  return filtered.length === 0
                    ? <p className="px-4 py-3 text-sm text-stone-400 dark:text-stone-500">No recipes match "{slashQuery}"</p>
                    : filtered.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />);
                }

                if (suggestedRecipes.length === 0) {
                  return SLASH_RECIPES.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />);
                }

                return (
                  <>
                    <p className="px-3.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Suggested for this page</p>
                    {suggestedRecipes.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />)}
                    {otherRecipes.length > 0 && (
                      <>
                        <div className="mx-3.5 my-1.5 border-t border-stone-100 dark:border-(--border)" />
                        <p className="px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">All recipes</p>
                        {otherRecipes.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />)}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Mention picker — floats above input */}
        {mentionOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            {mentionCategory ? (
              /* Level 2 — items */
              <>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <button
                    onClick={() => { setMentionCategory(null); setMentionItemQuery(""); }}
                    className="flex items-center gap-1 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                  >
                    <ChevronLeft size={13} />
                    Back
                  </button>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
                    <span className="text-stone-500 dark:text-stone-400">{getMentionIcon(mentionCategory, 12)}</span>
                    {MENTION_CATEGORIES.find((c) => c.key === mentionCategory)?.label}
                  </span>
                </div>
                <div className="px-3 pt-2.5 pb-2">
                  <div className="relative">
                    <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      ref={mentionSearchRef}
                      value={mentionItemQuery}
                      onChange={(e) => setMentionItemQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && setMentionOpen(false)}
                      placeholder="Search..."
                      className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs font-medium text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto pb-2">
                  {(MENTION_ITEMS[mentionCategory] ?? [])
                    .filter((item) => !mentionItemQuery || item.toLowerCase().includes(mentionItemQuery.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item}
                        onClick={() => selectMentionItem(item)}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-stone-400 dark:text-stone-500">
                          {getMentionIcon(mentionCategory, 13)}
                        </span>
                        {item}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              /* Level 1 — categories */
              <>
                <div className="pb-2 pt-2">
                  {MENTION_CATEGORIES.filter((c) =>
                    !mentionQuery || c.label.toLowerCase().includes(mentionQuery)
                  ).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">
                        {getMentionIcon(cat.key, 13)}
                      </span>
                      {cat.label}
                      <ChevronRight size={12} className="ml-auto text-stone-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((item) => (
              <span
                key={item.category}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 py-1 pl-2 pr-1.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
              >
                <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: getReferenceIconPaths(item.category) }} />
                </span>
                {item.title}
                <button
                  onClick={() => removeAttachment(item.category)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div
          className="rounded-xl px-4 pt-4 pb-3"
          style={{ border: "1px solid var(--border)" }}
        >
          {queue.length > 0 && (
            <div className="mb-2">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2.5 border-b border-stone-100 py-2 dark:border-white/6"
                >
                  <CornerLeftUp size={13} className="shrink-0 text-stone-400 dark:text-stone-500" />
                  {editingQueueId === item.id ? (
                    <input
                      autoFocus
                      value={editingQueueText}
                      onChange={(e) => setEditingQueueText(e.target.value)}
                      onBlur={() => saveQueueEdit(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveQueueEdit(item.id);
                        if (e.key === "Escape") setEditingQueueId(null);
                      }}
                      className="min-w-0 flex-1 bg-transparent text-sm text-stone-700 outline-none dark:text-stone-200"
                    />
                  ) : (
                    <span
                      className="min-w-0 flex-1 truncate text-sm text-stone-600 dark:text-stone-300"
                      onDoubleClick={() => { setEditingQueueId(item.id); setEditingQueueText(item.text); }}
                    >
                      {item.text}
                    </span>
                  )}
                  <button
                    onClick={() => removeQueueItem(item.id)}
                    className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-red-500 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            {editorEmpty && (() => {
              const ph = PLACEHOLDERS[placeholderIdx];
              return (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-0 left-0 select-none text-sm text-stone-400 dark:text-stone-500 transition-opacity duration-300 flex items-center gap-1 ${placeholderVisible ? "opacity-100" : "opacity-0"}`}
                >
                  {ph.shortcut && (
                    <kbd
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 18,
                        height: 18,
                        borderRadius: 4,
                        padding: "0 5px",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        background: "var(--muted)",
                        color: "var(--icon)",
                        border: "1px solid var(--border)",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {ph.shortcut}
                    </kbd>
                  )}
                  {ph.text}
                </span>
              );
            })()}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setMentionOpen(false); setMentionCategory(null); setSlashOpen(false); setPlusPickerOpen(false); return; }
                if (e.key === "Enter" && plusPickerOpen) { e.preventDefault(); openFilePicker(); return; }
                if (e.key === "Enter" && mentionOpen && !mentionCategory) {
                  const filtered = MENTION_CATEGORIES.filter((c) => !mentionQuery || c.label.toLowerCase().includes(mentionQuery));
                  if (filtered.length === 1) { e.preventDefault(); selectCategory(filtered[0].key); return; }
                }
                if (e.key === "Enter" && !e.shiftKey && !mentionOpen) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="w-full min-h-5 max-h-32 overflow-y-auto bg-transparent text-sm text-stone-700 dark:text-stone-200 outline-none leading-relaxed"
            />
          </div>
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
                      className="absolute bottom-[calc(100%+8px)] left-0 w-84 max-h-115 rounded-xl overflow-hidden animate-card-in transition-all duration-200"
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
                                          : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:text-stone-400 dark:hover:bg-white/6"
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
                        <div className="flex flex-col px-3.5 pb-3">
                          <div className="relative mb-2">
                            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                            <input
                              type="search"
                              value={referenceListSearch}
                              onChange={(e) => setReferenceListSearch(e.target.value)}
                              placeholder={`Search ${selectedReference.toLowerCase()}...`}
                              className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {(REFERENCE_LIST_ITEMS[selectedReference] ?? [])
                              .filter((name) => name.toLowerCase().includes(referenceListSearch.toLowerCase()))
                              .map((name) => (
                                <button
                                  key={name}
                                  onClick={() => addAttachment(name)}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/6"
                                >
                                  {name}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : referencesOpen ? (
                    <div
                      className="absolute bottom-[calc(100%+8px)] left-0 w-64 rounded-xl overflow-hidden animate-card-in transition-all duration-200 flex flex-col"
                      style={{
                        maxHeight: 216,
                        background: "var(--content-bg)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="flex-1 overflow-y-auto py-1">
                        {REFERENCE_ITEMS.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => { setSelectedReference(item.label); setReferenceListSearch(""); }}
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
                className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                  planMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                }`}
              >
                Plan
              </button>
              <button
                type="button"
                onClick={() => setWebMode((mode) => !mode)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  webMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                }`}
              >
                <Globe size={12} />
                Web
              </button>
              <button
                onClick={() => sendMessage()}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
                style={{ background: !editorEmpty || attachments.length ? "#0080FF" : "var(--border)" }}
              >
                <ArrowUp size={13} className={!editorEmpty || attachments.length ? "text-white" : "text-stone-400 dark:text-stone-500"} />
              </button>
            </div>
          </div>
        </div>
      </div>}

      {/* Journey preview overlay */}
      {journeyPreviewName && (
        <JourneyPreviewOverlay
          name={journeyPreviewName}
          onClose={() => setJourneyPreviewName(null)}
        />
      )}
    </div>
  );
}
