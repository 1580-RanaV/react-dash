# Analytics Home — PRD (Refreshed)

Route: `/home?tab=analytics/full`

Implementation: `AnalyticsFullDashboard()` in `src/components/HomeView.tsx` (react-dash), rendered by `HomeView` (default export, bottom of the file) when `activeTab === "analytics"`. The `full` / `partial` / `empty` segment of the URL (`/home?tab=analytics/<state>`) is parsed into `homeState` and passed down as `noData={homeState === "partial"}`. `homeState === "empty"` bypasses `AnalyticsFullDashboard` entirely and renders a different full-page component, `EmptyHomeDashboard` (not covered by this document — this document is about the four-card grid and its two populated/degraded states, `full` and `partial`).

This document is a refresh of `homepages-source.md`, which was an excellent first pass at explaining this exact page (Activity, Audience Quality, Revenue Pulse, Acquisition Mix) in the same style and depth. This refresh does three things the prior draft could not:

1. Re-grounds every card, mock number, color, and copy string against the **live code** in `HomeView.tsx` as it exists today, rather than an earlier iteration of the design.
2. Documents the **shipped** empty/waiting-state system (`CardEmptyState`) precisely — the prior draft treated this as aspirational ("none of this state logic is implemented yet"-style language); it is now real, shared across all four Home tabs, and every card on this page uses it.
3. Adds **verified** SDK, Journey, and Stripe grounding in place of the prior draft's best-guess doc URLs, plus a confirmed-real backend reference for Revenue Pulse from `CONSOLE_FEATURE_INVENTORY.md`.

`homepages-source.md` is not deleted or modified — it remains the historical reasoning trail. This file supersedes it as the current source of truth for the Analytics Home page.

## What Changed Since the Prior Draft

1. **The "Upgrade Section" is gone.** The prior draft described a strip after the 2×2 grid — "Discover more today" headline, "Unlock full analytics for deeper trends, retention cuts, and revenue insights." body copy, a white "Upgrade plan" button with a black lock icon, ~20vh tall. Searching the live `HomeView.tsx` for that copy (`Discover more today`, `Upgrade plan`, `Unlock full analytics`) returns no matches. It has been removed from the page — on all four Home tabs (Design, Marketing, Sales, Analytics), not just this one. This was a product decision, not an oversight. Do not re-add it to any future spec; the page now ends with the 2×2 card grid.

2. **The per-card empty/waiting state is real and shipping**, not aspirational. Every card in `AnalyticsFullDashboard` takes the dashboard-level `noData` boolean and, when true, renders `<CardEmptyState .../>` in place of its chart/content. This is documented in full below (see "Shared Component: CardEmptyState") and per-card copy is quoted verbatim from the source.

3. **The card set drifted from an earlier design, and the live code is the source of truth.** There is a second, unused function in the same file, `AnalyticsDashboard()` (no "Full"), defined at line 1366, which still contains richer constants — `ANALYTICS_EVENT_TYPES`, `ANALYTICS_DEVICE_MIX`, `ANALYTICS_REVENUE_HEALTH` (a 2×2 of Current MRR / Subscribers / Trial to paid / Churn), `ANALYTICS_AUDIENCE_SPLIT`. **`AnalyticsDashboard` is never invoked anywhere in the codebase** — it is dead code left over from an earlier iteration of this page. The prior draft's "Revenue Health" card (with Trial-to-paid and Churn fields) and its "Event types" / "Device and browser mix" cards describe that earlier, superseded design. The page that actually renders at `/home?tab=analytics/full` today is the leaner 4-card version: **Activity, Audience Quality, Revenue Pulse, Acquisition Mix** — and Revenue Pulse's support metrics are **Subscribers, Net movement, NRR** (Trial-to-paid and Churn are not present in the live card). This PRD documents the live 4-card page only, and flags the dead code so nobody resurrects its field names by accident.

4. **SDK/Stripe grounding is now verified**, not guessed. The prior draft cited `https://docs.intempt.com/js-sdk` and `https://help.intempt.com/...` without having fetched them. This refresh pulls confirmed method signatures, auto-attached identifiers, and reserved event names from the real JS SDK doc, plus the actual Stripe object/event types Revenue Pulse would need (the prior draft only said "Stripe syncs subscriptions").

## Default Time Window

All Analytics Home metrics, charts, and comparisons use the **last 30 days** by default, compared against the **previous 30 days** for delta badges.

- KPI-style values (Current MRR headline, ring percentages, mix percentages) use the last 30 days.
- The Activity chart uses daily buckets across the visible date range (the current mock spans May 18 – Jun 13, 14 points, roughly every other day).
- Acquisition Mix ranks channels from the last 30 days.
- Revenue Pulse's headline MRR and net-movement badge use the **current subscription month** ("Current MRR · Aug 2026" in the live copy — note this month label is a hardcoded string in the mock, not derived from `Date.now()`); the MRR trend area chart uses the last available months of subscription history (11 months in the mock, Oct → Aug).
- This window discipline is a design choice carried over unchanged from the prior draft: a fixed, consistent window is easier to reason about than every card implying a different range, and matches how Boards/Reports/Subscriptions handle deeper, user-configurable date filtering (Home stays fixed-window; the rest of the product is where users go for custom ranges).

