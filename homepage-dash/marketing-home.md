# Marketing Home Source Reasoning

This document explains how every card, number, chart, and badge on the Marketing Home dashboard is derived, what it needs to be real (not mocked), and the reasoning behind each design decision made while building it. It mirrors the structure of `homepages-source.md` (the Analytics Home doc), applied to Marketing.

Route: `/home?tab=marketing/full`
Implementation: `src/components/HomeView.tsx` — `MarketingHomeDashboard()` and its child card components.

This is a refresh of an earlier version of this document. Section-by-section, the content below has been re-verified line-for-line against the current state of `HomeView.tsx`. Two things changed materially since the last pass: (1) every card now has a real, implemented empty/waiting state — this used to be an open gap and is now documented as shipped; (2) a few mock values, colors, and the page's own layout list had small drift against the live code, which is corrected below with exact quoted strings and hex values. Anywhere the current code disagrees with what an earlier draft of this doc claimed, the live code wins and the discrepancy is called out explicitly rather than silently fixed, so the drift itself is on the record.

## Default Time Window

- Send performance and Channel mix use the **last 30 days**, matching the Analytics Home convention.
- Latest journeys and Journey anomaly detection use the **last 24 hours** (these are "is something happening right now" surfaces, not trend surfaces).
- Top segments has no explicit window in the UI today; in production it should use the same 30-day window as the rest of Home for consistency.

Reasoning: Home should give one consistent "recent operating snapshot" period per the Analytics Home doc's own rule — trend cards use 30 days, health/status cards use 24h, and nothing on Home should silently use a different implied range without saying so.

## Page Layout (current, top to bottom)

