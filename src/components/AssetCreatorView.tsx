

import { useNavigate } from "react-router-dom";
import { AlignLeft, Bell, Braces, Code, FileText, Image, Mail, MessageCircle, MessageSquare, Upload } from "lucide-react";
import ImageCanvasView from "./ImageCanvasView";

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  "image":       { label: "New Image",    icon: Image },
  "email-html":  { label: "Email HTML",   icon: Code },
  "email-plain": { label: "Email Plain",  icon: Mail },
  "page":        { label: "Page",         icon: FileText },
  "sms":         { label: "SMS",          icon: MessageSquare },
  "push":        { label: "Push",         icon: Bell },
  "slack":       { label: "Slack",        icon: MessageCircle },
  "text":        { label: "Text",         icon: AlignLeft },
  "code":        { label: "Code",         icon: Braces },
  "upload":      { label: "Upload File",  icon: Upload },
};

export default function AssetCreatorView({ type }: { type: string }) {
  const navigate = useNavigate();

  function goBack() {
    navigate("/asset-library");
  }

  if (type === "image") {
    return <ImageCanvasView onBack={goBack} />;
  }

  const meta = TYPE_META[type] ?? { label: type, icon: FileText };
  const Icon = meta.icon;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 animate-fade-up" style={{ background: "var(--main-bg)" }}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--content-bg)" }}>
        <Icon size={28} className="text-stone-400" />
      </div>
      <p className="text-base font-semibold text-stone-800 dark:text-stone-200">{meta.label}</p>
      <p className="text-sm text-stone-400">Editor coming soon</p>
      <button
        onClick={goBack}
        className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/8"
        style={{ borderColor: "var(--border)" }}
      >
        ← Back to assets
      </button>
    </div>
  );
}
