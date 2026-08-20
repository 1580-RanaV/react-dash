

import { useState } from "react";
import {
  ChevronDown, ChevronRight, ChevronLeft, Mail, Phone, Puzzle, Check,
  ArrowDown, ArrowRight, ArrowUp, Building2, Handshake, Users, Calendar,
  Type, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, Image as ImageIcon,
} from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";
import DueDateField from "./DueDateField";
import InfoTooltip from "./InfoTooltip";

// ── static data ───────────────────────────────────────────────────────────────

function LinkedinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export const TASK_TYPES = [
  { key: "Email",    icon: <Mail size={13} /> },
  { key: "LinkedIn", icon: <LinkedinIcon size={13} /> },
  { key: "Call",     icon: <Phone size={13} /> },
  { key: "Custom",   icon: <Puzzle size={13} /> },
] as const;

export const PRIORITIES = [
  { key: "High",   icon: <ArrowUp size={13} /> },
  { key: "Medium", icon: <ArrowRight size={13} /> },
  { key: "Low",    icon: <ArrowDown size={13} /> },
] as const;

export const ASSOCIATE_CATEGORIES = [
  { key: "accounts", label: "Accounts", icon: <Building2 size={14} /> },
  { key: "users",    label: "Users",    icon: <Users size={14} /> },
  { key: "deals",    label: "Deals",    icon: <Handshake size={14} /> },
  { key: "calls",    label: "Calls",    icon: <Phone size={14} /> },
  { key: "meetings", label: "Meetings", icon: <Calendar size={14} /> },
  { key: "emails",   label: "Emails",   icon: <Mail size={14} /> },
] as const;

export const ASSOCIATE_RECORDS_BY_CATEGORY: Record<string, { key: string; label: string }[]> = {
  accounts: [
    { key: "acme",     label: "Acme Corp" },
    { key: "globex",   label: "Globex Inc." },
    { key: "initech",  label: "Initech LLC" },
    { key: "umbrella", label: "Umbrella Corp" },
  ],
  users: [
    { key: "sandra-jackson", label: "Sandra Jackson" },
    { key: "ashton-summers", label: "Ashton Summers" },
    { key: "walter-scott",   label: "Walter Scott" },
    { key: "james-mitchell", label: "James Mitchell" },
  ],
  deals: [
    { key: "acme-deal",    label: "Acme Corp — Enterprise Plan" },
    { key: "globex-deal",  label: "Globex — Growth Subscription" },
    { key: "initech-deal", label: "Initech — Starter Onboarding" },
  ],
  calls: [
    { key: "call-1", label: "Discovery call — Jun 12" },
    { key: "call-2", label: "Demo call — Jun 18" },
    { key: "call-3", label: "Renewal call — Jul 2" },
  ],
  meetings: [
    { key: "meeting-1", label: "R&D Check-in" },
    { key: "meeting-2", label: "Quarterly review — Jul 2" },
    { key: "meeting-3", label: "Kickoff — Jul 5" },
    { key: "meeting-4", label: "Executive business review" },
  ],
  emails: [
    { key: "email-1", label: "Welcome email — sent Jun 1" },
    { key: "email-2", label: "Follow-up — sent Jun 10" },
    { key: "email-3", label: "Renewal reminder — sent Jun 20" },
  ],
};

const ASSIGNEES = [
  { key: "Sally Spaghetti", initial: "SS", color: "#6366F1" },
  { key: "Rohan",           initial: "R",  color: "#8B5CF6" },
  { key: "Somya Nayak",     initial: "S",  color: "#0D9488" },
  { key: "Sid Chaudhary",   initial: "S",  color: "#0D9488" },
];

const FROM_OPTIONS = ["sally@piedpiper.com", "hello@piedpiper.com"];

const BF = (domain: string) => `https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`;

// Connected email-sending integrations — mirrors ConnectionsView's "Active" destinations
const EMAIL_DESTINATIONS = [
  { key: "SendGrid", domain: "sendgrid.com" },
  { key: "Klaviyo",  domain: "klaviyo.com" },
  { key: "Gmail",    domain: "gmail.com" },
] as const;

const TIME_OPTIONS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
];

// ── small building blocks ─────────────────────────────────────────────────────

function FieldLabel({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300">
      {children}
      {tooltip && <InfoTooltip content={tooltip} maxWidth="max-w-64" />}
    </p>
  );
}

