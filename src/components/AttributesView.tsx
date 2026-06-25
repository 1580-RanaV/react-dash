

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Plus, Search, Star, Table2, User, Zap } from "lucide-react";
import DashboardTable, { TableColumn, TableRow, TableStatus } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";
import ViewTabs from "./ViewTabs";

const TABS = [
  { key: "table", label: "Table", icon: <Table2 size={14} /> },
] as const;

type Tab = typeof TABS[number]["key"];

const COLUMNS: TableColumn[] = [
  { key: "name",        label: "Name",        width: "16%" },
  { key: "object",      label: "Object",      width: "12%" },
  { key: "type",        label: "Type",        width: "13%" },
  { key: "dataType",    label: "Data type",   width: "12%" },
  { key: "status",      label: "Status",      width: "10%" },
  { key: "description", label: "Description", width: "22%" },
  { key: "example",     label: "Example",     width: "15%" },
];

function ObjectBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    User:    "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
    Account: "bg-sky-50 text-sky-600 dark:bg-sky-500/12 dark:text-sky-300",
    Event:   "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors[label] ?? "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300"}`}>
      {label}
    </span>
  );
}

function TypeBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Profile:    "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
    Behavioral: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
    Computed:   "bg-pink-50 text-pink-600 dark:bg-pink-500/12 dark:text-pink-300",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors[label] ?? "bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300"}`}>
      {label}
    </span>
  );
}

function DataTypeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600 dark:bg-white/8 dark:text-stone-300">
      {label}
    </span>
  );
}

function ExampleValue({ value }: { value: string }) {
  return (
    <span className="font-mono text-xs text-stone-500 dark:text-stone-400">{value}</span>
  );
}

const active: TableStatus   = { tone: "green", label: "Active" };
const inactive: TableStatus = { tone: "gray",  label: "Inactive" };

const RAW_ROWS: {
  id: string; name: string; object: string; type: string;
  dataType: string; status: TableStatus; description: string; example: string;
}[] = [
  { id: "at01", name: "email",          object: "User",    type: "Profile",    dataType: "String",  status: active,   description: "Primary email address",           example: "user@example.com" },
  { id: "at02", name: "first_name",     object: "User",    type: "Profile",    dataType: "String",  status: active,   description: "First name of the user",          example: "Sarah" },
  { id: "at03", name: "last_name",      object: "User",    type: "Profile",    dataType: "String",  status: active,   description: "Last name of the user",           example: "Mitchell" },
  { id: "at04", name: "created_at",     object: "User",    type: "Profile",    dataType: "Date",    status: active,   description: "Account creation timestamp",      example: "2024-01-15T10:00Z" },
  { id: "at05", name: "last_seen",      object: "User",    type: "Behavioral", dataType: "Date",    status: active,   description: "Last activity timestamp",         example: "2024-06-20T08:31Z" },
  { id: "at06", name: "total_sessions", object: "User",    type: "Computed",   dataType: "Number",  status: active,   description: "Total session count",             example: "142" },
  { id: "at07", name: "is_paying",      object: "User",    type: "Computed",   dataType: "Boolean", status: active,   description: "Whether user has a paid plan",    example: "true" },
  { id: "at08", name: "tags",           object: "User",    type: "Profile",    dataType: "Array",   status: active,   description: "User-assigned labels",            example: '["vip","beta"]' },
  { id: "at09", name: "country",        object: "User",    type: "Profile",    dataType: "String",  status: active,   description: "Country of user origin",          example: "US" },
  { id: "at10", name: "plan",           object: "Account", type: "Profile",    dataType: "String",  status: active,   description: "Subscription plan tier",          example: "Pro" },
  { id: "at11", name: "mrr",            object: "Account", type: "Computed",   dataType: "Number",  status: active,   description: "Monthly recurring revenue",       example: "499" },
  { id: "at12", name: "seat_count",     object: "Account", type: "Profile",    dataType: "Number",  status: active,   description: "Number of seats on the account",  example: "12" },
  { id: "at13", name: "is_trial",       object: "Account", type: "Profile",    dataType: "Boolean", status: inactive, description: "Whether the account is on trial", example: "false" },
  { id: "at14", name: "event_name",     object: "Event",   type: "Profile",    dataType: "String",  status: active,   description: "Name of the tracked event",       example: "page_view" },
  { id: "at15", name: "page_url",       object: "Event",   type: "Profile",    dataType: "String",  status: active,   description: "URL where the event occurred",    example: "/dashboard" },
  { id: "at16", name: "revenue",        object: "Event",   type: "Profile",    dataType: "Number",  status: inactive, description: "Revenue associated with event",   example: "29.99" },
  { id: "at17", name: "utm_source",     object: "Event",   type: "Behavioral", dataType: "String",  status: inactive, description: "UTM source of acquisition",       example: "google" },
  { id: "at18", name: "device_type",    object: "Event",   type: "Behavioral", dataType: "String",  status: active,   description: "Device category at event time",   example: "mobile" },
];

const ROWS: TableRow[] = RAW_ROWS.map((r) => ({
  id: r.id,
  cells: {
    name:        { value: r.name, subValue: undefined },
    object:      <ObjectBadge label={r.object} />,
    type:        <TypeBadge label={r.type} />,
    dataType:    <DataTypeBadge label={r.dataType} />,
    status:      r.status,
    description: { value: r.description, muted: true },
    example:     <ExampleValue value={r.example} />,
  },
}));

type AttrDetail = typeof RAW_ROWS[number];

const OBJECT_ICONS: Record<string, React.ReactNode> = {
  User:    <User size={13} />,
  Account: <Building2 size={13} />,
  Event:   <Zap size={13} />,
};

const DRAWER_TABS = [
  { key: "configuration", label: "Configuration" },
  { key: "users",         label: "Users" },
];

const MOCK_USERS = [
  { id: "u1", name: "Sarah Mitchell",   email: "s.mitchell@apexdyn.com" },
  { id: "u2", name: "James Okonkwo",    email: "j.okonkwo@novatech.io" },
  { id: "u3", name: "Priya Sharma",     email: "priya@lineastudio.co" },
  { id: "u4", name: "Carlos Ruiz",      email: "c.ruiz@fieldsusa.com" },
  { id: "u5", name: "Emily Chen",       email: "emily.chen@bluai.dev" },
];

function UsersList() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:placeholder:text-stone-500"
          style={{ background: "var(--input)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">No users match your search.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-stone-50 dark:hover:bg-white/4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600 dark:bg-white/10 dark:text-stone-300">
                {u.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{u.name}</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AttributeDetailDrawer({ attr, onClose }: { attr: AttrDetail; onClose: () => void }) {
  const [drawerTab, setDrawerTab] = useState("configuration");
  const [description, setDescription] = useState(attr.description);

  return (
    <SlidingSidebar title={attr.name} onClose={onClose} contentClassName="flex flex-col min-h-0">
      <ViewTabs
        tabs={DRAWER_TABS}
        activeTab={drawerTab}
        onChange={setDrawerTab}
        className="flex shrink-0 items-center gap-1 px-7 pt-1 pb-1"
      />

      <div className="flex-1 overflow-y-auto px-7 pb-7 pt-5">
        {drawerTab === "configuration" && (
          <div className="flex flex-col gap-6">
            {/* Object */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-stone-800 dark:text-stone-100">Object</label>
              <div
                className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-stone-700 dark:text-stone-200"
                style={{ borderColor: "var(--border)", background: "var(--input)" }}
              >
                <span className="text-stone-400 dark:text-stone-500">{OBJECT_ICONS[attr.object]}</span>
                {attr.object}
              </div>
            </div>

            {/* Field name */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-800 dark:text-stone-100">Field name</label>
              </div>
              <div
                className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--border)", background: "var(--input)" }}
              >
                <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-white/10 dark:text-stone-200">
                  <Star size={10} className="text-amber-400" fill="currentColor" />
                  {attr.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-400 dark:text-stone-500">
                Primary is used in exports and liquid variables. Aliases also ingest into this attribute. Press Enter or comma to add. Lowercase letters, numbers, and underscores only.
              </p>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-800 dark:text-stone-100">Description</label>
                <span className="text-xs text-stone-400 dark:text-stone-500">Optional</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-(--input) dark:text-stone-200 dark:placeholder:text-stone-500"
                style={{ borderColor: "var(--border)", background: "var(--input)" }}
                placeholder="Add a description…"
              />
            </div>
          </div>
        )}

        {drawerTab === "users" && (
          <UsersList />
        )}
      </div>
    </SlidingSidebar>
  );
}

export default function AttributesView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = (TABS as readonly { key: string }[]).some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") as Tab : "table";
  function setTab(key: Tab) { navigate(`/attributes?tab=${key}`, { replace: true }); }

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [selectedAttr, setSelectedAttr] = useState<AttrDetail | null>(null);
  const displayRows = ROWS.filter((r) => !deletedIds.has(r.id));

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <ViewTabs tabs={TABS} activeTab={tab} onChange={setTab} />

      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        {tab === "table" && (
          <DashboardTable
            columns={COLUMNS}
            rows={displayRows}
            searchPlaceholder="Search attributes..."
            onRowClick={(row) => {
              const raw = RAW_ROWS.find((r) => r.id === row.id);
              if (raw) setSelectedAttr(raw);
            }}
            action={
              <button
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                Create attribute
              </button>
            }
          />
        )}
      </div>

      {selectedAttr && (
        <AttributeDetailDrawer attr={selectedAttr} onClose={() => setSelectedAttr(null)} />
      )}
    </div>
  );
}
