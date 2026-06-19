

import { useState } from "react";
import AvatarDetailView from "./AvatarDetailView";
import GridCardView, { GridCard } from "./GridCardView";

const IMG = "/avatar.png";

const AVATARS: GridCard[] = [
  { id: "ada",    name: "Ada",    gradient: ["#d6c5b4", "#b8a090"], image: IMG },
  { id: "amara",  name: "Amara",  gradient: ["#c5cdd8", "#9aabb8"], image: IMG },
  { id: "diego",  name: "Diego",  gradient: ["#b8c9b2", "#8faa88"], image: IMG },
  { id: "eli",    name: "Eli",    gradient: ["#bfc8d4", "#8fa0b0"], image: IMG },
  { id: "henrik", name: "Henrik", gradient: ["#ccc5b5", "#a8997f"], image: IMG },
  { id: "iris",   name: "Iris",   gradient: ["#d4c5c5", "#b09090"], image: IMG },
  { id: "jin",    name: "Jin",    gradient: ["#c8d4ca", "#9ab0a0"], image: IMG },
  { id: "kofi",   name: "Kofi",   gradient: ["#a89080", "#7a6050"], image: IMG },
  { id: "lin",    name: "Lin",    gradient: ["#ccd4dc", "#a0b0bc"], image: IMG },
  { id: "mateo",  name: "Mateo",  gradient: ["#b8c4d8", "#8898b8"], image: IMG },
  { id: "maya",   name: "Maya",   gradient: ["#d0c8bc", "#b0a088"], image: IMG },
];

export default function AvatarsView() {
  const [selected, setSelected] = useState<GridCard | null>(null);

  if (selected) {
    return <AvatarDetailView avatar={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <GridCardView
      createLabel="Custom avatar"
      createSubLabel="Create your own"
      items={AVATARS}
      searchPlaceholder="Search avatars..."
      newLabel="New avatar"
      onCardClick={setSelected}
    />
  );
}
