

import { useEffect, useRef, useState } from "react";
import Toggle from "./Toggle";
import { ChevronDown } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";

type Option = {
  value: string;
  label: string;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 dark:border-(--border) dark:bg-white/[0.03] dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500"
    />
  );
}

function Select({
  options,
  value,
  onChange,
  width = "w-[128px]",
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 text-left text-xs font-medium text-stone-900 outline-none transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/[0.03] dark:text-stone-100 dark:hover:bg-white/6"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown size={14} className={`shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          className="absolute bottom-[calc(100%+6px)] left-0 z-40 max-h-60 w-full overflow-y-auto rounded-lg py-1 shadow-xl"
          style={{ background: "var(--content-bg)", border: "1px solid var(--border)" }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-stone-100 text-stone-900 dark:bg-white/8 dark:text-stone-100"
                    : "text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/6"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}


function Section({
  title,
  description,
  children,
  inline = false,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <section className="py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
            {description ? <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{description}</p> : null}
          </div>
          {children ? <div className="shrink-0">{children}</div> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="py-2">
      <div className="mb-3 min-w-0">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        {description ? <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-stone-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function CreateBookingDrawer({ onClose }: { onClose: () => void }) {
  const [meetingConfirmation, setMeetingConfirmation] = useState(true);
  const [useGlobalHours, setUseGlobalHours] = useState(true);
  const [eventType, setEventType] = useState("individual");
  const [duration, setDuration] = useState("30");
  const [bookingWindow, setBookingWindow] = useState("14");
  const [notice, setNotice] = useState("1");

  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
    { value: "240", label: "4 hours" },
    { value: "480", label: "8 hours" },
    { value: "1440", label: "24 hours" },
    { value: "2880", label: "48 hours" },
  ];

  return (
    <SlidingSidebar
      title="Create booking type"
      description="Set up a new meeting type for your scheduling page."
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Save Event Type
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <Field label="Event name *">
          <TextInput placeholder="Individual (one-on-one)" />
        </Field>

        <Section
          title="Blu Codewords"
          description="Configure how Blu recognizes this booking type in conversation threads."
        >
          <div className="space-y-3">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              When I say:
            </div>
            <p className="text-xs leading-5 text-stone-500 dark:text-stone-400">
              Add trigger words Blu will recognize in email threads to use this meeting type.
            </p>
            <TextInput placeholder="e.g. demo, product walkthrough..." />
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Meeting Confirmation
            </div>
            <Toggle on={meetingConfirmation} onClick={() => setMeetingConfirmation(v => !v)} size="md" />
          </div>
        </Section>

        <Section
          title="Meeting Hours"
          description="Set custom hours for this booking type or inherit your global availability."
        >
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">Use global hours</span>
            <Toggle on={useGlobalHours} onClick={() => setUseGlobalHours(v => !v)} size="md" />
          </div>
        </Section>

        <Section title="Event Type" inline>
          <Select
            value={eventType}
            onChange={setEventType}
            width="w-[206px]"
            options={[
              { value: "individual", label: "Individual (one-on-one)" },
              { value: "round-robin", label: "Round robin" },
              { value: "group", label: "Group" },
            ]}
          />
        </Section>

        <Section title="Duration" inline>
          <Select value={duration} onChange={setDuration} options={durationOptions} width="w-[120px]" />
        </Section>

        <Section title="Booking window">
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            <span>Invitees can schedule</span>
            <Select
              value={bookingWindow}
              onChange={setBookingWindow}
              options={[
                { value: "7", label: "7 days" },
                { value: "14", label: "14 days" },
                { value: "30", label: "30 days" },
                { value: "60", label: "60 days" },
                { value: "90", label: "90 days" },
              ]}
              width="w-[116px]"
            />
            <span>into the future with at least</span>
            <Select value={notice} onChange={setNotice} options={durationOptions} width="w-[120px]" />
            <span>notice</span>
          </div>
        </Section>
      </div>
    </SlidingSidebar>
  );
}
