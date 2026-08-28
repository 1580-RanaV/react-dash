

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Table2, TableRowsSplit, Trash2 } from "lucide-react";
import CreateUserDrawer from "./CreateUserDrawer";
import ViewTabs from "./ViewTabs";
import DashboardTable, { TableColumn } from "./DashboardTable";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import SegmentSelector, { Segment } from "./SegmentSelector";
import FilterBuilder from "./FilterBuilder";
import { USERS_DATA } from "../mocks/data/users";

export { USERS_DATA } from "../mocks/data/users";

const USER_COLUMNS: TableColumn[] = [
  { key: "user", label: "User", width: "22%" },
  { key: "accountName", label: "Account name", width: "22%" },
  { key: "email", label: "Email", width: "24%" },
  { key: "jobTitle", label: "Job title", width: "16%" },
  { key: "intemptTags", label: "Intempt tags", width: "16%" },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {label}
    </span>
  );
}

function toUserRows(users: typeof USERS_DATA) {
  return users.map(({ id, name, account, email, title, tags }) => ({
    id,
    href: `/users/${id}`,
    cells: {
      user:         name,
      accountName:  account,
      email:        { value: email, muted: true },
      jobTitle:     title,
      intemptTags: (
        <div className="flex flex-wrap gap-1">
          {tags.map(([label]) => <Tag key={label} label={label} />)}
        </div>
      ),
    },
  }));
}

const USER_SEGMENTS: Segment[] = [
  { id: "all",       name: "All users",       icon: <TableRowsSplit size={15} />, count: USERS_DATA.length },
  { id: "list1",     name: "List 1",           icon: <TableRowsSplit size={15} /> },
  { id: "beso-test", name: "Jsut Beso test",   icon: <TableRowsSplit size={15} /> },
  { id: "all-copy",  name: "All users copy",   icon: <TableRowsSplit size={15} /> },
  { id: "list-copy", name: "List 1 copy",      icon: <TableRowsSplit size={15} /> },
];

export default function UsersView() {
  const navigate = useNavigate();
  const [selectedSegment, setSelectedSegment] = useState(USER_SEGMENTS[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [users, setUsers] = useState<typeof USERS_DATA>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);

  const displayUserRows = toUserRows(users)
    .filter((r) => !deletedIds.has(r.id))
    .map((r) => ({
      ...r,
      menuItems: [{ label: "Delete user", icon: Trash2, tone: "danger" as const, onClick: () => setDeleteTarget({ id: r.id, name: r.cells.user as string }) }],
    }));

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <div className="flex items-center gap-2 px-4 pt-3 shrink-0">
        <SegmentSelector
          segments={USER_SEGMENTS}
          selected={selectedSegment}
          onSelect={setSelectedSegment}
        />
        <div className="h-5 w-px shrink-0 bg-stone-200 dark:bg-white/10" />
        <ViewTabs tabs={[{ key: "table", label: "Table", icon: <Table2 size={14} />, count: displayUserRows.length }]} activeTab="table" className="flex items-center gap-1" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        <DashboardTable
          columns={USER_COLUMNS}
          rows={displayUserRows}
          searchPlaceholder="Search users..."
          filterPanel={<FilterBuilder />}
          selectable
          action={
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Create user</span>
            </button>
          }
        />
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
