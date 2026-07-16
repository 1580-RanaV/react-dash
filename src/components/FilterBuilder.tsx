
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, Plus, Search, Shield, Trash2, User, Zap } from "lucide-react";
import { TableRowsSplit } from "lucide-react";

// ── types ─────────────────────────────────────────────────────────────────────

type Category = "Events" | "Segments" | "Consents" | "Attributes";

type FieldOption = {
  id: string;
  label: string;
  category: Category;
  icon?: React.ReactNode;
};

type FilterRowState = {
  id: string;
  field: FieldOption | null;
  operator: string;
};

type FilterGroupState = {
  id: string;
  rows: FilterRowState[];
  autoOpen?: boolean;
};

// ── static data ───────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["Events", "Segments", "Consents", "Attributes"];

const zapIcon    = <Zap size={13} className="text-amber-500" />;
const segIcon    = <TableRowsSplit size={13} className="text-blue-500" />;
const shieldIcon = <Shield size={13} className="text-emerald-500" />;
const userIcon   = <User size={13} className="text-stone-400 dark:text-stone-500" />;

const ALL_FIELDS: FieldOption[] = [
  { id: "meeting_clip_shared",               label: "meeting_clip_shared",               category: "Events",     icon: zapIcon },
  { id: "personalization_created",           label: "personalization_created",           category: "Events",     icon: zapIcon },
  { id: "community_signup_started",          label: "community_signup_started",          category: "Events",     icon: zapIcon },
  { id: "community_application_submitted",   label: "community_application_submitted",   category: "Events",     icon: zapIcon },
  { id: "community_linkedin_submitted",      label: "community_linkedin_submitted",      category: "Events",     icon: zapIcon },
  { id: "demo_page_viewed",                  label: "demo_page_viewed",                  category: "Events",     icon: zapIcon },
  { id: "demo_booking_started",              label: "demo_booking_started",              category: "Events",     icon: zapIcon },
  { id: "availability_rules_set",            label: "availability_rules_set",            category: "Events",     icon: zapIcon },
  { id: "seg_all",                           label: "All users",                         category: "Segments",   icon: segIcon },
  { id: "seg_list1",                         label: "List 1",                            category: "Segments",   icon: segIcon },
  { id: "seg_beso",                          label: "Jsut Beso test",                    category: "Segments",   icon: segIcon },
  { id: "seg_allcopy",                       label: "All users copy",                    category: "Segments",   icon: segIcon },
  { id: "seg_list1copy",                     label: "List 1 copy",                       category: "Segments",   icon: segIcon },
  { id: "consent_marketing",                 label: "Marketing emails",                  category: "Consents",   icon: shieldIcon },
  { id: "consent_analytics",                 label: "Analytics tracking",                category: "Consents",   icon: shieldIcon },
  { id: "consent_thirdparty",               label: "Third-party sharing",               category: "Consents",   icon: shieldIcon },
  { id: "attr_name",                         label: "Name",                              category: "Attributes", icon: userIcon },
  { id: "attr_email",                        label: "Email",                             category: "Attributes", icon: userIcon },
  { id: "attr_account",                      label: "Account name",                      category: "Attributes", icon: userIcon },
  { id: "attr_title",                        label: "Job title",                         category: "Attributes", icon: userIcon },
  { id: "attr_tags",                         label: "Tags",                              category: "Attributes", icon: userIcon },
  { id: "attr_created",                      label: "Created at",                        category: "Attributes", icon: userIcon },
  { id: "attr_lastseen",                     label: "Last seen",                         category: "Attributes", icon: userIcon },
];

const OPERATORS = ["is", "is not", "contains", "does not contain", "is empty", "is not empty"];

// ── helpers ───────────────────────────────────────────────────────────────────

let _uid = 0;
function uid() { return String(++_uid); }
function newRow(): FilterRowState { return { id: uid(), field: null, operator: "is" }; }
function newGroup(autoOpen = false): FilterGroupState { return { id: uid(), rows: [newRow()], autoOpen }; }

// ── FieldPicker ───────────────────────────────────────────────────────────────

