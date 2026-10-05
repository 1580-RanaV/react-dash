import { useState, useRef, useEffect, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, ArrowUpDown, SlidersHorizontal, ChevronDown,
  Mail, MessageSquare, Bell, Globe, Camera, Type, Package,
  LayoutDashboard, Route, Zap, Users2, FlaskConical, Tag, BarChart3,
  Check, Copy, FileText, FileCode, Pencil, Shuffle, Play, Loader2,
  Lock, Plug, History, Trash2, AlertTriangle, Clock, Workflow, ShieldCheck,
} from "lucide-react";
import CreateRecipeDrawer from "./CreateRecipeDrawer";
import BackButton from "./BackButton";
import SubTabCorner from "./SubTabCorner";
import SlidingSidebar from "./SlidingSidebar";
import { useRecipeRuntime, IntegrationLogo, withSeedOverrides } from "./recipeRuntimeStore";
import ValidateConfirmModal, { type ValidateModalStage } from "./ValidateConfirmModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type RecipeSpec = {
  complexity: string;
  execution: string;
  agent: string;
  products: string[];
  mode: string;
  areas: string[];
};

export type Recipe = {
  id: string;
  icon: React.ReactNode;
  category?: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  steps: number;
  uses: number;
  why: string;
  spec: RecipeSpec;
  stepDetails: string[];
  draft?: boolean;
  // BC-RCP-010–017: recipe needs a connected integration before it can run.
  requiresIntegration?: string;
  // BC-RCP-021: recipe is locked by permission, not by a missing connection —
  // no self-serve unlock, just an explanation.
  requiresPermission?: string;
  // Real step nodes from a Publish in the canvas — when set, the Remix tab
  // reopens the canvas with these instead of the generic MOCK_STEPS every
  // seeded recipe otherwise falls back to.
  draftSteps?: { title: string; subtitle: string }[];
  // Whether this draft's pipeline passed validation ("Ready to use" was on)
  // at the moment it was published — a draft can't be Run until it has.
  // Irrelevant for seeded recipes, which are treated as already validated.
  validated?: boolean;
  // Set once a user-created recipe's "Make it global" button has been
  // clicked — mocks submitting it for review before it'd be shared org-wide.
  globalStatus?: "submitted";
};

// ── Data ──────────────────────────────────────────────────────────────────────

