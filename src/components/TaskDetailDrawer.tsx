

import { useState } from "react";
import { ChevronDown, ChevronLeft, Clock, Plus, Trash2, Bold, Italic, Link as LinkIcon, Paperclip, FileText, X, Check, RotateCcw } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";
import { OptionRow, PRIORITIES, ASSOCIATE_CATEGORIES, ASSOCIATE_RECORDS_BY_CATEGORY } from "./CreateTaskDrawer";
import { TypeBadge, StatusBadge, type TaskRecord, type Priority, type Status, type TaskType } from "./taskShared";

// ── static data ───────────────────────────────────────────────────────────────

const TASK_TYPE_KEYS: TaskType[] = ["Email", "LinkedIn", "Call", "Custom"];
const STATUS_KEYS: Status[] = ["Open", "Completed"];

const STATUS_TONE: Record<Status, string> = {
  Open: "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
  Completed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
};

const ASSIGNEE_POOL = [
  { name: "Justin Durdell",  initial: "JD", color: "#2563EB" },
  { name: "Rohan",           initial: "R",  color: "#8B5CF6" },
  { name: "Somya Nayak",     initial: "S",  color: "#0D9488" },
  { name: "Sid Chaudhary",   initial: "S",  color: "#0D9488" },
  { name: "Sally Spaghetti", initial: "SS", color: "#6366F1" },
];

function pickAssignee(id: string) {
  const idx = id.charCodeAt(id.length - 1) % ASSIGNEE_POOL.length;
  return ASSIGNEE_POOL[idx];
}

const REFINE_CHIPS = ["Shorter", "More formal", "Add urgency", "Friendlier"];

// ── small building blocks ─────────────────────────────────────────────────────

function CompanyLogo({ name, size = 18 }: { name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded" style={{ width: size, height: size, background: "var(--muted)" }}>
      {!failed ? (
        <img
          src={`https://cdn.brandfetch.io/${domain}/icon?c=1idhE0Bg4BXpFRYkYnt`}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-[8px] font-bold text-stone-500">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="w-20 shrink-0 text-sm font-medium text-stone-400 dark:text-stone-500">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+4px)] z-50 w-44 overflow-hidden rounded-xl animate-card-in"
      style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)" }}
    >
      {children}
    </div>
  );
}

function ToolbarIconButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/8 dark:hover:text-stone-100"
    >
      {children}
    </button>
  );
}

// ── view ──────────────────────────────────────────────────────────────────────

