# Design Home Dashboard — PRD & Buildability Analysis

This document explains, card by card, number by number, color by color, what the Design tab of the Intempt Home dashboard currently shows, the concept/theory behind each metric, the exact formula used, what real data it would need, and — most importantly — an honest accounting of what's mocked, what's genuinely buildable today, and what requires brand-new instrumentation that doesn't exist anywhere in the product yet. It mirrors the format of `marketing-home-sources.md` and the older `design-home-source.md`, applied to the **current, redesigned** Design Home page.

Route: `/home?tab=design/full`
Implementation: `src/components/HomeView.tsx` — `DesignHomeDashboard()` and its four child card components: `DesignReachCard`, `DesignAssetUsageCard`, `DesignLatestGenerationsCard`, `DesignAdoptionMixCard`.

**A note on scope:** an older document (`design-home-source.md`) describes a previous version of this page — a "Generation activity" area trend, "Credit usage by type" donut rings, "Latest generations," and a rotating "Most used" carousel. That page was fully redesigned. Two of the four original cards (a version of "Latest generations," and the general card-count/layout convention) survived in spirit; "Generation activity," "Credit usage by type," and "Most used" did not — they were replaced with "Reach from generated assets," "Generated vs. used," and "Adoption mix." Nothing from the old doc's data model, mock data, or specific chart choices should be assumed to still apply. This document describes only what is live in the code today.

---

## Default Time Window

Unlike Marketing Home and Analytics Home, **none of the four Design cards currently declare an explicit rolling time window**, and this is worth flagging as an open product decision rather than glossing over:

- **Reach from generated assets** — description says "Reach and click-through where a generated asset was used," tooltip says "Totals across all sends that include a Blu-generated email, image, or SMS." The word "totals" implies all-time/cumulative, not a 7- or 30-day window. There is no window selector, no "last 30 days" in the title, unlike the house convention established on Analytics Home and Marketing Home (which both anchor charts to an explicit 30-day window, e.g. Jun 13–Jul 12).
- **Generated vs. used** — a point-in-time snapshot of the entire asset library's usage state (214 generated, 128 used), not windowed at all. It answers "as of right now, what fraction of everything ever generated has been used," not "this week."
- **Latest generations** — inherently point-in-time (the 4 most recent items), no window concept applies.
- **Adoption mix** — same as Generated vs. used: a snapshot of the whole library's composition (214 generated + 47 uploaded = 261 total), not a windowed metric.

