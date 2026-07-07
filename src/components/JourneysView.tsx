

import { useState } from "react";
import { Link } from "react-router-dom";
import { Code, Copy, Edit3, Plus, Trash2 } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { ThreeDotsMenuItem } from "./ThreeDotsMenu";
import MetricCard from "./MetricCard";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const CHART_DATA = [
  { date:"May 3",  value:0 },       { date:"May 4",  value:12000 },
  { date:"May 5",  value:175000 },  { date:"May 6",  value:230000 },
  { date:"May 7",  value:260000 },  { date:"May 8",  value:290000 },
  { date:"May 9",  value:310000 },  { date:"May 10", value:340000 },
  { date:"May 11", value:370000 },  { date:"May 12", value:400000 },
  { date:"May 13", value:430000 },  { date:"May 14", value:460000 },
  { date:"May 15", value:490000 },  { date:"May 16", value:510000 },
  { date:"May 17", value:530000 },  { date:"May 18", value:560000 },
  { date:"May 19", value:900000 },  { date:"May 20", value:1300000 },
  { date:"May 21", value:3600000 }, { date:"May 22", value:4700000 },
  { date:"May 23", value:5400000 }, { date:"May 24", value:6100000 },
  { date:"May 25", value:6200000 }, { date:"May 26", value:14900000 },
  { date:"May 27", value:15047484 },{ date:"May 28", value:15047484 },
  { date:"May 29", value:15047484 },{ date:"May 30", value:15047484 },
  { date:"Jun 1",  value:15047484 },{ date:"Jun 2",  value:15047484 },
];
const CHART_DATA_HALF = CHART_DATA.map(d => ({ ...d, value: Math.round(d.value * 0.5) }));

const JOURNEY_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", width: "24%", info: true },
  { key: "status", label: "Status", width: "10%", info: true },
  { key: "sent", label: "Sent", width: "8%", info: true },
  { key: "opens", label: "Opens", width: "8%", info: true },
  { key: "clicks", label: "Clicks", width: "8%", info: true },
  { key: "replies", label: "Replies", width: "8%", info: true },
  { key: "attributedRevenue", label: "Attributed Revenue", width: "14%", info: true },
  { key: "revenueSent", label: "Revenue/Sent", width: "10%", info: true },
  { key: "lastUpdated", label: "Last updated", width: "14%", info: true },
];

