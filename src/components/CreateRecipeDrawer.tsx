import { useState, useRef } from "react";
import { Wand2, FileUp, ArrowLeft, FileText, Download } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

const CREATE_OPTIONS = [
  { key: "scratch", label: "Start from scratch", icon: Wand2  },
  { key: "upload",  label: "Upload RECIPE.md",   icon: FileUp },
];

// A worked example for anyone who picks "Upload RECIPE.md" but isn't sure
// what one is supposed to look like — downloaded as a real .md file so they
// can open it, see the shape of a well-specified recipe, and adapt it.
const RECIPE_TEMPLATE_MD = `# Cart Win-Back Campaign

## Step 1: Create Cart Value Attribute

Create a numeric attribute called "Cart Value." It is not a research attribute, so no research is needed. It does not depend on a segment, and there are no profile-fit conditions. The event it is based on is "Added to Cart." The activity that counts is every "Added to Cart" event for that user. The product field the filter should use is "price." The event that marks recency is "Added to Cart." The event that marks frequency is also "Added to Cart." The event that carries the amount is "Added to Cart," using its "price" field. The sum attribute it should add up is the running total of the "price" field across every "Added to Cart" event for that user that has not yet been followed by a "Purchase Completed" or "Removed from Cart" event for the same item. The event field used is "price."

## Step 2: Create Cart Abandoned Event

Create an event called "Cart Abandoned." The event it is based on is "Added to Cart." It fires when a user triggers "Added to Cart" and no matching "Purchase Completed" event for the same user follows within the next 24 hours.

## Step 3: Create Cart Abandoners – High Value Segment

Create a segment called "Cart Abandoners – High Value." It is based on the "Cart Abandoned" event created in Step 2 and the "Cart Value" attribute created in Step 1 — not on an existing attribute, existing segment, or consent record. The condition they must match: triggered the "Cart Abandoned" event within the last 7 days, AND their "Cart Value" attribute is greater than $50.

## Step 4: Generate Promotional Banner Image

Generate a promotional banner image for a "Complete Your Purchase" email — clean, modern style, showing a shopping bag with a subtle 10% off badge, in our brand colors (blue and white).

## Step 5: Generate Win-Back Email

Write a short, friendly win-back email for the Cart Abandoners – High Value segment created in Step 3, using the banner image generated in Step 4. Remind them what's waiting in their cart, offer 10% off if they check out in the next 48 hours, and include the banner image. Subject line should create urgency without sounding pushy.
`;

function downloadRecipeTemplate() {
  const blob = new Blob([RECIPE_TEMPLATE_MD], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cart-win-back-recipe.md";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CreateRecipeDrawer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected]                 = useState("scratch");
  const [step, setStep]                         = useState<"choose" | "upload">("choose");
  const [uploadedContent,  setUploadedContent]   = useState("");
  const [uploadedFileName, setUploadedFileName]  = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleContinue(close: () => void) {
    if (step === "choose") {
      if (selected === "upload") { fileRef.current?.click(); return; }
      close();
      window.dispatchEvent(new CustomEvent("open-recipe-canvas"));
    } else {
      close();
      window.dispatchEvent(new CustomEvent("open-recipe-canvas"));
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".md"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploadedFileName(file.name);
          const reader = new FileReader();
          reader.onload = (ev) => {
            setUploadedContent((ev.target?.result as string) ?? "");
            setStep("upload");
          };
          reader.readAsText(file);
          e.target.value = "";
        }}
      />

      <SlidingSidebar
        title={step === "upload" ? "Review RECIPE.md" : "Create recipe"}
        description={
          step === "upload" ? "Edit the imported content below, then continue to the canvas." :
          "Choose how you want to get started."
        }
        onClose={onClose}
        contentClassName={step === "upload" ? "p-0 flex flex-col" : "px-5 pb-5"}
        footer={(close) => (
          <>
            {step === "upload" ? (
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
              className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: "#0080FF" }}
            >
              Continue
            </button>
          </>
        )}
      >
        {step === "upload" ? (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* File name bar */}
            <div
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <FileText size={13} className="text-blue-500 shrink-0" />
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300 truncate">{uploadedFileName}</span>
              <button
                onClick={() => fileRef.current?.click()}
                className="ml-auto text-xs text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors shrink-0"
              >
                Replace file
              </button>
            </div>
            {/* Editable md content */}
            <div className="flex-1 min-h-0 p-4">
              <textarea
                value={uploadedContent}
                onChange={(e) => setUploadedContent(e.target.value)}
                spellCheck={false}
                className="w-full h-full resize-none rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed text-stone-700 dark:text-stone-300 outline-none"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              {CREATE_OPTIONS.map(({ key, label, icon: Icon }) => {
                const isSelected = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelected(key);
                      if (key === "upload") fileRef.current?.click();
                    }}
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

            <div
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5"
              style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Don't know how to create one?</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Use this template to create your own.</p>
              </div>
              <button
                onClick={downloadRecipeTemplate}
                className="shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-(--border) hover:bg-stone-300 dark:hover:bg-white/14 transition-colors"
              >
                <Download size={12} />
                Template
              </button>
            </div>
          </div>
        )}
      </SlidingSidebar>
    </>
  );
}