export const RECIPES: Recipe[] = [
  {
    id: "1",
    icon: <Users2 size={16} />,
    title: "Active Research Surge Accounts",
    description: "Accounts with 3 or more pricing-page visits in last 7 days — active buying-cycle signal.",
    tags: [],
    author: "Intempt",
    steps: 1,
    uses: 3300,
    why: "Accounts that visit your pricing page multiple times in a short window are actively evaluating — they are your warmest pipeline. This recipe surfaces them before they self-select to a competitor.",
    draft: true,
    spec: { complexity: "Simple", execution: "Live", agent: "data analyst", products: ["Accounts", "Segments"], mode: "saas, b2b", areas: ["Data"] },
    stepDetails: [
      `Build a SEGMENT on /attributes titled "Pricing Surge — 7d".

Criteria:
  Event: page_viewed
  URL filter: contains "pricing" OR contains "/plans" OR contains "/upgrade"
  Frequency: 3 or more times
  Window: in the last 7 days

Segment membership updates in real time. Pair it with a Slack Workflow to notify your SDR team whenever an account enters this segment — especially if the account has an existing deal in your CRM.

Suggested next step: feed this segment into an Account Executive sequence that starts with a personalised one-liner referencing the account's product usage, not just their visit count.`,
    ],
  },
  {
    id: "3",
    icon: <FlaskConical size={16} />,
    category: "Experiments",
    title: "Hero Static vs Screenshot Test",
    description: "Test landing page hero image: abstract illustration vs. real product screenshot vs. customer/team photo. Distinct from product-page-layout (ecom) and onboarding-flow (post-signup).",
    tags: ["Experiments"],
    author: "Intempt",
    steps: 1,
    uses: 3300,
    why: "Test landing page hero image: abstract illustration vs. real product screenshot vs. customer/team photo. Distinct from product-page-layout (ecom) and onboarding-flow (post-signup).",
    spec: { complexity: "Standard", execution: "Live", agent: "experiment strategist", products: ["Experiences"], mode: "saas, b2b", areas: ["Experiments"] },
    stepDetails: [
      `Create a CLIENT EXPERIMENT on /experiences titled "Hero Image Test".

PATH 1: Top-level configuration
Experience type: client_experiment

Variants:

  Control (34%): existing hero image (whatever is currently on the page)
  Variant B (33%): static product screenshot — a clean, real product UI screenshot showing the dashboard or core feature
  Variant C (33%): customer/team photo — authentic photo of real users or the team using the product

(Note: animated variants are out of scope for this recipe. Static images only.)

Targeting:

  Pages: homepage "/" and key landing pages
  Devices: any (note: customer-photo variant should have mobile-cropped versions)
  Audience: all visitors
  Display frequency: always
  Primary metric: goal_completed_in_experience where experience_id = <this>
    (goal: form_submitted on demo / contact / signup, OR user_created within session of exposure)
  Secondary metrics:
    - click_on on primary CTA (does the hero image affect CTA click-through?)
    - Bounce rate (does the hero image keep visitors engaged?)
    - Time-on-page (proxy for engagement)
    - Scroll-depth-to-50% (does the hero compel visitors to scroll?)
  Guardrail: bounce rate must not increase >5%; mobile load time must not exceed +200ms
    (image swaps must use optimized formats — WebP, lazy loading)

Schedule: 21 days, 1,500 visitors per variant minimum

PATH 2: Variant HTML content (Visual Editor)
Variant: Control (no DOM changes)

Variant: B (product screenshot)
HTML target selector: .hero-image (the existing hero image element)
Replacement HTML:

  <picture class="hero-image hero-image--screenshot" data-variant="b" data-image-type="screenshot">
    <source media="(min-width: 1024px)" srcset="/hero-screenshots/dashboard-desktop.webp" type="image/webp" />
    <source media="(min-width: 768px)" srcset="/hero-screenshots/dashboard-tablet.webp" type="image/webp" />
    <img src="/hero-screenshots/dashboard-mobile.webp"
         alt="[Brand] dashboard showing [key feature]"
         loading="eager"
         width="800"
         height="500" />
  </picture>

The screenshot should show a real, recognizable product UI — the dashboard, the main feature in use, or a typical user view. Avoid heavily annotated or marketing-overlaid screenshots; clean and authentic outperforms polished.

Variant: C (customer/team photo)
HTML target selector: .hero-image
Replacement HTML:

  <picture class="hero-image hero-image--photo" data-variant="c" data-image-type="customer-photo">
    <source media="(min-width: 1024px)" srcset="/hero-photos/team-desktop.webp" type="image/webp" />
    <source media="(min-width: 768px)" srcset="/hero-photos/team-tablet.webp" type="image/webp" />
    <img src="/hero-photos/team-mobile.webp"
         alt="[Customer name] team using [Brand]"
         loading="eager"
         width="800"
         height="500" />
  </picture>

The photo should be authentic — a real team or customer, not stock photography. If you don't have rights to a real customer photo, use your own team or skip this variant.

The Visual Editor allows the user to swap actual image assets and adjust alt-text, sizing, and positioning. Critical: ensure all image variants are properly sized and compressed for fast load — image swaps that hurt page speed will lose regardless of design quality.

Taxonomy notes:

  2026 SaaS research strongly favors authentic visuals over stock illustrations. Real product screenshots often outperform abstract illustrations for product-led teams; real customer photos often outperform for service/enterprise teams.
  Page-speed monitoring is critical — measure Largest Contentful Paint (LCP) per variant. The winning hero image must also load fast.
  A static-image test is the foundation; animated/video heroes (Lottie embeds, MP4 background, etc.) are out of scope for this recipe and can be authored as a future extension once the static winner is determined.
  Mobile-specific image variants are essential — desktop hero images cropped down to mobile usually look poor and convert worse than mobile-designed versions.`,
    ],
  },
  {
    id: "6",
    icon: <Tag size={16} />,
    category: "Journey Builder",
    title: "B2B Nurture",
    description: "Score leads, segment by readiness, route hot leads to sales, nurture the rest.",
    tags: ["Attributes", "Workflows", "Content"],
    author: "April Dunford",
    steps: 6,
    uses: 3200,
    why: "Most B2B nurture programs spray the same sequence at every lead. This recipe segments by readiness score first, so sales only see leads worth calling and nurture only runs on leads who aren't ready — no wasted effort on either side.",
    requiresIntegration: "HubSpot",
    spec: { complexity: "Advanced", execution: "Live", agent: "journey builder", products: ["Journeys", "Email", "Attributes"], mode: "b2b", areas: ["Journey Builder"] },
    stepDetails: [
      `Step 1 — Define a lead score attribute on /attributes. Score components: job title fit (+20), company size fit (+15), visited pricing (+25), downloaded content (+10), opened email (+5), attended webinar (+30). Cap at 100.`,
      `Step 2 — Create segments: Hot (score ≥ 70), Warm (40–69), Cold (< 40).`,
      `Step 3 — Route Hot leads: trigger an internal notification to the assigned SDR with the lead's score breakdown and recent activity. SLA: SDR must respond within 4 business hours.`,
      `Step 4 — Enroll Warm leads in a 4-touch email sequence (Days 1, 4, 9, 16). Each email references a specific use case based on the lead's industry attribute.`,
      `Step 5 — Enroll Cold leads in a monthly newsletter sequence. Re-evaluate score monthly; promote to Warm or Hot automatically when threshold is crossed.`,
      `Step 6 — Exit conditions: unsubscribe, deal_created, or score drops below 10 for 30 days (mark as disqualified).`,
    ],
  },
  {
    id: "9",
    icon: <Mail size={16} />,
    category: "Email",
    title: "Re-engagement Campaign",
    description: "Target users inactive for 30 or more days. Send personalised win-back sequence referencing their last active feature.",
    tags: ["Email", "Segments"],
    author: "Intempt",
    steps: 3,
    uses: 2600,
    why: "Win-back emails that reference what the user last did convert 2–3× better than generic 'we miss you' messages. This recipe makes personalisation at scale automatic.",
    requiresPermission: "send email campaigns",
    spec: { complexity: "Standard", execution: "Live", agent: "email strategist", products: ["Email", "Segments"], mode: "saas, b2b", areas: ["Email"] },
    stepDetails: [
      `Step 1 — Create a SEGMENT "Inactive — 30d" where last_seen < 30 days ago AND account_status = active.`,
      `Step 2 — Create a 3-touch email sequence:\n  Email 1 (Day 0): "You last used [last_feature_used] — here's what's new since then."\n  Email 2 (Day 4): case study or social proof matching the user's industry.\n  Email 3 (Day 9): offer a free check-in call or a feature walkthrough. Exit if user logs in at any point.`,
      `Step 3 — Exit conditions: user_logged_in, unsubscribed, or sequence_completed without re-engagement (suppress from re-engagement for 60 days).`,
    ],
  },
  {
    id: "10",
    icon: <Camera size={16} />,
    category: "Content",
    title: "Product Launch Creative Bundle",
    description: "Generate on-brand hero banners, social square, and email header for a product launch. One brief in, all formats out.",
    tags: ["Content", "Workflows"],
    author: "Intempt",
    steps: 2,
    uses: 1800,
    why: "Creative production for a launch usually takes 2–3 days of back-and-forth between marketing and design. This recipe reduces that to a single brief and a single generation run, getting you launch-ready assets in one step.",
    requiresIntegration: "Shopify",
    spec: { complexity: "Simple", execution: "On-demand", agent: "content creator", products: ["Content"], mode: "saas, b2b", areas: ["Content"] },
    stepDetails: [
      `Step 1 — Open /content and create a new CONTENT GENERATION task. Fill in the launch brief:\n  Product name, tagline, primary CTA, brand colour hex codes, logo asset URL, tone (e.g. bold, professional, playful).\n\nFormats to generate in one run:\n  - Hero banner: 1440×600px (web)\n  - Social square: 1080×1080px (LinkedIn / X)\n  - Email header: 600×200px`,
      `Step 2 — Review generated assets in the Content preview panel. Use the Regenerate button on any individual format if the first pass misses. Download the approved set as a ZIP from the Export menu.`,
    ],
  },
  {
    id: "11",
    icon: <Bell size={16} />,
    category: "Journey Builder",
    title: "Event-Triggered Upsell",
    description: "When a user hits the plan limit for storage, seats, or events, trigger an in-app nudge and email sequence promoting the next tier.",
    tags: ["Attributes", "Email", "Workflows"],
    author: "Intempt",
    steps: 4,
    uses: 3500,
    why: "The moment a user hits a plan limit is the highest-intent moment to upsell — they have already demonstrated they want more. This recipe captures that moment automatically, before the frustration sets in.",
    requiresPermission: "create journeys",
    spec: { complexity: "Advanced", execution: "Live", agent: "journey builder", products: ["Journeys", "Email"], mode: "saas", areas: ["Journey Builder"] },
    stepDetails: [
      `Step 1 — Create COMPUTED ATTRIBUTES for each limit type:\n  - storage_usage_pct: (storage_used_gb / plan_storage_limit_gb) × 100\n  - seat_usage_pct: (active_seats / plan_seat_limit) × 100\n  - events_usage_pct: (events_this_month / plan_event_limit) × 100`,
      `Step 2 — Create three segments: Storage Limit Hit (≥ 90%), Seat Limit Hit (≥ 90%), Events Limit Hit (≥ 90%).`,
      `Step 3 — For each segment, trigger an IN-APP nudge (banner or modal) on next login:\n  "You're at [X]% of your [limit type]. Upgrade to [next plan] to keep going."`,
      `Step 4 — If user does not upgrade within 48 hours, send Email 1: plan comparison with the relevant limit highlighted. After 5 days without upgrade, send Email 2: "Here's what you're missing" with a CTA to a live upgrade call.`,
    ],
  },
  {
    id: "12",
    icon: <Type size={16} />,
    category: "Content",
    title: "Subject Line Optimiser",
    description: "Generate 10 subject line variants for any campaign, scored by predicted open rate based on past send history.",
    tags: ["Email", "Content"],
    author: "Intempt",
    steps: 1,
    uses: 5200,
    why: "Subject lines account for roughly 50% of open rate variance — yet most teams write one and ship it. This recipe generates a scored shortlist in seconds so you always send the best version.",
    draft: true,
    spec: { complexity: "Simple", execution: "On-demand", agent: "content creator", products: ["Email", "Content"], mode: "saas, b2b", areas: ["Email", "Content"] },
    stepDetails: [
      `Open your campaign in /content. In the Subject line field, click "Optimise with AI".\n\nInput: your campaign brief (one sentence describing the email's purpose and audience).\nOutput: 10 subject line variants with a predicted open rate score for each, ranked best-to-worst.\n\nScoring model is trained on your account's historical send data (opens per subject line pattern). For accounts with < 500 past sends, Intempt falls back to industry benchmarks for your vertical.\n\nSelect the top-scored variant or A/B test the top two by splitting your send list 50/50. The winning variant's data feeds back into the scoring model for future optimisations.`,
    ],
  },
  {
    id: "14",
    icon: <Package size={16} />,
    category: "Data",
    title: "Product-Led Growth Funnel",
    description: "Track free to activated to engaged to expansion across your entire user base. Breakdowns by signup source, plan, and cohort month.",
    tags: ["Reports", "Segments"],
    author: "Intempt",
    steps: 2,
    uses: 3800,
    why: "Most PLG teams track signup and revenue but miss the middle — activation and engagement. This recipe instruments the full funnel so you can see exactly where users fall off and which cohorts expand.",
    spec: { complexity: "Standard", execution: "Live", agent: "data analyst", products: ["Reports", "Accounts", "Segments"], mode: "saas", areas: ["Data"] },
    stepDetails: [
      `Step 1 — Define the four funnel stages as COMPUTED ATTRIBUTES:\n  - Signed up: user_created (always true once created)\n  - Activated: completed onboarding checklist OR used core feature ≥ 1 time within 7 days of signup\n  - Engaged: returned on 3+ separate days in any 14-day window\n  - Expanded: plan_upgraded OR invited ≥ 1 teammate`,
      `Step 2 — Build a FUNNEL REPORT on /reports with the four stages as steps.\n\nBreakdowns to add:\n  - Signup source (UTM or referrer)\n  - Plan at signup (free, trial, paid)\n  - Cohort month (group users by signup month)\n\nSet the conversion window to 30 days per step. Review monthly — cohort curves that improve over time indicate successful onboarding changes; curves that flatten indicate a ceiling in product value.`,
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const RECIPE_DATES: Record<string, string> = {
  "1": "Jul 14, 2026", "3": "Jul 3, 2026",  "6":  "Apr 22, 2026", "9":  "May 7, 2026",
  "10": "Jun 5, 2026", "11": "Apr 11, 2026", "12": "Jul 1, 2026", "14": "May 26, 2026",
};

export type Creator = { name: string; initials: string; color: string };

export const RECIPE_CREATORS: Record<string, Creator> = {
  "1":  { name: "Rana V",        initials: "RV", color: "#0080FF" },
  "3":  { name: "Maya Patel",    initials: "MP", color: "#818cf8" },
  "6":  { name: "April Dunford", initials: "AD", color: "#e05252" },
  "9":  { name: "Tyler Brooks",  initials: "TB", color: "#f97316" },
  "10": { name: "Sam Chen",      initials: "SC", color: "#16a34a" },
  "11": { name: "April Dunford", initials: "AD", color: "#e05252" },
  "12": { name: "Rana V",        initials: "RV", color: "#0080FF" },
  "14": { name: "Sam Chen",      initials: "SC", color: "#16a34a" },
};

// Canvas-published recipes aren't in the seeded RECIPE_CREATORS table (they
// get a fresh `draft-${Date.now()}` id), so fall back to their own `author`
// field rather than showing a blank creator row.
function CreatorChip({ id, author }: { id: string; author?: string }) {
  const c = RECIPE_CREATORS[id] ?? (author ? {
    name: author,
    initials: author.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2),
    color: "#0080FF",
  } : null);
  if (!c) return null;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
        style={{ background: c.color }}
      >
        {c.initials}
      </span>
      <span className="text-xs text-stone-600 dark:text-stone-400 truncate">{c.name}</span>
    </div>
  );
}

// ── Chip color by position ────────────────────────────────────────────────────


// ── Recipe card ───────────────────────────────────────────────────────────────

const MAX_VISIBLE_CHIPS = 2;

function RecipeCard({ recipe, onOpen }: { recipe: Recipe; onOpen: () => void }) {
  const { runningRecipes } = useRecipeRuntime();
  const allChips = Array.from(new Set([...recipe.spec.areas, ...recipe.spec.products]));
  const visibleChips = allChips.slice(0, MAX_VISIBLE_CHIPS);
  const overflow = allChips.length - MAX_VISIBLE_CHIPS;
  const permissionLocked = !!recipe.requiresPermission;
  const notValidated = !!recipe.draftSteps && !recipe.validated;
  const runningStep = runningRecipes[recipe.id];
  const isRunning = runningStep !== undefined;
  const totalSteps = MOCK_STEPS.length;
  const isRunDone = isRunning && runningStep >= totalSteps;

  return (
    <div
      onClick={onOpen}
      className="relative rounded-xl p-5 flex flex-col gap-3 cursor-pointer overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}
    >
      <span className="pointer-events-none absolute -right-4 -bottom-4 select-none text-stone-900 dark:text-stone-100 opacity-[0.02] dark:opacity-[0.03]">
        {cloneElement(recipe.icon as React.ReactElement<{ size?: number }>, { size: 76 })}
      </span>

      {/* Creator + date + (canvas-backed recipes only) a direct edit shortcut */}
      <div className="flex items-center justify-between">
        <CreatorChip id={recipe.id} author={recipe.author} />
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-stone-400 dark:text-stone-500">{RECIPE_DATES[recipe.id] ?? "Just now"}</span>
          {recipe.draftSteps && (
            <button
              onClick={(e) => { e.stopPropagation(); openRecipeInCanvas(recipe, recipe.title); }}
              title="Edit in canvas"
              className="flex h-6 w-6 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-200 transition-colors"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Title + description, or a live step-by-step run animation in place of the description */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1.5">
          {recipe.title}
        </p>
        {isRunning ? (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              {isRunDone ? (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "#10b981" }}>
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              ) : (
                <Loader2 size={13} className="shrink-0 animate-spin" style={{ color: "#10b981" }} />
              )}
              <span className="text-xs font-medium text-stone-600 dark:text-stone-300 truncate">
                {isRunDone ? "Run complete" : MOCK_STEPS[runningStep].title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <span
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ background: i <= runningStep ? "#10b981" : "var(--border)" }}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">
            {recipe.description}
          </p>
        )}
      </div>

      {/* Chips + overflow */}
      {allChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300"
            >
              {chip}
            </span>
          ))}
          {overflow > 0 && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/8">
              +{overflow} more
            </span>
          )}
        </div>
      )}

      {/* Draft / lock badges */}
      {(recipe.draft || permissionLocked || notValidated) && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {permissionLocked && (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/8">
              <Lock size={10} />
              Restricted
            </span>
          )}
          {notValidated && (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle size={10} />
              Needs validation
            </span>
          )}
          {recipe.draft && (
            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/8">
              Draft
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Recipe detail ─────────────────────────────────────────────────────────────

function toSlashCommand(title: string) {
  return "/" + title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
}

function formatRunTimestamp(at: number) {
  const d = new Date(at);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="w-28 shrink-0 text-xs text-stone-400 dark:text-stone-500 pt-0.5">{label}</span>
      <span className="text-sm text-stone-800 dark:text-stone-100">{children}</span>
    </div>
  );
}

const MOCK_STEPS = [
  {
    title: "Define your audience",
    body: "Create a segment or apply filters to target the right users or accounts. Set the criteria — event frequency, attribute values, or time windows — that qualify someone for this recipe.",
  },
  {
    title: "Configure data sources",
    body: "Connect the events and attributes your recipe reads from. Map the relevant properties so the logic has accurate signal to act on.",
  },
  {
    title: "Set your trigger",
    body: "Choose when this recipe activates — in real time as events arrive, on a scheduled cadence, or when a threshold is crossed. Real-time triggers are best for time-sensitive actions; batch suits reporting and rollups.",
  },
  {
    title: "Build the action",
    body: "Define what happens when conditions are met: send a notification, enroll users into a journey, snapshot a report, update a CRM field, or fire a webhook to an external system.",
  },
  {
    title: "Review and launch",
    body: "Preview the audience size estimate and validate the action payload. Set run frequency, confirm the destination, and activate. Monitor results from the recipe's analytics panel.",
  },
];

const RECIPE_TABS = [
  { key: "details", label: "Details",         icon: <FileText  size={13} /> },
  { key: "canvas",  label: "Open in canvas",  icon: <Workflow  size={13} /> },
  { key: "remix",   label: "Remix",           icon: <Shuffle   size={13} /> },
  { key: "md",      label: ".md file",        icon: <FileCode  size={13} /> },
];

// A canvas-published draft doesn't get Remix (nothing to clone — it's your
// own draft) or .md file (there's no static content to export, the canvas
// itself is the source of truth) — just Details and a way back into the
// canvas to keep editing it.
const DRAFT_RECIPE_TABS = [
  { key: "details", label: "Details",         icon: <FileText size={13} /> },
  { key: "remix",   label: "Open in canvas",  icon: <Pencil   size={13} /> },
];

// Shared by the list card's shortcut button and the detail view's own
// Open-in-canvas action — a canvas-backed recipe (has draftSteps) reopens
// with its real nodes under its own name; anything else falls back to the
// generic MOCK_STEPS walkthrough under a "(Remix)" name.
function openRecipeInCanvas(recipe: Recipe, title: string) {
  window.dispatchEvent(new CustomEvent("open-recipe-canvas", {
    detail: {
      title: recipe.draftSteps ? title : `${title} (Remix)`,
      steps: recipe.draftSteps ?? MOCK_STEPS.map((s) => ({ title: s.title, subtitle: s.body })),
    },
  }));
}

export function RecipeDetailView({ recipe, onBack }: { recipe: Recipe; onBack: () => void }) {
  const [activeTab,  setActiveTab]  = useState("details");
  const [cmdCopied,  setCmdCopied]  = useState(false);
  const [title,        setTitle]        = useState(recipe.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft,   setTitleDraft]   = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [slashCmd,       setSlashCmd]       = useState(() => toSlashCommand(recipe.title));
  const [editingCmd,     setEditingCmd]     = useState(false);
  const [cmdDraft,       setCmdDraft]       = useState("");
  const cmdInputRef = useRef<HTMLInputElement>(null);
  const mdOpen = activeTab === "md";
  const [btnRunning, setBtnRunning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { isConnected, connectIntegration, runHistory, addRunRecord, deleteRecipe, startRun, runningRecipes, requestGlobal, validateSeed, publishSeed, creditsErrorShown, markCreditsErrorShown } = useRecipeRuntime();
  const runningStep = runningRecipes[recipe.id];
  const isRunningThis = runningStep !== undefined;
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Validate/Publish for a seeded draft recipe — mocks the same two-step
  // "check, then ship" flow the canvas builder has, just over MOCK_STEPS
  // instead of real canvas nodes, since a seeded draft has no canvas of its
  // own until someone opens it in one.
  const [draftBtnValidating, setDraftBtnValidating] = useState(false);
  const [draftCheckStep, setDraftCheckStep] = useState<number | null>(null);
  // Shown briefly in place of the validated-banner once Publish is clicked —
  // see the banners above the Slash command section.
  const [justPublished, setJustPublished] = useState(false);

  // Tracked so navigating away mid-run (e.g. to build a different recipe)
  // cancels any pending dispatch instead of it firing later on whatever
  // page you've since moved to — see RecipeCanvasView's `schedule` for the
  // same fix on the canvas side.
  const pendingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  function schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    pendingTimeouts.current.push(id);
    return id;
  }
  useEffect(() => {
    return () => { pendingTimeouts.current.forEach(clearTimeout); };
  }, []);

  function handleDeleteRecipe() {
    deleteRecipe(recipe.id);
    onBack();
  }

  function handleMakeGlobal() {
    requestGlobal(recipe.id);
  }
  const needsConnection = !!recipe.requiresIntegration && !isConnected(recipe.requiresIntegration);
  const permissionLocked = !!recipe.requiresPermission;
  const notValidated = !!recipe.draftSteps && !recipe.validated;
  const runLocked = needsConnection || permissionLocked || notValidated;
  const history = runHistory[recipe.id] ?? [];

  // Only a user's own published (non-draft) canvas recipe can be offered up
  // to the wider org — seeded recipes are already global, a raw draft isn't
  // ready for review yet, and it must have been run at least once so there's
  // something to actually show for it.
  const canGoGlobal = !!recipe.draftSteps && !recipe.draft && history.length > 0;

  function handleConnect() {
    if (!recipe.requiresIntegration || connecting) return;
    setConnecting(true);
    schedule(() => {
      connectIntegration(recipe.requiresIntegration!);
      setConnecting(false);
    }, 900);
  }

  function openInCanvas() {
    openRecipeInCanvas(recipe, title);
  }

  function handleRun() {
    if (btnRunning || runLocked) return;
    setBtnRunning(true);
    window.dispatchEvent(new Event("open-blu-chat"));
    const stepTitles = MOCK_STEPS.map((s) => s.title);
    startRun(recipe.id, stepTitles.length);
    schedule(() => {
      window.dispatchEvent(new CustomEvent("blu-recipe-run", { detail: { steps: stepTitles } }));
    }, 300);
    schedule(() => {
      setBtnRunning(false);
      addRunRecord(recipe.id, {
        id: `run-${Date.now()}`,
        at: Date.now(),
        createdLabel: "output",
        by: "Rana V",
      });
    }, 300 + stepTitles.length * 1050 + 200);
  }

  function handleDraftValidate() {
    if (draftBtnValidating) return;
    setDraftBtnValidating(true);
    const total = MOCK_STEPS.length;
    const stepMs = 380;
    for (let i = 0; i < total; i++) {
      schedule(() => setDraftCheckStep(i), i * stepMs);
    }
    schedule(() => setDraftCheckStep(total), total * stepMs);
    schedule(() => {
      setDraftBtnValidating(false);
      setDraftCheckStep(null);
      validateSeed(recipe.id);
    }, total * stepMs + 500);
  }

  function handlePublishDraft() {
    publishSeed(recipe.id);
    setJustPublished(true);
    schedule(() => setJustPublished(false), 5000);
  }

  // ── Validate confirm / credits modal ──────────────────────────────────────

  const [validateStage, setValidateStage] = useState<ValidateModalStage | null>(null);

  function openValidateConfirm() {
    if (draftBtnValidating) return;
    setValidateStage("confirm");
  }
  function handleValidateCancel() {
    setValidateStage(null);
  }
  function handleValidateContinue() {
    if (!creditsErrorShown) {
      markCreditsErrorShown();
      setValidateStage("insufficient");
      return;
    }
    setValidateStage(null);
    handleDraftValidate();
  }
  function handleValidateTryAgain() {
    setValidateStage(null);
    handleDraftValidate();
  }

  function openRunItemInChat(label: string) {
    window.dispatchEvent(new Event("open-blu-chat"));
    window.dispatchEvent(new CustomEvent("blu-suggested-prompt", { detail: { prompt: `Show me the ${label} from this "${recipe.title}" run` } }));
  }

  function handleCopyCmd() {
    navigator.clipboard.writeText(slashCmd);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  }

  function startEditCmd() {
    setCmdDraft(slashCmd);
    setEditingCmd(true);
    setTimeout(() => { cmdInputRef.current?.select(); }, 0);
  }

  function commitCmd() {
    const trimmed = cmdDraft.trim();
    if (trimmed) setSlashCmd(trimmed.startsWith("/") ? trimmed : "/" + trimmed);
    setEditingCmd(false);
  }

  function handleCmdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")  { e.preventDefault(); commitCmd(); }
    if (e.key === "Escape") { setEditingCmd(false); }
  }

  function startEditTitle() {
    setTitleDraft(title);
    setEditingTitle(true);
    setTimeout(() => { titleInputRef.current?.select(); }, 0);
  }

  function commitTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed) setTitle(trimmed);
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")  { e.preventDefault(); commitTitle(); }
    if (e.key === "Escape") { setEditingTitle(false); }
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-hidden animate-fade-up">
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-5 py-2.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <BackButton onClick={onBack} />
          {recipe.draft && (
            <span className="shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-white/8">
              Draft
            </span>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                autoFocus
                maxLength={100}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKeyDown}
                className="min-w-0 rounded-md px-2 py-0.5 text-sm font-medium text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ background: "var(--input)", border: "1px solid var(--border)", width: `${Math.max(titleDraft.length, 10)}ch` }}
              />
            ) : (
              <button
                onClick={startEditTitle}
                className="group flex items-center gap-1.5 min-w-0"
                title="Click to rename"
              >
                <span className="truncate font-medium text-stone-900 dark:text-stone-100">{title}</span>
                <Pencil size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 dark:text-stone-500" />
              </button>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {needsConnection && (
            <button
              onClick={handleConnect}
              disabled={connecting}
              title={`Connect ${recipe.requiresIntegration} to run this recipe`}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 transition-colors hover:bg-amber-100 dark:hover:bg-amber-500/15 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {connecting
                ? <Loader2 size={12} className="animate-spin" />
                : <IntegrationLogo name={recipe.requiresIntegration!} size={12} fallback={<Plug size={12} />} />}
              {connecting ? `Connecting ${recipe.requiresIntegration}…` : `Connect ${recipe.requiresIntegration}`}
            </button>
          )}
          {canGoGlobal && (
            recipe.globalStatus === "submitted" ? (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10">
                <Clock size={12} />
                Submitted for review
              </span>
            ) : (
              <button
                onClick={handleMakeGlobal}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#3b82f6" }}
              >
                <Globe size={12} />
                Make it global
              </button>
            )
          )}
          {recipe.draft ? (
            <button
              onClick={openValidateConfirm}
              disabled={draftBtnValidating}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold bg-(--border) text-stone-600 hover:bg-stone-300 dark:text-stone-300 dark:hover:bg-white/14 transition-colors active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {draftBtnValidating
                ? <Loader2 size={13} className="animate-spin" />
                : <ShieldCheck size={13} />}
              Validate
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={btnRunning || runLocked}
              title={
                permissionLocked ? `You don't have permission to ${recipe.requiresPermission}` :
                needsConnection  ? `Connect ${recipe.requiresIntegration} to run this recipe` :
                undefined
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: runLocked ? "var(--stone-400, #a8a29e)" : "#10b981" }}
            >
              {btnRunning ? (
                <Loader2 size={13} className="animate-spin" />
              ) : runLocked ? (
                <Lock size={11} />
              ) : (
                <Play size={11} className="fill-current" />
              )}
              Run
            </button>
          )}
          <SubTabCorner
            tabs={(recipe.draft || recipe.draftSteps) ? DRAFT_RECIPE_TABS : RECIPE_TABS}
            active={activeTab}
            onChange={(key) => {
              if (key === "remix" || key === "canvas") {
                openInCanvas();
                return;
              }
              setActiveTab(key);
            }}
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

          {/* Validated / published banners — the draft's own "ready to ship"
              and "shipped" moments, surfaced here rather than as just another
              top-bar button so they actually read as milestones. */}
          {recipe.draft && recipe.validated && (
            <div
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3 animate-fade-up"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "#3b82f6" }}>
                  <Check size={14} className="text-white" strokeWidth={3} />
                </span>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-snug">
                  Your recipe is now validated and ready to be used. Click publish to make it available.
                </p>
              </div>
              <button
                onClick={handlePublishDraft}
                className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{ background: "#3b82f6" }}
              >
                Publish
              </button>
            </div>
          )}
          {justPublished && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 animate-fade-up"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: "#10b981" }}>
                <Check size={14} className="text-white" strokeWidth={3} />
              </span>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-snug">
                Congratulations, your recipe is now live in your project.
              </p>
            </div>
          )}

          {/* Slash command block */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2">
              Slash command
            </p>
            <div
              className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3"
              style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
            >
              {editingCmd ? (
                <input
                  ref={cmdInputRef}
                  autoFocus
                  maxLength={100}
                  value={cmdDraft}
                  onChange={(e) => setCmdDraft(e.target.value)}
                  onBlur={commitCmd}
                  onKeyDown={handleCmdKeyDown}
                  className="flex-1 min-w-0 font-mono text-sm font-medium text-blue-600 dark:text-blue-400 bg-transparent outline-none border-b border-blue-400"
                />
              ) : (
                <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 truncate flex-1 min-w-0">
                  {slashCmd}
                </span>
              )}
              <div className="shrink-0 flex items-center gap-1">
                {!editingCmd && (
                  <button
                    onClick={startEditCmd}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/8 transition-colors"
                  >
                    <Pencil size={11} />
                    Rename
                  </button>
                )}
                <button
                  onClick={handleCopyCmd}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-500 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/8 transition-colors"
                >
                  {cmdCopied
                    ? <><Check size={11} className="text-emerald-500" /><span className="text-emerald-500">Copied</span></>
                    : <><Copy size={11} />Copy</>}
                </button>
              </div>
            </div>
          </section>

          {/* Why this recipe works */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
              Why this recipe works
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {recipe.why}
            </p>
          </section>

          {/* Specs */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-1">
              Specs
            </p>
            <div>
              <SpecRow label="Steps">{recipe.steps} {recipe.steps === 1 ? "step" : "steps"}</SpecRow>
              <SpecRow label="Complexity">{recipe.spec.complexity}</SpecRow>
              <SpecRow label="Execution">{recipe.spec.execution}</SpecRow>
              <SpecRow label="Agent">{recipe.spec.agent}</SpecRow>
              <SpecRow label="Products">
                <span className="flex flex-wrap gap-1">
                  {recipe.spec.products.map(p => (
                    <span key={p} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-400">
                      {p}
                    </span>
                  ))}
                </span>
              </SpecRow>
              <SpecRow label="Mode">{recipe.spec.mode}</SpecRow>
              <SpecRow label="Areas">
                <span className="flex flex-wrap gap-1">
                  {recipe.spec.areas.map(a => (
                    <span key={a} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
                      {a}
                    </span>
                  ))}
                </span>
              </SpecRow>
            </div>
          </section>

          {/* Steps */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-5">
              Steps ({MOCK_STEPS.length})
            </p>

            <div className="flex flex-col">
              {MOCK_STEPS.map((s, i) => {
                const activeProgressStep = isRunningThis ? runningStep : draftCheckStep ?? undefined;
                const isProgressing = activeProgressStep !== undefined;
                const stepDone = isProgressing && i < activeProgressStep;
                const stepActive = isProgressing && i === activeProgressStep;
                return (
                <div key={i} className="flex gap-4">
                  {/* Number + connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300"
                      style={
                        stepDone
                          ? { background: "#3b82f6", border: "1px solid #3b82f6", color: "#fff" }
                          : stepActive
                          ? { background: "var(--muted)", border: "2px solid #3b82f6", color: "#3b82f6" }
                          : { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--stone-600, #57534e)" }
                      }
                    >
                      {stepDone ? <Check size={12} strokeWidth={3} /> : i + 1}
                    </div>
                    {i < MOCK_STEPS.length - 1 && (
                      <div className="w-px flex-1 my-1.5 transition-colors duration-300" style={{ background: stepDone ? "#3b82f6" : "var(--border)" }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className={i < MOCK_STEPS.length - 1 ? "pb-6" : "pb-0"}>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1">{s.title}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </section>

          {/* Recent runs — one generation record per completed Run, BC-RCP-GEN-* */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3 flex items-center gap-1.5">
              <History size={11} />
              Recent runs
            </p>
            {history.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500">No runs yet — hit Run to execute this recipe.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                    style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "#10b981" }}>
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        <span className="font-medium text-stone-700 dark:text-stone-300">{run.by}</span>
                        {" · "}
                        {formatRunTimestamp(run.at)}
                      </span>
                    </div>
                    <button
                      onClick={() => openRunItemInChat(run.createdLabel)}
                      className="shrink-0 inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors"
                    >
                      {run.createdLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delete recipe */}
          <section>
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} />
              Delete recipe
            </button>
          </section>

        </div>
      </div>

      {confirmDelete && (
        <DeleteConfirmDialog
          entityType="recipe"
          entityName={title}
          onConfirm={handleDeleteRecipe}
          onClose={() => setConfirmDelete(false)}
        />
      )}

      {mdOpen && (
        <SlidingSidebar
          title="recipe.md"
          description={recipe.title}
          onClose={() => setActiveTab("details")}
        >
          <RecipeMdContent recipe={recipe} />
        </SlidingSidebar>
      )}

      {validateStage && (
        <ValidateConfirmModal
          stage={validateStage}
          onCancel={handleValidateCancel}
          onContinue={handleValidateContinue}
          onTryAgain={handleValidateTryAgain}
        />
      )}
    </div>
  );
}

// ── recipe.md content ─────────────────────────────────────────────────────────

function RecipeMdContent({ recipe }: { recipe: Recipe }) {
  const [copied, setCopied] = useState(false);

  const content = [
    `# ${recipe.title}`,
    ``,
    `## Description`,
    ``,
    recipe.description,
    ``,
    `## Why this works`,
    ``,
    recipe.why,
    ``,
    `## Specs`,
    ``,
    `- **Complexity**: ${recipe.spec.complexity}`,
    `- **Execution**: ${recipe.spec.execution}`,
    `- **Agent**: ${recipe.spec.agent}`,
    `- **Products**: ${recipe.spec.products.join(", ")}`,
    `- **Mode**: ${recipe.spec.mode}`,
    `- **Areas**: ${recipe.spec.areas.join(", ")}`,
    ``,
    `## Steps`,
    ``,
    ...MOCK_STEPS.flatMap((s, i) => [
      `### Step ${i + 1}: ${s.title}`,
      ``,
      s.body,
      ``,
    ]),
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative px-5 pb-5">
      <button
        onClick={handleCopy}
        className="absolute right-5 top-0 inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
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

// ── Sort / filter helpers ──────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { key: "most-used",        label: "Most used" },
  { key: "recently-added",   label: "Recently added" },
  { key: "az",               label: "A → Z" },
  { key: "recently-updated", label: "Recently updated" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

const RECIPE_UPDATED_DATES: Record<string, string> = {
  "1": "Jul 24, 2026", "3": "Jun 12, 2026", "6": "Jul 7, 2026",  "9": "Jul 11, 2026",
  "10": "Jul 5, 2026", "11": "Jul 21, 2026", "12": "Jul 25, 2026", "14": "Jul 10, 2026",
};

function normalizeAgent(a: string) {
  return a.split(" ").map(w =>
    w.toLowerCase() === "revops" ? "RevOps" : w.charAt(0).toUpperCase() + w.slice(1)
  ).join(" ");
}

function parseDateMs(s: string) { return s ? new Date(s).getTime() : 0; }

const ALL_AGENTS = Array.from(new Set(RECIPES.map(r => normalizeAgent(r.spec.agent)))).sort();
const ALL_AREAS  = Array.from(new Set(RECIPES.flatMap(r => r.spec.areas))).sort();

// ── Main view ─────────────────────────────────────────────────────────────────

const BTN = "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-sm font-medium transition-colors border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6";

export default function RecipesView() {
  const navigate = useNavigate();
  const { isDeleted, draftRecipes, seedOverrides } = useRecipeRuntime();
  const [search,       setSearch]       = useState("");
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [sortOpen,     setSortOpen]     = useState(false);
  const [sortBy,       setSortBy]       = useState<SortKey>("most-used");
  const [filterAgents, setFilterAgents] = useState<Set<string>>(new Set());
  const [filterAreas,  setFilterAreas]  = useState<Set<string>>(new Set());
  const sortRef   = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function handle(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [sortOpen]);

  useEffect(() => {
    if (!filterOpen) return;
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filterOpen]);

  function toggleAgent(a: string) {
    setFilterAgents(prev => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }
  function toggleArea(a: string) {
    setFilterAreas(prev => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; });
  }

  // Filter — seeded recipes plus anything published from the canvas
  const matchesFilters = (r: Recipe) => {
    if (isDeleted(r.id)) return false;
    const q = search.toLowerCase();
    if (q && !r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q) && !r.tags.some(t => t.toLowerCase().includes(q))) return false;
    if (filterAgents.size > 0 && !filterAgents.has(normalizeAgent(r.spec.agent))) return false;
    if (filterAreas.size > 0 && !r.spec.areas.some(a => filterAreas.has(a))) return false;
    return true;
  };

  const drafts = draftRecipes.filter(matchesFilters);
  let seeded   = RECIPES.filter(matchesFilters).map((r) => withSeedOverrides(r, seedOverrides));

  // Sort — only applies within the seeded catalog. A just-published canvas
  // recipe has 0 uses and no seeded date, so it would otherwise sink under
  // "Most used"/"Recently added" — instead, drafts always lead the list
  // (newest first) since publishing is itself the most recent activity.
  if (sortBy === "most-used")        seeded = [...seeded].sort((a, b) => b.uses - a.uses);
  else if (sortBy === "recently-added")   seeded = [...seeded].sort((a, b) => parseDateMs(RECIPE_DATES[b.id]) - parseDateMs(RECIPE_DATES[a.id]));
  else if (sortBy === "az")               seeded = [...seeded].sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === "recently-updated") seeded = [...seeded].sort((a, b) => parseDateMs(RECIPE_UPDATED_DATES[b.id]) - parseDateMs(RECIPE_UPDATED_DATES[a.id]));

  const result = [...drafts, ...seeded];

  const activeFilterCount = filterAgents.size + filterAreas.size;
  const activeSortLabel   = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? "Sort";

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 pt-3 pb-3">
        <div className="flex flex-1 min-w-0 items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input) dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>

        {/* Filter button + dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(v => !v)}
            className={`${BTN}${filterOpen || activeFilterCount > 0 ? " border-blue-300! bg-blue-50! text-blue-600! dark:border-blue-500/30! dark:bg-blue-500/10! dark:text-blue-400!" : ""}`}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white leading-none">
                {activeFilterCount}
              </span>
            ) : (
              <ChevronDown size={12} className={`transition-transform duration-150 ${filterOpen ? "rotate-180" : ""}`} />
            )}
          </button>
          {filterOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 z-50 w-96 rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--content-bg)", boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)" }}
            >
              {/* Agent */}
              <div className="px-4 pt-4 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Agent</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_AGENTS.map(agent => {
                    const active = filterAgents.has(agent);
                    return (
                      <button
                        key={agent}
                        onClick={() => toggleAgent(agent)}
                        className="h-7 rounded-full px-3 text-sm font-medium transition-all"
                        style={{
                          background: active ? "#3b82f6" : "var(--muted)",
                          border: `1px solid ${active ? "#3b82f6" : "var(--border)"}`,
                          color: active ? "#fff" : "var(--stone-700, #44403c)",
                        }}
                      >
                        {agent}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* separator */}
              <div className="h-px mx-4" style={{ background: "var(--border)" }} />
              {/* Areas */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-2.5">Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_AREAS.map(area => {
                    const active = filterAreas.has(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className="h-7 rounded-full px-3 text-sm font-medium transition-all"
                        style={{
                          background: active ? "#3b82f6" : "var(--muted)",
                          border: `1px solid ${active ? "#3b82f6" : "var(--border)"}`,
                          color: active ? "#fff" : "var(--stone-700, #44403c)",
                        }}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => { setFilterAgents(new Set()); setFilterAreas(new Set()); }}
                    className="text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors pt-2.5 block"
                  >
                    Clear all ({activeFilterCount})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort button */}
        <div className="relative" ref={sortRef}>
          <button onClick={() => setSortOpen(v => !v)} className={BTN}>
            <ArrowUpDown size={13} />
            <span className="hidden sm:inline">{activeSortLabel}</span>
            <ChevronDown size={12} className={`transition-transform duration-150 ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "var(--content-bg)", boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)" }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-left hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span className="w-4 shrink-0">
                    {sortBy === opt.key && <Check size={14} className="text-blue-500" />}
                  </span>
                  <span className={sortBy === opt.key ? "font-semibold text-stone-800 dark:text-stone-100" : "text-stone-600 dark:text-stone-300"}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: "#0080FF" }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">New Recipe</span>
        </button>
      </div>

      {/* Card grid */}
      <div className="px-4 pb-6 pt-1 animate-fade-up">
        {result.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-sm text-stone-400 dark:text-stone-500">No recipes match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onOpen={() => navigate(`/recipes/${r.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {drawerOpen && <CreateRecipeDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
