import { useRef, useState } from "react";
import {
  GitFork, Image as ImageIcon, UserRound, Mountain, PersonStanding,
  Type, ChevronDown, Play, MousePointer2, Hand, Minus, Plus,
} from "lucide-react";

// Read-only "demo" node-graph canvas for the public workflow preview — an
// image-regeneration pipeline (product photo + style references -> a
// restyled photoshoot render), styled after a Pletor-style flow builder.
// No drag/select/edit; purely a visual, pannable/zoomable canvas.

const BLUE = "#0080FF";
const BLUE_BG = "rgba(0,128,255,0.1)";

const WORLD_W = 1400;
const WORLD_H = 680;

type Chip = { id: string; x: number; midY: number; label: string; icon: React.ReactNode; thumb: string };
type Router = { id: string; x: number; midY: number; label: string };
type PromptNode = { id: string; x: number; midY: number; title: string; text: string };
type ImageNode = { id: string; x: number; midY: number; title: string; src: string; model: string };

const ROUTERS: Router[] = [
  { id: "r1", x: 40, midY: 300, label: "Router" },
  { id: "r2", x: 40, midY: 490, label: "Router 2" },
];

const CHIPS: Chip[] = [
  { id: "c1", x: 260, midY: 300, label: "Product photo", icon: <ImageIcon size={13} />, thumb: "/hero.png" },
  { id: "c2", x: 260, midY: 420, label: "Visual reference", icon: <UserRound size={13} />, thumb: "/avatar.png" },
  { id: "c3", x: 260, midY: 490, label: "Scene reference", icon: <Mountain size={13} />, thumb: "/scene.png" },
  { id: "c4", x: 260, midY: 560, label: "Pose reference", icon: <PersonStanding size={13} />, thumb: "/pose.png" },
];

const PROMPT_W = 340;
const IMAGE_W = 300;

const PROMPTS: PromptNode[] = [
  {
    id: "p1", x: 560, midY: 420, title: "Restyle shot prompt",
    text: "Regenerate the product photo in a brand-new scene and pose. Keep the garment's fit, color, and print exactly as shown in the product photo. Use the scene reference for the setting and lighting, and the pose reference for the subject's stance. Match the visual reference for the model's look. Keep the framing editorial and true to life — no exaggerated proportions or stylization.",
  },
];

const IMAGES: ImageNode[] = [
  { id: "i1", x: 980, midY: 420, title: "Final render", src: "/hero.png", model: "Nano Banana" },
];

const PROMPT_CARD_H = 300;
const IMAGE_CARD_H = 360;
const LABEL_H = 22;
const GAP = 8;

function anchor(x: number, width: number, midY: number) {
  return { left: { x, y: midY }, right: { x: x + width, y: midY } };
}

