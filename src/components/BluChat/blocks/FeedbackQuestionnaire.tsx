import { useState } from "react";

const QUESTIONS = [
  {
    id: "type",
    question: "What type of feedback is this?",
    type: "radio" as const,
    options: ["Bug report", "Feature request", "Improvement"],
  },
  {
    id: "area",
    question: "Which area does this relate to?",
    type: "radio" as const,
    options: ["Design & UI", "Data & Analytics", "Integrations"],
  },
  {
    id: "urgency",
    question: "How urgent is this for you?",
    type: "radio" as const,
    options: ["Critical", "Nice to have", "Low priority"],
  },
];

export default function FeedbackQuestionnaire({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const question = QUESTIONS[step];
  const selected = answers[question.id];
  const customValue = custom[question.id] ?? "";
  const customSelected = Boolean(selected) && !question.options.includes(selected);
  const hasAnswer = Boolean(selected?.trim());
  const isLast = step === QUESTIONS.length - 1;

  function selectOption(option: string) {
    setAnswers((current) => ({ ...current, [question.id]: option }));
    setCustom((current) => ({ ...current, [question.id]: "" }));
  }

  function updateCustom(value: string) {
    setCustom((current) => ({ ...current, [question.id]: value }));
    setAnswers((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[question.id];
        return next;
      }
      return { ...current, [question.id]: value.trim() };
    });
  }

  function next() {
    if (!hasAnswer) return;

    if (!isLast) {
      setStep((current) => current + 1);
      return;
    }

    const lines = QUESTIONS.map((item) => `• ${item.question.replace("?", "")}: ${answers[item.id]}`);
    setSent(true);
    onSubmit(`Feedback:\n${lines.join("\n")}`);
  }

  if (sent) {
    return (
      <div
        className="mt-2 flex min-h-[132px] w-full max-w-80 flex-col items-center justify-center rounded-xl px-4 py-5"
        style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: "#0080FF" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-100">Feedback sent</p>
      </div>
    );
  }

  return (
    <div
      className="mt-2 w-full max-w-80 overflow-hidden rounded-xl"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
    >
      <div key={question.id} className="px-4 pb-3 pt-4 animate-fade-up">
        <p className="text-sm font-semibold leading-snug text-stone-800 dark:text-stone-100">
          {question.question}
        </p>

        <div className="mt-3 flex flex-col gap-1">
          {question.options.map((option) => {
            const active = selected === option;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => selectOption(option)}
                className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-stone-100 dark:hover:bg-white/6"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active
                      ? "text-white"
                      : "border border-stone-300 text-transparent dark:border-white/18"
                  }`}
                  style={active ? { background: "#0080FF" } : undefined}
                >
                  <span className={`h-1.5 w-1.5 rounded-full bg-current transition-transform ${active ? "scale-100" : "scale-0"}`} />
                </span>
                <span className={`text-sm ${active ? "font-semibold text-blue-600 dark:text-blue-400" : "font-medium text-stone-600 dark:text-stone-400"}`}>
                  {option}
                </span>
              </button>
            );
          })}

          <label className={`flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-stone-100 focus-within:bg-stone-100 dark:hover:bg-white/6 dark:focus-within:bg-white/6 ${customSelected ? "bg-stone-100 dark:bg-white/6" : ""}`}>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                customSelected
                  ? "text-white"
                  : "border border-stone-300 text-transparent dark:border-white/18"
              }`}
              style={customSelected ? { background: "#0080FF" } : undefined}
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-current transition-transform ${customSelected ? "scale-100" : "scale-0"}`} />
            </span>
            <input
              value={customValue}
              onChange={(event) => updateCustom(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  next();
                }
              }}
              placeholder="Type something..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-300 dark:placeholder:text-stone-600"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-1.5">
          {QUESTIONS.map((item, index) => (
            <span
              key={item.id}
              className="rounded-full transition-all"
              style={
                index === step
                  ? { width: 10, height: 10, border: "2px solid #0080FF" }
                  : index < step
                    ? { width: 7, height: 7, background: "#0080FF", opacity: 0.7 }
                    : { width: 7, height: 7, border: "1px solid var(--border)" }
              }
            />
          ))}
        </span>

        <button
          type="button"
          onClick={next}
          disabled={!hasAnswer}
          className={`h-8 rounded-lg px-3.5 text-xs font-semibold transition-all active:scale-[0.98] ${
            hasAnswer
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-stone-100 text-stone-400 dark:bg-white/6 dark:text-stone-600"
          }`}
        >
          {isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
