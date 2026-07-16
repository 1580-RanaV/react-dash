

import { useEffect, useMemo, useRef, useState } from "react";
import { ListFilter, Plus, Search, Sparkles, Upload } from "lucide-react";
import GeneratingLoader from "./GeneratingLoader";
import SlidingSidebar from "./SlidingSidebar";

export type GridCard = {
  id: string;
  name: string;
  gradient: [string, string];
  image?: string;
};

const SORT_OPTIONS = [
  { key: "my-first",      label: "My characters first" },
  { key: "presets-first", label: "Presets first" },
  { key: "recent",        label: "Recently updated" },
  { key: "alpha",         label: "A to Z" },
] as const;
type SortKey = typeof SORT_OPTIONS[number]["key"];

const NEW_CARD: GridCard = {
  id: "generated-custom",
  name: "Custom",
  gradient: ["#1A4FD6", "#6B9EF4"],
};

export default function GridCardView({
  items,
  searchPlaceholder,
  newLabel,
  onCardClick,
}: {
  createLabel?: string;
  createSubLabel?: string;
  items: GridCard[];
  searchPlaceholder: string;
  newLabel: string;
  onCardClick?: (card: GridCard) => void;
}) {
  const [search, setSearch]         = useState("");
  const [cards, setCards]           = useState<GridCard[]>(items);
  const [shelfOpen, setShelfOpen]   = useState(false);
  const [shelfMethod, setShelfMethod] = useState<"ai" | "upload" | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [newId, setNewId]           = useState<string | null>(null);
  const [sortKey, setSortKey]       = useState<SortKey>("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const fileRef   = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const presetIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = useMemo(() => {
    let result = search
      ? cards.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      : cards;
    if (sortKey === "alpha") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortKey === "my-first") {
      result = [...result].sort((a) => (!presetIds.has(a.id) ? -1 : 1));
    } else if (sortKey === "presets-first") {
      result = [...result].sort((a) => (presetIds.has(a.id) ? -1 : 1));
    }
    return result;
  }, [cards, search, sortKey, presetIds]);

  function handleBluAI() {
    setShelfOpen(false);
    window.dispatchEvent(new Event("open-blu-chat"));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    setShelfOpen(false);
    setUploading(true);
    setTimeout(() => {
      setCards((prev) => [NEW_CARD, ...prev]);
      setNewId(NEW_CARD.id);
      setUploading(false);
    }, 2200);
    e.target.value = "";
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0 overflow-y-auto animate-fade-up">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 pb-4 shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-0">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>

        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 sm:px-3.5 text-xs font-medium transition-colors
              ${sortKey !== "recent"
                ? "border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:border-(--border) dark:bg-white/3 dark:text-stone-300 dark:hover:bg-white/6 dark:hover:text-stone-100"
              }`}
          >
            <ListFilter size={13} />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {filterOpen && (
            <div
              className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 overflow-hidden rounded-xl animate-card-in"
              style={{
                background: "var(--content-bg)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSortKey(opt.key); setFilterOpen(false); }}
                  className={`flex w-full items-center px-4 py-2.5 text-sm text-left transition-colors
                    ${sortKey === opt.key
                      ? "bg-stone-50 text-stone-900 font-medium dark:bg-white/5 dark:text-stone-100"
                      : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-white/5"
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => { setShelfOpen(true); setShelfMethod(null); }}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          <Plus size={14} />
          <span className="hidden sm:inline">{newLabel}</span>
        </button>
      </div>

      {uploading && <GeneratingLoader />}

      {/* Card grid */}
      <div className="px-3 sm:px-6 pb-6">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((card) => (
            <button
              key={card.id}
              onClick={() => onCardClick?.(card)}
              className="group relative aspect-3/4 overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(145deg, ${card.gradient[0]}, ${card.gradient[1]})` }}
            >
              {card.image && (
                <img src={card.image} alt={card.name} className="absolute inset-0 h-full w-full object-cover" />
              )}
              {card.id === newId && (
                <span className="absolute right-2 top-2 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                  New
                </span>
              )}
              <div
                className="absolute inset-x-0 bottom-0 px-3.5 pb-4 pt-16"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }}
              >
                <p className="w-full text-left text-base font-bold leading-tight text-white">{card.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg,.zip" className="hidden" onChange={handleFileChange} />

      {/* Create shelf */}
      {shelfOpen && (
        <SlidingSidebar
          title={`Create ${newLabel.toLowerCase()}`}
          description="Choose how you'd like to create it."
          onClose={() => setShelfOpen(false)}
          footer={(close) => (
            <>
              <button
                onClick={close}
                className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (shelfMethod === "ai") handleBluAI();
                  else if (shelfMethod === "upload") fileRef.current?.click();
                }}
                disabled={!shelfMethod}
                className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: "#0080FF" }}
              >
                Continue
              </button>
            </>
          )}
        >
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setShelfMethod("ai")}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                shelfMethod === "ai"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Sparkles size={17} className={`shrink-0 ${shelfMethod === "ai" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
              <div>
                <p className="font-semibold">Generate with Blu AI</p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Describe what you need and Blu will generate it for you.</p>
              </div>
            </button>

            <button
              onClick={() => setShelfMethod("upload")}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                shelfMethod === "upload"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Upload size={17} className={`shrink-0 ${shelfMethod === "upload" ? "text-blue-500" : "text-stone-400 dark:text-stone-500"}`} />
              <div>
                <p className="font-semibold">Upload file</p>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Import an existing file and we'll add it to your library.</p>
              </div>
            </button>
          </div>
        </SlidingSidebar>
      )}
    </div>
  );
}
