
import { useEffect, useRef, useState } from "react";
import {
  Users2, BarChart3, Zap, GitBranch, CheckCircle2, XCircle,
  Loader2, Play, ShieldCheck, ChevronDown, Plus, GripVertical,
  Pencil, Trash2, X, AlertTriangle, Check,
} from "lucide-react";
import BackButton from "./BackButton";
import Toggle from "./Toggle";

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
  const [newStepTitle,    setNewStepTitle]    = useState("");
  const [newStepSubtitle, setNewStepSubtitle] = useState("");

  // Title + slash command
  const [title,        setTitle]        = useState("Recipe Canvas");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft,   setTitleDraft]   = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [slashCmd,     setSlashCmd]     = useState("/recipe-canvas");
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
    const capturedTitles = nodes.map((n) => n.title);
    runValidate(() => {
      nodes.forEach((n, i) => {
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "running" })), i * 700);
        setTimeout(() => setNodeStates((s) => ({ ...s, [n.id]: "done" })),    i * 700 + 900);
      });
    });
    const totalMs = incomplete
      ? validateMs() + 120
      : validateMs() + 350 + runMs() + 120;
    setTimeout(() => {
      setBtnRunning(false);
      unlockBlu();
      window.dispatchEvent(new CustomEvent("blu-recipe-run", { detail: { steps: capturedTitles } }));
    }, totalMs);
  }

  // ── Ready to use ──────────────────────────────────────────────────────────

  function handleReadyToUse() {
    if (isBusy) return;
    if (isReady) { setIsReady(false); return; }
    const complete = nodes.length >= INITIAL_NODES.length;
    setBtnReady(true);
    lockBlu();
    runValidate(() => {
      setTimeout(() => setIsReady(true), 200);
    });
    setTimeout(() => { setBtnReady(false); unlockBlu(); }, validateMs() + (complete ? 600 : 120));
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
    setAddingAtIndex(index);
    setNewStepTitle("");
    setNewStepSubtitle("");
    setSelectedId(null);
    setEditingId(null);
  }

  function handleConfirmAdd() {
    if (!newStepTitle.trim() || addingAtIndex === null) return;
    const newId = `n${Date.now()}`;
    const newNode: FlowNode = {
      id: newId,
      step: addingAtIndex + 1,
      title: newStepTitle.trim(),
      subtitle: newStepSubtitle.trim() || "New step",
      icon: <Plus size={14} />,
    };
    setNodes((prev) => [
      ...prev.slice(0, addingAtIndex),
      newNode,
      ...prev.slice(addingAtIndex),
    ].map((n, i) => ({ ...n, step: i + 1 })));
    setNodeStates((prev) => ({ ...prev, [newId]: "idle" }));
    setAddingAtIndex(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const flatItems: React.ReactNode[] = [];
  nodes.forEach((node, i) => {
    if (i > 0) {
      const prevFading = fadingIds.has(nodes[i - 1].id);
      const thisFading = fadingIds.has(node.id);
      flatItems.push(
        <Connector key={`c-${nodes[i - 1].id}-${node.id}`} fading={prevFading || thisFading} onAdd={() => handleOpenAddNode(i)} fromState={nodeStates[nodes[i - 1].id] ?? "idle"} isAnimating={isBusy} />
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

  const addAtEndButton = !isBusy ? (
    <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
      <div className="w-px h-4" style={{ background: "var(--border)" }} />
      <button
        onClick={(e) => { e.stopPropagation(); handleOpenAddNode(nodes.length); }}
        className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-110"
        style={{ border: "2px dashed var(--border)", color: "var(--stone-400, #a8a29e)", background: "transparent" }}
      >
        <Plus size={15} />
      </button>
    </div>
  ) : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--main-bg)" }}>
      <style>{`
        @keyframes glow-blue {
          0%, 100% { box-shadow: 0 0 0 2.5px rgba(59,130,246,0.14), 0 4px 20px rgba(59,130,246,0.07); }
          50%       { box-shadow: 0 0 0 5px   rgba(59,130,246,0.22), 0 8px 32px rgba(59,130,246,0.12); }
        }
        @keyframes glow-green {
          0%, 100% { box-shadow: 0 0 0 2.5px rgba(16,185,129,0.14), 0 4px 20px rgba(16,185,129,0.07); }
          50%       { box-shadow: 0 0 0 5px   rgba(16,185,129,0.22), 0 8px 32px rgba(16,185,129,0.12); }
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
              {addAtEndButton}
            </div>
          </div>
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
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={handleEditConfirm}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#3b82f6" }}
                  >
                    Confirm
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

        {/* ── Add step floating window ────────────────────────────────────── */}
        {addingAtIndex !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 w-72"
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
                    {addingAtIndex >= nodes.length ? "Append to pipeline" : `Insert before step ${addingAtIndex + 1}`}
                  </p>
                </div>
                <button
                  onClick={() => setAddingAtIndex(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
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
                  placeholder="Description (optional)…"
                  className="h-9 w-full rounded-lg border px-3 text-sm text-stone-800 dark:text-stone-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  style={{ background: "var(--input)", borderColor: "var(--border)" }}
                />
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={handleConfirmAdd}
                    disabled={!newStepTitle.trim()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ background: "#3b82f6" }}
                  >
                    <Plus size={11} />
                    Add step
                  </button>
                  <button
                    onClick={() => setAddingAtIndex(null)}
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

function Connector({ fading, onAdd, fromState, isAnimating }: { fading: boolean; onAdd: () => void; fromState: NodeState; isAnimating: boolean }) {
  const [hovered, setHovered] = useState(false);

  const isBlue  = fromState === "valid" || fromState === "validating";
  const isGreen = fromState === "done"  || fromState === "running";
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
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150"
          style={{
            background: hovered ? "#3b82f6" : "var(--content-bg)",
            border: `1.5px solid ${hovered ? "#3b82f6" : "var(--border)"}`,
            color: hovered ? "white" : "#a8a29e",
            opacity: hovered ? 1 : 0.4,
            transform: hovered ? "scale(1.15)" : "scale(1)",
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
  isDragging, isDragOver,
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

  const cardAnimation =
    isFading      ? "fade-out-node 0.42s cubic-bezier(0.4,0,1,1) forwards"  :
    isValidating  ? "glow-blue 1.6s cubic-bezier(0.45,0,0.55,1) infinite"   :
    isRunning     ? "glow-green 1.4s cubic-bezier(0.45,0,0.55,1) infinite"   :
    isInvalid     ? "invalid-enter 0.55s cubic-bezier(0.22,1,0.36,1) both"  :
    isValid       ? "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both"       :
    isDone        ? "pop-in-green 0.5s cubic-bezier(0.34,1.56,0.64,1) both" :
    undefined;

  return (
    <div
      className="w-80 rounded-xl overflow-hidden cursor-pointer"
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(); }}
      onDrop={(e) => { e.stopPropagation(); onDrop(); }}
      onDragEnd={(e) => { e.stopPropagation(); onDragEnd(); }}
      style={{
        background: "var(--content-bg)",
        border: `1.5px solid ${borderColor}`,
        transition: "border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.2s ease",
        animation: cardAnimation,
        opacity: isDragging ? 0.4 : 1,
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
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug">{node.title}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-snug">{node.subtitle}</p>
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

      {/* Selected action row — right-aligned */}
      {isSelected && (
        <div
          className="flex items-center justify-end gap-1 px-4 pb-3"
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
