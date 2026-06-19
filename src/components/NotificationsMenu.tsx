

import { useEffect, useRef, useState } from "react";
import { Bell, Users, GitBranch, Zap } from "lucide-react";

const notifications = [
  {
    id: 1,
    icon: <Users size={14} className="text-blue-500" />,
    iconBg: "bg-blue-50 dark:bg-blue-500/10",
    title: "New user joined your workspace",
    body: "markiian@intempt.com accepted the invite.",
    time: "2h ago",
  },
  {
    id: 2,
    icon: <GitBranch size={14} className="text-violet-500" />,
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
    title: "Journey published",
    body: "\"Summer Re-engagement\" went live in Experiences.",
    time: "5h ago",
  },
  {
    id: 3,
    icon: <Zap size={14} className="text-amber-500" />,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    title: "Catalog sync completed",
    body: "Feeds updated with 142 new products from your catalog.",
    time: "1d ago",
  },
];

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const unreadCount = notifications.length - read.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        className="relative w-7 h-7 rounded-md flex items-center justify-center hover:bg-stone-200/70 dark:hover:bg-white/8 cursor-pointer transition-colors"
      >
        <Bell size={14} className="text-stone-500 dark:text-stone-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-80 z-50 overflow-hidden animate-card-in"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-semibold leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => setRead(notifications.map((n) => n.id))}
                className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="py-1.5">
            {notifications.map((n) => {
              const isUnread = !read.includes(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => setRead((r) => [...r, n.id])}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-white/4 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-full ${n.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug mb-0.5 ${isUnread ? "font-semibold text-stone-800 dark:text-stone-100" : "font-normal text-stone-600 dark:text-stone-400"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-600 mt-1 leading-none">{n.time}</p>
                  </div>
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