## Page Structure (as implemented)

Reading `AnalyticsFullDashboard()` top to bottom:

1. **Greeting row** — `<Greeting />` component (imported from `./Greeting`), plus, on `sm:` and up, two controls on the right: a checklist toggle button (`ClipboardList` icon, toggles a collapsible `AnalyticsSetupChecklist`) and a "Watch intro" button (`Play` icon, opens a `VideoOverlay` using `TAB_VIDEOS.analytics`).
2. **Collapsible setup checklist** — animated height/opacity, contains `AnalyticsSetupChecklist()`, which renders the shared `SetupChecklist` component with title `"Set up analytics to unlock insights"` and four steps drawn from `ANALYTICS_SETUP_STEPS`:
   - `Connect event tracking` — "Install the Intempt SDK on your web or app" — action `Connect` (pre-marked complete in `initialCompleted`)
   - `Create your first board` — "Build a custom analytics dashboard" — action `Open`
   - `Set up a funnel` — "Track conversion steps from signup to paid" — action `Open`
   - `Review your retention chart` — "Understand where users drop off after activation" — action `Open`
   This checklist is UI-only demo state today (`initialCompleted` is a local `useState<Set>`, not backed by an API); wiring it to real per-workspace setup status is a separate, smaller task from the four analytics cards themselves.
