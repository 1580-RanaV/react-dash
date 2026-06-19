

import { useRef, useState } from "react";

const QUESTIONS = [
  {
    id: "type",
    question: "What type of feedback is this?",
    options: ["Bug report", "Feature request", "Improvement"],
  },
  {
    id: "area",
    question: "Which area does this relate to?",
    options: ["Design & UI", "Data & Analytics", "Integrations"],
  },
  {
    id: "urgency",
    question: "How urgent is this for you?",
    options: ["Critical", "Nice to have", "Low priority"],
  },
];

type Phase = "idle" | "exit" | "enter";

export default function FeedbackQuestionnaire({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customText, setCustomText] = useState("");
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const q = QUESTIONS[step];
  const selectedOption = answers[q.id];
  const isCustomActive = selectedOption !== undefined && !q.options.includes(selectedOption);
  const hasAnswer = !!selectedOption && selectedOption.trim().length > 0;
  const isLast = step === QUESTIONS.length - 1;

  function selectOption(opt: string) {
    setAnswers((a) => ({ ...a, [q.id]: opt }));
    setCustomText("");
  }

  function handleCustomChange(val: string) {
    setCustomText(val);
    if (val.trim()) {
      setAnswers((a) => ({ ...a, [q.id]: val.trim() }));
    } else {
      setAnswers((a) => {
        const n = { ...a };
        delete n[q.id];
        return n;
      });
    }
  }

  function advance() {
    if (!hasAnswer || phase !== "idle") return;

    setPhase("exit");
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (isLast) {
        setDone(true);
        const lines = QUESTIONS.map(
          (qs) => `• ${qs.question.replace("?", "")}: ${answersRef.current[qs.id]}`
        );
        onSubmit(`Feedback:\n${lines.join("\n")}`);
      } else {
        setStep((s) => s + 1);
        setCustomText("");
        setPhase("enter");
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setPhase("idle"))
        );
      }
    }, 160);
  }

  if (done) return null;

  const slideStyle: React.CSSProperties =
    phase === "idle"
      ? { transform: "translateX(0)", opacity: 1, transition: "transform 180ms ease, opacity 180ms ease" }
      : phase === "exit"
      ? { transform: "translateX(-18px)", opacity: 0, transition: "transform 160ms ease, opacity 160ms ease" }
      : { transform: "translateX(18px)", opacity: 0, transition: "none" };

  return (
    <div
      className="mt-2 overflow-hidden rounded-xl border border-stone-200 dark:border-(--border)"
      style={{ background: "var(--content-bg)" }}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 dark:border-(--border)">
        <span className="shrink-0 text-xs font-semibold tabular-nums text-stone-400 dark:text-stone-500">
          {step + 1} / {QUESTIONS.length}
        </span>
        <div className="flex flex-1 gap-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-blue-500" : "bg-stone-200 dark:bg-white/12"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated question body */}
      <div className="px-4 pt-4 pb-3" style={slideStyle}>
        <p className="mb-3.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
          {q.question}
        </p>

        {/* Options list */}
        <div className="flex flex-col gap-0.5">
          {q.options.map((opt) => {
            const selected = selectedOption === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => selectOption(opt)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors duration-100 ${
                  selected
                    ? "bg-blue-50 dark:bg-blue-500/10"
                    : "hover:bg-stone-100/70 dark:hover:bg-white/4"
                }`}
              >
                {/* Radio circle */}
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                    selected
                      ? "border-blue-500 bg-blue-500"
                      : "border-stone-300 dark:border-(--border)"
                  }`}
                >
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span
                  className={`text-sm font-medium ${
                    selected
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {opt}
                </span>
              </button>
            );
          })}

          {/* 4th: text input option */}
          <div
            className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-100 ${
              isCustomActive ? "bg-blue-50 dark:bg-blue-500/10" : ""
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                isCustomActive ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-(--border)"
              }`}
            >
              {isCustomActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <input
              type="text"
              value={customText}
              onChange={(e) => handleCustomChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") advance(); }}
              placeholder="Something else..."
              className={`flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400 dark:placeholder:text-stone-600 ${
                isCustomActive
                  ? "font-medium text-blue-700 dark:text-blue-300"
                  : "text-stone-700 dark:text-stone-300"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Footer / action */}
      <div className="border-t border-stone-100 px-4 py-3 dark:border-(--border)">
        <button
          type="button"
          onClick={advance}
          disabled={!hasAnswer || phase !== "idle"}
          className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            hasAnswer && phase === "idle"
              ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
              : "cursor-not-allowed bg-stone-100 text-stone-400 dark:bg-white/6 dark:text-stone-600"
          }`}
        >
          {isLast ? "Submit feedback" : "Next"}
        </button>
      </div>
    </div>
  );
}
