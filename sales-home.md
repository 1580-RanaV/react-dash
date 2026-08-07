# Sales Home PRD

Route: `/home?tab=sales/full`
Implementation: `src/components/HomeView.tsx` — `SalesHomeDashboard()`, `SalesTasksCard()`, `SalesTaskRow()`, `SalesSetupChecklist()`, and the shared `CardEmptyState()` component.

This document explains how every card, number, chart, badge, and empty state on the Sales Home dashboard is derived, what real Intempt backend data it needs, and what's mocked today vs. genuinely buildable. It mirrors the structure of `homepages-source.md` (Analytics Home) and `marketing-home-sources.md` (Marketing Home), applied to Sales.

**Headline takeaway, up front:** Sales Home is the best-grounded of all four Home tabs. Three of its four cards (Coming Up, Tasks, Pipeline) map almost directly onto CRM entities — Deals, Meetings, Tasks — that already have real backend query hooks and, in Pipeline's case, an already-shipped analytics endpoint that requires zero new backend work. The fourth card (Meeting Attendance) is an honest client-side rollup of a real field (`status`) rather than a fabricated report. Unlike the Analytics, Marketing, and Design Home tabs (documented in their own sibling files, `analytics-home.md`, `marketing-home.md`, and `design-home.md`), Sales' data model is CRM records, not client-side behavioral events — so this page needs essentially no new tracking instrumentation, no new event schema, and no new attribution model. The gaps here are almost entirely "wire the UI to an existing hook" gaps, not "build new backend infrastructure" gaps like the other three tabs have (e.g. Marketing's anomaly-detection baseline engine, Analytics' revenue attribution).

## Default Time Window

