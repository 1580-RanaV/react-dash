export default function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500"
          style={{
            animation: "dot-pulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.22}s`,
          }}
        />
      ))}
    </div>
  );
}
