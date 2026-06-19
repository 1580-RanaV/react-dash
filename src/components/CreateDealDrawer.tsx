

import { useState } from "react";
import { Briefcase, Building2, Calendar, ChevronDown, DollarSign, Tag, User } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

const DEAL_STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const DEAL_TYPES = ["New Business", "Existing Business", "Renewal", "Upsell"];
const PRIORITIES = ["High", "Medium", "Low"];
const OWNERS = ["Rohan", "Somya Nayak", "Sid Chaudhary"];

function FieldLabel({ icon, label, required }: { icon: React.ReactNode; label: string; required?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

function TextInput({
  placeholder, value, onChange, error,
}: { placeholder?: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 ${
          error
            ? "border-rose-400 bg-rose-50/50 dark:border-rose-500/60 dark:bg-rose-500/5"
            : "border-stone-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:focus:border-stone-500"
        }`}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </>
  );
}

function SelectInput({
  options, value, onChange, placeholder, error,
}: { options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm font-medium text-left outline-none transition-colors ${
          error
            ? "border-rose-400 bg-rose-50/50 dark:border-rose-500/60 dark:bg-rose-500/5"
            : "border-stone-200 bg-white hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:hover:bg-white/6"
        } ${value ? "text-stone-900 dark:text-stone-100" : "text-stone-400 dark:text-stone-500"}`}
      >
        <span>{value || placeholder || "Select..."}</span>
        <ChevronDown size={13} className="shrink-0 text-stone-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-xl shadow-xl"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                opt === value
                  ? "bg-stone-100 font-semibold text-stone-900 dark:bg-white/8 dark:text-stone-100"
                  : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

export default function CreateDealDrawer({ onClose }: { onClose: () => void }) {
  const [dealName, setDealName] = useState("");
  const [account, setAccount] = useState("");
  const [stage, setStage] = useState("");
  const [value, setValue] = useState("");
  const [owner, setOwner] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!dealName.trim()) e.dealName = "Deal name is required";
    if (!stage) e.stage = "Deal stage is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function clearError(key: string) {
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }

  function handleCreate() {
    if (validate()) onClose();
  }

  function handleCreateAndAdd() {
    if (validate()) {
      setDealName(""); setAccount(""); setStage(""); setValue("");
      setOwner(""); setType(""); setPriority(""); setCloseDate("");
      setErrors({});
    }
  }

  return (
    <SlidingSidebar
      title="Create deal"
      description="Add a new deal to your pipeline."
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
            onClick={handleCreate}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create
          </button>
        </>
      )}
    >
      <div className="space-y-5">
        <div>
          <FieldLabel icon={<Briefcase size={14} />} label="Deal name" required />
          <TextInput
            placeholder="e.g., Acme Corp — Enterprise Plan"
            value={dealName}
            onChange={(v) => { setDealName(v); clearError("dealName"); }}
            error={errors.dealName}
          />
        </div>

        <div>
          <FieldLabel icon={<Building2 size={14} />} label="Account" />
          <TextInput placeholder="e.g., Acme Corp" value={account} onChange={setAccount} />
        </div>

        <div>
          <FieldLabel icon={<Tag size={14} />} label="Deal stage" required />
          <SelectInput
            options={DEAL_STAGES}
            value={stage}
            onChange={(v) => { setStage(v); clearError("stage"); }}
            placeholder="Select stage..."
            error={errors.stage}
          />
        </div>

        <div>
          <FieldLabel icon={<DollarSign size={14} />} label="Value" />
          <TextInput placeholder="e.g., 12000" value={value} onChange={setValue} />
        </div>

        <div>
          <FieldLabel icon={<User size={14} />} label="Deal owner" />
          <SelectInput options={OWNERS} value={owner} onChange={setOwner} placeholder="Select owner..." />
        </div>

        <div>
          <FieldLabel icon={<Briefcase size={14} />} label="Deal type" />
          <SelectInput options={DEAL_TYPES} value={type} onChange={setType} placeholder="Select type..." />
        </div>

        <div>
          <FieldLabel icon={<Tag size={14} />} label="Priority" />
          <SelectInput options={PRIORITIES} value={priority} onChange={setPriority} placeholder="Select priority..." />
        </div>

        <div>
          <FieldLabel icon={<Calendar size={14} />} label="Close date" />
          <input
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100"
          />
        </div>
      </div>
    </SlidingSidebar>
  );
}