- **Coming up** has no fixed window — it is a forward-looking queue (soonest 3 upcoming meetings), not a trailing-period metric. It should always show "next 3 by start time," regardless of calendar period.
- **Meeting Attendance** uses a **5-week trailing window**, bucketed weekly (the current mock spans Jun 9 – Jul 7, five Monday-anchored weeks). This differs from Analytics Home's 30-day/daily convention and Marketing Home's 30-day/24h split — Sales' natural cadence is weekly (a sales team reviews meeting cadence week over week, not day over day), so weekly buckets are the right default here, not a deviation to fix.
- **Tasks** has no period at all — it is a live, unwindowed queue split into two fixed buckets: **Overdue** (`dueDate < today`, always shown regardless of age) and **Today** (`dueDate == today`). This is correct for a to-do list; a to-do list should never say "tasks from the last 30 days," it should say "what's late and what's due now."
- **Pipeline** says "this period" explicitly in its own description ("Deal value, win rate, and loss rate for open and closed deals this period") but the current mock does not specify what "this period" resolves to (month? quarter? rolling 30/90 days?). In production this should be an explicit, user-visible period selector or a documented default (recommend: current fiscal/calendar quarter, since win rate and loss rate are classically quarterly sales metrics, unlike Analytics' 30-day product-usage convention).

Reasoning: Home should still give one consistent "recent operating snapshot" per card, but Sales' natural units (a live queue, a weekly cadence, a quarterly pipeline view) are legitimately different from Analytics'/Marketing's daily-cadence product metrics. The Meeting Attendance tooltip already gets this right by being explicit about what it aggregates ("by week") rather than staying silent about its window like some Analytics/Marketing cards do.

## Page Layout (current, top to bottom)

1. Greeting row + setup checklist toggle (`SalesSetupChecklist`, checklist title "Finish scheduler setup," three steps: Connect your calendar / Create a booking type / Enable meeting reminders) + "Watch intro" button (opens a video overlay via `VideoOverlay`, matching the Analytics/Marketing header pattern exactly).
2. 2×2 grid (`xl:grid-cols-2`), in DOM/visual order:
   1. **Coming up** (inline `SectionCard`, not a named component)
   2. **Meeting Attendance**
   3. **Tasks** (`SalesTasksCard`)
   4. **Pipeline**
3. No upgrade strip below the grid — the upgrade strip was removed product-wide this session and does not appear on Sales Home (nor, presumably, on the other three tabs anymore).

This mirrors the Analytics/Marketing Home philosophy directly: four composite cards, no dense grid of small charts, per the documented "fewer, higher-quality charts on Home" philosophy. Notably, Sales Home has no equivalent of Marketing's disabled "Segment Engagement Map" experiment or Analytics' larger card set — it has stayed at a clean 2×2 with no additional row, which is itself a signal that this tab was scoped tightly from the start rather than trimmed down after overbuilding (contrast with Marketing's "What Was Removed and Why" history).

---

## Card 1: Coming Up

**Purpose:** Surface the next few meetings a rep needs to show up for, with a one-tap join action. Answers "what do I have to be ready for right now?"

**UI:** An inline `SectionCard` (not extracted into its own named component) with a header row consisting of the title "Coming up" on the left and a rounded blue pill badge reading "Meetings" on the right — this replaces the usual description-line pattern used by the other three cards on this page. Below the header, a vertical list of meeting rows. Each row is a 3-column grid (`grid-cols-[56px_1fr_auto]`):
- **Left:** a 56×56px rounded-2xl blue tile (`bg-blue-50`/`text-blue-600` light, `bg-blue-500/12`/`text-blue-300` dark) showing the month abbreviation (10px, e.g. "JUN") stacked above the day number (20px, e.g. "10").
- **Middle:** the meeting title (bold), then below it the start time (e.g. "7:00 PM") next to an orange "due soon" pill (`bg-orange-50`/`text-orange-600` light, `bg-orange-500/12`/`text-orange-300` dark) reading a relative countdown like "in 4 hours" or "in 3 days."
- **Right:** a solid blue (`#0080FF`) pill button with a `Video` icon (Lucide) and the label "Join now."

**Chart type:** None — this is a row-list card, not a chart card.

**Data source:** Intempt Meetings.

**Current mock data (exact, 3 rows, hardcoded inline in `SalesHomeDashboard`):**
```
{ date: "JUN 10", title: "FieldsUSA demo",          time: "7:00 PM",  due: "in 4 hours" }
{ date: "JUN 10", title: "Linea renewal call",      time: "8:00 PM",  due: "in 5 hours" }
{ date: "JUN 13", title: "StockInvest onboarding",  time: "12:15 PM", due: "in 3 days"  }
```

**Required raw fields:**
- `meeting.startTime` (timestamp)
- `meeting.title`
- `meeting.joinUrl` / video-conferencing link (Zoom, Google Meet, or an Intempt-native meeting link)
- (implicitly) `meeting.status` or a way to know the meeting hasn't started/ended yet, so past meetings don't leak into "coming up"

**Derivations:**
- The list itself is a **direct pass-through**, not a computed aggregate: filter the meetings list to `startTime > now`, sort ascending by `startTime`, take the first 3.
- `date` (month + day tile) is a direct format of `startTime`.
- `time` is a direct format of `startTime` in the viewer's local time.
- **`due` (the countdown pill) is the one genuinely derived field on this card**, and it needs care: it is computed as `startTime - now`, then formatted to the coarsest sensible unit — hours if the delta is under 24 hours ("in 4 hours"), days otherwise ("in 3 days"). This is explicitly **not** a stored field. If it were computed once at page-load and never refreshed, it would visibly drift stale within minutes (a meeting that says "in 4 hours" at 3pm should say "in 3 hours" by 4pm without a page reload). Production implementation should either recompute it on an interval (e.g. every 60s) while the card is mounted, or at minimum recompute on every page navigation/focus — never bake it into a server response and cache it.
- The "Join now" button's existence is itself a product requirement, not just a UI detail: it implies every meeting record needs a real, clickable video-conferencing join link. If a meeting was created without a video link (e.g. an in-person meeting, or a meeting synced from a calendar that didn't carry a conferencing URL), this button needs a defined fallback behavior (disabled state, or swap to a calendar-detail link) rather than a dead/broken link.

**Why this is buildable:** This is the simplest card on all of Home to justify: it requires no aggregation, no rate calculation, no attribution — just a sort-and-slice over meetings the product already stores, plus one small piece of client-side arithmetic (the countdown). The only real backend dependency is that the meeting record carries a join-link field, which is a reasonable assumption for any product that syncs calendar/video meetings at all.

**Waiting/empty state:** Handled by `CardEmptyState` (see below): text "Book or sync a meeting to see it show up here.", action label "Open meetings" linking to `/meetings`.

---

## Card 2: Meeting Attendance

**Purpose:** Show whether scheduled meetings are actually happening, week over week. Answers "are we losing meetings to no-shows/cancellations, or is our show-rate healthy?"

**UI:** `SectionCard` with title "Meeting Attendance", description "Scheduled vs. completed meetings by week.", and a heading tooltip reading: *"Derived from each meeting's status field. There's no dedicated attendance report yet, so this is aggregated client-side from your meetings list."* Below the header: a small centered two-item legend — a short horizontal line swatch in blue (`#0080FF`) labeled "Scheduled," and a short horizontal line swatch in green (`#16a34a`) labeled "Attended" — above a Recharts `ComposedChart`:
- `Bar` for `scheduled`: fill `rgba(0,128,255,0.15)` (translucent blue), rounded top corners (`radius: [2,2,0,0]`), `maxBarSize: 28`.
- `Line` for `attended`: solid green stroke `#16a34a`, `strokeWidth: 2`, dot radius 3.
- X-axis: 5 weekly labels ("Jun 9," "Jun 16," etc.), no axis line, 9px muted tick labels.
- Y-axis: numeric count, no axis line, same muted tick style.
- Custom `ChartTooltip` on hover.

**Chart type:** Recharts `ComposedChart` (`Bar` + `Line` combo), 220px height, `ResponsiveContainer`.

**Data source:** Intempt Meetings — specifically each meeting's own `status` field, which is confirmed to already exist in the product (it's the same field used elsewhere for meeting segment filters: all / upcoming / past / recorded).

