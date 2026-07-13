

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Link2, Lock, Package, Plus, Rss, Trash2 } from "lucide-react";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SlidingSidebar from "./SlidingSidebar";

const PRODUCT_COLUMNS: TableColumn[] = [
  { key: "image", label: "Image", width: "7%", align: "center" },
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
      image: <img src="https://picsum.photos/seed/42338/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "PavaShot C5 OC Rounds 5% Capsaicin .68 Cal Projectiles",
      price: "$54.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:01 PM", muted: true },
      id: { value: "42338", muted: true },
    },
  },
  {
    id: "40305",
    href: "/catalog/products/42338",
    cells: {
      image: <img src="https://picsum.photos/seed/40305/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "Real Avid Smart-Fit Vise Block for Glock Pistols",
      price: "$37.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:03 PM", muted: true },
      id: { value: "40305", muted: true },
    },
  },
  {
    id: "37768",
    href: "/catalog/products/42338",
    cells: {
      image: <img src="https://picsum.photos/seed/37768/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "Glock 47464 Magazine 9mm 24rd Extended Black Polymer",
      price: "$37.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:06 PM", muted: true },
      id: { value: "37768", muted: true },
    },
  },
  {
    id: "38951",
    href: "/catalog/products/42338",
    cells: {
      image: <img src="https://picsum.photos/seed/38951/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "Smith & Wesson 25rd Magazine Fits S&W M&P15-22 22LR Black",
      price: "$22.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:05 PM", muted: true },
      id: { value: "38951", muted: true },
    },
  },
  {
    id: "38443",
    href: "/catalog/products/42338",
    cells: {
      image: <img src="https://picsum.photos/seed/38443/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "Colt Mfg O1911C 1911 Government 45 ACP Stainless National Match Barrel",
      price: "$952.95",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:05 PM", muted: true },
      id: { value: "38443", muted: true },
    },
  },
  {
    id: "37939",
    href: "/catalog/products/42338",
    cells: {
      image: <img src="https://picsum.photos/seed/37939/36/36" alt="" className="h-9 w-9 rounded-md object-cover" />,
      title: "Bergara B-14 Ridge Carbon Wilderness Rifle .308 Win",
      price: "$0.40",
      status: { label: "Active", tone: "green" },
      lastUpdated: { value: "Jun 02, 2026 23:06 PM", muted: true },
      id: { value: "37939", muted: true },
    },
  },
];

const tabs = [
  {
    key: "products",
    label: "Products",
    icon: <Package size={15} />,
    count: PRODUCT_ROWS.length,
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

function StepIndicator({ step, label, active }: { step: number; label: string; active: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
        active
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-stone-300 bg-white text-stone-400 dark:border-stone-600 dark:bg-(--input) dark:text-stone-500"
      }`}>
        {step}
      </div>
      <span className={`text-xs font-medium ${active ? "text-blue-600 dark:text-blue-400" : "text-stone-400 dark:text-stone-500"}`}>
        {label}
      </span>
    </div>
  );
}

function CreateCatalogSourceDrawer({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authEnabled, setAuthEnabled] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SlidingSidebar
      title="Create catalog source"
      description="Configure the connection to your catalog source."
      onClose={onClose}
      footer={
        <button
          className="flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#0080FF" }}
        >
          Next
        </button>
      }
    >
      {/* Stepper */}
      <div className="mb-7 flex w-full items-start">
        <StepIndicator step={1} label="Connection" active={true} />
        <div className="mt-3.5 flex-1 border-t-2 border-stone-200 dark:border-stone-700 mx-2" />
        <StepIndicator step={2} label="Field mapping" active={false} />
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Name
            <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Product Feed"
            className="h-10 w-full rounded-lg border px-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100 dark:placeholder:text-stone-500"
            style={{ borderColor: "var(--border)", background: "var(--input)" }}
          />
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            URL
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Link2 size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100 dark:placeholder:text-stone-500"
              style={{ borderColor: "var(--border)", background: "var(--input)" }}
            />
          </div>
        </div>

        {/* Enable authentication */}
        <div className="flex flex-col overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setAuthEnabled((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/3"
            style={{ background: "var(--content-bg)" }}
          >
            <div className="flex items-center gap-3">
              <Lock size={14} className="text-stone-400 dark:text-stone-500" />
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Enable authentication</span>
            </div>
            <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${authEnabled ? "bg-blue-500" : "bg-stone-200 dark:bg-white/15"}`}>
              <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${authEnabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </span>
          </button>

          {authEnabled && (
            <div className="flex flex-col gap-4 border-t px-4 py-4" style={{ borderColor: "var(--border)" }}>
              {/* Username / API Key */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-500 dark:text-stone-400">Username / API Key</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or API key"
                  className="h-10 w-full rounded-lg border px-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100 dark:placeholder:text-stone-500"
                  style={{ borderColor: "var(--border)", background: "var(--input)" }}
                />
              </div>

              {/* Password / Secret */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-500 dark:text-stone-400">Password / Secret</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or secret"
                    className="h-10 w-full rounded-lg border px-3 pr-9 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100 dark:placeholder:text-stone-500"
                    style={{ borderColor: "var(--border)", background: "var(--input)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SlidingSidebar>
  );
}

export default function CatalogView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = tabs.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab")! : "products";
  function setTab(key: string) { navigate(`/catalog?tab=${key}`, { replace: true }); }
  const [createSourceOpen, setCreateSourceOpen] = useState(false);

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
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
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
                  onClick={() => setCreateSourceOpen(true)}
                  className="flex h-9 items-center gap-1.5 px-3.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
                  style={{ background: "#0080FF" }}
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Create catalog source</span>
                </button>
              }
            />
          </div>
        )}
      </div>

      {createSourceOpen && <CreateCatalogSourceDrawer onClose={() => setCreateSourceOpen(false)} />}

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
