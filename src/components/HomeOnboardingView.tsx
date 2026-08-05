import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

type HomeDomain = "analytics" | "marketing" | "sales" | "design";

type Question = {
  id: "domains" | "sources" | "outcome";
  title: string;
  subtitle: string;
  multiple?: boolean;
  options: { label: string; value: string }[];
};

const HOME_TAB_VISIBILITY_KEY = "intempt:home-visible-tabs";
const ONBOARDING_KEY = "intempt:home-onboarding";

const QUESTIONS: Question[] = [
  {
    id: "domains",
    title: "Which areas are you working on?",
    subtitle: "Choose the home tabs you want to see first. You can change this later from the gear icon.",
    multiple: true,
    options: [
      { label: "Analytics", value: "analytics" },
      { label: "Marketing", value: "marketing" },
      { label: "Sales", value: "sales" },
      { label: "Design", value: "design" },
    ],
  },
  {
    id: "sources",
    title: "Which sources will you connect first?",
    subtitle: "We will use this to prioritize setup prompts and empty states.",
    multiple: true,
    options: [
      { label: "JavaScript SDK", value: "js-sdk" },
      { label: "Stripe", value: "stripe" },
      { label: "Google Calendar", value: "google-calendar" },
      { label: "Gmail", value: "gmail" },
      { label: "HubSpot", value: "hubspot" },
      { label: "Shopify", value: "shopify" },
      { label: "SendGrid", value: "sendgrid" },
      { label: "Brand assets", value: "brand-assets" },
      { label: "I will connect later", value: "later" },
    ],
  },
  {
    id: "outcome",
    title: "What should home help you do first?",
    subtitle: "Pick the main job this screen should solve when you open Intempt.",
    options: [
      { label: "See what changed", value: "changes" },
      { label: "Know what needs action", value: "actions" },
      { label: "Track growth and revenue", value: "growth" },
      { label: "Finish setup quickly", value: "setup" },
      { label: "Review daily work", value: "daily-work" },
    ],
  },
];

const DOMAIN_ORDER: HomeDomain[] = ["analytics", "marketing", "sales", "design"];

function isHomeDomain(value: string): value is HomeDomain {
  return DOMAIN_ORDER.includes(value as HomeDomain);
}

export default function HomeOnboardingView() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Question["id"], string[] | string>>({
    domains: [],
    sources: [],
    outcome: "",
  });
  const question = QUESTIONS[step];
  const selected = answers[question.id];
  const hasAnswer = Array.isArray(selected) ? selected.length > 0 : Boolean(selected);
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  function select(value: string) {
    if (!question.multiple) {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
      return;
    }

    setAnswers((prev) => {
      const current = Array.isArray(prev[question.id]) ? prev[question.id] as string[] : [];
      if (question.id === "sources" && value === "later") {
        return { ...prev, [question.id]: current.includes("later") ? [] : ["later"] };
      }
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current.filter((item) => item !== "later"), value];
      return { ...prev, [question.id]: next };
    });
  }

  function finish() {
    const selectedDomains = Array.isArray(answers.domains)
      ? answers.domains.filter(isHomeDomain)
      : [];
    const visibleTabs = selectedDomains.length
      ? DOMAIN_ORDER.filter((domain) => selectedDomains.includes(domain))
      : DOMAIN_ORDER;
    const firstTab = visibleTabs[0] ?? "analytics";

    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(answers));
    localStorage.setItem(HOME_TAB_VISIBILITY_KEY, JSON.stringify(visibleTabs));
    navigate(`/home?tab=${firstTab}/empty`, { replace: true });
  }

  function goNext() {
    if (!hasAnswer) return;
    if (isLast) {
      finish();
      return;
    }
    setStep((value) => value + 1);
  }

  function goBack() {
    if (step === 0) {
      navigate("/home");
      return;
    }
    setStep((value) => value - 1);
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: "var(--main-bg)" }}>
      <div className="absolute left-0 right-0 top-0 h-1 bg-stone-100 dark:bg-white/8">
        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <section className="w-full max-w-[520px]">
          <div className="mb-7 h-9">
            {step > 0 && (
              <button
                onClick={goBack}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-stone-500 shadow-sm transition-colors hover:text-stone-900 dark:bg-white/8 dark:text-stone-300 dark:hover:text-stone-100"
                style={{ border: "1px solid var(--border)" }}
              >
                <ChevronLeft size={15} />
                Back
              </button>
            )}
          </div>

          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-stone-950 dark:text-stone-50">
              {question.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              {question.subtitle}
            </p>
          </div>

          <div className="space-y-2">
            {question.options.map((option) => {
              const active = Array.isArray(selected)
                ? selected.includes(option.value)
                : selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => select(option.value)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/4"
                  style={{ background: active ? "rgba(0,128,255,0.06)" : "transparent" }}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 transition-colors ${
                      question.multiple ? "rounded" : "rounded-full"
                    }`}
                    style={{
                      borderColor: active ? "#0080FF" : "var(--border)",
                      background: active ? "#0080FF" : "transparent",
                    }}
                  >
                    {active && (
                      question.multiple
                        ? <span className="h-2 w-1.5 rotate-45 border-b-2 border-r-2 border-white" />
                        : <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span className={`text-sm font-semibold ${active ? "text-blue-600 dark:text-blue-400" : "text-stone-700 dark:text-stone-200"}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
              {step + 1} of {QUESTIONS.length}
            </span>
            <button
              onClick={goNext}
              disabled={!hasAnswer}
              className="inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "#0080FF" }}
            >
              {isLast ? "Finish setup" : "Continue"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
