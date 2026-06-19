

import { useState } from "react";
import { Monitor, Globe, FlaskConical, Users } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

const groups = [
  {
    key: "experiments",
    label: "Experiments",
    icon: <FlaskConical size={14} className="text-stone-500 dark:text-stone-400" />,
    items: [
      {
        key: "client-experiment",
        icon: <Monitor size={20} className="text-blue-500" />,
        iconBg: "bg-blue-50 dark:bg-blue-500/10",
        title: "Client-side Experiment",
        desc: "A/B test visual changes on your website using the visual editor",
        tag: "No variant targeting",
        tagColor: "bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400",
      },
    ],
  },
  {
    key: "personalizations",
    label: "Personalizations",
    icon: <Users size={14} className="text-stone-500 dark:text-stone-400" />,
    items: [
      {
        key: "client-personalization",
        icon: <Globe size={20} className="text-blue-500" />,
        iconBg: "bg-blue-50 dark:bg-blue-500/10",
        title: "Client-side Personalization",
        desc: "Personalize website content for specific audiences",
        tag: "Per-variant targeting",
        tagColor: "bg-blue-50 dark:bg-blue-500/10 text-blue-500",
      },
    ],
  },
];

export default function CreateExperienceDrawer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("client-experiment");

  return (
    <SlidingSidebar
      title="Create experience"
      description="Choose an experience type to get started"
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-colors"
            style={{ background: "#0080FF" }}
          >
            Create experience
          </button>
        </>
      )}
    >
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-600">
          Experience type
        </p>

        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              {group.icon}
              <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                {group.label}
              </span>
            </div>

            <div className="space-y-2">
              {group.items.map((item) => {
                const isSelected = selected === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setSelected(item.key)}
                    className="w-full text-left rounded-xl p-5 transition-all duration-150"
                    style={{
                      border: isSelected
                        ? "1.5px solid #0080FF"
                        : "1.5px solid var(--border)",
                      background: "var(--content-bg)",
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}
                    >
                      {item.icon}
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 mb-1.5">
                      {item.title}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mb-3 leading-relaxed">
                      {item.desc}
                    </p>
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-md ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SlidingSidebar>
  );
}
