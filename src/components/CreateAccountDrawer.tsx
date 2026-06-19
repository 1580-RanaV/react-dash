

import { useState } from "react";
import { Building2, Globe } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

function Field({
  label,
  icon,
  required,
  placeholder,
  hint,
  value,
  onChange,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 dark:text-stone-300">
        <span className="text-stone-400 dark:text-stone-500">{icon}</span>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 dark:text-stone-100 dark:placeholder:text-stone-500 ${
          error
            ? "border-rose-400 bg-rose-50/50 focus:border-rose-400 dark:border-rose-500/60 dark:bg-rose-500/5"
            : "border-stone-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.03] dark:focus:border-stone-500"
        }`}
      />
      {hint && !error && (
        <p className="text-xs text-stone-400 dark:text-stone-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-500">{error}</p>
      )}
    </div>
  );
}

export default function CreateAccountDrawer({ onClose }: { onClose: () => void }) {
  const [domain, setDomain] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState<{ domain?: string; companyName?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!domain.trim()) e.domain = "Domain is required";
    if (!companyName.trim()) e.companyName = "Company name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreate() {
    if (validate()) onClose();
  }

  function handleCreateAndAdd() {
    if (validate()) {
      setDomain("");
      setCompanyName("");
      setErrors({});
    }
  }

  return (
    <SlidingSidebar
      title="Create account"
      description="Add a new company account to your CRM."
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
        <Field
          label="Domain"
          icon={<Globe size={14} />}
          required
          placeholder="e.g., acme.com"
          hint="Enter the company's website domain without http:// or www."
          value={domain}
          onChange={(v) => { setDomain(v); setErrors((e) => ({ ...e, domain: undefined })); }}
          error={errors.domain}
        />
        <Field
          label="Company name"
          icon={<Building2 size={14} />}
          required
          placeholder="e.g., Acme Corporation"
          value={companyName}
          onChange={(v) => { setCompanyName(v); setErrors((e) => ({ ...e, companyName: undefined })); }}
          error={errors.companyName}
        />
      </div>
    </SlidingSidebar>
  );
}
