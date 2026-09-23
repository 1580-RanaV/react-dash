import { createContext, useContext, useState, type ReactNode } from "react";

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
 * mounted in DashboardShell. Backs two mock behaviors from
 * the recipes spec:
 *   - BC-RCP-010–017: a recipe that needs an integration shows
 *     a locked Run + "Connect X" affordance, and unlocks
 *     reactively (shared across every recipe needing that same
 *     integration) once connected.
 *   - BC-RCP-GEN-*: every completed run is kept as a generation
 *     record per recipe, with a clickable "created" item.
 * ───────────────────────────────────────────────────────── */

export type RunRecord = {
  id: string;
  at: number;
  createdLabel: string;
  by: string;
};

type RecipeRuntimeContextValue = {
  isConnected: (integration: string) => boolean;
  connectIntegration: (integration: string) => void;
  runHistory: Record<string, RunRecord[]>;
  addRunRecord: (recipeId: string, record: RunRecord) => void;
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
    <RecipeRuntimeContext.Provider value={{ isConnected, connectIntegration, runHistory, addRunRecord }}>
      {children}
    </RecipeRuntimeContext.Provider>
  );
}

export function useRecipeRuntime() {
  const ctx = useContext(RecipeRuntimeContext);
  if (!ctx) throw new Error("useRecipeRuntime must be used within a RecipeRuntimeProvider");
  return ctx;
}
