

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlignLeft, Bell, Braces, FileText, Image, Mail,
  MessageCircle, MessageSquare, Upload, Code,
} from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

const ASSET_TYPES = [
  { key: "image",       label: "New image",    icon: Image },
  { key: "email-html",  label: "Email HTML",   icon: Code },
  { key: "email-plain", label: "Email plain",  icon: Mail },
  { key: "page",        label: "Page",         icon: FileText },
  { key: "sms",         label: "SMS",          icon: MessageSquare },
  { key: "push",        label: "Push",         icon: Bell },
  { key: "slack",       label: "Slack",        icon: MessageCircle },
  { key: "text",        label: "Text",         icon: AlignLeft },
  { key: "code",        label: "Code",         icon: Braces },
  { key: "upload",      label: "Upload file",  icon: Upload },
];

export default function CreateAssetDrawer({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState("image");
  const navigate = useNavigate();

  function handleCreate() {
    onClose();
    navigate(`/asset-library/new/${selected}`);
  }

  return (
    <SlidingSidebar
      title="Create asset"
      description="Choose the type of asset you want to create."
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create asset
          </button>
        </>
      )}
    >
      <div className="flex flex-col gap-0.5">
        {ASSET_TYPES.map(({ key, label, icon: Icon }) => {
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-100 ${
                isSelected
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <Icon size={17} className={isSelected ? "text-blue-500 shrink-0" : "shrink-0 text-stone-400 dark:text-stone-500"} />
              {label}
            </button>
          );
        })}
      </div>
    </SlidingSidebar>
  );
}
