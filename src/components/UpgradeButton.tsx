

import { useState } from "react";
import { Gem } from "lucide-react";

const STARS = [
  { left: "10%", color: "#3b82f6", variant: "a", delay: "0ms",  size: 4 },
  { left: "26%", color: "#0080ff", variant: "b", delay: "50ms", size: 5 },
  { left: "43%", color: "#60a5fa", variant: "c", delay: "20ms", size: 4 },
  { left: "58%", color: "#0080ff", variant: "a", delay: "75ms", size: 5 },
  { left: "73%", color: "#3b82f6", variant: "b", delay: "35ms", size: 4 },
  { left: "88%", color: "#93c5fd", variant: "c", delay: "10ms", size: 5 },
] as const;

export default function UpgradeButton() {
  const [burstKey, setBurstKey] = useState(0);

  function burst() {
    setBurstKey((k) => k + 1);
  }

  return (
    <div className="relative" onMouseEnter={burst}>
      {burstKey > 0 && STARS.map((s, i) => (
        <span
          key={`${burstKey}-${i}`}
          className={`upgrade-star upgrade-star-${s.variant}`}
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            background: s.color,
            animationDuration: "0.5s",
            animationDelay: s.delay,
          }}
        />
      ))}

      <button
        onClick={burst}
        className="relative flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 select-none active:scale-95 transition-all duration-100 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-blue-300 dark:border-blue-500/40"
      >
        <Gem size={12} className="shrink-0" />
        Upgrade
      </button>
    </div>
  );
}
