# Taste — Intempt Console Design Language

This file is the reference for anyone building a new screen in the Intempt console. Read it before writing a single `className`. The goal is not pixel-perfection; the goal is that a new screen feels like it was always there.

---

## The Spirit

- **Every screen is mobile optimised. No exceptions.** Design mobile first, then desktop. If a screen is not usable on a phone it is not done. This applies to every page, every table, every sidebar, every modal, every settings section.
- **No decorative borders.** Borders separate things that need separating. If two things are already visually distinct, there is no border between them.
- **No icons in table rows.** The row content speaks for itself. Icons belong in navigation, buttons, and status indicators — not prefixing every name cell.
- **Counts live in the tab, not above the table.** "48 users" belongs inside the blue navigation tab, not as a heading above the table.
- **Consistency over novelty.** Every table looks the same. Every sidebar looks the same. Every modal looks the same. When in doubt, copy an existing pattern rather than invent a new one.
- **Small text, generous white space.** Body text is `text-sm`. Labels and meta are `text-xs`. Padding is never tight — let things breathe.

---

## Shell & Layout

Every page lives inside `DashboardShell`. The shell gives you a content card — a white/dark rounded box with a border and subtle shadow. You never style the background yourself.

```tsx
// The content card — you render inside this
className="flex-1 flex flex-col rounded-xl overflow-hidden min-w-0 relative"
style={{
  background: "var(--content-bg)",
  border: "1px solid var(--border)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)",
}}
```

**Page enter animation:** always add `animate-fade-up` to the outermost div of a new view.

**Content padding:** `px-4 pt-3` for the tab row, `px-4 pb-4 pt-4` for the content area below. Never use more than `px-4` at the view level — the card already has rounded corners and a border.

**Scrolling:** the content area scrolls, not the table in isolation. The whole page scrolls. Use `flex-1 min-h-0 overflow-y-auto` on the container, not a fixed-height inner scroll on the table only.

---

## Table Pages — The Standard Pattern

Every list page follows this exact structure:

```
[ Segment selector ] | [ ViewTab: Table (count) ] [ ViewTab: Live (dot) ]
─────────────────────────────────────────────────────────────────────────
[ Search ────────────────── ] [ Filter ] [ Sort by ] [ Columns ] [ Create ]
─────────────────────────────────────────────────────────────────────────
┌─ Table ──────────────────────────────────────────────────────────────┐
│  ☐  Col A     Col B     Col C     Status     …                        │
│  ☐  row …                                                             │
└──────────────────────────────────────────────────────────────────────┘
```

### Tab row
```tsx
<div className="flex items-center gap-2 px-4 pt-3 shrink-0">
  {hasSegments && <SegmentSelector ... />}
  {hasSegments && <div className="h-5 w-px shrink-0 bg-stone-200 dark:bg-white/10" />}
  <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} />, count: rows.length }]} ... />
</div>
```

### Toolbar (inside `DashboardTable` via its `action` prop)

The search bar stretches to fill available space. Filter, Sort by, and Columns are fixed-width buttons. Create sits at the far right with `ml-auto`.

- **Search:** `h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input)`
- **Filter / Sort / Columns:** `inline-flex h-9 shrink-0 items-center gap-1.5 px-2.5 sm:px-3.5 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-(--border) dark:bg-(--muted) dark:text-stone-300`
- **Active state** (filter applied): `border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400`
- **Create:** `flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white hover:opacity-90` with `style={{ background: "#0080FF" }}`
- **Greyed out** (unsupported action): `opacity-40 pointer-events-none` — still rendered, just non-interactive. Never hide it.

**Mobile:** Button labels collapse to icon-only below `sm`. Use `<span className="hidden sm:inline">Filter</span>`. The create button shows only a `<Plus size={14} />`.

### Table cell conventions
- No icons prefixing name cells
- Type column: blue chip only — `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300`
- Status column: `StatusPill` — colored dot + label in a rounded-full pill
- Truncated long values: wrap in a `group relative` span with a tooltip (see Tooltips section)
- Column headers: `text-xs font-semibold text-slate-500 dark:text-slate-400`
- Row padding: `px-4 py-3`
- Row hover: `hover:bg-stone-50/70 dark:hover:bg-white/3`

