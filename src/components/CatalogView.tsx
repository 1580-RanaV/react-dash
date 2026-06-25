

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, Plus, Rss, Trash2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const tabs = [
  {
    key: "products",
    label: "Products",
    icon: <Package size={15} />,
    emptyIcon: <Package size={20} className="text-stone-300 dark:text-stone-600" />,
    emptyTitle: "No products yet",
    emptyDesc: "Add products to start building a browsable catalog.",
  },
  {
    key: "sources",
    label: "Sources",
    icon: <Rss size={15} />,
    emptyIcon: <Rss size={20} className="text-stone-300 dark:text-stone-600" />,
    emptyTitle: "No sources connected",
    emptyDesc: "Connect product feeds and data sources to keep your catalog updated.",
  },
];

const PRODUCT_COLUMNS: TableColumn[] = [
  { key: "image", label: "Image", width: "7%" },
  { key: "title", label: "Title", width: "48%" },
  { key: "price", label: "Price", width: "10%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "lastUpdated", label: "Last updated", width: "16%" },
  { key: "id", label: "ID", width: "9%" },
];

const PRODUCT_ROWS: TableRow[] = [
  {
    id: "42338",
    href: "/catalog/products/42338",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles",
      price: "$54.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:01 PM", muted: true },
      id: { value: "42338", muted: true },
    },
  },
  {
    id: "40305",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "Real Avid Smart-Fit Vise Block for Glock Pistols",
      price: "$37.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:03 PM", muted: true },
      id: { value: "40305", muted: true },
    },
  },
  {
    id: "37768",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "Glock 47464 Magazine 9mm 24rd Extended Black Polymer",
      price: "$37.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:06 PM", muted: true },
      id: { value: "37768", muted: true },
    },
  },
  {
    id: "38951",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "Smith & Wesson 25rd Magazine Fits S&W M&P15-22 22LR Black",
      price: "$22.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:05 PM", muted: true },
      id: { value: "38951", muted: true },
    },
  },
  {
    id: "38443",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "Colt Mfg O1911C 1911 Government 45 ACP Stainless National Match Barrel",
      price: "$952.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:05 PM", muted: true },
      id: { value: "38443", muted: true },
    },
  },
  {
    id: "37939",
    cells: {
      image: <div className="h-9 w-9 rounded-md border border-stone-200 bg-stone-100 dark:border-(--border) dark:bg-(--input)" />,
      title: "Bergara B-14 Ridge Carbon Wilderness Rifle .308 Win",
      price: "$0.40",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:06 PM", muted: true },
      id: { value: "37939", muted: true },
    },
  },
];

const SOURCE_COLUMNS: TableColumn[] = [
  { key: "name", label: "Name", width: "34%" },
  { key: "source", label: "Source", width: "24%" },
  { key: "lastUpdated", label: "Last Updated", width: "22%" },
  { key: "createdBy", label: "Created By", width: "20%" },
];

const SOURCE_ROWS: TableRow[] = [
  {
    id: "shopify-primary-feed",
    cells: {
      name: "Primary Shopify catalog",
      source: { value: "Shopify", muted: true },
      lastUpdated: { value: "Jun 02, 2026 23:08 PM", muted: true },
      createdBy: "Rohan",
    },
  },
  {
    id: "google-merchant-feed",
    cells: {
      name: "Google Merchant feed",
      source: { value: "Google Merchant Center", muted: true },
      lastUpdated: { value: "Jun 02, 2026 22:41 PM", muted: true },
      createdBy: "Rohan",
    },
  },
  {
    id: "manual-import",
    cells: {
      name: "Manual product import",
      source: { value: "CSV Upload", muted: true },
      lastUpdated: { value: "May 28, 2026 09:16 AM", muted: true },
      createdBy: "Rohan",
    },
  },
];

export default function CatalogView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = tabs.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab")! : "products";
  function setTab(key: string) { navigate(`/catalog?tab=${key}`, { replace: true }); }

  const [deletedProductIds, setDeletedProductIds] = useState<Set<string>>(new Set());
  const [deletedSourceIds, setDeletedSourceIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; entity: string } | null>(null);

  function makeProductMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.title), entity: "product" }) }
        : item
    );
  }

  function makeSourceMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.name), entity: "catalog source" }) }
        : item
    );
  }

  const displayProductRows = PRODUCT_ROWS
    .filter((r) => !deletedProductIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeProductMenu(r) }));

  const displaySourceRows = SOURCE_ROWS
    .filter((r) => !deletedSourceIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeSourceMenu(r) }));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ViewTabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <div key={tab} className="flex-1 min-h-0 flex flex-col animate-fade-up">
        {tab === "products" ? (
          <div className="flex flex-col px-4 pt-4 pb-4">
            <DashboardTable columns={PRODUCT_COLUMNS} rows={displayProductRows} />
          </div>
        ) : (
          <div className="flex flex-col px-4 pt-4 pb-4">
            <DashboardTable
              columns={SOURCE_COLUMNS}
              rows={displaySourceRows}
              action={
                <button
                  className="flex h-9 items-center gap-1.5 px-3.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
                  style={{ background: "#0080FF" }}
                >
                  <Plus size={13} />
                  Create catalog source
                </button>
              }
            />
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          entityType={deleteTarget.entity}
          entityName={deleteTarget.name}
          onConfirm={() => {
            if (deleteTarget.entity === "product") setDeletedProductIds((s) => new Set([...s, deleteTarget.id]));
            else setDeletedSourceIds((s) => new Set([...s, deleteTarget.id]));
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
