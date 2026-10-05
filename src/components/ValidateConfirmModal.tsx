import { Coins, CircleAlert } from "lucide-react";
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

// Shared by RecipeCanvasView and RecipesView's draft Validate button — same
// two-stage confirm, used by both Validate entry points so the copy and the
// one-time "insufficient credits" mock stay in sync regardless of which
// surface the user validated from.

export type ValidateModalStage = "confirm" | "insufficient";

export default function ValidateConfirmModal({
  stage, onCancel, onContinue, onTryAgain,
}: {
  stage: ValidateModalStage;
  onCancel: () => void;
  onContinue: () => void;
  onTryAgain: () => void;
}) {
  const isConfirm = stage === "confirm";

  return (
    <AlertDialog open onOpenChange={(next) => { if (!next) onCancel(); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isConfirm ? "" : "text-red-500"}`}>
            {isConfirm
              ? <Coins size={16} className="text-blue-500 shrink-0" />
              : <CircleAlert size={16} className="text-red-500 shrink-0" />}
            {isConfirm ? "Validate this recipe?" : "Not enough credits"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isConfirm
              ? "This checks every step and draws credits from your workspace balance. Once it passes, anyone on your team can run this recipe."
              : "Your workspace is out of credits right now. Please top up your balance to continue validating."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {isConfirm ? (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onContinue}>Continue</AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction
              onClick={onTryAgain}
              className="w-full bg-(--border) text-stone-600 hover:bg-stone-300 dark:text-stone-300 dark:hover:bg-white/14"
            >
              Try again
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
