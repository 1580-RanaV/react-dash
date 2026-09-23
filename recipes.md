# Recipes — Feature & Scenario Reference

This document catalogs the Recipes feature the same way `blu-chat.md` catalogs Blu Chat: what each screen does, where it lives, and — since this is a mock CRM console — what's genuinely interactive versus what's dressing. Implementation: `src/components/RecipesView.tsx` (list + detail views, both exported from one file), `src/components/RecipeCanvasView.tsx` (the pipeline builder), `src/components/CreateRecipeDrawer.tsx` (the "New Recipe" entry drawer), `src/components/recipeRuntimeStore.tsx` (the shared connection/run-history store, §8). Read-only public sharing reuses the same canvas component via `src/components/public-view/PublicRecipeView.tsx` (`<RecipeCanvasView readOnly />`).

There's no backend here — "recipes" are a hardcoded `RECIPES: Recipe[]` array (8 seeded entries, deliberately kept small: 2 drafts, 2 plain/unlocked, 2 permission-restricted, 2 needing a connection — enough to demo every state at least twice without the grid turning into wall-to-wall filler) plus whatever a user builds by hand in the canvas for the current session. Nothing persists across a reload.

---

## 1. Recipe list (`/recipes`)

The default landing view: a searchable, filterable, sortable card grid.

- **Search** — plain substring match across title, description, and tags (case-insensitive), live as you type.
- **Filter** (dropdown) — two independent facets, **Agent** and **Areas**, each a multi-select pill group derived from the seeded data itself (`ALL_AGENTS`/`ALL_AREAS` — `Array.from(new Set(...))`, not a fixed enum, so the filter options always match whatever's actually in `RECIPES`). Filters are additive (AND across facets, OR within a facet); an active filter count badge replaces the chevron on the Filter button, and a "Clear all (N)" link appears once anything is selected.
- **Sort** — Most used, Recently added, A–Z, Recently updated. "Most used" and the two date-based sorts read off two parallel lookup maps keyed by recipe id (`RECIPE_DATES`, `RECIPE_UPDATED_DATES`) rather than real timestamps on the recipe object itself — a mock-data shortcut, not a data-model choice you'd want to carry into a real backend.
- **Empty state** — "No recipes match your search" when a search/filter combination returns nothing. There's no separate empty state for "you have zero recipes at all," since the seed data guarantees the grid is never actually empty in this mock.
- **Card** — creator chip (colored initials avatar + name, from `RECIPE_CREATORS`), a date, a heart/favorite toggle (`HeartButton`, wired to the same favoriting system used elsewhere in the app), title + 3-line-clamped description, up to 2 tag/area chips with a "+N more" overflow, and a bottom-right badge cluster for whichever of Draft / Restricted / Needs `<integration>` applies (§7) — a card can show more than one at once, though none of the 8 seeded recipes currently double up. Each card has a large, very faint (2–3% opacity) copy of the recipe's own icon bleeding off the bottom-right corner as a watermark — deliberately turned down low (an earlier pass had it more prominent and it was reported as "poking the eye" / visually competing with the real content, so it was pushed back to a pure texture accent).
- **New Recipe** button opens `CreateRecipeDrawer` (§3).

---

## 2. Recipe detail (`/recipes/:id`, seeded recipes)

Opening a card routes to a detail view for that recipe. This is the "read about it" surface, distinct from the pipeline builder (§4) — seeded recipes don't have a real editable node graph; the "Steps" section here is a fixed 5-step mock walkthrough (`MOCK_STEPS`, the same 5 entries for every recipe, regardless of that recipe's own `spec.steps` count — see edge cases, §7) with two ways to look at it:

- **List** — the classic numbered vertical steps list, title + body per step.
- **Canvas** — `StepsCanvasPreview`, a small pannable dot-grid canvas showing one generic node card per step (drag to pan; same dot-grid and node-card visual language as the real pipeline builder in §4, just not editable). List and Canvas always agree on the count because both read off the same `MOCK_STEPS.length` — the canvas doesn't have its own independent step count to drift out of sync with the list.

