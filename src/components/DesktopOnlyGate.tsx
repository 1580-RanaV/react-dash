import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function DesktopOnlyGate({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (!isMobile) return <>{children}</>;

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div
        className="flex flex-col items-center text-center gap-4 rounded-2xl px-7 py-8 w-full max-w-xs animate-fade-up"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Monitor size={26} style={{ color: "#0080FF" }} />
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
            Best on desktop
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            This editor is designed for larger screens. Switch to a desktop or laptop for the full experience.
          </p>
        </div>
      </div>
    </div>
  );
}
