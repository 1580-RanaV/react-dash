
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import BluChat, { type BluMode } from "./BluChat";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";
import Sidebar from "./Sidebar";
import UpgradeButton from "./UpgradeButton";
import LanguageSwitcher from "./LanguageSwitcher";

const SIDEBAR_DEFAULT      = 196;
const SIDEBAR_MIN          = 52;
const SIDEBAR_MAX          = Math.round(SIDEBAR_DEFAULT * 1.5); // 294px — max user can stretch
const SIDEBAR_ICON_THR     = 110; // below this → icon-only display
const SNAP_COLLAPSE_BELOW  = 140; // on drag release below → snap to SIDEBAR_MIN
const SIDEBAR_EXPANDED_MIN = 160; // minimum readable expanded width

// ── Drag / click handle ───────────────────────────────────────────────────────

function SidebarHandle({
  sidebarWidth,
  onWidthChange,
  onResizingChange,
  onToggleCollapse,
}: {
  sidebarWidth: number;
  onWidthChange: (w: number) => void;
  onResizingChange: (v: boolean) => void;
  onToggleCollapse: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startW: number; moved: boolean; currentW: number } | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startW: sidebarWidth, moved: false, currentW: sidebarWidth };
    setDragging(true);
    onResizingChange(true);

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const delta = ev.clientX - dragRef.current.startX;
      if (Math.abs(delta) > 3) dragRef.current.moved = true;
      const rawW = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, dragRef.current.startW + delta));
      dragRef.current.currentW = rawW;
      onWidthChange(rawW);
    }

    function onMouseUp() {
      // Re-enable transitions before snapping so the snap animates
      setDragging(false);
      onResizingChange(false);

      if (dragRef.current?.moved) {
        const w = dragRef.current.currentW;
        if (w < SNAP_COLLAPSE_BELOW) {
          onWidthChange(SIDEBAR_MIN);
        } else if (w < SIDEBAR_EXPANDED_MIN) {
          onWidthChange(SIDEBAR_EXPANDED_MIN);
        }
        // else: keep current dragged width
      } else if (dragRef.current && !dragRef.current.moved) {
        onToggleCollapse();
      }

      dragRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  const active = hovered || dragging;

  return (
    <div
      className="fixed top-0 bottom-0 z-60 hidden md:flex items-start justify-center select-none"
      style={{ left: sidebarWidth - 3, width: 8, cursor: "col-resize" }}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Visual line */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-opacity duration-150 rounded-full"
        style={{ background: "#0080FF", opacity: active ? 1 : 0 }}
      />

      {/* Tooltip */}
      {hovered && !dragging && (
        <div
          className="absolute top-18 left-3.5 rounded-lg overflow-hidden text-xs"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.13)",
          }}
        >
          <div className="px-3 py-2 text-stone-600 dark:text-stone-300">
            Drag to resize
          </div>
          <div
            className="flex items-center justify-between gap-6 px-3 py-2 text-stone-600 dark:text-stone-300"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span>Click to {sidebarWidth < SNAP_COLLAPSE_BELOW ? "expand" : "collapse"}</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400 leading-none">[</kbd>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Floating Blu window ───────────────────────────────────────────────────────

const FLOAT_W = 400;
const FLOAT_H = 628;

function FloatingBluWindow({
  onClose, onFullscreen, onBackToPanel,
}: {
  onClose: () => void;
  onFullscreen: () => void;
  onBackToPanel: () => void;
}) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(0, window.innerWidth  - FLOAT_W - 24),
    y: Math.max(0, window.innerHeight - FLOAT_H - 24),
  }));
  const dragRef = useRef<{ startMX: number; startMY: number; startPX: number; startPY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function onHeaderMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startMX: e.clientX, startMY: e.clientY, startPX: pos.x, startPY: pos.y };
    setDragging(true);

    function onMouseMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const x = Math.max(0, Math.min(window.innerWidth  - FLOAT_W, dragRef.current.startPX + ev.clientX - dragRef.current.startMX));
      const y = Math.max(0, Math.min(window.innerHeight - FLOAT_H, dragRef.current.startPY + ev.clientY - dragRef.current.startMY));
      setPos({ x, y });
    }

    function onMouseUp() {
      dragRef.current = null;
      setDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  return (
    <div
      className="fixed z-150 flex flex-col animate-card-in"
      style={{
        left: pos.x,
        top: pos.y,
        width: FLOAT_W,
        height: FLOAT_H,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)",
        userSelect: dragging ? "none" : undefined,
      }}
    >
      <BluChat
        onClose={onClose}
        mode="float"
        onFullscreen={onFullscreen}
        onBackToPanel={onBackToPanel}
        onHeaderMouseDown={onHeaderMouseDown}
      />
    </div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function DashboardShell({ children }: { children: React.ReactNode }) {

  const [bluOpen, setBluOpen] = useState(false);
  const [bluMode, setBluMode] = useState<BluMode>("panel");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isResizing, setIsResizing] = useState(false);

  function closeBlu() { setBluOpen(false); setBluMode("panel"); }
  function floatBlu() { setBluMode("float"); }
  function fullscreenBlu() { window.open("/blu", "_blank"); }
  function panelBlu() { setBluMode("panel"); }

  useEffect(() => {
    const open   = () => setBluOpen(true);
    const toggle = () => setBluOpen((o) => !o);
    window.addEventListener("open-blu-chat", open);
    window.addEventListener("toggle-blu-chat", toggle);
    return () => {
      window.removeEventListener("open-blu-chat", open);
      window.removeEventListener("toggle-blu-chat", toggle);
    };
  }, []);

  function handleToggleCollapse() {
    if (sidebarWidth < SIDEBAR_ICON_THR) {
      setSidebarWidth(SIDEBAR_DEFAULT);
    } else {
      setSidebarWidth(SIDEBAR_MIN);
    }
  }

  const collapsed       = sidebarWidth < SIDEBAR_ICON_THR;
  const widthTransition = isResizing ? "none" : "width 0.25s cubic-bezier(0.22,1,0.36,1)";

  const panelOpen = bluOpen && bluMode === "panel";

  return (
    <>
      {/* Floating window portal */}
      {bluOpen && bluMode === "float" && createPortal(
        <FloatingBluWindow onClose={closeBlu} onFullscreen={fullscreenBlu} onBackToPanel={panelBlu} />,
        document.body
      )}


    <div className="flex h-full" style={{ background: "var(--sidebar-background)" }}>
      {/* Desktop sidebar spacer */}
      <div
        className="hidden md:block shrink-0"
        style={{ width: sidebarWidth, transition: widthTransition }}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        bluOpen={bluOpen}
        sidebarWidth={sidebarWidth}
        collapsed={collapsed}
        isResizing={isResizing}
        onToggleCollapse={handleToggleCollapse}
      />

      <SidebarHandle
        sidebarWidth={sidebarWidth}
        onWidthChange={setSidebarWidth}
        onResizingChange={setIsResizing}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0 animate-fade-up">
        <div className="flex items-center gap-2 px-4 py-3 md:gap-3 md:px-5">
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
          <LanguageSwitcher />
          <ProfileMenu />
        </div>

        <main className="flex-1 flex min-h-0 gap-2 mx-2 mb-2 md:ml-0 md:mr-3">
          <div
            className="hidden md:block shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: panelOpen ? 380 : 0, opacity: panelOpen ? 1 : 0 }}
          >
            {panelOpen && (
              <BluChat
                onClose={closeBlu}
                mode="panel"
                onFloat={floatBlu}
                onFullscreen={fullscreenBlu}
              />
            )}
          </div>

          <div
            className="flex-1 flex flex-col rounded-xl overflow-hidden min-w-0 relative"
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
    </>
  );
}
