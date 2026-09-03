

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
  pinned?: boolean;
  archived?: boolean;
  forkedFrom?: string; // title of the thread this one was forked from, if any
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
  {
    id: "h5",
    title: "Post-purchase nurture flow",
    time: "1d",
    sessionTime: "Yesterday 9:52 AM",
    messages: [
      { id: "h5-u", role: "user", text: "Build a five-email post-purchase flow starting 24h after the order, pulling in live order data from the feed." },
      { id: "h5-b", role: "blu", text: "Built the five-email flow — order confirmation recap, shipping update, usage tips, review request, and a cross-sell send pulling from the order's category." },
    ],
  },
  {
    id: "h6",
    title: "Win-back campaign copy",
    time: "2d",
    sessionTime: "2 days ago 3:08 PM",
    messages: [
      { id: "h6-u", role: "user", text: "Write win-back copy targeting customers inactive for 90+ days, with a discount hook." },
      { id: "h6-b", role: "blu", text: "Drafted the win-back sequence — nostalgia-led opener, a time-boxed discount code, and a low-friction one-click reactivation CTA." },
    ],
  },
  {
    id: "h7",
    title: "Summer sale banner text",
    time: "3d",
    sessionTime: "3 days ago 1:15 PM",
    archived: true,
    messages: [
      { id: "h7-u", role: "user", text: "Give me three headline variants for the summer sale hero banner — bold, punchy, benefit-led." },
      { id: "h7-b", role: "blu", text: "Here are three variants ranging from urgency-led to benefit-led, all sized for the hero banner's character limit." },
    ],
  },
  {
    id: "h8",
    title: "Onboarding email #1",
    time: "1w",
    sessionTime: "Last week 11:30 AM",
    archived: true,
    messages: [
      { id: "h8-u", role: "user", text: "Draft the first onboarding email — focus on product discovery and key features." },
      { id: "h8-b", role: "blu", text: "Drafted it — leads with the single most-used feature, then a lightweight tour of two more, closing with a getting-started CTA." },
    ],
  },
  {
    id: "h9",
    title: "Abandoned cart — footwear",
    time: "1w",
    sessionTime: "Last week 8:44 AM",
    archived: true,
    messages: [
      { id: "h9-u", role: "user", text: "Recovery email for the footwear category, with size-specific urgency copy." },
      { id: "h9-b", role: "blu", text: "Built it — cart rows pull live size and stock data from the feed, with a low-stock nudge only shown when the saved size is running out." },
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
  forkThread: (messages: ChatMessage[], title: string | null) => void;
  renameActiveThread: (title: string) => void;
  renameThread: (id: string, title: string) => void;
  togglePinThread: (id: string) => void;
  archiveThread: (id: string) => void;
  unarchiveThread: (id: string) => void;
  deleteThread: (id: string) => void;
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

  function forkThread(messages: ChatMessage[], title: string | null) {
    const id = `thread-${threads.length}-${Math.round(performance.now())}`;
    const forkedFrom = activeThread.title ?? "New chat";
    setThreads((prev) => [{ id, title, messages, sessionTime: activeThread.sessionTime, time: "1m", forkedFrom }, ...prev]);
    setActiveThreadId(id);
  }

  function renameActiveThread(title: string) {
    setThreads((prev) => prev.map((t) => (t.id !== activeThreadId || t.title ? t : { ...t, title })));
  }

  function renameThread(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t)));
  }

  function togglePinThread(id: string) {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }

  // Switch away from the given thread (if it's active) to the next best
  // remaining, non-archived thread — creating a fresh one if none are left.
  function switchAwayFrom(id: string, remaining: BluThread[]) {
    if (activeThreadId !== id) return;
    const next = remaining.find((t) => !t.archived);
    if (next) {
      setActiveThreadId(next.id);
    } else {
      const newId = `thread-${remaining.length}-${Math.round(performance.now())}`;
      setThreads([{ id: newId, title: null, messages: [], sessionTime: null, time: "1m" }, ...remaining]);
      setActiveThreadId(newId);
    }
  }

  function archiveThread(id: string) {
    const next = threads.map((t) => (t.id === id ? { ...t, archived: true, pinned: false } : t));
    setThreads(next);
    switchAwayFrom(id, next.filter((t) => t.id !== id));
  }

  function unarchiveThread(id: string) {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, archived: false } : t)));
  }

  function deleteThread(id: string) {
    const next = threads.filter((t) => t.id !== id);
    setThreads(next);
    switchAwayFrom(id, next);
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
        forkThread,
        renameActiveThread,
        renameThread,
        togglePinThread,
        archiveThread,
        unarchiveThread,
        deleteThread,
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
