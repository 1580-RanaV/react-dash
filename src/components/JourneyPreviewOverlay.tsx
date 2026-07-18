import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Mini journey canvas — static SVG diagram
function MiniJourneyCanvas({ name }: { name: string }) {
  const NODE_W = 148;
  const NODE_H = 36;
  const R = 7;

  type Node = { id: string; x: number; y: number; label: string; type: "trigger" | "action" | "wait" | "condition" | "end" };
  type Edge = { from: string; to: string; label?: string; branch?: "yes" | "no" };

  const nodes: Node[] = [
    { id: "n1", x: 220, y: 30,  label: "New User Signup",    type: "trigger"   },
    { id: "n2", x: 220, y: 110, label: "Send Welcome Email", type: "action"    },
    { id: "n3", x: 220, y: 190, label: "Wait 2 Days",        type: "wait"      },
    { id: "n4", x: 220, y: 270, label: "Email Opened?",      type: "condition" },
    { id: "n5", x: 80,  y: 370, label: "Send Promo",         type: "action"    },
    { id: "n6", x: 370, y: 370, label: "Resend Email",       type: "action"    },
    { id: "n7", x: 80,  y: 450, label: "End",                type: "end"       },
    { id: "n8", x: 370, y: 450, label: "End",                type: "end"       },
  ];

  const edges: Edge[] = [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
    { from: "n3", to: "n4" },
    { from: "n4", to: "n5", branch: "yes", label: "Yes" },
    { from: "n4", to: "n6", branch: "no",  label: "No"  },
    { from: "n5", to: "n7" },
    { from: "n6", to: "n8" },
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function nodeColor(type: Node["type"]): { fill: string; stroke: string; text: string } {
    switch (type) {
      case "trigger":   return { fill: "#eff6ff", stroke: "#bfdbfe", text: "#1d4ed8" };
      case "action":    return { fill: "#f0fdf4", stroke: "#bbf7d0", text: "#166534" };
      case "wait":      return { fill: "#fefce8", stroke: "#fef08a", text: "#854d0e" };
      case "condition": return { fill: "#fdf4ff", stroke: "#e9d5ff", text: "#7e22ce" };
      case "end":       return { fill: "#f8fafc", stroke: "#e2e8f0", text: "#64748b" };
    }
  }

  // Arrow path between two nodes (center-bottom → center-top)
  function arrowPath(from: Node, to: Node): string {
    const x1 = from.x + NODE_W / 2;
    const y1 = from.y + NODE_H;
    const x2 = to.x + NODE_W / 2;
    const y2 = to.y;
    const cy = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
  }

  // Branch arrow from condition center-bottom → side of target
  function branchPath(from: Node, to: Node, side: "left" | "right"): string {
    const x1 = from.x + NODE_W / 2;
    const y1 = from.y + NODE_H;
    const x2 = to.x + NODE_W / 2;
    const y2 = to.y;
    const mx = side === "left" ? from.x - 20 : from.x + NODE_W + 20;
    return `M ${x1} ${y1} L ${x1} ${y1 + 24} L ${mx} ${y1 + 24} L ${x2} ${y2 - 20} L ${x2} ${y2}`;
  }

  const SVG_W = 590;
  const SVG_H = 510;

  return (
    <div className="w-full h-full overflow-auto" style={{ background: "#f8fafc" }}>
      <div className="flex items-start justify-center min-h-full py-6">
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ overflow: "visible" }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to   = nodeMap[edge.to];
            const isBranch = edge.branch != null;
            const d = isBranch
              ? branchPath(from, to, edge.branch === "yes" ? "left" : "right")
              : arrowPath(from, to);
            const midX = isBranch
              ? (from.x + NODE_W / 2 + to.x + NODE_W / 2) / 2
              : from.x + NODE_W / 2;
            const midY = isBranch ? from.y + NODE_H + 20 : (from.y + NODE_H + to.y) / 2;
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth={1.5}
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={midX + (edge.branch === "yes" ? -32 : 18)}
                    y={midY + 4}
                    fontSize={10}
                    fill="#94a3b8"
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const { fill, stroke, text } = nodeColor(node.type);
            const isCondition = node.type === "condition";
            return (
              <g key={node.id}>
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={isCondition ? NODE_H / 2 : R}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                />
                <text
                  x={node.x + NODE_W / 2}
                  y={node.y + NODE_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="Inter, sans-serif"
                  fill={text}
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Journey title above diagram */}
          <text x={294} y={14} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="Inter, sans-serif" fill="#94a3b8" letterSpacing={0.5}>
            {name.toUpperCase()}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function JourneyPreviewOverlay({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center animate-fade-up"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col overflow-hidden animate-card-in"
        style={{
          width: "min(680px, 92vw)",
          height: "min(560px, 86vh)",
          borderRadius: 18,
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
              <circle cx="6" cy="19" r="3"/>
              <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
              <circle cx="18" cy="5" r="3"/>
            </svg>
            <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{name}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgb(240,253,244)", color: "rgb(22,101,52)" }}
            >
              Draft
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
          >
            <X size={15} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0">
          <MiniJourneyCanvas name={name} />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="text-xs text-stone-400 dark:text-stone-500">8 nodes · 7 connections · Draft</span>
          <button
            onClick={onClose}
            className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
            style={{ background: "rgb(109,40,217)" }}
          >
            Open in Editor
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
