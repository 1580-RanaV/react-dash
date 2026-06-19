

import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, Image } from "lucide-react";

type AssetType = "email" | "sms" | "image";

const TYPE_META: Record<AssetType, { label: string; icon: React.ReactNode }> = {
  email: { label: "Email", icon: <Mail size={16} className="text-blue-500" /> },
  sms:   { label: "SMS",   icon: <MessageSquare size={16} className="text-blue-500" /> },
  image: { label: "Image", icon: <span style={{width:16,height:16,display:"inline-block"}} /> },
};

const RECENT: { id: string; name: string; ago: string; type: AssetType }[] = [
  { id: "a1", name: "Claude design - Email 1",                                                    ago: "2 days ago",   type: "email"  },
  { id: "a2", name: "Built a flash sale SMS using Liquid product variables with a 7-day window",  ago: "3 days ago",   type: "sms"    },
  { id: "a3", name: "Removed the JSON wrapper entirely — outputting only the raw HTML",           ago: "1 week ago",   type: "email"  },
  { id: "a4", name: "Generate an image of the brand character holding a can of Co",               ago: "1 month ago",  type: "image"  },
  { id: "a5", name: "Generate an image of the brand character holding a water tumbler",           ago: "1 month ago",  type: "image"  },
];

export default function RecentDesigns() {
  const navigate = useNavigate();

  return (
    <div className="mt-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Recent designs</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Pick up where you left off</p>
        </div>
        <button
          onClick={() => navigate("/asset-library")}
          className="flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
        >
          View all
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {RECENT.map((item, i) => {
          const meta = TYPE_META[item.type];
          return (
            <button
              key={item.id}
              onClick={() => navigate("/asset-library")}
              className={`flex items-center gap-3 py-3 text-left hover:bg-stone-50 dark:hover:bg-white/4 transition-colors -mx-2 px-2 rounded-lg ${
                i < RECENT.length - 1 ? "border-b border-stone-100 dark:border-(--border)" : ""
              }`}
            >
              {/* Thumb — type icon in a blue-tinted square */}
              <span className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
                {meta.icon}
              </span>

              {/* Name + ago */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-700 dark:text-stone-200 truncate">{item.name}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{item.ago}</p>
              </div>

              {/* Type pill — text only, blue */}
              <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
