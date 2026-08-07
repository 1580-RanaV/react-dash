# Home Dashboard — Open Questions, Gaps & Doubtful Items (All 4 Pages)

Companion index to the four per-page PRDs in this repo: `analytics-home.md`, `marketing-home.md`, `design-home.md`, `sales-home.md`. Each of those documents flags its own open items inline; this file pulls every one of them into a single combined list so nothing has to be hunted down page by page. Organized cross-cutting first, then per page, then a suggested priority order for closing the real gaps.

---

## Cross-Cutting / App-Wide

1. **`CardEmptyState`'s trigger condition is manual everywhere, on all 4 tabs.** The empty-state UI itself (the `/hq.png` logo crop/shimmer, the one-line copy, the dotted-underline action) is fully built and identical across Analytics, Marketing, Design, and Sales. What's missing on every single tab is the *live* signal that would flip a real, under-provisioned workspace into that state automatically — today `noData` is only ever set by a developer/demo manually appending `/partial` to the URL, never by any real check like "does this workspace have enough send/segment/journey/event history." This is one gap, repeated four times, not four separate gaps.
2. **No color convention exists anywhere today for "this number is real but low-confidence."** The old Design Home page used gray "N/A" rings for exactly this state; the current version of every page presents every number as fully confirmed and precise, even on the cards (mostly on Design) where the underlying number has no real backing data at all. Worth deciding whether to reintroduce a "low-confidence" visual convention, and if so, where it should live (per-card, or as a `CardEmptyState`-adjacent partial-confidence variant).
3. **Dead code exists on two of the four tabs and should get an explicit resurrect-or-delete decision:**
   - Analytics: an entire unused function, `AnalyticsDashboard()` (no "Full" in the name — distinct from the live `AnalyticsFullDashboard()`), plus its constants `ANALYTICS_EVENT_TYPES`, `ANALYTICS_DEVICE_MIX`, `ANALYTICS_REVENUE_HEALTH` (Trial-to-paid/Churn), `ANALYTICS_AUDIENCE_SPLIT`. Also a separate dead constant, `ANALYTICS_FULL_KPIS` (a 5-metric KPI row — Active users, Page views, Sessions, Current MRR, Events received), defined but never rendered anywhere in the live page.
   - Design: an unrelated legacy function, `DesignDashboard()`, plus `DESIGN_ASSET_TYPES`, `DESIGN_RECS`, `DESIGN_BRAND_ITEMS` — a whole earlier version of the page (KPI tiles, Brand Kit completeness, Credits-with-warning, Blu recommendation cards) that isn't reachable through routing.
   - None of this dead code is harmful today (it isn't rendered), but it's a real risk that someone re-wires an old function/constant by accident thinking it's live. Recommend an explicit cleanup pass or an explicit "keep for reference" decision, not silence.
4. **One claim in an earlier draft of `marketing-home.md` was confirmed false during a verification pass and has since been corrected in place:** it originally claimed `/journeys` and `/experiences` were unregistered dead-end routes, based on a literal string search for `path="/journeys"` in `App.tsx` that came up empty. That check missed that `App.tsx` also mounts a generic route generator (`DASHBOARD_VIEW_KEYS.map(view => <Route path={`/${view}`} .../>)`), and `DASHBOARD_VIEW_KEYS` (in `src/lib/dashboardRoutes.ts`) includes `"journeys"`, `"experiences"`, `"deals"`, `"meetings"`, `"integrations"`, and `"asset-library"` among others. **All of these routes are real.** Every empty-state action link across all four Home tabs (`/journeys`, `/experiences`, `/integrations`, `/asset-library`, `/meetings`, `/deals`) resolves to a real page. Noted here explicitly so this false alarm doesn't get re-discovered and re-reported by someone skimming quickly later.

---

## Analytics Home — Open Items

*(see `analytics-home.md` for full detail)*

1. Dead code — see Cross-Cutting #3. `AnalyticsDashboard()` and its richer constants describe a superseded design (Revenue Health with Trial-to-paid/Churn, Event types, Device/browser mix) that is not what's live today.
2. Dead code — `ANALYTICS_FULL_KPIS`, a 5-metric bento KPI row, is fully defined but never rendered in `AnalyticsFullDashboard`. Resurrect as a real KPI row, or delete.
3. **Acquisition Mix's exact auto-captured field names are unconfirmed.** The JS SDK docs confirm "auto-tracking" broadly but do not enumerate which UTM/referrer/device/browser properties are captured automatically vs. requiring a manual `track()` call with custom `data`. Needs confirmation against the real event schema or the Sources/Traffic-board implementation before wiring this card with confidence.
4. **Acquisition Mix's percentage formula only sums to 100% across the visible top 3 channels today**, not against all channels. If a real "Other" overflow slice is ever added (a 4th palette color, `#D7E9FF`, is already reserved for exactly this), the formula must change to `source count / all-channels total × 100` — a deliberate decision point, not an automatic consequence of adding a slice.
5. Revenue Pulse's `"Current MRR · Aug 2026"` month label is a hardcoded string in the mock, not derived from a real date — trivial to fix, but flagged so it isn't shipped as-is.
6. **Explicit recommendation against adding "Goal progress" to Revenue Pulse.** Per the console feature inventory, `mrrGoal`/`subscriberGoal` are confirmed unpersisted, client-only state today with no save API — showing goal progress on Home would either be fake or require building a persistence layer first.
7. Journey-analytics field names (Triggered/Converted/Conversion rate/Days-to-convert) come from a search-engine-indexed summary only — a direct fetch of `help.intempt.com/journeys/overview` failed on a TLS/SSL handshake error during research. Field names are reliable-but-unconfirmed pending a successful direct read. (Low priority for Analytics specifically — Revenue Pulse and Activity don't depend on journey analytics; this matters more for Marketing.)

## Marketing Home — Open Items

*(see `marketing-home.md` for full detail)*

1. **Channel Mix's revenue split is not shippable today, independent of any frontend work.** Per the console feature inventory, the real codebase's `useBusinessPerformanceSummary.service.ts` hardcodes `revenuePerRecipient`, `emailRevenue`, `smsRevenue`, and `pushRevenue` to `0`. The `$X.XK rev` figures on every callout label and in the legend context are blocked on real backend work that hasn't happened — this is a stub returning zero, not an unfinished-but-real pipeline. This is the single most important "don't assume this is close to shippable" flag in the whole set of four documents.
2. Channel Mix's mock `pct` values are hand-set to sum cleanly to 100 (74+15+7+4); the actual count-derived shares are slightly different (74.2/15.3/6.9/3.6). In production, `pct` must always be derived from `count`, never hardcoded independently.
3. **Unit mismatch between two related cards' mock numbers.** Latest Journeys' four rows sum to `171` sends in the trailing 24h (`86+64+0+21`). Journey Anomaly Detection's "combined send volume" row shows a current value of `1.2k`, labeled "Last 24h." `171 × 7 ≈ 1,197 ≈ 1.2k` — so the anomaly card's number actually reads as roughly a **week's** total mislabeled as 24h. Looks like an attempt to keep the two cards' stories consistent, but the label is wrong as shipped.
4. Top Segments' rank order (1–4) doesn't correspond to a sort by any single visible column — not by `rate` (38.7% "Active trial users" outranks the 24.1% #1 row) and not by `members` (the largest audience ranks 3rd). If rebuilt for real, rank needs its own explicitly defined sort key (growth? recency of targeting? a composite score?) — it can't just be "sort by rate descending."
5. Top Segments' `change` value is labeled as a plain `%`, not reconciled with Analytics Home's own `pp` (percentage-point) vs. `%` convention for the same kind of period-over-period delta.
6. Segment member counts for account-based (B2B) segments need to be built on `group()` membership, not raw `profileId` counts, or they'll undercount/miscount — a real nuance the SDK anticipates that a naive implementation would miss.
7. **Journey Anomaly Detection needs an entire net-new detection pipeline that doesn't exist anywhere in the product today**: baseline computation (mean±Nσ, percentile band, or seasonal-adjusted), severity classification combining statistical deviation with hard business thresholds, a scheduled detection job (not a page-load computation) with dedup/"first seen at" tracking, and a minimum-volume guardrail so low-sample journeys don't get falsely flagged critical. This is the single largest piece of net-new infrastructure documented across all four pages.
8. Channel Mix's donut/legend uses a 4-color categorical palette (`#0080FF`/`#C37EE5`/`#59B277`/`#FFC44D`), not "all blues" as an earlier draft of the doc incorrectly asserted — now corrected. The page's "all blues for list-identity" rule has **two** legitimate exceptions (the disabled Segment Engagement Map scatter chart, and the live Channel Mix donut), not one.
9. Journey-level metrics (Triggered/Converted/Conversion rate/Days-to-convert avg) are a real, separately-tracked data model that neither Latest Journeys nor Journey Anomaly Detection currently taps — both cards use only message-level fields (Sent/Opens/Clicks). Not a bug, but a real, available data model this page hasn't incorporated; worth a deliberate scope decision.
10. The disabled Segment Engagement Map's quadrant thresholds (5,000 members / 20% engagement) are hardcoded splits, not computed medians — should move to the account's real median distribution if this card is ever re-enabled.
11. Same journey-analytics-doc-unreachable caveat as Analytics (see above) — more relevant here, since this page's Latest Journeys/Anomaly cards are the most likely candidates to eventually use those fields.

## Design Home — Open Items

*(see `design-home.md` for full detail — **this is the page with the most real gaps**)*

1. **Core gap 1 — no `sourceType` field exists anywhere** to distinguish "generated by Blu" vs. "manually uploaded" content items. Blocks **Adoption Mix**. Assessed as the cheapest of the three core gaps to close: a single new field stamped once at creation time, no cross-product join required.
2. **Core gap 2 — no join exists between Journey Builder canvas nodes and content-item IDs.** Blocks **Generated vs. Used**. Also raises an unsettled product question: does "used" mean referenced by a live journey only, live+draft, or any status including paused/archived? The card's current tooltip picks "live or draft," but this needs to be a deliberate ruling, not an implementation default, because it directly changes the numerator.
3. **Core gap 3 — Sent/Opens/Clicks events don't carry the asset/content ID that produced them.** Blocks **Reach from Generated Assets**. Needs an event-schema change to a presumably-already-flowing-at-volume telemetry stream, plus a backfill/scoping decision (historical sends before the field existed would have no `contentItemId` — either accept a hard start date or scope "totals" to "since this field was added").
4. **None of the four Design cards declare an explicit time window**, unlike the 30-day convention established on Analytics and Marketing Home. Open product decision: are Reach and Adoption Mix intentionally cumulative/all-time metrics (current copy — "totals," "your asset library" — reads that way), or should they get an explicit window for consistency?
5. Copy inconsistency: Card 1 (Reach) deliberately avoids the word "journey" in its visible text per an explicit instruction, but Card 2's (Generated vs. Used) tooltip says "journey step" directly. Intentional per-card copy sensitivity, or should it be reconciled?
6. All four empty-state actions point at `/asset-library` uniformly — even Card 2, whose actual gap (no journey usage yet) isn't really addressed by opening the asset library. Worth considering a more targeted destination (e.g. Journey Builder) for that specific card.
7. **No color convention exists on this page for "this number is real but low-confidence"** — see Cross-Cutting #2. This is most acute on Design, where 3 of its 4 cards currently render precise-looking percentages (31%, 60%, 82%) backed by no real join at all.
8. The real (non-Home) Design product surface uses zero Recharts anywhere — every real chart-like element (`ScoreDonut` in the Preflight dialog) is hand-rolled SVG. Worth an intentional decision on whether Home's Recharts donut (Card 2) should eventually match that convention if these cards are rebuilt for real.
9. Dead code — see Cross-Cutting #3 (`DesignDashboard()` and its constants).
10. **Opportunity, not a gap:** the Preflight dialog's `ScoreDonut`/`ContentQualityPanel` pattern is real, and the server-side `quality` field it likely draws on already exists (used for sorting) but is never rendered as a visible score anywhere. Flagged as the single most "already have the data, just need to render it" candidate for a future fifth card, or a replacement for Card 2/4 once the harder gaps above are closed.

## Sales Home — Open Items

*(see `sales-home.md` for full detail — **this is the best-grounded page, with the fewest real gaps**)*

1. **Pipeline: verify `winRate`'s units before reusing the real product's `conversionRate = winRate * 100` formula.** If the real API's `winRate` is already a percentage (matching this card's own `winRate: 42`), multiplying by 100 again would produce a number two orders of magnitude too large. Don't copy that formula verbatim without confirming the actual unit first.
2. Pipeline: **"forecast" is ambiguous** — could mean weighted open-pipeline value, or a separately configured target. Needs disambiguation before real implementation.
3. Pipeline: **"this period" is never defined anywhere in the current UI** (month? quarter? rolling 30/90 days?). Recommend an explicit period selector, or a documented default — current fiscal/calendar quarter is the suggested default, since win/loss rate are classically quarterly sales metrics.
4. Coming Up: the exact field name (and guaranteed presence) of a meeting's join/conferencing link is unconfirmed, and there's no defined fallback for a meeting with no video link (in-person meeting, or a calendar sync that didn't carry a conferencing URL).
5. Coming Up: the "due" countdown pill (e.g. "in 4 hours") is computed client-side as `startTime - now` and will visibly go stale within minutes if not recomputed on an interval or at least on every page focus/navigation — must not be baked into a cached server response.
6. Meeting Attendance: **no dedicated backend attendance-report endpoint exists yet** — already honestly disclosed in the card's own in-app tooltip. Either keep the current client-side `status`-field rollup, or build a lightweight backend weekly-rollup endpoint later; don't fabricate a report that doesn't exist. (This card's tooltip is flagged in `sales-home.md` as a positive pattern every other client-side-approximation card on Home should copy.)
7. Tasks: the standalone `/tasks` page's route is confirmed commented out/unreachable, even though the underlying query hooks (`useTasksQuery`) work fine when embedded elsewhere (Accounts/Users detail tabs). Doesn't block wiring Home's Tasks card to those hooks, but worth knowing the standalone page isn't there to link to.
8. Tasks: email-related task metrics and every `*Change` period-over-period delta are confirmed hardcoded to `0` in the real analytics response — doesn't currently affect this card (which shows neither), but would need to be remembered if the card is ever extended to show either.
9. Pipeline: `avgTimeToClose` is confirmed real in the backend response but not currently surfaced on this Home card at all — flagged as a ready-to-add, no-new-backend-work enhancement ("Av. time to close, Xd Yh" with a small circular gauge, exactly matching how the real Deals Analytics tab already renders it).

---

## Suggested Priority Order (if closing gaps)

Roughly cheapest/highest-leverage first, mixing quick-fix bugs with the larger buildability gaps:

1. **Sales Pipeline's `winRate`/`conversionRate` unit check** — cheap to verify, prevents shipping a silently-wrong number if this gets wired up before anyone checks.
2. **Design Gap 1 — `sourceType` field** — cheapest of the three Design core gaps, single-system, unblocks Adoption Mix fully.
3. **Marketing's Channel Mix revenue stub** (`revenuePerRecipient`/`emailRevenue`/`smsRevenue`/`pushRevenue` hardcoded to 0) — not a fix so much as a loud flag: don't let anyone assume the revenue half of this card is close to shippable just because the UI looks finished.
4. **Design Gap 2 — journey-node-to-content join**, once the "what counts as used" product question is settled.
5. **Marketing's anomaly-detection baseline/severity pipeline** — the single largest net-new piece of infrastructure documented across all four pages; sequence deliberately rather than bolting on partial versions.
6. **Design Gap 3 — message-level asset provenance on Sent/Opens/Clicks** — hardest of the three Design gaps: event-schema change plus backfill/scoping decision.
7. **The live "does this workspace have enough data" trigger for `CardEmptyState`**, across all four tabs — currently manual-only everywhere; this is one piece of work that upgrades all four pages' empty-state behavior at once, rather than a per-page fix.

Everything else in the per-page lists above is either a smaller polish item, an open product question with no wrong answer yet (time windows, sort keys, action-link destinations), or a dead-code cleanup decision — worth triaging, but not blocking.
