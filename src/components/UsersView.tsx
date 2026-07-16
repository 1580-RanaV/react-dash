

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2, LayoutDashboard, Plus, Table2, TableRowsSplit, Trash2 } from "lucide-react";
import CreateUserDrawer from "./CreateUserDrawer";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import { DEFAULT_MENU_ITEMS, ThreeDotsMenuItem } from "./ThreeDotsMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SegmentSelector, { Segment } from "./SegmentSelector";
import FilterBuilder from "./FilterBuilder";

const USER_COLUMNS: TableColumn[] = [
  { key: "user", label: "User", width: "22%" },
  { key: "accountName", label: "Account name", width: "22%" },
  { key: "email", label: "Email", width: "24%" },
  { key: "jobTitle", label: "Job title", width: "16%" },
  { key: "intemptTags", label: "Intempt tags", width: "16%" },
];

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: color + "18", color }}>
      {label}
    </span>
  );
}

export const USERS_DATA = [
  { id: "u01",  name: "Sarah Mitchell",   account: "Apex Dynamics",       email: "s.mitchell@apexdyn.com",        title: "VP of Marketing",         tags: [["Customer", "#0080FF"], ["High Value", "#16a34a"]] },
  { id: "u02",  name: "James Okonkwo",    account: "NovaTech Solutions",   email: "j.okonkwo@novatech.io",         title: "Senior Engineer",         tags: [["Lead", "#f97316"]] },
  { id: "u03",  name: "Priya Sharma",     account: "Linea Studio",         email: "priya@lineastudio.co",          title: "Head of Design",          tags: [["Customer", "#0080FF"], ["Designer", "#8b5cf6"]] },
  { id: "u04",  name: "Carlos Ruiz",      account: "FieldsUSA",            email: "c.ruiz@fieldsusa.com",          title: "Operations Manager",      tags: [["Customer", "#0080FF"]] },
  { id: "u05",  name: "Emily Chen",       account: "Blu AI",               email: "emily.chen@bluai.dev",          title: "Product Manager",         tags: [["Internal", "#64748b"]] },
  { id: "u06",  name: "Marcus Williams",  account: "StockInvest Platform", email: "m.williams@stockinvest.com",    title: "CTO",                     tags: [["Customer", "#0080FF"], ["High Value", "#16a34a"]] },
  { id: "u07",  name: "Aisha Patel",      account: "Admin Console",        email: "a.patel@adminconsole.io",       title: "DevOps Lead",             tags: [["Internal", "#64748b"]] },
  { id: "u08",  name: "Tom Bergmann",     account: "Data Pipeline Co",     email: "tom.bergmann@datapipe.eu",      title: "Data Architect",          tags: [["Lead", "#f97316"], ["Enterprise", "#0ea5e9"]] },
  { id: "u09",  name: "Fatima Al-Hassan", account: "Mobile App Inc",       email: "f.alhassan@mobileapp.com",      title: "iOS Developer",           tags: [["Customer", "#0080FF"]] },
  { id: "u10",  name: "Ryan Nakamura",    account: "Dev Playground",       email: "ryan@devplayground.io",         title: "Full-Stack Developer",    tags: [["Internal", "#64748b"], ["Beta", "#8b5cf6"]] },
  { id: "u11",  name: "Sofia Andersen",   account: "Apex Dynamics",        email: "sofia.a@apexdyn.com",           title: "Content Strategist",      tags: [["Customer", "#0080FF"]] },
  { id: "u12",  name: "Kwame Asante",     account: "NovaTech Solutions",   email: "k.asante@novatech.io",          title: "QA Engineer",             tags: [["Lead", "#f97316"]] },
  { id: "u13",  name: "Isabella Torres",  account: "Linea Studio",         email: "i.torres@lineastudio.co",       title: "Brand Designer",          tags: [["Customer", "#0080FF"], ["Designer", "#8b5cf6"]] },
  { id: "u14",  name: "Daniel Park",      account: "StockInvest Platform", email: "d.park@stockinvest.com",        title: "Backend Engineer",        tags: [["Enterprise", "#0ea5e9"]] },
  { id: "u15",  name: "Chloe Martin",     account: "FieldsUSA",            email: "c.martin@fieldsusa.com",        title: "Account Executive",       tags: [["Customer", "#0080FF"], ["High Value", "#16a34a"]] },
  { id: "u16",  name: "Omar Abdullah",    account: "Blu AI",               email: "o.abdullah@bluai.dev",          title: "ML Engineer",             tags: [["Internal", "#64748b"]] },
  { id: "u17",  name: "Laura Kowalski",   account: "Data Pipeline Co",     email: "l.kowalski@datapipe.eu",        title: "Analytics Engineer",      tags: [["Enterprise", "#0ea5e9"]] },
  { id: "u18",  name: "Ethan Brooks",     account: "Admin Console",        email: "e.brooks@adminconsole.io",      title: "Security Engineer",       tags: [["Internal", "#64748b"], ["Beta", "#8b5cf6"]] },
  { id: "u19",  name: "Yuki Tanaka",      account: "Mobile App Inc",       email: "yuki.t@mobileapp.com",          title: "UI Designer",             tags: [["Customer", "#0080FF"], ["Designer", "#8b5cf6"]] },
  { id: "u20",  name: "Amara Diallo",     account: "Dev Playground",       email: "amara@devplayground.io",        title: "Platform Engineer",       tags: [["Internal", "#64748b"]] },
  { id: "u21",  name: "Nathan Cooper",    account: "Apex Dynamics",        email: "n.cooper@apexdyn.com",          title: "Sales Director",          tags: [["Customer", "#0080FF"], ["High Value", "#16a34a"]] },
  { id: "u22",  name: "Valentina Cruz",   account: "NovaTech Solutions",   email: "v.cruz@novatech.io",            title: "Product Designer",        tags: [["Lead", "#f97316"], ["Designer", "#8b5cf6"]] },
  { id: "u23",  name: "Liam O'Brien",     account: "StockInvest Platform", email: "l.obrien@stockinvest.com",      title: "Frontend Engineer",       tags: [["Enterprise", "#0ea5e9"]] },
  { id: "u24",  name: "Zara Ahmed",       account: "FieldsUSA",            email: "z.ahmed@fieldsusa.com",         title: "Customer Success",        tags: [["Customer", "#0080FF"]] },
  { id: "u25",  name: "Ben Hartley",      account: "Linea Studio",         email: "ben.h@lineastudio.co",          title: "Motion Designer",         tags: [["Customer", "#0080FF"], ["Designer", "#8b5cf6"]] },
  { id: "u26",  name: "Nadia Petrov",     account: "Admin Console",        email: "n.petrov@adminconsole.io",      title: "Cloud Architect",         tags: [["Enterprise", "#0ea5e9"]] },
  { id: "u27",  name: "Jae-Won Lee",      account: "Blu AI",               email: "jaewon@bluai.dev",              title: "Research Scientist",      tags: [["Internal", "#64748b"], ["Beta", "#8b5cf6"]] },
  { id: "u28",  name: "Mia Thompson",     account: "Data Pipeline Co",     email: "mia.t@datapipe.eu",             title: "Data Scientist",          tags: [["Enterprise", "#0ea5e9"]] },
  { id: "u29",  name: "Alex Fernandez",   account: "Mobile App Inc",       email: "alex.f@mobileapp.com",          title: "Android Developer",       tags: [["Customer", "#0080FF"]] },
  { id: "u30",  name: "Grace O'Sullivan", account: "Dev Playground",       email: "grace@devplayground.io",        title: "Growth Engineer",         tags: [["Internal", "#64748b"]] },
];