function FieldPicker({ value, onChange, autoOpen = false }: {
  value: FieldOption | null;
  onChange: (f: FieldOption) => void;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("Events");
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function openDropdown() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: 300,
        zIndex: 9999,
      });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (autoOpen) requestAnimationFrame(openDropdown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
      setQuery("");
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = ALL_FIELDS.filter(
    (f) => f.category === category && f.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openDropdown()}
        className="flex h-9 min-w-44 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors bg-white hover:bg-stone-50 dark:bg-(--muted) dark:hover:bg-white/6"
        style={{ borderColor: "var(--border)" }}
      >
        {value ? (
          <>
            <span className="shrink-0">{value.icon}</span>
            <span className="truncate text-stone-700 dark:text-stone-300">{value.label}</span>
          </>
        ) : (
          <span className="text-stone-400 dark:text-stone-500">Select</span>
        )}
        <ChevronDown size={12} className="ml-auto shrink-0 text-stone-400" />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="rounded-xl overflow-hidden animate-card-in"
          style={{
            ...dropStyle,
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)",
          }}
        >
          {/* Search */}
          <div className="p-2.5">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or describe a filter..."
                className="h-9 w-full rounded-lg border bg-stone-50 pl-8 pr-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:bg-white/4 dark:text-stone-200 dark:border-(--border) dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          {/* Category row */}
          <div className="flex items-center gap-2 px-3 pb-2.5 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs text-stone-400 dark:text-stone-500 shrink-0">Filter by</span>
            <div className="flex gap-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors
                    ${category === cat
                      ? "bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-stone-100"
                      : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="max-h-56 overflow-y-auto py-1.5">
            <p className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {category}
            </p>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-stone-400 dark:text-stone-500">No results</p>
            ) : (
              filtered.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { onChange(f); setOpen(false); setQuery(""); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-stone-700 dark:text-stone-300 transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
                >
                  <span className="shrink-0">{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── OperatorPicker ────────────────────────────────────────────────────────────

function OperatorPicker({ value, onChange }: { value: string; onChange: (op: string) => void }) {
  const [open, setOpen] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  function openDropdown() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropStyle({ position: "fixed", top: rect.bottom + 6, left: rect.left, width: 176, zIndex: 9999 });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => open ? setOpen(false) : openDropdown()}
        className="flex h-9 min-w-28 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium text-stone-600 transition-colors bg-white hover:bg-stone-50 dark:bg-(--muted) dark:text-stone-300 dark:hover:bg-white/6"
        style={{ borderColor: "var(--border)" }}
      >
        <span>{value}</span>
        <ChevronDown size={12} className="ml-auto shrink-0 text-stone-400" />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="rounded-xl overflow-hidden animate-card-in"
          style={{
            ...dropStyle,
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)",
          }}
        >
          <div className="py-1.5">
            {OPERATORS.map((op) => (
              <button
                key={op}
                onClick={() => { onChange(op); setOpen(false); }}
                className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors
                  ${op === value
                    ? "bg-stone-50 dark:bg-white/6 text-stone-900 dark:text-stone-100 font-medium"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5"
                  }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── FilterBuilder ─────────────────────────────────────────────────────────────

export default function FilterBuilder() {
  const [groups, setGroups] = useState<FilterGroupState[]>([newGroup()]);

  function updateRow(groupId: string, rowId: string, patch: Partial<FilterRowState>) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? { ...g, rows: g.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)) }
          : g
      )
    );
  }

  function addRow(groupId: string) {
    setGroups((gs) =>
      gs.map((g) => g.id === groupId ? { ...g, rows: [...g.rows, newRow()] } : g)
    );
  }

  function deleteRow(groupId: string, rowId: string) {
    setGroups((gs) =>
      gs
        .map((g) => g.id === groupId ? { ...g, rows: g.rows.filter((r) => r.id !== rowId) } : g)
        .filter((g) => g.rows.length > 0)
    );
  }

  function duplicateRow(groupId: string, rowId: string) {
    setGroups((gs) =>
      gs.map((g) => {
        if (g.id !== groupId) return g;
        const idx = g.rows.findIndex((r) => r.id === rowId);
        if (idx === -1) return g;
        const copy = { ...g.rows[idx], id: uid() };
        const rows = [...g.rows];
        rows.splice(idx + 1, 0, copy);
        return { ...g, rows };
      })
    );
  }

  function addGroup() {
    setGroups((gs) => [...gs, newGroup(true)]);
  }

  return (
    <div className="space-y-2 pb-1">
      {groups.map((group) => (
        <div
          key={group.id}
          className="rounded-xl border"
          style={{ background: "var(--content-bg)", borderColor: "var(--border)" }}
        >
          <div className="flex">
            <div className="w-1 shrink-0 bg-blue-400 dark:bg-blue-500 rounded-l-xl" />
            <div className="flex-1 px-3 py-3 space-y-2">
              {group.rows.map((row, ri) => (
                <div key={row.id} className="flex items-center gap-2 flex-wrap">
                  <FieldPicker
                    value={row.field}
                    onChange={(f) => updateRow(group.id, row.id, { field: f })}
                    autoOpen={!!group.autoOpen && ri === 0}
                  />
                  <OperatorPicker
                    value={row.operator}
                    onChange={(op) => updateRow(group.id, row.id, { operator: op })}
                  />
                  <div className="flex items-center gap-0.5 ml-auto">
                    <button
                      onClick={() => duplicateRow(group.id, row.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-300"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => deleteRow(group.id, row.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addRow(group.id)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:text-stone-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
                style={{ borderColor: "var(--border)" }}
              >
                <Plus size={13} />
                Add filter
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center pt-0.5">
        <button
          onClick={addGroup}
          className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:text-stone-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus size={13} />
          Add group
        </button>
      </div>
    </div>
  );
}
