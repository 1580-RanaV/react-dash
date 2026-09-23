
import { useEffect, useRef, useState } from "react";
import {
  Loader2, Play, ShieldCheck, ChevronDown, Plus, GripVertical,
  Pencil, Trash2, X, AlertTriangle, Check, MousePointer2, Hand, Minus,
  Link2, Search,
} from "lucide-react";
import BackButton from "./BackButton";
import Toggle from "./Toggle";
import { RECIPES } from "./RecipesView";

// ── Types ──────────────────────────────────────────────────────────────────────

type NodeState = "idle" | "validating" | "valid" | "invalid" | "running" | "done";

type FlowNode = {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  // BC-RCP-AUTH-003: a step is either free-form, or a call to another recipe.
  calledRecipeId?: string;
};

// ── Data ───────────────────────────────────────────────────────────────────────

// Mock "unsupported step" rule: any step whose title/description mentions
// "cancel" fails validation — used to demo a failing pipeline.
function isUnsupportedNode(node: FlowNode) {
  return node.title.toLowerCase().includes("cancel") || node.subtitle.toLowerCase().includes("cancel");
}

// ── Main component ─────────────────────────────────────────────────────────────

export type InitialStep = { title: string; subtitle: string };

export default function RecipeCanvasView({
  onBack,
  readOnly = false,
  initialTitle,
  initialSteps,
}: {
  onBack: () => void;
  readOnly?: boolean;
  initialTitle?: string;
  initialSteps?: InitialStep[];
}) {
  const [nodes, setNodes] = useState<FlowNode[]>(() =>
    (initialSteps ?? []).map((s, i) => ({
      id: `seed-${i}`,
      step: i + 1,
      title: s.title,
      subtitle: s.subtitle,
      icon: <Plus size={14} />,
    }))
  );
  const [nodeStates,  setNodeStates]  = useState<Record<string, NodeState>>({});

  // Selection
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  // Floating edit
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [editValue,       setEditValue]       = useState("");
  // Delete modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  // Fading-out nodes
  const [fadingIds,       setFadingIds]       = useState<Set<string>>(new Set());
  // Drag-to-swap
  const [draggingId,      setDraggingId]      = useState<string | null>(null);
  const [dragOverId,      setDragOverId]      = useState<string | null>(null);
  // Button loading states
  const [btnValidating,   setBtnValidating]   = useState(false);
  const [btnRunning,      setBtnRunning]      = useState(false);
  const [btnReady,        setBtnReady]        = useState(false);
  const [isReady,         setIsReady]         = useState(false);
  const isBusy = btnValidating || btnRunning || btnReady;

  // Add node
  const [addingAtIndex,   setAddingAtIndex]   = useState<number | null>(null);
  const [addMode,         setAddMode]         = useState<"step" | "recipe">("step");
  const [newStepTitle,    setNewStepTitle]    = useState("");
  const [newStepSubtitle, setNewStepSubtitle] = useState("");
  const [recipeSearch,    setRecipeSearch]    = useState("");
  const [pickedRecipeId,  setPickedRecipeId]  = useState<string | null>(null);

  // Title + slash command
  const [title,        setTitle]        = useState(initialTitle ?? "Recipe Canvas");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft,   setTitleDraft]   = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [slashCmd,     setSlashCmd]     = useState(() => toSlashCmd(initialTitle ?? "recipe-canvas"));
  const [editingCmd,   setEditingCmd]   = useState(false);
  const [cmdDraft,     setCmdDraft]     = useState("");
  const cmdInputRef = useRef<HTMLInputElement>(null);

  function toSlashCmd(t: string) {
    return "/" + t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
  }
  function startEditTitle() {
    setTitleDraft(title);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }
  function commitTitle() {
    const t = titleDraft.trim();
    if (t) { setTitle(t); setSlashCmd(toSlashCmd(t)); }
    setEditingTitle(false);
  }
  function startEditCmd() {
    setCmdDraft(slashCmd);
    setEditingCmd(true);
    setTimeout(() => cmdInputRef.current?.select(), 0);
  }
  function commitCmd() {
    const t = cmdDraft.trim();
    if (t) setSlashCmd(t.startsWith("/") ? t : "/" + t);
    setEditingCmd(false);
  }
  // Canvas pan / zoom
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan">("select");
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

  function validateMs(count: number = nodes.length) { return (count - 1) * 380 + 520; }
  function runMs(count: number = nodes.length)      { return (count - 1) * 700 + 900; }

  // Validates nodes in order and stops at the first unsupported node —
  // steps after a failure are left untouched, matching a real pipeline
  // that halts execution at the point it breaks.
  function runValidate(onComplete?: () => void) {
    const failIndex = nodes.findIndex(isUnsupportedNode);
    const hasFailure = failIndex !== -1;
    const validatedCount = hasFailure ? failIndex + 1 : nodes.length;
    for (let i = 0; i < validatedCount; i++) {
      const n = nodes[i];
      const passes = !(hasFailure && i === failIndex);
      setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "validating" })), i * 380);
      setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: passes ? "valid" : "invalid" })), i * 380 + 520);
    }
    if (!hasFailure && onComplete) {
      setTimeout(onComplete, validateMs(validatedCount) + 350);
    }
    return { hasFailure, validatedCount };
  }

  function handleValidate() {
    if (isBusy) return;
    setBtnValidating(true);
    lockBlu();
    const { validatedCount } = runValidate();
    setTimeout(() => { setBtnValidating(false); unlockBlu(); }, validateMs(validatedCount) + 120);
  }

  function handleRun() {
    if (isBusy) return;
    setBtnRunning(true);
    lockBlu();
    const capturedTitles = nodes.map((n) => n.title);
    const { hasFailure, validatedCount } = runValidate(() => {
      nodes.forEach((n, i) => {
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "running" })), i * 700);
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "done" })),    i * 700 + 900);
      });
    });
    const totalMs = hasFailure
      ? validateMs(validatedCount) + 120
      : validateMs(validatedCount) + 350 + runMs() + 120;
    setTimeout(() => {
      setBtnRunning(false);
      unlockBlu();
      if (!hasFailure) {
        window.dispatchEvent(new CustomEvent("blu-recipe-run", { detail: { steps: capturedTitles } }));
      }
    }, totalMs);
  }

  // ── Ready to use ──────────────────────────────────────────────────────────

  function handleReadyToUse() {
    if (isBusy) return;
    if (isReady) { setIsReady(false); return; }
    setBtnReady(true);
    lockBlu();
    const { hasFailure, validatedCount } = runValidate(() => {
      setTimeout(() => setIsReady(true), 200);
    });
    setTimeout(() => { setBtnReady(false); unlockBlu(); }, validateMs(validatedCount) + (hasFailure ? 120 : 600));
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

  function handleEditConfirm() {
    if (!editingId) return;
    const id = editingId;
    setEditingId(null);
    setNodeStates((s) => ({ ...s, [id]: "validating" }));
    setTimeout(() => setNodeStates((s) => ({ ...s, [id]: "idle" })), 2000);
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
      setNodes((prev) => prev.filter((n) => n.id !== id).map((n, i) => ({ ...n, step: i + 1 })));
      setFadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setNodeStates((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }, 480);
  }

  function handleDragStart(id: string) {
    setDraggingId(id);
    setSelectedId(null);
  }

  function handleDragOver(id: string) {
    if (id !== draggingId) setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return; }
    setNodes((prev) => {
      const next = [...prev];
      const fromIdx = next.findIndex((n) => n.id === draggingId);
      const toIdx   = next.findIndex((n) => n.id === targetId);
      [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
      return next.map((n, i) => ({ ...n, step: i + 1 }));
    });
    setDraggingId(null);
    setDragOverId(null);
  }

  function handleDragEnd() { setDraggingId(null); setDragOverId(null); }

  function handleOpenAddNode(index: number) {
    if (Object.values(nodeStates).some((s) => s === "validating")) return;
    setAddingAtIndex(index);
    setAddMode("step");
    setNewStepTitle("");
    setNewStepSubtitle("");
    setRecipeSearch("");
    setPickedRecipeId(null);
    setSelectedId(null);
    setEditingId(null);
  }

  function handleConfirmAdd() {
    if (addingAtIndex === null) return;

    let newNode: FlowNode;
    if (addMode === "recipe") {
      const picked = RECIPES.find((r) => r.id === pickedRecipeId);
      if (!picked) return;
      newNode = {
        id: `n${Date.now()}`,
        step: addingAtIndex + 1,
        title: picked.title,
        subtitle: `Calls recipe — ${picked.description}`,
        icon: <Plus size={14} />,
        calledRecipeId: picked.id,
      };
    } else {
      if (!newStepTitle.trim() || !newStepSubtitle.trim()) return;
      newNode = {
        id: `n${Date.now()}`,
        step: addingAtIndex + 1,
        title: newStepTitle.trim(),
        subtitle: newStepSubtitle.trim(),
        icon: <Plus size={14} />,
      };
    }

    const newId = newNode.id;
    const unsupported = isUnsupportedNode(newNode);
    setNodes((prev) => [
      ...prev.slice(0, addingAtIndex),
      newNode,
      ...prev.slice(addingAtIndex),
    ].map((n, i) => ({ ...n, step: i + 1 })));
    setNodeStates((prev) => ({ ...prev, [newId]: "validating" }));
    setTimeout(() => {
      setNodeStates((prev) => ({ ...prev, [newId]: unsupported ? "invalid" : "valid" }));
    }, 3000);
    setAddingAtIndex(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const anyNodeValidatingForConnectors = Object.values(nodeStates).some((s) => s === "validating");

  const flatItems: React.ReactNode[] = [];
  nodes.forEach((node, i) => {
    if (i > 0) {
      const prevFading = fadingIds.has(nodes[i - 1].id);
      const thisFading = fadingIds.has(node.id);
      const prevState = nodeStates[nodes[i - 1].id] ?? "idle";
      const connectorBlockedReason = prevState === "invalid"
        ? "Fix the previous step to execute accurately"
        : anyNodeValidatingForConnectors
        ? "Wait for the current step to finish verifying"
        : undefined;
      flatItems.push(
        <Connector
          key={`c-${nodes[i - 1].id}-${node.id}`}
          fading={prevFading || thisFading}
          onAdd={() => handleOpenAddNode(i)}
          fromState={prevState}
          isAnimating={isBusy}
          addBlockedReason={connectorBlockedReason}
        />
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
        isDragging={draggingId === node.id}
        isDragOver={dragOverId === node.id}
        readOnly={readOnly}
        onClick={() => handleNodeClick(node.id)}
        onStartEdit={() => handleStartEdit(node)}
        onStartDelete={() => handleStartDelete(node.id)}
        onDragStart={() => handleDragStart(node.id)}
        onDragOver={() => handleDragOver(node.id)}
        onDrop={() => handleDrop(node.id)}
        onDragEnd={handleDragEnd}
      />
    );
  });

  const editNode = nodes.find((n) => n.id === editingId);
  const deleteNode = nodes.find((n) => n.id === confirmDeleteId);

  const emptyState = nodes.length === 0 ? (
    <button
      onClick={(e) => { e.stopPropagation(); handleOpenAddNode(0); }}
      className="w-80 flex flex-col items-center gap-2 rounded-xl px-6 py-9 text-center transition-all duration-150 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
      style={{ border: "2px dashed var(--border)", color: "var(--stone-400, #a8a29e)", background: "transparent" }}
    >
      <Plus size={20} />
      <span className="text-sm font-semibold">Add your first step</span>
      <span className="text-xs opacity-80">Click to describe what this recipe should do</span>
    </button>
  ) : null;

  const lastNodeInvalid  = nodes.length > 0 && nodeStates[nodes[nodes.length - 1].id] === "invalid";
  const anyNodeValidating = Object.values(nodeStates).some((s) => s === "validating");
  const addBlocked = lastNodeInvalid || anyNodeValidating;
  const addBlockedReason = lastNodeInvalid
    ? "Fix the previous step to execute accurately"
    : anyNodeValidating
    ? "Wait for the current step to finish verifying"
    : undefined;

  const addAtEndButton = !isBusy && nodes.length > 0 ? (
    <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
      <div className="w-px h-4" style={{ background: "var(--border)" }} />
      <button
        onClick={(e) => { e.stopPropagation(); if (!addBlocked) handleOpenAddNode(nodes.length); }}
        disabled={addBlocked}
        title={addBlockedReason}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 ${
          addBlocked ? "cursor-not-allowed" : "hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-110"
        }`}
        style={{
          border: `2px dashed var(--border)`,
          color: "var(--stone-400, #a8a29e)",
          background: "transparent",
          opacity: addBlocked ? 0.4 : 1,
        }}
      >
        <Plus size={15} />
      </button>
    </div>
  ) : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--main-bg)" }}>
      <style>{`
        @keyframes border-spin {
          to { transform: rotate(1turn); }
        }
        @keyframes invalid-enter {
          0%   { box-shadow: 0 0 0 10px rgba(239,68,68,0.26), 0 0 28px rgba(239,68,68,0.18); transform: scale(0.985); }
          40%  { box-shadow: 0 0 0 4px  rgba(239,68,68,0.18); transform: scale(1.008); }
          100% { box-shadow: 0 0 0 2px  rgba(239,68,68,0.10); transform: scale(1); }
        }
        @keyframes pop-in {
          0%   { transform: scale(0.95); }
          55%  { transform: scale(1.03); }
          78%  { transform: scale(0.997); }
          100% { transform: scale(1); }
        }
        @keyframes pop-in-green {
          0%   { transform: scale(0.95); }
          55%  { transform: scale(1.03); }
          78%  { transform: scale(0.997); }
          100% { transform: scale(1); }
        }
        @keyframes float-in {
          0%   { opacity: 0; transform: scale(0.96) translateY(8px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes fade-out-node {
          0%   { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.94) translateY(-4px); }
        }
        @keyframes connector-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes connector-activate {
          0%   { opacity: 0.2; transform: scaleY(0); }
          60%  { transform: scaleY(1.05); }
          100% { opacity: 1;   transform: scaleY(1); }
        }
        @keyframes chevron-pop {
          0%   { transform: scale(0.7) translateY(-2px); opacity: 0.3; }
          65%  { transform: scale(1.2); }
          100% { transform: scale(1)   translateY(0);  opacity: 1; }
        }
        @keyframes bead-travel {
          0%   { top: -4px; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { top: calc(100% + 4px); opacity: 0; }
        }
      `}</style>

      {/* Top bar */}
      {!readOnly && (
      <div
        className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BackButton onClick={onBack} />

          {/* Editable title */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              autoFocus
              maxLength={100}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitTitle(); } if (e.key === "Escape") setEditingTitle(false); }}
              className="rounded-md px-2 py-0.5 text-sm font-medium text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20"
              style={{ background: "var(--input)", border: "1px solid var(--border)", width: `${Math.max(titleDraft.length, 10)}ch` }}
            />
          ) : (
            <button onClick={startEditTitle} className="group flex items-center gap-1.5 min-w-0" title="Click to rename">
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{title}</span>
              <Pencil size={11} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400" />
            </button>
          )}

          {/* Editable slash command */}
          {editingCmd ? (
            <input
              ref={cmdInputRef}
              autoFocus
              maxLength={100}
              value={cmdDraft}
              onChange={(e) => setCmdDraft(e.target.value)}
              onBlur={commitCmd}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitCmd(); } if (e.key === "Escape") setEditingCmd(false); }}
              className="font-mono text-xs font-medium rounded-md px-2 py-0.5 outline-none"
              style={{ background: "var(--input)", border: "1px solid #3b82f6", color: "#3b82f6", width: `${Math.max(cmdDraft.length, 8)}ch` }}
            />
          ) : (
            <button
              onClick={startEditCmd}
              className="group/cmd flex items-center gap-1 shrink-0 font-mono text-xs font-medium rounded-md px-2 py-0.5 transition-colors"
              style={{ background: "var(--muted)", color: "#3b82f6", border: "1px solid var(--border)" }}
              title="Click to rename"
            >
              {slashCmd}
              <Pencil size={10} className="opacity-0 group-hover/cmd:opacity-60 transition-opacity" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Ready to use toggle */}
          <button
            onClick={handleReadyToUse}
            disabled={btnReady || btnValidating || btnRunning}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              color: isReady ? "#3b82f6" : "var(--stone-600, #57534e)",
            }}
          >
            {btnReady
              ? <Loader2 size={13} className="animate-spin" style={{ color: "#3b82f6" }} />
              : <Toggle on={isReady} onClick={() => {}} />}
            Ready to use
          </button>


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
      )}

      {/* Canvas wrapper — relative so overlays can position against it */}
      <div className="relative flex-1 min-h-0 overflow-hidden">

        {/* Dot-grid canvas */}
        <div
          ref={containerRef}
          className="absolute inset-0 select-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
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
              {emptyState}
              {flatItems}
              {addAtEndButton}
            </div>
          </div>
        </div>

        {/* Zoom / tool controls */}
        <div
          className={`absolute bottom-4 z-10 flex items-center gap-1.5 rounded-xl ${readOnly ? "left-1/2 -translate-x-1/2 p-1" : "left-4 p-1.5"}`}
          style={
            readOnly
              ? { background: "var(--content-bg)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
              : { background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }
          }
        >
          <button
            onClick={() => setTool("select")}
            title="Select"
            className={`flex items-center justify-center rounded-md transition-colors ${readOnly ? "h-9 w-9" : "h-7 w-7"}`}
            style={tool === "select" ? { background: "rgba(0,128,255,0.1)", color: "#0080FF" } : { color: "var(--icon)" }}
          >
            <MousePointer2 size={14} />
          </button>
          <button
            onClick={() => setTool("pan")}
            title="Pan"
            className={`flex items-center justify-center rounded-md transition-colors ${readOnly ? "h-9 w-9" : "h-7 w-7"}`}
            style={tool === "pan" ? { background: "rgba(0,128,255,0.1)", color: "#0080FF" } : { color: "var(--icon)" }}
          >
            <Hand size={14} />
          </button>

          <div className="h-5 w-px" style={{ background: "var(--border)" }} />

          <button
            onClick={() => setZoom((z) => Math.max(0.25, parseFloat((z - 0.1).toFixed(2))))}
            title="Zoom out"
            className={`flex items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/6 ${readOnly ? "h-9 w-9" : "h-7 w-7"}`}
          >
            <Minus size={14} />
          </button>
          <span
            className={`flex min-w-11 items-center justify-center rounded-md px-2 text-center text-xs font-semibold tabular-nums text-stone-600 dark:text-stone-300 ${readOnly ? "h-9" : "py-1"}`}
            style={{ background: "var(--muted)" }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(2))))}
            title="Zoom in"
            className={`flex items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/6 ${readOnly ? "h-9 w-9" : "h-7 w-7"}`}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* ── Edit floating window ─────────────────────────────────────────── */}
        {editingId && editNode && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 w-72"
            style={{ left: "calc(50% + 180px)", animation: "float-in 0.22s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-xl shadow-2xl"
              style={{ background: "var(--content-bg)", border: "1.5px solid #3b82f6" }}
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
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditConfirm(); } }}
                  placeholder="Describe the change for this step…"
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm text-stone-800 dark:text-stone-100 outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  style={{ background: "var(--input)", borderColor: "var(--border)" }}
                />
                <div className="mt-2.5">
                  <button
                    onClick={handleEditConfirm}
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#3b82f6" }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Add step floating window ────────────────────────────────────── */}
        {addingAtIndex !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 w-80"
            style={{ left: "calc(50% + 180px)", animation: "float-in 0.22s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-xl shadow-2xl"
              style={{
                background: "var(--content-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    Add step
                  </p>
                  <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    {nodes.length === 0
                      ? "First step of the pipeline"
                      : addingAtIndex! >= nodes.length ? "Append to pipeline" : `Insert before step ${addingAtIndex! + 1}`}
                  </p>
                </div>
                <button
                  onClick={() => setAddingAtIndex(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Free-form step vs. call another recipe — BC-RCP-AUTH-003 */}
              <div className="px-4 pb-2.5 flex items-center gap-1 rounded-lg" style={{}}>
                <div className="flex w-full rounded-lg p-0.5" style={{ background: "var(--muted)" }}>
                  <button
                    onClick={() => setAddMode("step")}
                    className={`flex-1 inline-flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
                      addMode === "step" ? "bg-white dark:bg-white/12 shadow-sm text-stone-800 dark:text-stone-100" : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    <Pencil size={11} />
                    Free-form step
                  </button>
                  <button
                    onClick={() => setAddMode("recipe")}
                    className={`flex-1 inline-flex h-7 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors ${
                      addMode === "recipe" ? "bg-white dark:bg-white/12 shadow-sm text-stone-800 dark:text-stone-100" : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    <Link2 size={11} />
                    Call a recipe
                  </button>
                </div>
              </div>

              {addMode === "step" ? (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <input
                    autoFocus
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    placeholder="Step name…"
                    className="h-9 w-full rounded-lg border px-3 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    style={{ background: "var(--input)", borderColor: "var(--border)" }}
                  />
                  <input
                    value={newStepSubtitle}
                    onChange={(e) => setNewStepSubtitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleConfirmAdd(); }}
                    placeholder="Description…"
                    className="h-9 w-full rounded-lg border px-3 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                    style={{ background: "var(--input)", borderColor: "var(--border)" }}
                  />
                  <div className="mt-0.5">
                    <button
                      onClick={handleConfirmAdd}
                      disabled={!newStepTitle.trim() || !newStepSubtitle.trim()}
                      className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                      style={{ background: "#3b82f6" }}
                    >
                      <Plus size={11} />
                      Add step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <div className="relative">
                    <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <input
                      autoFocus
                      value={recipeSearch}
                      onChange={(e) => setRecipeSearch(e.target.value)}
                      placeholder="Search recipes…"
                      className="h-9 w-full rounded-lg border pl-8 pr-3 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                      style={{ background: "var(--input)", borderColor: "var(--border)" }}
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-lg" style={{ border: "1px solid var(--border)" }}>
                    {RECIPES.filter((r) => !recipeSearch.trim() || r.title.toLowerCase().includes(recipeSearch.trim().toLowerCase())).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setPickedRecipeId(r.id)}
                        className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors ${
                          pickedRecipeId === r.id ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-stone-50 dark:hover:bg-white/4"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${pickedRecipeId === r.id ? "text-blue-700 dark:text-blue-400" : "text-stone-800 dark:text-stone-100"}`}>
                          {r.title}
                        </span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 line-clamp-1">{r.description}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-0.5">
                    <button
                      onClick={handleConfirmAdd}
                      disabled={!pickedRecipeId}
                      className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                      style={{ background: "#3b82f6" }}
                    >
                      <Link2 size={11} />
                      Add recipe call
                    </button>
                  </div>
                </div>
              )}
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

function Connector({ fading, onAdd, fromState, isAnimating, addBlockedReason }: { fading: boolean; onAdd: () => void; fromState: NodeState; isAnimating: boolean; addBlockedReason?: string }) {
  const [hovered, setHovered] = useState(false);

  const isBlue   = fromState === "valid" || fromState === "validating";
  const isGreen  = fromState === "done"  || fromState === "running";
  const blocked  = !!addBlockedReason;
  const lineColor  = isGreen ? "#10b981" : isBlue ? "#3b82f6" : "var(--border)";
  const beadColor  = isGreen ? "#10b981" : "#3b82f6";
  const showBead   = isAnimating && (isBlue || isGreen);

  return (
    <div
      className="flex flex-col items-center"
      style={fading ? { animation: "connector-fade 0.35s ease-out forwards" } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top line + traveling bead */}
      <div
        className="relative w-px mt-0.5"
        style={{
          height: 14,
          background: lineColor,
          transition: "background 0.45s cubic-bezier(0.4,0,0.2,1)",
          overflow: "visible",
          animation: showBead ? "connector-activate 0.4s cubic-bezier(0.34,1.3,0.64,1) both" : undefined,
        }}
      >
        {showBead && (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full"
            style={{
              background: beadColor,
              boxShadow: `0 0 5px ${beadColor}`,
              animation: "bead-travel 0.7s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
        )}
      </div>

      {/* + add button — hidden during validate / run */}
      {!isAnimating && (
        <button
          onClick={(e) => { e.stopPropagation(); if (!blocked) onAdd(); }}
          disabled={blocked}
          title={addBlockedReason}
          className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150 ${blocked ? "cursor-not-allowed" : ""}`}
          style={{
            background: hovered && !blocked ? "#3b82f6" : "var(--content-bg)",
            border: `1.5px solid ${hovered && !blocked ? "#3b82f6" : "var(--border)"}`,
            color: hovered && !blocked ? "white" : "#a8a29e",
            opacity: blocked ? 0.4 : hovered ? 1 : 0.4,
            transform: hovered && !blocked ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Plus size={9} />
        </button>
      )}

      {/* Animated chevron */}
      <ChevronDown
        size={12}
        style={{
          color: lineColor,
          transition: "color 0.45s cubic-bezier(0.4,0,0.2,1)",
          animation: showBead ? "chevron-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
        }}
      />

      {/* Bottom line */}
      <div
        className="w-px h-2"
        style={{
          background: lineColor,
          transition: "background 0.45s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

// ── Node card ─────────────────────────────────────────────────────────────────

function FlowNodeCard({
  node, state, isSelected, isEditing, isConfirming, isFading,
  isDragging, isDragOver, readOnly,
  onClick, onStartEdit, onStartDelete,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  node: FlowNode;
  state: NodeState;
  isSelected: boolean;
  isEditing: boolean;
  isConfirming: boolean;
  isFading: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  readOnly?: boolean;
  onClick: () => void;
  onStartEdit: () => void;
  onStartDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const isValidating = state === "validating";
  const isValid      = state === "valid";
  const isInvalid    = state === "invalid";
  const isRunning    = state === "running";
  const isDone       = state === "done";

  const borderColor =
    isDragOver    ? "#3b82f6" :
    isConfirming  ? "#ef4444" :
    isEditing     ? "#3b82f6" :
    isInvalid     ? "#ef4444" :
    isValid       ? "#3b82f6" :
    isValidating  ? "#3b82f6" :
    isDone        ? "#10b981" :
    isRunning     ? "#10b981" :
    isSelected    ? "#3b82f6" :
    "var(--border)";

  const isSpinning = isValidating || isRunning;

  const cardAnimation =
    isFading      ? "fade-out-node 0.42s cubic-bezier(0.4,0,1,1) forwards"  :
    isInvalid     ? "invalid-enter 0.55s cubic-bezier(0.22,1,0.36,1) both"  :
    isValid       ? "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both"       :
    isDone        ? "pop-in-green 0.5s cubic-bezier(0.34,1.56,0.64,1) both" :
    undefined;

  return (
    <div className="relative w-80" style={{ opacity: isDragging ? 0.4 : 1 }}>
      {/* Smooth rotating ring while a step is being verified or run */}
      {isSpinning && (
        <div className="pointer-events-none absolute inset-[-2.5px] rounded-[14px] overflow-hidden">
          <div
            className="absolute -inset-1/2"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, ${isRunning ? "#10b981" : "#3b82f6"} 60deg, transparent 150deg)`,
              animation: "border-spin 1.4s linear infinite",
            }}
          />
        </div>
      )}
      <div
        className="relative w-80 rounded-xl overflow-hidden cursor-pointer"
        draggable
        onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(); }}
        onDrop={(e) => { e.stopPropagation(); onDrop(); }}
        onDragEnd={(e) => { e.stopPropagation(); onDragEnd(); }}
        style={{
          background: "var(--content-bg)",
          border: `1.5px solid ${isSpinning ? "var(--content-bg)" : borderColor}`,
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          animation: cardAnimation,
        }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
      {/* Top-center drag handle */}
      <div
        className="flex justify-center pt-2 pb-0 cursor-grab active:cursor-grabbing text-stone-300 dark:text-stone-600 hover:text-stone-400 dark:hover:text-stone-500 transition-colors"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={13} />
      </div>

      {/* Main content row */}
      <div className="px-4 pt-3 pb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-stone-600 dark:text-stone-400"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            {node.step}
          </div>
          <div>
            {node.calledRecipeId && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10">
                <Link2 size={9} />
                Calls recipe
              </span>
            )}
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{node.title}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-snug">{node.subtitle}</p>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {(isValid || isDone) && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: isValid ? "#3b82f6" : "#10b981" }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
          {isInvalid && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "#ef4444" }}>
              <X size={14} className="text-white" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* Selected action row — split 50/50, inset rounded hover fills */}
      {isSelected && !readOnly && (
        <div className="flex items-stretch gap-1.5 px-2 pb-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onStartEdit}
            className="flex-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
          >
            <Pencil size={12} />
            Edit
          </button>
          <button
            onClick={onStartDelete}
            className="flex-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