**Current mock data (`SALES_MEETINGS_TREND`, exact, 5 rows):**
```
Jun 9:  scheduled 12, attended 9
Jun 16: scheduled 15, attended 13
Jun 23: scheduled 11, attended 10
Jun 30: scheduled 14, attended 12
Jul 7:  scheduled 9,  attended 7
```

**Required raw fields:**
- `meeting.startTime` (to bucket into weeks)
- `meeting.status` (to classify attended vs. not)

**Derivations:**
- `scheduled[week]` = count of meetings whose `startTime` falls inside that week bucket, **regardless of outcome** — every meeting that was ever put on the calendar for that week counts, whether it happened, was cancelled, or no-showed.
- `attended[week]` = count of that same week's meetings whose `status` resolved to something like `completed`/`attended` (as opposed to `no-show`, `cancelled`, or still-`upcoming` if the week hasn't finished yet).
- No further ratio is shown on the card itself (no "82% attendance rate" number is displayed), though one is trivially derivable (`attended / scheduled * 100`) as a future enhancement.

**Why this is buildable, and why the tooltip is worth calling out as a pattern:** This is the one card among **all four Home tabs** whose own in-app tooltip already honestly states there is no dedicated backend report for it yet ("There's no dedicated attendance report yet, so this is aggregated client-side from your meetings list."). That is the *correct* way to ship a legitimate client-side approximation: it doesn't pretend to be backed by a purpose-built analytics endpoint, it says exactly what it is — a rollup over a field (`status`) that is already real and already used elsewhere in the product. Contrast this with cards on other Home tabs that render numbers without disclosing they're approximations. **Recommendation: every other card on every Home tab that is a client-side rollup rather than a dedicated backend report should adopt this exact tooltip pattern** — name the source field, and say plainly that no dedicated report exists yet.

**Waiting/empty state:** `CardEmptyState` with text "Scheduled vs. completed meetings will chart here once you have meeting history.", action label "Open meetings" linking to `/meetings`.

---

## Card 3: Tasks

**Purpose:** Give reps a lightweight to-do surface without leaving Home. Answers "what's overdue, and what do I need to do today?"

**UI:** `SalesTasksCard`, title "Tasks", description "Overdue and today's tasks across your deals and meetings.", tooltip "Used to track outstanding to-dos without leaving Home. Add a task directly in the Today section." The card renders inside a **fixed-height container, `h-[390px]`, with `overflow: hidden` on the outer card and `overflow-y-auto` on an inner scroll region** — this is an explicit layout decision, not an accident: it means the card never grows as tasks are added or as more overdue items accumulate; instead the *list inside it* scrolls. This matters because on a 2×2 grid, one card silently growing taller than its neighbors breaks the whole row's alignment — worth documenting as a UI/layout rule other list-style Home cards should follow.

Inside the scroll region, top to bottom:
1. **Overdue section** — only rendered at all if `overdueTasks.length > 0`. A clickable header row: "Overdue" label, a red circular count badge, and a `ChevronDown` icon that rotates -90° when collapsed (click toggles `overdueOpen` state, default open). Each row below it (`SalesTaskRow`): a circular checkbox (fills solid blue `#0080FF` with a white checkmark when done), a `GripVertical` drag-handle icon (visual affordance only — no drag-and-drop reordering is wired up), the task title (strikethrough + muted when done), and the due date **rendered in red** (`text-red-500`) when the task is overdue and not yet done.
2. **Today section** — header row: "Today" label plus a plain count (no colored badge, unlike Overdue). Same `SalesTaskRow` styling, except the due date is **never red-tinted** here (it just reads "Today" in muted stone), since these aren't late.
3. **Persistent add-task input** — pinned at the bottom of the card, **outside** the scrollable region (`shrink-0`, below the `flex-1 overflow-y-auto` list container), bordered, with a `Plus` icon and placeholder "Add a task...". Typing a title and pressing Enter calls `addTask()`, which appends `{ id: \`custom-${Date.now()}\`, title, due: "Today" }` to local `todayTasks` state immediately (fully optimistic, no request/response round-trip modeled) and clears the input.

**Chart type:** None — row-list + inline form, no chart.

