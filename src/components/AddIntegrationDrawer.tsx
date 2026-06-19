

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import SlidingSidebar from "./SlidingSidebar";

const BF = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

type IntegrationType = "source" | "platform" | "destination";

interface Integration {
  name: string;
  description: string;
  domain: string;
  type: IntegrationType;
  logoOverride?: React.ReactNode;
}

const TYPE_LABEL: Record<IntegrationType, string> = {
  source:      "Source",
  platform:    "Platform",
  destination: "Destination",
};

const TYPE_COLOR: Record<IntegrationType, string> = {
  source:      "text-blue-500",
  platform:    "text-violet-500",
  destination: "text-emerald-600",
};

const JS_LOGO = (
  <div className="flex h-full w-full items-center justify-center rounded-xl text-sm font-bold text-black" style={{ background: "#F7DF1E" }}>
    JS
  </div>
);

const SOURCES: Integration[] = [
  { name: "JavaScript",  description: "Track events from web applications",  domain: "javascript.com", type: "source",  logoOverride: JS_LOGO },
  { name: "Node JS",     description: "Server-side event tracking",          domain: "nodejs.org",     type: "source" },
  { name: "iOS",         description: "Mobile analytics for iOS",            domain: "apple.com",      type: "source" },
  { name: "Android",     description: "Mobile analytics for Android",        domain: "android.com",    type: "source" },
];

const PLATFORMS: Integration[] = [
  { name: "HubSpot", description: "Sync contacts, companies, and deals from HubSpot CRM.", domain: "hubspot.com", type: "platform" },
  { name: "Stripe",  description: "Payment events and revenue data in real-time.",          domain: "stripe.com",  type: "platform" },
  { name: "Shopify", description: "E-commerce analytics and purchase events.",              domain: "shopify.com", type: "platform" },
];

const DESTINATIONS: Integration[] = [
  { name: "Workspace",        description: "Send emails via Gmail on behalf of your domain.", domain: "google.com",   type: "destination" },
  { name: "Twilio",           description: "Send SMS and MMS messages to your users.",        domain: "twilio.com",   type: "destination" },
  { name: "SendGrid",         description: "Transactional and bulk email delivery.",          domain: "sendgrid.com", type: "destination" },
  { name: "Slack",            description: "Post notifications to Slack channels.",           domain: "slack.com",    type: "destination" },
  { name: "Amazon SES",       description: "Email sending via verified SES domain.",          domain: "amazon.com",   type: "destination" },
];

export default function AddIntegrationDrawer({ onClose }: { onClose: () => void }) {
  return (
    <SlidingSidebar title="Add Integration" onClose={onClose}>
      <div className="flex flex-col gap-7">
        <IntegrationSection title="Sources" items={SOURCES} />
        <IntegrationSection title="Platforms" badge="Mapping Enabled" items={PLATFORMS} />
        <IntegrationSection title="Destinations" items={DESTINATIONS} />
      </div>
    </SlidingSidebar>
  );
}

function IntegrationSection({ title, badge, items }: { title: string; badge?: string; items: Integration[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {title}
        </span>
        {badge && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500 dark:bg-white/8 dark:text-stone-400">
            {badge}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <IntegrationCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({ item }: { item: Integration }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  function handleMouseEnter() {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
  }

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltipPos(null)}
        className="flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center cursor-pointer transition-all hover:border-stone-100 hover:bg-stone-50 dark:hover:border-white/8 dark:hover:bg-white/4"
      >
        <div className="h-12 w-12 overflow-hidden rounded-xl">
          {item.logoOverride && (imgFailed || !item.domain) ? (
            item.logoOverride
          ) : item.logoOverride ? (
            item.logoOverride
          ) : (
            <img
              src={BF(item.domain)}
              alt={item.name}
              width={48}
              height={48}
              className="h-full w-full object-contain"
              onError={(e) => {
                setImgFailed(true);
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-xs font-medium leading-tight text-stone-800 dark:text-stone-200">{item.name}</p>
          <p className={`text-[11px] font-medium ${TYPE_COLOR[item.type]}`}>{TYPE_LABEL[item.type]}</p>
        </div>
      </div>

      {tooltipPos && typeof window !== "undefined" && createPortal(
        <div
          className="pointer-events-none fixed z-9999 w-44 rounded-xl bg-stone-900 px-3 py-2.5 text-left text-xs leading-relaxed text-white shadow-lg dark:bg-stone-800"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translate(-50%, -100%)" }}
        >
          {item.description}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-stone-900 dark:border-t-stone-800" />
        </div>,
        document.body
      )}
    </>
  );
}
