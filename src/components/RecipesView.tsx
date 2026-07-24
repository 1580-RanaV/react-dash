import { useState } from "react";
import {
  Search, Plus, Heart, ArrowUpDown, SlidersHorizontal,
  Mail, MessageSquare, Bell, Globe, Camera, Type, Package,
  LayoutDashboard, Route, Zap, Users2, FlaskConical, Tag, BarChart3,
} from "lucide-react";
import CreateRecipeDrawer from "./CreateRecipeDrawer";
import BackButton from "./BackButton";

// ── Types ─────────────────────────────────────────────────────────────────────

type RecipeSpec = {
  complexity: string;
  execution: string;
  agent: string;
  products: string[];
  mode: string;
  areas: string[];
};

type Recipe = {
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
};

// ── Data ──────────────────────────────────────────────────────────────────────

const RECIPES: Recipe[] = [
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
    id: "2",
    icon: <LayoutDashboard size={16} />,
    category: "Data",
    title: "Feature Paywall Conversion",
    description: "Per-feature percentage of free users who interact with it and subsequently view pricing and subscribe — informs feature-led conversion strategy.",
    tags: ["Reports"],
    author: "Intempt",
    steps: 1,
    uses: 3300,
    why: "Most teams track overall conversion. This recipe goes one level deeper to show which specific features actually pull free users toward paid, so you can double down on what works and stop investing in features that don't convert.",
    spec: { complexity: "Standard", execution: "Batch", agent: "data analyst", products: ["Reports", "Events"], mode: "saas", areas: ["Data"] },
    stepDetails: [
      `Build a FUNNEL REPORT on /reports with the following steps:

Step 1: feature_interacted (filter by feature_name property if instrumented)
Step 2: page_viewed where URL contains "pricing" OR "plans" OR "upgrade"
Step 3: subscription_created OR plan_upgraded

Group by: feature_name
Date range: last 90 days, rolling
Filter Step 1: plan = free only

The conversion rate from Step 1 → Step 3 is your per-feature paywall conversion rate.

Interpretation:
  High Step1→Step2, low Step2→Step3: your pricing page is the drop-off. Investigate plan differentiation.
  Low Step1→Step2: feature users aren't reaching pricing. Add contextual upgrade prompts.
  High Step1→Step3: this feature is your conversion engine — highlight it in onboarding.`,
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
    id: "4",
    icon: <LayoutDashboard size={16} />,
    category: "Data",
    title: "First Session Paths After Signup",
    description: "Forward path from user_created showing what new users actually do in their first session vs. the intended onboarding flow.",
    tags: ["Reports"],
    author: "Intempt",
    steps: 1,
    uses: 3300,
    why: "The gap between your intended onboarding flow and what users actually do in their first session is where activation breaks. This recipe makes that gap visible so you can fix the right step.",
    spec: { complexity: "Standard", execution: "Live", agent: "data analyst", products: ["Reports", "Events"], mode: "saas", areas: ["Data"] },
    stepDetails: [
      `Build a PATH ANALYSIS report on /reports starting from user_created.

Configuration:
  Starting event: user_created
  Window: first session only (session_end OR 30 minutes after user_created, whichever comes first)
  Max path depth: 8 steps
  Collapse repeated events: yes

Look for:
  - The most common first action after signup (is it your intended first step?)
  - Where users branch away from the intended onboarding funnel
  - Dead ends — events followed by session_end with no activation event

Cross-reference with your activation metric (e.g. feature_used, project_created, report_viewed) to find which paths correlate with users who activate vs. who churn.`,
    ],
  },
  {
    id: "5",
    icon: <BarChart3 size={16} />,
    category: "RevOps",
    title: "Weekly Forecast Rollup",
    description: "Every Monday morning, snapshot the pipeline by stage, weighted forecast, committed pipeline, and forecast vs. actual comparison.",
    tags: ["Reports", "Content", "Workflows"],
    author: "Intempt",
    steps: 4,
    uses: 3300,
    why: "A forecast that lives only in your CRM is a forecast nobody reads. This recipe packages it as a Monday-morning digest that every revenue stakeholder can scan in 60 seconds.",
    spec: { complexity: "Standard", execution: "Scheduled", agent: "revops automator", products: ["Reports", "Journeys"], mode: "saas, b2b", areas: ["RevOps"] },
    stepDetails: [
      `Step 1 — Build the pipeline snapshot report on /reports.\n\nMetrics: deal count and value by stage, weighted forecast (deal value × close probability), committed pipeline (stage = Proposal or later), and deals closed vs. forecast for the prior week.`,
      `Step 2 — Schedule the report to run every Monday at 07:00 in your organisation's timezone (set under report Settings → Schedule).`,
      `Step 3 — Create a CONTENT block (email or Slack message) that embeds the report summary. Use merge tags: {{pipeline_total}}, {{weighted_forecast}}, {{deals_closed_last_week}}, {{forecast_vs_actual_delta}}.`,
      `Step 4 — Create a WORKFLOW on /journeys triggered by schedule: every Monday at 07:00. Action: send the content block to your Revenue leadership distribution list.`,
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
    id: "7",
    icon: <Zap size={16} />,
    category: "Data",
    title: "Churn Risk Early Warning",
    description: "Flag accounts that have dropped login frequency by 40 percent or more over 14 days. Fire Slack alert to CSM when threshold is crossed.",
    tags: ["Segments", "Workflows"],
    author: "Intempt",
    steps: 3,
    uses: 2900,
    why: "Churn rarely happens suddenly. The 40% login frequency drop over 14 days is a leading indicator that fires weeks before an account actually cancels — giving your CSM team enough runway to intervene.",
    spec: { complexity: "Standard", execution: "Live", agent: "revops automator", products: ["Accounts", "Journeys"], mode: "saas, b2b", areas: ["RevOps", "Data"] },
    stepDetails: [
      `Step 1 — Build a COMPUTED ATTRIBUTE on /attributes: login_freq_drop_14d.\n\nFormula: ((logins in prior 14d − logins in current 14d) / logins in prior 14d) × 100\nOnly evaluate accounts where logins in prior 14d ≥ 3 (filter out inactive-from-the-start).`,
      `Step 2 — Create a SEGMENT "Churn Risk — Login Drop" where login_freq_drop_14d ≥ 40.`,
      `Step 3 — Create a WORKFLOW triggered by segment_entered for "Churn Risk — Login Drop". Action: send a Slack message to the account's assigned CSM with: account name, current login count, prior login count, and a deep link to the account's activity timeline.`,
    ],
  },
  {
    id: "8",
    icon: <Route size={16} />,
    category: "Journey Builder",
    title: "Trial-to-Paid Conversion Flow",
    description: "Day 1 welcome, Day 3 key-feature nudge, Day 10 value recap, Day 13 urgency push. Adapts copy based on features used.",
    tags: ["Email", "Workflows", "Segments"],
    author: "Intempt",
    steps: 5,
    uses: 4100,
    why: "A flat 4-email trial sequence ignores what the user actually did. This recipe branches copy based on which features they used, so every email references something real — dramatically improving relevance and conversion.",
    spec: { complexity: "Advanced", execution: "Live", agent: "journey builder", products: ["Journeys", "Email", "Segments"], mode: "saas", areas: ["Journey Builder"] },
    stepDetails: [
      `Step 1 — Trigger: trial_started. Enroll user in the journey with metadata: trial_end_date, plan_type, signup_source.`,
      `Step 2 — Day 1 (T+0): send welcome email. Content: what to do first, link to quickstart guide. No personalisation required.`,
      `Step 3 — Day 3 (T+2): branch on features_used_count.\n  ≥ 1 feature used: send "You tried [feature_name] — here's how to get more from it."\n  0 features used: send "You haven't started yet — here's the one thing to do first."`,
      `Step 4 — Day 10 (T+9): send value recap. Merge tags: {{events_tracked}}, {{reports_created}}, {{team_members_invited}}. Subject: "Your trial so far — [X] things you've done."`,
      `Step 5 — Day 13 (T+12): urgency push. "Your trial ends in 2 days." Include a CTA to upgrade. Branch: if user has invited a teammate, include a team plan CTA; otherwise, individual plan.`,
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
    spec: { complexity: "Simple", execution: "On-demand", agent: "content creator", products: ["Email", "Content"], mode: "saas, b2b", areas: ["Email", "Content"] },
    stepDetails: [
      `Open your campaign in /content. In the Subject line field, click "Optimise with AI".\n\nInput: your campaign brief (one sentence describing the email's purpose and audience).\nOutput: 10 subject line variants with a predicted open rate score for each, ranked best-to-worst.\n\nScoring model is trained on your account's historical send data (opens per subject line pattern). For accounts with < 500 past sends, Intempt falls back to industry benchmarks for your vertical.\n\nSelect the top-scored variant or A/B test the top two by splitting your send list 50/50. The winning variant's data feeds back into the scoring model for future optimisations.`,
    ],
  },
  {
    id: "13",
    icon: <Globe size={16} />,
    category: "RevOps",
    title: "ICP Fit Scoring",
    description: "Score every account against your ICP: firmographics, engagement signals, and product usage depth. Auto-route high-fit accounts to account executives.",
    tags: ["Attributes", "Reports", "Segments"],
    author: "Intempt",
    steps: 3,
    uses: 2100,
    why: "Sales teams that work every account equally waste time on deals that will never close. An ICP score forces a stack rank so the highest-fit accounts get the most attention — consistently, not just when a rep has a good instinct.",
    spec: { complexity: "Advanced", execution: "Live", agent: "revops automator", products: ["Accounts", "Attributes", "Reports"], mode: "saas, b2b", areas: ["RevOps"] },
    stepDetails: [
      `Step 1 — Define ICP scoring dimensions on /attributes as computed attributes:\n  - Firmographic fit: industry match (+20), employee count in range (+15), HQ country match (+10), tech stack match (+15)\n  - Engagement: product sessions last 30d > 5 (+10), invite sent (+10), integration connected (+20)\n  Total max: 100`,
      `Step 2 — Create SEGMENTS by tier:\n  - Tier 1: ICP score ≥ 70 (high fit)\n  - Tier 2: ICP score 40–69 (medium fit)\n  - Tier 3: ICP score < 40 (low fit)`,
      `Step 3 — Create a WORKFLOW triggered by segment_entered for Tier 1. Action: assign account to the AE queue via CRM webhook (pass account ID, ICP score, and score breakdown). Notify AE via Slack with a link to the account timeline.`,
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
  {
    id: "15",
    icon: <MessageSquare size={16} />,
    category: "Email",
    title: "SMS Winback",
    description: "Three-touch SMS sequence for lapsed subscribers. Personalised offers based on last purchase category and recency.",
    tags: ["SMS", "Segments"],
    author: "Intempt",
    steps: 3,
    uses: 1400,
    why: "SMS open rates are 5–6× higher than email, making it the right channel for win-back where urgency matters. Personalising by last purchase category lifts response rate vs. a generic discount.",
    spec: { complexity: "Standard", execution: "Live", agent: "email strategist", products: ["SMS", "Segments", "Journeys"], mode: "b2c", areas: ["Email"] },
    stepDetails: [
      `Step 1 — Create SEGMENT "SMS Winback Eligible":\n  - Has opted into SMS\n  - Last purchase > 60 days ago AND < 365 days ago\n  - Has at least 1 past purchase (exclude never-purchased)`,
      `Step 2 — Create a 3-touch SMS sequence:\n  SMS 1 (Day 0): "Hi [first_name], we miss you! Here's 15% off your next [last_purchase_category] order: [link]"\n  SMS 2 (Day 4, no purchase): "Your 15% off expires in 48h — [link]"\n  SMS 3 (Day 8, no purchase): "Last chance: 20% off anything in [last_purchase_category] — offer ends tonight. [link]"`,
      `Step 3 — Exit conditions: purchase_completed (any amount), unsubscribed from SMS, or sequence completed. Re-entry allowed after 90 days of no further purchase.`,
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUses(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function AuthorAvatar({ name }: { name: string }) {
  if (name === "Intempt") {
    return <img src="/mascot.png" alt="Intempt" className="h-4 w-4 rounded-full object-contain shrink-0" />;
  }
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700 text-[9px] font-bold text-stone-600 dark:text-stone-300">
      {name[0]}
    </span>
  );
}

// ── Recipe card ───────────────────────────────────────────────────────────────

function RecipeCard({ recipe, onOpen }: { recipe: Recipe; onOpen: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      onClick={onOpen}
      className="rounded-xl p-5 flex flex-col cursor-pointer transition-shadow"
      style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">
          {recipe.icon}
        </span>
        <button
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${liked ? "text-red-500" : "text-stone-300 dark:text-stone-600 hover:text-stone-400"}`}
        >
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      {recipe.category && (
        <span className="mb-2 self-start inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
          {recipe.category}
        </span>
      )}

      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1.5">
        {recipe.title}
      </p>

      <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3 flex-1 mb-3">
        {recipe.description}
      </p>

      {recipe.tags.length > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
          {recipe.tags.join(" · ")}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <AuthorAvatar name={recipe.author} />
          <span className="text-xs text-stone-400 dark:text-stone-500 truncate">{recipe.author}</span>
          <span className="text-stone-200 dark:text-stone-700 shrink-0">·</span>
          <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">
            {recipe.steps} {recipe.steps === 1 ? "step" : "steps"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 shrink-0 ml-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
          </svg>
          {formatUses(recipe.uses)}
        </div>
      </div>
    </div>
  );
}

// ── Recipe detail ─────────────────────────────────────────────────────────────

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="w-28 shrink-0 text-xs text-stone-400 dark:text-stone-500 pt-0.5">{label}</span>
      <span className="text-sm text-stone-800 dark:text-stone-100">{children}</span>
    </div>
  );
}

function RecipeDetailView({ recipe, onBack }: { recipe: Recipe; onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden animate-fade-up">
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <BackButton onClick={onBack} />
        <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{recipe.title}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

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
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">
              Steps ({recipe.steps})
            </p>
            <div className="flex flex-col gap-6">
              {recipe.stepDetails.map((detail, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-stone-600 dark:text-stone-400 mt-0.5" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                    {i + 1}
                  </div>
                  <pre className="flex-1 text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {detail}
                  </pre>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

const BTN = "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-sm font-medium transition-colors border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6";

export default function RecipesView() {
  const [search, setSearch]       = useState("");
  const [openId, setOpenId]       = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openRecipe = RECIPES.find(r => r.id === openId);

  if (openRecipe) {
    return <RecipeDetailView recipe={openRecipe} onBack={() => setOpenId(null)} />;
  }

  const filtered = RECIPES.filter(r => {
    const q = search.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      {/* Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 pt-3 pb-3">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search recipes…"
            className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input) dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>
        <button className={BTN}>
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filter</span>
        </button>
        <button className={BTN}>
          <ArrowUpDown size={13} />
          <span className="hidden sm:inline">Sort</span>
        </button>
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
      <div className="px-4 pb-6 pt-4 animate-fade-up">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-sm text-stone-400 dark:text-stone-500">No recipes match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onOpen={() => setOpenId(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {drawerOpen && <CreateRecipeDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
