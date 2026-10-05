import { Badge } from "./ui/badge";

export type Priority = "High" | "Medium" | "Low";
export type Status = "Open" | "Completed";
export type TaskType = "Email" | "LinkedIn" | "Call" | "Custom";

export type TaskRecord = {
  id: string;
  taskName: string;
  type: TaskType;
  userName: string;
  userInitial: string;
  userColor: string;
  account: string;
  priority: Priority;
  dueDisplay: string;
  dueRank: number;
  overdue: boolean;
  createdDate: string;
  status: Status;
};

export function StatusBadge({ status }: { status: Status }) {
  const tone = status === "Completed"
    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300"
    : "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300";
  return (
    <Badge className={`px-2.5 py-0.5 font-semibold ${tone}`}>
      {status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className="px-2.5 py-0.5 font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300">
      {priority}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: TaskType }) {
  return (
    <Badge className="px-2.5 py-0.5 font-semibold bg-stone-100 text-stone-600 dark:bg-white/8 dark:text-stone-300">
      {type}
    </Badge>
  );
}

export function OwnerAvatar({ initial, color, name }: { initial: string; color: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {initial}
      </span>
      <span className="text-xs text-stone-700 dark:text-stone-300">{name}</span>
    </div>
  );
}