---

## Sidebars vs Modals — When to Use Which

### Use a Sidebar (`SlidingSidebar`) when:
- The user is **creating a new record** (new journey, new event, new booking)
- The user is **viewing or editing details** of a table row — the table stays visible behind the sidebar for context
- The action is **non-blocking** — the user can glance at the list while filling the form
- The content is **form-heavy** with multiple fields that benefit from vertical scroll

### Use a Modal when:
- The action **requires full focus** before proceeding (OAuth connection, confirmation, destructive warning)
- It is a **two-step flow** with a clear before/after state (connecting Gmail: setup steps → success screen)
- It is a **confirmation** — the user must explicitly agree before anything changes
- The content is **short** (fits in a card without scrolling)

Never put a long multi-field form in a modal. Never put a confirmation prompt in a sidebar.

---

## Sidebars (Create / Detail panels)

Sidebars slide in from the right. They live inside the content card, not the full viewport. Use `SlidingSidebar`.

```
Width:  w-[70vw] on mobile / sm:w-[54%] sm:max-w-115 on desktop
```

**Structure:**
```
┌──────────────────────────────────── [X] ┐
│ Title (text-lg font-bold)                │
│ Description (text-sm text-stone-500)     │
├──────────────────────────────────────────│
│ Content (px-5, scrollable)               │
│                                          │
├──────────────────────────────────────────│
│              [ Cancel ]  [ Create ]      │
└──────────────────────────────────────────┘
```

- **X button:** `h-8 w-8 rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm hover:bg-stone-50 dark:border-white/10 dark:bg-white/6` — always a circle, always top-right, always `<X size={15} />`
- **No internal horizontal dividers** between form fields
- **No field icons** inside the sidebar form
- **Footer:** `flex shrink-0 items-center justify-end gap-3 px-5 py-4`
- **Footer buttons:** bordered Cancel (`h-9 rounded-lg border px-5`) + blue Create (`h-9 rounded-lg px-4`)
- **Backdrop:** `bg-black/20` over the content card, not the full screen

---

## Modals & Dialogs

Modals render via `createPortal` into `document.body`.

```tsx
<div className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
  <div
    className="relative w-full max-w-sm rounded-2xl animate-card-in overflow-hidden"
    style={{
      background: "var(--content-bg)",
      border: "1px solid var(--border)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)",
    }}
  >
```

- **Mobile:** `items-end` (sheet slides up from bottom) / `sm:items-center` (centered on desktop)
- **X button:** identical to sidebar — `h-8 w-8 rounded-full border ...` — `absolute right-4 top-4`
- **Footer:** 25% plain text Cancel + 75% blue primary button (or `flex gap-3` for bordered Cancel + full-width primary)
- **Cancel (plain):** `text-sm font-semibold text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300`
- **Primary button:** `rounded-xl h-11 text-sm font-semibold text-white` with `style={{ background: "#0080FF" }}`
- **Destructive button:** same shape but `style={{ background: "#EF4444" }}`
- **Success state:** concentric rings `h-20 → h-14 → h-10`, outermost `rgba(34,197,94,0.08)` fill, innermost `bg-green-500` with white `<Check />`
- **Delete confirmation:** `DeleteConfirmDialog` — type the entity name to unlock the delete button. Always use this for permanent deletions.

---

## Navigation — When to Use Which

### ViewTabs — page-level switcher
Use when switching between **fundamentally different views of the same data** at the top of a page. Examples: Table vs Live stream, Table vs Calendar, Table vs Board. Tabs live in the page header at `px-4 pt-3`. They carry a **count** for data tabs and a **pulsing dot** for live/real-time tabs.

```tsx
// Active
"bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
// Idle
"text-stone-500 dark:text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-white/6"
```
Count: `<span className="text-xs font-medium">({count})</span>` inline after the label.

**Rule:** if switching the tab changes what table/component is rendered below, it is a ViewTab.

