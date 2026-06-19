

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import BluChat from "./BluChat";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";
import Sidebar from "./Sidebar";
import UpgradeButton from "./UpgradeButton";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [bluOpen, setBluOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const open = () => setBluOpen(true);
    const toggle = () => setBluOpen((o) => !o);
    window.addEventListener("open-blu-chat", open);
    window.addEventListener("toggle-blu-chat", toggle);
    return () => {
      window.removeEventListener("open-blu-chat", open);
      window.removeEventListener("toggle-blu-chat", toggle);
    };
  }, []);

  return (
    <div className="flex h-full" style={{ background: "var(--sidebar-background)" }}>
      {/* Desktop sidebar spacer — keeps content from sliding under the fixed sidebar */}
      <div className="hidden md:block shrink-0" style={{ width: 196 }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} bluOpen={bluOpen} />

      <div className="flex-1 flex flex-col min-w-0 animate-fade-up">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 md:gap-3 md:px-5">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="md:hidden w-7 h-7 rounded-md flex items-center justify-center hover:bg-stone-200/70 dark:hover:bg-white/8 transition-colors shrink-0"
          >
            <Menu size={16} className="text-stone-500 dark:text-stone-400" />
          </button>

          <div className="flex-1" />

          <button aria-label="Search" className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-stone-200/70 dark:hover:bg-white/8 cursor-pointer transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500 dark:text-stone-400">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <NotificationsMenu />
          <UpgradeButton />
          <ProfileMenu />
        </div>

        {/* Content row */}
        <main className="flex-1 flex min-h-0 gap-2 mx-2 mb-2 md:ml-0 md:mr-3">
          {/* BluChat panel — desktop only, left side */}
          <div
            className="hidden md:block shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: bluOpen ? 380 : 0, opacity: bluOpen ? 1 : 0 }}
          >
            {bluOpen && <BluChat onClose={() => setBluOpen(false)} />}
          </div>

          <div
            className="flex-1 flex flex-col rounded-xl overflow-hidden min-w-0"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