1. Greeting row (`<Greeting />`) + setup checklist toggle (`ClipboardList` icon button) + "Watch intro" button (opens `<VideoOverlay>`, a modal overlay, not an inline hero — matches Analytics Home's header pattern).
2. Collapsible setup checklist (`MarketingSetupChecklist`, wraps the shared `SetupChecklist` primitive): title **"Get your marketing engine ready"**, four steps — *Connect your catalog* ("Sync products and feeds for personalization", action "Connect"), *Create your first journey* ("Design a multi-step automation in the canvas", action "Open"), *Launch an experience* ("Deploy an onboarding flow or popup to your product", action "Open"), *Define an audience segment* ("Target users by behavior, attributes, or lifecycle", action "Open") — with `connect-catalog` pre-marked complete. Collapsed by default; expands via a `max-height`/`opacity` transition when the checklist button is toggled.
3. 2×2 grid (`xl:grid-cols-2`): **Send performance**, **Channel mix**, **Latest experiments**, **Latest journeys**.
4. 2-column row (`lg:grid-cols-2`): **Top segments**, **Journey anomaly detection**.
5. *(Disabled, see Appendix)* Segment engagement map — built, then commented out (`{/* <MarketingSegmentMapCard /> */}`).

**Correction from the previous draft of this doc:** an earlier version of this list included a step 4, "Upgrade strip," between the card grid and the disabled scatter card. There is no upgrade strip anywhere in `HomeView.tsx` today — it isn't rendered by `MarketingHomeDashboard()`, and no component named anything like `UpgradeStrip` exists in the file. Either it was removed at some point after that draft was written, or it never shipped and the draft was describing a plan rather than the live page. Either way, don't assume it's on this page — the six cards above (four in the top grid, two in the row below) plus the commented-out scatter card are the entire page today.

This mirrors the Analytics Home philosophy directly: a small set of high-quality composite cards instead of a dense grid of many small charts, with Journeys and Experiments — Intempt's two flagship Marketing products — each getting their own dedicated card.

---

## Shared UI Convention: the tooltip-icon pattern (`HeadingTooltip`)

Every card title on Marketing Home (and on every other Home tab, and on the Integrations page's table column headers, which is where the pattern originates) uses the same small info-icon affordance for "what is this card / what does this number mean":

```tsx
function HeadingTooltip({ text }: { text: string }) {
  // a small grey circular button...
  <span className="flex h-3.5 w-3.5 ... rounded-full bg-stone-200/80 text-stone-400 ...">
    <Info size={9} />
  </span>
  // ...that on hover shows a dark pill tooltip below it
  <span style={{ background: "rgba(24,24,27,0.93)", backdropFilter: "blur(4px)" }} ...>
    {/* + a small triangular caret pointing up at the icon */}
    {text}
  </span>
}
```

Concretely: a `h-3.5 w-3.5` circular button, `bg-stone-200/80` (dark mode: `bg-white/10`), containing a Lucide `Info` icon at `size={9}`. On hover (`onMouseEnter`/`onMouseLeave` driving local `useState`), a dark pill (`rgba(24,24,27,0.93)`, backdrop-blur, white text, `text-xs`) appears below the icon with a small CSS-border triangular caret pointing back up at it. This is a single shared component (`HeadingTooltip`) — every card-title tooltip and every inline stat tooltip on Home (and on Integrations) renders through it, so a change to the pattern is a one-place edit.

On this page specifically, it's wired into every `SectionCard`'s `tooltip` prop (see each card's exact tooltip copy below) and into the Journey anomaly card's manually-composed header (since that card doesn't use `SectionCard`'s `title`/`tooltip` props — see Card 6).

---

## Shared Component: `CardEmptyState` — the real "connected, not enough data yet" state

**This is the biggest change since the previous version of this document.** The earlier draft's closing line said, in effect, "none of the waiting-state logic is implemented yet — every card renders its mock data unconditionally." That is no longer true. It has been fully built and is live on every card on this page (and identically on every other Home tab).

**How it's wired:** `MarketingHomeDashboard({ noData })` receives a single `noData: boolean` prop and forwards it unchanged to all six cards: `MarketingSendPerformanceCard`, `MarketingChannelMixCard`, `MarketingLatestExperimentsCard`, `MarketingLatestJourneysCard`, `MarketingSegmentsCard`, `MarketingAnomalyCard`. Each card does its own `{noData ? <CardEmptyState .../> : <realContent/>}` branch internally — there's no single wrapper that swaps out the whole card; each card owns its own empty copy and (optionally) its own call-to-action.

`noData` itself is driven by the URL. `HomeView`'s top-level router reads `tab` from the query string as `"<tab>/<previewState>"` — e.g. `/home?tab=marketing/full` → `tab="marketing"`, `previewState="full"`. Three states exist:
- `full` (or no suffix) → `noData={false}` → every card renders its real (mock) chart/list content. This is the state described in the rest of this document.
- `partial` → `noData={true}` → every card renders `CardEmptyState` instead of its content. This is the state this section describes. Reachable at `/home?tab=marketing/partial`.
- `empty` (or `1`) → routes to an entirely different, page-level component, `EmptyHomeDashboard`, instead of `MarketingHomeDashboard` at all. This is the "nothing connected to this workspace whatsoever" state — a full-bleed hero with a setup video, the same setup checklist, and an integrations callout (for Marketing: title "Connect marketing sources", body "Sync catalog, site activity, audiences, journeys, and more.", linking to `/integrations`, with HubSpot/SendGrid/Intempt-JS/Shopify logos). `CardEmptyState` is *not* used here — this is a distinct, coarser-grained state for "no source connected at all," versus `CardEmptyState`'s "connected, but this specific card doesn't have enough of its own data yet." Reachable at `/home?tab=marketing/empty`.

**What `CardEmptyState` actually renders**, in full visual detail:

1. **Brand mark.** The Intempt logo (`/hq.png` — a glowing blue circular whale-tail mark), at a native size of 144px (`logoSize = 144`). It's rendered `filter: grayscale(1)` and `opacity: 0.55` — desaturated and dimmed so it reads as "waiting," not as a normal branded state.
2. **The "sunrise" crop.** The logo sits inside a wrapper `div` sized `144px × 72px` (`height: logoSize / 2`) with `overflow: hidden`. Since the logo image itself is still laid out at its full `144×144` inside that shorter box, only the *top half* of the circular mark is visible — cut off cleanly at the horizontal midline, like a sun rising over a horizon. On top of that hard crop, the image itself also carries a CSS mask — `mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 52%)` — so the visible top half doesn't end in a hard edge; it fades out smoothly as it approaches the crop line, rather than being sliced flat by the `overflow: hidden` boundary.
3. **The shimmer.** A second, absolutely-positioned layer sits on top of the (cropped) logo, same `144×144` box. It's a soft light band — `linear-gradient(to top, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)` — sized to `100% 90px` (so the band is 90px tall, narrower than the full 144px logo) and set to `background-repeat: no-repeat`. Critically, this gradient layer is itself masked by `mask-image: url(/hq.png)` (`mask-size: 144px 144px`, `mask-repeat: no-repeat`) — meaning the browser uses the *PNG's own alpha channel* as the stencil. The shimmer band can only ever become visible where the logo artwork itself has non-transparent pixels; it can never bleed into the whale-tail's transparent cutout shape or into the square area outside the circular mark. The layer is composited with `mix-blend-mode: overlay`, so it lightens/darkens the grayscale logo underneath rather than sitting as a flat white smear on top of it.
4. **The animation.** `animation: shimmer-sunrise 2s ease-in-out infinite alternate`, where the keyframe (defined in `src/index.css`) is simply:
   ```css
   @keyframes shimmer-sunrise {
     0%   { background-position-y: 27px; }
     100% { background-position-y: -45px; }
   }
   ```
   Combined with `alternate`, this drives the light band's vertical position back and forth between `27px` and `-45px` forever, `ease-in-out` — a continuous, smooth sweep bottom-to-top-to-bottom with no pause and no hard cut at the loop boundary (the `alternate` direction reverses smoothly rather than snapping back to `0%`).
5. **The message.** Below the logo, one single line of plain-language, muted copy (`text-stone-400`, `text-xs`), fixed at `width: 240px` — deliberately wider than the 144px logo above it, so the text block doesn't feel cramped under the narrower graphic. There is no separate bold title + body text split here — it's one sentence, in one weight, doing the whole job (e.g. "Channel share will appear here once you send across email, SMS, push, or in-app.").
6. **The optional action.** If the card supplies an `actionLabel` plus either `actionHref` or `onAction`, one link/button appears below the message: `text-xs font-medium text-stone-600`, `underline decoration-dotted decoration-stone-400 underline-offset-4`, hover darkens to `text-stone-800`. This is explicitly a plain text link, not a colored or filled button — the empty state as a whole is deliberately low-contrast/quiet (grayscale logo, muted text, dotted-underline text link) so it reads as "nothing to act on urgently yet," distinct from the app's normal blue call-to-action buttons.

This is one shared component (`CardEmptyState`, defined once in `HomeView.tsx`) used identically across all four Home tabs (Analytics, Marketing, Design, Sales) — every card on every tab that can be in a "connected but not enough data" state renders through this exact same visual, just with its own `text`/`actionLabel`/`actionHref`. It is documented once here rather than per-card.

### Exact current empty-state copy per card on this page

| Card | `noData` copy (`text`) | `actionLabel` | `actionHref` |
|---|---|---|---|
| Send performance | "Sends, opens, and clicks will chart here once your first messages go out." | "Create journey" | `/journeys` |
| Channel mix | "Channel share will appear here once you send across email, SMS, push, or in-app." | *(none)* | *(none)* |
| Latest experiments | "Launch an A/B test or personalization to see it show up here." | "Create experience" | `/experiences` |
| Latest journeys | "Build an automated journey to see send activity show up here." | "Create journey" | `/journeys` |
| Top segments | "Segments will rank here once there's enough activity to measure engagement." | *(none)* | *(none)* |
| Journey anomaly detection | "We'll flag unusual send volume or open rate here once there's enough send history." | *(none)* | *(none)* |

Two of these three action links resolve to the same target (`/journeys`) for two different cards, and one resolves to `/experiences` — this reuse is intentional, both empty states are pointing at the same underlying "go make something happen" action.

**Correction (verified after the initial draft of this document):** an earlier pass of this document claimed `/journeys` and `/experiences` were unregistered dead-end routes, based on a literal string search for `path="/journeys"` in `App.tsx` that came up empty. That check was incomplete. `App.tsx` also mounts a generic route generator — `DASHBOARD_VIEW_KEYS.map(view => <Route path={`/${view}`} element={<DashboardView view={view} />} />)` — and `DASHBOARD_VIEW_KEYS` (defined in `src/lib/dashboardRoutes.ts`) includes `"journeys"` and `"experiences"` (alongside `"deals"`, `"meetings"`, `"integrations"`, `"asset-library"`, and others). So both `/journeys` and `/experiences` do resolve to a real `DashboardView`, and both empty-state CTAs on this page are live, not dead ends. Retracted; flagged here explicitly so the false claim isn't propagated into any downstream summary.

---

## Card 1: Send Performance

**Purpose:** Overall send-channel health trend. Answers "is our messaging volume and engagement going up, down, or flat?"

**Exact current copy:** title **"Send performance"**; description **"Daily delivery volume and response quality across all channels over the last 30 days."**; tooltip **"Used to see overall send health. Click a series in the legend to isolate it."**

**UI:** Card title, tooltip, description. `Recharts AreaChart` with three stacked `Area` series (Sends / Opens / Clicks) over 30 daily buckets. A custom legend below the chart is *interactive* — each legend button toggles that series' visibility via the `hide` prop on `<Area>`, and dims itself to 40% opacity (`opacity-40`) when off. This isn't Recharts' built-in `<Legend>`; it's a plain button row wired to local `useState<Set<string>>` state, which is why it can persist styling (dimmed label) independent of the chart's own re-render.

**Chart type:** `AreaChart` (Recharts), margin-adjusted for a compact Y-axis (`margin={{ top: 8, right: 8, bottom: 0, left: -18 }}`).

**Exact series colors:** Sends — stroke `#0080FF`, fill `rgba(0,128,255,0.06)`. Opens — stroke `#64748b` (slate gray), fill `rgba(100,116,139,0.06)`. Clicks — stroke `#16a34a` (green), fill `rgba(22,163,74,0.06)`. Note this against the Color System section below: the Clicks series being green here is *not* a signed-delta usage of green (the page's stated rule for when green is meaningful) — it's simply a third distinct hue needed to tell three simultaneously-plotted series apart, the same practical reasoning as the disabled scatter chart's categorical palette, just applied to a line/area chart instead of a scatter plot. Worth reconciling if the "green/red only for signed deltas" rule is meant to be airtight, but as shipped it isn't currently violated in a way that reads as confusing — it just isn't literally true as an absolute rule.

**Data source (real):** Journeys + Experiences send events across all channels (Email/SMS/Push/In-app), the same event stream that powers the "Channel mix" card and the Journeys product's own per-journey Sent/Opens/Clicks columns.

**Derivation:**
- `sends[date]` = count of send events with `timestamp` in that day's bucket, across all journeys/channels.
- `opens[date]` = count of open events attributed to sends from that day (or opened-that-day, depending on attribution model chosen).
- `clicks[date]` = count of click events, same attribution logic as opens.

No ratio/formula beyond daily counts — this card is a raw volume trend, not a rate card.

**Current mock:** `SENDS_CHART_DATA`, 30 hand-written daily rows, `Jun 13` – `Jul 12`. Representative rows: `Jun 13: sends 820, opens 349, clicks 64`; `Jun 22: sends 1200, opens 511, clicks 94` (the peak day in the series); `Jul 12: sends 1000, opens 426, clicks 78`. Opens run consistently at roughly 42–43% of sends and clicks at roughly 7–8% of sends throughout the series — the mock data holds a constant implied open-rate/click-rate rather than varying it day to day, which is worth knowing if someone eyeballs this chart expecting to see rate volatility, not just volume volatility.

**Empty state (implemented):** see the shared `CardEmptyState` section above. Copy: "Sends, opens, and clicks will chart here once your first messages go out." Action: "Create journey" → `/journeys` (route gap noted above).

---

## Card 2: Channel Mix

**Purpose:** Which channel carries volume vs. which one actually converts to revenue. Answers "am I over-indexed on a channel that doesn't pay off?"

**Exact current copy:** title **"Channel mix"**; description **"Share of sends and attributed revenue across active channels over the last 30 days."**; tooltip **"Used to see which send channels carry volume versus which ones actually convert to revenue."**

**UI:** Donut (`PieChart` + `Pie`, `innerRadius: 0` — technically a pie, styled like a donut via `paddingAngle={2}` and a 3px stroke matching the card background), each slice labeled with a leader-line callout (`MarketingChannelPieLabel`, an SVG `<path>` + two `<text>` nodes) showing `{channel} ({pct}%)` on the first line and `${revenue/1000}K rev` on the second. A horizontal, single-row legend underneath shows a **square color swatch** next to `{channel} ({count})`, e.g. "Email (18,400)".

**Chart type:** `Pie`/`Cell` with a custom `label` render-prop. Note: Recharts withholds pie labels until the slice-entry animation finishes internally — if you screenshot/test this immediately on mount, the leader-line labels will appear to be missing. They aren't; they just haven't animated in yet.

**Exact current colors — a correction to the page's own "all blues" rule:** `CHANNEL_MIX` assigns each channel its own distinct hue, and both the pie slices and the legend swatches below use that same per-channel color (not a shared blue): Email `#0080FF` (blue), SMS `#C37EE5` (purple/lilac), Push `#59B277` (green), In-app `#FFC44D` (amber). An earlier draft of this document's Color System section asserted that "channel-mix legend swatches" follow the page-wide "all blues" convention — that is not what the live code does, and it shouldn't be, for the same reason the disabled scatter chart is exempted from that rule: a donut chart's slices, like a scatter plot's points, are all visible simultaneously on a 2D surface with no inherent ordering to lean on, so color is doing real identification work here, not decoration. See the revised Color System section below — this card is now documented as the *second* legitimate exception to "all blues," alongside the scatter chart.

**Data source (real):** Same send-event stream as Send performance, grouped by channel. Revenue-per-channel requires attribution: a conversion/purchase event linked back to the channel that drove the send (last-touch or multi-touch, matching how Attribution works elsewhere in Analytics).

**Derivation:**
- `count[channel]` = send events where `channel = X` in the window.
- `pct[channel]` = `count[channel] / sum(count) * 100`.
- `revenue[channel]` = sum of attributed revenue from conversions traced back to sends on that channel.

**Current mock:** `CHANNEL_MIX` — 4 static rows: Email `count 18,400 · pct 74 · revenue $86,400`; SMS `count 3,800 · pct 15 · revenue $34,200`; Push `count 1,700 · pct 7 · revenue $9,600`; In-app `count 900 · pct 4 · revenue $6,100`. `pct` is hand-set to sum to a clean 100 (74+15+7+4), not computed from `count` — the actual count-derived shares are 74.2% / 15.3% / 6.9% / 3.6%, close to but not identical to the hardcoded values. In production `pct` must be derived, never hardcoded independently of `count`. (Side note: the four channel counts sum to exactly 24,800 — the same total as the unrelated `ENGAGEMENT_FUNNEL` mock's "Sent" stage elsewhere in the file. This looks like it may be intentional cross-referencing the way Latest Journeys' totals were deliberately tied to the Anomaly card's current value — but if so it isn't mentioned anywhere in code comments, so treat it as a coincidence unless/until confirmed otherwise.)

**The important honesty flag for this card (new — not in the previous draft):** even if the send-event side of this card (counts, `pct`) were wired to real data today, the **revenue** half is not shippable yet. Per the console feature inventory, the real codebase's `useBusinessPerformanceSummary.service.ts` hardcodes `revenuePerRecipient`, `emailRevenue`, `smsRevenue`, and `pushRevenue` to `0` — these are the exact fields a real per-channel revenue split would need, and they are currently placeholders, not computed values, in the production service this card would have to call. So "per-channel revenue" — the entire right half of every callout label and legend context on this card (the `$X.XK rev` figures) — is blocked on real backend work that hasn't happened yet, independent of anything on the frontend. This is a materially different situation from "the UI shows mock data that could be wired to a real endpoint" — the real endpoint itself currently returns zero for this field.

**Possible refinement (not implemented):** if only one channel is connected, this card should probably not render as a "mix" at all (a 100% single-slice donut is not useful) — show a single-channel summary instead. Today, the connected-but-thin-data case is handled generically by the shared `CardEmptyState` (text: "Channel share will appear here once you send across email, SMS, push, or in-app."), which is a reasonable stand-in but doesn't specifically handle the "exactly one channel connected" case differently from "zero channels connected."

---

## Card 3: Latest Experiments

**Purpose:** What's actively being tested right now and how complex each test is. Answers "what's running, and is it simple (A/B) or more involved (multivariate)?"

**Exact current copy:** title **"Latest experiments"**; description **"Your 4 most recent experiments and how many variants each is testing."**; tooltip **"Used to see what's actively being tested right now and how many variants are in play."**

**UI:** Plain row list, 4 items, no chart. Each row: blue icon badge (`Shuffle` icon, `text-blue-500` on a `rgba(0,128,255,0.08)` tinted square — intentionally the same blue treatment as the Journeys icon, not a distinct accent color, per the page's "all blues" rule for row-list category icons), experiment name, a neutral **variant-count pill** (`MarketingCountBadge`, reused across three different cards for consistency), and a **status pill** (`MarketingStatusPill`) reading `Winning` or `Running` (capitalized via CSS `capitalize` on the pill's span — the underlying data string stored in `LATEST_EXPERIMENTS` is lowercase `winning`/`running`; capitalization is a presentation-layer transform, not a change to the source strings).

**Data source (real):** Intempt Experiences. Variant count = `variants.length` on the experiment config. Status = the experiment's own `status` field (`winning` once the Statistics Engine has declared a winner, `running` otherwise). Per the console feature inventory, the real surface for this is `useExperiencesQuery()` — an experiment list query that would return exactly this shape (name, status, variant count) for a real workspace.

**Derivation:** No formulas — this is a direct pass-through of experiment metadata, sorted by most-recently-created/updated, sliced to 4.

**Current mock:** `LATEST_EXPERIMENTS` — 4 static rows: "Hero CTA color" (3 variants, winning), "Pricing layout" (2 variants, running), "Onboarding tips" (2 variants, winning), "Checkout copy test" (2 variants, running).

**Note on scope:** This card deliberately does **not** show lift %, conversion rate, or confidence intervals (an earlier version of this card did, with a bar chart + error bars). It was intentionally simplified down to "what's running + how many variants" per direct request — the richer statistical version is not part of the current page.

**Empty state (implemented):** "Launch an A/B test or personalization to see it show up here." Action: "Create experience" → `/experiences` (route gap noted above).

---

## Card 4: Latest Journeys

**Purpose:** Which automated journeys are actively sending right now vs. paused or quiet. Answers "is my automation actually running?"

**Exact current copy:** title **"Latest journeys"**; description **"Your 4 most recent automated journeys and how much they sent in the last 24 hours."**; tooltip **"Used to see which journeys are actively sending right now versus paused or quiet."**

**UI:** Same row-list pattern as Latest Experiments. Blue `Route` icon on the same `rgba(0,128,255,0.08)` tint, journey name, a **sends-in-24h pill** (`{n} sends`, using `MarketingCountBadge`), and a status pill (`Active` / `Paused`, capitalized via the same CSS transform, source data lowercase).

**Data source (real):** Intempt Journeys. Per the console feature inventory, `useJourneysQuery()` is the real surface for a journey list with status; message-level engagement (Sent, Opens, Clicks, Replies, Attributed Revenue, Revenue per Send) is tracked per-journey and would supply the `sends24h` figure here.

**Derivation:**
- `sends24h[journey]` = count of that journey's send events with `timestamp` in the trailing 24h window.
- `status[journey]` = the journey's own on/off state (`active` if live and currently able to send, `paused` if manually paused or the flow has no active entry criteria).

**Current mock:** `LATEST_JOURNEYS` — 4 rows: "Welcome series" (86 sends/24h, active), "Cart abandonment" (64 sends/24h, active), "Re-engagement Q2" (0 sends/24h, paused — deliberately kept in the list rather than filtered out, so the card shows a realistic mix of active and inactive automation instead of only-active journeys), "Trial expiry nudge" (21 sends/24h, active).

**Cross-reference (still holds, still slightly inconsistent):** the sum of these four journeys' `sends24h` is `86 + 64 + 0 + 21 = 171`. The Journey anomaly detection card's "combined send volume" row shows a *current* value of `1.2k` sends, labeled "Last 24h." `171 × 7 ≈ 1,197 ≈ 1.2k` — so the anomaly card's number reads as roughly this card's **weekly** total, not its 24h total, even though its own label says "Last 24h." This looks like a deliberate attempt to keep the two cards telling one consistent story (both numbers plausibly describe "how much this account sends"), but the unit mismatch between the two cards' labels (24h vs. what's actually a week's worth) is a real, small inconsistency in the mock data as shipped today, not something resolved since the last draft of this doc.

**Empty state (implemented):** "Build an automated journey to see send activity show up here." Action: "Create journey" → `/journeys` (route gap noted above).

---

## Card 5: Top Segments

**Purpose:** Which audience segments are worth building the next journey or experiment around. Answers "where's the engaged audience, and is it growing?"

**Exact current copy:** title **"Top segments"**; description **"Members and engagement rate for the segments driving the most journey and experiment activity."**; tooltip **"Used to see which audience segments are worth building the next journey or experiment around."**

**UI:** Ranked list (rank badge 1–4, #1 filled blue `#0080FF` with white numeral, ranks 2–4 outline-style `rgba(0,128,255,0.1)` background with `text-blue-600` numeral), each row: segment name, a **members pill** (`{n} members`, e.g. "4.2K members" — capital K) underneath the name, and on the right: a green/red **trend badge** (`ChangeBadge`, shared with other tabs — `TrendingUp`/`TrendingDown` icon + signed `%`) followed by a **radial progress ring** (`RadialProgress`) with the engagement rate printed inside it.

This went through several layout iterations before landing here — earlier versions put the engagement % as text outside the ring (redundant with the number already inside the ring) and put members next to the ring instead of under the name. The final version keeps the ring as the single source of truth for the rate number, and keeps members + trend as supporting context to the left/right of it.

**Chart type:** Not a Recharts chart — a hand-rolled SVG radial progress indicator (`RadialProgress`): two concentric `<circle>` elements, the background one `stroke="var(--muted)"`, the foreground one `stroke="#0080FF"` using `strokeDasharray`/`strokeDashoffset` to draw an arc proportional to `value/100`, the whole `<svg>` rotated `-90°` so the arc starts at 12 o'clock, `strokeLinecap="round"` for a soft arc end. Supports an optional `showValue` prop (defaults `true`, and is called `true` everywhere on this page) that prints the percentage as centered text inside the ring.

**Data source (real):** Requires Intempt Segments (defined audience groups) joined against engagement events. Per the console feature inventory, `useSubscribersQuery().fetchAnalyticsQuery` is the real surface most likely to supply a segment's membership count and an engagement/analytics rollup for it — this is the piece of real API surface this card would sit on top of.

**Derivation:**
- `members[segment]` = current population count of the segment.
- `rate[segment]` = `engaged members / total members * 100`, where "engaged" is a defined activity (opened/clicked/converted, or whatever the workspace's engagement definition is) within the lookback window.
- `change[segment]` = period-over-period change in `rate`, e.g. this-30-days rate minus previous-30-days rate, shown as a signed percentage-point-ish delta (currently just labeled `%`, not `pp` — worth reconciling with the Analytics doc's own `pp` vs `%` convention if this ships for real).

**Current mock:** `TOP_SEGMENTS` — 4 rows: "High-intent visitors" (4.2K members / 4,200 exact, rate 24.1%, change +12%), "Active trial users" (1.1K members / 1,100 exact, rate 38.7%, change +8%), "Newsletter subscribers" (8.1K members / 8,100 exact, rate 6.2%, change +4%), "Churned (90-day)" (2.4K members / 2,400 exact, rate 3.1%, change -6%). Note the rank order isn't sorted by `rate` (38.7% "Active trial users" outranks the #1-ranked "High-intent visitors" at 24.1%) or by `members` (8.1K "Newsletter subscribers" is the largest audience but ranks 3rd) — the mock's rank order looks like it's meant to represent "most relevant to build on next" rather than a literal sort by any single visible column, which is a fine product framing but is worth being explicit about if this card is rebuilt for real: rank needs its own defined sort key (member growth? recency of last journey targeting it? a composite score?), it can't just be "sort by `rate` descending" or the row order above wouldn't be reproducible.

**A caveat on member counts specifically (B2B relevance):** if any of a workspace's segments are account-based rather than purely user-based (common in B2B marketing), the SDK's `group(accountId, ...)` call is what associates a tracked profile with an account/company, and an accurate "members" count for an account-based segment would need to be built on account membership via `group()`, not just on unique `profileId`s. This is a real nuance the SDK API surface anticipates (see the SDK Reference section below) that a straightforward "count of distinct profiles matching the segment filter" implementation would miss for B2B segments specifically.

**Empty state (implemented):** "Segments will rank here once there's enough activity to measure engagement." No action button.

---

## Card 6: Journey Anomaly Detection

**Purpose:** Catch journey health problems (volume or open-rate drops) before they compound. This is the card that took the most iteration — see the "What Was Removed and Why" section below for the full reasoning trail.

**Exact current copy:** this card doesn't use `SectionCard`'s `title`/`tooltip` props — its header is composed by hand inside `MarketingAnomalyCard` itself. Title **"Journey anomaly detection"**; tooltip (via `HeadingTooltip`) **"Used to catch journey send volume or open rate moving outside its normal range, before it turns into a bigger problem."**; description **"Send volume and open rate across your active journeys, compared to their typical range."**

**UI:** Two rows (not the original five), each: metric name stating its scope explicitly in the label itself — **"Combined send volume across active journeys"**, **"Combined open rate across active journeys"** (earlier versions just said "Send volume," which was ambiguous about whether it meant one journey, all journeys, or the whole account), a **"Typical range" pill** (`MarketingCountBadge`, text: `Typical range: {expectedLow} – {expectedHigh} {unit}`) instead of a bare "Expected X–Y", and on the right: a capitalized severity pill (`Critical`/`Warning`, with a small colored dot), a small uppercase **"LAST 24H"** label, the current value, and a change line reading `{delta}% vs. typical`.

**Exact current mock values:** row 1 — "Combined send volume across active journeys," severity **critical**, typical range **4.6k – 5.8k sends**, current value **1.2k sends**, change **-76% vs. typical**. Row 2 — "Combined open rate across active journeys," severity **warning**, typical range **40% – 46%**, current value **28.4%**, change **-33% vs. typical**.

**Exact severity styling:** critical → `text-red-600`/`bg-red-50` (dark: `text-red-400`/`bg-red-500/12`), dot `bg-red-500`. warning → `text-amber-600`/`bg-amber-50` (dark: `text-amber-400`/`bg-amber-500/12`), dot `bg-amber-500`.

**Chart type:** None — this is a stat/alert row list, not a chart. A card like this arguably *shouldn't* be a chart; it's closer to a monitoring/alerting UI pattern.

**What this needs to be real (this is the important part — kept in full from the previous draft, it's the strongest section of this document):**

1. **Baseline computation.** The "Typical range" isn't a fixed number — it has to come from the metric's own history. Three standard approaches, in increasing robustness:
   - *Mean ± N·σ* (control-chart style): trailing 30–90 days, band = mean ± 2σ. Simple, but sensitive to outliers.
   - *Percentile band* (e.g. 10th–90th percentile of history): more robust for skewed metrics.
   - *Seasonal-adjusted baseline*: decompose into trend + day-of-week/hour-of-day seasonality + residual, band the residual only — necessary because "Monday's send volume" and "Saturday's send volume" are supposed to differ; you compare like-for-like time slots, not yesterday-vs-today blindly.

2. **Severity classification.** Combine (a) statistical deviation (z-score or % outside the band — small breach → info/watch, large → critical) with (b) hard business thresholds where they exist (e.g. bounce rate above ~2% is critical regardless of the account's own baseline, because ESP throttling risk doesn't care about your history). Whichever signal is higher wins.

3. **`change` calculation.** `(current − baseline_reference) / baseline_reference × 100`, where `baseline_reference` is the band's mean/midpoint, not its edge.

4. **A detection job**, not a page load computation: aggregation rollup (hourly/daily), a rolling baseline store (updated incrementally, not recomputed from scratch every check), a scheduled comparison job, and **dedup logic** — an ongoing anomaly must track "first seen at" so it doesn't refire as a brand-new alert every cycle while the underlying issue is still active.

5. **A minimum-volume guardrail.** A journey with 10 sends shouldn't get flagged "critical" because one bounce made the rate swing 500%. Below a sample-size floor, the correct state is "waiting for enough data," not a fabricated severity — same philosophy as the Analytics Home doc's waiting/locked states, and now also the same philosophy this page's own `CardEmptyState` embodies at the whole-card level (see above) — the guardrail described here is the same idea applied *inside* a card that does have some data, at the level of an individual metric's confidence, rather than at the level of "does this card have any data at all."

None of this infrastructure exists today. The two metrics shown (`send volume`, `open rate`) were chosen specifically because they roll up from fields Journeys already tracks (`Sent`, `Opens`), unlike bounce rate and unsubscribe rate (see "What Was Removed and Why," below).

**Current mock:** `ANOMALY_METRICS` — exactly 2 rows (values above).

**Empty state (implemented):** "We'll flag unusual send volume or open rate here once there's enough send history." No action button — appropriately, since there's no single obvious "go do this one thing" CTA for an alerting card the way there is for "go create a journey."

---

## Appendix: Segment Engagement Map (built, currently disabled)

A full-width quadrant bubble chart — `ScatterChart` with `ZAxis`-driven bubble sizing (`membersCount` → radius, `range={[500, 1800]}`), two dashed `ReferenceLine`s splitting the plot into quadrants (`x = 5000` members, `y = 20%` engagement rate), one `Cell`-colored bubble per segment, a horizontal legend row below the chart, and a static 2×2 grid of quadrant-meaning tiles.

**Exact quadrant tile copy and colors** (`SEGMENT_QUADRANTS`): "High engagement, smaller audience" / "Great for targeted experiments" (`bg: rgba(139,92,246,0.08)`, text `#8B5CF6`, purple); "High engagement, large audience" / "Scale with journeys" (`bg: rgba(0,128,255,0.08)`, text `#0080FF`, blue); "Lower engagement" / "Nurture or win back" (`bg: rgba(245,158,11,0.08)`, text `#B45309`, amber); "Large audience, growth opportunity" / "Build engagement" (`bg: rgba(20,184,166,0.08)`, text `#0F766E`, teal).

**Exact bubble colors** (`SEGMENT_COLORS`, in `TOP_SEGMENTS` order): `#0080FF` (blue), `#8B5CF6` (purple), `#14B8A6` (teal), `#F59E0B` (amber). The categorical palette here is intentional and different from the "all blues" rule elsewhere — in a scatter plot, color is the only way to identify which point is which, so distinct hues are functionally necessary, not decorative. (As noted in the Color System section below, this reasoning is no longer unique to this appendix — the live Channel Mix donut applies the identical logic, with its own separate set of hex values.)

Axis domains are fixed, not data-driven: `x` (members) `domain={[0, 10000]}`, ticks every 2000; `y` (engagement rate) `domain={[0, 50]}`, ticks every 10. Tooltip (`SegmentScatterTooltip`) shows `{name}` then `{rate}% engagement · {members} members`.

This is commented out in `MarketingHomeDashboard()` (`{/* <MarketingSegmentMapCard /> */}`) — built at the user's request to evaluate, then intentionally turned off ("it's nice we did, but it's off, comment it out"). The component (`MarketingSegmentMapCard`, `SegmentScatterTooltip`) and its data (`SEGMENT_COLORS`, `SEGMENT_QUADRANTS`) remain in the file, unused, in case it's revisited later.

The quadrant thresholds (`5000` members, `20%` engagement) are hardcoded splits, not computed medians — in production these should probably be the actual median audience size / median engagement rate across all segments, so the quadrant boundaries move with the account's real distribution instead of a fixed guess.

---

## Shared Components & Conventions

- **`HeadingTooltip`** — the shared grey-circle info-icon + dark-pill hover tooltip, used for every card-title tooltip on Home and for the Journey anomaly card's hand-composed header. Documented in full above.
- **`CardEmptyState`** — the shared per-card "connected, not enough data yet" state (Intempt logo, grayscale + shimmer, muted one-line message, optional dotted-underline text-link action). Documented in full above; used identically across all 4 Home tabs.
- **`MarketingCountBadge`** — the one neutral gray pill component, reused for member counts, sends counts, variant counts, and "Typical range" text. Introduced specifically so every "count-like" piece of information across the page looks identical, rather than each card inventing its own badge style.
- **`MarketingStatusPill`** — green/gray pill for `active`/`winning` vs. everything else, text always capitalized via CSS regardless of the lowercase source data.
- **`ChangeBadge`** — green ↗ / red ↘ trend indicator, shared with other tabs in this file (not Marketing-specific). Direction is determined purely by `!change.startsWith("-")` — there's no separate "flat/neutral" state; a `"0%"` string would render as positive/green.
- **`RadialProgress`** — the only hand-rolled SVG chart on the page; supports an optional `showValue` flag (added, then the "don't show it externally, keep it in the circle" request reverted its usage back to `true` everywhere it's actually called).

## Color System

- **All blues** for anything identifying a *type* of row-list item where a chart isn't doing simultaneous multi-point comparison — journey icons, experiment icons, segment rank badges, radial rings — explicitly corrected away from an earlier mixed blue/purple treatment. The reasoning: when color differentiates category membership in a *list* (where position and label already do that job), varying the hue adds noise, not information.
- **Categorical palette (blue/purple/teal/green/amber) is used in exactly two places, not one**, and this is a correction to the previous draft of this document, which described only one exception:
  1. The disabled Segment engagement map's scatter bubbles (`SEGMENT_COLORS`: `#0080FF` / `#8B5CF6` / `#14B8A6` / `#F59E0B`), because there color is the *only* differentiator between simultaneously-visible points on a 2D plane.
  2. **The live Channel Mix donut and its legend** (`CHANNEL_MIX.color`: `#0080FF` / `#C37EE5` / `#59B277` / `#FFC44D`) — a different, but hue-family-similar, four-color set. This card was previously (incorrectly) described as following the "all blues" rule; the live code does not and, by the same logic as the scatter chart, arguably shouldn't — a donut's slices are all visible at once with no positional ordering to lean on, so distinct color is doing real identification work here too.

  Both of these are a genuinely different visual context from a vertical list, which is why "all blues" doesn't apply to either of them.
- **Green/red** reserved for signed change values (`ChangeBadge`, anomaly `change` line) and **red/amber** for severity (`critical`/`warning`) — semantic, not decorative, so left untouched by the "all blues" note. One soft exception, noted above under Card 1: the Send Performance area chart's "Clicks" series is stroked green (`#16a34a`), not because it's a signed delta, but because it's a third distinct hue needed to separate three simultaneously-plotted time series — the same "simultaneous-visibility needs distinct color" logic as the donut and scatter chart, just applied to a third chart type (multi-series area/line trend).

## What Was Removed and Why

- **Bounce rate, unsubscribe rate** (originally in Journey anomaly detection): dropped because they aren't confirmed tracked fields for Journeys. Showing an "anomaly" for a metric that isn't actually captured would be fabricating data, not mocking a real feature.
- **"View all metrics" button**: removed — there's no destination page for it to link to, so it was a dead-end affordance. (Contrast with the two current empty-state action links, which *do* have a named, real destination — `/journeys`, `/experiences`, both live routes via `DASHBOARD_VIEW_KEYS` — see the correction note above. The difference is one of intent: "View all metrics" had no intended destination at all, while the empty-state CTAs point somewhere real.)
- **"12m ago" / "48m ago" timestamp**: removed from the visible UI per request, though conceptually it still matters — it's the anomaly's "first seen at," which a real detection job needs internally for dedup even if the card doesn't display it.
- **Confidence-interval bar chart + tab selector** (an earlier version of Latest Experiments): replaced with the simpler variant-count list — intentionally scoped down from "show statistical results" to "show what's running," per direct request to keep it simple.
- **Funnel waterfall chart + tab selector** (an earlier version of Latest Journeys): same simplification, replaced with the sends-in-24h list.
- **5-metric version of Anomaly detection**: trimmed to 4, then to 2, as the metric list was scrutinized for what's actually backed by real tracked data.
- **Full-card 2-column pairing → full-width Top Segments** (briefly): tried when Anomaly detection was removed entirely; reverted once Anomaly detection came back in its trimmed form.
- **"Upgrade strip"**: listed in an earlier draft of this document's Page Layout section as item 4 on the page. No trace of it exists in `HomeView.tsx` today — see the correction note under Page Layout, above.

## Source Certainty

This page is buildable for real if these hold:
1. Journeys and Experiences event data (send, open, click, reply, revenue) is captured with channel, timestamp, and per-journey/per-experiment identifiers.
2. Segments exist as defined, queryable audience groups with a membership count and an engagement-event join.
3. A revenue-attribution path exists from conversion events back to the channel/send that drove them (needed for Channel mix's revenue-per-channel figures) — **and, per the honesty flag under Card 2 above, this specifically does not hold today**: the real backend's per-channel revenue fields are hardcoded to `0`, not just unimplemented on the frontend.
4. For Journey anomaly detection specifically: a baseline-computation and detection pipeline exists (see Card 6) — this is the one piece of real infrastructure this page assumes but that doesn't exist yet anywhere else in the product.

If any assumption is false for a given workspace, the affected card should show a waiting/connect-source state instead of the values above. **This is the section of the previous draft that most needed correcting.** It used to end with: "none of that waiting-state logic is implemented yet; every card on this page currently renders its mock data unconditionally." That is false today. The waiting-state logic is fully implemented — see the `CardEmptyState` section above for the complete visual spec, the per-card copy table, and exactly how `noData`/`homeState` drive it. What's *not* implemented is the data-freshness detection that would flip a real workspace into that state automatically (i.e., a real "does this workspace have enough send/segment/journey history to show card X" check) — today `noData` is only ever set by a developer/demo manually appending `/partial` to the URL, not by any live signal about a workspace's actual data maturity. So the correct, precise statement as of this refresh is: **the empty-state UI is fully built and production-ready; the trigger condition that would turn it on automatically for a real under-provisioned workspace is what's still missing.**

---

## SDK & Journey Analytics Reference

This section is new in this refresh — it grounds the rest of the document against the Intempt JS SDK's actual documented data model and against Journeys' own analytics vocabulary, neither of which the earlier draft had verified directly.

### Intempt JS SDK (verified from `docs.intempt.com/js-sdk`)

Every event tracked through the SDK automatically carries three identifiers, regardless of what the calling code does: **`profileId`**, **`sessionId`**, **`pageId`**. This matters for this page because it means "how many distinct people did X" (e.g. a segment's member count, a journey's unique-recipient count) is always answerable at the profile level without any extra instrumentation — the identity resolution is baked into every tracked event, not something each feature has to opt into separately.

Relevant SDK methods for this page's cards specifically:
- **`track(eventTitle, data)`** — the general-purpose event call. Everything this page's Send performance, Channel mix, and Latest journeys/experiments cards ultimately roll up from is `track()` calls (sends, opens, clicks) tagged with channel and journey/experiment identifiers.
- **`identify(userId, ...)`** — attaches a known user identity to the current anonymous profile.
- **`alias(userId, anotherUserId)`** — merges an anonymous profile's history into a known identity once that anonymous visitor is later identified. This is directly relevant to **Top Segments' member counts**: without correct alias-based identity merge, the same real person browsing anonymously and then logging in could be double-counted as two separate "members" of a segment — an accurate unique-recipient/member count depends on this working correctly upstream of any segment-membership query.
- **`group(accountId, ...)`** — associates a profile with an account/company, for B2B-style, account-based tracking. Relevant if any of this workspace's segments are account-based rather than purely user-based (see the caveat under Card 5, above) — account-level "members" would need to be counted via `group()` membership, not via `profileId` alone.

**Forbidden event titles** — the SDK reserves and will reject: `'auto-track'`, `'view page'`, `'leave page'`, `'change on'`, `'click on'`, `'submit on'`, `'identify'`, `'consent'`. Not directly load-bearing for any single number on this page, but worth knowing if a future build-out of these cards ever needs to define a custom event title for, say, a segment-engagement or anomaly-detection pipeline — none of these six/eight reserved strings are available to reuse as a custom event name.

### Journey analytics (a second, complementary data model this page doesn't use yet)

The user pointed at `https://intempt.com/docs/guides/journeys/journey-analytics`; the live canonical page appears to now be `https://help.intempt.com/journeys/overview`, but a direct fetch of that host failed on a TLS/SSL handshake error, so the following is sourced from a search-engine-indexed summary of that page rather than a direct read — the field *names* below are reliable, but the full page's content (edge cases, exact formula wording, any additional fields) couldn't be independently verified end-to-end.

Per that summary, Intempt's Journeys product tracks a **journey-level** analytics model distinct from message-level engagement:
- **Triggered** — the count of users who triggered/entered the journey.
- **Converted** — the count of those users who went on to complete the journey's defined conversion event.
- **Conversion rate** — `converted / triggered × 100`.
- **Days to convert (avg)** — the average time-to-conversion for users who did convert.

This is a genuinely different axis from everything this document has described so far. Every field this page's Latest Journeys and Journey anomaly detection cards currently use or could use — Sent, Opens, Clicks, Replies, Attributed Revenue, Revenue per Send — is **message-level**: it measures engagement with each individual send. Triggered/Converted/Conversion-rate/Days-to-convert is **journey-level**: it measures whether the person who entered the journey eventually did the thing the journey exists to make them do, irrespective of how many individual messages that took. Both are real, separately-tracked concepts in Intempt Journeys — one isn't a subset or approximation of the other.

**Neither Latest Journeys nor Journey anomaly detection currently uses the journey-level fields at all.** Latest Journeys shows `sends24h` (message-level) and on/off `status`. Journey anomaly detection's two rows are "combined send volume" and "combined open rate" (both message-level). A future version of either card could incorporate Triggered/Converted/Conversion-rate/Days-to-convert instead of, or in addition to, what's shown today — e.g. Latest Journeys could add a conversion-rate column next to its sends-in-24h pill, or Journey anomaly detection could watch for an anomalous *drop in conversion rate* (a journey-level health signal) in addition to its current two message-level signals. This would be new scope, not a fix to something broken — it's flagged here as a real, available data model this page hasn't tapped, not as a gap in what's already built.

### Cross-reference: the console feature inventory's real API surface (§2 Marketing)

The console feature inventory (`CONSOLE_FEATURE_INVENTORY.md`) documents the real, non-mock API surface Marketing features are actually built on:
- **`useJourneysQuery()`** — the real journey-list query. This is what Latest Journeys and (via aggregation) Journey anomaly detection's send-volume metric would sit on top of.
- **`useExperiencesQuery()`** — the real experiment-list query. This is what Latest Experiments would sit on top of.
- **`useSubscribersQuery().fetchAnalyticsQuery`** — the real subscriber/segment analytics query. This is the most plausible real surface for Top Segments' member counts and engagement rates.

And, critically, the inventory's explicit hardcoded-placeholder warning: in the real codebase's `useBusinessPerformanceSummary.service.ts`, **`revenuePerRecipient`, `emailRevenue`, `smsRevenue`, and `pushRevenue` are all hardcoded to `0`**. This is the exact set of fields Send Performance's or Channel Mix's per-channel revenue split would need to call for real numbers, and today that real service returns zero for every one of them. This is restated here (it's also called out under Card 2 and in Source Certainty above) because it's the single most important "don't assume this is close to shippable" flag in this whole document: the UI for revenue-by-channel is fully built and looks finished, but the backend field it would read from is a stub, not an unfinished-but-real pipeline. "Per-channel revenue" is not actually shippable today even though the card renders as if it were.
