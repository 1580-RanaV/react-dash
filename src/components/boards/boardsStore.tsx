

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { BOARDS_DATA, type BoardEntry } from "./boardsData";

/* ─────────────────────────────────────────────────────────
 * BOARDS STORE — lives above DashboardShell so a report
 * saved from Blu chat (any mode: panel/float/fullscreen)
 * shows up immediately on the /boards page.
 * ───────────────────────────────────────────────────────── */

type BoardsContextValue = {
  entries: BoardEntry[];
  setEntries: Dispatch<SetStateAction<BoardEntry[]>>;
  addEntry: (entry: BoardEntry) => void;
};

const BoardsContext = createContext<BoardsContextValue | null>(null);

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BoardEntry[]>(BOARDS_DATA);

  function addEntry(entry: BoardEntry) {
    setEntries((current) => [entry, ...current]);
  }

  return (
    <BoardsContext.Provider value={{ entries, setEntries, addEntry }}>
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error("useBoards must be used within a BoardsProvider");
  return ctx;
}