**Current mock data (exact):**
- `SALES_OVERDUE_TASKS` — 4 rows, all due "Jun 18": "Follow up with FieldsUSA on pricing," "Send renewal contract to Linea," "Update deal stage for Acme Corp," "Confirm demo attendees for Thursday."
- `SALES_TODAY_TASKS` — 1 row: "Prep agenda for Linea renewal call," due "Today."

**Required raw fields:**
- `task.title`
- `task.dueDate`
- `task.completed` (boolean/status)
- `task.relatedEntity` — a link from the task to the Deal or Meeting it belongs to, since the card's own description says "across your deals and meetings," implying tasks shown here are a **union** of task records associated with either entity type, not a separate free-floating task list scoped only to "Sales."

**Derivations:**
- `overdueTasks` = tasks where `dueDate < today` AND `completed == false`.
- `todayTasks` = tasks where `dueDate == today` AND `completed == false`, **plus** any tasks added locally via the input during the current session (until that optimistic write is confirmed/persisted by a real backend call).
- No counts, percentages, or completion-rate math are shown on this card itself — it is a pure queue, not a metrics card. (Compare to Card 4, Pipeline, which is all percentages/formulas — Tasks and Pipeline are intentionally different card *genres* sitting next to each other in the grid.)

**Why this is buildable — and unusually well-grounded already:** A real Tasks backend already exists via `useTasksQuery()`, exposing both `.fetchListQuery` (a real task list, presumably filterable by related-entity and due date — exactly what Overdue/Today need) and `.fetchAnalyticsQuery` (a confirmed real `TasksAnalyticsResponse` containing Completed count, Pending count, Active-high-priority count, a Completion-rate percentage, an Overdue count + table, and a completion leaderboard). This is strictly more than what the Home card currently shows — the Home card could be built as a thin filtered view over `fetchListQuery` for Overdue/Today, with `fetchAnalyticsQuery`'s Overdue count/table as a second potential data source for the same section.

Two confirmed caveats worth flagging explicitly, because they happen to *not* hurt this card:
1. **Email-related task metrics are hardcoded to 0** in the real analytics response, pending backend support. The Home card never shows an email-task metric, so this gap doesn't currently surface here — but it should be remembered if this card is ever extended.
2. **Every `*Change` period-over-period delta on every task metric is hardcoded to 0**, because "the API doesn't provide change" for tasks yet. The Home Tasks card correctly shows **no** change/delta badge anywhere on this card (unlike Pipeline's Win rate/Loss rate rows, which do show `ChangeBadge`s) — this is a case where **the UI is already accidentally honest**: it happens to omit exactly the one thing the real backend can't currently support. This is worth stating as a positive precedent, the same way Meeting Attendance's tooltip is a positive precedent — the design already avoided promising a number that doesn't exist yet, whether or not that was deliberate.

Also worth flagging: the standalone `/tasks` page is **currently not routed/reachable** in the product (its route is commented out), even though the underlying task-list/task-row components work fine when embedded elsewhere (e.g. inside Accounts and Users detail tabs). Practically, this means a real Home Tasks card would be pulling from a query hook (`useTasksQuery`) that is fully functional and already used in production surfaces — it is simply not yet exposed as its own top-level page. Wiring it into Home does not depend on that page ever shipping.

**Empty state — the one card on Home with a genuinely different pattern:** When both Overdue and Today are empty, `CardEmptyState` is passed `onAction` (a callback) instead of `actionHref` (a link), and it renders as a `<button>` rather than an `<a>`. The label is "Create new task," text is "No tasks yet.", and the click handler is `() => inputRef.current?.focus()` — it does not navigate anywhere; it **focuses the already-visible "Add a task..." input pinned at the bottom of the same card**. This is the only empty state on all of Home whose action creates something in place rather than linking out to another page. That's the right call specifically for this card: the creation UI (the input) is already rendered and visible in the same viewport as the empty state, so sending the user to `/tasks` (which, notably, isn't even reachable today) or anywhere else would be a strictly worse experience than just focusing the input that's two inches below the empty-state message. Every other empty-state action on Home links out because those cards' creation flows genuinely live on another page (`/meetings`, `/deals`); Tasks is the one exception because its creation flow lives in the card itself.

---

## Card 4: Pipeline

**Purpose:** Show how much revenue is currently active in the pipeline and how efficiently deals are converting. Answers "how much are we going to close, and are we winning or losing more than usual?"

**UI:** Title "Pipeline", description "Deal value, win rate, and loss rate for open and closed deals this period.", tooltip "Used to see how much revenue is currently in active deals and how efficiently they're closing." Split into two halves:

