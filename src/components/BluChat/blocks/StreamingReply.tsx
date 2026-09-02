import { useEffect, useState } from "react";

/* General streamed Blu replies (default reply + create-journey reply) */

export function StreamingReply({ text, onDone }: { text: string; onDone: () => void }) {
  const tokens = text.split(/(\s+)/).filter(Boolean);
  const [count, setCount] = useState(0);
  const done = count >= tokens.length;

  useEffect(() => {
    if (done) {
      const doneTimer = setTimeout(onDone, 180);
      return () => clearTimeout(doneTimer);
    }

    const current = tokens[count] ?? "";
    const delay = current.trim() ? 42 + Math.min(current.length * 3, 38) : 12;
    const timer = setTimeout(() => setCount((value) => value + 1), delay);
    return () => clearTimeout(timer);
  }, [count, done, onDone, tokens]);

  return (
    <p className="text-sm text-stone-600 dark:text-stone-300 leading-[1.55] whitespace-pre-wrap">
      {tokens.slice(0, count).map((token, index) => (
        token.trim() ? (
          <span
            key={`${token}-${index}`}
            className="inline-block"
            style={{ animation: "blu-stream-in 360ms cubic-bezier(0.22,0.61,0.25,1) both" }}
          >
            {token}
          </span>
        ) : token
      ))}
      {!done && (
        <span
          className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full"
          style={{ background: "#0080FF", animation: "fade-up 150ms ease-out both" }}
        />
      )}
    </p>
  );
}