const USER_ROWS = USERS_DATA.map(({ id, name, account, email, title, tags }) => ({
  id,
  href: `/users/${id}`,
  cells: {
    user:         name,
    accountName:  account,
    email:        { value: email, muted: true },
    jobTitle:     title,
    intemptTags: (
      <div className="flex flex-wrap gap-1">
        {tags.map(([label, color]) => <Tag key={label} label={label} color={color} />)}
      </div>
    ),
  },
}));

const USER_SEGMENTS: Segment[] = [
  { id: "all",       name: "All users",       icon: <TableRowsSplit size={15} />, count: USERS_DATA.length },
  { id: "list1",     name: "List 1",           icon: <TableRowsSplit size={15} /> },
  { id: "beso-test", name: "Jsut Beso test",   icon: <TableRowsSplit size={15} /> },
  { id: "all-copy",  name: "All users copy",   icon: <TableRowsSplit size={15} /> },
  { id: "list-copy", name: "List 1 copy",      icon: <TableRowsSplit size={15} /> },
];

const TABS = [
  { key: "table",     label: "Table",     icon: <Table2 size={14} />,          count: USERS_DATA.length },
  { key: "board",     label: "Board",     icon: <LayoutDashboard size={14} />, count: null },
  { key: "analytics", label: "Analytics", icon: <BarChart2 size={14} />,       count: null },
] as const;

type Tab = typeof TABS[number]["key"];

export default function UsersView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "table";
  function setTab(key: Tab) { navigate(`/users?tab=${key}`, { replace: true }); }
  const [selectedSegment, setSelectedSegment] = useState(USER_SEGMENTS[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function makeMenu(row: TableRow): ThreeDotsMenuItem[] {
    return DEFAULT_MENU_ITEMS.map((item) =>
      item.label === "Delete"
        ? { ...item, onClick: () => setDeleteTarget({ id: row.id, name: String(row.cells.user) }) }
        : item
    );
  }

  const displayUserRows = USER_ROWS
    .filter((r) => !deletedIds.has(r.id))
    .map((r) => ({ ...r, menuItems: makeMenu(r) }));

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <div className="flex items-center gap-2 px-4 pt-3 shrink-0">
        <SegmentSelector
          segments={USER_SEGMENTS}
          selected={selectedSegment}
          onSelect={setSelectedSegment}
        />
        <div className="h-5 w-px shrink-0 bg-stone-200 dark:bg-white/10" />
        <ViewTabs tabs={TABS} activeTab={tab} onChange={setTab} className="flex items-center gap-1" />
      </div>

      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        {tab === "table" && (
          <DashboardTable
            columns={USER_COLUMNS}
            rows={displayUserRows}
            searchPlaceholder="Search users..."
            filterPanel={<FilterBuilder />}
            selectable
            onDeleteSelected={(ids) => setDeletedIds((s) => new Set([...s, ...ids]))}
            action={
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Create user</span>
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

      {drawerOpen && <CreateUserDrawer onClose={() => setDrawerOpen(false)} />}
      {deleteTarget && (
        <DeleteConfirmDialog
          entityType="user"
          entityName={deleteTarget.name}
          onConfirm={() => { setDeletedIds((s) => new Set([...s, deleteTarget.id])); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
