

import { useState } from "react";
import { X } from "lucide-react";

const VIDEO_URL = "https://cdn.intempt.com/brand-kit/creative-studio-hero-user.mp4";

export default function HeroVideo() {
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

  if (!VIDEO_URL || closed) return null;

  return (
    <div
      style={{
        marginTop: closing ? 0 : "1.25rem",
        maxHeight: closing ? 0 : 800,
        opacity: closing ? 0 : 1,
        transform: closing ? "scaleY(0.92)" : "scaleY(1)",
        transformOrigin: "top center",
        overflow: "hidden",
        borderRadius: "1rem",
        border: closing ? "none" : "1px solid var(--border)",
        boxShadow: closing ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "max-height 0.38s cubic-bezier(0.4,0,0.8,0.6), opacity 0.28s ease, transform 0.32s ease, margin-top 0.38s ease",
      }}
      onTransitionEnd={() => { if (closing) setClosed(true); }}
    >
      <div className="relative">
        <video
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full block"
          style={{ display: "block" }}
        />
        <button
          onClick={() => setClosing(true)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: "rgba(0,0,0,0.38)", backdropFilter: "blur(6px)" }}
        >
          <X size={13} className="text-white" />
        </button>
      </div>
    </div>
  );
}
