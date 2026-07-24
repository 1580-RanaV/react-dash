import { useState, useRef } from "react";
import { Wand2, Copy, FileUp, Search, ArrowLeft } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

const CREATE_OPTIONS = [
  { key: "scratch", label: "Start from scratch",    icon: Wand2  },
  { key: "remix",   label: "Remix existing recipe", icon: Copy   },
  { key: "upload",  label: "Upload RECIPE.md",      icon: FileUp },
];

type RemixRecipe = { id: string; title: string; description: string; tags: string[] };

const REMIX_RECIPES: RemixRecipe[] = [
  { id: "1",  title: "Active Research Surge Accounts",   description: "Accounts with 3+ pricing-page visits in last 7 days — active buying-cycle signal.",       tags: [] },
  { id: "2",  title: "Feature Paywall Conversion",       description: "Per-feature % of free users who view pricing and subsequently subscribe.",                  tags: ["data-analyst"] },
  { id: "3",  title: "Hero Static vs Screenshot Test",   description: "Test landing page hero: illustration vs. product screenshot vs. customer photo.",           tags: ["experiments"] },
  { id: "4",  title: "First Session Paths After Signup", description: "Forward path from user_created showing what new users do in their first session.",          tags: ["data-analyst"] },
  { id: "5",  title: "Weekly Forecast Rollup",           description: "Every Monday, snapshot pipeline by stage, weighted forecast, and forecast vs. actual.",     tags: ["revops-automator"] },
  { id: "6",  title: "B2B Nurture",                      description: "Score leads, segment by readiness, route hot leads to sales, nurture the rest.",            tags: ["journey-builder"] },
  { id: "7",  title: "Churn Risk Early Warning",         description: "Flag accounts with 40%+ login drop over 14 days. Fire Slack alert to CSM.",                tags: ["revops-automator"] },
  { id: "8",  title: "Trial-to-Paid Conversion Flow",    description: "Day 1 welcome → Day 3 feature nudge → Day 10 value recap → Day 13 urgency push.",          tags: ["journey-builder"] },
  { id: "9",  title: "Re-engagement Campaign",           description: "Target users inactive 30+ days. Win-back sequence referencing last active feature.",         tags: ["email"] },
  { id: "10", title: "Product Launch Creative Bundle",   description: "Generate hero banners, social square, and email header for a product launch.",              tags: ["content"] },
  { id: "11", title: "Event-Triggered Upsell",           description: "When a user hits plan limits, trigger in-app nudge and email sequence for the next tier.", tags: ["journey-builder"] },
  { id: "12", title: "Subject Line Optimiser",           description: "Generate 10 subject line variants scored by predicted open rate.",                           tags: ["email", "content"] },
  { id: "13", title: "ICP Fit Scoring",                  description: "Score every account against your ICP and auto-route high-fit accounts to AEs.",             tags: ["revops-automator"] },
  { id: "14", title: "Product-Led Growth Funnel",        description: "Track free → activated → engaged → expansion across your user base.",                       tags: ["data-analyst"] },
  { id: "15", title: "SMS Winback",                      description: "Three-touch SMS sequence for lapsed subscribers with personalised offers.",                  tags: ["email"] },
];

export default function CreateRecipeDrawer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected]         = useState("scratch");
  const [step, setStep]                 = useState<"choose" | "remix">("choose");
  const [remixSearch, setRemixSearch]   = useState("");
  const [remixSelected, setRemixSelected] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredRemix = REMIX_RECIPES.filter(r => {
    const q = remixSearch.toLowerCase();
    return !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.includes(q));
  });

  function handleContinue(close: () => void) {
    if (step === "choose") {
      if (selected === "remix")  { setStep("remix"); return; }
      if (selected === "upload") { fileRef.current?.click(); return; }
      close();
    } else {
      close();
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".md"
        className="hidden"
        onChange={() => onClose()}
      />

      <SlidingSidebar
        title={step === "remix" ? "Remix existing recipe" : "Create recipe"}
        description={step === "remix"
          ? "Pick a recipe to clone. The copy lands in My recipes as a draft you can edit."
          : "Choose how you want to get started."}
        onClose={onClose}
        contentClassName={step === "remix" ? "pb-5" : "px-5 pb-5"}
        footer={(close) => (
          <>
            {step === "remix" ? (
              <button
                onClick={() => setStep("choose")}
                className="mr-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
            )}
            <button
              onClick={() => handleContinue(close)}
              disabled={step === "remix" && !remixSelected}
              className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#0080FF" }}
            >
              {step === "remix" ? "Clone" : selected === "remix" ? "Next" : "Continue"}
            </button>
          </>
        )}
      >
        {step === "choose" ? (
          <div className="flex flex-col gap-0.5">
            {CREATE_OPTIONS.map(({ key, label, icon: Icon }) => {
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
                  }`}
                >
                  <Icon size={17} className={isSelected ? "text-blue-500 shrink-0" : "shrink-0 text-stone-400 dark:text-stone-500"} />
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Sticky search bar */}
            <div
              className="sticky top-0 z-10 px-5 pb-0"
              style={{ background: "var(--content-bg)" }}
            >
              <div className="relative pb-3">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  autoFocus
                  value={remixSearch}
                  onChange={e => setRemixSearch(e.target.value)}
                  placeholder="Search recipes by name, agent, or description…"
                  className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input) dark:text-stone-100 dark:placeholder:text-stone-500"
                />
              </div>
              <div className="h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Recipe list */}
            <div className="px-5 flex flex-col">
              {filteredRemix.length === 0 ? (
                <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">No recipes match your search</p>
              ) : filteredRemix.map(r => {
                const isSelected = remixSelected === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRemixSelected(r.id)}
                    className={`flex w-full flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-colors duration-100 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-stone-50 dark:hover:bg-white/4"
                    }`}
                  >
                    <span className={`text-sm font-medium leading-snug ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-stone-800 dark:text-stone-200"}`}>
                      {r.title}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 leading-snug line-clamp-2">
                      {r.description}
                    </span>
                    {r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {r.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </SlidingSidebar>
    </>
  );
}