const JOURNEY_ROWS: TableRow[] = [
  {
    id: "browse-abandonment",
    href: "/journeys/browse-abandonment",
    cells: {
      name: "Browse Abandonment Journey",
      status: { label: "Running", tone: "green" },
      sent: "179",
      opens: { value: "198", subValue: "110.61%" },
      clicks: { value: "115", subValue: "64.25%" },
      replies: { value: "0", subValue: "0%" },
      attributedRevenue: { value: "$13,925.25", subValue: "0%" },
      revenueSent: { value: "$77.79", muted: true },
      lastUpdated: "May 12, 2026 11:38 AM",
    },
  },
  {
    id: "product-based-sends",
    href: "/journeys/product-based-sends",
    cells: {
      name: "Product-based sends",
      status: { label: "Running", tone: "green" },
      sent: "121",
      opens: { value: "144", subValue: "119.01%" },
      clicks: { value: "63", subValue: "52.07%" },
      replies: { value: "0", subValue: "0%" },
      attributedRevenue: { value: "$4,322.80", subValue: "0%" },
      revenueSent: { value: "$35.73", muted: true },
      lastUpdated: "May 27, 2026 06:38 PM",
    },
  },
  {
    id: "negative-review-response",
    href: "/journeys/negative-review-response",
    cells: {
      name: "Negative Review Response Journey",
      status: { label: "Draft", tone: "gray" },
      sent: "--",
      opens: { value: "--", muted: true },
      clicks: { value: "--", muted: true },
      replies: { value: "--", muted: true },
      attributedRevenue: { value: "$0", subValue: "--" },
      revenueSent: { value: "$0", muted: true },
      lastUpdated: "Dec 18, 2025 05:07 PM",
    },
  },
  {
    id: "cart-abandonment",
    href: "/journeys/cart-abandonment",
    cells: {
      name: "Cart Abandonment Journey",
      status: { label: "Running", tone: "green" },
      sent: "66",
      opens: { value: "96", subValue: "145.45%" },
      clicks: { value: "17", subValue: "25.76%" },
      replies: { value: "0", subValue: "0%" },
      attributedRevenue: { value: "$844.37", subValue: "0%" },
      revenueSent: { value: "$12.79", muted: true },
      lastUpdated: "May 7, 2026 12:27 AM",
    },
  },
  {
    id: "win-back-lapsed",
    href: "/journeys/win-back-lapsed",
    cells: {
      name: "Win-Back Lapsed Customers",
      status: { label: "Running", tone: "green" },
      sent: "412",
      opens: { value: "389", subValue: "94.42%" },
      clicks: { value: "201", subValue: "48.79%" },
      replies: { value: "3", subValue: "0.73%" },
      attributedRevenue: { value: "$28,340.00", subValue: "6.88%" },
      revenueSent: { value: "$68.79", muted: true },
      lastUpdated: "Jun 1, 2026 09:15 AM",
    },
  },
  {
    id: "post-purchase-upsell",
    href: "/journeys/post-purchase-upsell",
    cells: {
      name: "Post-Purchase Upsell",
      status: { label: "Running", tone: "green" },
      sent: "534",
      opens: { value: "610", subValue: "114.23%" },
      clicks: { value: "298", subValue: "55.81%" },
      replies: { value: "1", subValue: "0.19%" },
      attributedRevenue: { value: "$41,220.50", subValue: "7.72%" },
      revenueSent: { value: "$77.19", muted: true },
      lastUpdated: "May 30, 2026 03:44 PM",
    },
  },
  {
    id: "welcome-series",
    href: "/journeys/welcome-series",
    cells: {
      name: "Welcome Series",
      status: { label: "Paused", tone: "blue" },
      sent: "1,208",
      opens: { value: "1,044", subValue: "86.42%" },
      clicks: { value: "487", subValue: "40.32%" },
      replies: { value: "12", subValue: "0.99%" },
      attributedRevenue: { value: "$9,870.00", subValue: "0.82%" },
      revenueSent: { value: "$8.17", muted: true },
      lastUpdated: "Apr 14, 2026 11:00 AM",
    },
  },
  {
    id: "vip-loyalty-reward",
    href: "/journeys/vip-loyalty-reward",
    cells: {
      name: "VIP Loyalty Reward",
      status: { label: "Running", tone: "green" },
      sent: "88",
      opens: { value: "102", subValue: "115.91%" },
      clicks: { value: "74", subValue: "84.09%" },
      replies: { value: "0", subValue: "0%" },
      attributedRevenue: { value: "$19,450.00", subValue: "22.10%" },
      revenueSent: { value: "$220.91", muted: true },
      lastUpdated: "May 25, 2026 07:22 PM",
    },
  },
  {
    id: "reorder-reminder",
    href: "/journeys/reorder-reminder",
    cells: {
      name: "Reorder Reminder",
      status: { label: "Running", tone: "green" },
      sent: "267",
      opens: { value: "231", subValue: "86.52%" },
      clicks: { value: "143", subValue: "53.56%" },
      replies: { value: "2", subValue: "0.75%" },
      attributedRevenue: { value: "$7,614.00", subValue: "2.85%" },
      revenueSent: { value: "$28.52", muted: true },
      lastUpdated: "May 29, 2026 10:05 AM",
    },
  },
  {
    id: "price-drop-alert",
    href: "/journeys/price-drop-alert",
    cells: {
      name: "Price Drop Alert",
      status: { label: "Draft", tone: "gray" },
      sent: "--",
      opens: { value: "--", muted: true },
      clicks: { value: "--", muted: true },
      replies: { value: "--", muted: true },
      attributedRevenue: { value: "$0", subValue: "--" },
      revenueSent: { value: "$0", muted: true },
      lastUpdated: "Jun 2, 2026 02:30 PM",
    },
  },
  {
    id: "referral-program",
    href: "/journeys/referral-program",
    cells: {
      name: "Referral Program Journey",
      status: { label: "Paused", tone: "blue" },
      sent: "345",
      opens: { value: "298", subValue: "86.38%" },
      clicks: { value: "112", subValue: "32.46%" },
      replies: { value: "5", subValue: "1.45%" },
      attributedRevenue: { value: "$5,230.00", subValue: "1.52%" },
      revenueSent: { value: "$15.16", muted: true },
      lastUpdated: "Mar 30, 2026 04:55 PM",
    },
  },
  {
    id: "subscription-renewal",
    href: "/journeys/subscription-renewal",
    cells: {
      name: "Subscription Renewal Reminder",
      status: { label: "Running", tone: "green" },
      sent: "193",
      opens: { value: "174", subValue: "90.16%" },
      clicks: { value: "139", subValue: "72.02%" },
      replies: { value: "7", subValue: "3.63%" },
      attributedRevenue: { value: "$31,080.00", subValue: "16.10%" },
      revenueSent: { value: "$161.04", muted: true },
      lastUpdated: "May 31, 2026 08:48 AM",
    },
  },
  {
    id: "flash-sale-sms",
    href: "/journeys/flash-sale-sms",
    cells: {
      name: "Flash Sale SMS Blast",
      status: { label: "Draft", tone: "gray" },
      sent: "--",
      opens: { value: "--", muted: true },
      clicks: { value: "--", muted: true },
      replies: { value: "--", muted: true },
      attributedRevenue: { value: "$0", subValue: "--" },
      revenueSent: { value: "$0", muted: true },
      lastUpdated: "Jun 2, 2026 11:10 AM",
    },
  },
];

export default function JourneysView() {
  const [rows, setRows] = useState<TableRow[]>(JOURNEY_ROWS);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return [
      { label: "Edit",      icon: Edit3 },
      { label: "Embed",     icon: Code  },
      { label: "Copy link", icon: Copy  },
      { label: "Delete",    icon: Trash2, tone: "danger", onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.name) }) },
    ];
  }

  const displayRows = rows.map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Topbar */}
      <div className="flex items-center shrink-0 pr-3 pt-3">
        <div className="flex-1"><DateRangePicker /></div>
      </div>

      {/* Metric cards */}
      <div className="flex flex-col sm:flex-row gap-4 px-4 pt-3 pb-4 animate-fade-up">
        <MetricCard
          value="$15,047,484.74"
          label="Total revenue"
          change="-- vs. previous period"
          data={CHART_DATA}
        />
        <MetricCard
          value="$7,523,742.37"
          label="Intempt attributed revenue"
          change="-- vs. previous period"
          data={CHART_DATA_HALF}
        />
      </div>

      <div className="sticky top-0 flex flex-col px-4 pb-4" style={{ height: "calc(100vh - 60px)" }}>
        <DashboardTable
          columns={JOURNEY_COLUMNS}
          rows={displayRows}
          action={
            <Link
              to="/journeys/new"
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create journey</span>
            </Link>
          }
        />
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="journey"
          entityName={deleteTarget.name}
          onConfirm={() => {
            setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
