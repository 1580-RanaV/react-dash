import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import { LOCALES, type Locale } from "../lib/locales";
import { parseGlyph, align, lerpShape, toPath, easeInOutBack } from "../lib/morph";
import { useLocale } from "../lib/LocaleContext";
import type { UILocale } from "../lib/i18n";

// ── types & constants ─────────────────────────────────────────────────────────

type RGB = [number, number, number];

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}
function rgbStr([r, g, b]: RGB) { return `rgb(${r},${g},${b})`; }

const DURATION = 600;
const BLUE: RGB = [0, 128, 255];
const SUPPORTED_LOCALES = new Set<string>(["en", "lt", "ru"]);

// ── confirmation dialog ───────────────────────────────────────────────────────

function LangConfirmDialog({
  target,
  onConfirm,
  onClose,
}: {
  target: Locale;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const glyph = toPath(parseGlyph(target.code));

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />

      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-card-in"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex flex-col gap-5 px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Switch language
            </h2>
            <button
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border text-stone-400 transition-colors hover:bg-stone-100 dark:hover:bg-white/8"
              style={{ borderColor: "var(--border)" }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Glyph + locale name */}
          <div className="flex items-center gap-4">
            <div
              className="shrink-0 flex items-center justify-center rounded-xl w-14 h-14"
              style={{ background: "rgba(0,128,255,0.08)" }}
            >
              <svg width="36" height="36" viewBox="0 0 100 100" aria-hidden>
                <path d={glyph} fill="#0080FF" fillRule="nonzero" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {target.native}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                {target.name} · {target.code.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm leading-6 text-stone-500 dark:text-stone-400">
            Switch the console to{" "}
            <span className="font-medium text-stone-700 dark:text-stone-300">{target.native}</span>?
            You can always switch back to any language you like at any time.
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              style={{ borderColor: "var(--border)" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "#0080FF" }}
            >
              Switch to {target.native}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function LanguageSwitcher() {
  const { setLocale } = useLocale();
  const [selected, setSelected] = useState(LOCALES[0]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Locale | null>(null);

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const shapeRef = useRef(parseGlyph(LOCALES[0].code));
  const colorRef = useRef<RGB>(BLUE);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.setAttribute("d", toPath(shapeRef.current));
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Click-outside close for dropdown
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onDown, { capture: true });
  }, [open]);

  const morphTo = useCallback((locale: Locale) => {
    cancelAnimationFrame(rafRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduced ? 1 : DURATION;

    const fromShape = shapeRef.current;
    const toShape = parseGlyph(locale.code);
    const aligned = align(fromShape, toShape);
    const fromColor = colorRef.current;

    const t0 = performance.now();

    function tick(now: number) {
      const raw = Math.min((now - t0) / dur, 1);
      const shape = lerpShape(fromShape, aligned, easeInOutBack(raw));
      const color = lerpRgb(fromColor, BLUE, raw);
      if (pathRef.current) {
        pathRef.current.setAttribute("d", toPath(shape));
        pathRef.current.setAttribute("fill", rgbStr(color));
      }
      shapeRef.current = shape;
      colorRef.current = color;
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        shapeRef.current = toShape;
        colorRef.current = BLUE;
        if (pathRef.current) {
          pathRef.current.setAttribute("d", toPath(toShape));
          pathRef.current.setAttribute("fill", rgbStr(BLUE));
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  function handleSelect(locale: Locale) {
    setOpen(false);
    if (locale.code === selected.code) return;
    setPending(locale);
  }

  function handleConfirm() {
    if (!pending) return;
    setSelected(pending);
    morphTo(pending);
    if (SUPPORTED_LOCALES.has(pending.code)) {
      setLocale(pending.code as UILocale);
    }
    setPending(null);
  }

  const displayCode = selected.code === "pt-BR" ? "PT" : selected.code.toUpperCase();

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 select-none active:scale-95 transition-all duration-100 hover:bg-blue-50 dark:hover:bg-blue-500/10"
        aria-label="Switch language"
      >
        <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden style={{ display: "block", flexShrink: 0 }}>
          <path ref={pathRef} fill={rgbStr(BLUE)} fillRule="nonzero" />
        </svg>
        <span className="leading-none">{displayCode}</span>
        <ChevronDown
          size={10}
          className="shrink-0"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute right-0 z-200 mt-1.5 w-52 rounded-xl border shadow-lg overflow-hidden"
          style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
        >
          <div className="max-h-72 overflow-y-auto py-1">
            {LOCALES.map((locale) => {
              const active = locale.code === selected.code;
              return (
                <button
                  key={locale.code}
                  onClick={() => handleSelect(locale)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors hover:bg-stone-100 dark:hover:bg-white/6 ${
                    active ? "bg-stone-50 dark:bg-white/4" : ""
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 100 100" aria-hidden className="shrink-0">
                    <path
                      d={toPath(parseGlyph(locale.code))}
                      fill="#0080FF"
                      fillRule="nonzero"
                      opacity={active ? 1 : 0.5}
                    />
                  </svg>
                  <span className="flex-1 min-w-0">
                    <span className="block text-xs font-medium text-stone-800 dark:text-stone-200 truncate">
                      {locale.native}
                    </span>
                    <span className="block text-[10px] text-stone-400 dark:text-stone-500 truncate">
                      {locale.name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase">
                    {locale.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {pending && (
        <LangConfirmDialog
          target={pending}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}
