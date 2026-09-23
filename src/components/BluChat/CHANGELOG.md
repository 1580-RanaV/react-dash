# BluChat Changelog

## 2026-09-23 — Composer toolbar & Chat Settings rework

**Toggles consolidated into Chat Settings**
- Removed the standalone "Project" (knowledge scope) and "Web" pill buttons from the composer toolbar row.
- "Project" was already redundant with the existing "Knowledge Scope" setting (Thread/Project).
- Added a new "Web Search" (Off/On) toggle group inside the Chat Settings panel, wired to the existing `webMode` state that the toolbar's Web button used to control.
- Toolbar row is now just: `+` menu, `Plan` toggle, mic/send button.

**Mic + Send merged into one button**
- Removed the separate floating mic icon that used to sit inside the top-right corner of the text box.
- The round button at the bottom-right of the composer now does double duty:
  - Shows a **microphone icon** when the composer is empty. Clicking it runs the existing `toggleMic()` flow (requests mic permission, goes into `recording`/`denied` states) unchanged.
  - Morphs into the **send arrow** as soon as there's text/attachments, via a 200ms scale + rotate + opacity crossfade (`editorTopFade`-style animation, not a hard swap).
  - Still shows the stop (square) icon while a response is generating.

**Composer text box top fade**
- Added a top blur/fade gradient over the prompt textarea for long, scrolled prompts (mirrors the existing `msgTopFade` pattern used on the messages list).
- Fade only appears when the box is scrolled away from the top (`editorTopFade` state, tracked via `onScroll` + recomputed on input). No bottom fade — intentional, matches the request.

**Visual consistency pass**
- `+` button: persistent circular background (`bg-(--border)`), bumped to `h-8 w-8`, icon `size=17 strokeWidth=2.25` ("beefier" icons).
- `Plan` toggle: restyled to match the `+` button's idle background/hover treatment, `h-8` height.
- Mic/send button: bumped to `h-8 w-8` to match, icons `size=15 strokeWidth=2.25`, idle color aligned with `+`/`Plan` (`text-stone-500 dark:text-stone-300`).
- **Chat Settings panel**:
  - Section headings de-capitalized (were `uppercase tracking-wider`, now normal sentence case) and given consistent vertical spacing between the panel header and each group.
  - Active option pills switched from a solid saturated blue fill (`#0080FF` + white text) to the same soft muted-blue tint used by the `Plan` toggle's active state (`bg-blue-100 dark:bg-blue-500/15`, `text-blue-700 dark:text-blue-300`).
  - Inactive options also got a persistent grey pill background (`bg-(--border)`) instead of plain unstyled text, so every option in every group (Response depth, Model tier, Knowledge scope, Web search) reads as a proper pill, not a mix of styled/unstyled text.
  - All option pills resized to `h-8 px-3` to match the `Plan` button's height exactly.

**Recipe canvas node validation (related, `RecipeCanvasView.tsx`)**
- Not BluChat itself, but feeds it: `Run`/`Validate` on the pipeline canvas now stop at the first "cancelled"/unsupported node instead of marking every step valid, and no longer dispatch `blu-recipe-run` (the event that drives BluChat's `ExecChecklist` "Running recipe" card) when the pipeline has a failing node.
