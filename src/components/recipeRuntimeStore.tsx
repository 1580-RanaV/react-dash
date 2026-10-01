import { createContext, useContext, useState, type ReactNode } from "react";
import type { Recipe } from "./RecipesView";

// Same brand-icon CDN pattern as AddIntegrationDrawer.tsx's `BF` helper —
// duplicated rather than imported since that file keeps it private, and a
// one-line URL builder isn't worth a shared-utils file for just two callers.
const BRAND_ICON = (domain: string) => `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

const INTEGRATION_DOMAINS: Record<string, string> = {
  HubSpot: "hubspot.com",
  Shopify: "shopify.com",
};

export function IntegrationLogo({ name, size = 12, fallback = null }: { name: string; size?: number; fallback?: ReactNode }) {
  const [failed, setFailed] = useState(false);
  const domain = INTEGRATION_DOMAINS[name];
  if (!domain || failed) return <>{fallback}</>;
  return (
    <img
      src={BRAND_ICON(domain)}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-xs object-contain"
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}

/* ─────────────────────────────────────────────────────────
 * RECIPE RUNTIME STORE — ephemeral, in-memory only, same
 * Context pattern as BoardsProvider/HomeWidgetsProvider,
 * mounted in DashboardShell. Backs four mock behaviors from
 * the recipes spec:
 *   - BC-RCP-010–017: a recipe that needs an integration shows
 *     a locked Run + "Connect X" affordance, and unlocks
 *     reactively (shared across every recipe needing that same
 *     integration) once connected.
 *   - BC-RCP-GEN-*: every completed run is kept as a generation
 *     record per recipe, with a clickable "created" item.
 *   - Deleting a seeded recipe from its detail page hides it
 *     from the list for the rest of the session (no backend to
 *     actually delete it from).
 *   - Publishing a canvas build adds it to the list as a draft
 *     recipe, and its Remix tab reopens the canvas with its real
 *     nodes (not the generic MOCK_STEPS every seeded recipe uses).
 * ───────────────────────────────────────────────────────── */

export type RunRecord = {
  id: string;
  at: number;
  createdLabel: string;
  by: string;
};

// A seeded draft recipe (RECIPES entries with `draft: true`) has no canvas
// nodes of its own — Validate/Publish on its detail page just mock-check its
// MOCK_STEPS, then flip these flags, since the seed array itself is a
// constant we can't mutate directly.
type SeedOverride = { validated?: boolean; draft?: boolean };

// Applies a seeded recipe's session-local Validate/Publish overrides on top
// of its static fields — used wherever a seeded recipe is rendered (list
// card, detail page) so both agree on its current state.
export function withSeedOverrides(recipe: Recipe, overrides: Record<string, SeedOverride>): Recipe {
  const ov = overrides[recipe.id];
  if (!ov) return recipe;
  return {
    ...recipe,
    draft: ov.draft === false ? false : recipe.draft,
    validated: ov.validated ? true : recipe.validated,
  };
}

type RecipeRuntimeContextValue = {
  isConnected: (integration: string) => boolean;
  connectIntegration: (integration: string) => void;
  runHistory: Record<string, RunRecord[]>;
  addRunRecord: (recipeId: string, record: RunRecord) => void;
  isDeleted: (recipeId: string) => boolean;
  deleteRecipe: (recipeId: string) => void;
  draftRecipes: Recipe[];
  addDraftRecipe: (recipe: Recipe) => void;
  // Mocks the "Make it global" flow — flips a user-created recipe to a
  // submitted-for-review state, with no real approval backend behind it.
  requestGlobal: (recipeId: string) => void;
  // Current step index (0-based) per recipe id while it's mid-run — absent
  // once it's done or hasn't been run. Lives here (not local component
  // state) specifically so the list-grid card can animate step-by-step
  // progress too, not just whichever page triggered the Run.
  runningRecipes: Record<string, number>;
  startRun: (recipeId: string, totalSteps: number) => void;
  // Session-local Validate/Publish state for seeded draft recipes — see
  // `withSeedOverrides`.
  seedOverrides: Record<string, SeedOverride>;
  validateSeed: (recipeId: string) => void;
  publishSeed: (recipeId: string) => void;
  // The "insufficient credits" mock only ever fires once per session, the
  // very first time anyone hits Continue on the Validate confirm modal —
  // shared across the canvas and the recipe detail page, since it's one
  // demo of the retry path, not a per-recipe or per-surface thing.
  creditsErrorShown: boolean;
  markCreditsErrorShown: () => void;
};

const RecipeRuntimeContext = createContext<RecipeRuntimeContextValue | null>(null);

// Only these need a "Connect" step for the mock — everything else is
// treated as already connected, so most recipes never show the lock.
const INITIAL_LOCKED_INTEGRATIONS = new Set<string>(["Shopify", "HubSpot"]);

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Seeded run history so the "Recent runs" list isn't empty on first visit —
// two plain recipes get a couple of past runs each (by teammates other than
// the current user), and one restricted recipe gets a single past run
// (someone who already had the permission ran it before it was locked down).
const SEEDED_RUN_HISTORY: Record<string, RunRecord[]> = {
  "3": [
    { id: "seed-3-1", at: Date.now() - 2 * DAY, createdLabel: "output", by: "Maya Patel" },
    { id: "seed-3-2", at: Date.now() - 6 * DAY, createdLabel: "output", by: "Sam Chen" },
  ],
  "14": [
    { id: "seed-14-1", at: Date.now() - 1 * DAY, createdLabel: "output", by: "Sam Chen" },
    { id: "seed-14-2", at: Date.now() - 4 * DAY, createdLabel: "output", by: "Tyler Brooks" },
  ],
  "11": [
    { id: "seed-11-1", at: Date.now() - 9 * DAY, createdLabel: "output", by: "April Dunford" },
  ],
};

export function RecipeRuntimeProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<Set<string>>(INITIAL_LOCKED_INTEGRATIONS);
  const [runHistory, setRunHistory] = useState<Record<string, RunRecord[]>>(SEEDED_RUN_HISTORY);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [draftRecipes, setDraftRecipes] = useState<Recipe[]>([]);
  const [runningRecipes, setRunningRecipes] = useState<Record<string, number>>({});
  const [seedOverrides, setSeedOverrides] = useState<Record<string, SeedOverride>>({});

  function validateSeed(recipeId: string) {
    setSeedOverrides((prev) => ({ ...prev, [recipeId]: { ...prev[recipeId], validated: true } }));
  }

  function publishSeed(recipeId: string) {
    setSeedOverrides((prev) => ({ ...prev, [recipeId]: { ...prev[recipeId], draft: false } }));
  }

  const [creditsErrorShown, setCreditsErrorShown] = useState(false);
  function markCreditsErrorShown() {
    setCreditsErrorShown(true);
  }

  function startRun(recipeId: string, totalSteps: number, stepMs = 1050) {
    if (totalSteps <= 0) return;
    setRunningRecipes((prev) => ({ ...prev, [recipeId]: 0 }));
    function tick(step: number) {
      setTimeout(() => {
        if (step + 1 >= totalSteps) {
          // Hold on the last, fully-done step briefly before clearing so the
          // "all steps complete" state is actually visible, not skipped.
          setRunningRecipes((prev) => ({ ...prev, [recipeId]: totalSteps }));
          setTimeout(() => {
            setRunningRecipes((prev) => {
              const next = { ...prev };
              delete next[recipeId];
              return next;
            });
          }, 700);
          return;
        }
        setRunningRecipes((prev) => ({ ...prev, [recipeId]: step + 1 }));
        tick(step + 1);
      }, stepMs);
    }
    tick(0);
  }

  function addDraftRecipe(recipe: Recipe) {
    setDraftRecipes((prev) => [recipe, ...prev]);
  }

  function requestGlobal(recipeId: string) {
    setDraftRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, globalStatus: "submitted" } : r)));
  }

  function isDeleted(recipeId: string) {
    return deletedIds.has(recipeId);
  }

  function deleteRecipe(recipeId: string) {
    setDeletedIds((prev) => new Set(prev).add(recipeId));
  }

  function isConnected(integration: string) {
    return !locked.has(integration);
  }

  function connectIntegration(integration: string) {
    setLocked((prev) => {
      if (!prev.has(integration)) return prev;
      const next = new Set(prev);
      next.delete(integration);
      return next;
    });
  }

  function addRunRecord(recipeId: string, record: RunRecord) {
    setRunHistory((prev) => ({ ...prev, [recipeId]: [record, ...(prev[recipeId] ?? [])] }));
  }

  return (
    <RecipeRuntimeContext.Provider value={{ isConnected, connectIntegration, runHistory, addRunRecord, isDeleted, deleteRecipe, draftRecipes, addDraftRecipe, requestGlobal, runningRecipes, startRun, seedOverrides, validateSeed, publishSeed, creditsErrorShown, markCreditsErrorShown }}>
      {children}
    </RecipeRuntimeContext.Provider>
  );
}

export function useRecipeRuntime() {
  const ctx = useContext(RecipeRuntimeContext);
  if (!ctx) throw new Error("useRecipeRuntime must be used within a RecipeRuntimeProvider");
  return ctx;
}