Other things on this screen:
- **Title rename** — click-to-edit inline, capped at 100 characters (`maxLength={100}`).
- **Slash command** — editable, copyable, also capped at 100 characters. Independent from the title (renaming one doesn't rename the other) — this was an explicit ask, since a recipe's display name and its invocation command don't have to match.
- **Why this recipe works** / **Specs** (complexity, execution, agent, products, mode, areas) — static text pulled straight from the seed data.
- **Details / Remix / .md file** tabs (`SubTabCorner`, the same segmented-pill component used for the Steps List/Canvas toggle):
  - **Details** is the screen described above.
  - **Remix** opens the pipeline canvas (§4) pre-loaded with this recipe's steps as real, editable nodes — titled `"<Recipe Name> (Remix)"` with a matching slash command — rather than just handing a suggested prompt to Blu Chat. Under the hood it dispatches the same `open-recipe-canvas` event `CreateRecipeDrawer`'s "Start from scratch" path uses (§3), just with a `detail: { title, steps }` payload that `DashboardShell`'s listener forwards into the navigation as router state (`RecipeCanvasPage` reads `location.state` and passes it down as `initialTitle`/`initialSteps`). The pre-loaded nodes start in a neutral idle state (not auto-validated — validation is reserved for genuinely new/edited steps, not ones inherited from a working seeded recipe) and are immediately editable/deletable/draggable like any hand-built node. Since every seeded recipe shares the same `MOCK_STEPS` (see §8), remixing any recipe hands you the same 5 generic steps to start from — the remix is really "clone the generic walkthrough into an editable canvas," not "clone this specific recipe's real logic."
  - **.md file** opens a `recipe.md` sliding sidebar rendering the recipe as a markdown-styled export.
- **Run button** (green, top bar) — dispatches `open-blu-chat`, then after a short delay fires the same `blu-recipe-run` window event the pipeline canvas fires when it finishes a run, with `steps: MOCK_STEPS.map(s => s.title)`. This gives every seeded recipe — not just custom canvas-built ones — a working "Run" affordance that produces the same `ExecChecklist` run-card experience in Blu Chat (§6). The button shows its own spinner for the whole duration of that checklist animation (not just until the event fires), so it stays visibly "busy" the entire time steps are ticking through in the chat panel, not just for the brief moment before the event dispatches. Some recipes lock this button — see §7.
- **Recent runs** — a section below Steps lists every completed run as a generation record (most recent first): a green checkmark, the time it finished, and a clickable "`<recipe> — run output` →" item. Clicking a run's item doesn't open a fake artifact page — it hands off to Blu Chat with a suggested prompt ("Show me "X" from this run"), the same escape hatch the Remix tab used to use, rather than inventing a whole fake generated-item viewer. Empty state: "No runs yet — hit Run to execute this recipe." See §7 for where this data lives.

---

## 3. Create Recipe drawer

Opened from the list view's "New Recipe" button. Three paths, chosen from a plain option list (no separate "Next" step for two of the three — see below):

- **Start from scratch** — closes the drawer and opens the pipeline canvas (§4) via an `open-recipe-canvas` window event, landing on a genuinely empty canvas.
- **Remix existing recipe** — clicking the option **immediately** jumps to a searchable recipe picker (no intermediate "click Continue to proceed" step), built from the same `RECIPES` seed data as the list view (this picker used to be a separately hand-maintained `REMIX_RECIPES` array that had drifted to still list recipes long since removed from `RECIPES` — it's now just `RECIPES.map(...)`, so it can't go stale again). Picking one and clicking **Clone** currently just closes the drawer. **Known gap**: nothing actually clones the recipe or opens the canvas from here — the remix flow's "Clone" action is a dead end in this mock. (The Remix *tab* inside an existing recipe's detail view, §2, is the one remix path that actually does something — it opens the canvas pre-loaded with real, editable nodes.)
- **Upload RECIPE.md** — clicking the option **immediately** opens the native file picker (same "skip the extra click" treatment as Remix). Picking a `.md` file reads it as plain text and drops into a review step — file name bar with "Replace file," and the raw content in an editable textarea — before "Continue" hands off to the canvas.

---

## 4. Recipe Canvas (the pipeline builder, `/recipe-canvas`)

The one surface where a recipe is actually a live, editable thing rather than static copy. A single vertical chain of step nodes on a pannable/zoomable dot-grid canvas.