**Left half** — a large Recharts donut gauge:
- `PieChart` / `Pie` / `Cell`, `innerRadius: 68%`, `outerRadius: 92%`, `startAngle: 90`, `endAngle: -270` (i.e., drawn clockwise starting at 12 o'clock, matching Analytics Home's Audience Quality donut convention), `paddingAngle: 2`.
- Two cells: `#0080FF` solid blue for the health value's arc, `rgba(0,128,255,0.18)` translucent blue for the remainder-to-100 arc.
- Centered inside the donut hole: the health score as a large number ("72"), then "PIPELINE HEALTH" as a small uppercase muted label with an info-tooltip icon (`HeadingTooltip`) reading: *"A 0 to 100 score summarizing deal velocity, win rate, and forecast coverage."*

**Right half**, top to bottom:
1. **Value-won stat**: a large dollar figure ("$186.4K") with "of $240K forecast" in a muted label to its right, then a one-line caption "Value won this period," then a thin (`h-2`) rounded blue progress bar underneath showing value-won's share of forecast.
2. **Win rate row**: label "Win rate," the percentage value ("42%"), a `ChangeBadge` showing the period-over-period move ("+3%"), and a thin green (`#16a34a`) progress bar sized to the raw percentage.
3. **Loss rate row**: same layout, label "Loss rate," value ("18%"), `ChangeBadge` ("-2%"), thin red (`#ef4444`) progress bar.
4. **"Largest deal won" highlight box**: a muted-background (`var(--muted)`) row at the bottom with the label on the left and the dollar value ("$24.5K") on the right.

**Chart type:** Recharts `PieChart`/`Pie`/`Cell` donut gauge (left) + plain HTML/CSS stat rows with thin div-based progress bars (right) — no Recharts chart on the right half.

**Current mock data (`SALES_PIPELINE`, exact):**
```
valueWon: 186400        →  "$186.4K"
forecast: 240000        →  "$240K"
pipelineHealth: 72
winRate: 42             winRateChange: "+3%"
lossRate: 18            lossRateChange: "-2%"
maxWin: 24500           →  "$24.5K"
```

**Formulas actually implemented in code:**
- Value-won progress bar width: `Math.min((valueWon / forecast) * 100, 100)`% — capped at 100% so an overshoot (value won exceeding forecast) doesn't overflow the bar visually.
- Win-rate and loss-rate bar widths: the raw percentage value used directly as a CSS width percentage (no additional math — `42%` value literally renders a `42%`-wide bar).
- Dollar formatting: `${(n / 1000).toFixed(1)}K` for `valueWon` and `maxWin` (one decimal, e.g. "$186.4K," "$24.5K"); `${(n / 1000).toFixed(0)}K` for `forecast` (no decimal, e.g. "$240K"). This asymmetry (one decimal for won/max, zero for forecast) is intentional in the current code and should be preserved or deliberately reconsidered, not "fixed" as an inconsistency by accident.

**Required raw fields:**
- Deal `value`/`amount` and `stage`/`status` (open vs. won vs. lost), rolled up into `valueWon`, `forecast` (open pipeline value or a separately-set target), `winRate`, `lossRate`, and `maxWin`.
- A pipeline-health scoring model that combines deal velocity, win rate, and forecast coverage into a single 0–100 number.

**Derivations:**
- `valueWon` = sum of `value` across deals marked won in the period.
- `forecast` = either the sum of open/weighted pipeline value expected to close in the period, or a separately configured target — needs disambiguation in the real implementation, since "forecast" can mean either depending on convention.
- `winRate` = won deals / (won + lost) deals (or won value / total resolved value — needs the same "count vs. value" disambiguation the win/loss language always needs).
- `lossRate` = the complementary "lost" version of the same ratio.
- `pipelineHealth` = a composite 0–100 score; the card's own tooltip already states its inputs explicitly ("deal velocity, win rate, and forecast coverage"), so this is not a mystery number — it's a documented composite metric, just one whose exact weighting formula isn't specified in the UI copy.
- `maxWin` = the single largest deal `value` among deals won in the period.
- `winRateChange` / `lossRateChange` = period-over-period delta vs. the prior equivalent period, shown via `ChangeBadge`.