function DropdownShell({
  open, onToggle, display, placeholder, panel,
}: {
  open: boolean;
  onToggle: () => void;
  display?: React.ReactNode;
  placeholder: string;
  panel: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm font-medium outline-none transition-colors border-stone-200 bg-white hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:hover:bg-white/6"
      >
        <span className={`flex min-w-0 items-center gap-2 truncate ${display ? "text-stone-900 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`}>
          {display ?? placeholder}
        </span>
        <ChevronDown size={13} className="shrink-0 text-stone-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl shadow-xl animate-card-in"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
        >
          {panel}
        </div>
      )}
    </div>
  );
}

function DestinationLogo({ domain, name, size = 16 }: { domain: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded" style={{ width: size, height: size, background: "var(--muted)" }}>
      {!failed ? (
        <img src={BF(domain)} alt={name} width={size} height={size} className="h-full w-full object-contain" onError={() => setFailed(true)} />
      ) : (
        <span className="text-[9px] font-bold text-stone-500">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

export function OptionRow({ active, onClick, showCheck, children }: { active?: boolean; onClick: () => void; showCheck?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
        active
          ? "bg-stone-100 font-semibold text-stone-900 dark:bg-white/8 dark:text-stone-100"
          : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
      }`}
    >
      {showCheck && (
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          {active && <Check size={13} />}
        </span>
      )}
      {children}
    </button>
  );
}

function ToolbarIconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-stone-100"
    >
      {children}
    </button>
  );
}

function RichTextField({ label, placeholder, tooltip, rows = 3 }: { label: string; placeholder: string; tooltip?: string; rows?: number }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div>
      <FieldLabel tooltip={tooltip}>{label}</FieldLabel>
      <div className="overflow-hidden rounded-lg border border-stone-200 dark:border-(--border)">
        <textarea
          rows={rows}
          placeholder={placeholder}
          className="block w-full resize-none bg-transparent px-3 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
        />
        <div className="flex flex-col gap-1.5 border-t px-2.5 py-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" className="flex h-6.5 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">
              Sans serif
              <ChevronDown size={11} />
            </button>
            <button type="button" className="flex h-6.5 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">
              <Type size={12} />
              <ChevronDown size={11} />
            </button>
            <span className="mx-1 h-3.75 w-3.75 shrink-0 rounded-sm bg-stone-900 dark:bg-white" />
            <ToolbarIconButton><Bold size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Italic size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Underline size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Strikethrough size={13} /></ToolbarIconButton>
            <ToolbarIconButton><List size={13} /></ToolbarIconButton>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarIconButton><ListOrdered size={13} /></ToolbarIconButton>
            <ToolbarIconButton><AlignLeft size={13} /></ToolbarIconButton>
            <ToolbarIconButton><AlignCenter size={13} /></ToolbarIconButton>
            <ToolbarIconButton><AlignRight size={13} /></ToolbarIconButton>
            <ToolbarIconButton><AlignJustify size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Link size={13} /></ToolbarIconButton>
            <ToolbarIconButton><ImageIcon size={13} /></ToolbarIconButton>
            <button type="button" className="flex h-6.5 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">
              Add variable
              <ChevronDown size={11} />
            </button>
          </div>
        </div>
      </div>
      <div className="relative mt-2.5 inline-block">
        <button
          type="button"
          onClick={() => setAiOpen((o) => !o)}
          className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
          style={{ border: "1px solid var(--border)" }}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,128,255,0.12)" }}>
            <img src="/mascot.png" alt="" width={11} height={11} className="object-contain" />
          </span>
          Blu rewrite
          <ChevronDown size={11} className={`transition-transform ${aiOpen ? "rotate-180" : ""}`} />
        </button>

        {aiOpen && (
          <div
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-56 overflow-hidden rounded-xl py-1 animate-card-in"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
          >
            <p className="px-3 pb-1 pt-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500">AI Assistant</p>
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="flex w-full items-center gap-2 bg-stone-50 px-3 py-2 text-left text-sm font-medium text-stone-900 dark:bg-white/6 dark:text-stone-100"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,128,255,0.12)" }}>
                <img src="/mascot.png" alt="" width={10} height={10} className="object-contain" />
              </span>
              Improve writing
            </button>
            <button type="button" onClick={() => setAiOpen(false)} className="block w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6">
              Make shorter
            </button>
            <button type="button" onClick={() => setAiOpen(false)} className="block w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6">
              Make longer
            </button>
            <button type="button" onClick={() => setAiOpen(false)} className="block w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6">
              Fix grammar
            </button>
            <button type="button" onClick={() => setAiOpen(false)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6">
              Change tone
              <ChevronRight size={13} className="text-stone-400" />
            </button>
            <button type="button" onClick={() => setAiOpen(false)} className="block w-full px-3 py-2 text-left text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6">
              Summarize
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── view ──────────────────────────────────────────────────────────────────────

export default function CreateTaskDrawer({ onClose }: { onClose: () => void }) {
  const [taskName, setTaskName] = useState("");
  const [taskNameError, setTaskNameError] = useState<string | undefined>();

  const [taskType, setTaskType] = useState<typeof TASK_TYPES[number]["key"]>("Email");
  const [priority, setPriority] = useState<typeof PRIORITIES[number]["key"]>("Medium");
  const [associated, setAssociated] = useState<string[]>([]);
  const [associateCategory, setAssociateCategory] = useState<string | null>(null);
  const [assignee, setAssignee] = useState("Sally Spaghetti");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("9:00 AM");
  const [subject, setSubject] = useState("");
  const [destination, setDestination] = useState<typeof EMAIL_DESTINATIONS[number]["key"]>("SendGrid");
  const [from, setFrom] = useState(FROM_OPTIONS[0]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [openField, setOpenField] = useState<string | null>(null);
  function toggle(field: string) {
    setOpenField((current) => (current === field ? null : field));
  }

  const activeType = TASK_TYPES.find((t) => t.key === taskType)!;
  const activePriority = PRIORITIES.find((p) => p.key === priority)!;
  const activeAssignee = ASSIGNEES.find((a) => a.key === assignee)!;
  const activeDestination = EMAIL_DESTINATIONS.find((d) => d.key === destination)!;

  function handleSave(close: () => void) {
    if (!taskName.trim()) {
      setTaskNameError("Task name is required");
      return;
    }
    close();
  }

  return (
    <SlidingSidebar
      title="Create Task"
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(close)}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Save
          </button>
        </>
      )}
    >
      <div className="space-y-5">
        <div>
          <FieldLabel>Task name</FieldLabel>
          <input
            value={taskName}
            onChange={(e) => { setTaskName(e.target.value); if (taskNameError) setTaskNameError(undefined); }}
            placeholder="e.g., Follow up on renewal terms"
            className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 ${
              taskNameError
                ? "border-rose-400 bg-rose-50/50 dark:border-rose-500/60 dark:bg-rose-500/5"
                : "border-stone-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:focus:border-stone-500"
            }`}
          />
          {taskNameError && <p className="mt-1 text-xs font-medium text-rose-500">{taskNameError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Task type</FieldLabel>
            <DropdownShell
              open={openField === "type"}
              onToggle={() => toggle("type")}
              placeholder="Select type..."
              display={
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 dark:bg-white/8 dark:text-stone-300">
                  {activeType.icon}
                  {activeType.key}
                </span>
              }
              panel={TASK_TYPES.map((t) => (
                <OptionRow key={t.key} active={t.key === taskType} showCheck onClick={() => { setTaskType(t.key); setOpenField(null); }}>
                  {t.icon}
                  {t.key}
                </OptionRow>
              ))}
            />
          </div>
          <div>
            <FieldLabel>Priority</FieldLabel>
            <DropdownShell
              open={openField === "priority"}
              onToggle={() => toggle("priority")}
              placeholder="Select priority..."
              display={<>{activePriority.icon}{activePriority.key}</>}
              panel={PRIORITIES.map((p) => (
                <OptionRow key={p.key} active={p.key === priority} showCheck onClick={() => { setPriority(p.key); setOpenField(null); }}>
                  {p.icon}
                  {p.key}
                </OptionRow>
              ))}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Associate</FieldLabel>
          <DropdownShell
            open={openField === "associate"}
            onToggle={() => {
              setOpenField((current) => {
                const next = current === "associate" ? null : "associate";
                if (next === "associate") setAssociateCategory(null);
                return next;
              });
            }}
            placeholder="Associated with 0 records"
            display={associated.length ? `Associated with ${associated.length} record${associated.length === 1 ? "" : "s"}` : undefined}
            panel={
              associateCategory === null ? (
                <>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold text-stone-400 dark:text-stone-500">Select object type</p>
                  {ASSOCIATE_CATEGORIES.map((cat) => (
                    <OptionRow key={cat.key} onClick={() => setAssociateCategory(cat.key)}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">{cat.icon}</span>
                      {cat.label}
                    </OptionRow>
                  ))}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onMouseDown={() => setAssociateCategory(null)}
                    className="flex w-full items-center gap-1.5 border-b px-3 py-2 text-left text-xs font-semibold text-stone-400 transition-colors hover:text-stone-600 dark:border-(--border) dark:text-stone-500 dark:hover:text-stone-300"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <ChevronLeft size={12} />
                    {ASSOCIATE_CATEGORIES.find((c) => c.key === associateCategory)?.label}
                  </button>
                  {(ASSOCIATE_RECORDS_BY_CATEGORY[associateCategory] ?? []).map((r) => {
                    const compoundKey = `${associateCategory}:${r.key}`;
                    const active = associated.includes(compoundKey);
                    return (
                      <OptionRow
                        key={r.key}
                        onClick={() => setAssociated((prev) => active ? prev.filter((k) => k !== compoundKey) : [...prev, compoundKey])}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                          {active && <svg width="9" height="9" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{r.label}</span>
                      </OptionRow>
                    );
                  })}
                </>
              )
            }
          />
        </div>

        <div>
          <FieldLabel>Assign to</FieldLabel>
          <DropdownShell
            open={openField === "assignee"}
            onToggle={() => toggle("assignee")}
            placeholder="Select assignee..."
            display={
              <>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: activeAssignee.color }}>
                  {activeAssignee.initial}
                </span>
                {activeAssignee.key}
              </>
            }
            panel={ASSIGNEES.map((a) => (
              <OptionRow key={a.key} active={a.key === assignee} onClick={() => { setAssignee(a.key); setOpenField(null); }}>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ background: a.color }}>
                  {a.initial}
                </span>
                {a.key}
              </OptionRow>
            ))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Due date</FieldLabel>
            <DueDateField onChange={setDueDate} />
          </div>
          <div>
            <FieldLabel>&nbsp;</FieldLabel>
            <DropdownShell
              open={openField === "time"}
              onToggle={() => toggle("time")}
              placeholder="Select time..."
              display={dueTime}
              panel={
                <div className="max-h-52 overflow-y-auto">
                  {TIME_OPTIONS.map((t) => (
                    <OptionRow key={t} active={t === dueTime} onClick={() => { setDueTime(t); setOpenField(null); }}>
                      {t}
                    </OptionRow>
                  ))}
                </div>
              }
            />
          </div>
        </div>

        {taskType === "Email" && (
          <>
            <div>
              <FieldLabel>Subject</FieldLabel>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line..."
                className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </div>

            <div>
              <FieldLabel>Destination</FieldLabel>
              <DropdownShell
                open={openField === "destination"}
                onToggle={() => toggle("destination")}
                placeholder="Select destination..."
                display={<><DestinationLogo domain={activeDestination.domain} name={activeDestination.key} />{activeDestination.key}</>}
                panel={EMAIL_DESTINATIONS.map((d) => (
                  <OptionRow key={d.key} active={d.key === destination} showCheck onClick={() => { setDestination(d.key); setOpenField(null); }}>
                    <DestinationLogo domain={d.domain} name={d.key} />
                    {d.key}
                  </OptionRow>
                ))}
              />
            </div>

            <div>
              <FieldLabel>From</FieldLabel>
              <DropdownShell
                open={openField === "from"}
                onToggle={() => toggle("from")}
                placeholder="Select sender..."
                display={from}
                panel={FROM_OPTIONS.map((f) => (
                  <OptionRow key={f} active={f === from} onClick={() => { setFrom(f); setOpenField(null); }}>
                    {f}
                  </OptionRow>
                ))}
              />
              <div className="mt-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCc((v) => !v)}
                  className={`h-7 rounded-lg px-2.5 text-xs font-medium transition-colors duration-100 ${
                    showCc
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/6 dark:hover:text-stone-200"
                  }`}
                >
                  Cc
                </button>
                <button
                  type="button"
                  onClick={() => setShowBcc((v) => !v)}
                  className={`h-7 rounded-lg px-2.5 text-xs font-medium transition-colors duration-100 ${
                    showBcc
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-white/6 dark:hover:text-stone-200"
                  }`}
                >
                  Bcc
                </button>
              </div>
              {showCc && (
                <div className="mt-3">
                  <FieldLabel>Cc</FieldLabel>
                  <input
                    placeholder="cc@example.com"
                    className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100"
                  />
                </div>
              )}
              {showBcc && (
                <div className="mt-3">
                  <FieldLabel>Bcc</FieldLabel>
                  <input
                    placeholder="bcc@example.com"
                    className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100"
                  />
                </div>
              )}
            </div>

            <RichTextField
              label="Email body"
              placeholder="Write your email..."
              rows={4}
              tooltip="Basically writes the mail contents."
            />
            <RichTextField
              label="Description (optional)"
              placeholder="Add internal notes about this task..."
              tooltip="Is the context behind the task. For custom events you can basically just store the context behind the task — you cannot actually perform an action using the tasks product."
            />
          </>
        )}
      </div>
    </SlidingSidebar>
  );
}