**Open question for product:** should Reach and Adoption Mix declare an explicit window (e.g. "last 30 days," matching house convention) for consistency with the rest of Home, or are they intentionally meant to be all-time/cumulative library health metrics? The current copy ("Totals across all sends," "your asset library") reads as intentionally cumulative, but this should be a deliberate decision, not an accident of how the mock data was written. If any of these become windowed later, the underlying join complexity described in "What Would Need To Be Built" gets strictly harder (you'd need timestamped join tables, not just a boolean "was this used" flag).

---

## Page Layout (current, top to bottom)

1. Greeting row + a checklist toggle button (opens/closes `BrandSetupChecklist`, a collapsible panel, height-animated via `maxHeight`/`opacity` transition) + a "Watch intro" button that opens a `VideoOverlay` modal (`TAB_VIDEOS.design`). This matches the header pattern already established on Analytics and Marketing Home — no inline video hero card sits in the page body.
2. A 2×2 grid (`grid-cols-1 xl:grid-cols-2`, so it's 1 column on narrow viewports and 2 columns at `xl` breakpoint and above), rendered in this literal order:
   1. **Reach from generated assets** (`DesignReachCard`)
   2. **Generated vs. used** (`DesignAssetUsageCard`)
   3. **Latest generations** (`DesignLatestGenerationsCard`)
   4. **Adoption mix** (`DesignAdoptionMixCard`)

   At the `xl` breakpoint this reads visually as: top-left = Reach, top-right = Generated vs. used, bottom-left = Latest generations, bottom-right = Adoption mix.
3. **No upgrade strip** on this page. This was removed product-wide this session — it is not a Design-specific omission; Analytics and Marketing Home have also had theirs removed as of the current state of the codebase.

Each card is wrapped in the shared `SectionCard` shell (title, description line, info tooltip, children) and given a fixed `min-h-[390px]` so all four cards in the grid line up to the same height regardless of content — a plain 3-stat row (Reach) and a donut-plus-two-stats row (Generated vs. used) both occupy the same visual footprint as the row list (Latest generations) and the proportion bar (Adoption mix).

**Legacy component note:** the file still contains an older, unrelated `DesignDashboard()` function (distinct from `DesignHomeDashboard()`), which retains the original KPI-tiles + Brand Kit completeness + Credits-with-warning + Blu-recommendation-cards layout from before either redesign. It is not reachable through routing — `HomeView`'s tab switch only ever renders `DesignHomeDashboard` for the Design tab. Several shared constants it depends on (`DESIGN_ASSET_TYPES`, `DESIGN_RECS`, `DESIGN_BRAND_ITEMS`) are still present in the file purely because this dead component still references them.

---

## Card 1: Reach from Generated Assets

**Purpose.** Answers "when a Blu-generated (or asset-library-sourced) email, image, or SMS goes out as part of a send, how far does it reach, and does it get engaged with?" It's meant to connect the *design* side of the product (generation) to the *outcome* side (message performance) — proving that generated creative actually gets delivered and clicked, not just produced and forgotten in a library.

**UI.** No chart at all — three plain, centered stat columns, each a big number over a label with an info-tooltip: **Reach** (big number), **Open rate** (percentage), **Click rate** (percentage). No icons, no colored boxes, no background fill behind any of the three columns; they sit directly on the card's background separated by horizontal gap (`gap-10`).

**Design history — why this ended up as plain numbers.** This card went through at least two more elaborate visual treatments before landing on the current bare-numbers layout, and the history is worth preserving because it explains a real product decision, not just an implementation detail:

1. An earlier iteration used a Recharts `FunnelChart`/`Funnel`, modeling the journey as trapezoids narrowing from "Generated" → "Used in a journey" → "Live in an active journey." This was explicitly rejected with direct feedback along the lines of "that chart is bad... if there is no chart, show numbers." The funnel visual implied a strict linear drop-off (like a sales funnel) that doesn't actually describe this data well — an asset isn't "lost" the way a funnel stage implies; it's either used or not, and "live in an active journey" versus "used in a draft journey" isn't really a meaningful ordered stage the way funnel stages usually are.
2. A second direction used per-metric icon tiles — each stat wrapped in a small muted background box with an icon (e.g. `Send` for reach). This was also set aside in favor of plain text.
3. The final, shipped version removes both the chart and the icon treatment entirely: three plain centered stat columns, no icons, no chart, no colored boxes. This is the simplest possible representation of three numbers, and it won specifically because the funnel metaphor was judged misleading and the icon-tile treatment was judged as unnecessary decoration for what is fundamentally three plain KPIs.

There is no live `FunnelChart` import remaining anywhere in the file — confirming the funnel approach isn't a dormant "commented out" option but was fully removed.

**A second, separate design correction: journeys are not named in the visible copy.** Per an explicit product instruction to avoid mentioning "journeys" directly in this specific card's user-facing text, the description ("Reach and click-through where a generated asset was used") and tooltip ("Totals across all sends that include a Blu-generated email, image, or SMS") are deliberately generic about *where* the asset was used. This is a copy-level sanitization, not a data-model fact — under the hood, "used" almost certainly still means "referenced inside a Journey Builder send," it's just not spelled out to the end user on this particular card. (Contrast this with Card 2's tooltip, which *does* say "journey step" explicitly — the two cards are not consistent on this point, which may be worth reconciling.)

**Chart type.** None — plain stat columns.

**Data source (what it needs to be real).** Message-level send/open/click telemetry (owned by Journeys), filtered down to only the subset of sends where the message included a Blu-generated or asset-library-sourced creative (email HTML, image, or SMS body).

**Required raw fields:**
- A send-level or message-level record with `sent`, `opened`, `clicked` counts or booleans (these are confirmed real fields in the product's Journey Analytics surface).
- Critically, each such send/message record would need to carry a reference to the specific content/asset ID(s) used in that message, so totals can be filtered to "sends where the message body was a Blu-generated asset." **This join does not exist today.**

**Derivations (exact formulas, as implemented):**
- `openRate = Math.round((opens / sends) * 100)` → with mock data `Math.round((66340 / 214000) * 100)` = **31%**.
- `clickRate = Math.round((clicks / sends) * 1000) / 10` → `Math.round((9860 / 214000) * 1000) / 10` = **4.6%** (note the extra `* 1000 / 10` gives one decimal place of precision, versus open rate's whole-number rounding — a deliberate asymmetry in the code, presumably because click rates are conventionally reported to one decimal and open rates aren't).
- `fmt(n)`: formats large reach numbers into a "K" suffix — `n >= 1000 ? \`${Math.round(n / 100) / 10}K\` : \`${n}\`` — so `214000` → `214K`. This rounds to one decimal place of "K" (e.g. `214000` → `2140/10` = `214.0` → displayed as `214K` since trailing `.0` isn't shown by the template literal only because `214000/100 = 2140`, `2140/10 = 214` exactly — the rounding only becomes visible for inputs that don't divide evenly, e.g. `215430` → `2154.3` rounds to `2154`, `/10` → `215.4` → `"215.4K"`).

**Current mock.** `DESIGN_REACH = { sends: 214000, opens: 66340, clicks: 9860 }` — three flat, hand-set numbers with no underlying daily/weekly breakdown, no history, and no connection to any other card's numbers (contrast with Card 2 and Card 4, which intentionally share the `214` figure for narrative consistency; Reach's `214000`/`66340`/`9860` are unrelated round-ish numbers chosen to produce plausible-looking 31%/4.6% rates).

**Why NOT YET buildable (real gap).** There is no confirmed field anywhere in the product that joins a "this send included asset X" record to X's provenance (generated vs. uploaded), or even to X's identity at all, at the message level. Sent/Opens/Clicks exist as real fields in Journey Analytics, but they are not currently filterable by "did this message contain a Blu-generated creative." Building this for real means:
1. Journey Builder message nodes (email/SMS/push node types) need to record which `contentItemId` (or equivalent asset reference) was rendered into that specific send, at send time, not just at authoring time (a node's content can change between edits, so send-time snapshotting matters for accurate historical reach numbers).
2. Aggregation then needs to roll up: for every send/open/click event, resolve back to the `contentItemId` used, filter to only those content items, and sum. This is a materially new backend rollup, not a small model change — see "What Would Need To Be Built" below for the full breakdown.

**Waiting state.** `noData` renders `CardEmptyState` with the message: *"Reach and click-through will show up here once a generated asset goes out."* `actionLabel="Open asset library"`, `actionHref="/asset-library"`.

---

## Card 2: Generated vs. Used

**Purpose.** Answers "of everything I've generated, how much has actually been put to work?" This is a utilization metric for the asset library, distinct from Reach (which is about downstream performance) — this card is purely about whether a generated asset ever got attached to something, regardless of how that something performed.

**UI.** A three-part horizontal row, explicitly requested in this exact layout ("donut chart in the middle, left is generated, right is used"):
- **Left:** a plain stat — the raw `generated` count (`214`) over the label "Generated assets."
- **Center:** a Recharts `PieChart`/`Pie`/`Cell` donut, `h-56 w-56`, with:
  - `innerRadius="68%"`, `outerRadius="92%"` (a fairly thin ring, not a thick doughnut)
  - `startAngle={90}`, `endAngle={-270}` — starts at 12 o'clock and sweeps clockwise, the same convention used elsewhere in Home's donuts
  - `paddingAngle={2}` — a small visual gap between the two arc segments
  - Two `Cell`s: `#0080FF` (solid brand blue) for the "Used" slice, `rgba(0,128,255,0.18)` (translucent blue, 18% opacity) for the "Not used" slice
  - `stroke="var(--content-bg)"`, `strokeWidth={3}` — a thin border matching the card's own background color, so adjacent arc segments look cleanly separated rather than touching
  - Centered inside the ring (absolutely positioned over it, not part of the chart itself): the big number `60%` with a small uppercase "USED" label and an info-tooltip beside it.
- **Right:** a plain stat — the raw `usedInJourneys` count (`128`) over the label "Used assets."

**Chart type.** `Pie` donut (Recharts), 2 cells, no legend rendered on the chart itself (the left/right flanking stats function as the legend).

**Data source (what it needs to be real).** A count of generated assets (`ContentItemResponse`-shaped records from the asset library / content builder), and — separately — a determination of which of those assets have been referenced by at least one journey.

**Required raw fields:**
- `generated`: a total count of content items. This part is genuinely easy — every real content-list endpoint in the product (`useBrandDesignQuery`, `useStudioQuery`, `usePoseQuery`, `useCharacterQuery`, `useContentBuilderQuery().fetchItemsQuery`) already returns a `{presets, custom}` or `{items}` shape, and a plain `.length` is one line of code away.
- `usedInJourneys`: **this is the field that does not exist.** There is no confirmed field anywhere for "was this asset used inside a journey." The tooltip's own definition — "Assets are counted as used once they're attached to a live or draft journey step" — describes a join that has to be built, not a field that's queried today.

**Derivations:**
- `usedPct = Math.round((usedInJourneys / generated) * 100)` → `Math.round((128 / 214) * 100)` = **60%**.
- The "Not used" slice value passed to the donut is simply `generated - usedInJourneys` (`214 - 128 = 86`), not independently sourced — it's a derived remainder, so the two arcs always sum to the total by construction and can't drift out of sync with the flanking stats.

**Current mock.** `DESIGN_ASSET_USAGE = { generated: 214, usedInJourneys: 128 }`. Worth flagging explicitly: **`usedInJourneys` (128) is an independently hand-set mock constant**, not derived from any real join between content items and journey nodes. It is *reused* by Card 4 (Adoption Mix reuses `DESIGN_ASSET_USAGE.generated`, the `214`, not the `128` — but the `128`/`214` pairing across this card is itself just narrative-consistency-by-convention across the mock data, not backed by any shared real computation).

**Why NOT YET buildable (real gap).** This is one of the three cards on this page whose core number has literally no backing field today. To make this real:
1. A join is needed between the Journey Builder's canvas nodes (email/SMS/push node types — confirmed real node types in `journey-builder`) and each node's referenced `contentItemId`.
2. "Used" needs a precise definition: does it mean "referenced by at least one node in any journey regardless of status" (live, paused, draft, archived)? The tooltip currently says "live or draft journey step," which already excludes archived/paused — a real implementation needs product to explicitly rule on which journey statuses count, because that changes the denominator meaningfully.
3. Once that join exists, `usedInJourneys` = `COUNT(DISTINCT contentItemId WHERE contentItemId IN (SELECT contentItemId FROM journey_nodes WHERE journey.status IN (...)))`, roughly — a real query, not a stored counter, unless usage counts get cached/denormalized for performance at scale.

**Waiting state.** `CardEmptyState` text: *"Generated vs. used will show up here once you've generated a few assets."* Same `actionLabel`/`actionHref` (`Open asset library` / `/asset-library`).

---

## Card 3: Latest Generations

**Purpose.** Answers "what did Blu or the asset library just produce?" — a pure recency feed, no metric, no formula, just a glance at the newest creative output across all types.

**UI.** A plain row list (not tiles, not a carousel) — one row per item, no chart:
- Left: an icon badge (`h-9 w-9`, rounded, `background: rgba(0,128,255,0.08)`) containing a Lucide icon colored `text-blue-500`, chosen by type via a lookup map (`DESIGN_GENERATION_ICONS = { email: MailOpen, sms: MessageSquare, image: FileImage }`, defaulting to `FileImage` if the type key doesn't match).
- The asset's name, truncated if too long.
- Right: a neutral gray pill (`MarketingCountBadge`, the same reusable component used elsewhere on Home — its name is scoped to where it was first built for Marketing Home, but it has no Marketing-specific logic) showing the type ("Email"/"SMS"/"Image"), plus a muted relative-time string ("2 days ago").
- Rows are separated by a bottom border (`border-b`), with the last row's border removed (`last:border-0`).

**Chart type.** None — a list.

**Data source (what it needs to be real).** The asset library / content builder's own creation log — name, output type, and completion/creation timestamp — sorted most-recent-first and sliced to the top 4.

**Required raw fields:** `name` (string), a `type` discriminator (`Email`/`SMS`/`Image`), and `createdAt` (timestamp). All three are exactly the shape already returned by the real content-list endpoints referenced in Card 2 — this is the most "just plumb it through" card on the page.

**Derivations.** None — direct pass-through, `slice(0, 4)` of the real list sorted by `createdAt` descending. The only currently-fake part is that the "2 days ago" / "3 days ago" / "1 week ago" / "1 month ago" strings are hand-typed literals rather than computed at render time from a real timestamp — trivial to fix (any relative-time formatting utility) once real timestamps exist.

**Current mock.** `DESIGN_LATEST_GENERATIONS`, 4 static rows:
1. "Claude design - Email 1" — Email — "2 days ago" — `MailOpen`
2. "Flash sale SMS with Liquid vars" — SMS — "3 days ago" — `MessageSquare`
3. "Raw HTML email output" — Email — "1 week ago" — `MailOpen`
4. "Brand character holding a can" — Image — "1 month ago" — `FileImage`

**Why genuinely buildable today.** Unlike Cards 1, 2, and 4, this card needs no new join and no new field — it needs only (a) a real "list recent content items across all content types, sorted by createdAt" query (which may require merging results from the separate brand-design/studio/pose/character/content-builder endpoints into one unified feed if they aren't already unified — worth checking whether such a cross-type feed already exists or would need to be assembled client-side / via a new aggregating endpoint) and (b) a relative-time formatter. This is the single most "just wire it up" card on the page.

**Waiting state.** `CardEmptyState` text: *"Generate an email, image, or SMS with Blu to see it show up here."* `actionLabel="Open asset library"`, `actionHref="/asset-library"`.

---

## Card 4: Adoption Mix

**Purpose.** Answers "of everything sitting in my asset library, how much did AI actually make versus how much did a human upload?" This is an AI-adoption/trust metric distinct from Card 2 — Card 2 is about *utilization* (did a generated thing get used), Card 4 is about *provenance* (was a thing generated at all, versus manually uploaded).

**UI — design history (three chart-type iterations, worth documenting in full):**
1. **Started as a donut** — the same visual language as Card 2 (a Recharts `Pie` ring with a centered percentage). This was explicitly rejected: "can we use some other chart type? instead of donut again?" — the reasoning being that two donuts on one 2×2 grid felt visually repetitive, not that the donut was wrong for this data specifically.
2. **A stacked-bar-over-time trend was considered** as the replacement — showing generated-vs-uploaded volume accumulating week over week. This was set aside in favor of option 3.
3. **The final, shipped version: a single horizontal proportion bar.** A big headline number (`82%`) with an uppercase label ("GENERATED BY BLU") above a full-width, rounded (`rounded-full`), fixed-height (`h-3.5`) bar split into exactly two flush segments — no gap, no padding between them, they visually read as one continuous bar with a color transition partway across. Below the bar, two legend rows (a color dot + a two-line label/count block), one left-aligned for "Generated by Blu," one right-aligned for "Manually uploaded" — so the legend rows sit directly under the bar segment they describe, spatially reinforcing the proportion.

**Chart type.** A hand-rolled two-`div` proportion bar (not a Recharts component at all — just two flex children with `width` percentages and `background` colors inside an `overflow-hidden rounded-full` container). This is the only card on the page (and one of very few anywhere in Home) that renders a chart-like visual with zero charting library involvement.

**Data source (what it needs to be real).** A `sourceType` (or similarly named) classification on every content item in the asset library — whether it originated from a Blu-chat/generation call or from a manual file upload.

**Required raw fields:**
- `generatedByBlu`: reuses `DESIGN_ASSET_USAGE.generated` (`214`) — the same total-generated count from Card 2, reused deliberately "for narrative consistency across the page" (the two cards tell a matching story: 214 generated, of which 128 are used, and of the total 261-asset library, 214 were generated by Blu). This reuse is a mock-data convenience, not evidence of a shared real query — in a real implementation these would likely come from the same underlying count so the consistency would be structurally guaranteed rather than coincidental.
- `uploaded`: `DESIGN_ADOPTION_MIX.uploaded = 47`, a wholly independent mock constant with no relationship to any other number on the page.
- **Neither of these breaks down by a real `sourceType` field today** — see "Why NOT YET buildable" below.

**Derivations:**
- `total = generatedByBlu + uploaded` = `214 + 47` = **261**.
- `generatedPct = Math.round((generatedByBlu / total) * 100)` = `Math.round((214 / 261) * 100)` = **82%** (the uploaded share is simply `100 - generatedPct` = 18%, not independently computed, so — like Card 2's donut — the two segments always sum correctly by construction).

**Current mock.** `DESIGN_ADOPTION_MIX = { uploaded: 47 }` plus the reused `generated: 214` from `DESIGN_ASSET_USAGE`.

**Why NOT YET buildable (real gap — arguably the cleanest and highest-priority one to fix).** There is no confirmed field anywhere for "was this asset generated vs. manually uploaded." This is conceptually the simplest of the three data gaps on this page to close (see "What Would Need To Be Built" below): it requires no cross-product join (unlike Cards 1 and 2, which need Journeys data), only a single new field stamped onto a content item exactly once, at creation time, based on which code path created it (Blu-chat generation call vs. manual upload form). Once that field exists, this card's entire computation is a `GROUP BY sourceType, COUNT(*)` — genuinely trivial math sitting behind one missing field.

**Waiting state.** `CardEmptyState` text: *"Adoption mix will show up here once you've generated a few assets."* `actionLabel="Open asset library"`, `actionHref="/asset-library"`.

---

## Shared "No Data" Empty State — `CardEmptyState`

All four Design cards (and every card on the other three Home tabs — Analytics, Marketing, and presumably a fourth if one exists) render the exact same `CardEmptyState` component when `noData` is true (i.e. when `homeState === "partial"` is passed down from `HomeView`). This is documented here precisely because it's the actual shipped implementation, not an aspirational description:

**Visual construction:**
- A small Intempt brand mark, `/hq.png` — a glowing blue circular whale-tail logo — rendered at `144×144px` intrinsic size.
- `filter: grayscale(1)` and `opacity: 0.55` applied to the image itself, desaturating and dimming it so it reads as an inert, waiting-state watermark rather than an active brand element.
- The image is placed inside a wrapper `div` sized `144px` wide by `72px` tall (`logoSize / 2`) with `overflow: hidden` — this crops the full circular logo down to just its top half, a "sunrise" crop (only the upper arc of the circle is visible; the bottom half is clipped by the container's height, not by any mask).
- On top of that hard crop, the image itself also carries a CSS `mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 52%)` — so even within the visible top half, the logo additionally fades to transparent as it approaches the crop line (fully opaque from 0–28% down the image, fading out between 28–52%). The combination of a hard container crop *and* a soft gradient fade means the cut-off edge doesn't look like a clean slice — it looks like the logo is dissolving into the crop line rather than being chopped by it.
- A separate shimmer layer sits absolutely positioned over the same `144×144` area: `background: linear-gradient(to top, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)`, `backgroundSize: 100% 90px`, `backgroundRepeat: no-repeat`. This is a soft white band 90px tall.
  - It's masked by `mask-image: url(/hq.png)` — using the PNG's own alpha channel as the mask — so the shimmer band only ever lights up pixels where the logo itself has actual color; it never illuminates the fully-transparent cutout area of the PNG or the rectangular area outside the circle.
  - `mix-blend-mode: overlay` — so the shimmer brightens/blends into the grayscaled logo rather than sitting as a flat white smear on top of it.
  - `animation: shimmer-sunrise 2s ease-in-out infinite alternate` — the keyframe moves `background-position-y` from `27px` to `-45px` and back (via `alternate`), producing a continuous, smooth bottom-to-top-to-bottom sweep with no pause and no hard reset cut — the shimmer breathes up through the logo and back down, forever.
- Below the logo, a single-line, muted (`text-stone-400` / dark: `text-stone-500`) message, deliberately set to `width: 240px` — noticeably wider than the `144px` logo above it. This is an explicit house rule: the logo should read as "a step down from text width," i.e. the text block is the visually dominant element and the logo is a subordinate accent, not the reverse.
- If an action is available (`actionLabel` + either `actionHref` or `onAction`), a single plain monochrome text link renders below the message: `text-stone-600` (dark: `text-stone-300`), with `underline decoration-dotted decoration-stone-400 underline-offset-4` — a dotted underline, no solid button fill, no background color, no border. This is explicitly not a colored CTA button; it's meant to read as a quiet, secondary affordance appropriate to an empty/waiting state, not a hard sell.

**Exact copy per card (verified directly from the current code):**
| Card | Empty-state text | Action label | Action href |
|---|---|---|---|
| Reach from generated assets | "Reach and click-through will show up here once a generated asset goes out." | Open asset library | `/asset-library` |
| Generated vs. used | "Generated vs. used will show up here once you've generated a few assets." | Open asset library | `/asset-library` |
| Latest generations | "Generate an email, image, or SMS with Blu to see it show up here." | Open asset library | `/asset-library` |
| Adoption mix | "Adoption mix will show up here once you've generated a few assets." | Open asset library | `/asset-library` |

All four link to the same destination (`/asset-library`) — there's no per-card destination variation (e.g. no card links directly to Journey Builder even though two of the four cards' core metrics are fundamentally about journey usage). This is worth a product look: for Card 2 (Generated vs. used) in particular, "Open asset library" doesn't really address the underlying gap (no assets used in journeys yet) as directly as, say, "Open journey builder" might.

---

## Color System

- **`#0080FF`** (solid brand blue) — used for every "confirmed, known, primary" data element on this page: the "Used" arc in Card 2's donut, the "Generated by Blu" segment in Card 4's proportion bar, the icon color inside Card 3's row-list badges (`text-blue-500`, effectively the same hue), and the play-icon fill on the "Watch intro" button. This follows the same house rule already established on Marketing and Analytics Home: "no random colors, all blues" for real/confirmed data.
- **`rgba(0,128,255,0.18)`** (translucent blue, 18% opacity) — used for the "Not used" track/arc in Card 2's donut. This is the *same* translucent-blue-track convention used on Analytics Home's audience rings (DAU/WAU/MAU) — a "remainder" or "unfilled" portion of a ring is rendered as a faint tint of the same hue rather than a neutral gray, because the remainder here is still a *known* quantity (we know exactly how many assets are unused; it's not an "unknown" category), it's just the smaller/complementary share.
- **`rgba(0,128,255,0.35)`** (translucent blue, 35% opacity) — used for the "Manually uploaded" segment of Card 4's proportion bar. Note this is a *higher* opacity than the 0.18 used in Card 2's donut track, and this is intentional, not an inconsistency: at the donut's ring thickness and small scale, 0.18 reads clearly against the card background, but at the proportion bar's larger, flatter surface area, the same 0.18 value read as too faint/washed-out, so it was bumped to 0.35 to stay visually legible as a "the same hue family, just quieter" segment rather than nearly disappearing into the background.
- **`rgba(0,128,255,0.08)`** — the very faint blue background tint behind each icon badge in Card 3's row list, distinct from the above two values and used purely as a subtle badge background, not a data-encoding color.
- **No grey/muted "unknown category" color appears anywhere on this page's four cards** — unlike the old Design Home's Credit Usage rings (which used slate-gray specifically to mean "unconfirmed category"), every number on the current page is presented as fully known and precise (31%, 60%, 82%, etc.), even though — per the gap analysis below — several of these numbers have no real backing data today. This is worth flagging: the color system currently has no visual vocabulary on this page for "this number isn't real/confirmed yet" the way the old page's gray rings did. If any of these cards ship with partial/low-confidence data in production, there is no existing color convention on *this specific page* to signal that — the gray-for-uncertain pattern would need to be reintroduced from the old page's precedent, or from `CardEmptyState`'s all-or-nothing empty/full toggle, which has no in-between state.
- **`var(--content-bg)`** — used only as the donut's `stroke` color in Card 2 (a 3px border between arc segments matching the card's own background), a structural/separator use of color, not a data-encoding one.
- **Stone/neutral grays** (`text-stone-400`, `text-stone-500`, `text-stone-600`, `text-stone-800`, `text-stone-900`, and their `dark:` variants) — used throughout for all text: headline numbers, labels, muted secondary text, and the empty-state message/link. None of this is data-encoding color; it's typography.

---

## What Would Need To Be Built

This is the most important section of this document. **Three of the four cards on this page (Reach, Generated vs. used, Adoption mix) have no real backing field for their core computation today.** Only Latest generations is close to fully buildable as-is. This section lays out concretely what backend/data-model work — not client instrumentation — would need to happen.

### Why this is a backend/data-model problem, not an SDK problem

Grounding this in what's actually confirmed to exist in the real product surface (per a code-grep-verified inventory of the Design product, `brand-kit`, `design-system`, `avatars`, `poses`, `scenes`, and `content-builder`/asset pages):

- **There is no Recharts usage anywhere in the real Design product pages.** Every chart-like visual element that exists in the real (non-Home) Design product is hand-rolled — the clearest example being `ScoreDonut`, an inline-SVG donut used only inside the Preflight dialog, with variants for points/percent/score and color thresholds at 80%/60%. This tells us two things: (1) the Home dashboard's use of Recharts donuts (Card 2) is a Home-specific convention, not something being reused from an existing real Design UI pattern, and (2) if this page's charts are ever rebuilt to visually match the rest of the real Design product, they'd likely move toward hand-rolled SVG (like `ScoreDonut`) rather than staying on Recharts — worth deciding intentionally rather than by default.
- **Every real content-list endpoint returns a shape that makes simple counts trivial.** `useBrandDesignQuery`, `useStudioQuery`, `usePoseQuery`, `useCharacterQuery`, and `useContentBuilderQuery().fetchItemsQuery` all return either a `{presets, custom}` object or an `{items}` array. This means "N generated this week," "N total assets," and similar plain-count metrics are genuinely easy/real to build — a `.length` call, not new infrastructure. Card 3 (Latest generations) and the "generated" side of Cards 2/4 fall into this easy category.
- **The Content Table's "Status: Active" pill is confirmed hardcoded** — always renders green, not wired to any real lifecycle field. This matters here because it rules out one tempting shortcut: you cannot infer "used in a journey" or "generated vs. uploaded" from any existing status field, because the one status field that does exist in the content table UI isn't even real.
- **A `quality` field exists server-side on content items** and is used for sorting, but is never rendered anywhere as a visible score today. This is a real, unused field — not relevant to any of the four current cards' formulas, but flagged below as a real opportunity for a *future* card (see "The Preflight pattern," below).
- **There is no confirmed field anywhere for "was this asset used inside a journey," and no confirmed field for "was this asset generated vs. manually uploaded."** These are the two central gaps behind three of the four cards on this page.

### Gap 1 — `sourceType` field (blocks Card 4: Adoption Mix)

**What's missing:** a `sourceType: 'generated' | 'uploaded'` (naming illustrative) field stamped onto a `ContentItemResponse` at creation time.

**How it would get set:** automatically, at the moment a content item is created, based on which code path created it — a Blu-chat generation call versus a manual file upload flow in the asset library. This is a one-time stamp, not something that needs to be recomputed or joined against other systems later.

**Why this is the easiest of the three gaps to close:** it requires no cross-product join. The generation call and the upload call are both already inside the same asset-library/content-builder codebase; this is a matter of adding one field to the write path of two existing create-item code paths, then exposing that field on read. No new relationship between systems, no new event stream, no Journeys involvement.

**Once it exists, Card 4's entire computation becomes:** group all content items by `sourceType`, count each group, done — `generatedPct = Math.round((count('generated') / totalCount) * 100)`. Recommend building this one first among the three gaps, both because it's the cheapest and because it unblocks a real number for a card whose current 82%/18% split is entirely two hand-set constants.

### Gap 2 — Journey-node-to-content join (blocks Card 2: Generated vs. Used)

**What's missing:** a join between the Journey Builder's canvas nodes (email/SMS/push node types — confirmed to be real node types in `journey-builder`) and each node's referenced `contentItemId`.

**The definition question that has to be settled first:** "used in a journey" = does at least one journey (in what statuses — live only? live + draft? any status including archived/paused?) have a node referencing this asset's ID? The card's current tooltip already picks an answer ("attached to a live or draft journey step") but this needs to be a deliberate product decision, ratified alongside the engineering work, because it directly changes the numerator.

**What needs to be built:**
1. Journey Builder nodes need to store (or already may store, unconfirmed) a `contentItemId` reference when an email/SMS/push node is configured to send a specific piece of content.
2. A query (or a denormalized/cached counter, if performance at scale demands it) that computes, per content item, whether at least one qualifying journey node references it.
3. `usedInJourneys` = count of distinct content items with at least one qualifying reference; `usedPct` = that divided by total generated.

**Why this is harder than Gap 1:** it spans two products (Asset Library / Content Builder, and Journey Builder), and depends on Journey Builder's node schema already capturing (or being extended to capture) a content reference at all, which is unconfirmed today — the inventory confirms the node *types* are real, not that they currently persist a content-item reference in a form this query could join against.

### Gap 3 — Message-level asset provenance on Sent/Opens/Clicks (blocks Card 1: Reach)

**What's missing:** journey message-level Sent/Opens/Clicks events (confirmed real fields, per the Journey Analytics surface) do not currently carry the `contentItemId` of the asset used in that specific send.

**What needs to be built:** each Sent/Open/Click event (or the message record it rolls up from) needs to additionally record which `contentItemId` was rendered into that particular send. This is different from Gap 2 in an important way: Gap 2 only needs to know "does this journey, in its current/latest configuration, reference this asset" (a structural, not historical, fact). Gap 3 needs a historical, event-level record — because a journey's node content can be edited over time, and Reach's "totals across all sends" language implies summing actual historical send events, not just "sends currently configured to use this asset." Getting Reach right requires the asset reference to be captured *at send time*, not read live from the journey's current configuration.

**Once it exists:** Reach's three numbers become straightforward filtered aggregates — `sends` = count of send events where `contentItemId` is in the set of Blu-generated/asset-library-sourced content; `opens`/`clicks` = the corresponding filtered counts; `openRate`/`clickRate` = the same formulas already implemented in the mock, just fed real numerators/denominators.

**Why this is the hardest of the three gaps:** it requires a schema change to an event stream that's presumably already flowing at volume (every send, open, and click across every journey), plus backfill considerations (historical sends before this field existed would have no `contentItemId`, so Reach's "totals across all sends" would need to either accept a hard start date or be explicitly scoped to "since this field was added").

### A reusable pattern worth carrying forward — the Preflight `ScoreDonut` / quality field

The Preflight dialog's `ScoreDonut`/`ContentQualityPanel` pattern is real today, but scoped to a single item's dialog — it is not currently a rollup metric across the whole library. It's flagged here because the server-side `quality` field it likely draws on already exists and is already used for sorting, it's simply never surfaced as a visible score anywhere in the UI today. This is a genuine, low-friction opportunity: a future card — e.g. "average content quality score across the library," or a Preflight-style score distribution — could be built on a field that already exists, without any of the cross-product joins that Gaps 1–3 require. It's not one of the four current cards' needs, but it's the single most "already have the data, just need to render it" opportunity visible in the current Design product surface, and worth product's attention as a candidate fifth card or a Card 2/4 replacement once the harder gaps are closed.

### Priority recommendation

If forced to sequence this work: **Gap 1 (Adoption Mix's `sourceType` field) first** — cheapest, single-system, unblocks one full card. **Gap 2 (Generated vs. Used's journey join) second** — moderate complexity, cross-system but structural (not historical) data. **Gap 3 (Reach's send-level asset provenance) last** — hardest, requires event-schema changes to a live telemetry stream plus backfill/scoping decisions. Latest generations needs none of this and could be made real today independently of any of the three gaps.

---

## SDK & Backend Reference

**The Intempt JS SDK** (per https://docs.intempt.com/js-sdk) auto-attaches `profileId`, `sessionId`, and `pageId` to every tracked event, and exposes three primary calls: `track()`, `identify()`, and `alias()`. This SDK is the client-side instrumentation layer for raw pageview/session/behavioral tracking — the kind of data that powers Analytics Home's page views, sessions, and active-user cards.

**Its relevance to this specific page is limited, and that should be stated plainly rather than force-fit.** Design Home's "Reach" numbers (Card 1) are fundamentally about **message sends** — a Journeys-product concept (a send goes out via email/SMS/push through a journey, independent of whether the recipient ever loads a web page with the SDK installed) — not about raw pageview or session tracking. An email open or a link click inside an email is typically tracked via server-side pixel/redirect infrastructure owned by the messaging/journey system, not via the client-side JS SDK's `track()` call. Similarly, Cards 2 and 4's core gaps (journey-node-to-content joins, generated-vs-uploaded provenance) are pure backend data-model problems inside the Asset Library and Journey Builder services — they have nothing to do with what the SDK captures on a website visitor's browser.

**Bottom line:** the bulk of what this page needs is new backend/data-model work inside **Journeys** (message-level asset provenance, node-to-content joins) and the **Asset Library** (a `sourceType` field at creation time) — not new client-side SDK instrumentation. Anyone scoping this work should route it to the Journeys and Content/Asset-Library backend teams, not to whoever owns the JS SDK.

---

## Open Questions for Product

1. Should Reach and Adoption Mix declare an explicit time window (matching house convention on Analytics/Marketing Home), or are they intentionally cumulative/all-time metrics? Current copy leans cumulative but this hasn't been decided explicitly.
2. Card 1's tooltip avoids the word "journey" per an explicit instruction, but Card 2's tooltip uses "journey step" directly — is this inconsistency intentional (per-card copy sensitivity) or should it be reconciled?
3. What exactly counts as "used" for Card 2 — live journeys only, live + draft, or any status including paused/archived? This directly changes the real numerator once Gap 2 is built.
4. Should each card's empty-state action link to a more targeted destination than `/asset-library` uniformly — e.g. should Card 2's empty state point toward Journey Builder instead, since its underlying gap is about journey usage, not asset creation?
5. Is there an existing color/visual convention this team wants to reuse for "this number is real but low-confidence" (like the old Credit Usage page's gray "N/A" ring), given the current page's color system has no such state and presents every number as fully confirmed?
