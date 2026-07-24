

import AccountsView from "./AccountsView";
import AssetLibraryView from "./AssetLibraryView";
import AvatarsView from "./AvatarsView";
import DesignSystemView from "./DesignSystemView";
import SubscriptionView from "./SubscriptionView";
import DealsView from "./DealsView";
import PosesView from "./PosesView";
import ScenesView from "./ScenesView";
import BoardsView from "./BoardsView";
import BrandView from "./BrandView";
import EventsView from "./EventsView";
import HomeView from "./HomeView";
import OutOfTheBoxView from "./OutOfTheBoxView";
import CatalogView from "./CatalogView";
import ConnectionsView from "./ConnectionsView";
import { Suspense } from "react";
import ExperiencesView from "./ExperiencesView";
import FeedsView from "./FeedsView";
import GenericView from "./GenericView";
import JourneysView from "./JourneysView";
import MeetingsView from "./MeetingsView";
import SchedulerView from "./SchedulerView";
import UsersView from "./UsersView";
import SubscribersView from "./SubscribersView";
import AttributesView from "./AttributesView";
import RecipesView from "./RecipesView";

const GENERIC_VIEWS: Record<string, { label: string; icon: React.ReactNode }> = {};

export function HomeEmpty() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-(--input) flex items-center justify-center mx-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Nothing here yet</p>
          <p className="text-xs text-stone-400 mt-0.5">Select an item from the sidebar to get started</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardView({ view = "home" }: { view?: string }) {
  const generic = GENERIC_VIEWS[view];

  if (view === "home")         return <Suspense><HomeView /></Suspense>;
  if (view === "accounts") return <AccountsView />;
  if (view === "asset-library") return <AssetLibraryView />;
  if (view === "deals") return <DealsView />;
  if (view === "brand")        return <Suspense><BrandView /></Suspense>;
  if (view === "catalog")      return <Suspense><CatalogView /></Suspense>;
  if (view === "feeds")        return <FeedsView />;
  if (view === "journeys")     return <JourneysView />;
  if (view === "experiences")  return <ExperiencesView />;
  if (view === "integrations") return <Suspense><ConnectionsView /></Suspense>;
  if (view === "recipes")      return <RecipesView />;
  if (view === "users")        return <Suspense><UsersView /></Suspense>;
  if (view === "meetings")     return <MeetingsView />;
  if (view === "scheduler")    return <SchedulerView />;
  if (view === "out-of-the-box") return <Suspense><OutOfTheBoxView /></Suspense>;
  if (view === "boards")       return <BoardsView />;
  if (view === "events")       return <Suspense><EventsView /></Suspense>;
  if (view === "subscribers")  return <Suspense><SubscribersView /></Suspense>;
  if (view === "attributes")   return <AttributesView />;
  if (view === "avatars")      return <AvatarsView />;
  if (view === "poses")        return <PosesView />;
  if (view === "scenes")       return <ScenesView />;
  if (view === "design-system") return <DesignSystemView />;
  if (view === "subscription") return <Suspense><SubscriptionView /></Suspense>;

  if (generic) {
    return (
      <GenericView
        createLabel={generic.label}
        icon={generic.icon}
      />
    );
  }

  return <HomeEmpty />;
}
