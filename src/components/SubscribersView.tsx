

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2, LayoutDashboard, Plus, Table2 } from "lucide-react";
import DashboardTable, { TableColumn } from "./DashboardTable";

const COLUMNS: TableColumn[] = [
  { key: "name",       label: "Name",           width: "22%" },
  { key: "email",      label: "Email",          width: "24%" },
  { key: "status",     label: "Status",         width: "12%" },
  { key: "consent",    label: "Consent",        width: "14%" },
  { key: "subscribed", label: "Subscribed date", width: "14%" },
  { key: "source",     label: "Source",         width: "14%" },
];

const TABS = [
  { key: "table",     label: "Table",     icon: <Table2 size={14} /> },
  { key: "board",     label: "Board",     icon: <LayoutDashboard size={14} /> },
  { key: "analytics", label: "Analytics", icon: <BarChart2 size={14} /> },
] as const;

type Tab = typeof TABS[number]["key"];

export default function SubscribersView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "table";
  function setTab(key: Tab) { navigate(`/subscribers?tab=${key}`, { replace: true }); }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex h-9 items-center gap-2 px-3 rounded-lg text-sm font-medium transition-colors duration-100
              ${tab === t.key
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6"
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pt-4 pb-4 animate-fade-up">
        {tab === "table" && (
          <DashboardTable
            columns={COLUMNS}
            rows={[]}
            searchPlaceholder="Search subscribers..."
            emptyState="No subscribers yet."
            action={
              <button
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                Create subscriber
              </button>
            }
          />
        )}
        {tab === "board" && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="text-center space-y-1.5">
              <LayoutDashboard size={24} className="mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Board view coming soon</p>
            </div>
          </div>
        )}
        {tab === "analytics" && (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="text-center space-y-1.5">
              <BarChart2 size={24} className="mx-auto text-stone-300 dark:text-stone-600" />
              <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Analytics view coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