### Starting state
The canvas now starts **completely empty** — no seeded 5-step demo pipeline. In its place, a single dashed placeholder card ("Add your first step — Click to describe what this recipe should do") sits in the middle of the canvas; clicking it opens the same floating "Add step" input used everywhere else in the canvas (title + description fields), labeled "First step of the pipeline" instead of "Insert before step N" / "Append to pipeline" for that first node specifically. (This replaced an earlier version that always pre-populated 5 hardcoded demo steps regardless of how the canvas was opened — new-recipe and existing-recipe entry points weren't actually distinguished under the hood, so starting empty was the correct fix rather than special-casing an entry point that didn't exist.)

### Adding a step
- Both the **title** and **description** fields are required — description used to be optional (placeholder read "Description (optional)…"), but the Add Step button now stays disabled until both are filled in, and the placeholder just reads "Description…".
- The "Add step" button spans the full width of the floating panel; there's no separate Cancel button anymore (the panel's own × close button covers that), for both the Add-step panel and the Edit-step panel.
- **Newly-added nodes auto-validate.** The instant you confirm a step, the node appears immediately and spends 3 seconds in a "validating" state before resolving — this isn't optional/decorative, it's the same mechanism the top-bar Validate/Run buttons use (see below), just scoped to one freshly-added node instead of the whole pipeline.
  - **Validating**: a smooth conic-gradient ring continuously rotates around the node's border (not a spinner icon sitting inside the card, and not a pulsing box-shadow glow — both were tried and replaced; the glow in particular read as "tacky" for a 3-second wait). The node's own border is transparent during this phase so the rotating ring reads as the border.
  - **Passes** (the common case): settles into a solid blue border with a large filled-blue circular badge and a white checkmark — deliberately much bigger/bolder than a small outline icon, so "verified" reads at a glance.
  - **Fails**: exact same ring animation, but if the step's title or description contains the word "cancel" (case-insensitive — the mock's stand-in for "this step isn't actually supported"), it resolves to a red border and a filled-red circular badge with a white X instead of the checkmark.
- **You can't add another step while one is mid-validation.** The "+" affordances (both the dashed circle at the end of the chain and the small inline "+" between two existing nodes) are disabled and greyed out for the full 3 seconds any node is validating, with a hover tooltip explaining why ("Wait for the current step to finish verifying"). This is enforced at the state-transition level (`handleOpenAddNode` itself refuses to open the panel while any node's state is `"validating"`), not just visually — so there's no way to race it by clicking fast.
- **You can't add another step after a failed one, either.** If the most recently added node ended up in the failed/invalid (red) state, every "+" past that point stays disabled with a different tooltip ("Fix the previous step to execute accurately") until that step is fixed. A broken pipeline can't silently grow past the point where it broke.
- **A step is either free-form, or a call to another recipe.** The Add-step panel opens with a small segmented toggle — **Free-form step** (the title+description flow above, default) vs. **Call a recipe** — matching the spec's step-authoring model rather than only ever supporting inline steps. Switching to "Call a recipe" swaps the two text inputs for a searchable list of every recipe in `RECIPES` (§1's same seed data); picking one and confirming creates a node titled after that recipe, subtitled `"Calls recipe — <its description>"`, tagged internally with `calledRecipeId`. That node renders with a small blue "Calls recipe" chip above its title so it reads as structurally different from a plain step at a glance — everything else about it (the 3-second validate-on-add ring, the "cancel" failure keyword, drag/edit/delete, insert/append lockouts) behaves identically to a free-form step, since chaining only changes what the step *represents*, not how the mock validates it.

