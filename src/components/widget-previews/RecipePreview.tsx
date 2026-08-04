import { cloneElement } from "react";
import { RECIPES, RECIPE_DATES, RECIPE_CREATORS } from "../RecipesView";
import { PreviewProps, CARD_STYLES, useCardRemove, cardOverlay, PinboardHeart, CardGrip } from "./shared";

export default function RecipePreview({ widget, onUnpin, isOverlay = false, dragHandleProps = {} }: PreviewProps) {
  const { removing, handleUnpin, removeStyle } = useCardRemove(onUnpin);
  const recipe = RECIPES.find(r => r.id === String(widget.meta?.recipeId ?? ""))!;
  const chips = Array.from(new Set([...recipe.spec.areas, ...recipe.spec.products])).slice(0, 2);
  const creator = RECIPE_CREATORS[recipe.id];

  return (
    <div
      className="group relative rounded-xl p-5 overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col gap-3"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", ...removeStyle, ...cardOverlay(isOverlay) }}
      {...dragHandleProps}
    >
      <style>{CARD_STYLES}</style>
      <span className="pointer-events-none absolute -right-3 -bottom-3 select-none text-stone-900 dark:text-stone-100 opacity-[0.045] dark:opacity-[0.06]">
        {cloneElement(recipe.icon as React.ReactElement<{ size?: number }>, { size: 88 })}
      </span>

      <div className="shrink-0 flex items-center justify-between gap-2">
        {creator && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: creator.color }}>
              {creator.initials}
            </span>
            <span className="text-xs text-stone-600 dark:text-stone-400 truncate">{creator.name}</span>
          </div>
        )}
        <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">{RECIPE_DATES[recipe.id]}</span>
      </div>

      <div className="flex-1 pr-6">
        <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug mb-1.5">{recipe.title}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-3">{recipe.description}</p>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map(chip => (
            <span key={chip} className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
              {chip}
            </span>
          ))}
        </div>
      )}

      {!isOverlay && onUnpin && (
        <div className="absolute right-2 top-2"><PinboardHeart onClick={handleUnpin} removing={removing} /></div>
      )}
      <CardGrip />
    </div>
  );
}
