

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { ChatMessage } from "./BluChat";

/* ─────────────────────────────────────────────────────────
 * BLU MESSAGES CONTEXT — a set of concurrent threads lives
 * here, above DashboardShell, so it survives switching
 * BluChat between panel / float / fullscreen (each renders a
 * separate BluChat instance — fullscreen is a real route) and
 * so switching threads keeps every other thread's state alive
 * in the background, same as browser tabs.
 * ───────────────────────────────────────────────────────── */

export type BluThread = {
  id: string;
  title: string | null; // null → shows as "New chat" until the first message renames it
  messages: ChatMessage[];
  sessionTime: string | null;
  time: string; // relative-time label shown in the switcher list
};

const SEED_THREADS: BluThread[] = [
  { id: "t-current", title: null, messages: [], sessionTime: null, time: "1m" },
  {
    id: "h1",
    title: "FieldsUSA Summer Campaign",
    time: "2d",
    sessionTime: "Thursday 2:14 PM",
    messages: [
      { id: "h1-u", role: "user", text: "Generate an abandoned cart email for FieldsUSA — dark header, Anton headline, three cart rows with feed tags, red CTA." },
      { id: "h1-b", role: "blu", text: "Generated the FieldsUSA abandoned cart recovery email — minimal dark header, Anton headline, three cart rows with Liquid feed tags, single red CTA, nudge line, and compact dark footer with unsubscribe." },
    ],
  },
  {
    id: "h2",
    title: "Q3 Email Templates",
    time: "1w",
    sessionTime: "Last Monday 10:02 AM",
    messages: [
      { id: "h2-u", role: "user", text: "Create a four-part Q3 email series: welcome, nurture, win-back, and re-engage — all using our brand kit." },
      { id: "h2-b", role: "blu", text: "Built all four templates using the FieldsUSA brand kit — consistent header and footer, matched typography, and a shared CTA style across the series." },
    ],
  },
  {
    id: "h3",
    title: "Product launch announcement",
    time: "2h",
    sessionTime: "Today 11:40 AM",
    messages: [
      { id: "h3-u", role: "user", text: "Write launch copy for the new catalog integration — punchy, benefit-led, mobile-first." },
      { id: "h3-b", role: "blu", text: "Drafted the launch announcement — lead benefit up top, three supporting bullets, single CTA, and a mobile-first single-column layout." },
    ],
  },
  {
    id: "h4",
    title: "Welcome email series",
    time: "1d",
    sessionTime: "Yesterday 4:20 PM",
    messages: [
      { id: "h4-u", role: "user", text: "Draft a three-part onboarding sequence with progressive disclosure and personalised subject lines." },
      { id: "h4-b", role: "blu", text: "Put together the three-part series — each email reveals one new feature, and subject lines pull in first name and signup source." },
    ],
  },
];

type BluMessagesContextValue = {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  sessionTime: string | null;
  setSessionTime: Dispatch<SetStateAction<string | null>>;
  threads: BluThread[];
  activeThreadId: string;
  switchThread: (id: string) => void;
  createThread: () => void;
  renameActiveThread: (title: string) => void;
};

const BluMessagesContext = createContext<BluMessagesContextValue | null>(null);

export function BluMessagesProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<BluThread[]>(SEED_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(SEED_THREADS[0].id);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  function setMessages(action: SetStateAction<ChatMessage[]>) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : { ...t, messages: typeof action === "function" ? (action as (p: ChatMessage[]) => ChatMessage[])(t.messages) : action }
      )
    );
  }

  function setSessionTime(action: SetStateAction<string | null>) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id !== activeThreadId
          ? t
          : { ...t, sessionTime: typeof action === "function" ? (action as (p: string | null) => string | null)(t.sessionTime) : action }
      )
    );
  }

  function switchThread(id: string) {
    setActiveThreadId(id);
  }

  function createThread() {
    const id = `thread-${threads.length}-${Math.round(performance.now())}`;
    setThreads((prev) => [{ id, title: null, messages: [], sessionTime: null, time: "1m" }, ...prev]);
    setActiveThreadId(id);
  }

  function renameActiveThread(title: string) {
    setThreads((prev) => prev.map((t) => (t.id !== activeThreadId || t.title ? t : { ...t, title })));
  }

  return (
    <BluMessagesContext.Provider
      value={{
        messages: activeThread.messages,
        setMessages,
        sessionTime: activeThread.sessionTime,
        setSessionTime,
        threads,
        activeThreadId,
        switchThread,
        createThread,
        renameActiveThread,
      }}
    >
      {children}
    </BluMessagesContext.Provider>
  );
}

export function useBluMessages() {
  const ctx = useContext(BluMessagesContext);
  if (!ctx) throw new Error("useBluMessages must be used within a BluMessagesProvider");
  return ctx;
}
