

import SlidingSidebar from "./SlidingSidebar";

function Field({
  label,
  placeholder,
  required = false,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">
        {label}
        {required ? <span className="ml-1 text-stone-500">*</span> : null}
      </span>
      <input
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-normal text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100 dark:placeholder:text-stone-500"
      />
    </label>
  );
}

export default function CreateUserDrawer({ onClose }: { onClose: () => void }) {
  return (
    <SlidingSidebar
      title="Create user"
      description="Add a new user to your CRM. Fill in the details below."
      onClose={onClose}
      footerBorder={false}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create user
          </button>
        </>
      )}
    >
      <div className="space-y-6 pt-1">
        <Field label="Name" placeholder="e.g., John Doe" required />
        <Field label="Email" placeholder="e.g., john@example.com" required />
        <Field label="Phone" placeholder="e.g., +1 555 555 1234" />
        <Field label="Title" placeholder="e.g., Product Manager" />

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-700 dark:text-stone-300">Lead stage</span>
          <select className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-normal text-stone-900 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/[0.035] dark:text-stone-100">
            <option>Select a stage</option>
            <option>New</option>
            <option>Qualified</option>
            <option>Customer</option>
          </select>
        </label>
      </div>
    </SlidingSidebar>
  );
}
