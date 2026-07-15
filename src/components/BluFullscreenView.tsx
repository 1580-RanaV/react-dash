
import BluChat from "./BluChat";

export default function BluFullscreenView() {
  return (
    <div
      className="fixed inset-0 flex items-stretch"
      style={{ background: "var(--sidebar-background)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Left: branding strip */}
      <div
        className="hidden md:flex flex-col items-center gap-3 px-3 pt-4 pb-4 shrink-0"
        style={{
          width: 52,
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-background)",
        }}
      >
        <img src="/mascot.png" alt="Blu" width={30} height={30} className="rounded-full object-contain" />
      </div>

      {/* Right: full chat */}
      <div className="flex-1 flex flex-col min-w-0 p-2 md:pl-2 md:pr-3 md:py-3">
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)" }}>
          <BluChat
            onClose={() => window.close()}
            mode="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
