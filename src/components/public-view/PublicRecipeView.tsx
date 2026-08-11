import { useState } from "react";
import { ChefHat, LayoutGrid, ListChecks, Terminal } from "lucide-react";
import RecipeCanvasView from "../RecipeCanvasView";
import SubTabCorner from "../SubTabCorner";
import { LIGHT, PublicViewFrame, SignInPrompt, useForceLightMode } from "./PublicViewShell";

const RECIPE = {
  name: "ABM Account Personalization",
  slashCommand: "/abm-account-personalization",
  description:
    "Scores target accounts by fit and intent, personalizes outreach content for each one with Blu, then launches a tailored multi-channel journey — no manual segmentation or copywriting required.",
  createdBy: "Intempt",
  works:
    "This recipe turns ABM setup into a guided workflow: it scores account fit, uses Blu to create tailored messaging, and prepares the outreach journey so teams can move from target list to launch faster.",
  specs: [
    ["Steps", "4 steps"],
    ["Complexity", "Advanced"],
    ["Execution", "Live"],
    ["Agent", "journey builder"],
    ["Products", "Accounts, Journeys, Email"],
    ["Mode", "saas, b2b"],
    ["Areas", "RevOps, Journey Builder"],
  ] as const,
  steps: [
    { title: "Inputs", body: "Bring in your target account list, ICP criteria, and product positioning so the recipe knows who to score and what to say." },
    { title: "Score Accounts", body: "Rank every account by firmographic fit and buying-intent signals, so effort goes to the accounts most likely to convert." },
    { title: "Personalize Content", body: "Generate tailored messaging per account with Blu — headline, body, and CTA adapted to that account's context." },
    { title: "Launch Journey", body: "Send the personalized sequence across email and ads, and monitor engagement from the recipe's analytics panel." },
  ],
};

// Same numbered-circle + connector-line format as the recipe detail page's "Steps" section.
function StepsList() {
  return (
    <div className="mx-auto max-w-xl flex flex-col">
      {RECIPE.steps.map((step, i) => (
        <div key={step.title} className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: LIGHT.muted, border: `1px solid ${LIGHT.border}`, color: LIGHT.textMuted }}
            >
              {i + 1}
            </div>
            {i < RECIPE.steps.length - 1 && (
              <div className="my-1.5 w-px flex-1" style={{ background: LIGHT.border }} />
            )}
          </div>
          <div className={i < RECIPE.steps.length - 1 ? "pb-6" : "pb-0"}>
            <p className="mb-1 text-sm font-semibold leading-snug" style={{ color: LIGHT.text }}>{step.title}</p>
            <p className="text-sm leading-relaxed" style={{ color: LIGHT.textMuted }}>{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PublicRecipeView() {
  const [view, setView] = useState<"steps" | "canvas">("canvas");
  const [showSignIn, setShowSignIn] = useState(false);
  useForceLightMode();

  return (
    <PublicViewFrame
      backdropEyebrow="Recipe"
      backdropTitle={RECIPE.name}
      backdropSubtitle="Score, personalize, and launch tailored journeys for your target accounts, automatically."
    >
      <div className="flex min-h-0 flex-1 gap-5 p-5">
        {/* Left 30% — details */}
        <div
          className="flex min-h-0 w-[30%] shrink-0 flex-col justify-center overflow-y-auto rounded-xl p-7"
          style={{ background: LIGHT.card, border: `1px solid ${LIGHT.borderSubtle}` }}
        >
          <div className="mx-auto w-full max-w-sm">
            <img src="/hq.png" alt="" className="h-10 w-10 rounded-xl object-cover" />

            <span
              className="mt-4 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: LIGHT.muted, color: LIGHT.text }}
            >
              <ChefHat size={13} className="text-blue-500" />
              Recipe
            </span>

            <h2 className="mt-4 text-[28px] font-bold leading-[1.08] tracking-tight" style={{ color: "#15161a" }}>
              {RECIPE.name}
            </h2>

            <section className="mt-8">
              <p className="text-[15px] font-bold" style={{ color: LIGHT.text }}>Why this recipe works</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "#5f636b" }}>
                {RECIPE.works}
              </p>
            </section>

            <section className="mt-7">
              <p className="text-[15px] font-bold" style={{ color: LIGHT.text }}>Specs</p>
              <div className="mt-3 space-y-2.5">
                {RECIPE.specs.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <p className="w-24 shrink-0 text-xs font-medium" style={{ color: LIGHT.textFaint }}>{label}</p>
                    <p className="text-right text-sm font-semibold leading-5" style={{ color: LIGHT.text }}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <div className="flex items-center gap-2">
                <Terminal size={14} style={{ color: LIGHT.text }} />
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: LIGHT.textMuted }}>Slash command</p>
              </div>
              <code className="mt-2 block truncate font-mono text-sm font-semibold text-blue-500">
                {RECIPE.slashCommand}
              </code>
            </section>

            <section className="mt-7 flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 rounded-full" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: LIGHT.textFaint }}>Created by</p>
                <p className="text-sm font-semibold" style={{ color: "#15161a" }}>{RECIPE.createdBy}</p>
              </div>
            </section>

            <button
              onClick={() => setShowSignIn(true)}
              className="mt-7 flex w-full items-center justify-center rounded-lg py-3 text-sm font-bold text-white transition-colors hover:bg-blue-600"
              style={{ background: "#0080FF" }}
            >
              Clone & customize
            </button>
          </div>
        </div>

        {/* Right 70% — canvas fills the full area; switcher floats on top */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl" style={{ background: LIGHT.card, border: `1px solid ${LIGHT.borderSubtle}` }}>
          <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-xl shadow-md">
            <SubTabCorner
              tabs={[
                { key: "canvas", label: "Canvas", icon: <LayoutGrid size={14} /> },
                { key: "steps", label: "Steps", icon: <ListChecks size={14} /> },
              ]}
              active={view}
              onChange={(key) => setView(key as "steps" | "canvas")}
              size="md"
            />
          </div>

          <div className="h-full">
            {view === "steps" ? (
              <div className="h-full overflow-auto px-8 pb-8 pt-16">
                <StepsList />
              </div>
            ) : (
              <RecipeCanvasView onBack={() => {}} readOnly />
            )}
          </div>
        </div>
      </div>

      {showSignIn && <SignInPrompt onClose={() => setShowSignIn(false)} />}
    </PublicViewFrame>
  );
}
