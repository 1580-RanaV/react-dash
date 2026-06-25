

import { CalendarDays, Check, Copy, Globe, Info, KeyRound, Mail, MousePointer2, Pencil, Plus, RefreshCw, ShieldCheck, Trash2, Workflow } from "lucide-react";
import CodeBlock from "./CodeBlock";
import ViewTabs from "./ViewTabs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState } from "react";
import DashboardTable, { TableColumn, TableRow } from "./DashboardTable";
import SlidingSidebar from "./SlidingSidebar";
import AddIntegrationDrawer from "./AddIntegrationDrawer";
import CreateApiKeyDrawer from "./CreateApiKeyDrawer";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

const tabs = [
  { key: "connections", label: "Integrations", icon: <Workflow size={15} /> },
  { key: "api-keys",    label: "API Keys",    icon: <KeyRound size={15} /> },
  { key: "domains",     label: "Domains",     icon: <Globe size={15} /> },
];

const BF = (domain: string) =>
  `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

const INTEGRATION_DOMAIN: Record<string, string> = {
  "Salesforce":       "salesforce.com",
  "HubSpot":          "hubspot.com",
  "Mailchimp":        "mailchimp.com",
  "SendGrid":         "sendgrid.com",
  "Segment":          "segment.com",
  "Mixpanel":         "mixpanel.com",
  "Google Analytics": "google.com",
  "Stripe":           "stripe.com",
  "Shopify":          "shopify.com",
  "WooCommerce":      "woocommerce.com",
  "Zendesk":          "zendesk.com",
  "Intercom":         "intercom.com",
  "Slack":            "slack.com",
  "Notion":           "notion.so",
  "Airtable":         "airtable.com",
  "Google Ads":       "ads.google.com",
  "Facebook Ads":     "facebook.com",
  "Snowflake":        "snowflake.com",
  "BigQuery":         "cloud.google.com",
  "Klaviyo":          "klaviyo.com",
  "Amplitude":        "amplitude.com",
  "Auth0":            "auth0.com",
  "Pipedrive":        "pipedrive.com",
};

const INTEGRATION_FALLBACK: Record<string, { bg: string; text: string; initials: string }> = {
  "JavaScript": { bg: "#F7DF1E", text: "#000", initials: "JS" },
};

const CREATOR_COLORS: Record<string, string> = {
  "Rana V":       "#0080FF",
  "Somya Nayak":  "#8b5cf6",
  "Eric Gardner": "#16a34a",
};

function IntegrationLogo({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);
  const domain = INTEGRATION_DOMAIN[name];
  return (
    <span className="flex items-center gap-2">
      <span className="inline-flex w-6 h-6 rounded-md overflow-hidden shrink-0 bg-stone-100 dark:bg-white/8">
        {domain && !failed ? (
          <img
            src={BF(domain)}
            alt={name}
            width={24}
            height={24}
            className="w-full h-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className="w-full h-full flex items-center justify-center text-xs font-bold"
            style={INTEGRATION_FALLBACK[name]
              ? { background: INTEGRATION_FALLBACK[name].bg, color: INTEGRATION_FALLBACK[name].text }
              : { color: "#64748b" }}
          >
            {INTEGRATION_FALLBACK[name]?.initials ?? name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span>{name}</span>
    </span>
  );
}

function createdByCell(name: string): React.ReactNode {
  const color = CREATOR_COLORS[name] ?? "#64748b";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="flex items-center gap-2">
      <span
        className="inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: color }}
      >
        {initials}
      </span>
      <span>{name}</span>
    </span>
  );
}

const JS_SNIPPET = `<script>!function(w){if(w.intempt&&(w.intempt._isReal||w.intempt._isStub))return;var q=[],p=[],i=1;function e(m,a){q.push({method:m,args:a,timestamp:Date.now()})}function v(m){return function(){e(m,[].slice.call(arguments))}}function r(m,f){return function(){return e(m,[].slice.call(arguments)),f}}function n(){var a=[].slice.call(arguments),d=i++;e("recommendation",a);var s={id:d};return p.push(s),new Promise(function(t,c){s.resolve=t,s.reject=c})}w.intempt={_isStub:!0,_queue:q,_pendingPromises:p,getProfileId:r("getProfileId",void 0),optIn:v("optIn"),optOut:v("optOut"),isUserOptIn:r("isUserOptIn",!0),identify:v("identify"),group:v("group"),track:v("track"),record:v("record"),alias:v("alias"),consent:v("consent"),productAdd:v("productAdd"),productOrdered:v("productOrdered"),productView:v("productView"),logOut:v("logOut"),recommendation:n}}(window);</script>

