import { useEffect } from "react";
import { X } from "lucide-react";

// Shared shell for standalone, unauthenticated "public preview" pages
// (public-recipe, public-workflow): a blurred fake marketing backdrop with a
// near-fullscreen modal card on top, plus the sign-up prompt shown on Clone.

export const LIGHT = {
  page: "#f7f8f8",
  card: "#ffffff",
  border: "#e5e5e6",
  borderSubtle: "#edeef3",
  muted: "#f4f5f8",
  text: "#222326",
  textMuted: "#62666d",
  textFaint: "#9a9ea6",
};

// These pages render in a separate tab/document from the console, but the
// console's theme preference is read from localStorage on every page load —
// force light mode here regardless of what's saved.
export function useForceLightMode() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
}

export function BackdropHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="h-full w-full" style={{ background: LIGHT.card }}>
      <div className="flex items-center gap-8 px-12 py-6" style={{ borderBottom: `1px solid ${LIGHT.borderSubtle}` }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="h-7 w-7" />
          <span className="text-lg font-bold" style={{ color: LIGHT.text }}>Intempt</span>
        </div>
        <div className="flex gap-7 text-sm font-medium" style={{ color: LIGHT.textMuted }}>
          <span>Product</span>
          <span>Recipes</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-10 py-28 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold" style={{ color: LIGHT.text }}>{title}</h1>
        <p className="mt-4 text-lg" style={{ color: LIGHT.textMuted }}>{subtitle}</p>
      </div>
    </div>
  );
}

export function PublicViewFrame({
  backdropEyebrow,
  backdropTitle,
  backdropSubtitle,
  children,
}: {
  backdropEyebrow: string;
  backdropTitle: string;
  backdropSubtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen overflow-hidden" style={{ background: LIGHT.page }}>
      <div className="pointer-events-none absolute inset-0 select-none" style={{ filter: "blur(16px)" }}>
        <BackdropHero eyebrow={backdropEyebrow} title={backdropTitle} subtitle={backdropSubtitle} />
      </div>
      <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(255,255,255,0.35)" }} />

      <div className="relative h-full w-full p-3">
        <div
          className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
          style={{ background: LIGHT.card, boxShadow: "0 24px 64px rgba(20,20,25,0.22), 0 4px 16px rgba(20,20,25,0.1)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SignInPrompt({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(15,15,17,0.76)" }}>
      <div
        className="relative w-full max-w-100 rounded-2xl px-8 py-8 shadow-2xl"
        style={{ background: LIGHT.card, border: `1px solid ${LIGHT.border}` }}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
          style={{ color: "#8b8f98" }}
        >
          <X size={16} strokeWidth={2} />
        </button>

        <h3 className="text-lg font-semibold tracking-tight" style={{ color: "#252525" }}>Create an account</h3>

        <div className="mt-5 space-y-2.5">
          <button
            className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-stone-50"
            style={{ border: "1px solid #d7d8df", color: "#5f636d" }}
          >
            <span className="text-base font-bold" style={{ color: "#4285F4" }}>G</span>
            Continue with Google
          </button>

          <button
            className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-stone-50"
            style={{ border: "1px solid #d7d8df", color: "#5f636d" }}
          >
            <span className="grid h-3.5 w-3.5 grid-cols-2 gap-0.5">
              <span style={{ background: "#f25022" }} />
              <span style={{ background: "#7fba00" }} />
              <span style={{ background: "#00a4ef" }} />
              <span style={{ background: "#ffb900" }} />
            </span>
            Continue with Microsoft
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1" style={{ background: LIGHT.border }} />
            <span className="text-[11px] font-medium uppercase" style={{ color: "#a0a3ad" }}>OR</span>
            <span className="h-px flex-1" style={{ background: LIGHT.border }} />
          </div>

          <input
            type="email"
            placeholder="Type your email here"
            className="h-10 w-full rounded-lg px-3.5 text-sm outline-none"
            style={{ border: "1px solid #d7d8df", color: LIGHT.text }}
          />
          <button
            className="h-10 w-full rounded-lg text-sm font-medium text-white transition-colors hover:bg-black/90"
            style={{ background: "#1c1c1d" }}
          >
            Continue with email
          </button>
        </div>

        <p className="mt-5 text-center text-xs leading-5" style={{ color: "#666b75" }}>
          By signing up, you agree to Intempt's{" "}
          <a href="https://intempt.com/terms" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            terms of use
          </a>{" "}
          and{" "}
          <a href="https://intempt.com/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            privacy policy
          </a>.
        </p>

        <p className="mt-4 text-center text-sm" style={{ color: "#252525" }}>
          Have an account already?{" "}
          <a href="https://app.intempt.com/login" target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
