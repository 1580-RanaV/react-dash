
import { useEffect, useRef, useState } from "react";
import {
  Users2, BarChart3, Zap, GitBranch, CheckCircle2, XCircle,
  Loader2, Play, ShieldCheck, ChevronDown,
  Pencil, Trash2, Send, X, AlertTriangle,
} from "lucide-react";
import BackButton from "./BackButton";

// ── Types ──────────────────────────────────────────────────────────────────────

type NodeState = "idle" | "validating" | "valid" | "invalid" | "running" | "done";

type FlowNode = {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

// ── Data ───────────────────────────────────────────────────────────────────────

const INITIAL_NODES: FlowNode[] = [
  { id: "n1", step: 1, title: "Define Audience",   subtitle: "Set segment filters and targeting criteria",      icon: <Users2 size={14} />      },
  { id: "n2", step: 2, title: "Configure Sources", subtitle: "Connect events and attribute streams",            icon: <BarChart3 size={14} />   },
  { id: "n3", step: 3, title: "Set Trigger",       subtitle: "Real-time, scheduled, or threshold-based",        icon: <Zap size={14} />         },
  { id: "n4", step: 4, title: "Build Action",      subtitle: "Journey, notification, report, or webhook",       icon: <GitBranch size={14} />   },
  { id: "n5", step: 5, title: "Review & Launch",   subtitle: "Validate payload, set frequency, and activate",   icon: <CheckCircle2 size={14} /> },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function RecipeCanvasView({ onBack }: { onBack: () => void }) {
  const [nodes,       setNodes]       = useState<FlowNode[]>(INITIAL_NODES);
  const [nodeStates,  setNodeStates]  = useState<Record<string, NodeState>>(
    () => Object.fromEntries(INITIAL_NODES.map((n) => [n.id, "idle" as NodeState]))
  );

  // Selection
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  // Floating edit
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [editValue,       setEditValue]       = useState("");
  // Delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Fading-out nodes
  const [fadingIds,       setFadingIds]       = useState<Set<string>>(new Set());
  // Button loading states
  const [btnValidating,   setBtnValidating]   = useState(false);
  const [btnRunning,      setBtnRunning]      = useState(false);
  const isBusy = btnValidating || btnRunning;

  // Canvas pan / zoom
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });
  const dragging    = useRef(false);
  const hasDragged  = useRef(false);
  const lastMouse   = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("open-blu-chat")), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Canvas interaction ────────────────────────────────────────────────────

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(3, Math.max(0.25, z * (1 - e.deltaY * 0.001))));
  }

  function handleMouseDown(e: React.MouseEvent) {
    dragging.current   = true;
    hasDragged.current = false;
    lastMouse.current  = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const el = containerRef.current;
    const lx = el ? el.clientWidth  * 0.65 : 500;
    const ly = el ? el.clientHeight * 0.65 : 400;
    setPan((p) => ({ x: Math.min(lx, Math.max(-lx, p.x + dx)), y: Math.min(ly, Math.max(-ly, p.y + dy)) }));
  }

  function stopDrag() { dragging.current = false; }

  function handleCanvasClick() {
    if (hasDragged.current) return;
    setSelectedId(null);
  }

  // ── Validate / Run ────────────────────────────────────────────────────────

  function lockBlu()   { window.dispatchEvent(new CustomEvent("blu-set-locked", { detail: true })); }
  function unlockBlu() { window.dispatchEvent(new CustomEvent("blu-set-locked", { detail: false })); }

  function validateMs() { return (nodes.length - 1) * 380 + 520; }
  function runMs()      { return (nodes.length - 1) * 700 + 900; }

  function runValidate(onComplete?: () => void) {
    const incomplete = nodes.length < INITIAL_NODES.length;
    nodes.forEach((n, i) => {
      const passes = incomplete ? i < 2 : true;
      setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "validating" })), i * 380);
      setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: passes ? "valid" : "invalid" })), i * 380 + 520);
    });
    if (!incomplete && onComplete) {
      setTimeout(onComplete, validateMs() + 350);
    }
  }

  function handleValidate() {
    if (isBusy) return;
    setBtnValidating(true);
    lockBlu();
    runValidate();
    setTimeout(() => { setBtnValidating(false); unlockBlu(); }, validateMs() + 120);
  }

  function handleRun() {
    if (isBusy) return;
    const incomplete = nodes.length < INITIAL_NODES.length;
    setBtnRunning(true);
    lockBlu();
    runValidate(() => {
      nodes.forEach((n, i) => {
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "running" })), i * 700);
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "done" })),    i * 700 + 900);
      });
    });
    const totalMs = incomplete
      ? validateMs() + 120
      : validateMs() + 350 + runMs() + 120;
    setTimeout(() => { setBtnRunning(false); unlockBlu(); }, totalMs);
  }

  // ── Node interaction ──────────────────────────────────────────────────────

  function handleNodeClick(id: string) {
    if (hasDragged.current) return;
    if (editingId === id || confirmDeleteId === id) return;
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleStartEdit(node: FlowNode) {
    setEditValue(node.subtitle);
    setEditingId(node.id);
    setSelectedId(null);
  }

  function handleEditSend() {
    if (!editValue.trim() || !editingId) return;
    const node = nodes.find((n) => n.id === editingId);
    const prompt = node
      ? `Refine step ${node.step} "${node.title}": ${editValue.trim()}`
      : editValue.trim();
    window.dispatchEvent(new CustomEvent("blu-suggested-prompt", { detail: { prompt } }));
    setEditingId(null);
  }

  function handleStartDelete(id: string) {
    setConfirmDeleteId(id);
    setSelectedId(null);
    setEditingId(null);
  }

  function handleConfirmDelete(id: string) {
    setFadingIds((prev) => new Set(prev).add(id));
    setConfirmDeleteId(null);
    setTimeout(() => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setFadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setNodeStates((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }, 480);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const flatItems: React.ReactNode[] = [];
  nodes.forEach((node, i) => {
    if (i > 0) {
      const prevFading = fadingIds.has(nodes[i - 1].id);
      const thisFading = fadingIds.has(node.id);
      flatItems.push(
        <Connector key={`c-${nodes[i - 1].id}-${node.id}`} fading={prevFading || thisFading} />
      );
    }
    flatItems.push(
      <FlowNodeCard
        key={node.id}
        node={node}
        state={nodeStates[node.id] ?? "idle"}
        isSelected={selectedId === node.id}
        isEditing={editingId === node.id}
        isConfirming={confirmDeleteId === node.id}
        isFading={fadingIds.has(node.id)}
        onClick={() => handleNodeClick(node.id)}
        onStartEdit={() => handleStartEdit(node)}
        onStartDelete={() => handleStartDelete(node.id)}
      />
    );
  });

  const editNode = nodes.find((n) => n.id === editingId);
  const deleteNode = nodes.find((n) => n.id === confirmDeleteId);

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--main-bg)" }}>
      <style>{`
        @keyframes glow-blue {
          0%,100% { box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
          50%      { box-shadow: 0 0 0 8px rgba(59,130,246,0.30), 0 0 24px rgba(59,130,246,0.16); }
        }
        @keyframes glow-green {
          0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
          50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0.30), 0 0 24px rgba(16,185,129,0.16); }
        }
        @keyframes invalid-enter {
          0%   { box-shadow: 0 0 0 9px rgba(239,68,68,0.35), 0 0 30px rgba(239,68,68,0.25); }
          100% { box-shadow: 0 0 0 3px rgba(239,68,68,0.14); }
        }
        @keyframes pop-in {
          0%   { transform: scale(0.94); opacity: 0.7; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes float-in {
          0%   { opacity: 0; transform: scale(0.95) translateY(6px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes fade-out-node {
          0%   { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(0.85); }
        }
        @keyframes connector-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Top bar */}
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} />
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Recipe Canvas</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            disabled={isBusy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#3b82f6" }}
          >
            {btnValidating
              ? <Loader2 size={13} className="animate-spin" />
              : <ShieldCheck size={13} />}
            Validate
          </button>
          <button
            onClick={handleRun}
            disabled={isBusy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#10b981" }}
          >
            {btnRunning
              ? <Loader2 size={13} className="animate-spin" />
              : <Play size={11} className="fill-current" />}
            Run
          </button>
        </div>
      </div>

      {/* Canvas wrapper — relative so overlays can position against it */}
      <div className="relative flex-1 min-h-0 overflow-hidden">

        {/* Dot-grid canvas */}
        <div
          ref={containerRef}
          className="absolute inset-0 select-none"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            cursor: dragging.current ? "grabbing" : "grab",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onClick={handleCanvasClick}
        >
          <div
            className="flex min-h-full items-center justify-center p-16"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <div className="flex flex-col items-center">
              {flatItems}
            </div>
          </div>
        </div>

        {/* ── Edit floating window ─────────────────────────────────────────── */}
        {editingId && editNode && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            style={{ backdropFilter: "none" }}
          >
            <div
              className="pointer-events-auto w-80 rounded-xl shadow-2xl"
              style={{
                background: "var(--content-bg)",
                border: "1.5px solid #3b82f6",
                animation: "float-in 0.22s ease-out both",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Edit step {editNode.step}
                  </p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{editNode.title}</p>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="px-4 pb-4">
                <textarea
                  autoFocus
                  rows={3}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSend(); } }}
                  placeholder="Describe the change for this step…"
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  style={{ background: "var(--input)", borderColor: "var(--border)" }}
                />
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={handleEditSend}
                    disabled={!editValue.trim()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ background: "#3b82f6" }}
                  >
                    <Send size={11} />
                    Send to Blu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete modal with blur ───────────────────────────────────────── */}
        {confirmDeleteId && deleteNode && (
          <div className="absolute inset-0 z-30">
            {/* Blur backdrop */}
            <div
              className="absolute inset-0"
              style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.18)" }}
              onClick={() => setConfirmDeleteId(null)}
            />
            {/* Dialog */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative w-80 rounded-xl shadow-2xl overflow-hidden"
                style={{
                  background: "var(--content-bg)",
                  border: "1.5px solid var(--border)",
                  animation: "float-in 0.2s ease-out both",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 pt-5 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
                      <AlertTriangle size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Delete step {deleteNode.step}?</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        "{deleteNode.title}" will be removed and the pipeline will be disconnected.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="inline-flex h-8 items-center rounded-lg px-3.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(confirmDeleteId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#ef4444" }}
                    >
                      <Trash2 size={11} />
                      Delete step
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Connector ─────────────────────────────────────────────────────────────────

function Connector({ fading }: { fading: boolean }) {
  return (
    <div
      className="flex flex-col items-center"
      style={fading ? { animation: "connector-fade 0.3s ease-out forwards" } : undefined}
    >
      <div className="w-px h-5 mt-0.5" style={{ background: "var(--border)" }} />
      <ChevronDown size={12} className="text-stone-300 dark:text-stone-600 -mt-1" />
      <div className="w-px h-2" style={{ background: "var(--border)" }} />
    </div>
  );
}

// ── Node card ─────────────────────────────────────────────────────────────────

function FlowNodeCard({
  node, state, isSelected, isEditing, isConfirming, isFading,
  onClick, onStartEdit, onStartDelete,
}: {
  node: FlowNode;
  state: NodeState;
  isSelected: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  isFading: boolean;
  onClick: () => void;
  onStartEdit: () => void;
  onStartDelete: () => void;
}) {
  const isValidating = state === "validating";
  const isValid      = state === "valid";
  const isInvalid    = state === "invalid";
  const isRunning    = state === "running";
  const isDone       = state === "done";

  const borderColor =
    isConfirming  ? "#ef4444" :
    isEditing     ? "#3b82f6" :
    isInvalid     ? "#ef4444" :
    isValid       ? "#3b82f6" :
    isValidating  ? "#3b82f6" :
    isDone        ? "#10b981" :
    isRunning     ? "#10b981" :
    isSelected    ? "#3b82f6" :
    "var(--border)";

  const cardAnimation =
    isFading      ? "fade-out-node 0.48s ease-out forwards" :
    isValidating  ? "glow-blue 1.2s ease-in-out infinite"   :
    isRunning     ? "glow-green 1s ease-in-out infinite"     :
    isInvalid     ? "invalid-enter 0.6s ease-out both"       :
    (isValid || isDone) ? "pop-in 0.35s ease-out both"       :
    undefined;

  return (
    <div
      className="w-80 rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: "var(--content-bg)",
        border: `1.5px solid ${borderColor}`,
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        animation: cardAnimation,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Main content row */}
      <div className="px-4 pt-4 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-stone-600 dark:text-stone-400"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            {node.step}
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5 text-stone-400 dark:text-stone-500">
              {node.icon}
            </div>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{node.title}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">{node.subtitle}</p>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {(isValidating || isRunning) && (
            <Loader2 size={14} className="animate-spin" style={{ color: isValidating ? "#3b82f6" : "#10b981" }} />
          )}
          {(isValid || isDone) && (
            <CheckCircle2 size={14} style={{ color: isValid ? "#3b82f6" : "#10b981" }} />
          )}
          {isInvalid && <XCircle size={14} style={{ color: "#ef4444" }} />}
        </div>
      </div>

      {/* Selected action row */}
      {isSelected && (
        <div
          className="flex items-center gap-1 px-4 pb-3"
          style={{ borderTop: "1px solid var(--border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-2.5 flex gap-1">
            <button
              onClick={onStartEdit}
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              <Pencil size={11} />
              Edit
            </button>
            <button
              onClick={onStartDelete}
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={11} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
