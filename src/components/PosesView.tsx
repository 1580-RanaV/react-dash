

import { useState } from "react";
import GridCardView, { GridCard } from "./GridCardView";
import PoseDetailView from "./PoseDetailView";

const IMG = "/pose.png";

const POSES: GridCard[] = [
  { id: "standing",     name: "Standing",    gradient: ["#c8d0dc", "#98a8bc"], image: IMG },
  { id: "sitting",      name: "Sitting",     gradient: ["#d0c8c0", "#a89888"], image: IMG },
  { id: "walking",      name: "Walking",     gradient: ["#c0d0c0", "#90a890"], image: IMG },
  { id: "pointing",     name: "Pointing",    gradient: ["#d0c8d8", "#a098b8"], image: IMG },
  { id: "arms-crossed", name: "Arms Crossed", gradient: ["#bcc8d4", "#8ca0b4"], image: IMG },
  { id: "waving",       name: "Waving",      gradient: ["#d4c8bc", "#b0a090"], image: IMG },
  { id: "thinking",     name: "Thinking",    gradient: ["#c8d4cc", "#98b0a0"], image: IMG },
  { id: "reading",      name: "Reading",     gradient: ["#d0ccc8", "#b0a8a0"], image: IMG },
  { id: "presenting",   name: "Presenting",  gradient: ["#c4c8d4", "#9498b4"], image: IMG },
  { id: "relaxed",      name: "Relaxed",     gradient: ["#ccc4bc", "#a89888"], image: IMG },
];

export default function PosesView() {
  const [selected, setSelected] = useState<GridCard | null>(null);

  if (selected) {
    return <PoseDetailView pose={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <GridCardView
      createLabel="Custom pose"
      createSubLabel="Create your own"
      items={POSES}
      searchPlaceholder="Search poses..."
      newLabel="New pose"
      onCardClick={setSelected}
    />
  );
}
