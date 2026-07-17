# Intempt Console — Frontend Polish Requirements

## Purpose

This document defines the frontend work required for the Intempt Console polish pass. The scope covers three areas:

1. Home page dashboards across the four Home tabs
2. Full console responsiveness
3. Dark mode readability across the entire console

The expected outcome is a polished, production-ready console experience that matches the provided visual reference, remains usable on smaller screens, and is readable in both light and dark mode.

---

## Primary references

| Reference | Usage |
|---|---|
| Vercel visual reference | https://intemptreactconsole.vercel.app/home |
| Code reference | `react-dash` repo |

The Vercel deployment should be used as the main visual reference for the overall console design language, spacing, typography, card treatment, button styling, and interaction patterns. The `react-dash` repo is the codebase to work from.

If something exists in the repo but not in the Vercel reference, or exists in the Vercel reference but not in the repo, confirm with the Intempt team before making assumptions.

For visual references, UI examples, or questions about the intended look, ask rana@intempt.com.

---

## Clarification rule

If there is any ambiguity, confirm with the Intempt team before proceeding.

Examples:

- A component exists in code but not in the mock/reference.
- A component exists in the mock/reference but not in code.
- A visual pattern is inconsistent between pages.
- A requirement would require removing or replacing an existing component.
- A responsive behavior is unclear.
- A dark mode color choice is unclear.

If the expected behavior or visual treatment is still unclear after checking the Vercel reference and repo, confirm before implementing.

---

## Implementation notes

The Vercel reference is already responsive for almost all pages. If any pages or components are missed in the reference, use the established Intempt design language and existing Vercel patterns to complete the responsive behavior. If the expected result is still unclear, ask the Intempt team to mock or clarify the behavior in Vercel.

If a component depends on backend support that does not exist yet at the time of this plan, the frontend component can still be built and left inactive, hidden, or disconnected so it can be wired up later when the backend is ready.

For Blu recommendation cards or Blu-related behavior that is still in development, confirm with beso@intempt.com whether to skip it, build the UI only, or fully implement it.

---

## Task 1 — Home page dashboards

The Home page has four tabs:

- Design
- Marketing
- Sales
- Analytics

Each tab should feel like a compact executive dashboard: useful KPI cards, clear mid-page content, and concise Blu recommendations. The tabs do not need to be identical, but they should share the same visual language.

### Shared Home requirements

- The Home tabs should use the same spacing, card borders, radius, typography, and blue accent language.
- The greeting should remain at the top.
- KPI cards should be concise: large value, short title, optional signal chip.
- KPI cards should summarize meaningful product/business state, not internal filler metrics.
- Middle content should be tab-specific and should not hover/lift.
- Blu recommendation cards should be visually simpler than KPI cards and should not feel repetitive.
- Blu cards should open Ask Blu and pass the recommendation context as the prompt if that behavior exists in the repo.
- Any card with navigation behavior must use the existing routing conventions.

### Design tab

Purpose: summarize creative output and brand/design readiness.

Expected top cards:

- Assets generated
- Active recipes
- Brand readiness
- Creative variety

Expected middle section:

- One full-width “Latest generations” card.
- Shows recent generated assets.
- Includes asset name, type, and timestamp.
- Includes a “Show all” action linking to the Asset Library.

### Marketing tab

Purpose: summarize Journey and Experience performance.

Expected top cards:

- Live journeys
- Sent messages/mail
- Opens
- Clicks / replies
- Journey health

Expected middle sections:

- Journey revenue chart
- Experience attributed revenue chart

Marketing should treat Journeys and Experiences as hero products.

### Sales tab

Purpose: summarize sales motion, meetings, buying intent, and pipeline health.

Expected top cards:

- Active accounts
- Meetings attended
- Deals won this week
- Active pipeline
- Sales health

Expected middle sections:

