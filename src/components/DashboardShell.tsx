
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import BluChat, { type BluMode } from "./BluChat";
import { BluMessagesProvider } from "./BluMessagesContext";
import { BoardsProvider } from "./boards/boardsStore";
import { HomeWidgetsProvider } from "./homeWidgets/homeWidgetsStore";
import { RecipeRuntimeProvider } from "./recipeRuntimeStore";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "./ui/sidebar";

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
  const navigate = useNavigate();

  const [bluOpen, setBluOpen] = useState(false);
  const [bluMode, setBluMode] = useState<BluMode>("panel");

  function closeBlu() { setBluOpen(false); setBluMode("panel"); }
  function floatBlu() { setBluMode("float"); }
  function fullscreenBlu() { setBluMode("fullscreen"); navigate("/blu"); }
  function panelBlu() { setBluMode("panel"); }

  useEffect(() => {
    const open              = () => setBluOpen(true);
    const toggle            = () => setBluOpen((o) => !o);
    const openRecipeCanvas  = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      navigate("/recipe-canvas", detail ? { state: detail } : undefined);
    };
    const openPanel         = () => { setBluOpen(true); setBluMode("panel"); };
    const forceClose        = () => { setBluOpen(false); setBluMode("panel"); };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("open-blu-chat",       open);
    window.addEventListener("toggle-blu-chat",     toggle);
    window.addEventListener("open-recipe-canvas",  openRecipeCanvas);
    window.addEventListener("blu-open-panel",      openPanel);
    window.addEventListener("blu-force-close",     forceClose);
    window.addEventListener("keydown",             onKeyDown);
    return () => {
      window.removeEventListener("open-blu-chat",       open);
      window.removeEventListener("toggle-blu-chat",     toggle);
      window.removeEventListener("open-recipe-canvas",  openRecipeCanvas);
      window.removeEventListener("blu-open-panel",      openPanel);
      window.removeEventListener("blu-force-close",     forceClose);
      window.removeEventListener("keydown",             onKeyDown);
    };
  }, [navigate]);

  const panelOpen = bluOpen && bluMode === "panel";

  return (
    <BoardsProvider>
    <HomeWidgetsProvider>
    <RecipeRuntimeProvider>
    <BluMessagesProvider>
      {/* Floating window portal */}
      {bluOpen && bluMode === "float" && createPortal(
        <FloatingBluWindow onClose={closeBlu} onFullscreen={fullscreenBlu} onBackToPanel={panelBlu} />,
        document.body
      )}


    <SidebarProvider>
      <AppSidebar bluOpen={bluOpen} />
      <SidebarInset className="animate-fade-up">
        <div className="flex-1 flex min-h-0 gap-2 m-2 md:ml-0 md:mr-3">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
    </BluMessagesProvider>
    </RecipeRuntimeProvider>
    </HomeWidgetsProvider>
    </BoardsProvider>
  );
}
