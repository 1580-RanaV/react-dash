import type { PinnedWidget } from "../../lib/useFavorites";
import { RECIPES } from "../RecipesView";
import { EMAIL_TEMPLATES } from "../AssetDetailView";
import KpiChartPreview    from "./KpiChartPreview";
import KpiBadgePreview    from "./KpiBadgePreview";
import EngagementReportPreview from "./EngagementReportPreview";
import RevenueReportPreview from "./RevenueReportPreview";
import TrafficReportPreview from "./TrafficReportPreview";
import ReportPreview      from "./ReportPreview";
import DesignPreview      from "./DesignPreview";
import RecipePreview      from "./RecipePreview";
import EmailAssetPreview  from "./EmailAssetPreview";
import ImageAssetPreview  from "./ImageAssetPreview";
import VisualAssetPreview from "./VisualAssetPreview";
import PortraitAssetPreview from "./PortraitAssetPreview";
import MeetingPreview     from "./MeetingPreview";
import ProductPreview     from "./ProductPreview";
import GenericPreview     from "./GenericPreview";
import type { PreviewProps } from "./shared";

export type { PreviewProps };
export type { PreviewProps as WidgetPreviewProps };

// ── Widget registry — ordered, first match wins ───────────────────────────────
//  To add a new widget type: append a { name, matches, Render } entry here.

export const WIDGET_REGISTRY: {
  name: string;
  matches: (w: PinnedWidget) => boolean;
  Render: React.FC<PreviewProps>;
}[] = [
  {
    name: "kpi-chart",
    matches: w => w.type === "kpi" && !!(w.meta?.sparkline as number[] | undefined)?.length,
    Render: KpiChartPreview,
  },
  {
    name: "kpi-badge",
    matches: w => w.type === "kpi",
    Render: KpiBadgePreview,
  },
  {
    name: "engagement-report",
    matches: w => w.type === "report" && w.meta?.reportType === "engagement-chart" && !!(w.meta?.chartPoints as unknown[] | undefined)?.length,
    Render: EngagementReportPreview,
  },
  {
    name: "revenue-report",
    matches: w => w.type === "report" && w.meta?.reportType === "revenue-chart" && !!(w.meta?.chartPoints as unknown[] | undefined)?.length,
    Render: RevenueReportPreview,
  },
  {
    name: "traffic-report",
    matches: w => w.type === "report" && w.meta?.reportType === "traffic-bars" && !!(w.meta?.rows as unknown[] | undefined)?.length,
    Render: TrafficReportPreview,
  },
  {
    name: "report",
    matches: w => w.type === "report",
    Render: ReportPreview,
  },
  {
    name: "design",
    matches: w => w.type === "design",
    Render: DesignPreview,
  },
  {
    name: "recipe",
    matches: w => w.type === "recipe" && !!RECIPES.find(r => r.id === String(w.meta?.recipeId ?? "")),
    Render: RecipePreview,
  },
  {
    name: "email-asset",
    matches: w => w.type === "asset" && !!w.meta?.assetId && !!EMAIL_TEMPLATES[w.meta.assetId as string],
    Render: EmailAssetPreview,
  },
  {
    name: "image-asset",
    matches: w => w.type === "asset" && w.meta?.assetKind === "image" && !!w.meta?.image,
    Render: ImageAssetPreview,
  },
  {
    name: "avatar",
    matches: w => w.type === "asset" && String(w.meta?.widgetType ?? "").toLowerCase().includes("avatar"),
    Render: VisualAssetPreview,
  },
  {
    name: "scene",
    matches: w => w.type === "asset" && String(w.meta?.widgetType ?? "").toLowerCase().includes("scene"),
    Render: VisualAssetPreview,
  },
  {
    name: "pose",
    matches: w => w.type === "asset" && String(w.meta?.widgetType ?? "").toLowerCase().includes("pose"),
    Render: VisualAssetPreview,
  },
  {
    name: "portrait-asset",
    matches: w => w.type === "asset" && !!w.meta?.gradient,
    Render: PortraitAssetPreview,
  },
  {
    name: "meeting",
    matches: w => w.type === "meeting",
    Render: MeetingPreview,
  },
  {
    name: "product",
    matches: w => w.type === "product",
    Render: ProductPreview,
  },
  {
    name: "generic",
    matches: () => true,
    Render: GenericPreview,
  },
];