### SubTabCorner — section switcher within a detail or settings page
Use when switching between **sections of the same record or settings page**. Examples: Overview / Activity / Tasks / Emails on a user detail page; About / Availability / Connections within settings. SubTabCorner sits in the top-right of the detail header, not the page left edge.

```tsx
// Container
"flex gap-1 p-1 rounded-xl bg-stone-100 dark:bg-(--input)"
// Active pill
"bg-white dark:bg-white/12 text-stone-900 dark:text-stone-100 shadow-sm"
// Idle pill
"text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
```
No icons in SubTabCorner pills. Labels only.

**Rule:** if you are inside a detail or settings page and switching between sections of the same entity, it is a SubTabCorner. Never use ViewTabs here.

### SegmentSelector — audience segment filter
Use **only** when the data can be meaningfully filtered by a named audience segment (users, accounts, deals). It is not a generic filter — use the Filter button for column-level filtering. Always appears **before** ViewTabs, separated by a `h-5 w-px` divider.

**Order on a page header:** `[Segment] | [Table tab (count)] [Live tab (dot)]`

**Rule:** if the page shows entity records and the product has audience segments, add SegmentSelector. If the page is a settings page, a detail page, or a non-entity view, do not add it.

---

## Chips, Badges & Status

**Type / category chip (blue):**
```
inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300
```
No icon. Text only. Used for object type, category, source, etc.

**Status pill (dot + label, rounded-full):**
```
inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
```
Colors: green `bg-emerald-100 text-emerald-700` / gray `bg-stone-100 text-stone-600` / blue `bg-blue-50 text-blue-700` / red `bg-red-50 text-red-600`

**Gray meta tag:** `rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-white/8 dark:text-stone-400`

**Monospace data badge:** add `font-mono` to the gray tag.

**Count badge on a card:** `absolute right-2.5 top-2.5` — emerald on positive delta, red on negative.

---

## Typography

| Use | Class |
|---|---|
| Page / card title | `text-base font-semibold text-stone-800 dark:text-stone-100` |
| Section heading | `text-sm font-semibold text-stone-800 dark:text-stone-100` |
| Body / row text | `text-sm text-stone-700 dark:text-stone-200` |
| Muted description | `text-sm text-stone-500 dark:text-stone-400` |
| Field label | `text-xs font-medium text-stone-700 dark:text-stone-300` |
| Meta / timestamp | `text-xs text-stone-400 dark:text-stone-500` |
| Column header | `text-xs font-semibold text-slate-500 dark:text-slate-400` |
| Metric value | `text-2xl font-bold` or `text-3xl font-extrabold` |
| Modal title | `text-base font-bold text-stone-900 dark:text-stone-100` |
| Sidebar title | `text-lg font-bold text-stone-900 dark:text-stone-100` |

Spell words in full. No abbreviations ("organization" not "org"). No em dashes. No contractions in UI copy ("will not" not "won't").

---

## Color Tokens

Always use CSS variables. Never hardcode surface colors.

| Token | Light | Dark | Use |
|---|---|---|---|
| `var(--content-bg)` | `#ffffff` | `#1a1a1a` | Content card, modals, sidebars |
| `var(--muted)` | `#f4f5f8` | `#1f1f1f` | Table headers, tag backgrounds, info blocks |
| `var(--border)` | `#e5e5e6` | `#2a2a2a` | All borders |
| `var(--input)` | `#ffffff` | `#1e1e1e` | Form inputs, select elements |
| `var(--sidebar-background)` | `#f7f8f8` | `#0d0d0d` | Outer shell |
| `#0080FF` | — | — | Primary action, active indicators, links |
| `#EF4444` | — | — | Destructive actions |
| `rgba(24,24,27,0.93)` | — | — | Tooltip background (both modes) |

---

## Buttons — When to Use Which

