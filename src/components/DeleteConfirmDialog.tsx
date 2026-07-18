

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X } from "lucide-react";

export default function DeleteConfirmDialog({
  entityType,
  entityName,
  onConfirm,
  onClose,
}: {
  entityType: string;
  entityName: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copyName() {
    navigator.clipboard.writeText(entityName);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    setMounted(true);
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!mounted) return null;

  const canDelete = value === entityName;
  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-140 rounded-2xl overflow-hidden animate-card-in"
        style={{
          background: "var(--content-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <div className="flex flex-col gap-6 px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-red-500">
              Delete {entityLabel}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              You are going to delete the {entityType}. If you delete it, you will
              no longer be able to recover it. Enter this {entityType}&apos;s name{" "}
              <span className="inline-flex items-center rounded-md bg-red-50 text-xs font-semibold text-red-500 dark:bg-red-500/12 dark:text-red-400 overflow-hidden">
                <button
                  type="button"
                  onClick={copyName}
                  className="flex items-center px-1.5 py-0.5 transition-colors hover:text-red-700 dark:hover:text-red-300"
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                </button>
                <span className="w-px self-stretch bg-red-200 dark:bg-red-500/30" />
                <span className="px-1.5 py-0.5">{entityName}</span>
              </span>{" "}
              to confirm you want to permanently delete it.
            </p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">
                Confirm {entityType} name
              </span>
              <input
                type="text"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${entityType} name here`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canDelete) onConfirm();
                }}
                className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-red-300 focus:ring-2 focus:ring-red-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-lg border border-stone-200 px-5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/8"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { if (canDelete) onConfirm(); }}
              disabled={!canDelete}
              className={`inline-flex h-9 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white transition-all ${
                canDelete
                  ? "hover:opacity-90 active:scale-[0.98] cursor-pointer"
                  : "cursor-not-allowed opacity-40"
              }`}
              style={{ background: "#EF4444" }}
            >
              Delete {entityLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
