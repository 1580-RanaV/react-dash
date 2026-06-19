

import { useRef } from "react";


export default function AskBluButton({ isOpen }: { isOpen: boolean }) {
  const shineRef = useRef<HTMLSpanElement>(null);

  function handleClick() {
    window.dispatchEvent(new Event("toggle-blu-chat"));
  }

  function handleMouseEnter() {
    const el = shineRef.current;
    if (!el) return;
    el.style.animation = "none";
    el.getBoundingClientRect();
    el.style.animation = "blu-shimmer 0.5s cubic-bezier(0.4,0,0.2,1) forwards";
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="relative w-full flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium active:scale-95 transition-all duration-200 ease-out overflow-hidden"
      style={isOpen ? {
        background: "rgba(0,128,255,0.08)",
        border: "1px solid rgba(0,128,255,0.22)",
        color: "#0080FF",
      } : {
        background: "transparent",
        border: "1px solid rgba(0,0,0,0.1)",
        color: "#57534e",
      }}
    >
      {/* Shimmer streak — on hover */}
      <span
        ref={shineRef}
        aria-hidden
        className="pointer-events-none absolute top-0 h-full w-[50%] -skew-x-12"
        style={{
          left: "-70%",
          background: "linear-gradient(to right, transparent, rgba(0,128,255,0.14), transparent)",
        }}
      />


      {/* Mascot — bottom half clipped by overflow:hidden, top half peeks up */}
      <span
        aria-hidden
        className="absolute pointer-events-none"
        style={{ left: 10, bottom: -15, rotate: "-8deg" }}
      >
        <img
          src="/mascot.png"
          alt=""
          width={55}
          height={55}
          style={{ width: 55, height: "auto" }}
          className="object-contain"
        />
      </span>

      {/* Label */}
      <span className="relative z-10 pl-4">Ask Blu</span>
    </button>
  );
}