- Upcoming meetings card with the next three meetings and Join buttons.
- Buying intent / popular events card showing events such as “Added to cart,” “Checkout started,” and similar signals.

### Analytics tab

Purpose: summarize analytics breadth across the console.

Expected top cards should be cherry-picked across:

- Out-of-the-box analytics
- Traffic
- Revenue
- Engagement
- MRR
- Subscribers

Example KPI topics:

- Active users
- Total users
- Top revenue channel
- Page views or another engagement metric
- Current MRR
- Total subscribers

Expected middle sections:

- Analytics trend chart, such as Active users
- MRR or subscription trend chart

---

## Task 2 — Full console responsiveness

The entire console must be usable on smaller screens.

The Vercel reference is almost fully responsive across the console. The `react-dash` repo may not always have an exact one-to-one responsive reference for every component. In those cases, use the overall Intempt design language and existing Vercel/component patterns to make the best responsive version. If a page or component is too ambiguous, ask the Intempt team for a reference or Vercel mock before implementing.

This includes:

- Home
- Sidebar and shell
- Settings
- Tables
- Drawers
- Modals
- Detail pages
- Canvas/editor views where applicable
- Dashboards and charts
- Forms and inputs

Expected outcome:

- No horizontal overflow unless a component intentionally requires internal scrolling.
- Main shell should not break or clip content.
- Tables should scroll internally where needed.
- Buttons and controls should remain reachable.
- Cards should wrap cleanly.
- Modals and drawers should fit small screens.
- Text should not overlap icons, buttons, or chips.
- Mobile layout should remain usable even if not pixel-perfect.

---

## Task 3 — Dark mode readability

The full console must be readable and usable in dark mode.

The `react-dash` repo may not always have a perfect dark-mode equivalent for every component. In those cases, optimize the component using the existing dark-mode variables, color system, and overall design language. If a color or state is unclear, ask for a reference before making large visual changes.

Audit all components and pages for:

- Text contrast
- Button contrast
- Icon visibility
- Badge readability
- Table row and header readability
- Chart labels, gridlines, fills, and tooltips
- Input backgrounds, borders, placeholders, and typed text
- Modal and drawer backgrounds
- Empty states
- Hover, active, selected, disabled, and focus states

Expected outcome:

- No invisible or low-contrast text.
- No buttons with unreadable labels.
- No badges or chips with poor contrast.
- No chart/tooltips that become unreadable.
- No dark-mode-only layout or spacing regressions.

Use WCAG AA contrast as the baseline target:

- 4.5:1 for normal text
- 3:1 for large or bold text

---

## Quality bar

Maintain the current Intempt Console design language:

- Minimal UI
- Clean card hierarchy
- Consistent rounded corners
- Blue as the primary accent
- Muted secondary text
- Subtle borders
- No unnecessary colors
- No excessive shadows
- No over-designed widgets

Any visual changes should feel native to the existing Intempt Console.

---

## Validation checklist

Before handing off, confirm:

- Home Design tab is polished.
- Home Marketing tab is polished.
- Home Sales tab is polished.
- Home Analytics tab is polished.
- Console is usable on mobile widths.
- Console is readable in dark mode.
- Tables, drawers, modals, cards, charts, and forms have been checked.
- No TypeScript errors.
- No new obvious console/runtime errors.
- No unrelated product behavior was changed without confirmation.

---

## Deliverables

- Home pages polished: Design, Marketing, Sales, and Analytics.
- Full console responsiveness completed across all major pages, layouts, tables, drawers, modals, cards, charts, and forms.
- Dark mode readability polished across all components, including text, buttons, badges, charts, inputs, tables, drawers, and modals.
- Any unclear items or mismatches between Vercel and `react-dash` confirmed with the Intempt team before implementation.
- Known limitations or follow-up items documented clearly, if any remain.

---

## Final instruction

When in doubt, ask. Do not guess on product behavior, remove existing functionality, or introduce large new patterns without confirmation.
