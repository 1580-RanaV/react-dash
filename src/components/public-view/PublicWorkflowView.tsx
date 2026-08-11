import { useState } from "react";
import { Workflow as WorkflowIcon } from "lucide-react";
import { LIGHT, PublicViewFrame, SignInPrompt, useForceLightMode } from "./PublicViewShell";
import WorkflowCanvasView from "./WorkflowCanvasView";

const WORKFLOW = {
  name: "Product Photoshoot Generator",
  createdBy: "Intempt",
  works:
    "This workflow regenerates a product photo in a brand-new scene and pose with Blu — no reshoot required. It drafts a restyling prompt from the product photo plus a visual, scene, and pose reference, then renders the final shot.",
  specs: [
    ["Nodes", "8"],
    ["Complexity", "Intermediate"],
    ["Execution", "On demand"],
    ["Models", "Gemini 3 Flash, Nano Banana"],
    ["Inputs", "Product photo, references"],
    ["Mode", "image, creative"],
    ["Areas", "Brand, Creative"],
  ] as const,
};

export default function PublicWorkflowView() {
  const [showSignIn, setShowSignIn] = useState(false);
  useForceLightMode();

  return (
    <PublicViewFrame
      backdropEyebrow="Workflow"
      backdropTitle={WORKFLOW.name}
      backdropSubtitle="Generate on-brand character renders from a product photo and a few references, automatically."
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
              <WorkflowIcon size={13} className="text-blue-500" />
              Workflow
            </span>

            <h2 className="mt-4 text-[28px] font-bold leading-[1.08] tracking-tight" style={{ color: "#15161a" }}>
              {WORKFLOW.name}
            </h2>

            <section className="mt-8">
              <p className="text-[15px] font-bold" style={{ color: LIGHT.text }}>Why this workflow works</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "#5f636b" }}>
                {WORKFLOW.works}
              </p>
            </section>

            <section className="mt-7">
              <p className="text-[15px] font-bold" style={{ color: LIGHT.text }}>Specs</p>
              <div className="mt-3 space-y-2.5">
                {WORKFLOW.specs.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <p className="w-24 shrink-0 text-xs font-medium" style={{ color: LIGHT.textFaint }}>{label}</p>
                    <p className="text-right text-sm font-semibold leading-5" style={{ color: LIGHT.text }}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7 flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-8 w-8 shrink-0 rounded-full" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: LIGHT.textFaint }}>Created by</p>
                <p className="text-sm font-semibold" style={{ color: "#15161a" }}>{WORKFLOW.createdBy}</p>
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

        {/* Right 70% — canvas fills the full area, always on */}
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl" style={{ background: LIGHT.card, border: `1px solid ${LIGHT.borderSubtle}` }}>
          <WorkflowCanvasView />
        </div>
      </div>

      {showSignIn && <SignInPrompt onClose={() => setShowSignIn(false)} />}
    </PublicViewFrame>
  );
}