| Situation | Button variant |
|---|---|
| Table toolbar / page header action | Create (blue, `h-9 rounded-lg`) |
| Modal or sidebar primary CTA | Full-width blue (`h-11 rounded-xl`) |
| Modal dismiss alongside a primary CTA | Cancel plain text (25% width) |
| Sidebar dismiss alongside a primary CTA | Cancel bordered (`h-9 border`) |
| Deleting a record from a detail page | Delete red (`h-9`, triggers `DeleteConfirmDialog` first) |
| Dangerous permanent action in settings | Danger zone red (`background: #cc0000`) |
| Closing a modal or sidebar | X button (circle, top-right) |
| Inline utility (copy, toggle, info) | Icon-only (`h-6 w-6 rounded-md`) |

**Create (primary):** `h-9 rounded-lg px-3.5 text-xs font-semibold text-white hover:opacity-90 active:scale-[0.98]` + `background: #0080FF`

**Full-width CTA (modal):** `h-11 rounded-xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98]` + `background: #0080FF`

**Cancel (plain text — modal):** `text-sm font-semibold text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors` — sits at 25% width next to the 75% primary button

**Cancel (bordered — sidebar/dialog):** `h-9 rounded-lg border border-stone-200 px-5 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/8`

**Delete:** `h-9 rounded-lg px-4 text-sm font-semibold text-white` + `background: #EF4444`. Always triggers `DeleteConfirmDialog` before executing. Danger zone (settings): `background: #cc0000`.

**X close (modal/sidebar):** `h-8 w-8 rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm hover:bg-stone-50 hover:text-stone-700 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/10 dark:hover:text-stone-200` with `<X size={14} />`. Always a circle. Always has a border. Never a plain icon.

**Icon utility (copy, etc.):** `h-6 w-6 rounded-md text-stone-400 hover:bg-stone-200 dark:hover:bg-white/8 flex items-center justify-center transition-colors`

**Disabled:** `opacity-40` or `opacity-70` + `cursor-not-allowed`. Never hide disabled buttons.

---

## Forms & Inputs

**Text input:**
```
h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 
outline-none placeholder:text-stone-400 
focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10
dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100
```

**Select (with custom arrow):**
```tsx
<div className="relative">
  <select className="h-9 w-full appearance-none pl-3 pr-8 rounded-lg border border-stone-200 
    dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 
    outline-none focus:border-blue-400 cursor-pointer" ...>
    ...
  </select>
  <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
</div>
```
Never use `appearance-auto`. Always add the custom `ChevronDown` overlay.

**Field label:** `mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300`

**SettingsRow (label + control side by side):**
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 
border-b border-stone-100 dark:border-(--border) last:border-0">
  <div className="flex-1 min-w-0 sm:pr-8">
    <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{description}</p>
  </div>
  <div className="shrink-0">{children}</div>
</div>
```

**Toggle:** use the `Toggle` component — `size="sm"` (default) or `size="md"`. Blue when on, `bg-stone-200 dark:bg-stone-600` when off.

---

## Cards

All cards share the same shell:
```tsx
style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
className="rounded-xl p-4"  // small  (p-4)
className="rounded-xl p-5"  // standard (p-5)
```

**Metric card:** icon `h-9 w-9 rounded-xl bg-stone-100 dark:bg-white/8`, large value `text-3xl font-bold`, label `text-sm text-stone-500`, change badge `absolute right-2.5 top-2.5`.

**Grid gap:** always `gap-3`.

---

## Tooltips

Dark floating pill, `animate-tooltip-in`, CSS triangle arrow pointing to the trigger.

```tsx
<span className="group relative">
  <Info size={13} className="text-stone-300 dark:text-stone-600 cursor-default" />
  <span
    className="animate-tooltip-in pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 
    -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs text-white whitespace-nowrap 
    opacity-0 group-hover:opacity-100 transition-opacity z-10 w-max max-w-52"
    style={{ background: "rgba(24,24,27,0.93)", backdropFilter: "blur(4px)" }}
  >
    Tooltip text
    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
      style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
  </span>
