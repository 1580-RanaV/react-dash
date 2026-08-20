

import { useSearchParams } from "react-router-dom";
import { UserCircle, Clapperboard, PersonStanding, PenTool } from "lucide-react";
import ViewTabs from "./ViewTabs";
import AvatarsView from "./AvatarsView";
import ScenesView from "./ScenesView";
import PosesView from "./PosesView";
import DesignSystemView from "./DesignSystemView";

const TABS = [
  { key: "avatars",       label: "Avatars",       icon: <UserCircle size={13} /> },
  { key: "scenes",        label: "Scenes",        icon: <Clapperboard size={13} /> },
  { key: "poses",         label: "Poses",         icon: <PersonStanding size={13} /> },
  { key: "design-system", label: "Design System", icon: <PenTool size={13} /> },
];

export default function StudioView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = TABS.some((t) => t.key === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "avatars";

  function setTab(key: string) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    if (key !== "design-system") next.delete("theme");
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <ViewTabs tabs={TABS} activeTab={activeTab} onChange={setTab} />
      {activeTab === "avatars" && <AvatarsView />}
      {activeTab === "scenes" && <ScenesView />}
      {activeTab === "poses" && <PosesView />}
      {activeTab === "design-system" && <DesignSystemView />}
    </div>
  );
}