export default function TaskDetailDrawer({
  task, onClose, onStatusChange, onDelete,
}: {
  task: TaskRecord;
  onClose: () => void;
  onStatusChange?: (status: Status) => void;
  onDelete?: () => void;
}) {
  const [type, setType] = useState<TaskType>(task.type);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [assignee, setAssignee] = useState(pickAssignee(task.id));
  const [toRemoved, setToRemoved] = useState(false);
  const [associated, setAssociated] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<string | null>(null);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [refineText, setRefineText] = useState("");
  const [openField, setOpenField] = useState<string | null>(null);
  const [bluThinking, setBluThinking] = useState(false);
  const [bluRevealed, setBluRevealed] = useState(false);
  const [bluGeneratedOnce, setBluGeneratedOnce] = useState(false);

  function toggle(field: string) {
    setOpenField((current) => (current === field ? null : field));
  }

  function toggleAddDropdown() {
    setAddOpen((o) => {
      const next = !o;
      if (next) setAddCategory(null);
      return next;
    });
  }

  function updateStatus(next: Status) {
    setStatus(next);
    onStatusChange?.(next);
  }

  const isCompleted = status === "Completed";
  const activePriority = PRIORITIES.find((p) => p.key === priority)!;

  const description = `Follow up with ${task.userName} at ${task.account} regarding "${task.taskName}". Reference recent engagement and propose a next step.`;
  const defaultSubject = `Following up on ${task.taskName.replace(/[?.]+$/, "").trim()}`;

  const firstName = task.userName.split(" ")[0];
  const generatedEmail = `Hi ${firstName},

I wanted to follow up on our recent conversation and your interest in exploring solutions together. I've been thinking about how we might be able to support ${task.account}'s goals, and I'd love to dive deeper into what you're looking to accomplish.

Based on our engagement so far, I think there could be a really strong fit between what we're building at Pied Piper and the challenges you're facing. I'd appreciate the opportunity to walk through a few ideas tailored specifically to your needs.

Would you have 20 minutes next week for a quick call? I'm happy to work around your schedule. Just let me know what works best for you.

Looking forward to connecting,

Sally`;

  function handleAskBlu() {
    if (bluThinking) return;
    setBluThinking(true);
    setBluRevealed(false);
    window.setTimeout(() => {
      setBluThinking(false);
      setEmailBody(generatedEmail);
      setBluRevealed(true);
      setBluGeneratedOnce(true);
      window.setTimeout(() => setBluRevealed(false), 700);
    }, 3000);
  }

  return (
    <SlidingSidebar
      title={
        isCompleted ? (
          <h2 className="mb-1 text-lg font-bold text-stone-400 dark:text-stone-500">{task.taskName}</h2>
        ) : (
          task.taskName
        )
      }
      onClose={onClose}
      contentClassName="p-0 overflow-y-auto"
      footer={(close) =>
        isCompleted ? (
          <div className="flex w-full items-center gap-2.5">
            <div className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300">
              <Check size={15} />
              Task completed
            </div>
            <button
              onClick={() => updateStatus("Open")}
              className="inline-flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/6"
              style={{ borderColor: "var(--border)" }}
            >
              Reopen
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center gap-2.5">
            <button
              onClick={() => updateStatus("Completed")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#2563EB" }}
            >
              <Check size={15} />
              Send &amp; complete
            </button>
            <button
              onClick={close}
              className="inline-flex h-10 items-center justify-center rounded-lg border px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/6"
              style={{ borderColor: "var(--border)" }}
            >
              Skip
            </button>
            <button
              onClick={() => { onDelete?.(); close(); }}
              aria-label="Delete task"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              style={{ borderColor: "var(--border)" }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    >
      {/* Associated + fields */}
      <div className="px-5 pb-4 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">Associated</p>
        <div className="mb-2 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ background: task.userColor }}
            >
              {task.userInitial}
            </span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{task.userName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CompanyLogo name={task.account} size={20} />
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-100">{task.account}</span>
          </div>
        </div>

        {!isCompleted && (
          <div className="relative mb-1 inline-block">
            <button
              type="button"
              onClick={toggleAddDropdown}
              className="flex items-center gap-1 text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <Plus size={12} />
              Add
            </button>
            {addOpen && (
              <DropdownPanel>
                {addCategory === null ? (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold text-stone-400 dark:text-stone-500">Select object type</p>
                    {ASSOCIATE_CATEGORIES.map((cat) => (
                      <OptionRow key={cat.key} onClick={() => setAddCategory(cat.key)}>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">{cat.icon}</span>
                        {cat.label}
                      </OptionRow>
                    ))}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onMouseDown={() => setAddCategory(null)}
                      className="flex w-full items-center gap-1.5 border-b px-3 py-2 text-left text-xs font-semibold text-stone-400 transition-colors hover:text-stone-600 dark:border-(--border) dark:text-stone-500 dark:hover:text-stone-300"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <ChevronLeft size={12} />
                      {ASSOCIATE_CATEGORIES.find((c) => c.key === addCategory)?.label}
                    </button>
                    {(ASSOCIATE_RECORDS_BY_CATEGORY[addCategory] ?? []).map((r) => {
                      const compoundKey = `${addCategory}:${r.key}`;
                      const active = associated.includes(compoundKey);
                      return (
                        <OptionRow
                          key={r.key}
                          onClick={() => setAssociated((prev) => (active ? prev.filter((k) => k !== compoundKey) : [...prev, compoundKey]))}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${active ? "border-blue-500 bg-blue-500" : "border-stone-300 dark:border-(--border)"}`}>
                            {active && <svg width="9" height="9" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{r.label}</span>
                        </OptionRow>
                      );
                    })}
                  </>
                )}
              </DropdownPanel>
            )}
          </div>
        )}

        <div>
          <FieldRow label="Type">
            {isCompleted ? (
              <TypeBadge type={type} />
            ) : (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => toggle("type")}
                  className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 transition-colors hover:opacity-80 dark:bg-white/8 dark:text-stone-300"
                >
                  {type}
                  <ChevronDown size={12} />
                </button>
                {openField === "type" && (
                  <DropdownPanel>
                    {TASK_TYPE_KEYS.map((k) => (
                      <OptionRow key={k} active={k === type} showCheck onClick={() => { setType(k); setOpenField(null); }}>
                        <TypeBadge type={k} />
                      </OptionRow>
                    ))}
                  </DropdownPanel>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Priority">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-300">
                {activePriority.icon}
                {priority}
              </span>
            ) : (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => toggle("priority")}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:opacity-80 dark:bg-blue-500/12 dark:text-blue-300"
                >
                  {activePriority.icon}
                  {priority}
                  <ChevronDown size={12} />
                </button>
                {openField === "priority" && (
                  <DropdownPanel>
                    {PRIORITIES.map((p) => (
                      <OptionRow key={p.key} active={p.key === priority} showCheck onClick={() => { setPriority(p.key); setOpenField(null); }}>
                        {p.icon}
                        {p.key}
                      </OptionRow>
                    ))}
                  </DropdownPanel>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Status">
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => toggle("status")}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80 ${STATUS_TONE[status]}`}
              >
                {status}
                <ChevronDown size={12} />
              </button>
              {openField === "status" && (
                <DropdownPanel>
                  {STATUS_KEYS.map((k) => (
                    <OptionRow key={k} active={k === status} showCheck onClick={() => { updateStatus(k); setOpenField(null); }}>
                      <StatusBadge status={k} />
                    </OptionRow>
                  ))}
                </DropdownPanel>
              )}
            </div>
          </FieldRow>

          <FieldRow label="Assignee">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-300">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: assignee.color }}>
                  {assignee.initial}
                </span>
                {assignee.name}
              </span>
            ) : (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => toggle("assignee")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 transition-colors hover:opacity-80 dark:bg-white/8 dark:text-stone-300"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: assignee.color }}>
                    {assignee.initial}
                  </span>
                  {assignee.name}
                  <ChevronDown size={12} className="text-stone-400" />
                </button>
                {openField === "assignee" && (
                  <DropdownPanel>
                    {ASSIGNEE_POOL.map((a) => (
                      <OptionRow key={a.name} active={a.name === assignee.name} showCheck onClick={() => { setAssignee(a); setOpenField(null); }}>
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ background: a.color }}>
                          {a.initial}
                        </span>
                        {a.name}
                      </OptionRow>
                    ))}
                  </DropdownPanel>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Due">
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-700 dark:text-stone-300">
              <Clock size={13} className="text-stone-400" />
              Due {task.dueDisplay}
            </span>
          </FieldRow>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-4">
        <p className="mb-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500">Description</p>
        <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">{description}</p>
      </div>

      {/* Email — read-only summary once completed */}
      {type === "Email" && isCompleted && (
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-semibold text-stone-400 dark:text-stone-500">Email</p>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">To</span>
              <span className="text-sm text-stone-800 dark:text-stone-100">{task.userName}</span>
            </div>
            <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">From</span>
              <span className="text-sm text-stone-800 dark:text-stone-100">sally@piedpiper.com</span>
            </div>
            <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">Subject</span>
              <span className="min-w-0 flex-1 truncate text-sm text-stone-800 dark:text-stone-100">{subject || defaultSubject}</span>
            </div>
            <div className="px-3 py-3">
              {emailBody ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700 dark:text-stone-300">{emailBody}</p>
              ) : (
                <p className="text-sm italic text-stone-400 dark:text-stone-500">No email content</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email composer */}
      {type === "Email" && !isCompleted && (
        <div className="px-5 py-4">
          <p className="mb-3 text-xs font-semibold text-stone-400 dark:text-stone-500">Email</p>

          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
            {!toRemoved && (
              <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">To</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-white/8 dark:text-stone-300">
                  {task.userName}
                  <button type="button" onClick={() => setToRemoved(true)} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
                    <X size={11} />
                  </button>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
              <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">From</span>
              <span className="min-w-0 flex-1 truncate text-sm text-stone-800 dark:text-stone-100">
                Sally Spaghetti (sally@piedpiper.com)
              </span>
              <button
                type="button"
                onClick={() => setShowCc((v) => !v)}
                className={`h-6 shrink-0 rounded-lg px-2 text-xs font-medium transition-colors duration-100 ${
                  showCc
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/6 dark:hover:text-stone-300"
                }`}
              >
                Cc
              </button>
              <button
                type="button"
                onClick={() => setShowBcc((v) => !v)}
                className={`h-6 shrink-0 rounded-lg px-2 text-xs font-medium transition-colors duration-100 ${
                  showBcc
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/6 dark:hover:text-stone-300"
                }`}
              >
                Bcc
              </button>
            </div>

            {showCc && (
              <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">Cc</span>
                <input
                  autoFocus
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Add recipients..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">Bcc</span>
                <input
                  autoFocus
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Add recipients..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
                />
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-3">
              <span className="w-14 shrink-0 text-xs text-stone-400 dark:text-stone-500">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 transition-colors hover:opacity-80 dark:bg-white/8 dark:text-stone-300"
            >
              <FileText size={12} />
              Content
              <ChevronDown size={12} />
            </button>
            <div className="flex items-center gap-1.5">
              {bluGeneratedOnce && (
                <button
                  type="button"
                  onClick={handleAskBlu}
                  disabled={bluThinking}
                  className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 transition-colors hover:opacity-80 disabled:cursor-default dark:bg-white/8 dark:text-stone-300"
                >
                  <RotateCcw size={12} />
                  Regenerate
                </button>
              )}
              <button
                type="button"
                onClick={handleAskBlu}
                disabled={bluThinking}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:opacity-80 disabled:cursor-default dark:bg-blue-500/12 dark:text-blue-300"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,128,255,0.12)" }}>
                  <img src="/mascot.png" alt="" width={11} height={11} className={`object-contain ${bluThinking ? "animate-logo-pulse" : ""}`} />
                </span>
                {bluThinking ? "Thinking..." : "Ask Blu"}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes blu-textarea-glow {
              0%, 100% { box-shadow: inset 0 0 0 1.5px rgba(37,99,235,0.18), 0 0 0 0 rgba(37,99,235,0); }
              50% { box-shadow: inset 0 0 0 2.5px rgba(37,99,235,0.65), 0 0 14px 1px rgba(37,99,235,0.2); }
            }
            @keyframes blu-text-reveal {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={5}
            placeholder="Compose your email..."
            className="mt-4 block w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
            style={{
              borderColor: "var(--border)",
              animation: bluThinking
                ? "blu-textarea-glow 1.1s ease-in-out infinite"
                : bluRevealed
                ? "blu-text-reveal 600ms ease-out"
                : undefined,
            }}
          />

          <div className="mt-2.5 flex items-center gap-1">
            <ToolbarIconButton><Bold size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Italic size={13} /></ToolbarIconButton>
            <ToolbarIconButton><LinkIcon size={13} /></ToolbarIconButton>
            <ToolbarIconButton><Paperclip size={13} /></ToolbarIconButton>
            <span className="mx-1 h-4 w-px shrink-0 bg-stone-200 dark:bg-white/10" />
            <button type="button" className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8">
              <Plus size={12} />
              Cc: Blu
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(0,128,255,0.12)" }}>
              <img src="/mascot.png" alt="" width={11} height={11} className="object-contain" />
            </span>
            <input
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="Refine this draft... (e.g., 'make it shorter')"
              className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
            <button type="button" className="shrink-0 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400">
              Refine
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {REFINE_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setRefineText(chip)}
                className="rounded-full border px-2.5 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
                style={{ borderColor: "var(--border)" }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </SlidingSidebar>
  );
}
