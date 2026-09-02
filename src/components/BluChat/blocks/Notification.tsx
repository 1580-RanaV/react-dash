import { X, MessagesSquare, MessageSquareDot, BellRing } from "lucide-react";

/* Trigger word: notification */

export function NotificationIcon({ hasUnread, phase }: { hasUnread: boolean; phase: "dot" | "bell" }) {
  return (
    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
      <MessagesSquare
        size={15}
        className="absolute text-stone-400 transition-[opacity,filter] duration-500"
        style={{ opacity: hasUnread ? 0 : 1, filter: hasUnread ? "blur(4px)" : "blur(0px)" }}
      />
      <MessageSquareDot
        size={15}
        className="absolute text-blue-500 transition-[opacity,filter] duration-500"
        style={{
          opacity: hasUnread && phase === "dot" ? 1 : 0,
          filter: hasUnread && phase === "dot" ? "blur(0px)" : "blur(4px)",
        }}
      />
      {hasUnread && (
        <BellRing
          key={phase}
          size={15}
          className="absolute text-blue-500 transition-[opacity,filter] duration-500"
          style={{
            opacity: phase === "bell" ? 1 : 0,
            filter: phase === "bell" ? "blur(0px)" : "blur(4px)",
            animation: phase === "bell" ? "bell-ring 0.8s ease-in-out" : undefined,
            transformOrigin: "50% 0%",
          }}
        />
      )}
    </span>
  );
}

export function NotificationStrip({ visible, onOpen, onDismiss }: { visible: boolean; onOpen: () => void; onDismiss: () => void }) {
  if (!visible) return null;
  return (
    <div
      className="flex items-center gap-2 rounded-t-xl px-3 py-2.5"
      style={{
        background: "var(--muted)",
        borderTop: "2px solid var(--border)",
        borderLeft: "2px solid var(--border)",
        borderRight: "2px solid var(--border)",
        animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 truncate text-left text-xs font-medium text-stone-600 dark:text-stone-300 hover:underline"
      >
        You have notification from other chat(s), click to view
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-300"
      >
        <X size={12} />
      </button>
    </div>
  );
}