<script async src="https://cdn.intempt.com/v1/intempt.min.js?organization=acme-corp&project=main-website&source=src_4a2f9c7e1b"></script>`;

const JS_PROJECT = "Main Website";
const JS_SOURCE_ID = "src_4a2f9c7e1b";

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        copied ? "text-emerald-500" : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
      } ${className}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function JsShelfContent() {
  return (
    <div className="flex flex-col gap-5 pb-5">
      {/* Snippet label — padded like the rest of sidebar */}
      <div className="px-7 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Snippet</p>
      </div>

      {/* Code block */}
      <div className="px-7">
        <CodeBlock code={JS_SNIPPET} language="html" />
      </div>

      {/* Meta fields */}
      <div className="px-7 space-y-3">
        <div>
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Project</p>
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{JS_PROJECT}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Source ID</p>
            <p className="text-sm font-mono font-medium text-stone-800 dark:text-stone-100">{JS_SOURCE_ID}</p>
          </div>
          <CopyButton text={JS_SOURCE_ID} />
        </div>
      </div>
    </div>
  );
}

function GenericConnShelfContent({ row }: { row: TableRow }) {
  return (
    <div className="px-5 pt-3 pb-5 space-y-3">
      {[
        { label: "Type",         value: row.cells.type },
        { label: "Status",       value: row.cells.status },
        { label: "Last Updated", value: row.cells.lastUpdated },
        { label: "Created By",   value: row.cells.createdBy },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center justify-between">
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wide">{label}</p>
          <div className="text-sm font-medium text-stone-800 dark:text-stone-100">
            {typeof value === "object" && value !== null && "label" in value && "tone" in value ? (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                (value as { tone: string }).tone === "green" ? "bg-emerald-100 text-emerald-700" :
                (value as { tone: string }).tone === "red" ? "bg-red-50 text-red-600" :
                "bg-stone-100 text-stone-600"
              }`}>
                {(value as { label: string }).label}
              </span>
            ) : typeof value === "object" && value !== null && "value" in value ? (
              String((value as { value: unknown }).value)
            ) : (
              String(value ?? "—")
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const CONNECTION_COLUMNS: TableColumn[] = [
  { key: "name",        label: "Name",         width: "16%" },
  { key: "integration", label: "Integration",  width: "20%" },
  { key: "type",        label: "Type",         width: "13%" },
  { key: "status",      label: "Status",       width: "14%" },
  { key: "lastUpdated", label: "Last Updated", width: "22%" },
  { key: "createdBy",   label: "Created By",   width: "15%" },
];

const CONNECTION_ROWS: TableRow[] = [
  { id: "js-sdk", cells: { name: "JavaScript",          integration: <IntegrationLogo name="JavaScript" />,        type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 17, 2026, 10:00 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c01",  cells: { name: "Salesforce CRM",        integration: <IntegrationLogo name="Salesforce" />,        type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 15, 2026, 09:14 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c02",  cells: { name: "HubSpot Marketing",     integration: <IntegrationLogo name="HubSpot" />,           type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 14, 2026, 03:42 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c03",  cells: { name: "Mailchimp Campaigns",   integration: <IntegrationLogo name="Mailchimp" />,         type: "Destination", status: { label: "Disconnected", tone: "gray"  }, lastUpdated: { value: "Jun 10, 2026, 11:30 AM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c04",  cells: { name: "SendGrid Transactional",integration: <IntegrationLogo name="SendGrid" />,          type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 16, 2026, 08:05 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c05",  cells: { name: "Segment Analytics",     integration: <IntegrationLogo name="Segment" />,           type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 16, 2026, 07:50 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c06",  cells: { name: "Mixpanel Product",      integration: <IntegrationLogo name="Mixpanel" />,          type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 13, 2026, 02:17 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c07",  cells: { name: "Google Analytics 4",    integration: <IntegrationLogo name="Google Analytics" />,  type: "Destination", status: { label: "Error",        tone: "red"   }, lastUpdated: { value: "Jun 16, 2026, 10:01 AM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c08",  cells: { name: "Stripe Payments",       integration: <IntegrationLogo name="Stripe" />,            type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 15, 2026, 06:33 PM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c09",  cells: { name: "Shopify Store",         integration: <IntegrationLogo name="Shopify" />,           type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 14, 2026, 01:22 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c10",  cells: { name: "WooCommerce Products",  integration: <IntegrationLogo name="WooCommerce" />,       type: "Source",      status: { label: "Disconnected", tone: "gray"  }, lastUpdated: { value: "May 28, 2026, 04:45 PM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c11",  cells: { name: "Zendesk Support",       integration: <IntegrationLogo name="Zendesk" />,           type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 12, 2026, 09:58 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c12",  cells: { name: "Intercom Messenger",    integration: <IntegrationLogo name="Intercom" />,          type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 11, 2026, 03:14 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c13",  cells: { name: "Slack Notifications",   integration: <IntegrationLogo name="Slack" />,             type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 16, 2026, 08:44 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c14",  cells: { name: "Notion Workspace",      integration: <IntegrationLogo name="Notion" />,            type: "Destination", status: { label: "Error",        tone: "red"   }, lastUpdated: { value: "Jun 01, 2026, 11:00 AM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c15",  cells: { name: "Airtable Data Sync",    integration: <IntegrationLogo name="Airtable" />,          type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 09, 2026, 05:30 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c16",  cells: { name: "Google Ads Campaigns",  integration: <IntegrationLogo name="Google Ads" />,        type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 15, 2026, 12:00 PM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c17",  cells: { name: "Meta Ads Manager",      integration: <IntegrationLogo name="Facebook Ads" />,      type: "Destination", status: { label: "Error",        tone: "red"   }, lastUpdated: { value: "Jun 16, 2026, 09:55 AM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c18",  cells: { name: "Snowflake Warehouse",   integration: <IntegrationLogo name="Snowflake" />,         type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 16, 2026, 02:30 AM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c19",  cells: { name: "BigQuery Export",       integration: <IntegrationLogo name="BigQuery" />,          type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 16, 2026, 03:00 AM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c20",  cells: { name: "Klaviyo Email Flows",   integration: <IntegrationLogo name="Klaviyo" />,           type: "Destination", status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 14, 2026, 07:20 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
  { id: "c21",  cells: { name: "Amplitude Events",      integration: <IntegrationLogo name="Amplitude" />,         type: "Destination", status: { label: "Disconnected", tone: "gray"  }, lastUpdated: { value: "May 30, 2026, 10:15 AM", muted: true }, createdBy: createdByCell("Eric Gardner") } },
  { id: "c22",  cells: { name: "Auth0 Identity",        integration: <IntegrationLogo name="Auth0" />,             type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 07, 2026, 04:00 PM", muted: true }, createdBy: createdByCell("Rana V") } },
  { id: "c23",  cells: { name: "Pipedrive Pipeline",    integration: <IntegrationLogo name="Pipedrive" />,         type: "Source",      status: { label: "Connected",    tone: "green" }, lastUpdated: { value: "Jun 13, 2026, 01:45 PM", muted: true }, createdBy: createdByCell("Somya Nayak") } },
];

const API_KEY_COLUMNS: TableColumn[] = [
  { key: "name",     label: "Name",     width: "28%" },
  { key: "key",      label: "Key",      width: "34%" },
  { key: "modified", label: "Modified", width: "20%" },
  { key: "labels",   label: "Labels",   width: "18%" },
];

const INITIAL_API_KEYS: TableRow[] = [
  {
    id: "1",
    cells: {
      name:     "1756039631343251456",
      key:      "a37729af45b0430f9d0d21a2979331c2.1ce99933b19649f297b8cf2a45473dc5",
      modified: "Apr 16, 2026",
      labels:   "Full access",
    },
  },
];

const domainSections = [
  {
    title: "Booking",
    description: "Custom domain for team booking pages.",
    empty: "No org domains enabled for booking.",
    icon: <CalendarDays size={17} />,
  },
  {
    title: "Tracking",
    description: "Custom domain for click and open tracking links in emails.",
    empty: "No org domains enabled for tracking.",
    icon: <MousePointer2 size={17} />,
  },
  {
    title: "Privacy center",
    description: "Custom domain for the privacy and preference center page.",
    empty: "No org domains enabled for privacy center.",
    icon: <ShieldCheck size={17} />,
  },
  {
    title: "Sending domain & email addresses",
    description: "Pick a verified org sending domain, then add the per-project email addresses your project sends from.",
    empty: "No sending domain at the org level yet.",
    icon: <Mail size={17} />,
  },
];

export default function ConnectionsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "connections";
  const [addOpen, setAddOpen] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);

  // Connection rows state
  const [connRows, setConnRows] = useState<TableRow[]>(CONNECTION_ROWS);
  const [renamingConnId, setRenamingConnId] = useState<string | null>(null);
  const [renameConnValue, setRenameConnValue] = useState("");
  const commitConnRef = useRef(false);
  const [deleteConnTarget, setDeleteConnTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteKeyTarget, setDeleteKeyTarget] = useState<{ id: string; name: string } | null>(null);

  function startRenameConn(row: TableRow) {
    commitConnRef.current = false;
    setRenamingConnId(row.id);
    setRenameConnValue(String(row.cells.name));
  }

  function commitRenameConn(id: string, value: string) {
    if (commitConnRef.current) return;
    commitConnRef.current = true;
    setConnRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, cells: { ...r.cells, name: value.trim() || r.cells.name } } : r)
    );
    setRenamingConnId(null);
  }

  function makeConnMenuItems(row: TableRow) {
    return [
      { label: "Rename", icon: Pencil, onClick: () => startRenameConn(row) },
      { label: "Delete", icon: Trash2, tone: "danger" as const, onClick: () => setDeleteConnTarget({ id: row.id, name: String(row.cells.name) }) },
    ];
  }

  const displayConnRows: TableRow[] = connRows.map((row) => ({
    ...row,
    menuItems: makeConnMenuItems(row),
    cells: {
      ...row.cells,
      name: renamingConnId === row.id ? (
        <input
          autoFocus
          value={renameConnValue}
          onChange={(e) => setRenameConnValue(e.target.value)}
          onBlur={() => commitRenameConn(row.id, renameConnValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.currentTarget.blur(); }
            if (e.key === "Escape") { commitConnRef.current = true; setRenamingConnId(null); }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm font-medium text-stone-900 outline-none ring-2 ring-blue-500/10 dark:bg-(--raised) dark:text-stone-100"
        />
      ) : row.cells.name,
    },
  }));

  // API key rows state
  const [apiKeyRows, setApiKeyRows] = useState<TableRow[]>(INITIAL_API_KEYS);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const commitRef = useRef(false);

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    navigate(`?${params.toString()}`, { replace: true });
  }

  function startRename(row: TableRow) {
    commitRef.current = false;
    setRenamingId(row.id);
    setRenameValue(String(row.cells.name));
  }

  function commitRename(id: string, value: string) {
    if (commitRef.current) return;
    commitRef.current = true;
    setApiKeyRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, cells: { ...r.cells, name: value.trim() || r.cells.name } } : r)
    );
    setRenamingId(null);
  }

  function makeMenuItems(row: TableRow) {
    return [
      { label: "Rename",     icon: Pencil,    onClick: () => startRename(row) },
      { label: "Copy",       icon: Copy,      onClick: () => navigator.clipboard.writeText(String(row.cells.key)) },
      { label: "Regenerate", icon: RefreshCw },
      { label: "Delete",     icon: Trash2,    tone: "danger" as const, onClick: () => setDeleteKeyTarget({ id: row.id, name: String(row.cells.name) }) },
    ];
  }

  const displayRows: TableRow[] = apiKeyRows.map((row) => ({
    ...row,
    menuItems: makeMenuItems(row),
    cells: {
      ...row.cells,
      name: renamingId === row.id ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={() => commitRename(row.id, renameValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.currentTarget.blur(); }
            if (e.key === "Escape") { commitRef.current = true; setRenamingId(null); }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded border border-blue-400 bg-white px-2 py-1 text-sm font-medium text-stone-900 outline-none ring-2 ring-blue-500/10 dark:bg-(--raised) dark:text-stone-100"
        />
      ) : row.cells.name,
    },
  }));

  return (
    <div className="relative flex flex-1 flex-col min-h-0">
      <ViewTabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <div key={tab} className="flex-1 min-h-0 flex flex-col px-4 pb-4 pt-4 animate-fade-up">
        {tab === "connections" ? (
          <DashboardTable
            columns={CONNECTION_COLUMNS}
            rows={displayConnRows}
            searchPlaceholder="Search connections..."
            onRowClick={(row) => setSelectedConnId(row.id)}
            action={
              <button
                onClick={() => setAddOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 h-9 text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                Add Integration
              </button>
            }
          />
        ) : tab === "api-keys" ? (
          <DashboardTable
            columns={API_KEY_COLUMNS}
            rows={displayRows}
            searchPlaceholder="Search API keys..."
            emptyState={
              <span>No API keys yet. Create a key to start authenticating requests.</span>
            }
            action={
              <button
                onClick={() => setCreateKeyOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 h-9 text-xs font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                <Plus size={14} />
                Create key
              </button>
            }
          />
        ) : (
          <div className="min-h-0 overflow-y-auto pb-2">
            <div className="max-w-6xl">
              <div className="mb-8 flex items-start gap-3 text-sm leading-6 text-stone-500 dark:text-stone-400">
                <Info size={17} className="mt-0.5 shrink-0 text-stone-500 dark:text-stone-400" />
                <p>Root domains are added and DNS-verified once at the organization level. Each project picks which verified domain to use here.</p>
              </div>

              <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
                {domainSections.map((section) => (
                  <section key={section.title} className="min-h-35.5 px-1">
                    <div className="mb-2 flex items-center gap-2.5 text-stone-950 dark:text-stone-50">
                      {section.icon}
                      <h3 className="text-base font-semibold">{section.title}</h3>
                    </div>
                    <p className="text-sm leading-6 text-stone-500 dark:text-stone-400">{section.description}</p>
                    <p className="mt-5 text-sm font-medium text-stone-500 dark:text-stone-400">{section.empty}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedConnId && (() => {
        const row = connRows.find((r) => r.id === selectedConnId);
        if (!row) return null;
        const name = String(row.cells.name);
        return (
          <SlidingSidebar
            title={
              <span className="flex items-center gap-2">
                <span className="inline-flex w-6 h-6 rounded-md overflow-hidden shrink-0">
                  {row.cells.integration as React.ReactNode}
                </span>
                {name}
              </span>
            }
            onClose={() => setSelectedConnId(null)}
            contentClassName={selectedConnId === "js-sdk" ? "overflow-y-auto pb-5" : undefined}
          >
            {selectedConnId === "js-sdk" ? (
              <JsShelfContent />
            ) : (
              <GenericConnShelfContent row={row} />
            )}
          </SlidingSidebar>
        );
      })()}

      {addOpen && <AddIntegrationDrawer onClose={() => setAddOpen(false)} />}
      {createKeyOpen && (
        <CreateApiKeyDrawer
          onClose={() => setCreateKeyOpen(false)}
          onCreate={(row) => setApiKeyRows((prev) => [...prev, row])}
        />
      )}
      {deleteConnTarget && (
        <DeleteConfirmDialog
          entityType="integration"
          entityName={deleteConnTarget.name}
          onConfirm={() => {
            setConnRows((prev) => prev.filter((r) => r.id !== deleteConnTarget.id));
            setDeleteConnTarget(null);
          }}
          onClose={() => setDeleteConnTarget(null)}
        />
      )}
      {deleteKeyTarget && (
        <DeleteConfirmDialog
          entityType="API key"
          entityName={deleteKeyTarget.name}
          onConfirm={() => {
            setApiKeyRows((prev) => prev.filter((r) => r.id !== deleteKeyTarget.id));
            setDeleteKeyTarget(null);
          }}
          onClose={() => setDeleteKeyTarget(null)}
        />
      )}
    </div>
  );
}
