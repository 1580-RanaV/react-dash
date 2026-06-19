

import { useState } from "react";
import { Tag, Shield } from "lucide-react";
import SlidingSidebar from "./SlidingSidebar";
import type { TableRow } from "./DashboardTable";

function randomHex(len: number) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function generateKey() {
  return `${randomHex(32)}.${randomHex(32)}`;
}

export default function CreateApiKeyDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (row: TableRow) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"full" | "readonly">("full");

  function handleCreate() {
    const id = String(Date.now());
    onCreate({
      id,
      cells: {
        name:     id,
        key:      generateKey(),
        modified: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        labels:   role === "full" ? "Full access" : "Read only",
      },
    });
    onClose();
  }

  return (
    <SlidingSidebar
      title="Create API key"
      description="Generate a public or private key scoped to this project."
      onClose={onClose}
      footer={(close) => (
        <>
          <button
            onClick={close}
            className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-4 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-(--border) dark:bg-white/5 dark:text-stone-200 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex h-9 items-center rounded-lg px-4 text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#0080FF" }}
          >
            Create key
          </button>
        </>
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
            <Tag size={14} className="text-stone-400" />
            Name
          </label>
          <input
            type="text"
            placeholder="e.g. Production API"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
          />
        </div>

        {/* Role */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
            <Shield size={14} className="text-stone-400" />
            Role
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRole("full")}
              className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors duration-100 ${
                role === "full"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-300 dark:hover:bg-white/6"
              }`}
            >
              Full access
            </button>
            <button
              onClick={() => setRole("readonly")}
              className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors duration-100 ${
                role === "readonly"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-300 dark:hover:bg-white/6"
              }`}
            >
              Read only
            </button>
          </div>
        </div>
      </div>
    </SlidingSidebar>
  );
}
