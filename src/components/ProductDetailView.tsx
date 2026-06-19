

import { useState } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";

import BackButton from "./BackButton";

const specs = [
  ["Link", "https://fieldsusa.com/product/pavashot-c5-5-capsaicin-round"],
  ["Caliber", "44mg"],
  ["Weight", "7lbs"],
  ["Availability", "in_stock"],
  ["Category Path", "Ammunition > Less Lethal Ammunition > OC / Pepper"],
  ["Categories", "Ammunition, Less Lethal Ammunition, OC / Pepper"],
  ["SKU", "PAVASHOT-C5-ROUND-PROJECTILE"],
  ["Category", "Ammunition"],
  ["Brand", "PavaShot"],
];

export default function ProductDetailView() {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center px-5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 text-sm min-w-0">
          <BackButton href="/catalog" />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">
            PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles
          </span>
        </div>
      </div>

      {/* Body — 50/50 */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left 50%: image centered */}
        <div className="relative flex items-center justify-center p-8" style={{ flexBasis: "50%", flexShrink: 0 }}>
          <div className="relative w-full max-w-120 aspect-square overflow-hidden rounded-2xl border border-stone-200 dark:border-(--border)">
            <img
              src="/pava.png"
              alt="PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles"

              sizes="50vw"
              className="object-contain p-6"
            />
            <button
              type="button"
              aria-label="Expand product image"
              onClick={() => setIsImageOpen(true)}
              className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-800 shadow-sm backdrop-blur transition hover:bg-white dark:border-(--border) dark:bg-stone-950/80 dark:text-stone-100 dark:hover:bg-stone-900"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Right 50%: details */}
        <div className="overflow-y-auto px-8 py-6" style={{ flexBasis: "50%" }}>
          <div className="flex flex-col gap-7">
            <div>
              <h1 className="text-xl font-bold leading-snug tracking-tight text-stone-950 dark:text-stone-50">
                PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles
              </h1>
              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
                <Stat label="Item ID"      value="42338" />
                <Stat label="Price"        value="$54.95" accent />
                <Stat label="Added on"     value="May 06, 2026" />
                <Stat label="Last updated" value="Jun 02, 2026" />
              </div>
            </div>

            <Section title="Product Specifications">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {specs.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    {label === "Link" ? (
                      <a href={value} className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-normal text-blue-600 dark:text-blue-400">
                        <span className="truncate">{value}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    ) : label === "Availability" ? (
                      <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
                        In stock
                      </span>
                    ) : (
                      <p className="mt-1 truncate text-sm font-normal text-stone-900 dark:text-stone-100">{value || "-"}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Description">
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">
                PavaShot C5 OC Rounds are .68 caliber projectiles formulated with a 5% capsaicin payload for consistent less-lethal deployment. Designed for compatible PavaShot launcher systems, these rounds deliver a controlled irritant effect through reliable dispersal upon impact. Engineered for dependable feeding and performance, the C5 formulation provides a higher-strength OC option suitable for training and operational environments where increased effectiveness is required. Law Enforcement Agency purchase only. Verification may be required prior to order fulfillment.
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isImageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close product image"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div className="relative h-full max-h-[86vh] w-full max-w-4xl">
            <img
              src="/pava.png"
              alt="PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles"

              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${accent ? "text-blue-600 dark:text-blue-400" : "text-stone-900 dark:text-stone-100"}`}>
        {value || "-"}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      {children}
    </div>
  );
}
