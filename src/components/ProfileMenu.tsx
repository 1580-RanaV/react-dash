

import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { LogOut, Moon, Settings, Sun } from "lucide-react";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function toggleTheme(next: boolean) {
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-blue-400 transition-all"
      >
        <img src="/dp.png" alt="Profile" width={28} height={28} className="w-full h-full object-cover" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-64 z-50 overflow-hidden animate-card-in"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              <img src="/dp.png" alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-100 leading-none mb-1">rana</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 truncate leading-none">rana@intempt.com</p>
            </div>
          </div>

          <div className="mx-4 border-t border-stone-100 dark:border-(--border)" />

          {/* Appearance toggle */}
          <div className="px-3 pt-2.5 pb-1">
            <div className="flex items-center gap-0.5 rounded-lg bg-stone-100 dark:bg-white/8 p-0.5">
              <button
                onClick={() => toggleTheme(false)}
                className={`flex flex-1 items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-all ${
                  !dark
                    ? "bg-white dark:bg-white/12 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                <Sun size={12} />
                Light
              </button>
              <button
                onClick={() => toggleTheme(true)}
                className={`flex flex-1 items-center justify-center gap-1.5 h-8 rounded-md text-xs font-medium transition-all ${
                  dark
                    ? "bg-white dark:bg-white/12 text-stone-900 dark:text-stone-100 shadow-sm"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                }`}
              >
                <Moon size={12} />
                Dark
              </button>
            </div>
          </div>

          {/* Menu items */}
          <div className="px-2 py-2">
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-stone-100 dark:hover:bg-white/6 transition-colors text-left"
            >
              <Settings size={15} className="text-stone-400 dark:text-stone-500 shrink-0" />
              <span className="text-sm text-stone-700 dark:text-stone-300">Settings</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/8 transition-colors text-left">
              <LogOut size={15} className="text-red-500 shrink-0" />
              <span className="text-sm font-medium text-red-500">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
