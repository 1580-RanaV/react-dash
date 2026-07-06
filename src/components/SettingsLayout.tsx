

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import SubTabCorner from "./SubTabCorner";

import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle, Bot, CalendarDays, ChevronLeft, Clock, ClipboardList, Copy, CreditCard, FolderOpen, Globe,
  Download, Eye, Image, Inbox, Info, KeyRound, Link2, Lock, LogOut, MessageSquare, PanelLeftOpen, Plus, Search, Shield, ShieldCheck, Smartphone, Trash2, User, Users, X,
} from "lucide-react";

type SettingsItem = {
  label: string;
  icon: React.ReactNode;
  key: string;
};

type SettingsSection = {
  heading: string;
  items: SettingsItem[];
};

type DeleteTarget = "account" | "project" | "organization";

const DangerContext = createContext<(t: DeleteTarget) => void>(() => {});

const settingsNav: SettingsSection[] = [
  {
    heading: "Profile",
    items: [
      { label: "Profile", icon: <User size={14} />, key: "about" },
      { label: "My availability", icon: <Clock size={14} />, key: "availability" },
      { label: "Connections", icon: <Link2 size={14} />, key: "connections" },
      { label: "Inbox", icon: <Inbox size={14} />, key: "inbox" },
      { label: "Security", icon: <Shield size={14} />, key: "security" },
    ],
  },
  {
    heading: "Organization",
    items: [
      { label: "Domains",   icon: <Globe size={14} />,         key: "domains" },
      { label: "Team",      icon: <Users size={14} />,         key: "team" },
      { label: "Roles",     icon: <ShieldCheck size={14} />,   key: "roles" },
      { label: "API keys",  icon: <KeyRound size={14} />,      key: "apikeys" },
      { label: "Security",  icon: <Lock size={14} />,          key: "org-security" },
      { label: "Audit log", icon: <ClipboardList size={14} />, key: "auditlog" },
      { label: "Projects",  icon: <FolderOpen size={14} />,    key: "projects" },
      { label: "Billing",   icon: <CreditCard size={14} />,    key: "billing" },
    ],
  },
  {
    heading: "Project",
    items: [
      { label: "Basic info", icon: <Info size={14} />, key: "basic" },
      { label: "People", icon: <Users size={14} />, key: "people" },
      { label: "Users", icon: <User size={14} />, key: "project-users" },
      { label: "Messages", icon: <MessageSquare size={14} />, key: "messages" },
      { label: "Meetings", icon: <CalendarDays size={14} />, key: "meetings" },
    ],
  },
];

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100">{title}</h2>
      <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">{sub}</p>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
  noBorder,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 ${noBorder ? "" : "border-b border-stone-100 dark:border-(--border) last:border-0"}`}>
      <div className="flex-1 min-w-0 sm:pr-8">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
        {description && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function FakeSelect({ value }: { value: string }) {
  return (
    <button className="flex h-9 items-center gap-2 px-3 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) hover:bg-stone-50 dark:hover:bg-white/8 transition-colors">
      <span className="text-sm text-stone-700 dark:text-stone-200">{value}</span>
      <ChevronLeft size={11} className="text-stone-400 -rotate-90" />
    </button>
  );
}

function FakeToggle({ on = false }: { on?: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <button
      onClick={() => setEnabled((v) => !v)}
      aria-checked={enabled}
      role="switch"
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? "bg-blue-500" : "bg-stone-200 dark:bg-white/12"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Weekly Hours ─────────────────────────────────────────────────────────────

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
type Day = typeof DAYS[number];
type Slot = { start: string; end: string };
type Schedule = Record<Day, { active: boolean; slots: Slot[] }>;

const DEFAULT_SCHEDULE: Schedule = {
  Sunday:    { active: false, slots: [{ start: "09:00", end: "17:00" }] },
  Monday:    { active: false, slots: [{ start: "09:00", end: "17:00" }] },
  Tuesday:   { active: true,  slots: [{ start: "09:00", end: "17:00" }] },
  Wednesday: { active: true,  slots: [{ start: "09:00", end: "17:00" }] },
  Thursday:  { active: true,  slots: [{ start: "09:00", end: "17:00" }] },
  Friday:    { active: true,  slots: [{ start: "09:00", end: "17:00" }] },
  Saturday:  { active: false, slots: [{ start: "09:00", end: "17:00" }] },
};

function fmt24to12(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const ampm = hh < 12 ? "AM" : "PM";
  const h = hh % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function WeeklyHours() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);

  function toggleDay(day: Day) {
    setSchedule((s) => ({ ...s, [day]: { ...s[day], active: !s[day].active } }));
  }

  function updateSlot(day: Day, idx: number, field: "start" | "end", val: string) {
    setSchedule((s) => {
      const slots = s[day].slots.map((slot, i) => i === idx ? { ...slot, [field]: val } : slot);
      return { ...s, [day]: { ...s[day], slots } };
    });
  }

  function addSlot(day: Day) {
    setSchedule((s) => ({
      ...s,
      [day]: { ...s[day], slots: [...s[day].slots, { start: "09:00", end: "17:00" }] },
    }));
  }

  function removeSlot(day: Day, idx: number) {
    setSchedule((s) => {
      const slots = s[day].slots.filter((_, i) => i !== idx);
      return { ...s, [day]: { ...s[day], slots: slots.length ? slots : s[day].slots } };
    });
  }

  function copyToAll(day: Day) {
    const source = schedule[day].slots;
    setSchedule((s) => {
      const next = { ...s };
      DAYS.forEach((d) => { if (s[d].active) next[d] = { ...s[d], slots: source.map((sl) => ({ ...sl })) }; });
      return next;
    });
  }

  const [hoveredDay, setHoveredDay] = useState<Day | null>(null);

  return (
    <div>
      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">My Weekly Hours</p>
      <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 mb-5">Set your personal availability for each day of the week</p>
      <div className="flex flex-col gap-3">
        {DAYS.map((day) => {
          const { active, slots } = schedule[day];
          return (
            <div key={day} className="flex items-start gap-3" onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)}>
              {/* Day pill */}
              <button
                onClick={() => toggleDay(day)}
                className={`w-24 h-9 shrink-0 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? "bg-blue-500 text-white"
                    : "border border-stone-200 dark:border-(--border) text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5"
                }`}
              >
                {day}
              </button>

              {active ? (
                <div className="flex flex-1 items-start gap-3">
                  {/* Slots column */}
                  <div className="flex flex-col gap-2 flex-1">
                    {slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Clock size={12} className="text-stone-300 shrink-0" />
                        {/* Start time */}
                        <div className="flex h-9 items-center justify-center rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-xs text-stone-700 dark:text-stone-200 w-32">
                          <span>{fmt24to12(slot.start)}</span>
                          <input type="time" value={slot.start} onChange={(e) => updateSlot(day, idx, "start", e.target.value)} className="sr-only" tabIndex={-1} />
                        </div>
                        <span className="text-xs text-stone-400">to</span>
                        {/* End time */}
                        <div className="flex h-9 items-center justify-center rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-xs text-stone-700 dark:text-stone-200 w-32">
                          <span>{fmt24to12(slot.end)}</span>
                          <input type="time" value={slot.end} onChange={(e) => updateSlot(day, idx, "end", e.target.value)} className="sr-only" tabIndex={-1} />
                        </div>
                        {/* Remove slot */}
                        {slots.length > 1 && (
                          <button onClick={() => removeSlot(day, idx)} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Right-side actions */}
                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    {hoveredDay === day && (
                      <button onClick={() => copyToAll(day)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-stone-200 dark:border-(--border) text-xs text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                        <Copy size={12} />
                        Copy to all
                      </button>
                    )}
                    <button onClick={() => addSlot(day)} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors" title="Add time slot">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="flex h-9 items-center text-xs text-stone-400 dark:text-stone-500">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Date Overrides ────────────────────────────────────────────────────────────

type DateOverride = { id: string; date: string; type: "unavailable" | "available"; slots: Slot[] };

function DateOverridesSection() {
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState("2026-07-04");
  const [formType, setFormType] = useState<"unavailable" | "available">("unavailable");
  const [formSlots, setFormSlots] = useState<Slot[]>([{ start: "09:00", end: "17:00" }]);

  function addOverride() {
    if (!formDate) return;
    setOverrides((prev) => [
      ...prev,
      { id: String(Date.now()), date: formDate, type: formType, slots: formType === "unavailable" ? [] : formSlots },
    ]);
    setShowForm(false);
    setFormDate("2026-07-04");
    setFormType("unavailable");
    setFormSlots([{ start: "09:00", end: "17:00" }]);
  }

  return (
    <div className="border-t border-stone-100 dark:border-(--border) pt-6 mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Date Overrides</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Set specific dates when your availability differs from your weekly schedule</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-md border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
        >
          Add Override
        </button>
      </div>

      {/* Existing overrides */}
      {overrides.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {overrides.map((ov) => (
            <div key={ov.id} className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${ov.type === "unavailable" ? "bg-rose-400" : "bg-emerald-400"}`} />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{fmtDate(ov.date)}</span>
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {ov.type === "unavailable" ? "Unavailable" : ov.slots.map((s) => `${fmt24to12(s.start)} – ${fmt24to12(s.end)}`).join(", ")}
                </span>
              </div>
              <button
                onClick={() => setOverrides((prev) => prev.filter((o) => o.id !== ov.id))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-stone-300 hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="mt-4 rounded-xl border border-stone-200 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-4 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Date</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="h-9 w-44 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Availability</label>
            <div className="flex gap-2">
              {(["unavailable", "available"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFormType(t)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors capitalize ${
                    formType === t
                      ? "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-400 dark:border-blue-500/40"
                      : "border-stone-200 dark:border-(--border) text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/6"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {formType === "available" && (
            <div className="flex flex-col gap-2">
              {formSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-xs text-stone-700 dark:text-stone-200 w-32">
                    <span className="flex-1">{fmt24to12(slot.start)}</span>
                    <Clock size={12} className="text-stone-300 shrink-0" />
                    <input type="time" value={slot.start} onChange={(e) => setFormSlots((s) => s.map((sl, i) => i === idx ? { ...sl, start: e.target.value } : sl))} className="sr-only" tabIndex={-1} />
                  </div>
                  <span className="text-xs text-stone-400">to</span>
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-xs text-stone-700 dark:text-stone-200 w-32">
                    <span className="flex-1">{fmt24to12(slot.end)}</span>
                    <Clock size={12} className="text-stone-300 shrink-0" />
                    <input type="time" value={slot.end} onChange={(e) => setFormSlots((s) => s.map((sl, i) => i === idx ? { ...sl, end: e.target.value } : sl))} className="sr-only" tabIndex={-1} />
                  </div>
                  {formSlots.length > 1 && (
                    <button onClick={() => setFormSlots((s) => s.filter((_, i) => i !== idx))} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-300 hover:text-stone-500 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => setFormSlots((s) => [...s, { start: "09:00", end: "17:00" }])} className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 w-fit">
                Add time slot
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={addOverride} className="h-9 px-4 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
              Save Override
            </button>
            <button onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type OOOEntry = { id: string; startDate: string; endDate: string; reason: string };

function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m) - 1]} ${parseInt(day)}, ${y}`;
}

function BluPreferencesSection() {
  const [autoDetect, setAutoDetect] = useState(true);
  const [notifyBooked, setNotifyBooked] = useState(true);
  const [duration, setDuration] = useState("30 min");
  const [slots, setSlots] = useState("3 slots");

  return (
    <div className="border-t border-stone-100 dark:border-(--border) pt-6 mt-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/12">
          <Bot size={15} className="text-blue-500 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Blu Preferences</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">How Blu handles scheduling on your behalf</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between py-3.5 border-b border-stone-100 dark:border-(--border)">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-stone-700 dark:text-stone-200">Auto-detect scheduling discussions</span>
            <span className="relative group">
              <Info size={13} className="text-stone-300 dark:text-stone-600 cursor-default" />
              <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: "rgba(24,24,27,0.93)" }}>
                Blu scans messages for scheduling intent
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
              </span>
            </span>
          </div>
          <button onClick={() => setAutoDetect((v) => !v)} aria-pressed={autoDetect}>
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${autoDetect ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${autoDetect ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between py-3.5 border-b border-stone-100 dark:border-(--border)">
          <span className="text-sm text-stone-700 dark:text-stone-200">Default meeting duration</span>
          <div className="relative">
            <select value={duration} onChange={(e) => setDuration(e.target.value)}
              className="h-9 appearance-none pl-3 pr-8 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer">
              {["15 min","20 min","30 min","45 min","60 min"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5 border-b border-stone-100 dark:border-(--border)">
          <span className="text-sm text-stone-700 dark:text-stone-200">Time slots to suggest</span>
          <div className="relative">
            <select value={slots} onChange={(e) => setSlots(e.target.value)}
              className="h-9 appearance-none pl-3 pr-8 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer">
              {["1 slot","2 slots","3 slots","4 slots","5 slots"].map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
          </div>
        </div>

        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-stone-700 dark:text-stone-200">Notify me when meetings are booked</span>
            <span className="relative group">
              <Info size={13} className="text-stone-300 dark:text-stone-600 cursor-default" />
              <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: "rgba(24,24,27,0.93)" }}>
                Get notified each time Blu books a meeting
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
              </span>
            </span>
          </div>
          <button onClick={() => setNotifyBooked((v) => !v)} aria-pressed={notifyBooked}>
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${notifyBooked ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
              <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${notifyBooked ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OOOSection() {
  const [on, setOn] = useState(false);
  const [startDate, setStartDate] = useState("2026-06-16");
  const [endDate, setEndDate] = useState("2026-06-16");
  const [reason, setReason] = useState("");
  const [entries, setEntries] = useState<OOOEntry[]>([]);
  const [showForm, setShowForm] = useState(true);

  function addEntry() {
    if (!startDate || !endDate) return;
    setEntries((prev) => [...prev, { id: String(Date.now()), startDate, endDate, reason }]);
    setReason("");
    setShowForm(false);
  }

  return (
    <div className="border-t border-stone-100 dark:border-(--border) pt-6 mt-6">
      <div className="flex items-start justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Out of office</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Automatically set when you're away</p>
        </div>
        <button onClick={() => setOn((v) => !v)} className="shrink-0 mt-0.5" aria-pressed={on}>
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${on ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </span>
        </button>
      </div>

      {on && (
        <div className="mt-2 flex flex-col gap-3">
          {/* Registered entries */}
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm text-stone-700 dark:text-stone-300 font-medium truncate">
                  {fmtDate(entry.startDate)} — {fmtDate(entry.endDate)}
                </span>
                {entry.reason && (
                  <span className="text-xs text-stone-400 dark:text-stone-500 truncate">{entry.reason}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-300 hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Form — shown when no entries yet or explicitly opened */}
          {(entries.length === 0 || showForm) && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 w-44 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-stone-500 dark:text-stone-400">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 w-44 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 transition" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Reason <span className="text-stone-300 dark:text-stone-600">(optional)</span></label>
                <div className="flex gap-2">
                  <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                    placeholder="e.g. On vacation"
                    className="h-9 flex-1 max-w-xs rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none focus:border-blue-400 transition" />
                  <button onClick={addEntry} className="h-9 px-4 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
                    Add OOO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConnRow({ logo, name }: { logo: string; name: string }) {
  const [state, setState] = useState<"idle" | "loading" | "connected">("idle");

  function handleConnect() {
    setState("loading");
    setTimeout(() => setState("connected"), 1400);
  }

  return (
    <div className="py-4 border-b border-stone-100 dark:border-(--border) last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt={name} width={20} height={20} className="rounded shrink-0 object-contain" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{name}</span>
        </div>
        {state === "connected" ? (
          <button
            onClick={() => setState("idle")}
            className="h-9 px-3 rounded-md border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/6 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={state === "loading"}
            className="h-9 px-4 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#0080FF" }}
          >
            {state === "loading" ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Connecting
              </span>
            ) : "Connect"}
          </button>
        )}
      </div>
      {state === "connected" && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Connected as <span className="font-medium text-stone-600 dark:text-stone-400">rana@intempt.com</span>
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Connected to project <span className="font-medium text-stone-600 dark:text-stone-400">Intempt</span> on <span className="font-medium text-stone-600 dark:text-stone-400">Intempt</span> in org <span className="font-medium text-stone-600 dark:text-stone-400">Intempt External Use</span>.
          </p>
        </div>
      )}
    </div>
  );
}

function ConnectionsSettingsView() {
  return (
    <div>
      <SectionHeader title="Connections" sub="Connect your calendar and mail integrations used for booking, scheduling, and AI-assisted replies." />
      <ConnRow logo="https://cdn.brandfetch.io/gmail.com/icon?c=1idhE0Bg4BXpFRYkYnt" name="Gmail" />
      <ConnRow logo="/gmeet.png" name="Google Calendar" />
    </div>
  );
}

type EmailAction = "label" | "folder" | "skip";

const CATEGORIES: {
  key: string;
  label: string;
  badge: string;
  desc: string;
  sub: string;
  defaultAction: EmailAction;
  muted?: boolean;
}[] = [
  { key: "meeting",   label: "Meeting update",  badge: "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",    desc: "Calendar invites, RSVPs, reschedules",   sub: "Labeled, stays in inbox",                  defaultAction: "label"  },
  { key: "marketing", label: "Marketing",        badge: "bg-stone-800 text-white border border-stone-700 dark:bg-stone-200 dark:text-stone-900 dark:border-stone-300",         desc: "Newsletters, promos, cold outreach",     sub: "Emails moved to Marketing folder",      defaultAction: "folder" },
  { key: "respond",   label: "To respond",       badge: "bg-stone-100 text-stone-400 border border-stone-200 dark:bg-white/12 dark:text-stone-500 dark:border-(--border)",    desc: "Emails needing your reply",              sub: "AI will skip this type",                defaultAction: "skip",  muted: true },
  { key: "fyi",       label: "FYI",              badge: "bg-stone-50 text-stone-500 border border-stone-200 dark:bg-(--muted) dark:text-stone-400 dark:border-(--border)",  desc: "Info only, no action needed",            sub: "Labeled, stays in inbox",               defaultAction: "label"  },
  { key: "comment",   label: "Comment",          badge: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20", desc: "Feedback and discussion threads",     sub: "Labeled, stays in inbox",               defaultAction: "label"  },
  { key: "notif",     label: "Notification",     badge: "bg-rose-50 text-rose-500 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",     desc: "App alerts, system updates",             sub: "Emails moved to Notification folder",   defaultAction: "folder" },
  { key: "awaiting",  label: "Awaiting reply",   badge: "bg-stone-50 text-stone-500 border border-stone-200 dark:bg-(--muted) dark:text-stone-400 dark:border-(--border)",  desc: "Sent by you, waiting on them",          sub: "Labeled, stays in inbox",                  defaultAction: "label"  },
  { key: "actioned",  label: "Actioned",         badge: "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20", desc: "Already handled",              sub: "Labeled, stays in inbox",                  defaultAction: "label"  },
];

const ACTION_LABELS: Record<EmailAction, string> = {
  label:  "Label & keep in inbox",
  folder: "Move to folder",
  skip:   "Don't categorize",
};

const MARKETING_STRENGTH_LABELS: Record<string, string> = {
  light:      "Light — Cold emails & unknown senders only",
  aggressive: "Aggressive — All promotional emails",
  off:        "Off — Don't filter marketing",
};

function CategoryRow({ cat }: { cat: typeof CATEGORIES[number] }) {
  const [action, setAction] = useState<EmailAction>(cat.defaultAction);
  const [marketingStrength, setMarketingStrength] = useState("light");

  const subText =
    action === "label"  ? "Labeled, stays in inbox" :
    action === "folder" ? `Emails moved to ${cat.label} folder` :
                          "AI will skip this type";

  const isMarketing = cat.key === "marketing";

  return (
    <div className={`py-4 border-b border-stone-100 dark:border-(--border) last:border-0 ${cat.muted && action === "skip" ? "opacity-50" : ""}`}>
      {/* Main row */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold shrink-0 ${cat.badge}`}>
              {cat.label}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">{cat.desc}</span>
          </div>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-600">{subText}</p>
        </div>
        <div className="shrink-0 relative mt-0.5">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as EmailAction)}
            className="h-9 appearance-none pl-3 pr-8 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-xs text-stone-600 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer"
          >
            {(Object.entries(ACTION_LABELS) as [EmailAction, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
        </div>
      </div>

      {/* Marketing filter strength sub-row */}
      {isMarketing && action !== "skip" && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Marketing filter strength</p>
          <div className="relative">
            <select
              value={marketingStrength}
              onChange={(e) => setMarketingStrength(e.target.value)}
              className="h-9 appearance-none pl-3 pr-8 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-xs text-stone-600 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer"
            >
              {Object.entries(MARKETING_STRENGTH_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
          </div>
        </div>
      )}
    </div>
  );
}

const MARKETING_OPTIONS = [
  { value: "light",      label: "Light",      desc: "Cold emails & unknown senders only" },
  { value: "aggressive", label: "Aggressive", desc: "All promotional emails" },
  { value: "off",        label: "Off",        desc: "Don't filter marketing" },
];

function InboxSection() {
  const [enabled, setEnabled] = useState(false);
  const [respectLabels, setRespectLabels] = useState(true);
  const [marketingStrength, setMarketingStrength] = useState("light");
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [aliasInput, setAliasInput] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState("");
  const [ruleCategory, setRuleCategory] = useState("notification");
  const [ruleCategoryOpen, setRuleCategoryOpen] = useState(false);
  const [customRules, setCustomRules] = useState<{ id: string; pattern: string; category: string }[]>([]);
  const marketingRef = useRef<HTMLDivElement>(null);
  const ruleCatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (marketingRef.current && !marketingRef.current.contains(e.target as Node)) setMarketingOpen(false);
      if (ruleCatRef.current && !ruleCatRef.current.contains(e.target as Node)) setRuleCategoryOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function addRule() {
    const trimmed = ruleInput.trim();
    if (!trimmed) return;
    setCustomRules((prev) => [...prev, { id: String(Date.now()), pattern: trimmed, category: ruleCategory }]);
    setRuleInput("");
  }

  function addAlias() {
    const trimmed = aliasInput.trim();
    if (trimmed && !aliases.includes(trimmed)) {
      setAliases((prev) => [...prev, trimmed]);
    }
    setAliasInput("");
  }

  const selectedMarketing = MARKETING_OPTIONS.find((o) => o.value === marketingStrength)!;

  return (
    <div>
      <SectionHeader title="Inbox" sub="Let AI organize your emails as they arrive, so your inbox stays focused." />

      {/* Master toggle */}
      <div className="flex items-center justify-between py-4 border-b border-stone-100 dark:border-(--border)">
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Enable inbox intelligence</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Auto-organize new emails as they arrive</p>
        </div>
        <button onClick={() => setEnabled((v) => !v)} aria-pressed={enabled}>
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${enabled ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </span>
        </button>
      </div>

      {enabled && (
        <div className="mt-6">
          {/* How emails are handled */}
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-4">How emails are handled</p>
          <div className="mb-4">
            {CATEGORIES.map((cat) => <CategoryRow key={cat.key} cat={cat} />)}
          </div>

          {/* Respect labels */}
          <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-(--border)">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Respect my existing labels</p>
            <button onClick={() => setRespectLabels((v) => !v)} aria-pressed={respectLabels}>
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${respectLabels ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${respectLabels ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </div>

          {/* Marketing filter strength */}
          <div className="py-4 border-b border-stone-100 dark:border-(--border)">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Marketing filter strength</p>
            <div ref={marketingRef} className="relative">
              <button
                onClick={() => setMarketingOpen((o) => !o)}
                className="flex w-full items-center justify-between h-10 px-3 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
              >
                <span>{selectedMarketing.label} — {selectedMarketing.desc}</span>
                <ChevronLeft size={12} className={`text-stone-400 transition-transform duration-150 ${marketingOpen ? "rotate-90" : "-rotate-90"}`} />
              </button>
              {marketingOpen && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg py-1 animate-card-in"
                  style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                >
                  {MARKETING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setMarketingStrength(opt.value); setMarketingOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-white/5 ${marketingStrength === opt.value ? "font-semibold text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}
                    >
                      {opt.label} — {opt.desc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Other email addresses */}
          <div className="py-4">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Your other email addresses</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 mb-3">Add aliases so we recognize when you're CC'd on your own threads</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAlias()}
                placeholder="Add email address..."
                className="flex-1 h-9 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none focus:border-blue-400 transition"
              />
              <button
                onClick={addAlias}
                className="flex items-center gap-1 h-9 px-3.5 rounded-md border border-stone-200 dark:border-(--border) text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
            {aliases.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {aliases.map((email) => (
                  <div key={email} className="flex items-center justify-between rounded-lg border border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-3 py-2">
                    <span className="text-sm text-stone-700 dark:text-stone-300">{email}</span>
                    <button onClick={() => setAliases((prev) => prev.filter((a) => a !== email))} className="flex h-6 w-6 items-center justify-center rounded-md text-stone-300 hover:text-rose-400 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom rules */}
          <div className="py-4 border-t border-stone-100 dark:border-(--border)">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Custom rules</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 mb-4">Override AI decisions for specific senders, domains, or subjects</p>

            {/* Existing rules */}
            {customRules.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {customRules.map((rule) => {
                  const cat = CATEGORIES.find((c) => c.key === rule.category);
                  return (
                    <div key={rule.id} className="flex items-center gap-3 rounded-lg border border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-3 py-2">
                      <span className="flex-1 text-sm text-stone-700 dark:text-stone-300 truncate">{rule.pattern}</span>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold shrink-0 ${cat?.badge ?? ""}`}>{cat?.label ?? rule.category}</span>
                      <button onClick={() => setCustomRules((prev) => prev.filter((r) => r.id !== rule.id))} className="flex h-6 w-6 items-center justify-center rounded-md text-stone-300 hover:text-rose-400 transition-colors shrink-0">
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add rule form */}
            <div className="flex items-center gap-2">
              <input
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRule()}
                placeholder="e.g. ceo@company.com or @github.com"
                className="flex-1 h-9 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none focus:border-blue-400 transition"
              />
              <div ref={ruleCatRef} className="relative shrink-0">
                <button
                  onClick={() => setRuleCategoryOpen((o) => !o)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span>{CATEGORIES.find((c) => c.key === ruleCategory)?.label ?? ruleCategory}</span>
                  <ChevronLeft size={11} className={`text-stone-400 transition-transform duration-150 ${ruleCategoryOpen ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {ruleCategoryOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+4px)] z-20 w-52 overflow-hidden rounded-lg py-1 animate-card-in"
                    style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                  >
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => { setRuleCategory(cat.key); setRuleCategoryOpen(false); }}
                        className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-white/5 ${ruleCategory === cat.key ? "font-semibold text-stone-900 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addRule}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "#0080FF" }}
              >
                Add Rule
              </button>
            </div>
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">Accepts: email addresses, @domain.com, or text that appears in subject lines</p>
          </div>
        </div>
      )}
    </div>
  );
}


const ACCESS_LEVELS = ["Super Admin", "Owner", "Admin", "Member", "Read Only", "Inbox Manager", "N/A"];
const TIMEZONES = [
  { label: "Eastern Time - New York", zone: "America / New_York", offset: "GMT-4", time: "07:03" },
  { label: "Central Time - Chicago", zone: "America / Chicago", offset: "GMT-5", time: "06:03" },
  { label: "Mountain Time - Denver", zone: "America / Denver", offset: "GMT-6", time: "05:03" },
  { label: "Pacific Time - Los Angeles", zone: "America / Los_Angeles", offset: "GMT-7", time: "04:03" },
  { label: "London", zone: "Europe / London", offset: "GMT+1", time: "12:03" },
  { label: "Paris", zone: "Europe / Paris", offset: "GMT+2", time: "13:03" },
  { label: "Berlin", zone: "Europe / Berlin", offset: "GMT+2", time: "13:03" },
  { label: "Kyiv", zone: "Europe / Kyiv", offset: "GMT+3", time: "14:03" },
  { label: "Dubai", zone: "Asia / Dubai", offset: "GMT+4", time: "15:03" },
  { label: "Kolkata", zone: "Asia / Kolkata", offset: "GMT+5:30", time: "16:33" },
  { label: "Singapore", zone: "Asia / Singapore", offset: "GMT+8", time: "19:03" },
  { label: "Tokyo", zone: "Asia / Tokyo", offset: "GMT+9", time: "20:03" },
];

function BasicInfoSection() {
  const [accessLevel, setAccessLevel] = useState("Member");
  const [timezone, setTimezone] = useState("Europe / Kyiv");
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [companyDomains, setCompanyDomains] = useState(["intempt.com"]);
  const [domainInput, setDomainInput] = useState("");

  function addCompanyDomain() {
    const domain = domainInput.trim().toLowerCase();
    if (!domain || companyDomains.includes(domain)) return;
    setCompanyDomains((current) => [...current, domain]);
    setDomainInput("");
  }

  return (
    <div>
      <SectionHeader title="Company Settings" sub="Configure company-specific information and preferences" />
      <SettingsRow label="Project name" description="The display name for this project">
        <input className="px-3 h-9 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 w-48 outline-none focus:border-blue-400" defaultValue="Linea" />
      </SettingsRow>
      <SettingsRow label="Timezone" description="Used for scheduling, reminders, and reports">
        <div className="relative">
          <button onClick={() => setTimezoneOpen((open) => !open)} className={`flex h-9 w-52 items-center justify-between rounded-md border bg-white pl-3 pr-2.5 text-sm text-stone-700 transition-colors dark:bg-(--input) dark:text-stone-300 ${timezoneOpen ? "border-blue-400" : "border-stone-200 dark:border-(--border)"}`}>
            <span>{timezone}</span>
            <ChevronLeft size={11} className={`text-stone-400 transition-transform ${timezoneOpen ? "rotate-90" : "-rotate-90"}`} />
          </button>
          {timezoneOpen && (
            <div className="absolute right-0 top-[calc(100%+5px)] z-40 w-112 overflow-hidden rounded-xl animate-card-in" style={{ background: "var(--raised)", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.14)" }}>
              <div className="border-b border-stone-100 px-4 py-2.5 text-xs text-stone-500 dark:border-(--border)">444 timezones available</div>
              <div className="px-3 pt-3">
                <div className="relative">
                  <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input autoFocus value={timezoneSearch} onChange={(event) => setTimezoneSearch(event.target.value)} placeholder="Search timezones…" className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                </div>
              </div>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-stone-500 dark:text-stone-400">Popular Timezones</p>
              <div className="max-h-72 overflow-y-auto px-2 pb-2">
                {TIMEZONES.filter((item) => `${item.label} ${item.zone} ${item.offset}`.toLowerCase().includes(timezoneSearch.toLowerCase())).map((item) => {
                  const selected = timezone === item.zone;
                  return (
                    <button key={item.zone} onClick={() => { setTimezone(item.zone); setTimezoneOpen(false); setTimezoneSearch(""); }} className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${selected ? "bg-blue-50 text-stone-800 dark:bg-blue-500/12 dark:text-stone-100" : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5"}`}>
                      <span className="text-sm">{item.label}</span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{item.offset}</span>
                      <span className="font-mono text-sm text-stone-500 dark:text-stone-400">{item.time}</span>
                      {selected && <span className="absolute right-3 text-blue-500">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SettingsRow>
      <div className="border-b border-stone-100 py-4 dark:border-(--border)">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Company email domain</p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Specify the email domains that belong to your company's employees and partners. Members with these domains can join automatically.</p>
        <div className="mt-3 flex gap-2">
          <input
            value={domainInput}
            onChange={(event) => setDomainInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCompanyDomain(); } }}
            className="h-9 flex-1 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200"
            placeholder="e.g. intempt.com"
          />
          <button onClick={addCompanyDomain} disabled={!domainInput.trim()} className="flex h-9 items-center gap-1.5 rounded-md bg-blue-500 px-3.5 text-xs font-semibold text-white transition-opacity disabled:opacity-40">
            Add domain
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {companyDomains.map((domain) => (
            <div key={domain} className="flex items-center justify-between gap-3 px-1 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-(--muted) dark:text-stone-500"><Globe size={13} /></span>
                <span className="truncate text-sm font-medium text-stone-700 dark:text-stone-200">{domain}</span>
              </div>
              <button onClick={() => setCompanyDomains((current) => current.filter((item) => item !== domain))} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-300 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"><X size={13} /></button>
            </div>
          ))}
        </div>
      </div>
      <SettingsRow label="Automatic project access" description="Anyone from these domains can automatically join">
        <div className="relative">
          <select
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            className="h-9 appearance-none pl-3 pr-8 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer w-44"
          >
            {ACCESS_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
        </div>
      </SettingsRow>
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
          <span
            onClick={() => onChange(opt.value)}
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              value === opt.value
                ? "border-blue-500 bg-white dark:bg-(--raised)"
                : "border-stone-300 dark:border-(--border) bg-white dark:bg-(--raised)"
            }`}
          >
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </span>
          <span className="text-sm text-stone-700 dark:text-stone-200">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function SubSection({ title, description, children, titleWeight = "font-semibold" }: { title: string; description?: string; children: React.ReactNode; titleWeight?: string }) {
  return (
    <div className="mb-8">
      <p className={`text-sm ${titleWeight} text-stone-800 dark:text-stone-100`}>{title}</p>
      {description && <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 mb-4">{description}</p>}
      {!description && <div className="mt-4" />}
      {children}
    </div>
  );
}

function MsgSelect({ value, options }: { value: string; options: string[] }) {
  return (
    <div className="relative mt-1.5">
      <select defaultValue={value} className="w-full h-10 appearance-none pl-3 pr-8 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronLeft size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
    </div>
  );
}

function MessagesSection() {
  const MSG_TABS = ["Sync", "Records", "Delivery", "Appearance"] as const;
  type MsgTab = typeof MSG_TABS[number];
  const [tab, setTab] = useState<MsgTab>("Sync");

  // Sync state
  const [processingMode, setProcessingMode] = useState("external");
  const [detection, setDetection] = useState("automatic");
  const [internalProcessing, setInternalProcessing] = useState("exclude");
  // Delivery state
  const [smartSending, setSmartSending] = useState(true);
  const [physicalAddress, setPhysicalAddress] = useState(false);
  const [emailSettingsTab, setEmailSettingsTab] = useState<"Header Links" | "Social">("Header Links");
  const [socialLinks, setSocialLinks] = useState([
    { id: "facebook", name: "Facebook", platform: "Facebook", url: "https://www.facebook.com/..." },
    { id: "linkedin", name: "LinkedIn", platform: "LinkedIn", url: "https://www.linkedin.com/..." },
    { id: "social-1", name: "Social", platform: "Platform", url: "" },
  ]);
  const [expandedSocial, setExpandedSocial] = useState<string | null>("social-1");

  function addSocialLink() {
    const id = `social-${Date.now()}`;
    setSocialLinks((current) => [...current, { id, name: "Social", platform: "Platform", url: "" }]);
    setExpandedSocial(id);
  }

  return (
    <div>
      <SectionHeader title="Messages" sub="Configure email sync, record creation, delivery timing, and appearance." />

      {/* Tabs */}
      <div className="mb-8">
        <SubTabCorner
          tabs={MSG_TABS.map((t) => ({ key: t, label: t }))}
          active={tab}
          onChange={(k) => setTab(k as MsgTab)}
        />
      </div>

      {/* Sync */}
      {tab === "Sync" && (
        <div>
          <SubSection title="Email Processing Mode">
            <RadioGroup
              value={processingMode}
              onChange={setProcessingMode}
              options={[
                { value: "all",      label: "Sync all emails — Process everything from connected inbox" },
                { value: "external", label: "Sync external only — Only process emails from outside your organization" },
                { value: "filters",  label: "Sync with filters — Use custom inclusion/exclusion rules" },
              ]}
            />
          </SubSection>

          <SubSection title="Internal Communications">
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3">Internal Email Detection</p>
            <RadioGroup
              value={detection}
              onChange={setDetection}
              options={[
                { value: "automatic", label: "Automatic — Detect based on user domains in system" },
                { value: "manual",    label: "Manual — Specify internal domains" },
              ]}
            />
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mt-5 mb-3">Internal Email Processing</p>
            <RadioGroup
              value={internalProcessing}
              onChange={setInternalProcessing}
              options={[
                { value: "include", label: "Include in sync (treat like external)" },
                { value: "exclude", label: "Exclude from sync (block all internal)" },
              ]}
            />
          </SubSection>

          <SubSection title="Sync Settings">
            <MsgSelect value="Sync last 90 days of email history" options={["Sync last 30 days of email history", "Sync last 90 days of email history", "Sync last 180 days of email history", "Sync all history"]} />
          </SubSection>
        </div>
      )}

      {/* Records */}
      {tab === "Records" && (
        <div>
          <SettingsRow label="User Creation Mode" description="New users will be created automatically when processing emails">
            <div className="relative">
              <select className="h-9 appearance-none pl-3 pr-8 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer w-56">
                <option>Create users automatically</option>
                <option>Create users manually</option>
                <option>Never create users</option>
              </select>
              <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
            </div>
          </SettingsRow>
          <SettingsRow label="Account Creation Mode" description="New accounts will be created automatically for new domains">
            <div className="relative">
              <select className="h-9 appearance-none pl-3 pr-8 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer w-56">
                <option>Create accounts automatically</option>
                <option>Create accounts manually</option>
                <option>Never create accounts</option>
              </select>
              <ChevronLeft size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
            </div>
          </SettingsRow>
        </div>
      )}

      {/* Delivery */}
      {tab === "Delivery" && (
        <div>
          <SubSection title="Smart Sending" description="Configure intelligent message delivery timing">
            <SettingsRow label="Enable smart sending" description="">
              <button onClick={() => setSmartSending((v) => !v)} aria-pressed={smartSending}>
                <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${smartSending ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${smartSending ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </span>
              </button>
            </SettingsRow>

            {smartSending && (
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">Email interval (hours)</p>
                  <MsgSelect value="16 hours" options={["1 hour", "2 hours", "4 hours", "8 hours", "16 hours", "24 hours"]} />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">SMS interval (hours)</p>
                  <MsgSelect value="6 hours" options={["1 hour", "2 hours", "4 hours", "6 hours", "12 hours", "24 hours"]} />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">Push interval (hours)</p>
                  <MsgSelect value="2 hours" options={["30 minutes", "1 hour", "2 hours", "4 hours", "8 hours"]} />
                </div>
              </div>
            )}
          </SubSection>
        </div>
      )}

      {tab === "Appearance" && (
        <div className="space-y-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Design system</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Choose the design system used to style emails sent from this project.</p>
            </div>
            <div className="w-full sm:w-72">
              <button className="flex h-10 w-full items-center gap-3 rounded-md border border-stone-200 bg-white px-3 text-left transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-(--input) dark:hover:bg-white/5">
                <span className="flex h-5 w-10 shrink-0 overflow-hidden rounded-sm">
                  <span className="flex-1 bg-[#6f4a8e]" />
                  <span className="flex-1 bg-[#d8c9e8]" />
                  <span className="flex-1 bg-[#3d2658]" />
                  <span className="flex-1 bg-[#f0eaf5]" />
                </span>
                <span className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-200">Alexandria</span>
                <ChevronLeft size={11} className="-rotate-90 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Default email logo</p>
              <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Upload the logo displayed in email headers and previews.</p>
            </div>
            <div className="flex shrink-0 flex-col items-center">
              <div className="group relative flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-stone-200 bg-stone-50 text-stone-400 dark:border-(--border) dark:bg-(--muted)">
                <Image size={22} />
                <span className="pointer-events-none absolute bottom-[calc(100%+7px)] right-0 z-30 w-max max-w-52 rounded-lg px-2.5 py-1.5 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100" style={{ background: "rgba(24,24,27,0.93)" }}>
                  JPG, PNG, GIF, WebP or SVG. Max 5MB.
                  <span className="absolute right-6 top-full border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
                </span>
              </div>
              <button className="mt-2 text-xs font-medium text-blue-500 transition-colors hover:text-blue-600">Upload</button>
            </div>
          </div>

          <div className="mb-8">
            <SettingsRow label="Add physical address to email" description="Include a compliant mailing address in email footers. Required by CAN-SPAM and similar regulations in other regions and helps your emails comply with regional anti-spam regulations.">
              <button onClick={() => setPhysicalAddress((value) => !value)}>
                <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${physicalAddress ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}><span className={`h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${physicalAddress ? "translate-x-4.5" : "translate-x-0.5"}`} /></span>
              </button>
            </SettingsRow>
            {physicalAddress && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Country</label>
                  <div className="mt-1.5"><FakeSelect value="United States" /></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Street address <span className="text-rose-500">*</span></label>
                  <input defaultValue="123 Main Street" className="mt-1.5 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Street address line 2</label>
                  <input defaultValue="Suite 100" className="mt-1.5 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[['ZIP / Postal code', '94105'], ['City', 'San Francisco'], ['State / Province', 'CA']].map(([label, value]) => (
                    <div key={label}><label className="text-sm font-medium text-stone-700 dark:text-stone-200">{label} <span className="text-rose-500">*</span></label><input defaultValue={value} className="mt-1.5 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" /></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <SubSection title="Email settings" description="Configure reusable navigation and social links for email footers." titleWeight="font-medium">
            <div className="mb-5 flex items-center justify-between gap-4">
              <SubTabCorner tabs={[{ key: "Header Links", label: "Header Links" }, { key: "Social", label: "Social" }]} active={emailSettingsTab} onChange={(key) => setEmailSettingsTab(key as "Header Links" | "Social")} />
              <button onClick={() => emailSettingsTab === "Social" && addSocialLink()} className="h-9 shrink-0 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90">{emailSettingsTab === "Header Links" ? "Add link" : "Add social link"}</button>
            </div>
            {emailSettingsTab === "Header Links" ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-stone-100 p-4 dark:border-(--border)">
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Link 1</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2"><input placeholder="Link text" className="h-9 rounded-md border border-stone-200 px-3 text-sm outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input)" /><input defaultValue="https://fieldsusa.com" className="h-9 rounded-md border border-stone-200 px-3 text-sm outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input)" /></div>
                </div>
                {[2, 3].map((number) => <button key={number} className="flex h-11 w-full items-center rounded-lg border border-stone-100 px-4 text-sm font-medium text-stone-600 dark:border-(--border) dark:text-stone-300">Link {number}</button>)}
              </div>
            ) : (
              <div className="space-y-3">
                {socialLinks.map((link) => {
                  const expanded = expandedSocial === link.id;
                  return (
                    <div key={link.id} className="overflow-hidden rounded-lg border border-stone-100 dark:border-(--border)">
                      <div className={`flex h-12 items-center gap-3 px-4 ${expanded ? "border-b border-stone-100 dark:border-(--border)" : ""}`}>
                        <button onClick={() => setExpandedSocial(expanded ? null : link.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5">
                          <ChevronLeft size={12} className={`transition-transform ${expanded ? "rotate-90" : "rotate-180"}`} />
                        </button>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${expanded ? "bg-blue-50 text-blue-500 dark:bg-blue-500/10" : "bg-stone-100 text-stone-500 dark:bg-(--muted) dark:text-stone-400"}`}>{link.name[0]}</span>
                        <button onClick={() => setExpandedSocial(expanded ? null : link.id)} className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-200">{link.name}</button>
                        <button onClick={() => { setSocialLinks((current) => current.filter((item) => item.id !== link.id)); if (expanded) setExpandedSocial(null); }} className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"><Trash2 size={13} /></button>
                      </div>
                      {expanded && (
                        <div className="grid gap-4 bg-stone-50/50 p-4 sm:grid-cols-2 dark:bg-white/2">
                          <div>
                            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">Platform</label>
                            <div className="mt-1.5"><FakeSelect value={link.platform} /></div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-stone-500 dark:text-stone-400">URL</label>
                            <input value={link.url} onChange={(event) => setSocialLinks((current) => current.map((item) => item.id === link.id ? { ...item, url: event.target.value } : item))} placeholder="https://www.facebook.com/..." className="mt-1.5 h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SubSection>

          <SubSection title="Email preview" description="Preview how the selected appearance settings will look in an email." titleWeight="font-medium">
            <div className="rounded-xl border border-stone-200 p-6 dark:border-(--border)">
              <div className="mx-auto max-w-xl">
                <div className="mb-8 flex justify-center"><span className="flex h-12 w-16 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-(--muted)"><Eye size={18} /></span></div>
                <div className="mb-8 flex justify-center gap-5 text-xs font-medium text-blue-500"><span>Claim 50% off</span><span>Browse products</span></div>
                <h3 className="text-base font-semibold text-stone-800 dark:text-stone-100">Welcome to Your Newsletter</h3>
                <p className="mt-4 text-sm leading-6 text-stone-500 dark:text-stone-400">This is a preview of how your email content will appear. Your selected colors and styles will be applied throughout your emails.</p>
                <button className="mt-5 h-10 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white">Call to action</button>
                <div className="mt-9 border-t border-stone-100 pt-5 text-center text-xs text-stone-400 dark:border-(--border)">© 2026 Your Company. All rights reserved.</div>
              </div>
            </div>
          </SubSection>
        </div>
      )}

    </div>
  );
}

function BookingPreferences() {
  const [noticeValue, setNoticeValue] = useState("1");
  const [noticeUnit, setNoticeUnit] = useState("Hours");
  const [bufferBefore, setBufferBefore] = useState("No buffer");
  const [bufferAfter, setBufferAfter] = useState("No buffer");
  const [maxMeetings, setMaxMeetings] = useState("10");

  const bufferOptions = ["No buffer", "5 minutes", "10 minutes", "15 minutes", "30 minutes", "1 hour"];

  return (
    <div className="border-t border-stone-100 dark:border-(--border) pt-6 mt-6">
      <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Booking Preferences</p>
      <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 mb-6">Personal buffer times and booking limits</p>

      <div className="flex flex-col gap-5">
        {/* Minimum notice */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-stone-700 dark:text-stone-300">Minimum notice</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">How far in advance someone can book time with you</p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              min={0}
              value={noticeValue}
              onChange={(e) => setNoticeValue(e.target.value)}
              className="w-16 h-9 px-3 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 text-center"
            />
            <div className="relative">
              <select
                value={noticeUnit}
                onChange={(e) => setNoticeUnit(e.target.value)}
                className="h-9 appearance-none pl-3 pr-7 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer"
              >
                {["Minutes", "Hours", "Days"].map((u) => <option key={u}>{u}</option>)}
              </select>
              <ChevronLeft size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
            </div>
          </div>
        </div>

        {/* Buffer time */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-stone-700 dark:text-stone-300">Buffer time</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">Padding before and after each meeting</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-stone-400 dark:text-stone-500">Before</span>
              <div className="relative">
                <select
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(e.target.value)}
                  className="h-9 appearance-none pl-3 pr-7 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer w-36"
                >
                  {bufferOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronLeft size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-stone-400 dark:text-stone-500">After</span>
              <div className="relative">
                <select
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(e.target.value)}
                  className="h-9 appearance-none pl-3 pr-7 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-300 outline-none focus:border-blue-400 cursor-pointer w-36"
                >
                  {bufferOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronLeft size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 text-stone-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Max meetings */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-stone-700 dark:text-stone-300">Max meetings per day</p>
          <p className="text-xs text-stone-400 dark:text-stone-500">Limit how many bookings you accept in a single day</p>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              min={1}
              value={maxMeetings}
              onChange={(e) => setMaxMeetings(e.target.value)}
              className="w-16 h-9 px-3 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-blue-400 text-center"
            />
            <span className="text-sm text-stone-400 dark:text-stone-500">meetings</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function DeleteConfirmModal({ target, onClose }: { target: DeleteTarget; onClose: () => void }) {
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const labels: Record<DeleteTarget, { title: string; warning: string }> = {
    account:      { title: "Delete account",      warning: "This will permanently delete your account and all associated data. This action cannot be undone." },
    project:      { title: "Delete project",      warning: "This will permanently delete this project, all its data, members, and settings. This action cannot be undone." },
    organization: { title: "Delete organization", warning: "This will permanently delete the organization and all projects, members, and data within it. This action cannot be undone." },
  };

  function handleSendOtp() {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1200);
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px]" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-(--raised) shadow-2xl border border-stone-100 dark:border-(--border) p-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "#fde8e8" }}>
            <AlertTriangle size={16} style={{ color: "#cc0000" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{labels[target].title}</p>
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 leading-relaxed">{labels[target].warning}</p>
          </div>
        </div>

        {/* OTP step */}
        <div className="rounded-xl bg-stone-50 dark:bg-(--muted) border border-stone-100 dark:border-(--border) px-4 py-4 mb-5">
          <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Verify your identity</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
            {sent ? "A 6-digit code was sent to rana@intempt.com" : "We'll send a one-time code to the registered owner email."}
          </p>
          {sent ? (
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              className="w-full h-9 rounded-lg border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 text-sm text-stone-700 dark:text-stone-200 outline-none focus:border-rose-400 tracking-widest placeholder:tracking-normal"
            />
          ) : (
            <button
              onClick={handleSendOtp}
              disabled={sending}
              className="h-9 px-4 rounded-lg border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send OTP to rana@intempt.com"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/6 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={otp.length < 6}
            className="h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: "#ef4444" }}
          >
            {labels[target].title}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteRow({ target, label, desc }: { target: DeleteTarget; label: string; desc: string }) {
  const onDelete = useContext(DangerContext);
  return (
    <div className="mt-8 pt-6 border-t border-stone-100 dark:border-(--border) flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{label}</p>
        <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={() => onDelete(target)}
        className="shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-85"
        style={{ background: "#cc0000" }}
      >
        <Trash2 size={13} />
        Delete
      </button>
    </div>
  );
}


function MobileNav({ selected, onBack, onNav }: { selected: string; onBack: () => void; onNav: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const currentSection = settingsNav.find((s) => s.items.some((i) => i.key === selected));
  const currentItem = currentSection?.items.find((i) => i.key === selected);

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden flex items-center gap-1 px-3 pt-3 pb-2 shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-md text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors"
        >
          <PanelLeftOpen size={16} />
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors px-1"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
        {currentSection && currentItem && (
          <div className="ml-auto flex items-center gap-1 pr-1">
            <button
              onClick={() => setOpen(true)}
              className="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              {currentSection.heading}
            </button>
            <span className="text-sm text-stone-300 dark:text-stone-600">/</span>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{currentItem.label}</span>
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          background: "rgba(0,0,0,0.3)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in drawer */}
      <div
        className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 shadow-xl transition-transform duration-200 ease-out"
        style={{
          background: "var(--main-bg)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-4 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to app</span>
        </button>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {settingsNav.map((section) => (
            <div key={section.heading}>
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-600">
                {section.heading}
              </p>
              <div className="space-y-px">
                {section.items.map((item) => {
                  const isActive = selected === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => { onNav(item.key); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left text-sm font-[450] transition-colors duration-100 group
                        ${isActive
                          ? "bg-white dark:bg-white/8 text-stone-800 dark:text-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                          : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-100"
                        }`}
                    >
                      <span className={isActive ? "text-blue-600" : "text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2 px-4 py-3.5 shrink-0">
          <img src="/logo.png" alt="Intempt" width={18} height={18} className="rounded-md opacity-60" style={{ objectFit: "contain" }} />
          <span className="flex-1 text-xs font-medium text-stone-400 dark:text-stone-600 tracking-tight">Intempt</span>
        </div>
      </div>
    </>
  );
}

// ── SettingsTable — wider table wrapper for settings pages ────────────────────

function SettingsTable({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-hidden rounded-xl flex flex-col mb-4 md:mb-6"
      style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}

// ── Domains ──────────────────────────────────────────────────────────────────

type Capability = "Booking" | "Click tracking" | "Privacy center" | "Email sending";

const CAPABILITY_COLORS: Record<Capability, string> = {
  "Booking":        "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "Click tracking": "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Privacy center": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "Email sending":  "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

const ALL_CAPABILITIES: Capability[] = ["Booking", "Click tracking", "Privacy center", "Email sending"];

interface DomainRow { id: string; domain: string; capabilities: Capability[]; status: "Verified" | "Failed" | "Pending"; }

const INITIAL_DOMAINS: DomainRow[] = [
  { id: "d1", domain: "preferences-prod.tryintempt.com", capabilities: ["Privacy center"], status: "Failed" },
  { id: "d2", domain: "tracking-prod.tryintempt.com",   capabilities: ["Click tracking"],  status: "Failed" },
  { id: "d3", domain: "prod.tryintempt.com",            capabilities: ["Email sending"],   status: "Verified" },
  { id: "d4", domain: "bookings.intempt-demo.com", capabilities: ["Booking"], status: "Verified" },
  { id: "d5", domain: "links.intempt-demo.com", capabilities: ["Click tracking", "Privacy center"], status: "Verified" },
  { id: "d6", domain: "mail.intempt-demo.com", capabilities: ["Email sending"], status: "Pending" },
  { id: "d7", domain: "calendar.acme-example.com", capabilities: ["Booking"], status: "Verified" },
  { id: "d8", domain: "engage.acme-example.com", capabilities: ["Email sending", "Click tracking"], status: "Verified" },
  { id: "d9", domain: "privacy.acme-example.com", capabilities: ["Privacy center"], status: "Pending" },
  { id: "d10", domain: "meet.northstar-demo.com", capabilities: ["Booking"], status: "Failed" },
  { id: "d11", domain: "clicks.northstar-demo.com", capabilities: ["Click tracking"], status: "Verified" },
  { id: "d12", domain: "messages.northstar-demo.com", capabilities: ["Email sending"], status: "Verified" },
  { id: "d13", domain: "consent.northstar-demo.com", capabilities: ["Privacy center"], status: "Verified" },
  { id: "d14", domain: "schedule.orbit-example.com", capabilities: ["Booking", "Email sending"], status: "Pending" },
  { id: "d15", domain: "go.orbit-example.com", capabilities: ["Click tracking"], status: "Verified" },
  { id: "d16", domain: "preferences.orbit-example.com", capabilities: ["Privacy center"], status: "Verified" },
  { id: "d17", domain: "appointments.vertex-demo.com", capabilities: ["Booking"], status: "Verified" },
  { id: "d18", domain: "email.vertex-demo.com", capabilities: ["Email sending", "Click tracking"], status: "Failed" },
];

function CapBadge({ cap }: { cap: Capability }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CAPABILITY_COLORS[cap]}`}>
      {cap}
    </span>
  );
}

function DomainsSection() {
  const [domains, setDomains] = useState<DomainRow[]>(INITIAL_DOMAINS);
  const [modalOpen, setModalOpen] = useState(false);

  // form state
  const [domainName, setDomainName] = useState("");
  const [selectedCaps, setSelectedCaps] = useState<Capability[]>(["Email sending"]);
  const [mailFrom, setMailFrom] = useState("mail");

  function toggleCap(c: Capability) {
    setSelectedCaps((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  function handleAdd() {
    if (!domainName.trim() || selectedCaps.length === 0) return;
    setDomains((prev) => [...prev, {
      id: `d${Date.now()}`,
      domain: domainName.trim(),
      capabilities: selectedCaps,
      status: "Pending",
    }]);
    setDomainName(""); setSelectedCaps(["Email sending"]); setMailFrom("mail");
    setModalOpen(false);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader title="Domains" sub="Verify once at the org level, then assign to projects for booking, click tracking, privacy center, and email sending." />

        {/* Connected domains header */}
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Connected domains</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Enable each domain for one or more capabilities — DNS verified once. Assign via <span className="font-medium text-stone-500 dark:text-stone-400">Project → Connectors → Domains</span>; per-project addresses (e.g. hello@yourdomain.com) are set in the project.</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              Add domain
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <SettingsTable>
      <div className="min-w-[760px]">
        {/* Header */}
        <div className="sticky top-0 z-10 grid grid-cols-[2fr_1.4fr_90px_80px] gap-4 px-4 py-2.5 border-b border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted)">
          {["Domain","Capabilities","Status","Used by"].map((h) => (
            <span key={h} className="text-xs font-semibold text-stone-400 dark:text-stone-500">{h}</span>
          ))}
        </div>
        {/* Rows */}
        {domains.map((row, i) => (
          <div key={row.id} className={`grid grid-cols-[2fr_1.4fr_90px_80px] gap-4 items-center px-4 py-3 ${i > 0 ? "border-t border-stone-100 dark:border-(--border)" : ""}`}>
            <div className="relative group min-w-0">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate block">{row.domain}</span>
              <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 rounded-lg px-2.5 py-1.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{ background: "rgba(24,24,27,0.93)" }}>
                {row.domain}
                <span className="absolute top-full left-4 border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
              </span>
            </div>
            <div className="flex flex-col items-start gap-2">
              {row.capabilities.map((c) => <CapBadge key={c} cap={c} />)}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.status === "Verified" ? "text-emerald-500" : row.status === "Failed" ? "text-rose-500" : "text-stone-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${row.status === "Verified" ? "bg-emerald-400" : row.status === "Failed" ? "bg-rose-400" : "bg-stone-300"}`} />
              {row.status}
            </span>
            <button className="text-xs font-medium text-blue-500 hover:underline text-left">Projects</button>
          </div>
        ))}
      </div>
      </SettingsTable>

      {/* Add domain modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.35)" }} onClick={() => setModalOpen(false)}>
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={() => setModalOpen(false)} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
              <X size={15} />
            </button>

            <h2 className="text-base font-semibold text-stone-800 dark:text-stone-100 mb-1">Add a domain</h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-5">Enter a domain you own. You'll get DNS records to verify ownership.</p>

            {/* Domain name */}
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">Domain name</label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="book.yourcompany.com"
              className="w-full rounded-lg border border-stone-200 dark:border-(--border) bg-transparent px-3 py-2 text-sm text-stone-700 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-600 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors mb-4"
            />

            {/* Capability */}
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">Capability</label>
            <div className="flex flex-col gap-2 mb-4">
              {ALL_CAPABILITIES.map((cap) => {
                const checked = selectedCaps.includes(cap);
                return (
                  <label key={cap} className="flex items-center gap-2.5 cursor-pointer select-none">
                    <span
                      onClick={() => toggleCap(cap)}
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${checked ? "bg-blue-500 border-blue-500" : "border-stone-300 dark:border-stone-600"}`}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-stone-700 dark:text-stone-200">{cap}</span>
                  </label>
                );
              })}
            </div>

            {/* Mail-from subdomain */}
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
              Mail-from subdomain <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={mailFrom}
              onChange={(e) => setMailFrom(e.target.value)}
              placeholder="mail"
              className="w-full rounded-lg border border-stone-200 dark:border-(--border) bg-transparent px-3 py-2 text-sm text-stone-700 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-600 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors mb-1.5"
            />
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-6">Used as the MAIL FROM address (e.g. "mail" → mail.yourcompany.com)</p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="h-9 px-4 rounded-lg border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="h-9 px-4 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                Add domain
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

function SubSectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">{children}</p>;
}

function SecuritySection() {
  const [mfaOn, setMfaOn] = useState(false);
  const [passkeys] = useState<string[]>([]);

  const SESSIONS = [
    { id: "s1", name: "intempt-console", lastActive: "about 3 hours ago", isCurrentDevice: false },
    { id: "s2", name: "intempt-console", lastActive: "about 21 hours ago", isCurrentDevice: true },
  ];

  return (
    <div>
      <SectionHeader title="Security" sub="Manage your authentication methods, passkeys, and active sessions." />

      {/* MFA */}
      <div className="mb-8">
        <SubSectionLabel>Multi-factor authentication (MFA)</SubSectionLabel>
        <div className="mt-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-(--muted)">
              <Smartphone size={15} className="text-stone-400 dark:text-stone-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Authenticator app</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Use one-time codes from an authenticator app.</p>
            </div>
            <button onClick={() => setMfaOn((v) => !v)} aria-pressed={mfaOn} className="shrink-0">
              <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${mfaOn ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${mfaOn ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Passkeys */}
      <div className="mb-8">
        <SubSectionLabel>Passkeys</SubSectionLabel>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Sign in without a password using your device's built-in security.</p>
        <div className="flex justify-end mt-4">
          <button
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Add passkey
          </button>
        </div>
        {passkeys.length === 0 ? (
          <p className="mt-4 text-xs text-stone-400 dark:text-stone-500 text-center">No passkeys yet.</p>
        ) : null}
      </div>

      {/* Active sessions */}
      <div className="mb-8">
        <SubSectionLabel>Active sessions</SubSectionLabel>
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-3 -mt-1">Devices and browsers currently signed in to your account. Revoke any you don't recognize.</p>
        <div className="flex flex-col gap-1 mt-3">
          {SESSIONS.map((session) => (
            <div key={session.id} className="flex items-center gap-3.5 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-(--muted)">
                <Globe size={15} className="text-stone-400 dark:text-stone-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{session.name}</p>
                  {session.isCurrentDevice && (
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      This device
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Last active {session.lastActive}</p>
              </div>
              {!session.isCurrentDevice && (
                <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-stone-300 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout actions */}
      <div className="flex flex-col border-t border-stone-100 dark:border-(--border)">
        <div className="flex items-center justify-between gap-6 py-4 border-b border-stone-100 dark:border-(--border)">
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Log out of this device</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Sign out from your current session.</p>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 h-9 px-4 rounded-lg border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <LogOut size={13} />
            Log out
          </button>
        </div>
        <div className="flex items-center justify-between gap-6 py-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Log out of all devices</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Log out of all active sessions across all devices, including your current session.</p>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 h-9 px-4 rounded-lg border border-rose-200 dark:border-rose-500/30 text-xs font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/8 transition-colors">
            <LogOut size={13} />
            Log out all
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailabilitySection() {
  const [useProjectDefaults, setUseProjectDefaults] = useState(false);

  return (
    <div>
      <SectionHeader title="My availability" sub="Configure your working hours and out-of-office periods so teammates and AI know when you're around." />

      {/* Use project defaults toggle */}
      <div className="flex items-start justify-between gap-4 py-3 mb-4">
        <div className="min-w-0">
          <p className={`text-sm font-medium transition-colors ${useProjectDefaults ? "text-stone-700 dark:text-stone-200" : "text-stone-400 dark:text-stone-500"}`}>Use project defaults</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Inherit availability settings from your project</p>
        </div>
        <button onClick={() => setUseProjectDefaults((v) => !v)} className="shrink-0 mt-0.5" aria-pressed={useProjectDefaults}>
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${useProjectDefaults ? "bg-blue-500" : "bg-stone-200 dark:bg-stone-600"}`}>
            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${useProjectDefaults ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </span>
        </button>
      </div>

      {!useProjectDefaults && (
        <>
          <WeeklyHours />
          <DateOverridesSection />
          <BookingPreferences />
        </>
      )}

      <BluPreferencesSection />
      <OOOSection />
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────

type MemberRole = "Owner" | "Admin" | "Billing Admin" | "Member";

const ROLE_STYLE: Record<MemberRole, string> = {
  "Owner":         "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Admin":         "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  "Billing Admin": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  "Member":        "bg-stone-100 text-stone-500 border-stone-200 dark:bg-white/8 dark:text-stone-400 dark:border-(--border)",
};

const TEAM_MEMBERS = [
  { name: "Roman Bohdan",        email: "roman@intempt.com",           role: "Owner" as MemberRole,         color: "#0080FF" },
  { name: "Sid Chaudhary",       email: "sid@intempt.com",             role: "Owner" as MemberRole,         color: "#8B5CF6" },
  { name: "Titas Kumpys",        email: "titas@intempt.com",           role: "Admin" as MemberRole,         color: "#0D9488" },
  { name: "Koray",               email: "koray@intempt.com",           role: "Owner" as MemberRole,         color: "#F59E0B" },
  { name: "Yaroslav Bezruchenko",email: "yaroslav@intempt.com",        role: "Admin" as MemberRole,         color: "#6366F1" },
  { name: "Hennadii Asmolov",    email: "hennadii@intempt.com",        role: "Admin" as MemberRole,         color: "#EC4899" },
  { name: "Daniil Zinoveev",     email: "daniil@intempt.com",          role: "Billing Admin" as MemberRole, color: "#F97316" },
  { name: "Somya Nayak",         email: "somya@intempt.com",           role: "Owner" as MemberRole,         color: "#0D9488" },
  { name: "Trishik Shrestha",    email: "trishik@intempt.com",         role: "Member" as MemberRole,        color: "#F59E0B" },
  { name: "Yaroslav Bezruchenko",email: "bezruchenko.y.v@gmail.com",   role: "Member" as MemberRole,        color: "#6366F1" },
  { name: "Beso Gugushvili",     email: "beso@intempt.com",            role: "Billing Admin" as MemberRole, color: "#0080FF" },
  { name: "nandini",             email: "nandini@intempt.com",         role: "Member" as MemberRole,        color: "#EC4899" },
  { name: "Hardik Sharma",       email: "hardik@intempt.com",          role: "Member" as MemberRole,        color: "#10B981" },
  { name: "sandip",              email: "sandip@intempt.com",          role: "Member" as MemberRole,        color: "#8B5CF6" },
  { name: "Rana Vivyanu",        email: "rana@intempt.com",            role: "Member" as MemberRole,        color: "#0080FF" },
  { name: "Aarav Mehta",         email: "aarav@intempt.com",           role: "Member" as MemberRole,        color: "#14B8A6" },
  { name: "Maya Thompson",       email: "maya@intempt.com",            role: "Admin" as MemberRole,         color: "#F43F5E" },
  { name: "Noah Williams",       email: "noah@intempt.com",            role: "Member" as MemberRole,        color: "#3B82F6" },
  { name: "Olivia Martin",       email: "olivia@intempt.com",          role: "Billing Admin" as MemberRole, color: "#A855F7" },
  { name: "Ethan Walker",        email: "ethan@intempt.com",           role: "Member" as MemberRole,        color: "#22C55E" },
  { name: "Sophia Chen",         email: "sophia@intempt.com",          role: "Admin" as MemberRole,         color: "#EAB308" },
  { name: "Liam Anderson",       email: "liam@intempt.com",            role: "Member" as MemberRole,        color: "#06B6D4" },
  { name: "Emma Wilson",         email: "emma@intempt.com",            role: "Member" as MemberRole,        color: "#F97316" },
  { name: "Lucas Brown",         email: "lucas@intempt.com",           role: "Member" as MemberRole,        color: "#6366F1" },
  { name: "Isabella Garcia",     email: "isabella@intempt.com",        role: "Admin" as MemberRole,         color: "#EC4899" },
];

function TeamSection() {
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full max-w-4xl mx-auto px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader title="Team" sub="Manage your organization's team members of Intempt Internal Use Only." />
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Organization members</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
            Invite people to your organization, assign roles, and manage their access across projects and shared resources.
          </p>
          <div className="flex justify-end mt-3">
            <button
              className="flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              Invite member
            </button>
          </div>
        </div>
      </div>

      <SettingsTable>
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="sticky top-0 z-10 grid grid-cols-[2fr_2fr_1.2fr_1fr_80px] px-4 py-2.5 border-b border-stone-100 dark:border-(--border) bg-stone-50 dark:bg-(--muted)">
          {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
            <span key={h} className="text-xs font-semibold text-stone-400 dark:text-stone-500">{h}</span>
          ))}
        </div>
        {/* Rows */}
        {TEAM_MEMBERS.map((m, i) => (
          <div key={`${m.email}-${i}`} className={`grid grid-cols-[2fr_2fr_1.2fr_1fr_80px] items-center px-4 py-3 ${i > 0 ? "border-t border-stone-100 dark:border-(--border)" : ""}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: m.color }}
              >
                {m.name[0].toUpperCase()}
              </span>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 truncate">{m.name}</span>
            </div>
            <span className="text-sm text-stone-500 dark:text-stone-400 truncate pr-4">{m.email}</span>
            <span className={`inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium ${ROLE_STYLE[m.role]}`}>
              {m.role}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
            <span className="text-sm text-stone-300 dark:text-stone-600">—</span>
          </div>
        ))}
      </div>
      </SettingsTable>
    </div>
  );
}

type RoleTab = "Org roles (0)" | "Project roles (0)" | "Custom (0)";
type RoleRow = { name: string; description: string; scope: string; members: number };

const ORG_ROLES: RoleRow[] = [
  { name: "Organization owner", description: "Full organization access, including billing and security settings.", scope: "Organization", members: 2 },
  { name: "Organization admin", description: "Manage members, projects, domains, and organization settings.", scope: "Organization", members: 4 },
  { name: "Billing admin", description: "Manage subscriptions, invoices, and organization billing details.", scope: "Billing", members: 2 },
  { name: "Organization member", description: "View organization resources and access assigned projects.", scope: "Organization", members: 18 },
];

const PROJECT_ROLES: RoleRow[] = [
  { name: "Project owner", description: "Full control over a project, its settings, and member access.", scope: "Project", members: 5 },
  { name: "Project admin", description: "Manage project resources, integrations, and team members.", scope: "Project", members: 9 },
  { name: "Editor", description: "Create and update project content, journeys, and experiences.", scope: "Content", members: 14 },
  { name: "Analyst", description: "View analytics, dashboards, and reports without editing content.", scope: "Analytics", members: 7 },
  { name: "Viewer", description: "Read-only access to assigned project resources.", scope: "Read only", members: 11 },
];

function RolesTable({ rows }: { rows: RoleRow[] }) {
  return (
    <SettingsTable>
      <div className="min-w-[760px]">
        <div className="sticky top-0 z-10 grid grid-cols-[1.2fr_2fr_1fr_90px] gap-4 border-b border-stone-100 bg-stone-50 px-4 py-2.5 dark:border-(--border) dark:bg-(--muted)">
          {["Role", "Description", "Scope", "Members"].map((heading) => (
            <span key={heading} className="text-xs font-semibold text-stone-400 dark:text-stone-500">{heading}</span>
          ))}
        </div>
        {rows.map((role, index) => (
          <div key={role.name} className={`grid grid-cols-[1.2fr_2fr_1fr_90px] items-center gap-4 px-4 py-3 ${index ? "border-t border-stone-100 dark:border-(--border)" : ""}`}>
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{role.name}</span>
            <span className="text-xs leading-5 text-stone-400 dark:text-stone-500">{role.description}</span>
            <span className="w-fit rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-500 dark:border-(--border) dark:bg-white/8 dark:text-stone-400">{role.scope}</span>
            <span className="text-sm text-stone-500 dark:text-stone-400">{role.members}</span>
          </div>
        ))}
      </div>
    </SettingsTable>
  );
}

function RolesSection() {
  const tabs: RoleTab[] = ["Org roles (0)", "Project roles (0)", "Custom (0)"];
  const [tab, setTab] = useState<RoleTab>(tabs[0]);

  return (
    <div className="flex-1 flex min-h-0 w-full max-w-4xl mx-auto flex-col px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader
          title="Roles & Permissions"
          sub="The single source of truth for every role in your organization. Standard and custom roles defined here are available to assign in every project."
        />
        <div className="mb-6 flex items-center justify-between gap-4">
          <SubTabCorner
            tabs={tabs.map((item) => ({ key: item, label: item }))}
            active={tab}
            onChange={(key) => setTab(key as RoleTab)}
          />
          <button className="flex h-9 shrink-0 items-center rounded-md px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
            Create custom role
          </button>
        </div>
      </div>

      {tab === "Org roles (0)" && <RolesTable rows={ORG_ROLES} />}
      {tab === "Project roles (0)" && <RolesTable rows={PROJECT_ROLES} />}
      {tab === "Custom (0)" && (
        <div className="flex flex-1 min-h-40 items-center justify-center rounded-xl border border-dashed border-stone-200 mb-6 dark:border-(--border)">
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">No custom roles</p>
            <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Create a custom role to define a tailored set of permissions.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ApiKeysSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyType, setKeyType] = useState<"Public" | "Private" | "Admin">("Public");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const projects = ["Dev Playground", "Linea"];
  const canCreate = keyName.trim().length > 0 && (keyType === "Admin" || selectedProjects.length > 0);

  function closeModal() {
    setModalOpen(false);
    setKeyName("");
    setKeyType("Public");
    setProjectSearch("");
    setSelectedProjects([]);
  }

  function toggleProject(project: string) {
    setSelectedProjects((current) => current.includes(project)
      ? current.filter((item) => item !== project)
      : [...current, project]);
  }

  return (
    <div>
      <SectionHeader
        title="API keys"
        sub="Manage API credentials and control programmatic access across your organization."
      />
      <div className="mb-8 border-b border-stone-100 pb-6 dark:border-(--border)">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">API keys</p>
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-stone-500 dark:bg-white/8 dark:text-stone-400">0</span>
          </div>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Create public, private, and admin keys across any of your projects from one place.</p>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-md px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "#0080FF" }}>
            Create Key
          </button>
        </div>
      </div>
      <div className="flex min-h-48 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-400 dark:bg-(--muted) dark:text-stone-500">
            <KeyRound size={16} />
          </div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">No API keys</p>
          <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Create a key to start authenticating API requests.</p>
        </div>
      </div>

      {modalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.35)" }} onClick={closeModal}>
          <div
            className="relative flex max-h-[calc(100vh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-5">
              <button onClick={closeModal} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 dark:hover:bg-white/8">
                <X size={15} />
              </button>
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">Create API key</h2>
              <p className="mt-1 text-sm text-stone-400 dark:text-stone-500">Generate a public, private, or admin key for your organization.</p>

              <div className="mt-6">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-200">Name <span className="text-rose-500">*</span></label>
                <input value={keyName} onChange={(event) => setKeyName(event.target.value)} placeholder="e.g. server-sync" className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-500 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                {!keyName.trim() && <p className="mt-1.5 text-xs text-rose-500">Name is required</p>}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-200">Type</p>
                <div className="space-y-2">
                  {([
                    ["Public", "Client-side key, safe to expose in the browser."],
                    ["Private", "Server-side secret. Keep it confidential."],
                    ["Admin", "Organization-wide management key. Not tied to a project."],
                  ] as const).map(([type, description]) => (
                    <button key={type} onClick={() => setKeyType(type)} className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${keyType === type ? "border-blue-500 bg-blue-50/70 dark:bg-blue-500/10" : "border-stone-200 hover:bg-stone-50 dark:border-(--border) dark:hover:bg-white/5"}`}>
                      <div className="flex gap-3">
                        <Shield size={14} className={keyType === type ? "mt-0.5 text-blue-500" : "mt-0.5 text-stone-400"} />
                        <div>
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{type}</p>
                          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">{description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {keyType !== "Admin" && <div className="mt-5">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Projects <span className="text-rose-500">*</span></p>
                <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">Assign this key to one or more projects.</p>
                <input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects…" className="mt-2 h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-blue-500 dark:border-(--border) dark:bg-(--input) dark:text-stone-200" />
                <div className="mt-2 overflow-hidden rounded-lg border border-stone-200 dark:border-(--border)">
                  {projects.filter((project) => project.toLowerCase().includes(projectSearch.toLowerCase())).map((project, index) => {
                    const selected = selectedProjects.includes(project);
                    return (
                      <button key={project} onClick={() => toggleProject(project)} className={`flex h-10 w-full items-center gap-2 px-3 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5 ${index ? "border-t border-stone-200 dark:border-(--border)" : ""}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded border ${selected ? "border-blue-500 bg-blue-500 text-white" : "border-stone-200 dark:border-stone-600"}`}>
                          {selected && <span className="text-xs leading-none">✓</span>}
                        </span>
                        {project}
                      </button>
                    );
                  })}
                </div>
                {selectedProjects.length === 0 && <p className="mt-1.5 text-xs text-rose-500">Select at least one project</p>}
              </div>}
            </div>

            <div className="flex justify-end gap-2 border-t border-stone-100 px-6 py-4 dark:border-(--border)">
              <button onClick={closeModal} className="h-9 rounded-lg border border-stone-200 px-4 text-sm font-medium text-stone-600 hover:bg-stone-50 dark:border-(--border) dark:text-stone-300 dark:hover:bg-white/5">Cancel</button>
              <button disabled={!canCreate} onClick={closeModal} className="h-9 rounded-md bg-blue-500 px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-45">Create key</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const AUDIT_ROWS = [
  ["51m ago", "Aman Tiwari", "updated", "experience", "Test ABC", "Linea"],
  ["51m ago", "Aman Tiwari", "updated", "experience", "July 3rd", "Linea"],
  ["20h ago", "Roman Bohdan", "updated", "attribute", "Lifetime Revenue", "Dev Playground"],
  ["20h ago", "Roman Bohdan", "created", "attribute", "test_123", "Dev Playground"],
  ["22h ago", "Roman Bohdan", "updated", "attribute", "Test 2", "Dev Playground"],
  ["22h ago", "Roman Bohdan", "created", "attribute", "Test 2", "Dev Playground"],
  ["22h ago", "Roman Bohdan", "updated", "attribute", "test date", "Dev Playground"],
  ["22h ago", "Roman Bohdan", "created", "attribute", "test num", "Dev Playground"],
  ["1d ago", "Somya Nayak", "invited", "member", "Harish Kumar", "Linea"],
  ["1d ago", "Rana Vivyanu", "created", "API key", "Server sync", "Dev Playground"],
  ["2d ago", "Titas Kumpys", "updated", "role", "Project admin", "Linea"],
  ["2d ago", "Sid Chaudhary", "verified", "domain", "mail.intempt.com", "Dev Playground"],
  ["3d ago", "Somya Nayak", "updated", "member", "Aman Tiwari", "Linea"],
  ["3d ago", "Roman Bohdan", "created", "project", "Growth Sandbox", "Dev Playground"],
  ["4d ago", "Hennadii Asmolov", "revoked", "API key", "Legacy integration", "Linea"],
  ["4d ago", "Yaroslav Bezruchenko", "updated", "domain", "tracking.intempt.com", "Dev Playground"],
  ["5d ago", "Rana Vivyanu", "created", "role", "Campaign analyst", "Linea"],
  ["5d ago", "Sid Chaudhary", "removed", "member", "External contractor", "Dev Playground"],
  ["6d ago", "Titas Kumpys", "updated", "billing", "Payment method", "Linea"],
  ["6d ago", "Somya Nayak", "enabled", "SSO", "Google Workspace", "Dev Playground"],
  ["7d ago", "Roman Bohdan", "archived", "project", "Q2 Experiments", "Linea"],
  ["7d ago", "Aman Tiwari", "rotated", "API key", "Production server", "Dev Playground"],
  ["8d ago", "Hennadii Asmolov", "updated", "role", "Billing admin", "Linea"],
  ["9d ago", "Rana Vivyanu", "verified", "domain", "bookings.intempt.com", "Dev Playground"],
];

const LOGIN_ROWS = [
  ["04:13:02 PM", "ved@intempt.com", "GOOGLE", "210.79.133.26", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["03:26:26 PM", "markiian@intempt.com", "GOOGLE", "91.246.66.170", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["02:46:55 PM", "roman@intempt.com", "EMAIL CODE", "31.133.116.176", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["02:42:29 PM", "somya@intempt.com", "GOOGLE", "117.199.226.23", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["02:31:44 PM", "harish@intempt.com", "GOOGLE", "104.28.155.2", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["01:16:28 PM", "beso@intempt.com", "GOOGLE", "176.221.142.193", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
  ["12:32:25 PM", "aman@intempt.com", "GOOGLE", "49.37.43.109", "IntemptApp/167 CFNetwork/3860.600.12 Darwin"],
  ["12:19:54 PM", "yaroslav@intempt.com", "GOOGLE", "31.183.149.68", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
  ["11:45:05 AM", "hennadii@intempt.com", "GOOGLE", "46.33.33.89", "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0)"],
  ["11:42:34 AM", "rana@intempt.com", "GOOGLE", "104.28.155.52", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"],
  ["10:11:03 PM", "koray@intempt.com", "GOOGLE", "151.250.149.51", "IntemptApp/1 CFNetwork/3860.600.12 Darwin"],
  ["08:22:40 PM", "beso@intempt.com", "GOOGLE", "176.221.142.193", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
  ["07:46:52 PM", "matvey@intempt.com", "GOOGLE", "31.133.116.176", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["06:21:36 PM", "hennadii@intempt.com", "GOOGLE", "46.33.33.89", "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:152.0)"],
  ["05:42:16 PM", "aman@intempt.com", "GOOGLE", "49.37.43.109", "IntemptApp/167 CFNetwork/3860.600.12 Darwin"],
  ["05:16:29 PM", "koray@intempt.com", "GOOGLE", "151.250.149.51", "Bun/1.2.23"],
  ["04:54:08 PM", "rana@intempt.com", "GOOGLE", "157.50.148.175", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"],
  ["03:38:41 PM", "sid@intempt.com", "EMAIL CODE", "103.86.71.44", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"],
  ["02:17:09 PM", "titas@intempt.com", "GOOGLE", "78.62.114.20", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
  ["01:03:57 PM", "nandini@intempt.com", "GOOGLE", "122.161.55.91", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["11:49:22 AM", "hardik@intempt.com", "EMAIL CODE", "49.36.220.18", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"],
  ["09:28:14 AM", "somya@intempt.com", "GOOGLE", "117.199.226.23", "IntemptApp/167 CFNetwork/3860.600.12 Darwin"],
  ["08:12:33 AM", "roman@intempt.com", "GOOGLE", "31.133.116.176", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"],
  ["07:05:48 AM", "yaroslav@intempt.com", "GOOGLE", "31.183.149.68", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
];

function AuditLogSection() {
  const [tab, setTab] = useState<"Audit log" | "Login history">("Audit log");
  const [actorOpen, setActorOpen] = useState(false);
  const [selectedActor, setSelectedActor] = useState("");
  const filters = ["Last 7 days", "All actors", "All targets", "All actions", "Any outcome", "Any severity"];
  const actors = Array.from(new Set(AUDIT_ROWS.map((row) => row[1])));

  return (
    <div className="flex-1 flex min-h-0 w-full max-w-4xl mx-auto flex-col px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader
          title="Audit log"
          sub="Org-level events — SSO, RBAC, billing, members, API keys, project lifecycle. For project events (agents, journeys, CRM) see the project's audit log."
        />
        <div className="mb-6 flex items-center justify-between gap-4">
          <SubTabCorner
            tabs={[{ key: "Audit log", label: "Audit log" }, { key: "Login history", label: "Login history" }]}
            active={tab}
            onChange={(key) => setTab(key as "Audit log" | "Login history")}
          />
          <button className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"><Download size={13} />Export CSV</button>
        </div>
      </div>

      {tab === "Audit log" ? (
        <>
          <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <div className="relative min-w-56 flex-1 max-w-72">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input placeholder="Search action, target, request id" className="h-9 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400 dark:border-(--border) dark:bg-(--input)" />
              </div>
              {filters.map((filter) => filter === "All actors" ? (
              <div key={filter} className="relative">
                <button onClick={() => setActorOpen((open) => !open)} className={`flex h-9 min-w-36 items-center justify-between gap-3 rounded-md border bg-white px-3 text-sm text-stone-700 transition-colors hover:bg-stone-50 dark:bg-(--input) dark:text-stone-200 dark:hover:bg-white/8 ${actorOpen ? "border-blue-400" : "border-stone-200 dark:border-(--border)"}`}>
                  <span className="truncate">{selectedActor || "All actors"}</span>
                  <ChevronLeft size={11} className={`shrink-0 text-stone-400 transition-transform ${actorOpen ? "rotate-90" : "-rotate-90"}`} />
                </button>
                {actorOpen && (
                  <div className="absolute left-0 top-[calc(100%+5px)] z-40 min-w-52 overflow-hidden rounded-lg py-1 animate-card-in" style={{ background: "var(--raised)", border: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {["", ...actors].map((actor) => (
                      <button key={actor || "all"} onClick={() => { setSelectedActor(actor); setActorOpen(false); }} className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 dark:hover:bg-white/6 ${selectedActor === actor ? "font-semibold text-blue-600 dark:text-blue-400" : "text-stone-600 dark:text-stone-300"}`}>
                        {actor || "All actors"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              ) : <FakeSelect key={filter} value={filter} />)}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="text-xs whitespace-nowrap text-stone-400">◷ Retained 90 days</span>
            </div>
          </div>
          <SettingsTable>
            <div className="min-w-[920px]">
              <div className="sticky top-0 z-10 grid grid-cols-[130px_220px_minmax(110px,1fr)_120px_minmax(150px,1.2fr)_120px] bg-stone-50 dark:bg-(--muted)">
                {["When", "Actor", "Action", "Target", "Project", "Outcome"].map((heading) => <span key={heading} className="border-b border-r border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-500 last:border-r-0 dark:border-(--border)">{heading}</span>)}
              </div>
              {AUDIT_ROWS.map((row, index) => (
                <div key={index} className="grid grid-cols-[130px_220px_minmax(110px,1fr)_120px_minmax(150px,1.2fr)_120px]">
                  <span className="border-b border-r border-stone-200 px-3 py-2 text-sm text-stone-500 dark:border-(--border)">{row[0]}</span>
                  <span className="flex items-center gap-2 border-b border-r border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-(--border) dark:text-stone-200">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                      {row[1].split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </span>
                    <span className="truncate">{row[1]}</span>
                  </span>
                  <span className="capitalize border-b border-r border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-(--border) dark:text-stone-200">{row[2]}</span>
                  <span className="group relative flex items-center border-b border-r border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-(--border) dark:text-stone-200">
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/12 dark:text-blue-400">{row[3]}</span>
                    <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-3 z-30 max-w-60 rounded-lg px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100" style={{ background: "rgba(24,24,27,0.93)" }}>
                      <span className="block truncate whitespace-nowrap">{row[4]}</span>
                      <span className="absolute left-4 top-full border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
                    </span>
                  </span>
                  <span className="border-b border-r border-stone-200 px-3 py-2 text-sm text-stone-700 dark:border-(--border) dark:text-stone-200">{row[5]}</span>
                  <span className="border-b border-stone-200 px-3 py-2 text-sm text-emerald-600 dark:border-(--border)">✓ Success</span>
                </div>
              ))}
            </div>
          </SettingsTable>
        </>
      ) : (
        <>
          <p className="mb-4 text-xs text-stone-500 dark:text-stone-400">ⓘ Sign-in attempts across SSO and password methods. Open a row for IP, device and details.</p>
          <SettingsTable>
            <div className="min-w-[920px]">
              <div className="sticky top-0 z-10 grid grid-cols-[120px_200px_110px_140px_1fr_120px] bg-stone-50 dark:bg-(--muted)">
                {["Time", "User", "Method", "IP address", "Device / agent", "Status"].map((heading) => <span key={heading} className="border-b border-r border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-500 last:border-r-0 dark:border-(--border)">{heading}</span>)}
              </div>
              {LOGIN_ROWS.map((row, index) => (
                <div key={index} className="grid grid-cols-[120px_200px_110px_140px_1fr_120px]">
                  {row.map((cell, cellIndex) => <span key={cellIndex} className={`truncate border-b border-r border-stone-200 px-3 py-2 text-sm last:border-r-0 dark:border-(--border) ${cellIndex === 5 ? "text-emerald-600" : "text-stone-600 dark:text-stone-300"}`}>{cellIndex === 2 ? <span className="rounded-full border border-stone-200 px-2 py-0.5 text-xs dark:border-(--border)">{cell}</span> : cell}</span>)}
                  <span className="border-b border-stone-200 px-3 py-2 text-sm text-emerald-600 dark:border-(--border)">✓ Success</span>
                </div>
              ))}
            </div>
          </SettingsTable>
        </>
      )}
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="flex-1 flex min-h-0 w-full max-w-4xl mx-auto flex-col px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader title="Projects" sub="Manage your organization's projects." />
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Organization projects</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">View and manage every project available in your organization.</p>
        </div>
      </div>

      <SettingsTable>
        <div className="flex min-h-full min-w-[640px] flex-col">
          <div className="sticky top-0 z-10 grid grid-cols-[2fr_1fr_1.2fr] bg-stone-50 dark:bg-(--muted)">
            {["Name", "Created at", "Created by"].map((heading) => (
              <span key={heading} className="border-b border-r border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-500 last:border-r-0 dark:border-(--border)">{heading}</span>
            ))}
          </div>
          <div className="flex min-h-40 flex-1 items-center justify-center text-sm text-stone-400 dark:text-stone-500">
            No projects available
          </div>
        </div>
      </SettingsTable>
    </div>
  );
}

const PROJECT_MEMBERS = [
  ["Roman Bohdan", "roman@intempt.com", "Project Owner"],
  ["Sid Chaudhary", "sid@intempt.com", "Project Owner"],
  ["Koray", "koray@intempt.com", "Project Admin"],
  ["Yaroslav Bezruchenko", "yaroslav@intempt.com", "Project Admin"],
  ["Hennadii Asmolov", "hennadii@intempt.com", "Project Admin"],
  ["Trishik Shrestha", "trishik@intempt.com", "Project Admin"],
  ["Beso Gugushvili", "beso@intempt.com", "Project Admin"],
  ["Rana Vivyanu", "rana@intempt.com", "Project Admin"],
  ["Markiian Holets", "markiian@intempt.com", "Project Admin"],
  ["Pavlo Hrabovets", "pavlo@intempt.com", "Project Member"],
  ["Aman Tiwari", "aman@intempt.com", "Project Admin"],
  ["Somya Nayak", "somya@intempt.com", "Project Member"],
];
const PROJECT_TEAMS = [
  ["Example", "1", "Jul 3, 2026, 04:49 PM", "Intempt"],
  ["Team45", "0", "Jul 3, 2026, 04:49 PM", "Intempt"],
  ["Test Team2", "0", "Jul 3, 2026, 04:49 PM", "Intempt"],
  ["Test Team23", "2", "Jul 3, 2026, 04:49 PM", "Intempt"],
  ["Test Team", "0", "Jul 3, 2026, 04:49 PM", "Intemp"],
];

function PeopleSection() {
  const [tab, setTab] = useState<"Members" | "Teams">("Members");
  return (
    <div className="flex-1 flex min-h-0 w-full max-w-4xl mx-auto flex-col px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader title="People" sub="Manage members and teams of Dev Playground." />
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Project access</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">Control who can access this project and how members are organized.</p>
        </div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <SubTabCorner tabs={[{ key: "Members", label: "Members" }, { key: "Teams", label: "Teams" }]} active={tab} onChange={(key) => setTab(key as "Members" | "Teams")} />
          <button className="h-9 shrink-0 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90">{tab === "Members" ? "Invite member" : "Create team"}</button>
        </div>
      </div>

      {tab === "Members" ? (
        <SettingsTable>
          <div className="min-w-[860px]">
            <div className="sticky top-0 z-10 grid grid-cols-[1.4fr_1.4fr_1.35fr_1fr_80px] border-b border-stone-200 bg-stone-50 dark:border-(--border) dark:bg-(--muted)">
              {["Name", "Email", "Role", "Status", "Actions"].map((heading) => <span key={heading} className="px-4 py-2.5 text-xs font-semibold text-stone-500">{heading}</span>)}
            </div>
            {PROJECT_MEMBERS.map((member) => (
              <div key={member[1]} className="grid min-h-12 grid-cols-[1.4fr_1.4fr_1.35fr_1fr_80px] items-center border-b border-stone-200 dark:border-(--border)">
                <span className="px-3 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-200">{member[0]}</span>
                <span className="truncate px-3 py-2.5 text-sm text-stone-500 dark:text-stone-400">{member[1]}</span>
                <span className="px-3 py-2">
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${member[2] === "Project Owner" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400"}`}>{member[2]}</span>
                </span>
                <span className="px-3 py-2.5"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Active</span></span>
                <span className="px-3 py-2.5 text-sm text-stone-400">—</span>
              </div>
            ))}
          </div>
        </SettingsTable>
      ) : (
        <SettingsTable>
          <div className="flex min-h-full min-w-[760px] flex-col">
            <div className="sticky top-0 z-10 grid grid-cols-[1.5fr_1fr_1.5fr_1fr] border-b border-stone-200 bg-stone-50 dark:border-(--border) dark:bg-(--muted)">
              {["Name", "Users in team", "Last modified", "Created by"].map((heading) => <span key={heading} className="px-4 py-2.5 text-xs font-semibold text-stone-500">{heading}</span>)}
            </div>
            {PROJECT_TEAMS.map((team) => (
              <div key={team[0]} className="grid min-h-12 grid-cols-[1.5fr_1fr_1.5fr_1fr] items-center border-b border-stone-200 dark:border-(--border)">
                <span className="px-4 py-3 text-sm font-medium text-stone-700 dark:text-stone-200">{team[0]}</span>
                <span className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">{team[1]}</span>
                <span className="px-4 py-3 text-sm text-stone-500 dark:text-stone-400">{team[2]}</span>
                <span className="flex items-center gap-2 px-4 py-3 text-sm text-stone-600 dark:text-stone-300"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-500 dark:bg-blue-500/10">I</span>{team[3]}</span>
              </div>
            ))}
          </div>
        </SettingsTable>
      )}
    </div>
  );
}

const LIFECYCLE_STAGES = ["Subscriber", "Lead", "Marketing Qualified Lead", "Product Qualified Lead", "Sales Qualified Lead", "Opportunity", "Customer", "Evangelist"];
const DEAL_STAGES = [
  ["Product Signup / Self-Serve", "10%"],
  ["Activation / First Value", "25%"],
  ["Team Adoption / Expansion Signal", "40%"],
  ["Sales-Assisted Discovery", "60%"],
  ["Proposal / Procurement", "80%"],
  ["Negotiation / Commitment", "90%"],
  ["Closed Lost", "Lost (0%)"],
  ["Closed Won", "Won (100%)"],
];

function ProjectUsersSection() {
  const [tab, setTab] = useState<"Lifecycle" | "Deals">("Lifecycle");
  return (
    <div className="flex-1 flex min-h-0 w-full max-w-4xl mx-auto flex-col px-4 pt-6 md:px-10 md:pt-8">
      <div className="w-full max-w-4xl mx-auto">
        <SectionHeader title="Data Model" sub="Configure lifecycle stages, deal pipelines, and scoring models" />
        <div className="mb-4">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{tab === "Lifecycle" ? "Lifecycle stages" : "Deal stages"}</p>
          <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
            {tab === "Lifecycle"
              ? "List the stages a user moves through. The order defines how progression between stages is tracked."
              : "Customize deal pipeline to manage the way you track revenue opportunities from the first to the last step."}
          </p>
        </div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <SubTabCorner tabs={[{ key: "Lifecycle", label: "Lifecycle" }, { key: "Deals", label: "Deals" }]} active={tab} onChange={(key) => setTab(key as "Lifecycle" | "Deals")} />
          <button className="h-9 shrink-0 rounded-md bg-blue-500 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90">{tab === "Lifecycle" ? "Add stage" : "Add deal"}</button>
        </div>
      </div>

      <SettingsTable>
        <div className="flex min-h-full min-w-[720px] flex-col">
          {tab === "Lifecycle" ? (
            <>
              <div className="sticky top-0 z-10 grid grid-cols-[1fr_120px] border-b border-stone-200 bg-stone-50 dark:border-(--border) dark:bg-(--muted)">
                <span className="px-4 py-3 text-xs font-semibold text-stone-500">Stage name</span>
                <span className="px-4 py-3 text-xs font-semibold text-stone-500">Used in</span>
              </div>
              {LIFECYCLE_STAGES.map((stage) => (
                <div key={stage} className="grid min-h-12 grid-cols-[1fr_120px] items-center border-b border-stone-200 dark:border-(--border)">
                  <span className="flex items-center gap-4 px-5 py-3 text-sm font-medium text-stone-700 dark:text-stone-200"><span className="text-base leading-none text-stone-400">⠿</span>{stage}</span>
                  <span className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">0</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="sticky top-0 z-10 grid grid-cols-[1fr_220px_100px] border-b border-stone-200 bg-stone-50 dark:border-(--border) dark:bg-(--muted)">
                {["Stage name", "Probability", "Used in"].map((heading) => <span key={heading} className="px-4 py-3 text-xs font-semibold text-stone-500">{heading}</span>)}
              </div>
              {DEAL_STAGES.map(([stage, probability]) => (
                <div key={stage} className="grid min-h-14 grid-cols-[1fr_220px_100px] items-center border-b border-stone-200 dark:border-(--border)">
                  <span className="flex items-center gap-4 px-5 py-3 text-sm font-medium text-stone-700 dark:text-stone-200"><span className="text-base leading-none text-stone-400">⠿</span>{stage}</span>
                  <span className="px-3 py-2"><FakeSelect value={probability} /></span>
                  <span className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">0</span>
                </div>
              ))}
            </>
          )}
        </div>
      </SettingsTable>
    </div>
  );
}

// ── Org Security ─────────────────────────────────────────────────────────────

type TwoStepPolicy = "optional" | "non-sso" | "all";

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-300" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
      <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
      <span>{children}</span>
    </div>
  );
}

function IconBadge({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(59,130,246,0.10)" }}>
      <span className="text-blue-500">{icon}</span>
    </div>
  );
}

function OrgSecuritySection() {
  const [policy, setPolicy] = useState<TwoStepPolicy>("optional");
  const [gracePeriod] = useState("30 days");
  const [sessionLength] = useState("24 hours");

  const POLICY_OPTIONS: { value: TwoStepPolicy; label: string; desc: string }[] = [
    { value: "optional",  label: "Optional",                  desc: "Members can enroll if they want. Recommended for trial accounts only." },
    { value: "non-sso",   label: "Required for non-SSO members", desc: "SSO users inherit verification from your IdP; everyone else must enroll." },
    { value: "all",       label: "Required for all members",  desc: "Every member must enroll, including those signing in via SSO." },
  ];

  return (
    <div>
      <SectionHeader title="Security" sub="Enforce two-step verification, manage sessions, and audit member enrollment." />

      {/* ── Section 1: Two-step verification policy ── */}
      <div className="pb-8">
        <div className="flex items-start gap-3 mb-5">
          <IconBadge icon={<Shield size={16} />} />
          <div>
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Two-step verification policy</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Decide who must verify with a second factor at sign-in.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          {POLICY_OPTIONS.map((opt) => {
            const checked = policy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPolicy(opt.value)}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${checked ? "border-blue-400 dark:border-blue-500" : "border-stone-100 dark:border-(--border) hover:border-stone-200 dark:hover:border-stone-600"}`}
                style={checked ? { background: "rgba(59,130,246,0.04)" } : {}}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-blue-500" : "border-stone-300 dark:border-stone-600"}`}>
                  {checked && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                </span>
                <div>
                  <p className={`text-sm font-medium ${checked ? "text-stone-800 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}>{opt.label}</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <SettingsRow label="Enrollment grace period" description="How long members have after the policy turns on (or after they join) before they're blocked from signing in." noBorder>
          <FakeSelect value={gracePeriod} />
        </SettingsRow>

        <div className="border-t border-stone-100 dark:border-(--border) pt-5 mt-1">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200 mb-0.5">Allowed factors</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">Members can enroll any allowed factor. Disabling a factor doesn't unenroll existing members.</p>
          <SettingsRow label="Email code" description=""><FakeToggle on /></SettingsRow>
          <SettingsRow label="Passkey" description=""><FakeToggle on /></SettingsRow>
        </div>

        <div className="mt-5">
          <InfoCallout>
            Project-level Security can require step-up reauth for sensitive actions (delete project, rotate API keys). Project policy can only tighten this org policy.
          </InfoCallout>
        </div>
      </div>

      {/* ── Section 2: Require passkey ── */}
      <div className="border-t border-stone-100 dark:border-(--border) pt-8 pb-8">
        <SettingsRow label="Require passkey" description="Members not signing in via SSO must enroll a passkey. Email sign-in codes alone won't be accepted on next sign-in." noBorder>
          <FakeToggle />
        </SettingsRow>
        <div className="mt-4">
          <InfoCallout>
            SSO users inherit verification from your identity provider — Intempt won't double-prompt them. Members without a passkey will be guided through enrollment on next sign-in.
          </InfoCallout>
        </div>
      </div>

      {/* ── Section 3: Maximum session length ── */}
      <div className="border-t border-stone-100 dark:border-(--border) pt-8 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconBadge icon={<Clock size={16} />} />
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Maximum session length</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Members are signed out and must reauthenticate after this time, even if active.</p>
            </div>
          </div>
          <FakeSelect value={sessionLength} />
        </div>
      </div>

      {/* ── Section 4: Enrollment status ── */}
      <div className="border-t border-stone-100 dark:border-(--border) pt-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <IconBadge icon={<Users size={16} />} />
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Enrollment status</p>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Track who has enrolled and nudge anyone still pending.</p>
            </div>
          </div>
          <button className="flex shrink-0 items-center gap-1.5 h-8 px-3.5 rounded-lg border border-stone-200 dark:border-(--border) text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <MessageSquare size={12} />
            Send reminder
          </button>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-stone-200 dark:border-(--border) py-10">
          <p className="text-sm text-stone-400 dark:text-stone-500">No members yet.</p>
        </div>
      </div>
    </div>
  );
}

export const contentMap: Record<string, React.ReactNode> = {
  about: (
    <div>
      <SectionHeader title="Profile" sub="Manage your profile information, display name, and personal handle." />
      <div className="flex items-center gap-5 mb-8 pb-6 border-b border-stone-100 dark:border-(--border)">
        <button className="group relative w-20 h-20 rounded-full overflow-hidden shrink-0">
          <img src="/dp.png" alt="Profile" className="w-full h-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
        </button>
        <div className="flex flex-1 items-center justify-between">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Rana V</p>
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">Change</button>
        </div>
      </div>
      <div>
        <SettingsRow label="Your name" description="What should we call you">
          <input className="px-3 h-9 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 w-48 outline-none focus:border-blue-400" defaultValue="Rana V" />
        </SettingsRow>
        <SettingsRow label="Email address" description="Used for login and notifications">
          <div className="relative group">
            <input className="px-3 h-9 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-400 w-48 outline-none cursor-not-allowed" defaultValue="rana@intempt.com" disabled />
            <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-xs font-normal text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ background: "rgba(24,24,27,0.93)" }}>
              Email cannot be changed
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: "rgba(24,24,27,0.93)" }} />
            </span>
          </div>
        </SettingsRow>
        <div className="py-4 border-b border-stone-100 dark:border-(--border)">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Welcome message</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 mb-3">Your personalized greeting for visitors</p>
          <textarea
            className="w-full rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) px-3 py-2.5 text-sm text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 outline-none focus:border-blue-400 transition resize-none"
            rows={3}
            placeholder="e.g. Welcome to the team! Feel free to reach out if you have any questions."
            defaultValue=""
          />
        </div>
        <SettingsRow label="Display name" description="Short name shown in conversations">
          <input className="px-3 h-9 rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) text-sm text-stone-700 dark:text-stone-200 w-48 outline-none focus:border-blue-400" defaultValue="rana" />
        </SettingsRow>
        <SettingsRow label="Username" description="Used for your booking link, creator handle, and shared URLs.">
          <div className="flex h-9 items-center overflow-hidden rounded-md border border-stone-200 dark:border-(--border) bg-white dark:bg-(--input) w-64 focus-within:border-blue-400">
            <span className="shrink-0 border-r border-stone-200 dark:border-(--border) bg-stone-50 dark:bg-(--muted) px-3 text-sm text-stone-400 dark:text-stone-500 h-full flex items-center">intempt.com/</span>
            <input className="flex-1 px-3 text-sm font-semibold text-stone-700 dark:text-stone-200 outline-none bg-transparent h-full" defaultValue="person-17429" />
          </div>
        </SettingsRow>
      </div>
      <DeleteRow target="account" label="Delete account" desc="Permanently delete your personal account and remove all your data from the platform." />
    </div>
  ),
  availability: <AvailabilitySection />,
  connections: <ConnectionsSettingsView />,
  inbox: <InboxSection />,
  security: <SecuritySection />,
  domains: <DomainsSection />,
  team: <TeamSection />,
  roles: <RolesSection />,
  apikeys: <ApiKeysSection />,
  "org-security": <OrgSecuritySection />,
  auditlog: <AuditLogSection />,
  projects: <ProjectsSection />,
  billing: (
    <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Billing coming soon</p>
  ),
  basic: (
    <div>
      <BasicInfoSection />
      <DeleteRow target="project" label="Delete project" desc="Permanently delete this project along with all its assets, journeys, and member access." />
    </div>
  ),
  people: <PeopleSection />,
  "project-users": <ProjectUsersSection />,
  messages: <MessagesSection />,
  meetings: (
    <div>
      <SectionHeader title="Meetings" sub="Set defaults for meeting duration, video conferencing, and attendee reminders." />
      <SettingsRow label="Default meeting duration" description="Default length when creating a new meeting">
        <FakeSelect value="30 minutes" />
      </SettingsRow>
      <SettingsRow label="Video provider" description="Default video conferencing tool">
        <FakeSelect value="Google Meet" />
      </SettingsRow>
      <SettingsRow label="Send reminders" description="Automatically notify attendees before meetings">
        <FakeToggle on />
      </SettingsRow>
      <SettingsRow label="Reminder timing" description="How far in advance to send a reminder">
        <FakeSelect value="15 min before" />
      </SettingsRow>
    </div>
  ),
};

export default function SettingsLayout({ onBack, children }: { onBack: () => void; children?: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation(); const pathname = location.pathname;
  const selected = pathname.replace(/^\/settings\/?/, "") || "about";
  const [confirming, setConfirming] = useState<DeleteTarget | null>(null);

  return (
    <DangerContext.Provider value={setConfirming}>
    <div className="relative flex h-full w-full animate-fade-up">
      {/* Desktop sidebar */}
      <div
        className="hidden md:flex flex-col h-full shrink-0 select-none"
        style={{ width: 196, background: "var(--main-bg)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-4 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 transition-colors"
        >
          <ChevronLeft size={14} />
          <span>Back to app</span>
        </button>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
          {settingsNav.map((section) => (
            <div key={section.heading}>
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-600">
                {section.heading}
              </p>
              <div className="space-y-px">
                {section.items.map((item) => {
                  const isActive = selected === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigate(`/settings/${item.key}`)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left text-sm font-[450] transition-colors duration-100 group
                        ${isActive
                          ? "bg-white dark:bg-white/8 text-stone-800 dark:text-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                          : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-white/6 hover:text-stone-800 dark:hover:text-stone-100"
                        }`}
                    >
                      <span className={isActive ? "text-blue-600" : "text-stone-400 dark:text-stone-600 group-hover:text-stone-600 dark:group-hover:text-stone-400"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Intempt branding footer — matches Sidebar */}
        <div className="flex items-center gap-2 px-4 py-3.5 shrink-0">
          <img src="/logo.png" alt="Intempt" width={18} height={18} className="rounded-md opacity-60" style={{ objectFit: "contain" }} />
          <span className="flex-1 text-xs font-medium text-stone-400 dark:text-stone-600 tracking-tight">Intempt</span>
          <button className="w-5 h-5 rounded-full border border-stone-300 dark:border-(--border) flex items-center justify-center hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-100 dark:hover:bg-white/6 transition-colors shrink-0">
            <span className="text-xs font-semibold text-stone-400 dark:text-stone-500 leading-none">?</span>
          </button>
        </div>
      </div>

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 md:p-3 md:pl-0">
        {/* Mobile top bar */}
        <MobileNav selected={selected} onBack={onBack} onNav={(key) => navigate(`/settings/${key}`)} />

        <div
          className="flex-1 flex flex-col rounded-xl overflow-hidden mx-3 mb-3 md:mx-0 md:mb-0"
          style={{
            background: "var(--content-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)",
          }}
        >
          {children}
        </div>
      </div>

      {confirming && <DeleteConfirmModal target={confirming} onClose={() => setConfirming(null)} />}
    </div>
    </DangerContext.Provider>
  );
}