3. **2×2 card grid** — `grid grid-cols-1 gap-3 xl:grid-cols-2`, containing the four `SectionCard`-wrapped cards: **Activity, Audience quality, Revenue pulse, Acquisition mix**, in that order (Activity and Audience quality in the first row, Revenue pulse and Acquisition mix in the second, on `xl:` layouts).
4. **Nothing after the grid.** The page ends there. (See "What Changed" #1 — the old Upgrade Section is gone.)

`SectionCard` is the shared wrapper: `rounded-xl` panel, `var(--content-bg)` background, `var(--border)` border, an optional title row with a `HeadingTooltip` info-icon (small circular `Info` glyph, `stone-200/80` background, hover-triggered dark tooltip bubble at `rgba(24,24,27,0.93)`), and an optional one-line description under the title.

## Shared Component: CardEmptyState

`function CardEmptyState({ text, actionLabel, actionHref, onAction })`, defined once in `HomeView.tsx` (around line 985) and reused identically across all four Home tabs (Design, Marketing, Sales, Analytics) and, within Analytics, across all four cards. Document it once here; each card below just references it plus its own exact copy.

**Structure, top to bottom:**

1. **Logo mark.** A `relative mx-auto overflow-hidden` container sized `144px` wide × `72px` tall (`logoSize = 144`, container height = `logoSize / 2`). Inside it, an absolutely-positioned `<img src="/hq.png" />` at the full `144×144` size — the Intempt brand mark, a glowing blue circular whale-tail logo — clipped by the container's fixed 72px height so only the **top half** of the circular logo is visible (a "sunrise" crop: the image is pinned to `top: 0, left: 0` inside a box exactly half its height, so the bottom half is simply cut off by `overflow: hidden`).
   - The image itself is rendered `filter: grayscale(1)` and `opacity: 0.55` — desaturated and dimmed, consistent with "waiting for data" rather than a fully-rendered brand moment.
   - It also carries its own CSS mask: `mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 52%)` (with the `-webkit-` prefix mirrored). This fades the visible top half smoothly toward the crop line — the logo doesn't get a hard-edged cut, it dissolves into the container's bottom edge.
2. **Shimmer highlight**, layered on top of the same container. A second absolutely-positioned `div`, same `144×144` box, with `background: linear-gradient(to top, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)`, `backgroundSize: 100% 90px`, `backgroundRepeat: no-repeat`. Critically, this highlight band is **masked by the logo PNG's own alpha channel** (`mask-image: url(/hq.png)`, `mask-size: 144px 144px`, `mask-repeat: no-repeat`) — so the white shimmer only lights up pixels where `/hq.png` actually has color/opacity. It cannot bleed into the transparent whale-tail cutout inside the logo or the transparent area outside the circle. `mix-blend-mode: overlay` blends it into the dimmed/grayscale logo underneath rather than sitting as a flat white smear.
   - Animation: `animation: shimmer-sunrise 2s ease-in-out infinite alternate`, where the keyframe (defined in `src/index.css`) is `0% { background-position-y: 27px } 100% { background-position-y: -45px }`. `alternate` plus `ease-in-out` gives a continuous, smooth back-and-forth sweep — the band travels bottom-to-top then reverses top-to-bottom, decelerating naturally at each turnaround, with no pause and no hard cut.
3. **One-line message.** Below the logo, a single `<p>` — `text-xs text-stone-400` (dark: `text-stone-500`), `width: 240px` (wider than the 144px logo — matching a "text wider, logo a step down" sizing rule used the same way across all four Home tabs' empty states). This is deliberately **one plain-language sentence**, not a bold title plus a separate body line.
4. **Optional single action.** Below the text, at most one of:
   - A plain **monochrome text link** with a dotted underline: `text-stone-600 underline decoration-dotted decoration-stone-400 underline-offset-4` (dark: `text-stone-300` / `decoration-stone-500`), no background fill, no brand color — pointing at a real in-app route via `actionHref` (e.g. `/integrations`).
   - OR, in components elsewhere that pass `onAction` instead of `actionHref` (used by the Sales Tasks card, not applicable to any Analytics card), a `<button>` with the identical visual styling that runs a callback (e.g. focuses an inline input) instead of navigating.
   - This is an explicit product decision: **no colored or filled buttons in this empty state** — "monochrome text with dotted underline, not a blue button."

All four Analytics cards render this exact component when `noData` is true; only `text` (and, for Revenue Pulse, `actionLabel`/`actionHref`) differ per card. Exact strings are quoted verbatim in each card section below.

---

## Card 1: Activity

**Purpose:** Shows product-usage direction across the visible window. Answers: is product traffic and usage going up, down, or flat?

**UI elements:**
- Card title `Activity` with a `HeadingTooltip`: *"Used to see overall usage direction from page views, sessions, and active users in the last 30 days."*
- Description line: *"Page views, sessions, and active users over the last 30 days."*
- A combined chart with three series, and a centered legend row below it with colored swatches: `Page views`, `Sessions`, `Active users`.

**Chart type (exact Recharts components used):** `ResponsiveContainer` → `ComposedChart` → `CartesianGrid` (`vertical={false}`, stroke `var(--border)` at 0.5 opacity) → `XAxis` (`dataKey="date"`, font size 9, `interval={2}`, no tick/axis lines) → `YAxis` (font size 9, no tick/axis lines) → `Tooltip` (custom `ChartTooltip`) → one `Area` (Page views) → two `Line`s (Sessions, Active users).

**Exact color values:**
| Series | Value | Why |
|---|---|---|
| Page views | `stroke="#0080FF"`, `fill="rgba(0,128,255,0.08)"` | Intempt primary blue — this is confirmed-real, first-class SDK data (page-view events), so it gets the full-strength brand blue as an `Area` fill for visual weight as the "headline" series. |
| Sessions | `stroke="#7C3AED"` (violet) | A supporting series color, chosen specifically so three overlapping lines stay visually distinguishable — an all-blue chart would be unreadable where lines cross. |
| Active users | `stroke="#F59E0B"` (amber) | Second supporting series color, same reasoning as Sessions. |

Per the palette rule requested for this refresh (blue for confirmed-real primary data, translucent blue for secondary/track fill, grey only for genuinely unconfirmed data, green/red reserved for signed deltas): Sessions and Active users are *not* grey because they are equally real SDK-derived series, just visually differentiated as secondary lines rather than the filled headline area — grey is intentionally not used anywhere on this card since nothing here is unconfirmed.

**Data source:** Intempt JS SDK event stream — automatic page and session events, carrying identified and anonymous profile IDs.

**Required raw fields (per event):** `profileId`, `sessionId`, `pageId`, event timestamp, event name/type. These three identifiers — `profileId`, `sessionId`, `pageId` — are confirmed by the JS SDK docs to be automatically attached to *every* tracked event (see "SDK & Stripe Reference" below); they are the backbone of this entire card.

**Derivations:**
- **Page views** — count auto-tracked page-view events per daily bucket.
- **Sessions** — count distinct `sessionId` values per daily bucket.
- **Active users** — count distinct `profileId` values with at least one eligible event per daily bucket; if identity resolution has run (via `identify`/`alias`), count merged identity rather than raw anonymous IDs.

**Mock data today:** `ANALYTICS_ACTIVITY_DATA`, built by zipping three separate arrays (`PAGE_VIEWS_DATA`, `SESSIONS_DATA`, `ACTIVE_USERS_DATA`) that already exist elsewhere in the file for other charts — 14 points from `May 18` to `Jun 13`. Page views range roughly 60–300/bucket, Sessions roughly 20–220/bucket, Active users roughly 8–40/bucket. There is no comparison-period badge on this card in the live code (unlike the KPI-row concept below).

**Note on a dead-code KPI row:** `ANALYTICS_FULL_KPIS` (around line 1497) defines five bento-style KPI cards — Active users `1.87K` (`-70%`), Page views `4.06K` (`+239%`), Sessions `2.79K` (`+250%`), Current MRR `$25.2K` (`+2.6%`), Events received `1.84M` (`Live`) — but this constant is **never rendered anywhere** in `AnalyticsFullDashboard`. It's leftover from an earlier layout (matching the old draft's "KPI row" step in its recommended full-state layout) that isn't part of the current page. Flag this before building: either resurrect a real KPI row using these five metrics (all independently derivable from the same SDK/Stripe sources documented per-card here) or treat it as dead code to delete.

**Why buildable:** The JS SDK automatically includes `profileId`, `sessionId`, `pageId` on every tracked event (verified). Auto-tracking of page/session events is a stated SDK capability.

**Waiting state:** When `noData` is true, the entire chart+legend block is replaced by `<CardEmptyState text="Page views, sessions, and active users will appear here once your tracked events start flowing in." />` — no action link on this card (nothing to send the user to; connecting tracking is handled by the setup checklist above, not by an inline link here).

---

## Card 2: Audience Quality

**Purpose:** Summarizes whether usage is healthy, not just large. Answers: are people coming back, and how sticky is the audience?

**UI elements:**
- Card title `Audience quality` with tooltip: *"Used to understand audience stickiness without opening the full Engagement board."*
- Description: *"Shows if usage is healthy by combining daily, weekly, monthly, new, and returning users."*
- Three donut rings side by side (DAU, WAU, MAU), each with a centered value/label and its own `HeadingTooltip`.
- Three metric boxes below (New, Returning, DAU/MAU stickiness), each on a `var(--muted)` background tile with its own tooltip.

**Chart type:** Three independent `ResponsiveContainer` → `PieChart` → `Pie` (`dataKey="value"`, `innerRadius="68%"`, `outerRadius="92%"`, `startAngle={90}`, `endAngle={-270}` — i.e., a full-circle donut starting at 12 o'clock and sweeping clockwise, `paddingAngle={2}`, `stroke="var(--content-bg)"` at `strokeWidth={3}` so segments have a subtle gap/border matching the card background) → two `Cell`s per ring (filled value, remaining track).

**Exact color values:**
| Element | Value | Why |
|---|---|---|
| Filled ring segment | `#0080FF` | Confirmed-real primary metric (an actual percentage of active users) — full-strength Intempt blue. |
| Remaining/track segment | `rgba(0,128,255,0.18)` | The translucent-blue "track" convention: the unfilled portion of a ring/bar that represents "the rest of 100%," not a separate data series and not unconfirmed data — so it stays blue-family at low opacity rather than switching to grey. |

**Data source:** Intempt JS SDK event stream; identity resolution via `identify()` and `alias()` where available.

**Required raw fields:** `profileId`, known-user identity (if identified), event timestamp, first-seen timestamp per profile (needed for New vs Returning).

**Derivations:**
- **DAU** (ring, value `2.1K`, `18%`) — distinct active profiles for the latest completed day, or an average daily-active figure across the window; the mock's percentage (18%) reads as *DAU as a share of MAU's underlying base*, consistent with the ring being a simple "how full is this bucket relative to the top bucket" visual, not a literal DAU/(something)=18% formula independent of the other rings.
- **WAU** (ring, value `18.4K`, `58%`) — distinct active profiles in the latest rolling 7-day window.
- **MAU** (ring, value `65.87K`, `92%`) — distinct active profiles across the last 30 days.
- **New** (tile, `49.44K`, `75%`) — profiles whose first-seen timestamp falls inside the last 30 days.
- **Returning** (tile, `16.43K`, `25%`) — active profiles in the last 30 days whose first-seen timestamp predates the current 30-day window. Note `49.44K + 16.43K = 65.87K`, exactly equal to the MAU ring value — the mock data is internally consistent (New + Returning = MAU), which is a good production invariant to preserve.
- **DAU/MAU stickiness** (tile, `3.2%`) — `average DAU / MAU × 100`. Sanity check against the mock: `2,100 / 65,870 ≈ 3.19%`, which rounds to the displayed `3.2%` — confirms the three ring values and the stickiness tile are computed from a single coherent underlying dataset, not independently invented numbers.

**Tooltip copy (verbatim, for reference/reuse):**
- DAU ring: *"Daily active users: unique users active in a single day."*
- WAU ring: *"Weekly active users: unique users active in the last 7 days."*
- MAU ring: *"Monthly active users: unique users active in the last 30 days."*
- New tile: *"Users whose first tracked activity happened in the last 30 days."*
- Returning tile: *"Users who were active before and came back during the last 30 days."*
- Stickiness tile: *"Average daily active users divided by monthly active users. Higher means users return more often."*

**Why buildable:** JS SDK produces profile-level activity; `identify()` and `alias()` (both verified real SDK methods — see below) let anonymous and known users resolve into one coherent profile, which is what makes "New vs Returning" meaningfully different from "any two sessions with different anonymous IDs."

**Waiting state:** `<CardEmptyState text="Daily, weekly, and monthly active users will show up here once enough activity comes in." />` — no action link.

---

## Card 3: Revenue Pulse

**Purpose:** Gives a Stripe-subscription health read without copying the Subscriptions page. Answers: is recurring revenue growing, leaking, or stable this month?

**UI elements:**
- Card title `Revenue pulse` with tooltip: *"Used as the quick subscription health check from MRR, subscriber, churn, and NRR data."*
- Description: *"Shows whether subscription revenue is growing, leaking, or on track this month."*
- Headline `$24.76K` with subtext `Current MRR · Aug 2026` (top-left, absolutely positioned over the chart).
- A net-movement badge, top-right: `-$132.23`, red pill (`bg-red-50 text-red-500`, dark `bg-red-500/10 text-red-300`).
- An MRR trend area chart beneath the headline/badge.
- Three metric tiles below the chart: **Subscribers**, **Net movement**, **NRR**.

**Chart type:** `ResponsiveContainer` → `AreaChart` (`data={ANALYTICS_MRR_TREND}`) → `CartesianGrid` (`vertical={false}`, `strokeOpacity={0.45}`) → `XAxis` (`dataKey="month"`) → `YAxis` (`tickFormatter` renders e.g. `$25K`) → `Tooltip` (`ChartTooltip`) → one `Area` (`dataKey="mrr"`, `activeDot` shown on hover).

**Exact color values:**
| Element | Value | Why |
|---|---|---|
| MRR area line/fill | `stroke="#0080FF"`, `fill="rgba(0,128,255,0.12)"` | Confirmed-real primary series once Stripe is connected — full blue stroke, translucent blue fill (the "area under the line" convention, not a second data series, so it stays in the blue family rather than grey). |
| Net-movement badge (negative) | `bg-red-50`/`text-red-500` light, `bg-red-500/10`/`text-red-300` dark | Signed negative delta — reserved red, per the rule that green/red are used strictly for signed positive/negative movement, never as decorative color. |
| "Net movement" tile value (tone `negative`) | `text-red-500` (dark `text-red-300`) | Same signed-delta rule applied to the tile's numeric value, not just the badge. |
| "NRR" tile note `+4.4pp` (tone `positive`) | plain `text-stone-500` note text, value itself in default `text-stone-900`/`text-stone-100` | Note this is *not* rendered in green even though `tone: "positive"` is set on the underlying data object — the current live code only branches tile-*value* color on `tone === "negative"` (turns it red); positive tone does not turn the value green. This is consistent with the explicit "avoid green KPI badges, even for positive movement" rule carried over from the prior draft — green is intentionally reserved/unused here even where the JS object models a "positive" tone. |
| Subscribers tile | neutral `text-stone-900`/`text-stone-100` | Tone `"neutral"` in the data — a raw count, not a delta, so no color signal at all. |

**Data source:** Stripe, synced into Intempt as a source, plus Intempt's Subscriptions feature (which already aggregates Stripe data into MRR/movement/NRR).

**Required raw fields:** Stripe customer ID, subscription ID, subscription status, subscription start date, cancellation/churn date, invoice amount, recurring amount, currency, billing interval (monthly/annual/quarterly — needed to normalize any interval to a monthly value), plan/product ID, invoice paid status, month bucket.

**Derivations:**
- **Current MRR** — sum active recurring-subscription revenue, normalized to monthly: monthly plans use the monthly price as-is; annual plans divide the annual recurring amount by 12; quarterly/other multi-month intervals divide by the interval's month count.
- **MRR trend** — Current MRR computed per month across subscription history, rendered as the area chart. Mock series (`ANALYTICS_MRR_TREND`): Oct `$15,594` → Nov `$16,766` → Dec `$18,207` → Jan `$19,597` → Feb `$20,711` → Mar `$22,052` → Apr `$22,914` → May `$24,656` → Jun `$25,203` → Jul `$24,895` → Aug `$24,762`. Note the headline `$24.76K` matches the last (Aug) point exactly, and the net-movement badge `-$132.23` is very close to `Aug − Jul = 24,762 − 24,895 = −133` — again, the mock is internally consistent rather than arbitrary, which is worth preserving as an invariant when this becomes real.
- **Net movement (badge + tile)** — month-to-date MRR change: `new business MRR + expansion MRR + reactivation MRR − contraction MRR − churn MRR`. The live UI shows only the net figure and a qualitative note (`Churn higher` / presumably `New business higher` / `Balanced` depending on which side dominates), not the individual components — those live one level deeper, in Subscriptions.
- **Subscribers** (tile, `2,219`, note `Net -7`) — count of active subscribers in the current subscription month, with net change shown as a single signed number: `new subscribers + reactivated subscribers − churned subscribers`. (The prior draft's illustrative breakdown — `6 new + 3 reactivated − 16 churned = -7` — is a plausible decomposition of that same `-7`, but the live card only surfaces the aggregate `Net -7`, not the three components; the components exist in Subscriptions' MRR-movements data, referenced below.)
- **NRR** (tile, `98.9%`, note `+4.4pp`) — Net Revenue Retention: `(starting MRR + expansion MRR − contraction MRR − churn MRR) / starting MRR × 100`. The `+4.4pp` is the percentage-point change vs. the previous comparison period (`current NRR − previous NRR`) — `pp` because it's a direct arithmetic difference between two percentages, not a relative percentage-of-percentage increase.

**Support-tile tooltip copy (verbatim):**
- Subscribers: *"Active paid subscribers from connected Stripe subscription data."*
- Net movement: *"Month-to-date MRR change after new business and churn."*
- NRR: *"Net revenue retention after expansion, contraction, and churn."*

**Why buildable:** Stripe sync (customers, subscriptions, invoices, charges, trials) is a supported Intempt source, and Intempt's Subscriptions feature already computes exactly these aggregates for its own dashboard — Revenue Pulse would consume the same aggregate layer, not invent a new one. See "SDK & Stripe Reference" for the confirmed backend endpoint and confirmed-real field list.

**Waiting state:** This is the *only* card of the four with an action link. `<CardEmptyState text="MRR, subscribers, and NRR will appear here once Stripe starts syncing subscription activity." actionLabel="Check integrations" actionHref="/integrations" />` — a plain dotted-underline text link (not a button) to the real `/integrations` route, matching the CardEmptyState spec exactly (no colored button).

**Important decision carried over from the prior draft:** Do not add a "Goal progress" element to this card by default. Per `CONSOLE_FEATURE_INVENTORY.md`, `mrrGoal`/`subscriberGoal` are unpersisted, client-only state today with no save API — showing goal progress on Home would either be fake or would require building a persistence layer first. Goal progress belongs in Subscriptions (or a future configurable dashboard), not default Analytics Home.

---

## Card 4: Acquisition Mix

**Purpose:** Shows which top channels are driving visitors, without repeating Traffic board's top-10 tables. Answers: which channels matter most right now?

**UI elements:**
- Card title `Acquisition mix` with tooltip: *"Used to summarize Traffic board source and page data without repeating top-10 tables."*
- Description: *"Shows where useful traffic is coming from and which source/page is tied to revenue."*
- A centered pie chart with outside leader-line labels (name + compact count above the line, percentage below it).
- A horizontal legend row under the chart with colored dot + name + count in parentheses, e.g. `Email (1.7K)`.

**Chart type:** `ResponsiveContainer` → `PieChart` → `Pie` (`dataKey="value"`, `nameKey="name"`, `outerRadius={82}`, `innerRadius={0}` — i.e. a true pie, not a donut, unlike the Audience Quality rings — `paddingAngle={2}`, `stroke="var(--content-bg)"`, `labelLine={false}`, custom `label={<AcquisitionPieLabel />}`) → one `Cell` per slice → `Tooltip` (`ChartTooltip`). `AcquisitionPieLabel` is a hand-built SVG label renderer: it draws a three-point leader-line `path` from just outside the pie edge to a fixed offset, then two `text` elements — the name+count, and the percentage on the line below it — anchored `start` or `end` depending on which side of the circle the slice sits.

**Exact color values:** `ANALYTICS_DONUT_COLORS = ["#0080FF", "#6BAEFF", "#A7CCFF", "#D7E9FF"]`, applied by array index:
| Slice | Color | Why |
|---|---|---|
| Email (1st, largest) | `#0080FF` | Full-strength Intempt blue for the largest/primary confirmed-real slice. |
| Icon (2nd) | `#6BAEFF` | A lighter step down the same blue ramp — not a different hue, not grey — because this is equally real, confirmed channel data, just a smaller share; the palette signals "same trustworthy data, less of it," not "less certain data." |
| Push (3rd) | `#A7CCFF` | Lighter still, same ramp, same reasoning. |
| (4th, unused today) | `#D7E9FF` | Reserved for a future `Other`/overflow slice if a 4th+ channel needs representation — the palette already anticipates it even though the current mock only has 3 channels. |

This is a deliberate "monochromatic blue ramp for a single confirmed-real distribution" pattern, distinct from the Activity card's blue/violet/amber palette (which differentiates three *different metrics*, not shares of one metric).

**Data source:** Intempt JS SDK event stream; traffic source/channel attribution fields (referrer, campaign/UTM) attached to sessions.

**Required raw fields:** event timestamp, `profileId`, `sessionId`, channel/source, referrer, campaign/UTM fields if present.

**Derivations:**
- **Top sources** — group sessions or users by normalized acquisition channel over the last 30 days. Mock (`ANALYTICS_ACQUISITION_MIX`): `Email` 1,700 (`1.7K`, 55%), `Icon` 1,300 (`1.3K`, 42%), `Push` 92 (`92`, 3%). Percentages sum to exactly 100% across these three — i.e. today's mock computes share against the visible top-3 total, not against all channels including an implicit "Other." If a real implementation adds a 4th "Other" slice for long-tail channels, the percentage formula must change to `source count / all-channels total × 100`, and the reserved 4th color (`#D7E9FF`) is there for exactly that.
- **Display value** — compact-formatted count (`1.7K`, `1.3K`, `92`).

**Why buildable:** Traffic board already computes "Traffic by Channel" with user counts; Acquisition Mix takes the top 3 rows of that same computation and renders them as a compact pie instead of a table.

**Open question flagged explicitly (see SDK reference below):** the JS SDK doc confirms "auto-tracking" broadly but does not enumerate exactly which UTM/referrer/device/browser properties are captured automatically versus requiring manual `track()` calls with custom `data`. This is the one real gap for this card specifically — channel/source/referrer/UTM field names need to be confirmed against the actual event schema (or Sources/Traffic-board implementation) before this card can be wired to real data with full confidence in field names.

**Waiting state:** `<CardEmptyState text="Traffic channels will rank here once sessions include referrer or UTM data." />` — no action link.

---

## Color System

A single restrained palette runs across all four cards, matching the rule requested for this refresh:

- **`#0080FF`** (Intempt primary blue) — used for every confirmed-real primary data series/value: the Page-views area (Activity), the filled portion of every Audience-Quality ring, the MRR area (Revenue Pulse), the largest/primary slice of Acquisition Mix. Blue is the default for "this is real, first-class data," not decoration.
- **`rgba(0,128,255,0.18)`** — the translucent-blue "track" color for the *unfilled/remaining* portion of a ring (Audience Quality). Signals "the rest of 100%, part of the same real metric," never "unconfirmed."
- **`rgba(0,128,255,0.08)`** and **`rgba(0,128,255,0.12)`** — even lighter translucent-blue area fills under line charts (Activity's Page-views area, Revenue Pulse's MRR area) — the "area under a real trend line" convention.
- **Blue ramp (`#0080FF` → `#6BAEFF` → `#A7CCFF` → `#D7E9FF`)** — used only in Acquisition Mix, where multiple slices are shares of *one* confirmed-real metric (traffic count); lighter steps mean "smaller share of the same trustworthy data," not lower confidence.
- **`#7C3AED`** (violet) and **`#F59E0B`** (amber) — the two exceptions to the blue-only rule, used exclusively as Activity's secondary line-series colors (Sessions, Active users), and only because three overlapping same-color lines would be unreadable. These are not reused anywhere else on the page.
- **Red** (`text-red-500`/`bg-red-50` light, `text-red-300`/`bg-red-500/10` dark) — reserved strictly for signed **negative** deltas: Revenue Pulse's net-movement badge and its "Net movement" tile value when the tone is negative. Never used decoratively.
- **Green** — deliberately **not used anywhere** on this page, even for the signed-positive `NRR` tone (`+4.4pp`) — carried over unchanged from the prior draft's explicit rule ("avoid green KPI badges on Analytics Home, even for positive movement, to keep the card system visually consistent"). Positive values render in plain neutral text (`text-stone-900`/`text-stone-100`), not green.
- **Grey/stone** — reserved for genuinely neutral or unconfirmed elements only: axis labels and tick text (`#94a3b8`), card borders (`var(--border)`), tooltip info-icons, muted tile backgrounds (`var(--muted)`), and the `CardEmptyState` copy/logo treatment itself (grayscale + reduced opacity is the *visual signature of "no data yet"* — it is the one place grey is used to mean "unconfirmed," by design). It is never used as a stand-in for a real data series that just hasn't been colored yet.

## Implementation Guardrails

- Use only supported metrics from the JS SDK event stream, Analytics reports/Boards, Subscriptions, and Sources/Attributes. Do not invent mock deal/account/user-detail metrics for this page.
- Do not show Revenue Pulse as populated unless a Stripe (or equivalent revenue) source is actually connected and has synced subscription history — render `CardEmptyState` instead, exactly as implemented.
- Do not resurrect the dead-code `AnalyticsDashboard()` field set (Event types, Device/browser mix, Trial-to-paid, Churn) as if it were part of this page's spec — it isn't rendered anywhere today. If those metrics are wanted back, that's a scope decision to make explicitly, not something to infer from leftover constants.
- Do not re-add the removed Upgrade Section. The page ends after the 2×2 grid.
- Keep the four-card, non-KPI-row structure that is actually live today unless a KPI row is explicitly decided on (see the `ANALYTICS_FULL_KPIS` dead-code note under Card 1) — don't assume it belongs back in without a decision.
- `CardEmptyState` action links must stay plain dotted-underline monochrome text pointing at real in-app routes (or a callback), never a colored/filled button — this is an explicit, cross-tab product decision, not a per-card style choice to revisit.
- Preserve the color rules above exactly: blue for confirmed-real primary data (full-strength) and its translucent variants for tracks/fills, violet/amber only as Activity's two secondary line colors, red only for signed negative deltas, and no green anywhere on this page.

## SDK & Stripe Reference

**Intempt JS SDK** (verified from `https://docs.intempt.com/js-sdk`, the redirect target of `https://intempt.com/docs/api/sdk/javascript`):

- Every tracked event automatically carries three identifiers, generated/retrieved by the SDK's auto tracker: **`profileId`**, **`sessionId`** (current session), and **`pageId`** (current page). These three fields are the backbone of Activity, Audience Quality, and Acquisition Mix on this page — every derivation above that counts "distinct users/sessions/pages" is counting distinct values of one of these three fields.
- Public methods and exact signatures confirmed on that page:
  - `identify(userId, eventTitle?, userAttributes?, data?)`
  - `track(eventTitle, data)` — `data` is required and must be non-empty
  - `record(eventTitle, userId?, accountId?, userAttributes?, accountAttributes?, data?)`
  - `alias(userId, anotherUserId)` — merges anonymous and known identities. This is specifically what makes "New vs Returning" (Audience Quality) and an identity-resolved "Total users" concept possible; without `alias`, a returning anonymous visitor who later logs in would otherwise look like two separate profiles.
  - `group(accountId, eventTitle?, accountAttributes?)`
  - `consent(action, validUntil, email?, message?, category?)`
  - `productAdd` / `productOrdered` / `productView`
  - `logOut` / `optIn` / `optOut` / `isUserOptIn`
  - `recommendation(id, quantity, fields)`
- **Forbidden event titles** (reserved internally, cannot be used as custom event names): `'auto-track'`, `'view page'`, `'leave page'`, `'change on'`, `'click on'`, `'submit on'`, `'identify'`, `'consent'`.
- **Open gap, flagged explicitly:** the fetched doc text does **not** enumerate exactly which device/browser/UTM/referrer properties are auto-captured beyond mentioning "auto-tracking" generally. This is the same honest caveat the original draft already carried, and it is the specific open question for Acquisition Mix's channel/referrer/UTM field names (see Card 4 above) — those exact property names need to be confirmed against the real event schema or the Sources/Traffic-board implementation before wiring this card to production data.
- A separately-named page, `/docs/api/sdk/tracking`, returned a 404 / was not separately reachable. Its content for `track()`/events appears to already be covered within the same JS SDK page referenced above — there is no separate "tracking" doc with additional content; stating otherwise would be inventing a source that doesn't exist.

**Journey analytics** (user-referenced `https://intempt.com/docs/guides/journeys/journey-analytics`; the live canonical page appears to be `https://help.intempt.com/journeys/overview`, but a direct fetch of that host failed on a TLS/SSL error during this research pass — the following is therefore from a search-engine-indexed summary of that page, not a direct read, and field names should be treated as reliable-but-unconfirmed pending a successful direct fetch): journey analytics tracks **Triggered** (users who triggered the journey), **Converted** (users who completed the journey's conversion event), **Conversion rate** (`converted / triggered × 100`), and **Days to convert (avg)**. Stated use-case framing includes Email Open Rates, Replies and Engagement, stage-to-stage Journey Conversion Rates, and Funnel Drop-Offs. This is mostly a cross-reference for the "buildable if reports/funnels are configured" category in the broader Analytics Home reasoning (funnel/retention cards, if ever added back to this route) — Revenue Pulse and Activity, as they exist on this page today, don't depend on journey analytics directly.

**Stripe (for Revenue Pulse):** the actual webhook/object types needed, named explicitly rather than as a generic "Stripe syncs subscriptions" statement:
- `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` (the last of these is churn)
- `invoice.paid` (MRR realization — this is the event that actually confirms recurring revenue was collected, as opposed to merely scheduled)
- `invoice.payment_failed`
- `checkout.session.completed` (new subscriber / trial start)
- Plus the underlying Stripe objects themselves: `Customer`, `Subscription`, `Invoice`, and `Plan`/`Price` (the last of these carries the billing interval — monthly, annual, quarterly — needed to normalize any plan into a monthly MRR figure, per the Current-MRR derivation in Card 3).

**Confirmed real backend for Revenue Pulse**, per `CONSOLE_FEATURE_INVENTORY.md`: Intempt already exposes `useSubscriptionQuery().fetchMovementsQuery` → `GET {org}/projects/{project}/home/mrr`, which returns confirmed-real fields: **Current MRR, Net MRR Movement, New Business MRR, Churn MRR, Total Subscribers, Net Change, New, Churned, NRR%, Trial→Paid conversion%, Expansion Revenue**. This is the endpoint Revenue Pulse should draw from — it's a superset of what the card currently displays (Subscribers / Net movement / NRR), meaning the card is a deliberately-trimmed view of already-real backend data, not something requiring new backend work. The inventory also flags that **`mrrGoal`/`subscriberGoal` are unpersisted, client-only state with no save API** — the reason this PRD explicitly recommends against adding a "Goal progress" element to Revenue Pulse until that persistence gap is closed.

## External Source References

- Intempt JS SDK docs: `https://docs.intempt.com/js-sdk` (redirect target of `https://intempt.com/docs/api/sdk/javascript`)
- Journey analytics (indirect, search-indexed summary only — direct fetch blocked by TLS/SSL): `https://help.intempt.com/journeys/overview`, as referenced from `https://intempt.com/docs/guides/journeys/journey-analytics`
- Intempt Analytics overview: `https://www.intempt.com/analytics`
- Intempt Sources docs: `https://help.intempt.com/en/articles/10430584-sources`
- Create source docs: `https://docs.intempt.com/create-source-1819041m0`
- Intempt mental model: `https://docs.intempt.com/how-intempt-works-a-one-page-mental-model-1941491m0`
- Confirmed-real backend inventory: `CONSOLE_FEATURE_INVENTORY.md` (Subscription analytics section — `useSubscriptionQuery().fetchMovementsQuery`, `GET {org}/projects/{project}/home/mrr`)
- Live implementation, source of truth for every field/color/copy string in this document: `/Users/vrana/Desktop/intempt-code/react-dash/src/components/HomeView.tsx` — key symbols: `AnalyticsFullDashboard` (the live page), `CardEmptyState` (shared empty-state component), `ANALYTICS_ACTIVITY_DATA`, `ANALYTICS_AUDIENCE_RINGS`, `ANALYTICS_MRR_TREND`, `ANALYTICS_ACQUISITION_MIX`, `ANALYTICS_DONUT_COLORS`, `AcquisitionPieLabel`, `ChartTooltip`, `SectionCard`, `HeadingTooltip`, `AnalyticsSetupChecklist`/`ANALYTICS_SETUP_STEPS`; plus the now-dead `AnalyticsDashboard` and its constants (`ANALYTICS_EVENT_TYPES`, `ANALYTICS_DEVICE_MIX`, `ANALYTICS_REVENUE_HEALTH`, `ANALYTICS_AUDIENCE_SPLIT`), flagged above as unused; and `src/index.css` for the `shimmer-sunrise` keyframe used by `CardEmptyState`.
- Prior draft this document refreshes (not modified, not deleted): `/Users/vrana/Desktop/homepages-source.md`
