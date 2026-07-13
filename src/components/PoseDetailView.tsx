

import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Shuffle } from "lucide-react";
import type { GridCard } from "./GridCardView";
import { POSES } from "./PosesView";
import BackButton from "./BackButton";

const IMG = "/pose.png";

type ActionKey = "details" | "remix";

export default function PoseDetailView({ pose, onBack }: { pose: GridCard; onBack: () => void }) {
  const [activeAction, setActiveAction] = useState<ActionKey>("details");

  return (
    <div className="relative flex h-full flex-col overflow-hidden animate-fade-up" style={{ background: "var(--content-bg)" }}>
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 text-sm min-w-0 pr-4">
          <BackButton onClick={onBack} />
          <span className="truncate font-medium text-stone-900 dark:text-stone-100">{pose.name}</span>
        </div>

        <div className="shrink-0 flex items-center gap-0.5 rounded-lg bg-stone-100 dark:bg-white/8 p-0.5">
          <button
            onClick={() => setActiveAction("details")}
            className={`flex h-9 items-center rounded-md px-3 text-xs font-medium transition-all ${activeAction === "details" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            Details
          </button>
          <button
            onClick={() => { setActiveAction("remix"); window.dispatchEvent(new Event("open-blu-chat")); }}
            className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all ${activeAction === "remix" ? "bg-white text-stone-900 shadow-sm dark:bg-white/12 dark:text-stone-100" : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"}`}
          >
            <Shuffle size={13} />
            Remix
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
        {/* Image */}
        <div className="flex items-center justify-center px-6 py-6 md:p-8 md:w-1/2 md:shrink-0">
          <div className="w-full max-w-55 md:w-90 overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "3/4" }}>
            <img src={IMG} alt={pose.name} className="h-full w-full object-cover object-top" />
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-8 md:w-1/2 md:overflow-y-auto md:px-8 md:py-6">
          <div className="flex flex-col gap-7">
            <Section title="Why This Pose Works">
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Authority signal — works for brand portraits, founders, and rugged categories where assertiveness sells.
              </p>
            </Section>

            <Section title="Prompt Hint">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Standing front-facing, arms crossed over chest
              </p>
            </Section>

            <Section title="Use It For">
              <Row label="Best for" value="Apparel, Fitness, Accessories" />
              <Row label="Avatars"  value="Full-body" />
              <Row label="Scenes"   value="Studio, Editorial" />
              <Row label="Avoid"    value="Softness-led brands" />
              <Row label="Negative cues" value="No hidden product, no crossed forearms over wide logo" />
            </Section>

            <Section title="Shot">
              <Row label="Camera height" value="Eye-level" />
              <Row label="Shot length"   value="Full-body" />
            </Section>

            <Section title="Body">
              <Row label="Weight"    value="Centered" />
              <Row label="Stance"    value="Neutral" />
              <Row label="Hips"      value="Squared" />
              <Row label="Shoulders" value="Squared" />
              <Row label="Spine"     value="Neutral" />
            </Section>

            <Section title="Head & Gaze">
              <Row label="Head"       value="To-camera" />
              <Row label="Gaze"       value="To-camera" />
              <Row label="Expression" value="Focused" />
            </Section>

            <Section title="Limbs">
              <Row label="Left arm"  value="Crossed" />
              <Row label="Right arm" value="Crossed" />
              <Row label="Left leg"  value="Planted" />
              <Row label="Right leg" value="Planted" />
            </Section>

            <Section title="Product">
              <Row label="Interaction" value="None" />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-28 shrink-0 text-sm text-stone-400 dark:text-stone-500">{label}</span>
      <span className="text-sm text-stone-700 dark:text-stone-300">{value}</span>
    </div>
  );
}

export function PoseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pose = POSES.find((p) => p.id === id);
  if (!pose) return <Navigate to="/poses" replace />;
  return <PoseDetailView pose={pose} onBack={() => navigate("/poses")} />;
}
