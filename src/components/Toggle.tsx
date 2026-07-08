import { useState } from "react";

interface ToggleProps {
  on?: boolean;
  onClick?: () => void;
  fake?: boolean;
  size?: "sm" | "md";
}

export default function Toggle({ on = false, onClick, fake = false, size = "sm" }: ToggleProps) {
  const [internal, setInternal] = useState(on);
  const active = fake ? internal : on;
  const handleClick = fake ? () => setInternal(v => !v) : onClick!;

  if (size === "md") {
    return (
      <button
        onClick={handleClick}
        role="switch"
        aria-checked={active}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${active ? "bg-blue-500" : "bg-stone-200 dark:bg-white/12"}`}
      >
        <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${active ? "translate-x-5.5" : "translate-x-0.5"}`} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      role="switch"
      aria-checked={active}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 focus:outline-none ${active ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${active ? "translate-x-4.5" : "translate-x-0.5"}`} />
    </button>
  );
}
