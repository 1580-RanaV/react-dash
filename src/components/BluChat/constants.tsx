import {
  AtSign,
  Paperclip,
  Library,
  Database,
  Users,
  Activity,
  UserCircle,
  Clapperboard,
  PersonStanding,
  PenTool,
  Package,
  Rss,
  Route,
  Shuffle,
  PackageOpen,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Bell,
  Globe,
  Camera,
  Type,
  Zap,
} from "lucide-react";
import type { HistoryItem, RunTask, ChatMessage, SlashRecipe, Placeholder } from "./types";

export const MENTION_CATEGORIES = [
  { key: "journeys", label: "Journeys" },
  { key: "experiences", label: "Experiences" },
  { key: "avatars", label: "Avatars" },
  { key: "scenes", label: "Scenes" },
  { key: "poses", label: "Poses" },
  { key: "design-system", label: "Design System" },
  { key: "catalog", label: "Catalog Feed" },
  { key: "events", label: "Events" },
];

export const MENTION_ITEMS: Record<string, string[]> = {
  journeys: ["Onboarding Flow", "Abandoned Cart Recovery", "Post-Purchase Nurture", "Win-Back Campaign", "Product Education Series", "VIP Loyalty Path"],
  experiences: ["Summer Sale Banner", "Exit Intent Popup", "Welcome Modal", "Loyalty Badge", "Free Shipping Bar", "New Arrivals Spotlight"],
  avatars: ["Aria", "Max", "Sophia", "Jordan", "Riley", "Blake"],
  scenes: ["Paper sweep - White", "Vinyl sweep - Charcoal", "Warm gradient", "Blue seamless", "Walnut studio", "Concrete loft"],
  poses: ["Standing Neutral", "Pointing Right", "Waving", "Crossed Arms", "Casual Lean", "Seated Relaxed"],
  "design-system": ["FieldsUSA Dark", "FieldsUSA Light", "Minimal Clean", "Bold & Modern"],
  catalog: ["Main Product Feed", "Sale Items", "New Arrivals", "Featured Collection", "Clearance Rack"],
  events: ["Page View", "Add to Cart", "Purchase Complete", "Email Open", "Button Click", "Search Query"],
};

export const ARCHIVED_HISTORY: HistoryItem[] = [
  { id: "h1", title: "FieldsUSA Summer Campaign", preview: "Abandoned cart email — dark header, Anton headline, three cart rows with feed tags, red CTA", time: "2 days ago" },
  { id: "h2", title: "Q3 Email Templates", preview: "Four-part series: welcome, nurture, win-back, and re-engage — all using your brand kit", time: "Last week" },
];

export const PLAN_SAMPLE = `Create a new brand avatar: a distinguished South Asian male healthcare spokesperson in his 50s+ with a sharp, commanding personality, traditional-modern wardrobe blend, and authoritative yet approachable tone.

Use this avatar across email campaigns, social media content, and product shot backgrounds.

Steps:
1. Generate base avatar in 3 poses — standing neutral, seated professional, casual lean
2. Apply brand color palette and wardrobe guidelines
3. Export in square and portrait formats for all channels
4. Review against brand identity guidelines before publishing

Target: medical professionals aged 40–65, South Asian market.`;

export const RUN_TASKS: RunTask[] = [
  { id: "create-avatar", label: "Create Avatar", detail: "Creating avatar", icon: "avatar" },
  { id: "create-pose", label: "Create Pose", detail: "Creating pose", icon: "pose" },
  { id: "create-scene", label: "Create Scene", detail: "Creating scene", icon: "scene" },
];

export const SAMPLE: ChatMessage[] = [
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

export const PLUS_ITEMS = [
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

export const REFERENCE_ITEMS = [
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

export const REFERENCE_TILES = [
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

export const BLU_REPLIES = [
  "On it — generating that for you now.",
  "Got it! Putting that together.",
  "Sure thing. Working on it now.",
  "Let me craft that for you right away.",
  "Great — I'll have that ready in a moment.",
  "Understood. Creating that now.",
  "I can do that! Give me just a sec.",
  "All good — working on it.",
];

export const GENERAL_FOLLOW_UPS = [
  "Make it more concise",
  "Try a bolder headline",
  "Show me another variation",
];

export const CUSTOM_REPORT_FOLLOW_UPS = [
  "Which day had the strongest cart-to-view ratio",
  "How does this compare to the previous 30 days",
  "Break this down by traffic source",
];

export const PLACEHOLDERS: Placeholder[] = [
  { text: "Ask Blu to create anything..." },
  { text: "Type / for recipes and prompt templates" },
  { text: "Type @ to reference journeys, events, assets" },
  { text: "Type + to attach files, feeds, or brand kit" },
  { text: "Generate a banner, email, or product shot..." },
];

export const LANDING_PROMPTS = [
  "What do you want to create today?",
  "Ready when you are.",
  "What are we building today?",
  "What's on your mind?",
  "Let's create something great.",
];

export const CONTEXT_RECIPE_KEYS: { match: RegExp; keys: string[] }[] = [
  { match: /\/journeys/,     keys: ["nurture", "welcome", "email", "subject"] },
  { match: /\/experiences/,  keys: ["banner", "email", "push", "landing"] },
  { match: /\/users/,        keys: ["email", "sms", "push", "subject"] },
  { match: /\/accounts/,     keys: ["email", "sms", "subject"] },
  { match: /\/catalog/,      keys: ["product", "banner", "social"] },
  { match: /\/subscription/, keys: ["email", "subject", "sms"] },
  { match: /\/home/,         keys: ["email", "banner", "subject"] },
  { match: /\/connections/,  keys: ["email", "push"] },
];

export const SLASH_RECIPES: SlashRecipe[] = [
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

export const REFERENCE_LIST_ITEMS: Record<string, string[]> = {
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

export const IMAGE_ASPECT_OPTIONS = ["1:1", "16:9", "9:16", "4:3", "3:4", "4:5"];
export const IMAGE_BACKGROUND_OPTIONS = ["Auto", "White", "Transparent", "+ Custom background"];
export const IMAGE_STYLE_OPTIONS = ["Auto", "Studio", "Lifestyle", "Editorial", "On White", "Dark & Moody", "Abstract", "Macro", "Bokeh"];
