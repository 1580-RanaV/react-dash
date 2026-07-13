import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import DashboardShell from "./components/DashboardShell";
import DashboardView from "./components/DashboardView";
import SettingsLayout, { contentMap } from "./components/SettingsLayout";
import { DASHBOARD_VIEW_KEYS } from "./lib/dashboardRoutes";
import ExperienceDetailView from "./components/ExperienceDetailView";
import JourneyDetailView from "./components/JourneyDetailView";
import JourneyNewCanvas from "./components/JourneyNewCanvas";
import MeetingDetailView from "./components/MeetingDetailView";
import BoardDetailView from "./components/boards/BoardDetailView";
import ProductDetailView from "./components/ProductDetailView";
import DashboardCanvasView from "./components/DashboardCanvasView";
import AssetCreatorView from "./components/AssetCreatorView";
import UserDetailView from "./components/UserDetailView";
import { AvatarDetailPage } from "./components/AvatarDetailView";
import { SceneDetailPage } from "./components/SceneDetailView";
import { PoseDetailPage } from "./components/PoseDetailView";

function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ExperienceDetailView id={id!} />;
}

function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <JourneyDetailView id={id!} />;
}

function BoardDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <BoardDetailView id={id!} />;
}

function DashboardCanvasPage() {
  const { id } = useParams<{ id: string }>();
  return <DashboardCanvasView id={id!} />;
}

function AssetCreatorPage() {
  const { type } = useParams<{ type: string }>();
  return <AssetCreatorView type={type!} />;
}

const TABLE_SECTIONS = new Set(["team", "domains", "roles", "auditlog", "projects", "people", "project-users"]);

function SettingsSection() {
  const { section = "about" } = useParams<{ section: string }>();
  const content = contentMap[section] ?? contentMap["about"];
  if (section === "billing") {
    return (
      <div key={section} className="flex-1 min-h-0 flex items-center justify-center animate-fade-up">
        {content}
      </div>
    );
  }
  if (TABLE_SECTIONS.has(section)) {
    return (
      <div key={section} className="flex-1 flex flex-col min-h-0 animate-fade-up">
        {content}
      </div>
    );
  }
  return (
    <div key={section} className="flex-1 min-h-0 w-full overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-8 animate-fade-up">
        {content}
      </div>
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-full" style={{ background: "var(--main-bg)" }}>
      <SettingsLayout onBack={() => navigate("/home")}>
        <Routes>
          <Route index element={<Navigate to="about" replace />} />
          <Route path=":section" element={<SettingsSection />} />
        </Routes>
      </SettingsLayout>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-full" style={{ fontFamily: "Inter, sans-serif" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Settings — no DashboardShell */}
          <Route path="/settings/*" element={<SettingsPage />} />

          {/* Dashboard shell wraps all other routes */}
          <Route
            path="/*"
            element={
              <DashboardShell>
                <Routes>
                  <Route path="/home" element={<DashboardView view="home" />} />
                  <Route path="/users/:id/*" element={<UserDetailView />} />
                  <Route path="/experiences/:id" element={<ExperienceDetailPage />} />
                  <Route path="/journeys/new" element={<JourneyNewCanvas />} />
                  <Route path="/journeys/:id" element={<JourneyDetailPage />} />
                  <Route path="/meetings/rd-check-in" element={<MeetingDetailView />} />
                  <Route path="/boards/:id" element={<BoardDetailPage />} />
                  <Route path="/catalog/products/:id" element={<ProductDetailView />} />
                  <Route path="/dashboards/:id" element={<DashboardCanvasPage />} />
                  <Route path="/asset-library/new/:type" element={<AssetCreatorPage />} />
                  <Route path="/avatars/:id" element={<AvatarDetailPage />} />
                  <Route path="/scenes/:id" element={<SceneDetailPage />} />
                  <Route path="/poses/:id" element={<PoseDetailPage />} />
                  {DASHBOARD_VIEW_KEYS.map((view) => (
                    <Route key={view} path={`/${view}`} element={<DashboardView view={view} />} />
                  ))}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </DashboardShell>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
