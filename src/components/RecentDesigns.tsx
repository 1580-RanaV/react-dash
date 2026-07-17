

import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, ImageIcon, ArrowRight } from "lucide-react";

type AssetType = "email" | "sms" | "image";

const TYPE_META: Record<AssetType, {
  label: string;
  icon: React.ReactNode;
  badgeBg: string;
  pill: string;
}> = {
  email: {
    label: "Email",
    icon: <Mail size={18} />,
    badgeBg: "bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400",
    pill: "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
  },
  sms: {
    label: "SMS",
    icon: <MessageSquare size={18} />,
    badgeBg: "bg-violet-50 dark:bg-violet-500/10 text-violet-500 dark:text-violet-400",
    pill: "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
  },
  image: {
    label: "Image",
    icon: <ImageIcon size={18} />,
    badgeBg: "bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400",
    pill: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
  },
};

const RECENT: { id: string; name: string; ago: string; type: AssetType }[] = [
  { id: "a1", name: "Claude design - Email 1",                          ago: "2 days ago",  type: "email" },
  { id: "a2", name: "Flash sale SMS with Liquid product variables",      ago: "3 days ago",  type: "sms"   },
  { id: "a3", name: "Raw HTML email — no JSON wrapper",                  ago: "1 week ago",  type: "email" },
  { id: "a4", name: "Brand character holding a can",                     ago: "1 month ago", type: "image" },
  { id: "a5", name: "Brand character holding a water tumbler",           ago: "1 month ago", type: "image" },
];

export default function RecentDesigns() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Latest generations</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Pick up where you left off</p>
        </div>
        <button
          onClick={() => navigate("/asset-library")}
          className="flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {RECENT.map((item) => {
          const meta = TYPE_META[item.type];
          return (
            <button
              key={item.id}
              onClick={() => navigate("/asset-library")}
              className="group flex flex-col gap-3 rounded-xl p-4 text-left transition-all duration-150 hover:shadow-sm hover:-translate-y-0.5 focus:outline-none bg-stone-50 dark:bg-white/4"
            >
              {/* Icon badge */}
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.badgeBg}`}>
                {meta.icon}
              </span>

              {/* Name */}
              <p className="text-xs font-medium text-stone-700 dark:text-stone-200 line-clamp-2 leading-snug flex-1">
                {item.name}
              </p>

              {/* Type + time */}
              <div className="flex items-center justify-between gap-1.5">
                <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${meta.pill}`}>
                  {meta.label}
                </span>
                <span className="text-[10px] text-stone-400 shrink-0">{item.ago}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
