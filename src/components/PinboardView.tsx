import { useState, useEffect, useRef, cloneElement } from "react";
import {
  Heart, GripVertical, ChevronRight, Plug, BarChart3,
  FileImage, Palette, TrendingUp, Activity, Video, FlaskConical,
  LayoutGrid, LayoutTemplate, Play, Package, Shuffle,
} from "lucide-react";
import { MeetingVideoPlayer } from "./MeetingDetailView";
import { EMAIL_TEMPLATES } from "./AssetDetailView";
import { RECIPES, RECIPE_DATES, RECIPE_CREATORS } from "./RecipesView";
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
import Greeting from "./Greeting";
import { InsightsMiniChart } from "./boards/InsightsTab";

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

// ── Email preview (scales iframe to fit card width) ───────────────────────────

function EmailPreviewFrame({ html, cardH = 220 }: { html: string; cardH?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 0) setScale(w / 600);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const iframeH = scale > 0 ? Math.ceil(cardH / scale) : 440;

  return (
    <div ref={wrapRef} className="w-full h-full overflow-hidden relative">
      <iframe
        srcDoc={html}
        style={{
          width: 600,
          height: iframeH,
          border: "none",
          display: "block",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
        title="Email preview"
      />
    </div>
  );
}

// ── Widget card ───────────────────────────────────────────────────────────────

const WIDGET_ICON: Record<string, typeof Heart> = {
  kpi:        TrendingUp,
  report:     BarChart3,
  design:     Palette,
  asset:      FileImage,
  journey:    Activity,
  meeting:    Video,
  recipe:     FlaskConical,
  custom:     BarChart3,
  product:    Package,
  experience: Shuffle,
};

const SPARKLINE = [28, 32, 24, 40, 36, 45, 38, 52, 47, 58, 53, 62];

function Sparkline({ values = SPARKLINE, color = "#0080FF" }: { values?: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? 50 : (i / (values.length - 1)) * 100;
    const y = 28 - (v / max) * 24;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 32" className="w-full h-8 overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,32 ${pts} 100,32`} fill={color} fillOpacity="0.08" stroke="none" />
    </svg>
  );
}

const CARD_STYLES = `
  @keyframes heartbeat {
    0%   { transform: scale(1);    }
    20%  { transform: scale(1.6);  }
    40%  { transform: scale(1);    }
    65%  { transform: scale(1.35); }
    100% { transform: scale(1);    }
  }
  @keyframes card-out {
    0%   { opacity: 1; transform: scale(1);    }
    40%  { opacity: 1; transform: scale(1.01); }
    100% { opacity: 0; transform: scale(0.94); }
  }
`;

function PinboardHeart({ onClick, removing }: { onClick: () => void; removing: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      onPointerDown={e => e.stopPropagation()}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-stone-900 text-red-500 transition-transform hover:scale-110"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        border: "1px solid var(--border)",
        animation: removing ? "heartbeat 0.55s ease-in-out" : undefined,
      }}
      title="Remove from pinboard"
    >
      <Heart size={13} className="fill-current" />
    </button>
  );
}

// Pure presentational card — no DnD logic
function WidgetCardInner({
  widget,
  onUnpin,
  isOverlay = false,
  dragHandleProps = {},
  uniform = true,
}: {
  widget: PinnedWidget;
  onUnpin?: () => void;
  isOverlay?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  uniform?: boolean;
}) {
  const [removing, setRemoving] = useState(false);

  function handleUnpin() {
    if (!onUnpin) return;
    setRemoving(true);
    setTimeout(onUnpin, 680);
  }

  const removeStyle = removing ? { animation: "card-out 0.65s ease-in forwards" } : undefined;
  const overlayStyle = isOverlay
    ? { boxShadow: "0 16px 48px rgba(0,0,0,0.22)", transform: "scale(1.03)", cursor: "grabbing" }
    : {};

  // ── Design-system card ────────────────────────────────────────────────────
  if (widget.type === "design") {
    const colors = (widget.meta?.colors as string[] | undefined) ?? ["#ccc", "#eee", "#aaa", "#f5f5f5"];
    return (
      <div
        className={`group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col ${uniform ? "h-55" : "h-44"}`}
        style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
        {...dragHandleProps}
      >
        <style>{CARD_STYLES}</style>
        <div className="flex flex-1 min-h-0">
          {colors.map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
        </div>
        <div className="shrink-0 flex items-center gap-3 px-4 py-3.5" style={{ background: "var(--content-bg)" }}>
          <div
            className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white dark:ring-stone-800"
            style={{ background: `conic-gradient(${colors[0]} 0deg 180deg, ${colors[1]} 180deg 360deg)` }}
          />
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{widget.label}</span>
        </div>
        {!isOverlay && onUnpin && (
          <div className="absolute right-2.5 top-2.5">
            <PinboardHeart onClick={handleUnpin} removing={removing} />
          </div>
        )}
        <span className="absolute left-2 top-3 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-400">
          <GripVertical size={14} />
        </span>
      </div>
    );
  }

  // ── Recipe card ───────────────────────────────────────────────────────────
  if (widget.type === "recipe") {
    const recipe = RECIPES.find(r => r.id === String(widget.meta?.recipeId ?? ""));
    if (recipe) {
      const chips = Array.from(new Set([...recipe.spec.areas, ...recipe.spec.products])).slice(0, 2);
      const creator = RECIPE_CREATORS[recipe.id];

      if (!uniform) {
        // Natural mode — mirrors the recipes homepage card exactly
        return (
          <div
            className="group relative rounded-xl p-5 overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col gap-3"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
            {...dragHandleProps}
          >
            <style>{CARD_STYLES}</style>
            <span className="pointer-events-none absolute -right-3 -bottom-3 select-none text-stone-900 dark:text-stone-100 opacity-[0.045] dark:opacity-[0.06]">
              {cloneElement(recipe.icon as React.ReactElement<{ size?: number }>, { size: 88 })}
            </span>
            <div className="shrink-0 flex items-center justify-between gap-2">
              {creator && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: creator.color }}>
                    {creator.initials}
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-400 truncate">{creator.name}</span>
                </div>
              )}
              <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{RECIPE_DATES[recipe.id]}</span>
            </div>
            <div className="flex-1 pr-6">
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1.5">{recipe.title}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{recipe.description}</p>
            </div>
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {chips.map(chip => (
                  <span key={chip} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
                    {chip}
                  </span>
                ))}
              </div>
            )}
            {!isOverlay && onUnpin && (
              <div className="absolute right-2 top-2">
                <PinboardHeart onClick={handleUnpin} removing={removing} />
              </div>
            )}
            <span className="absolute left-2 top-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-300 dark:text-stone-600">
              <GripVertical size={14} />
            </span>
          </div>
        );
      }

      // Uniform mode
      return (
        <div
          className="group relative rounded-xl p-4 overflow-hidden select-none cursor-grab active:cursor-grabbing h-55 flex flex-col gap-2.5"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
          {...dragHandleProps}
        >
          <style>{CARD_STYLES}</style>
          <span className="pointer-events-none absolute -right-3 -bottom-3 select-none text-stone-900 dark:text-stone-100 opacity-[0.045] dark:opacity-[0.06]">
            {cloneElement(recipe.icon as React.ReactElement<{ size?: number }>, { size: 88 })}
          </span>
          <div className="shrink-0 flex items-center justify-between gap-2">
            {creator && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: creator.color }}>
                  {creator.initials}
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-400 truncate">{creator.name}</span>
              </div>
            )}
            <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{RECIPE_DATES[recipe.id]}</span>
          </div>
          <div className="flex-1 min-h-0 pr-6">
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1.5 line-clamp-2">{recipe.title}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{recipe.description}</p>
          </div>
          {chips.length > 0 && (
            <div className="shrink-0 flex flex-wrap gap-1">
              {chips.map(chip => (
                <span key={chip} className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
                  {chip}
                </span>
              ))}
            </div>
          )}
          {!isOverlay && onUnpin && (
            <div className="absolute right-2 top-2">
              <PinboardHeart onClick={handleUnpin} removing={removing} />
            </div>
          )}
          <span className="absolute left-2 top-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-300 dark:text-stone-600">
            <GripVertical size={14} />
          </span>
        </div>
      );
    }
  }

  // ── Email asset card ─────────────────────────────────────────────────────
  const emailHtml = widget.type === "asset" && widget.meta?.assetId
    ? EMAIL_TEMPLATES[widget.meta.assetId as string]
    : null;

  if (emailHtml) {
    const emailCardH = uniform ? 220 : 288;
    return (
      <div
        className={`group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col ${uniform ? "h-55" : "h-72"}`}
        style={{ border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
        {...dragHandleProps}
      >
        <style>{CARD_STYLES}</style>
        <div className="flex-1 min-h-0">
          <EmailPreviewFrame html={emailHtml} cardH={emailCardH} />
        </div>
        {!isOverlay && onUnpin && (
          <div className="absolute right-2 top-2">
            <PinboardHeart onClick={handleUnpin} removing={removing} />
          </div>
        )}
        <span className="absolute left-2 top-1/3 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-stone-400">
          <GripVertical size={14} />
        </span>
      </div>
    );
  }

  // ── Meeting recording card ────────────────────────────────────────────────
  if (widget.type === "meeting") {
    if (!uniform) {
      // Natural mode — 16:9 video box + footer
      return (
        <div
          className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col bg-stone-950"
          style={{ border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
          {...dragHandleProps}
        >
          <style>{CARD_STYLES}</style>
          <div className="aspect-video w-full">
            <MeetingVideoPlayer compact={false} />
          </div>
          <div className="shrink-0 flex items-center gap-2.5 px-4 py-3">
            <Video size={13} className="text-stone-400 shrink-0" />
            <span className="text-sm font-semibold text-stone-100 truncate">{widget.label}</span>
          </div>
          {!isOverlay && onUnpin && (
            <div className="absolute right-2 top-2">
              <PinboardHeart onClick={handleUnpin} removing={removing} />
            </div>
          )}
          <span className="absolute left-2 top-4 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-white/40">
            <GripVertical size={14} />
          </span>
        </div>
      );
    }

    // Uniform mode
    return (
      <div
        className="group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing h-55 flex flex-col bg-black"
        style={{ border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
        {...dragHandleProps}
      >
        <style>{CARD_STYLES}</style>
        <div className="flex-1 min-h-0">
          <MeetingVideoPlayer compact />
        </div>
        <div className="shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 bg-stone-950">
          <Video size={12} className="text-stone-400 shrink-0" />
          <span className="text-sm font-semibold text-stone-100 truncate">{widget.label}</span>
        </div>
        {!isOverlay && onUnpin && (
          <div className="absolute right-2 top-2">
            <PinboardHeart onClick={handleUnpin} removing={removing} />
          </div>
        )}
        <span className="absolute left-2 top-1/3 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none text-white/40">
          <GripVertical size={14} />
        </span>
      </div>
    );
  }

  // ── Product card ─────────────────────────────────────────────────────────
  if (widget.type === "product") {
    const image = widget.meta?.image as string | undefined;
    return (
      <div
        className={`group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col ${uniform ? "h-55" : "h-44"}`}
        style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
        {...dragHandleProps}
      >
        <style>{CARD_STYLES}</style>
        <div className="flex-1 min-h-0 flex items-center justify-center bg-stone-50 dark:bg-white/4 overflow-hidden">
          {image
            ? <img src={image} alt={widget.label} className="w-full h-full object-contain p-4" />
            : <Package size={32} className="text-stone-300 dark:text-stone-600" />
          }
        </div>
        <div className="shrink-0 px-4 py-3" style={{ borderTop: "1px solid var(--border)", background: "var(--content-bg)" }}>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate">{widget.label}</p>
        </div>
        {!isOverlay && onUnpin && (
          <div className="absolute right-2 top-2">
            <PinboardHeart onClick={handleUnpin} removing={removing} />
          </div>
        )}
        <span className="absolute left-2 top-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-300 dark:text-stone-600">
          <GripVertical size={14} />
        </span>
      </div>
    );
  }

  // ── Generic card ──────────────────────────────────────────────────────────
  const Icon = WIDGET_ICON[widget.type] ?? BarChart3;
  const disconnected = widget.meta?.disconnected === true;

  return (
    <div
      className={`group relative rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col ${uniform ? "h-55" : "h-44"}`}
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...overlayStyle }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <span className="absolute left-2 top-4 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none text-stone-300 dark:text-stone-600">
        <GripVertical size={14} />
      </span>
      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2">
          <PinboardHeart onClick={handleUnpin} removing={removing} />
        </div>
      )}

      <div className="px-4 pt-3 pb-0 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex items-center gap-2 mb-2 pr-8">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8">
            <Icon size={12} className="text-stone-500 dark:text-stone-400" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate text-stone-800 dark:text-stone-100">{widget.label}</p>
            {widget.sublabel && (
              <p className="text-[10px] text-stone-400 dark:text-stone-500">{widget.sublabel}</p>
            )}
          </div>
        </div>

        {disconnected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 rounded-lg px-3 py-4 mb-4" style={{ background: "var(--muted)" }}>
            <Plug size={14} className="text-stone-400" />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
              Connect {widget.source === "stripe" ? "Stripe" : "SDK"} to see this widget
            </p>
            <a href="/integrations" className="inline-flex h-7 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-white" style={{ background: "#0080FF" }}>
              Connect <ChevronRight size={10} />
            </a>
          </div>
        ) : widget.type === "kpi" ? (
          (() => {
            const sparklineData = widget.meta?.sparkline as number[] | undefined;
            const change = widget.meta?.change ? String(widget.meta.change) : "";
            const badge  = widget.meta?.badge  ? String(widget.meta.badge)  : "";
            const isPositive = badge.startsWith("+") || (change.startsWith("+") && !change.startsWith("+-"));
            const isNegative = badge.startsWith("-") || change.startsWith("-");
            return (
              <div className="flex-1 flex flex-col justify-center pb-3">
                <p className="text-[30px] font-bold tabular-nums tracking-tight leading-none text-stone-900 dark:text-stone-50">
                  {String(widget.meta?.value ?? "—")}
                </p>
                {(badge || change) && (
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {badge && (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isPositive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400"
                        : isNegative ? "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400"
                        : "bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400"
                      }`}>{badge}</span>
                    )}
                    {change && (
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">{change}</span>
                    )}
                  </div>
                )}
                {sparklineData?.length ? (
                  <div className="mt-3"><Sparkline values={sparklineData} /></div>
                ) : null}
              </div>
            );
          })()
        ) : widget.type === "report" ? (
          <div className="flex-1 min-h-0 -mx-4 relative">
            <div className="absolute inset-0">
              <InsightsMiniChart height="100%" />
            </div>
          </div>
        ) : widget.type === "asset" && widget.meta?.gradient ? (
          <div
            className="flex-1 min-h-0 -mx-4 mb-0 relative overflow-hidden rounded-b-xl"
            style={{ background: `linear-gradient(145deg, ${(widget.meta.gradient as string[])[0]}, ${(widget.meta.gradient as string[])[1]})` }}
          >
            {!!widget.meta.image && (
              <img src={String(widget.meta.image)} alt={widget.label} className="absolute inset-0 h-full w-full object-cover object-center" />
            )}
            <div
              className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-8"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)" }}
            >
              <p className="text-xs font-semibold text-white capitalize">{String(widget.meta.widgetType ?? "")}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 rounded-lg p-2" style={{ background: "var(--muted)" }}>
            <FileImage size={14} className="text-stone-400" />
            <p className="text-xs text-stone-500 truncate">{String(widget.meta?.filename ?? "Asset")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────

function SortableWidgetCard({ widget, onUnpin, uniform }: { widget: PinnedWidget; onUnpin: () => void; uniform: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.id });

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  // Meeting cards span 2 columns in natural mode
  const colSpan = !uniform && widget.type === "meeting" ? "col-span-2" : "col-span-1";

  return (
    <div ref={setNodeRef} style={wrapperStyle} className={colSpan}>
      <WidgetCardInner
        widget={widget}
        onUnpin={onUnpin}
        uniform={uniform}
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

type ViewMode = "uniform" | "natural";
const VIEW_MODE_KEY = "intempt:pinboard-view";

function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
    >
      <button
        onClick={() => onChange("uniform")}
        title="Uniform grid"
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          mode === "uniform"
            ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
            : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        }`}
      >
        <LayoutGrid size={13} />
      </button>
      <button
        onClick={() => onChange("natural")}
        title="Natural sizes"
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
          mode === "natural"
            ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm"
            : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
        }`}
      >
        <LayoutTemplate size={13} />
      </button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function PinboardView() {
  const { pinned, unpin, reorder } = useFavorites();
  const [items,    setItems]    = useState<string[]>(() => pinned.map(w => w.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === "natural" ? "natural" : "uniform";
  });

  function handleViewMode(m: ViewMode) {
    setViewMode(m);
    localStorage.setItem(VIEW_MODE_KEY, m);
  }

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
  const uniform = viewMode === "uniform";

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
            <ViewModeToggle mode={viewMode} onChange={handleViewMode} />
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

        {/* Grid */}
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 items-start">
            {orderedWidgets.map(widget => (
              <SortableWidgetCard
                key={widget.id}
                widget={widget}
                onUnpin={() => unpin(widget.id)}
                uniform={uniform}
              />
            ))}
          </div>
        </SortableContext>

        <p className="mt-6 text-xs text-stone-400 dark:text-stone-500 text-center">
          Drag to reorder · <Heart size={9} className="inline text-red-400 fill-current" /> heart items across the product to add them here
        </p>
      </div>

      {/* Floating ghost — always renders in uniform size for a consistent drag ghost */}
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
        {activeWidget && (
          <div className="col-span-1">
            <WidgetCardInner widget={activeWidget} isOverlay uniform />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
