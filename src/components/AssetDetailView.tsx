
import { useEffect, useRef, useState } from "react";
import BackButton from "./BackButton";
import DesktopOnlyGate from "./DesktopOnlyGate";
import HeartButton from "./HeartButton";

const ASSET_NAMES: Record<string, string> = {
  "a1":  "Claude design - Email 1",
  "a2":  "Built a flash sale SMS using Liquid product variables with a 7-day expiry",
  "a3":  "Removed the JSON wrapper entirely — outputting only the raw HTML",
  "a4":  "Generate an image of the brand character holding a can of Co",
  "a5":  "Generate an image of the brand character holding a water tumbler",
  "a6":  "a beautifully wrapped gift box with a satin ribbon on a clean surface",
  "a7":  "Create an image of the brand character holding a bottle",
  "a8":  "Dev Patel, solo founder, sitting at a rustic desk with a laptop",
  "a9":  "diverse group of tech professionals collaborating in a modern office",
  "a10": "dramatic overhead shot of scattered shopping bags and gift boxes",
  "a11": "Product photography of a pair of classic black leather penny loafers",
  "a12": "change character's pink pants to grey shorts",
};

export const EMAIL_TEMPLATES: Record<string, string> = {
  a1: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=600">
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f5f4;color:#1a1a1a;}
  .wrap{max-width:600px;margin:28px auto;padding:0 16px 28px;}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);}
  .hd{background:linear-gradient(140deg,#0f172a 0%,#1e3a5f 100%);padding:32px 32px 28px;}
  .logo-row{display:flex;align-items:center;gap:9px;margin-bottom:22px;}
  .logo-sq{width:28px;height:28px;border-radius:7px;background:#0080FF;display:inline-block;}
  .logo-nm{font-size:15px;font-weight:700;color:#fff;letter-spacing:-0.01em;}
  h1{font-size:26px;font-weight:700;color:#fff;line-height:1.22;letter-spacing:-0.025em;}
  .h1-sub{font-size:13px;color:#7dd3fc;margin-top:8px;}
  .bd{padding:26px 32px;}
  .hi{font-size:14px;color:#6b7280;margin-bottom:14px;}
  .para{font-size:14px;line-height:1.7;color:#374151;margin-bottom:14px;}
  .stats{display:flex;gap:10px;margin:20px 0;}
  .stat{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:14px 10px;text-align:center;}
  .sn{font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.03em;}
  .sl{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-top:3px;}
  .sd{font-size:11px;font-weight:600;color:#16a34a;margin-top:4px;}
  .insight{background:#eff6ff;border-left:3px solid #3b82f6;border-radius:0 8px 8px 0;padding:13px 15px;margin:16px 0;font-size:13px;color:#1e40af;line-height:1.65;}
  .cta{text-align:center;margin:24px 0 8px;}
  .btn{display:inline-block;background:#0080FF;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;}
  .sep{height:1px;background:#f3f4f6;margin:20px 0;}
  .ft{padding:18px 32px;background:#f9fafb;}
  .ft p{font-size:11px;color:#9ca3af;text-align:center;line-height:1.75;}
  .link{text-decoration:underline;cursor:pointer;}
  strong{color:#111827;}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hd">
      <div class="logo-row">
        <div class="logo-sq"></div>
        <span class="logo-nm">Intempt</span>
      </div>
      <h1>Your weekly product<br>analytics digest</h1>
      <p class="h1-sub">June 2–8, 2026 &nbsp;·&nbsp; Workspace: Acme Corp</p>
    </div>
    <div class="bd">
      <p class="hi">Hey Rana 👋</p>
      <p class="para">Here's a quick look at how your product performed this week. Engagement is trending up and your top conversion funnel hit a new monthly high.</p>
      <div class="stats">
        <div class="stat"><div class="sn">12.4k</div><div class="sl">Sessions</div><div class="sd">↑ 18%</div></div>
        <div class="stat"><div class="sn">3.8%</div><div class="sl">Conv. Rate</div><div class="sd">↑ 0.4pp</div></div>
        <div class="stat"><div class="sn">$24.1k</div><div class="sl">Revenue</div><div class="sd">↑ 12%</div></div>
      </div>
      <div class="insight">
        💡 <strong>Key insight:</strong> Returning mobile users who visited 3+ pages converted at <strong>2.1×</strong> your average rate this week — your strongest performing segment.
      </div>
      <p class="para">The <strong>Checkout → Confirm</strong> step still has the highest drop-off at 34%. We've flagged 3 suggestions in your funnel report worth reviewing before your next sprint.</p>
      <div class="cta"><a class="btn" href="#">View full report →</a></div>
      <div class="sep"></div>
      <p style="font-size:11px;color:#9ca3af;text-align:center;line-height:1.75;">
        You're receiving this because weekly digests are enabled for your workspace.<br>
        <span class="link">Manage preferences</span> &nbsp;·&nbsp; <span class="link">Unsubscribe</span>
      </p>
    </div>
    <div class="ft">
      <p>Intempt Inc. · 340 S Lemon Ave, Walnut CA 91789<br>© 2026 Intempt. All rights reserved.</p>
    </div>
  </div>
</div>
</body>
</html>`,
};

export default function AssetDetailView({ id, onBack }: { id: string; onBack: () => void }) {
  return <DesktopOnlyGate><AssetDetailViewInner id={id} onBack={onBack} /></DesktopOnlyGate>;
}

function AssetDetailViewInner({ id, onBack }: { id: string; onBack: () => void }) {
  const title = ASSET_NAMES[id] ?? "Untitled asset";
  const emailHtml = EMAIL_TEMPLATES[id];
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event("open-blu-chat")), 80);
    return () => clearTimeout(t);
  }, []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.2, z * (1 - e.deltaY * 0.001))));
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
    const lx = el ? el.clientWidth  * 0.65 : 500;
    const ly = el ? el.clientHeight * 0.65 : 400;
    setPan((p) => ({
      x: Math.min(lx, Math.max(-lx, p.x + dx)),
      y: Math.min(ly, Math.max(-ly, p.y + dy)),
    }));
  }

  function stopDrag() { dragging.current = false; }

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden animate-fade-up"
      style={{ background: "var(--main-bg)" }}
    >
      {/* Top bar */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
      >
        <BackButton onClick={onBack} />
        <span className="flex-1 text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
          {title}
        </span>
        {emailHtml && (
          <HeartButton
            widget={{
              id: `asset-${id}`,
              type: "asset",
              label: title,
              size: "sm",
              meta: { assetId: id, isEmail: true },
            }}
          />
        )}
      </div>

      {/* Dotted canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden select-none"
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
          className="flex min-h-full items-center justify-center p-16"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
        >
          {emailHtml ? (
            /* Stop mouse events so iframe area doesn't pan canvas */
            <div
              style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.18)", borderRadius: 16, overflow: "hidden" }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
            >
              <iframe
                srcDoc={emailHtml}
                style={{ width: 600, height: 820, border: "none", display: "block" }}
                title={title}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
