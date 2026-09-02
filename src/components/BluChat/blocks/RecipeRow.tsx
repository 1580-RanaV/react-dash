import type { SlashRecipe } from "../types";

/* Trigger word: create-recipe (row rendered in the "/" recipe picker) */

export function RecipeRow({ recipe, onSelect }: { recipe: SlashRecipe; onSelect: (r: SlashRecipe) => void }) {
  return (
    <button
      onClick={() => onSelect(recipe)}
      className="flex w-full items-center gap-3 px-3.5 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: "rgb(239,246,255)", color: "rgb(37,99,235)" }}
      >
        {recipe.icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{recipe.label}</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">{recipe.desc}</p>
      </div>
    </button>
  );
}