const EDGES: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [
  { from: anchor(ROUTERS[0].x, 124, ROUTERS[0].midY).right, to: anchor(CHIPS[0].x, 210, CHIPS[0].midY).left },
  { from: anchor(ROUTERS[1].x, 124, ROUTERS[1].midY).right, to: anchor(CHIPS[1].x, 210, CHIPS[1].midY).left },
  { from: anchor(ROUTERS[1].x, 124, ROUTERS[1].midY).right, to: anchor(CHIPS[2].x, 210, CHIPS[2].midY).left },
  { from: anchor(ROUTERS[1].x, 124, ROUTERS[1].midY).right, to: anchor(CHIPS[3].x, 210, CHIPS[3].midY).left },
  { from: anchor(CHIPS[0].x, 210, CHIPS[0].midY).right, to: anchor(PROMPTS[0].x, PROMPT_W, PROMPTS[0].midY).left },
  { from: anchor(CHIPS[1].x, 210, CHIPS[1].midY).right, to: anchor(PROMPTS[0].x, PROMPT_W, PROMPTS[0].midY).left },
  { from: anchor(CHIPS[2].x, 210, CHIPS[2].midY).right, to: anchor(PROMPTS[0].x, PROMPT_W, PROMPTS[0].midY).left },
  { from: anchor(CHIPS[3].x, 210, CHIPS[3].midY).right, to: anchor(PROMPTS[0].x, PROMPT_W, PROMPTS[0].midY).left },
  { from: anchor(PROMPTS[0].x, PROMPT_W, PROMPTS[0].midY).right, to: anchor(IMAGES[0].x, IMAGE_W, IMAGES[0].midY).left },
];

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(40, (x2 - x1) * 0.45);
  return `M ${x1},${y1} C ${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}

function RouterCard({ node }: { node: Router }) {
  return (
    <div
      className="absolute flex h-11 items-center gap-2 rounded-full px-3"
      style={{ left: node.x, top: node.midY - 22, width: 124, background: "#ffffff", border: "1px solid #e5e5e6", boxShadow: "0 2px 6px rgba(20,20,25,0.05)" }}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: BLUE_BG, color: BLUE }}>
        <GitFork size={11} />
      </span>
      <span className="truncate text-xs font-semibold" style={{ color: "#33343a" }}>{node.label}</span>
    </div>
  );
}

function ChipCard({ node }: { node: Chip }) {
  return (
    <div
      className="absolute flex h-14 items-center gap-2.5 overflow-hidden rounded-xl px-3"
      style={{ left: node.x, top: node.midY - 28, width: 210, background: "#ffffff", border: "1px solid #e5e5e6", boxShadow: "0 2px 6px rgba(20,20,25,0.05)" }}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: BLUE_BG, color: BLUE }}>
        {node.icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold" style={{ color: "#33343a" }}>{node.label}</span>
      <img src={node.thumb} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" style={{ border: "1px solid #edeef3" }} />
    </div>
  );
}

function PromptCard({ node }: { node: PromptNode }) {
  const top = node.midY - (LABEL_H + GAP + PROMPT_CARD_H) / 2;
  return (
    <div className="absolute" style={{ left: node.x, top, width: PROMPT_W }}>
      <div className="mb-2 flex items-center gap-1.5 px-0.5" style={{ color: "#8b8f98" }}>
        <Type size={13} />
        <span className="truncate text-xs font-medium">{node.title}</span>
      </div>
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{ height: PROMPT_CARD_H, background: "#ffffff", border: "1px solid #e5e5e6", boxShadow: "0 4px 16px rgba(20,20,25,0.06)" }}
      >
        <div className="flex-1 overflow-hidden px-4 pt-4 pb-2">
          <p className="text-[13px] leading-relaxed" style={{ color: "#6a6e77" }}>{node.text}</p>
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2.5" style={{ borderColor: "#edeef3" }}>
          <span
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
            style={{ border: "1px solid #e5e5e6", color: "#5b5f68" }}
          >
            Gemini 3 Flash
            <ChevronDown size={12} style={{ color: "#9a9ea6" }} />
          </span>
          <span
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: "#fbe9e0", color: "#c2683f" }}
          >
            <Play size={9} className="fill-current" />
            Run
          </span>
        </div>
      </div>
    </div>
  );
}

function ImageCard({ node }: { node: ImageNode }) {
  const top = node.midY - (LABEL_H + GAP + IMAGE_CARD_H) / 2;
  return (
    <div className="absolute" style={{ left: node.x, top, width: IMAGE_W }}>
      <div className="mb-2 flex items-center gap-1.5 px-0.5" style={{ color: "#8b8f98" }}>
        <ImageIcon size={13} />
        <span className="truncate text-xs font-medium">{node.title}</span>
      </div>
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{ height: IMAGE_CARD_H, background: "#ffffff", border: "1px solid #e5e5e6", boxShadow: "0 4px 16px rgba(20,20,25,0.06)" }}
      >
        <div className="flex-1 overflow-hidden p-2">
          <img src={node.src} alt="" className="h-full w-full rounded-lg object-cover" style={{ background: "#f4f5f8" }} />
        </div>
        <div className="flex items-center gap-1.5 border-t px-3 py-2.5" style={{ borderColor: "#edeef3" }}>
          <span className="text-xs font-medium" style={{ color: "#7c7f88" }}>{node.model}</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowCanvasView() {
  const [zoom, setZoom] = useState(0.72);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan">("pan");
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(2, Math.max(0.3, z * (1 - e.deltaY * 0.001))));
  }
  function handleMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }
  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const el = containerRef.current;
    const lx = el ? el.clientWidth * 0.7 : 600;
    const ly = el ? el.clientHeight * 0.7 : 400;
    setPan((p) => ({ x: Math.min(lx, Math.max(-lx - WORLD_W, p.x + dx)), y: Math.min(ly, Math.max(-ly, p.y + dy)) }));
  }
  function stopDrag() { dragging.current = false; }

  return (
    <div className="relative h-full w-full overflow-hidden">
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
      >
        <div
          className="relative"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
            willChange: "transform",
          }}
        >
          <svg width={WORLD_W} height={WORLD_H} className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {EDGES.map((e, i) => (
              <path
                key={i}
                d={bezierPath(e.from.x, e.from.y, e.to.x, e.to.y)}
                fill="none"
                stroke="#d8dadf"
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {ROUTERS.map((n) => <RouterCard key={n.id} node={n} />)}
          {CHIPS.map((n) => <ChipCard key={n.id} node={n} />)}
          {PROMPTS.map((n) => <PromptCard key={n.id} node={n} />)}
          {IMAGES.map((n) => <ImageCard key={n.id} node={n} />)}
        </div>
      </div>

      {/* Zoom / tool controls — matches RecipeCanvasView's read-only toolbar */}
      <div
        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-xl p-1"
        style={{ background: "#ffffff", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={() => setTool("select")}
          title="Select"
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          style={tool === "select" ? { background: BLUE_BG, color: BLUE } : { color: "#8b8f98" }}
        >
          <MousePointer2 size={14} />
        </button>
        <button
          onClick={() => setTool("pan")}
          title="Pan"
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          style={tool === "pan" ? { background: BLUE_BG, color: BLUE } : { color: "#8b8f98" }}
        >
          <Hand size={14} />
        </button>

        <div className="h-5 w-px" style={{ background: "#e5e5e6" }} />

        <button
          onClick={() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.1).toFixed(2))))}
          title="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100"
        >
          <Minus size={14} />
        </button>
        <span
          className="flex h-9 min-w-11 items-center justify-center rounded-md px-2 text-center text-xs font-semibold tabular-nums text-stone-600"
          style={{ background: "#f4f5f8" }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(2))))}
          title="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
