import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Heart, Play, RotateCcw } from "lucide-react";
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFavorites, type PinnedWidget } from "../lib/useFavorites";
import { usePlan, PLAN_LABELS, type Plan } from "../lib/usePlan";
import Greeting from "./Greeting";
import { WIDGET_REGISTRY } from "./widget-previews";

// ── Tool logos for empty state ────────────────────────────────────────────────

const brandLogo = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

type Tool = { domain?: string; jsLabel?: string; label: string };

const TOOLS: Tool[] = [
  { domain: "stripe.com",          label: "Stripe"          },
  { domain: "shopify.com",         label: "Shopify"         },
  { domain: "hubspot.com",         label: "HubSpot"         },
  { domain: "sendgrid.com",        label: "SendGrid"        },
  { domain: "gmail.com",           label: "Gmail"           },
  { domain: "calendar.google.com", label: "Google Calendar" },
  { domain: "salesforce.com",      label: "Salesforce"      },
  { domain: "mixpanel.com",        label: "Mixpanel"        },
  { domain: "segment.com",         label: "Segment"         },
  { domain: "zapier.com",          label: "Zapier"          },
  { domain: "intercom.com",        label: "Intercom"        },
  { jsLabel: "JS",                 label: "JavaScript SDK"  },
  { domain: "slack.com",           label: "Slack"           },
  { domain: "notion.so",           label: "Notion"          },
  { domain: "figma.com",           label: "Figma"           },
  { domain: "twilio.com",          label: "Twilio"          },
  { domain: "amplitude.com",       label: "Amplitude"       },
  { domain: "airtable.com",        label: "Airtable"        },
  { domain: "klaviyo.com",         label: "Klaviyo"         },
  { domain: "freshdesk.com",       label: "Freshdesk"       },
];


// ── Card dispatcher — no DnD logic ────────────────────────────────────────────

function WidgetCardInner({
  widget,
  onUnpin,
  isOverlay = false,
  dragHandleProps = {},
}: {
  widget: PinnedWidget;
  onUnpin?: () => void;
  isOverlay?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}) {
  const entry = WIDGET_REGISTRY.find(e => e.matches(widget)) ?? WIDGET_REGISTRY[WIDGET_REGISTRY.length - 1];
  return <entry.Render widget={widget} onUnpin={onUnpin} isOverlay={isOverlay} dragHandleProps={dragHandleProps} />;
}