**This is the single best-grounded card across all four Home tabs.** Deals Analytics is confirmed **100% real, not mocked**, via `useDealsQuery().fetchAnalyticsQuery()` → `POST {org}/projects/{project}/deals/analytics` → a `DealsAnalyticsResponse` type that already contains, verbatim:
- `totalWon` — maps directly onto this card's `valueWon`.
- `forecast` — maps directly onto this card's `forecast`.
- `winRate` / `winRateChange` — maps directly onto this card's Win rate row, badge included.
- `lossRate` / `lossRateChange` — maps directly onto this card's Loss rate row, badge included.
- `maxWin` / `maxWinChange` — maps directly onto this card's "Largest deal won" box (note the real API even has a `maxWinChange` the current Home card doesn't display at all — a trivial, already-available enhancement).
- A **pipeline-health gauge** (0–100) that is already rendered elsewhere in the real product using the exact same chart type/pattern this card already uses — a Recharts `Pie` gauge with a centered score label. This card isn't just conceptually similar to something real; it is visually reusing a pattern that already exists for this exact metric.
- `avgTimeToClose` (in milliseconds) — **confirmed real, but not currently surfaced on this Home card at all.** This is a clean, low-effort enhancement candidate: add an "Av. time to close, Xd Yh" stat with a small circular gauge, exactly as the real Deals Analytics tab already renders it, since the underlying data point already exists and is simply unused on Home today.
- `conversionRate`, defined in the real product as `winRate * 100`. **Flag this explicitly before reusing it**: if `winRate` in the real API is already expressed as a percentage (e.g. `42` meaning 42%, matching this card's own `winRate: 42`), then multiplying by 100 again to get `conversionRate` would produce a number two orders of magnitude too large (`4200` instead of `42`). Verify the actual unit of `winRate` in the real response before wiring `conversionRate` into any UI — don't blindly copy the `winRate * 100` formula without confirming what `winRate`'s own units already are.

**Say this explicitly:** unlike every other card across all four Home tabs, **this card requires zero new backend work.** It is a subset of an already-shipped, already-real analytics endpoint. The only engineering work needed is wiring the existing `useDealsQuery().fetchAnalyticsQuery()` hook into this Home card in place of the `SALES_PIPELINE` mock constant — no new schema, no new rollup job, no new attribution model, nothing resembling the anomaly-detection baseline infrastructure Marketing Home's Journey Anomaly card needs, or the revenue-attribution join Marketing's Channel Mix card needs.

**Waiting/empty state:** `CardEmptyState` with text "Deal value, win rate, and pipeline health will show up here once you add a deal.", action label "Open deals" linking to `/deals`.

---

## Shared Empty State: `CardEmptyState`

All four cards on Sales Home use the same shared empty-state component used identically across the other three Home tabs (`DesignHomeDashboard`, `MarketingHomeDashboard`, `AnalyticsHomeDashboard`) — this is the current, exact implementation, not a paraphrase:

- **Brand mark:** the Intempt logo (`/hq.png`, a glowing blue circular whale-tail mark), rendered at 144px but displayed inside a **72px-tall container** (`height: logoSize / 2`) with `overflow: hidden` — so only the **top half** of the circular mark is ever visible, cropped at the equator. The image itself additionally carries `filter: grayscale(1)` and `opacity: 0.55` (desaturated, dimmed — appropriately muted for an empty state, not a celebratory brand moment), plus its own `mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 52%)` so the visible top half *also* fades out toward the crop line, rather than getting hard-cropped.
- **Shimmer overlay:** a second layer sits on top of the logo, `background: linear-gradient(to top, transparent, rgba(255,255,255,0.9) 50%, transparent)`, `background-size: 100% 90px`, masked by `mask-image: url(/hq.png)` — i.e., masked by the **PNG's own alpha channel**, so the shimmer band only ever lights up pixels that actually belong to the logo shape, never the transparent cutout around it. `mix-blend-mode: overlay` blends it into the dimmed logo underneath rather than washing it out. Animated via `animation: shimmer-sunrise 2s ease-in-out infinite alternate`, a keyframe that moves `background-position-y` from 27px to -45px — a continuous, smooth sweep from bottom to top and back, with no pause at either end (the `alternate` direction is what removes the pause a `infinite` loop alone would have at the reset point).
- **Message:** one line of muted (`text-stone-400` light / `text-stone-500` dark) text, fixed at 240px wide — deliberately wider than the 144px logo above it, so the text block doesn't feel cramped relative to the mark.
- **Action (link variant):** for the 3 of 4 cards that link elsewhere, a plain monochrome text link — `underline decoration-dotted decoration-stone-400 underline-offset-4`, `text-stone-600` (light) / `text-stone-300` (dark) — deliberately **not** a colored button or pill. This keeps empty states visually quiet; they're a waiting/setup state, not a call-to-action moment that should compete for attention with real data elsewhere on the page.

**Exact current copy, verified directly from `HomeView.tsx`:**

| Card | Empty-state text | Action label | Action target |
|---|---|---|---|
| Coming up | "Book or sync a meeting to see it show up here." | "Open meetings" | `actionHref="/meetings"` |
| Meeting Attendance | "Scheduled vs. completed meetings will chart here once you have meeting history." | "Open meetings" | `actionHref="/meetings"` |
| Tasks | "No tasks yet." | "Create new task" | `onAction={() => inputRef.current?.focus()}` |
| Pipeline | "Deal value, win rate, and pipeline health will show up here once you add a deal." | "Open deals" | `actionHref="/deals"` |

**Special case — Tasks' empty state is structurally different from the other three, and deliberately so.** `CardEmptyState` accepts either `actionHref` (renders an `<a>`, navigates to another page) or `onAction` (renders a `<button>`, runs a callback in place). Coming Up, Meeting Attendance, and Pipeline all use `actionHref`, because their "create the missing thing" flow genuinely lives on a different page (`/meetings`, `/deals`). Tasks is the **only** card that uses `onAction`, and its callback doesn't navigate at all — it calls `inputRef.current?.focus()`, focusing the "Add a task..." input that's already rendered at the bottom of the very same card, immediately below the empty-state message. This is the right pattern specifically because the creation UI is already on-screen: routing the user to `/tasks` would not only be an unnecessary hop, it would currently be a broken one, since the standalone `/tasks` page's route is commented out and unreachable today. Every other card's empty-state action correctly points outward because that's genuinely where the missing data gets created; Tasks correctly points inward because that's genuinely where its missing data gets created too — the pattern is consistent, only the destination differs based on where the real creation flow actually lives.

---

## Color System

- **Solid Intempt blue (`#0080FF`)** is the single primary/brand color across this page: the "Join now" button, Coming Up's date tiles, Coming Up's "Meetings" header pill, the Scheduled bar and legend swatch on Meeting Attendance, the completed-task checkbox fill on Tasks, the value-won progress bar and the pipeline-health donut's filled arc on Pipeline. This matches the "all blues for anything identifying brand/primary action" convention documented on Marketing Home — Sales Home never introduces a second brand-adjacent hue (no purple, no teal) the way Analytics Home's product-activity chart legitimately needs to (multiple simultaneous line series requiring visual separation).
- **Translucent blue (`rgba(0,128,255,0.18)`–`0.15`)** is used specifically for "the remainder" or "the un-attended/un-won portion" of a whole — the pipeline-health donut's second cell, and the Scheduled bar's fill on Meeting Attendance (Scheduled is drawn faint/translucent precisely because it's the *baseline* volume, while Attended, the number that actually matters, is drawn as a solid, higher-contrast green line on top of it). This is a meaningful convention, not decoration: translucent blue = "the total/context," solid color = "the number to look at."
- **Green (`#16a34a`)** is reserved for positive/successful outcomes: the Attended line on Meeting Attendance, the Win rate progress bar on Pipeline. This is a deliberate departure from Analytics Home's own documented rule ("avoid green KPI badges on Analytics Home... to keep the card system visually consistent") — Sales Home *does* use green for a positive metric, and that's the right call here specifically because Win rate and Attended are unambiguously "good news" metrics being shown directly adjacent to their "bad news" complements (Loss rate, and the gap between Scheduled and Attended), so the green/red contrast is carrying real information, not just cheerful branding.
- **Red (`#ef4444` for the Loss rate bar; `text-red-500`/`bg-red-500` for overdue task due-dates and the Overdue count badge)** is reserved the same way — signed-negative/at-risk information only. Never decorative.
- **Orange** appears in exactly one place: the "due soon" countdown pill on Coming Up ("in 4 hours"). This is a distinct third semantic color (not blue, not red/green) used specifically for urgency/time-pressure, which is a legitimately different concept from "good" (green) or "bad" (red) — a meeting being soon isn't inherently good or bad, it's just imminent, so it earns its own color rather than being forced into the win/loss palette.
- **Neutral stone** for all labels, secondary text, axis ticks, borders, and the drag-handle icon — matching the shared convention across all Home tabs.

## Backend & API Reference

Per card, the real Intempt query hooks that already exist and that a real implementation should wire into, replacing the mock constants named above:

| Card | Real hook(s) | What it already returns | Gap to close |
|---|---|---|---|
| **Coming up** | `useMeetingsQuery().fetchUpcomingMeetingsQuery` (and/or `.fetchOngoingMeetingsQuery` for a "starting now" variant) | A real upcoming-meetings list with `startTime`, `title`, and presumably a join/conferencing link field | Confirm the join-link field name and add client-side countdown formatting + a refresh interval so the "due" pill doesn't go stale |
| **Meeting Attendance** | `useMeetingsQuery().fetchListQuery`, filtered/grouped client-side by `status` and week-bucketed `startTime` | A real meetings list with a real `status` field (already used for the existing all/upcoming/past/recorded segment filters) | No dedicated attendance-report endpoint exists yet — this card's own tooltip already says so; the honest fix is a client-side rollup (as now) or, longer-term, a lightweight backend weekly-rollup endpoint, not a fabricated one |
| **Tasks** | `useTasksQuery().fetchListQuery` (Overdue/Today filtering), `useTasksQuery().fetchAnalyticsQuery` (Completed/Pending/Active-high-priority/Completion-rate%, Overdue count+table, completion leaderboard) | A real, working task list and a real, working `TasksAnalyticsResponse` — both already used in production (Accounts/Users detail tabs), just not on a standalone `/tasks` page (route currently commented out) | Email-task metrics hardcoded to 0 (no backend support yet); every `*Change` delta hardcoded to 0 (API doesn't provide change yet) — both gaps happen to not affect the current Home card, which shows neither |
| **Pipeline** | `useDealsQuery().fetchAnalyticsQuery()` → `POST {org}/projects/{project}/deals/analytics` → `DealsAnalyticsResponse` | `totalWon`, `forecast`, `winRate`/`winRateChange`, `lossRate`/`lossRateChange`, `maxWin`/`maxWinChange`, a pipeline-health gauge value, `avgTimeToClose`, `conversionRate` — i.e., everything this card needs and more | None functionally — purely a wiring task. Only caution: verify `winRate`'s units before reusing the real product's `conversionRate = winRate * 100` formula verbatim, in case `winRate` is already a percentage |

**Unusual and worth stating plainly:** none of the four Sales Home cards require any new **Intempt JS SDK** or client-side tracking instrumentation at all — a sharp contrast with Analytics Home (built entirely on JS SDK event data: page views, sessions, active users) and Marketing Home (built on Journeys/Experiences send events plus, for Channel Mix, a behavioral revenue-attribution join). Sales' data model is CRM records — Deals, Meetings, Tasks — created and updated through normal product usage (creating a deal, scheduling a meeting, completing a task), not visitor/user behavioral events captured by a tracking snippet. The relevant "SDK" for this entire page is therefore **Intempt's own internal REST API** — the `useDealsQuery`, `useMeetingsQuery`, and `useTasksQuery` hooks and their underlying `{org}/projects/{project}/...` endpoints — not the customer-facing Intempt JS SDK that the Analytics and Marketing Home docs lean on. Anyone picking up this page expecting to reach for `docs.intempt.com/js-sdk` the way the other two Home docs do will be looking in the wrong place; the right reference is the internal Deals/Meetings/Tasks API surface these hooks already call.

## Source Certainty

The current full Sales Home is buildable-as-real if these hold:

1. Deals carry `value`, a resolvable won/lost/open status, and the existing `deals/analytics` endpoint's `DealsAnalyticsResponse` fields (`totalWon`, `forecast`, `winRate`/`winRateChange`, `lossRate`/`lossRateChange`, `maxWin`/`maxWinChange`, pipeline-health, `avgTimeToClose`) are accurate and already computed server-side — **confirmed true today**, this is the one card on this page (and arguably on all of Home) that needs no new assumption verified at all.
2. Meetings carry `startTime`, `title`, a real join/conferencing link, and a `status` field distinguishing completed/attended from no-show/cancelled/upcoming — the `status` field is confirmed to exist and already power other UI (segment filters); the join-link field's exact name/presence on every meeting record is the one open item for Coming Up.
3. Tasks are queryable by due date and completion state, and can be associated with either a Deal or a Meeting (per the card's own "across your deals and meetings" description) — the list/analytics hooks are confirmed real; the deal/meeting association and the standalone `/tasks` page's route status are the two open items, though neither blocks the Home card itself.
4. No dedicated backend attendance-report endpoint exists for Meeting Attendance yet — the card's own tooltip already discloses this, and the recommended path is either keep the honest client-side rollup or add a lightweight rollup endpoint later, not fabricate a report that doesn't exist.

If any assumption is false for a given workspace, the affected card should show its existing `CardEmptyState` waiting state (already implemented for all four cards, unlike some cards on the other Home tabs where waiting-state logic is still unimplemented) rather than a fake value.

**Contrast with the rest of Home:** Analytics Home and Marketing Home each carry at least one card requiring real, not-yet-built backend infrastructure to be honest (Analytics' revenue attribution/Stripe dependency for Revenue Pulse; Marketing's anomaly-detection baseline/severity pipeline for Journey Anomaly Detection, and its revenue-attribution join for Channel Mix) — see `analytics-home.md` and `marketing-home.md` for those gaps in full, and `design-home.md` for Design Home's own gaps. Sales Home has no equivalent structural gap: its single most "aggregated" card (Meeting Attendance) is a straightforward `status`-field rollup with no attribution model and no statistical baseline required, and its most complex-looking card (Pipeline) turns out to be the *least* work of any card across all four tabs, because the backend already computes everything it needs.

## External Source References

- Deals Analytics endpoint: `POST {org}/projects/{project}/deals/analytics`, response type `DealsAnalyticsResponse` (per the internal feature/API inventory used to ground this doc — not the customer-facing JS SDK docs, since this page's data model is internal CRM records, not tracked events).
- `useDealsQuery`, `useMeetingsQuery`, `useTasksQuery` — internal React Query hooks wrapping the above REST surface.
- Intempt JS SDK docs (`https://docs.intempt.com/js-sdk`) — referenced for completeness/contrast only; **not applicable** to any card on this specific page.