</span>
```

The `animate-tooltip-in` class: `opacity: 0 → 1, scale: 0.9 → 1` in `0.18s cubic-bezier(0.34, 1.56, 0.64, 1)` with `transform-origin: top center`.

For truncated table cell text: same pattern, tooltip positioned below or above the cell, arrow points to the truncated text.

---

## Mobile (required on every screen)

Every component listed in this file has a mobile behaviour. Apply all of these — they are not optional.

- **Sidebar:** `w-[70vw] sm:w-[54%] sm:max-w-115`
- **Modal:** `items-end sm:items-center` — sheet on mobile, centered on desktop
- **Toolbar labels:** `<span className="hidden sm:inline">Filter</span>`
- **Create button:** icon-only on mobile `<Plus size={14} />` + `<span className="hidden sm:inline">Create X</span>`
- **Settings nav:** collapses to slide-in drawer on mobile
- **Shell margins:** `mx-2 mb-2 md:ml-0 md:mr-3`
- **Shell top nav:** `px-4 py-3 md:px-5`
- **Tables:** always `overflow-x-auto` wrapper + `min-w-[980px]` on the table itself — horizontal scroll on mobile, never word-wrap in cells

---

## Animations

| Class | Keyframe | Use |
|---|---|---|
| `animate-fade-up` | `opacity 0→1, translateY 8px→0` over `0.35s ease-out` | Page / section enter |
| `animate-card-in` | `opacity 0→1, scale 0.96→1` over `0.22s ease-out` | Modal, dropdown, card appear |
| `animate-tooltip-in` | `opacity 0→1, scale 0.9→1` with spring | Tooltip appear |
| `animate-nav-pop` | `scale 0.7→1.15→1` bounce | Sidebar active icon (fires once) |

**Transition on interactive elements:** `transition-colors duration-100` (buttons, tabs) or `transition-all duration-300` (layout shifts).

**Sidebar slide:** `transform: translateX(0/100%) transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)`

**Blu panel:** `width: 0→380 transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1)`

---

## What Not to Do

- Do not ship a screen without testing it on mobile. If it is not usable on a phone it is not done.
- Do not use `border-radius` smaller than `rounded-lg` (8px) on interactive elements.
- Do not put a count above a table — it goes in the `ViewTab`.
- Do not add a refresh button to table toolbars.
- Do not prefix name cells with an icon.
- Do not use the Tags column in tables unless explicitly required.
- Do not use em dashes in UI copy. Use parentheses or a new sentence.
- Do not abbreviate words in UI copy ("organization" not "org", "minutes" not "mins").
- Do not create a new sidebar or modal design — copy `SlidingSidebar` or `GmailConnectModal` exactly.
- Do not use `appearance-auto` on select elements.
- Do not hardcode surface colors — always use CSS tokens.
- Do not add rounded corners smaller than `rounded-xl` on cards and modals.
- Do not use `z-index` values outside the established scale (`z-10 z-20 z-30 z-50 z-9999`).

---

## Key Components Reference

| Component | File | What it gives you |
|---|---|---|
| `DashboardTable` | `components/DashboardTable.tsx` | Full table with search / filter / sort / columns / select / pagination |
| `ViewTabs` | `components/ViewTabs.tsx` | Blue tab bar with count and dot variants |
| `SubTabCorner` | `components/SubTabCorner.tsx` | Pill-group for detail/settings sub-navigation |
| `SegmentSelector` | `components/SegmentSelector.tsx` | Segment dropdown for filtering table by segment |
| `SlidingSidebar` | `components/SlidingSidebar.tsx` | Right-slide create/detail panel |
| `Toggle` | `components/Toggle.tsx` | On/off switch, sm and md sizes |
| `DeleteConfirmDialog` | `components/DeleteConfirmDialog.tsx` | Type-to-confirm deletion modal |
| `ThreeDotsMenu` | `components/ThreeDotsMenu.tsx` | Portal-rendered context menu |
| `MetricCard` | `components/MetricCard.tsx` | Area chart KPI card |
| `SettingsLayout` | `components/SettingsLayout.tsx` | `SettingsRow`, `SettingsSelect`, section patterns |

All design tokens and animation keyframes are in `src/index.css`.
