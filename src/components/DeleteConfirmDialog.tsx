import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

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
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copyName() {
    navigator.clipboard.writeText(entityName);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  const canDelete = value === entityName;
  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <AlertDialog open onOpenChange={(next) => { if (!next) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">Delete {entityLabel}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-5 text-left">
              <p className="text-sm leading-6">
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
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canDelete}
            onClick={onConfirm}
          >
            Delete {entityLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
