

import { useState } from "react";
import { Info } from "lucide-react";

export default function InfoTooltip({
  content,
  variant = "badge",
  maxWidth = "max-w-52",
  className = "",
}: {
  content: React.ReactNode;
  variant?: "plain" | "badge";
  maxWidth?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {variant === "badge" ? (
        <span className="flex h-3.5 w-3.5 cursor-default select-none items-center justify-center rounded-full bg-stone-200/80 text-stone-400 transition-colors hover:bg-stone-300/60 dark:bg-white/10 dark:text-stone-500 dark:hover:bg-white/18">
          <Info size={9} />
        </span>
      ) : (
        <Info size={12} className="text-stone-400 shrink-0" />
      )}
      {show && (
        <span
          className={`animate-tooltip-in pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-200 w-max ${maxWidth} -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs font-normal leading-relaxed whitespace-normal text-white shadow-lg`}
          style={{ background: "rgba(24,24,27,0.93)", backdropFilter: "blur(4px)" }}
        >
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderBottomColor: "rgba(24,24,27,0.93)" }}
          />
          {content}
        </span>
      )}
    </span>
  );
}
