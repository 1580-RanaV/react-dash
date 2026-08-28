

import { createContext, useContext, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────
 * HOME WIDGETS STORE — ephemeral, in-memory only (per
 * ANLYT-ADHOC-031's mock scope: "just for mock, it can go
 * away if we reload the session"). Same Context pattern as
 * BoardsProvider/BluMessagesProvider, mounted in
 * DashboardShell so any Home tab can read it.
 * ───────────────────────────────────────────────────────── */

export type HomeWidgetTab = "design" | "marketing" | "sales" | "analytics";
export type HomeWidgetWidth = "full" | "half";

export type HomeWidgetEntry = {
  id: string;
  title: string;
  tab: HomeWidgetTab;
  width: HomeWidgetWidth;
};

type HomeWidgetsContextValue = {
  entries: HomeWidgetEntry[];
  addEntry: (entry: HomeWidgetEntry) => void;
  removeEntry: (id: string) => void;
};

const HomeWidgetsContext = createContext<HomeWidgetsContextValue | null>(null);

export function HomeWidgetsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HomeWidgetEntry[]>([]);

  function addEntry(entry: HomeWidgetEntry) {
    setEntries((prev) => [entry, ...prev]);
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <HomeWidgetsContext.Provider value={{ entries, addEntry, removeEntry }}>
      {children}
    </HomeWidgetsContext.Provider>
  );
}

export function useHomeWidgets() {
  const ctx = useContext(HomeWidgetsContext);
  if (!ctx) throw new Error("useHomeWidgets must be used within a HomeWidgetsProvider");
  return ctx;
}