function inferWidgetHref(widget: PinnedWidget): string | undefined {
  if (widget.href) return widget.href;

  const widgetType = String(widget.meta?.widgetType ?? "").toLowerCase();
  const id = widget.id;

  if (widget.type === "meeting") return "/meetings/rd-check-in";
  if (widget.type === "recipe" && widget.meta?.recipeId) return `/recipes/${widget.meta.recipeId}`;
  if (widget.type === "asset" && widget.meta?.assetId) return `/asset-library/${widget.meta.assetId}`;
  if (widget.type === "design" && id.startsWith("design-system-")) return `/design-system?theme=${id.replace("design-system-", "")}`;
  if (widget.type === "journey" && id.startsWith("journey-")) return `/journeys/${id.replace("journey-", "")}`;
  if (widget.type === "product") return id.startsWith("product-") ? `/catalog/products/${id.replace("product-", "")}` : "/catalog";

  if (widget.type === "asset" && widgetType.includes("avatar")) return `/avatars/${id.replace(/^new avatar-/, "")}`;
  if (widget.type === "asset" && widgetType.includes("scene")) return `/scenes/${id.replace(/^new scene-/, "")}`;
  if (widget.type === "asset" && widgetType.includes("pose")) return `/poses/${id.replace(/^new pose-/, "")}`;
  if (widget.type === "kpi" && String(widget.sublabel ?? "").toLowerCase() === "journeys") return "/journeys";
  if (widget.type === "report") return "/boards";

  switch (widget.type) {
    case "kpi":
      return "/boards";
    case "design":
      return "/design-system";
    case "asset":
      return "/asset-library";
    case "journey":
      return "/journeys";
    case "recipe":
      return "/recipes";
    case "experience":
      return "/experiences";
    case "custom":
      return "/home";
    default:
      return "/home";
  }
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && !!target.closest("button,a,input,textarea,select,iframe,[role='button']");
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────

function SortableWidgetCard({ widget, onUnpin, showError }: { widget: PinnedWidget; onUnpin: () => void; showError?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });
  const navigate = useNavigate();
  const href = inferWidgetHref(widget);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  if (showError) {
    return (
      <div ref={setNodeRef} style={wrapperStyle} className="break-inside-avoid mb-3">
        <div
          className="relative rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 h-44 select-none"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
        >
          <img src="/logo.png" alt="Intempt" className="h-6 w-auto opacity-50" />
          <p className="text-xs text-stone-500 dark:text-stone-400 text-center px-6 leading-relaxed">
            Couldn't load this widget
          </p>
          <button
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
            style={{ border: "1px solid var(--border)" }}
          >
            <RotateCcw size={11} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  function rememberPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  }

  function movedSincePointerDown(e: React.MouseEvent<HTMLDivElement>) {
    const start = pointerDownRef.current;
    if (!start) return false;
    return Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6;
  }

  function openWidget(e: React.MouseEvent<HTMLDivElement>) {
    if (!href || isInteractiveTarget(e.target)) return;
    if (movedSincePointerDown(e)) return;
    openHref(href);
  }

  function openHref(targetHref: string) {
    if (/^https?:\/\//.test(targetHref)) {
      window.location.href = targetHref;
      return;
    }
    navigate(targetHref);
  }

  function openFromButton(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (!href) return;
    if (/^https?:\/\//.test(href)) {
      window.location.href = href;
      return;
    }
    openHref(href);
  }

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      className={`group/pin relative break-inside-avoid mb-3 ${href ? "cursor-pointer" : ""}`}
      onPointerDownCapture={rememberPointerDown}
      onClick={openWidget}
      title={href ? `Open ${widget.label}` : undefined}
    >
      {href && !isDragging && (
        <button
          type="button"
          onClick={openFromButton}
          onPointerDown={(e) => e.stopPropagation()}
          className="pointer-events-none absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-stone-600 opacity-0 shadow-sm transition-all hover:scale-105 hover:text-stone-900 group-hover/pin:pointer-events-auto group-hover/pin:opacity-100 dark:bg-stone-900/92 dark:text-stone-300 dark:hover:text-stone-100"
          style={{ border: "1px solid var(--border)", backdropFilter: "blur(8px)" }}
          aria-label={`Open ${widget.label}`}
          title={`Open ${widget.label}`}
        >
          <ExternalLink size={13} />
        </button>
      )}
      <WidgetCardInner
        widget={widget}
        onUnpin={onUnpin}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ── Marquee empty state ───────────────────────────────────────────────────────

const MARQUEE_FADE =
  "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)";

function MarqueeIcon({ tool }: { tool: Tool }) {
  return (
    <div
      className="flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl"
      style={{ background: tool.jsLabel ? "#F7DF1E" : "var(--content-bg)" }}
      title={tool.label}
    >
      {tool.jsLabel ? (
        <span className="text-base sm:text-xl font-black text-black">{tool.jsLabel}</span>
      ) : (
        <img
          src={brandLogo(tool.domain!)}
          alt={tool.label}
          className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </div>
  );
}

function MarqueeRow({ tools, reverse, duration }: { tools: Tool[]; reverse?: boolean; duration: number }) {
  const doubled = [...tools, ...tools];
  return (
    <div className="flex w-full overflow-hidden">
      <div
        className="flex shrink-0 gap-2.5 sm:gap-3"
        style={{
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((tool, i) => <MarqueeIcon key={i} tool={tool} />)}
      </div>
    </div>
  );
}

const PINBOARD_CTAS = [
  { href: "/integrations",  label: "Connect tools"   },
  { href: "/boards",        label: "Explore reports" },
  { href: "/design-system", label: "Browse designs"  },
] as const;

function EmptyPinboard() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <style>{`
        @keyframes marquee-left  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
        @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
      `}</style>

      <div
        className="mb-8 w-full max-w-sm sm:max-w-md flex flex-col gap-2.5 sm:gap-3 overflow-hidden"
        style={{ maskImage: MARQUEE_FADE, WebkitMaskImage: MARQUEE_FADE }}
      >
        <MarqueeRow tools={TOOLS.slice(0, 10)} duration={28} />
        <MarqueeRow tools={TOOLS.slice(10)}    duration={34} reverse />
      </div>

      <h2 className="text-xl sm:text-[22px] font-semibold tracking-tight text-stone-900 dark:text-stone-50 mb-2">
        Make it yours.
      </h2>

      <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 max-w-xs sm:max-w-sm mb-7">
        Connect your tools, explore reports, and{" "}
        <span className="inline-flex items-center gap-0.5">
          <Heart size={11} className="fill-current text-red-500 inline" />{" "}heart
        </span>{" "}
        any report, design system, or asset to pin it here and build your own home.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {PINBOARD_CTAS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            style={{ textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── View-mode toggle ──────────────────────────────────────────────────────────

// ── Main view ─────────────────────────────────────────────────────────────────

const PLANS: Plan[] = ["free", "pro", "org", "enterprise", "error"];

export default function PinboardView() {
  const { pinned, unpin, reorder } = useFavorites();
  const { plan, setPlan, limit } = usePlan();
  const [items,    setItems]    = useState<string[]>(() => pinned.map(w => w.id));
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync when pinned list changes (external pin/unpin)
  useEffect(() => {
    setItems(prev => {
      const pinnedSet = new Set(pinned.map(w => w.id));
      const kept   = prev.filter(id => pinnedSet.has(id));
      const newIds = pinned.map(w => w.id).filter(id => !kept.includes(id));
      return [...kept, ...newIds];
    });
  }, [pinned]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const orderedWidgets = items
    .map(id => pinned.find(w => w.id === id))
    .filter(Boolean) as PinnedWidget[];

  const activeWidget = activeId ? pinned.find(w => w.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = items.indexOf(active.id as string);
    const newIdx = items.indexOf(over.id as string);
    const next = arrayMove(items, oldIdx, newIdx);
    setItems(next);
    reorder(next);
  }

  if (pinned.length === 0) {
    return (
      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
        <div className="px-6 pt-6 pb-2"><Greeting /></div>
        <EmptyPinboard />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 flex-col min-h-0 overflow-y-auto px-6 pt-6 pb-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Greeting />
          <div className="flex items-center gap-2 shrink-0">
            {/* Plan switcher */}
            <div
              className="flex items-center rounded-lg p-0.5 gap-0.5"
              style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
            >
              {PLANS.map(p => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`px-2.5 h-7 rounded-md text-xs font-medium transition-colors ${
                    plan === p && p === "error"
                      ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 shadow-sm"
                      : plan === p
                      ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
                      : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                  }`}
                >
                  {PLAN_LABELS[p]}
                </button>
              ))}
            </div>
            {/* Card count */}
            <span className="text-xs text-stone-400 dark:text-stone-500 tabular-nums">
              {pinned.length}/{limit === Infinity ? "∞" : limit}
            </span>
            <button
              onClick={() => window.dispatchEvent(new Event("open-blu-chat"))}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium border transition-colors hover:bg-stone-50 dark:hover:bg-white/6 text-stone-600 dark:text-stone-400"
              style={{ borderColor: "var(--border)" }}
            >
              <Play size={11} className="fill-current" />
              Watch intro
            </button>
          </div>
        </div>

        {/* Masonry */}
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3">
            {orderedWidgets.map((widget, index) => (
              <SortableWidgetCard
                key={widget.id}
                widget={widget}
                onUnpin={() => unpin(widget.id)}
                showError={plan === "error" && index % 2 === 0}
              />
            ))}
          </div>
        </SortableContext>

        <p className="mt-6 text-xs text-stone-400 dark:text-stone-500 text-center">
          Drag to reorder · <Heart size={9} className="inline text-red-400 fill-current" /> heart items across the product to add them here
        </p>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
        {activeWidget && (
          <div className="col-span-1">
            <WidgetCardInner widget={activeWidget} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