### Validate / Run
- **Validate** re-runs the same per-node check across the whole pipeline in sequence, animating each node through the ring → pass/fail resolution one at a time (staggered ~380ms apart). Critically, it **stops at the first failing node** — nodes after a failure are left untouched (not silently marked valid, which is what an earlier version did: hitting Validate on a pipeline that already had a failed/"cancel" node used to flip everything back to blue, which was a real bug, not just a cosmetic one).
- **Run** does the same validation pass first; if it finds a failing node, it stops there exactly like Validate does and does **not** proceed to actually "run" anything — no `running`/`done` node animations, and critically, no `blu-recipe-run` event gets dispatched, so Blu Chat's "Running recipe" checklist never appears for a pipeline that isn't actually valid. (This was a real bug too: Run used to fire the completion event regardless of whether validation had passed, which meant clicking Run on a broken pipeline still showed a "2/2 done, all checked" result in the chat — clearly wrong.) If validation passes, each node then visibly transitions through `running` (same rotating-ring treatment, colored green instead of blue — unified with Validate's animation rather than the pulsing green glow it originally had) to `done` (green checkmark badge), and only then does the `blu-recipe-run` event fire.
- **Ready to use** toggle runs the same validate-first check before flipping on.

### Node interaction
- Click to select a node, revealing an inline **Edit / Delete** action row along the bottom of the card — split 50/50, no border, each half filling with its own color (blue for Edit, red for Delete) on hover, inset with real padding and its own rounded corners rather than a flush, square-cornered fill running edge-to-edge (an earlier pass had the hover fill touching the card's outer edges directly).
- **Drag to reorder** — grip handle, swaps node position on drop.
- **Insert / append** — the small "+" between two nodes inserts before the second one; the dashed circle after the last node appends. Both reuse the identical Add-step floating panel described above (and both are subject to the same validating/failed-node lockouts).
- **Canvas chrome** — select/pan tool toggle, zoom in/out/reset readout, all in one bottom-left control cluster. The cluster's outer container now uses the same rounded-corner language as the rest of the app (`rounded-xl`) instead of standing out as a fully-pill-shaped (`rounded-full`) control — it was the one rounded-full holdout among otherwise-consistent rounded-xl/rounded-lg chrome.
- **Dot-grid background** — the canvas's dotted background pattern is theme-aware (`var(--border)`) rather than a hardcoded light-gray hex value; the hardcoded version rendered as harsh, high-contrast bright dots against the near-black dark-mode background (again, reported as visually "poking the eye") until it was swapped to track the theme token.

### Title / slash command
Same rename-with-100-character-cap pattern as the detail view (§2) — separate title and slash-command fields, each independently editable and capped.

---

## 5. Public / read-only canvas view

`PublicRecipeView.tsx` renders the same `RecipeCanvasView` component with `readOnly`, for a shareable link. Worth flagging as a mock limitation: since the canvas's node graph is pure client-side React state (nothing serializes a built pipeline anywhere), a "public" link doesn't actually carry a specific user's built pipeline with it — the read-only canvas starts from the same empty state described in §4 rather than showing whatever steps were really built. There's no wiring yet to snapshot/restore a specific pipeline's node list for sharing.

---

## 6. How this feeds into Blu Chat

Recipes don't have their own execution engine — "running" a recipe is really "hand a list of step titles to Blu Chat and let it animate a checklist." Two entry points funnel into the exact same event:

- The pipeline canvas's Run button, once validation passes (§4).
- The seeded recipe detail view's Run button (§2), using its fixed `MOCK_STEPS` titles.

Both dispatch `window.dispatchEvent(new CustomEvent("blu-recipe-run", { detail: { steps: string[] } }))`. Blu Chat listens for this and pushes an `execChecklist` message (`ExecChecklist` in `src/components/BluChat/blocks/ExecChecklist.tsx`), which advances one step every ~1.05s. Each step now renders as its own bordered **run card** — the same shell + `LiveRunProgressCircle` badge (spinning ring → filled-blue checkmark) used by the single-task `run`/`live-run` message types documented in `blu-chat.md` §5 — rather than a plain minimal checklist row with a small inline spinner icon, so a multi-step recipe run reads visually consistent with every other "something is executing" card in the app instead of looking like a different, lower-effort component.

---

## 7. Connections, permissions, and run history (`recipeRuntimeStore.tsx`)

A recipe's Run button isn't unconditionally clickable — two independent lock states, plus a persisted history of past runs, are backed by one small shared context (`RecipeRuntimeProvider`, mounted in `DashboardShell` next to `BoardsProvider`/`HomeWidgetsProvider`, same ephemeral in-memory-only pattern documented for those in their own files). Being a shared context rather than local component state matters here: connecting an integration from one recipe's page reactively unlocks *every* recipe that needs that same integration, and run history survives navigating away and back within the session (a plain `useState` scoped to the detail view would've reset the moment you left the page).

- **Needs-connection lock** (`Recipe.requiresIntegration`, e.g. `"HubSpot"` on B2B Nurture, `"Shopify"` on Product Launch Creative Bundle) — Run renders disabled with a lock icon and a tooltip naming the integration, and a separate **"Connect `<X>`"** button sits next to it, styled as a filled amber pill (no border) matching the amber "Needs `<X>`" card badge's color language — an earlier blue-outlined version read as an out-of-place, "off" button next to everything else on the page, so it was restyled to match the badge it's paired with instead of inventing its own color. Clicking Connect shows a brief "Connecting…" spinner state (~900ms, no real OAuth handshake — this is a mock) then flips that integration to connected in the shared store; Run unlocks immediately, and the Connect button disappears. The list-view card for a locked recipe shows that same small amber "Needs `<X>`" badge (§1) so the lock is visible before you even open the recipe — per the spec's "disabled Run with a Connect X affordance, not hidden" requirement. Both the card badge and the Connect button show the integration's real brand icon (`IntegrationLogo`, same `cdn.brandfetch.io` pattern `AddIntegrationDrawer.tsx` already uses for the actual Integrations page), falling back to a generic plug icon if the logo fails to load.
- **Permission-denied lock** (`Recipe.requiresPermission`, e.g. `"create journeys"` on Event-Triggered Upsell) — visually distinct from the connection lock on purpose: Run is disabled with the same lock icon, but there's no Connect button and no self-serve unlock — the tooltip just states the reason ("You don't have permission to create journeys"). The list-view card shows a neutral grey "Restricted" badge instead of the amber "Needs X" one, so the two lock reasons don't look interchangeable in the grid either.
- **Run history** (`RunRecord[]`, keyed by recipe id, now with a `by` field) — every time a Run actually completes (i.e., it wasn't locked), a record is appended: a timestamp, a `createdLabel`, and who ran it. Your own completed runs are attributed to `"Rana V"` (the app's established stand-in for the current user elsewhere too — `BoardsView.tsx`, `ConnectionsView.tsx`, etc. all use the same name). Three recipes ship with seeded fake history so "Recent runs" isn't empty on first visit: the two plain recipes (Hero Static vs Screenshot Test, Product-Led Growth Funnel) each get two past runs by other teammates (Maya Patel/Sam Chen, Sam Chen/Tyler Brooks), and the Event-Triggered Upsell (restricted) recipe gets one past run by April Dunford — someone who ran it back when they still had the permission. This renders as the "Recent runs" list in the detail view (§2), each row a filled blue **"output"** pill button (deliberately just "output," not `"<recipe title> — run output"` — the recipe is already the whole page you're looking at, so repeating its name in every row was redundant; and it's a real button now, not an underlined text link with an arrow icon, which read as an odd, half-committed link/button hybrid). It's explicitly not a real generation/artifact system — clicking it hands off to Blu Chat with a prompt naming both the label and the recipe, rather than opening a real artifact.

---

## 8. Known mock limitations / edge cases, called out on purpose

- **`MOCK_STEPS` is shared across all 8 seeded recipes.** A recipe's own spec says it has (say) 1 step or 6 steps, but the detail view's Steps section always shows the same fixed 5 generic steps for every recipe, and the Run button always sends those same 5 titles regardless of which recipe you're looking at. This is a deliberate "one mock walkthrough is enough to sell the concept" shortcut, not a per-recipe content system — a real implementation would need each recipe to carry its own step list.
- **"cancel" as the failure keyword** is a placeholder for "the recipe agent decided this step isn't executable," not a real validation engine. There's no actual semantic checking of a step's title/description beyond that one substring match.
- **The Remix drawer's Clone button is a dead end** (§3) — it was never wired to actually clone data or open the canvas. Flagging this explicitly since it's easy to assume "Clone" does something because every other button in that drawer does.
- **Nothing persists.** Reloading the page resets the canvas to empty, resets any card interaction state, forgets anything built, and resets `recipeRuntimeStore`'s connections and run history back to their seeded defaults (§7). There's no backend, no localStorage, no draft autosave for a canvas-in-progress.
- **Public read-only sharing doesn't carry pipeline state** (§5) — see above.
