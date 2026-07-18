
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X } from "lucide-react";

const CLIENT_ID =
  "1015199761534-v9k7sdlndn0lteoakplpifbc7vica7fv.apps.googleusercontent.com";

const BF_GMAIL = "https://cdn.brandfetch.io/gmail.com/icon?c=1idhE0Bg4BXpFRYkYnt";

function ConnectedScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 px-8 pb-8 pt-8 text-center animate-fade-up">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full" style={{ background: "rgba(34,197,94,0.08)", border: "2px solid rgba(34,197,94,0.18)" }} />
        <div className="absolute flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(34,197,94,0.12)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
            <Check size={20} strokeWidth={2.5} className="text-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-lg font-bold text-stone-900 dark:text-stone-100">Gmail Connected</p>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Your Google Workspace account is now linked to{" "}
          <span className="font-semibold text-stone-700 dark:text-stone-300">Intempt Technologies-project</span>.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">Active</span>
        <span className="mx-1 text-stone-300 dark:text-stone-600">·</span>
        <span className="text-sm text-stone-500 dark:text-stone-400">Gmail Workspace</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl h-11 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: "#0080FF" }}
      >
        Done
      </button>
    </div>
  );
}

export default function GmailConnectModal({
  onClose,
  onConnected,
}: {
  onClose: () => void;
  onConnected?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function copyClientId() {
    navigator.clipboard.writeText(CLIENT_ID);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  function handleSignIn() {
    setSigningIn(true);
    setTimeout(() => {
      setSigningIn(false);
      setConnected(true);
      onConnected?.();
    }, 1400);
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl rounded-2xl animate-card-in overflow-hidden"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-700 dark:border-white/10 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10 dark:hover:text-stone-200"
        >
          <X size={14} />
        </button>

        {connected ? <ConnectedScreen onClose={onClose} /> : (
          <div className="flex flex-col">

            {/* Header */}
            <div className="flex items-center gap-3.5 px-6 pt-6 pb-7 pr-14">
              <img
                src={BF_GMAIL}
                alt="Gmail"
                width={40}
                height={40}
                className="shrink-0 rounded-xl object-contain"
                style={{ border: "1px solid var(--border)" }}
              />
              <div>
                <p className="text-base font-bold text-stone-900 dark:text-stone-100">Gmail</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Connect Gmail to send personalized email campaigns
                </p>
              </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-2 px-6 pb-6 pt-2 gap-8">

              {/* Left — OAuth */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  OAuth on Google Workspace
                </p>

                <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  Account will be connected to project{" "}
                  <span className="font-semibold text-stone-900 dark:text-stone-100">Intempt Technologies-project</span>
                  {" "}in organization{" "}
                  <span className="font-semibold text-stone-900 dark:text-stone-100">Intempt Technologies</span>.
                </p>

                <ul className="flex flex-col gap-2 mt-1">
                  {[
                    "Easier to setup",
                    "More stable and less disconnects",
                    "Available for GSuite accounts",
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-200">
                      <Check size={13} className="shrink-0 text-stone-500 dark:text-stone-400" strokeWidth={2.5} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Setup instructions */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  Setup Instructions
                </p>

                <ol className="flex flex-col gap-3">
                  {[
                    { n: 1, text: "Go to your Google Workspace Admin Panel" },
                    { n: 2, text: 'Click "Configure new app"' },
                  ].map(({ n, text }) => (
                    <li key={n} className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-200">
                      <span className="mt-0.5 shrink-0 font-semibold text-stone-400 dark:text-stone-500 w-4">
                        {n}.
                      </span>
                      {text}
                    </li>
                  ))}

                  {/* Step 3 — Client ID */}
                  <li className="flex flex-col gap-2 text-sm">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 font-semibold text-stone-400 dark:text-stone-500 w-4">3.</span>
                      <span className="text-stone-700 dark:text-stone-200">Use this Client-ID to search for Intempt:</span>
                    </div>
                    <div
                      className="flex items-start gap-2 rounded-xl px-3 py-2.5 ml-6"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      <code className="flex-1 break-all font-mono text-xs leading-relaxed text-stone-700 dark:text-stone-200">
                        {CLIENT_ID}
                      </code>
                      <button
                        type="button"
                        onClick={copyClientId}
                        title={copied ? "Copied!" : "Copy"}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-200 dark:hover:bg-white/8"
                      >
                        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 text-sm text-stone-700 dark:text-stone-200">
                    <span className="mt-0.5 shrink-0 font-semibold text-stone-400 dark:text-stone-500 w-4">5.</span>
                    Select and approve Intempt to access your Google Workspace
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/4 text-sm font-semibold text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-3/4 flex items-center justify-center gap-2.5 rounded-xl h-11 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70"
                style={{ background: "#0080FF" }}
              >
                {signingIn ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  "Sign In with Google"
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
