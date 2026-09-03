

import { Fragment, useEffect, useRef, useState } from "react";
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  X,
  Plus,
  ArrowUp,
  AtSign,
  Brain,
  Paperclip,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  UserRound,
  Camera,
  PersonStanding,
  Box,
  Rss,
  SlidersHorizontal,
  Route,
  Shuffle,
  UserCircle,
  Clapperboard,
  PenTool,
  Package,
  Activity,
  Archive,
  Globe,
  Library,
  Database,
  Users,
  LayoutDashboard,
  PackageOpen,
  CornerLeftUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  AppWindow,
  Mail,
  Bell,
  MessageSquare,
  Type,
  Zap,
  Eye,
  ChefHat,
  Pencil,
  CheckCheck,
  ChevronDown,
  RotateCcw,
  Square,
  Pin,
  Trash2,
  ArchiveRestore,
  GitFork,
  GripVertical,
  Mic,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useBluMessages } from "../BluMessagesContext";

import type { MentionChip, QueueItem, ReferenceAttachment, RecipeChip, ChatMessage, SlashRecipe, BluMode, UploadedFile, UploadedFileKind } from "./types";
import {
  MENTION_CATEGORIES,
  MENTION_ITEMS,
  ARCHIVED_HISTORY,
  PLAN_SAMPLE,
  RUN_TASKS,
  PLUS_ITEMS,
  REFERENCE_ITEMS,
  REFERENCE_TILES,
  BLU_REPLIES,
  GENERAL_FOLLOW_UPS,
  CUSTOM_REPORT_FOLLOW_UPS,
  PLACEHOLDERS,
  LANDING_PROMPTS,
  CONTEXT_RECIPE_KEYS,
  SLASH_RECIPES,
  REFERENCE_LIST_ITEMS,
  IMAGE_ASPECT_OPTIONS,
  IMAGE_BACKGROUND_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  RESPONSE_DEPTH_OPTIONS,
  MODEL_TIER_OPTIONS,
  KNOWLEDGE_SCOPE_OPTIONS,
} from "./constants";
import { getMentionIcon, createMentionChipEl, createReferenceChipEl, getReferenceIconPaths, FollowUpArrow } from "./utils";

import FeedbackQuestionnaire from "./blocks/FeedbackQuestionnaire";
import LoadingState from "./blocks/LoadingState";
import JourneyPreviewOverlay from "./blocks/JourneyPreviewOverlay";
import { CreationRunStatus } from "./blocks/CreationRun";
import { LiveRun } from "./blocks/LiveRun";
import { AcceptRun } from "./blocks/AcceptRun";
import { CustomReportBlock } from "./blocks/CustomReport";
import { ExecChecklist } from "./blocks/ExecChecklist";
import { PlanCard } from "./blocks/PlanCard";
import { StreamingReply } from "./blocks/StreamingReply";
import { RecipeRow } from "./blocks/RecipeRow";
import { NotificationIcon, NotificationStrip } from "./blocks/Notification";

export type { ChatMessage, BluMode };

/* A timestamp divider only reappears once the gap since the last one shown
 * crosses this threshold — not on every message. */
const TIMESTAMP_DIVIDER_GAP_MS = 30 * 60 * 1000;

const MAX_ATTACHMENTS = 7;
const MAX_QUEUE = 4;
const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

function classifyFileKind(file: File): UploadedFileKind {
  if (file.type.startsWith("image/")) return "image";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "html" || ext === "htm") return "html";
  if (ext === "md") return "md";
  return "file";
}

const FILE_KIND_LABEL: Record<Exclude<UploadedFileKind, "image">, string> = {
  pdf: "PDF",
  html: "HTML",
  md: "MD",
  file: "FILE",
};

function FileKindBadge({ kind }: { kind: UploadedFileKind }) {
  if (kind === "image") return null;
  return (
    <span
      className="absolute bottom-1.5 right-1.5 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-stone-600 dark:text-stone-300"
      style={{ background: "rgba(120,120,120,0.18)" }}
    >
      {FILE_KIND_LABEL[kind]}
    </span>
  );
}

function FileKindName({ name }: { name: string }) {
  return (
    <span className="absolute left-1.5 right-1.5 top-1.5 line-clamp-3 wrap-break-word text-[9px] font-medium leading-snug text-stone-500 dark:text-stone-400">
      {name}
    </span>
  );
}

function QueueItemRow({
  item,
  isEditing,
  editingText,
  onStartEdit,
  onEditChange,
  onSave,
  onCancelEdit,
  onDelete,
}: {
  item: QueueItem;
  isEditing: boolean;
  editingText: string;
  onStartEdit: () => void;
  onEditChange: (value: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, background: "var(--muted)" }}
      className="group rounded-lg px-2.5 py-2"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-4 w-4 shrink-0 cursor-grab items-center justify-center text-stone-300 active:cursor-grabbing dark:text-stone-600"
        >
          <GripVertical size={12} />
        </button>
        <CornerLeftUp size={12} className="shrink-0 text-stone-400 dark:text-stone-500" />
        {isEditing ? (
          <input
            autoFocus
            value={editingText}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave();
              if (e.key === "Escape") onCancelEdit();
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-700 outline-none dark:text-stone-200"
          />
        ) : (
          <span
            className="min-w-0 flex-1 cursor-pointer truncate text-sm text-stone-600 dark:text-stone-300"
            onClick={() => setExpanded((current) => !current)}
            onDoubleClick={onStartEdit}
          >
            {item.text}
          </span>
        )}
        <button
          onClick={onDelete}
          className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-red-500 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Delete
        </button>
      </div>
      {!isEditing && (
        <div
          className="grid transition-[grid-template-rows,opacity] duration-200"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}
        >
          <div className="overflow-hidden">
            <p className="ml-5 mt-1 line-clamp-4 whitespace-pre-wrap text-xs leading-snug text-stone-500 dark:text-stone-400">
              {item.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtTimestampDivider(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / (24 * 60 * 60 * 1000));

  if (dayDiff === 0) return `Today ${time}`;
  if (dayDiff === 1) return `Yesterday ${time}`;
  if (dayDiff > 1 && dayDiff < 7) return `${date.toLocaleDateString("en-US", { weekday: "long" })} ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })} ${time}`;
}

export default function BluChat({
  onClose,
  mode = "panel",
  onFloat,
  onFullscreen,
  onBackToPanel,
  onHeaderMouseDown,
}: {
  onClose: () => void;
  mode?: BluMode;
  onFloat?: () => void;
  onFullscreen?: () => void;
  onBackToPanel?: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const contextKeys = CONTEXT_RECIPE_KEYS.find(c => c.match.test(pathname))?.keys ?? [];
  const suggestedRecipes = contextKeys.map(k => SLASH_RECIPES.find(r => r.key === k)).filter(Boolean) as SlashRecipe[];
  const otherRecipes = SLASH_RECIPES.filter(r => !contextKeys.includes(r.key));

  const { messages, setMessages, sessionTime, setSessionTime, threads, activeThreadId, switchThread, createThread, forkThread, renameActiveThread, renameThread, togglePinThread, archiveThread, unarchiveThread, deleteThread } = useBluMessages();
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeThreadTitle = activeThread?.title ?? "New chat";
  const [threadSwitcherOpen, setThreadSwitcherOpen] = useState(false);
  const threadSwitcherRef = useRef<HTMLDivElement>(null);
  const [threadSwitcherSearch, setThreadSwitcherSearch] = useState("");
  const [renamingThreadId, setRenamingThreadId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [archivedViewOpen, setArchivedViewOpen] = useState(false);
  const [settledReportIds, setSettledReportIds] = useState<Set<string>>(new Set());
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [unreadThreadIds, setUnreadThreadIds] = useState<Set<string>>(new Set());
  const hasUnreadThreads = unreadThreadIds.size > 0;
  const [unreadIconPhase, setUnreadIconPhase] = useState<"dot" | "bell">("dot");

  useEffect(() => {
    if (!hasUnreadThreads) {
      setUnreadIconPhase("dot");
      return;
    }
    const id = setInterval(() => setUnreadIconPhase((p) => (p === "dot" ? "bell" : "dot")), 2000);
    return () => clearInterval(id);
  }, [hasUnreadThreads]);

  const [notificationStripDismissed, setNotificationStripDismissed] = useState(false);

  function markThreadsUnread(count: number) {
    const pool = threads.filter((t) => t.id !== activeThreadId);
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, count).map((t) => t.id);
    setUnreadThreadIds((prev) => new Set([...prev, ...picked]));
    setNotificationStripDismissed(false);
  }

  function markThreadRead(id: string) {
    setUnreadThreadIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function stopActiveReport() {
    if (!activeReportId) return;
    const stoppedId = activeReportId;
    setMessages((current) => current.map((item) => (
      item.id === stoppedId
        ? { id: item.id, role: "blu", text: "Report generation was stopped. Try generating again." }
        : item
    )));
    setActiveReportId(null);
  }
  useEffect(() => {
    if (!threadSwitcherOpen) {
      setThreadSwitcherSearch("");
      setArchivedViewOpen(false);
    }
  }, [threadSwitcherOpen]);
  const [pendingPlan, setPendingPlan] = useState<{ content: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, "up" | "down">>({});
  const [reactionMenuId, setReactionMenuId] = useState<string | null>(null);
  const [badResponseModalId, setBadResponseModalId] = useState<string | null>(null);
  const [badResponseTags, setBadResponseTags] = useState<string[]>([]);
  const [badResponseDetail, setBadResponseDetail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  const [filePreviews, setFilePreviews] = useState<(UploadedFile & { uploading: boolean })[]>([]);
  const [composerNotice, setComposerNotice] = useState<string | null>(null);
  const [upgradeStripVisible, setUpgradeStripVisible] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  function removeFilePreview(id: string) {
    setFilePreviews((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((p) => p.id !== id);
    });
  }
  const [planMode, setPlanMode] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [contextScope, setContextScope] = useState<"Project" | "Thread">("Project");
  const [imageSettings, setImageSettings] = useState({
    aspect: "1:1",
    background: "Auto",
    style: "Auto",
  });
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [responseDepth, setResponseDepth] = useState("Standard");
  const [modelTier, setModelTier] = useState("Premium");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [selectedReference, setSelectedReference] = useState<string | null>(null);
  const [referenceListSearch, setReferenceListSearch] = useState("");
  const [editorEmpty, setEditorEmpty] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionCategory, setMentionCategory] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionItemQuery, setMentionItemQuery] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const savedSlashRangeRef = useRef<Range | null>(null);
  const [plusPickerOpen, setPlusPickerOpen] = useState(false);
  const savedPlusRangeRef = useRef<Range | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const queueSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [editingQueueId, setEditingQueueId] = useState<string | null>(null);
  const [editingQueueText, setEditingQueueText] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingMsgText, setEditingMsgText] = useState("");
  const plusRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const landingHeadingRef = useRef<HTMLParagraphElement>(null);
  const [composerHeight, setComposerHeight] = useState(88);
  const [headingHeight, setHeadingHeight] = useState(40);
  const mentionSearchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [msgTopFade, setMsgTopFade] = useState(false);
  const [msgBottomFade, setMsgBottomFade] = useState(true);
  const [journeyPreviewName, setJourneyPreviewName] = useState<string | null>(null);
  const [inputLocked, setInputLocked] = useState(false);

  function checkMsgFades() {
    const el = messagesRef.current;
    if (!el) return;
    setMsgTopFade(el.scrollTop > 8);
    setMsgBottomFade(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight - 8);
  }

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setMentionOpen(false);
        setMentionCategory(null);
        setSlashOpen(false);
        setPlusPickerOpen(false);
        setChatSettingsOpen(false);
        setReferencesOpen(false);
        setSelectedReference(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (threadSwitcherRef.current && !threadSwitcherRef.current.contains(e.target as Node)) {
        setThreadSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-reaction-menu]")) {
        setReactionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (mentionCategory) {
      setTimeout(() => mentionSearchRef.current?.focus(), 30);
    }
  }, [mentionCategory]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  function addAttachment(name: string) {
    if (!selectedReference) return;
    insertReferenceChip(selectedReference, name);
    setPlusOpen(false);
    setReferencesOpen(false);
    setSelectedReference(null);
    setReferenceListSearch("");
  }

  function removeAttachment(category: string) {
    setAttachments((current) => current.filter((item) => item.category !== category));
  }

  function updateImageSetting(key: keyof typeof imageSettings, value: string) {
    const nextSettings = { ...imageSettings, [key]: value };
    setImageSettings(nextSettings);
    setAttachments((current) => [
      ...current.filter((item) => item.category !== "Image settings"),
      {
        category: "Image settings",
        title: `${nextSettings.aspect} · ${nextSettings.background} · ${nextSettings.style}`,
        subtitle: "Generation settings",
        bg: "linear-gradient(135deg,#dbeafe 0%,#f8fafc 100%)",
      },
    ]);
  }

  function getCategoryIconPaths(key: string): string {
    switch (key) {
      case "journeys": return '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>';
      case "experiences": return '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="m18 22 4-4-4-4"/><path d="M21.8 16H20c-1.3 0-2.5-.6-3.3-1.7l-.5-.7"/>';
      case "avatars": return '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>';
      case "scenes": return '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1-.3 2.1.3 2.4 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.8"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>';
      case "poses": return '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>';
      case "design-system": return '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>';
      case "catalog": return '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
      case "events": return '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
      default: return "";
    }
  }

  function createMentionChipEl(categoryKey: string, label: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.contentEditable = "false";
    span.className = "mention-chip";
    span.dataset.mention = "true";
    span.dataset.categoryKey = categoryKey;
    span.dataset.label = label;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "11"); svg.setAttribute("height", "11");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = getCategoryIconPaths(categoryKey);
    const lbl = document.createElement("span");
    lbl.textContent = label;
    span.appendChild(svg);
    span.appendChild(lbl);
    return span;
  }

  function updateEditorEmpty() {
    const editor = editorRef.current;
    if (!editor) return;
    const text = (editor.textContent ?? "").replace(/ /g, " ").trim();
    const hasChip = editor.querySelectorAll("[data-mention], [data-reference]").length > 0;
    setEditorEmpty(!text && !hasChip);
  }

  function handleEditorInput() {
    const sel = window.getSelection();
    updateEditorEmpty();
    if (!sel?.rangeCount) { setMentionOpen(false); setSlashOpen(false); return; }
    const range = sel.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) { setMentionOpen(false); setMentionCategory(null); setSlashOpen(false); return; }
    const textBefore = (container.textContent ?? "").slice(0, range.startOffset);

    // @ mention
    const mentionMatch = textBefore.match(/@([^\s@]*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1];
      const atPos = range.startOffset - query.length - 1;
      const saved = document.createRange();
      saved.setStart(container, atPos);
      saved.setEnd(container, range.startOffset);
      savedRangeRef.current = saved;
      setMentionOpen(true);
      setMentionQuery(query.toLowerCase());
      if (!query) setMentionCategory(null);
      setSlashOpen(false);
      return;
    }

    // / recipe
    const slashMatch = textBefore.match(/(^|\s)\/([^\s/]*)$/);
    if (slashMatch) {
      const query = slashMatch[2];
      const slashPos = range.startOffset - query.length - 1;
      const saved = document.createRange();
      saved.setStart(container, slashPos);
      saved.setEnd(container, range.startOffset);
      savedSlashRangeRef.current = saved;
      setSlashOpen(true);
      setSlashQuery(query.toLowerCase());
      setMentionOpen(false);
      setMentionCategory(null);
      setPlusPickerOpen(false);
      return;
    }

    // + attach
    const plusMatch = textBefore.match(/(^|\s)\+$/);
    if (plusMatch) {
      const plusPos = range.startOffset - 1;
      const saved = document.createRange();
      saved.setStart(container, plusPos);
      saved.setEnd(container, range.startOffset);
      savedPlusRangeRef.current = saved;
      setPlusPickerOpen(true);
      setMentionOpen(false);
      setMentionCategory(null);
      setSlashOpen(false);
      return;
    }

    setMentionOpen(false);
    setMentionCategory(null);
    setSlashOpen(false);
    setPlusPickerOpen(false);
  }

  function selectCategory(key: string) {
    setMentionCategory(key);
    setMentionItemQuery("");
  }

  function selectMentionItem(item: string) {
    if (!mentionCategory || !savedRangeRef.current) return;
    const range = savedRangeRef.current;
    range.deleteContents();
    const chip = createMentionChipEl(mentionCategory, item);
    range.insertNode(chip);
    // place cursor just after chip
    const sel = window.getSelection();
    const after = document.createRange();
    after.setStartAfter(chip);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    savedRangeRef.current = null;
    setMentionOpen(false);
    setMentionCategory(null);
    setMentionQuery("");
    editorRef.current?.focus();
    updateEditorEmpty();
  }

  function openFilePicker() {
    if (savedPlusRangeRef.current) {
      savedPlusRangeRef.current.deleteContents();
      savedPlusRangeRef.current = null;
    }
    setPlusPickerOpen(false);
    editorRef.current?.focus();
    updateEditorEmpty();
    fileInputRef.current?.click();
  }

  function selectRecipe(recipe: SlashRecipe) {
    if (!savedSlashRangeRef.current) return;
    const range = savedSlashRangeRef.current;
    range.deleteContents();
    const chip = document.createElement("span");
    chip.contentEditable = "false";
    chip.dataset.recipe = "true";
    chip.dataset.recipeKey = recipe.key;
    chip.dataset.label = recipe.label;
    chip.style.cssText = "display:inline-flex;align-items:center;gap:3px;background:rgb(239,246,255);color:rgb(37,99,235);border-radius:4px;padding:1px 7px 1px 5px;font-size:12px;font-weight:600;white-space:nowrap;cursor:default;user-select:none;";
    chip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg>${recipe.label}`;
    range.insertNode(chip);
    const sel = window.getSelection();
    const after = document.createRange();
    after.setStartAfter(chip);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    savedSlashRangeRef.current = null;
    setSlashOpen(false);
    setSlashQuery("");
    editorRef.current?.focus();
    updateEditorEmpty();
  }

  function getEditorText(): string {
    const editor = editorRef.current;
    if (!editor) return "";
    let text = "";
    function walk(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.mention) {
        text += `@${node.dataset.label}`;
      } else if (node instanceof HTMLElement && node.dataset.recipe) {
        // skip — recipes render as chips, not inline text
      } else if (node instanceof HTMLElement && node.dataset.reference) {
        // skip — references render as chips, not inline text
      } else {
        node.childNodes.forEach(walk);
      }
    }
    walk(editor);
    return text.trim();
  }

  function getEditorRecipes(): RecipeChip[] {
    const editor = editorRef.current;
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-recipe]")).map((el) => {
      const e = el as HTMLElement;
      return { key: e.dataset.recipeKey ?? "", label: e.dataset.label ?? "" };
    });
  }

  function getEditorMentions(): MentionChip[] {
    const editor = editorRef.current;
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-mention]")).map((el, i) => {
      const e = el as HTMLElement;
      return { id: `msg-m-${i}`, categoryKey: e.dataset.categoryKey ?? "", label: e.dataset.label ?? "" };
    });
  }

  function getEditorReferences(): ReferenceAttachment[] {
    const editor = editorRef.current;
    if (!editor) return [];
    return Array.from(editor.querySelectorAll("[data-reference]")).map((el) => {
      const e = el as HTMLElement;
      return { category: e.dataset.category ?? "", title: e.dataset.refName ?? "", subtitle: "", bg: "" };
    });
  }

  function clearEditor() {
    if (editorRef.current) editorRef.current.innerHTML = "";
    setEditorEmpty(true);
  }

  function insertReferenceChip(category: string, name: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const chip = createReferenceChipEl(category, name);
    const space = document.createTextNode(" ");
    editor.appendChild(chip);
    editor.appendChild(space);
    editor.focus();
    const range = document.createRange();
    range.setStartAfter(space);
    range.collapse(true);
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    updateEditorEmpty();
  }

  function removeQueueItem(id: string) {
    setQueue((q) => q.filter((item) => item.id !== id));
    if (editingQueueId === id) setEditingQueueId(null);
  }

  function saveQueueEdit(id: string) {
    const trimmed = editingQueueText.trim();
    if (trimmed) setQueue((q) => q.map((item) => item.id === id ? { ...item, text: trimmed } : item));
    setEditingQueueId(null);
  }

  function handleQueueDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setQueue((q) => {
      const oldIdx = q.findIndex((item) => item.id === active.id);
      const newIdx = q.findIndex((item) => item.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return q;
      return arrayMove(q, oldIdx, newIdx);
    });
  }

  function startMsgEdit(msg: ChatMessage) {
    setEditingMsgId(msg.id);
    setEditingMsgText(msg.text);
  }

  function saveMsgEdit(id: string) {
    const trimmed = editingMsgText.trim();
    setEditingMsgId(null);
    if (!trimmed) return;
    // Drop the old message and everything after it — its Blu reply no longer matches the edit — then resend as a fresh message.
    setMessages((current) => {
      const idx = current.findIndex((m) => m.id === id);
      return idx === -1 ? current : current.slice(0, idx);
    });
    sendMessage(trimmed);
  }

  function regenerateBluReply(msg: ChatMessage) {
    setReactionMenuId(null);
    setReactions((current) => {
      const next = { ...current };
      delete next[msg.id];
      return next;
    });
    setMessages((current) => current.map((item) => (
      item.id === msg.id
        ? { ...item, isStreaming: true }
        : item
    )));
  }

  function forkFromMessage(msg: ChatMessage) {
    const idx = messages.findIndex((item) => item.id === msg.id);
    if (idx === -1) return;
    const forked = messages.slice(0, idx + 1);
    forkThread(forked, activeThread?.title ? `${activeThread.title} (fork)` : null);
  }

  const latestCompletedBluId = [...messages].reverse().find((msg) =>
    msg.role === "blu" &&
    !msg.feedbackForm &&
    !msg.isTyping &&
    !msg.isStreaming &&
    !msg.isError &&
    !msg.isPlan &&
    !msg.runTasks
  )?.id;

  const lastBluMessageId = [...messages].reverse().find((msg) => msg.role === "blu")?.id;

  function sendMessage(overrideText?: string) {
    if (inputLocked) return;
    const text = overrideText ?? getEditorText();
    const currentMentions = overrideText ? [] : getEditorMentions();
    const currentRecipes = overrideText ? [] : getEditorRecipes();
    const currentReferences = overrideText ? [] : getEditorReferences();
    if (!text && attachments.length === 0 && filePreviews.length === 0 && currentMentions.length === 0 && currentRecipes.length === 0 && currentReferences.length === 0) return;

    // Queue intercept — "q1", "q2", etc.
    if (!overrideText && /^q\d+$/i.test(text.trim())) {
      if (queue.length >= MAX_QUEUE) {
        setComposerNotice("Queue full. Delete one or wait for a slot to open up.");
        return;
      }
      setQueue((q) => [...q, { id: `q-${Date.now()}`, text: text.trim() }]);
      clearEditor();
      return;
    }

    if (!sessionTime) {
      const now = new Date();
      setSessionTime(now.toLocaleDateString("en-US", { weekday: "long" }) + " " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }
    if (messages.length === 0 && text.trim()) {
      renameActiveThread(text.trim().slice(0, 60));
    }
    const isFeedback = !overrideText && text.toLowerCase() === "feedback";
    const isFailed = !overrideText && text.toLowerCase() === "failed";
    const isError = !overrideText && text.toLowerCase() === "error";
    const isPlan = !overrideText && text.toLowerCase() === "plan";
    const runMatch = !overrideText ? text.toLowerCase().match(/^run(?:-(2|3))?$/) : null;
    const runCount = runMatch ? Number(runMatch[1] ?? 1) : 0;
    const isRunDeclined = !overrideText && text.toLowerCase() === "run-declined";
    const isLiveRunDeclined = !overrideText && text.toLowerCase() === "live-run-declined";
    const isCreateRecipe  = !overrideText && text === "create-recipe";
    const isCustomReport  = !overrideText && text.toLowerCase() === "custom-report";
    const isCustomReportDeclined = !overrideText && text.toLowerCase() === "custom-report-declined";
    const isCustomReportNoEmbed = !overrideText && text.toLowerCase() === "custom-report-no-embed";
    const isAddEvent = !overrideText && text.toLowerCase() === "add-event";
    const isLiveRun = !overrideText && text.toLowerCase() === "live-run";
    const isAcceptRun = !overrideText && text.toLowerCase() === "accept-run";
    const isNotification = !overrideText && text.toLowerCase() === "notification";
    const isUpgrade = !overrideText && text.toLowerCase() === "upgrade";
    const isCreateJourney = /create (a )?journey/i.test(text);
    const journeyName = isCreateJourney ? "Demo" : null;
    let generalReplyIndex = 0;

    setMessages((current) => {
      const ts = Date.now();
      const userMsg: ChatMessage = {
        id: `user-${ts}`,
        role: "user",
        text,
        timestamp: ts,
        attachments: [...attachments, ...currentReferences],
        files: filePreviews.length ? filePreviews.map((p) => ({ id: p.id, url: p.url, name: p.name, kind: p.kind })) : undefined,
        mentions: currentMentions,
        recipes: currentRecipes.length ? currentRecipes : undefined,
      };
      const next: ChatMessage[] = [...current, userMsg];
      if (isPlan) {
        next.push({
          id: `blu-plan-${ts}`,
          role: "blu",
          text: "Here's a plan based on your request.",
          isPlan: true,
          planContent: PLAN_SAMPLE,
        });
        setTimeout(() => setPendingPlan({ content: PLAN_SAMPLE }), 50);
      } else if (runMatch) {
        next.push({
          id: `blu-run-${ts}`,
          role: "blu",
          text: "",
          runTasks: RUN_TASKS.slice(0, runCount),
        });
      } else if (isRunDeclined) {
        next.push({
          id: `blu-run-${ts}`,
          role: "blu",
          text: "",
          runTasks: RUN_TASKS.slice(0, 1),
          declined: true,
        });
      } else if (isLiveRun) {
        next.push({
          id: `blu-liverun-${ts}`,
          role: "blu",
          text: "",
          liveRun: true,
        });
      } else if (isLiveRunDeclined) {
        next.push({
          id: `blu-liverun-${ts}`,
          role: "blu",
          text: "",
          liveRun: true,
          declined: true,
        });
      } else if (isAcceptRun) {
        next.push({
          id: `blu-acceptrun-${ts}`,
          role: "blu",
          text: "",
          acceptRun: true,
        });
      } else if (isFailed || isError) {
        next.push({
          id: `blu-error-${ts}`,
          role: "blu",
          text: isFailed
            ? "Something went wrong while processing your request."
            : "Blu didn't respond properly. This might be a temporary issue — try again or report it if it keeps happening.",
          isError: true,
        });
      } else if (isFeedback) {
        next.push({
          id: `blu-feedback-${ts}`,
          role: "blu",
          text: "I'd love to help capture that! Answer a few quick questions so your feedback reaches the right people.",
          feedbackForm: true,
        });
      } else if (isCreateRecipe) {
        next.push({ id: `blu-recipe-${ts}`, role: "blu", text: "Opening recipe canvas — wire up your pipeline steps and hit Run when ready." });
      } else if (isCustomReport || isCustomReportDeclined || isCustomReportNoEmbed || isAddEvent) {
        next.push({ id: `blu-typing-${ts}`, role: "blu", text: "", isTyping: true });
      } else if (isCreateJourney) {
        next.push({ id: `blu-typing-${ts}`, role: "blu", text: "", isTyping: true });
      } else if (isNotification) {
        // no Blu reply — this just flips the thread-switcher icon below
      } else if (isUpgrade) {
        // no Blu reply — this just opens the upgrade strip above the composer
      } else {
        generalReplyIndex = current.length;
        next.push({ id: `blu-typing-${ts}`, role: "blu", text: "", isTyping: true });
      }
      return next;
    });

    if (isCustomReport || isCustomReportDeclined || isCustomReportNoEmbed || isAddEvent) {
      setTimeout(() => {
        setMessages((current) => {
          const typingIdx = current.findIndex((m) => m.isTyping);
          if (typingIdx === -1) return current;
          const next = [...current];
          const reportId = `blu-report-${Date.now()}`;
          next[typingIdx] = isCustomReportDeclined
            ? { id: reportId, role: "blu", text: "", queryTrace: true, declined: true }
            : { id: reportId, role: "blu", text: "", queryTrace: true, extraEvent: isAddEvent, noEmbed: isCustomReportNoEmbed, followUps: CUSTOM_REPORT_FOLLOW_UPS };
          setActiveReportId(reportId);
          return next;
        });
      }, 1200);
    } else if (isCreateJourney && journeyName) {
      setTimeout(() => {
        setMessages((current) => {
          const typingIdx = current.findIndex((m) => m.isTyping);
          if (typingIdx === -1) return current;
          const ts = Date.now();
          const next = [...current];
          next[typingIdx] = {
            id: `blu-journey-${ts}`,
            role: "blu",
            text: `Created journey "${journeyName}". It starts with a signup trigger, sends a welcome email, waits 2 days, then branches based on whether the email was opened.`,
            isStreaming: true,
            journeyChip: { name: journeyName },
          };
          return next;
        });
      }, 3000);
    } else if (!isPlan && !runMatch && !isRunDeclined && !isFailed && !isError && !isFeedback && !isCreateRecipe && !isCustomReport && !isCustomReportDeclined && !isCustomReportNoEmbed && !isAddEvent && !isLiveRun && !isLiveRunDeclined && !isAcceptRun && !isNotification && !isUpgrade) {
      setTimeout(() => {
        setMessages((current) => {
          const typingIdx = current.findIndex((m) => m.isTyping);
          if (typingIdx === -1) return current;
          const ts = Date.now();
          const next = [...current];
          next[typingIdx] = {
            id: `blu-${ts}`,
            role: "blu",
            text: BLU_REPLIES[generalReplyIndex % BLU_REPLIES.length],
            isStreaming: true,
            followUps: GENERAL_FOLLOW_UPS,
          };
          return next;
        });
      }, 2000);
    }

    if (!overrideText) {
      clearEditor();
      setAttachments([]);
      setFilePreviews([]);
      setMentionOpen(false);
      setMentionCategory(null);
      setPlusOpen(false);
      setReferencesOpen(false);
      setSelectedReference(null);
    }

    if (isCreateRecipe) {
      setTimeout(() => window.dispatchEvent(new CustomEvent("open-recipe-canvas")), 600);
    }

    if (isNotification) {
      markThreadsUnread(2);
    }

    if (isUpgrade) {
      setUpgradeStripVisible(true);
    }

    if (!isFeedback && !isCreateRecipe && !isNotification && !isUpgrade) {
      window.dispatchEvent(new CustomEvent("blu-image-generate", { detail: { text } }));
    }
  }

  useEffect(() => {
    function handleSuggestedPrompt(event: Event) {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt?.trim();
      if (prompt) sendMessage(prompt);
    }
    function handleSetLocked(event: Event) {
      setInputLocked((event as CustomEvent<boolean>).detail);
    }
    function handleRecipeRun(event: Event) {
      const steps = (event as CustomEvent<{ steps: string[] }>).detail?.steps;
      if (!steps?.length) return;
      const ts = Date.now();
      setMessages((c) => [
        ...c,
        { id: `blu-exec-${ts}`, role: "blu", text: "", execChecklist: { steps } },
      ]);
    }

    window.addEventListener("blu-suggested-prompt", handleSuggestedPrompt);
    window.addEventListener("blu-set-locked", handleSetLocked);
    window.addEventListener("blu-recipe-run", handleRecipeRun);
    return () => {
      window.removeEventListener("blu-suggested-prompt", handleSuggestedPrompt);
      window.removeEventListener("blu-set-locked", handleSetLocked);
      window.removeEventListener("blu-recipe-run", handleRecipeRun);
    };
  });

  const topStripVisible = chatSettingsOpen || referencesOpen || !!selectedReference || composerNotice !== null || upgradeStripVisible || (hasUnreadThreads && !notificationStripDismissed);

  const isLanding = mode === "fullscreen" && messages.length === 0;
  const [landingPrompt] = useState(() => LANDING_PROMPTS[Math.floor(Math.random() * LANDING_PROMPTS.length)]);

  useEffect(() => {
    if (mode !== "fullscreen") return;
    const composerEl = mentionRef.current;
    const headingEl = landingHeadingRef.current;
    if (!composerEl) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === composerEl) setComposerHeight(entry.contentRect.height);
        if (entry.target === headingEl) setHeadingHeight(entry.contentRect.height);
      }
    });
    ro.observe(composerEl);
    if (headingEl) ro.observe(headingEl);
    return () => ro.disconnect();
  }, [mode]);

  return (
    <div
      className={`flex flex-col h-full ${mode === "fullscreen" ? "" : "rounded-xl overflow-hidden"}`}
      style={
        mode === "fullscreen"
          ? { background: "var(--content-bg)" }
          : {
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 0 0 0.5px rgba(0,0,0,0.04)",
            }
      }
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2.5 pl-4 pr-2.5 py-2.75 shrink-0 ${onHeaderMouseDown ? "cursor-move select-none" : ""}`}
        onMouseDown={onHeaderMouseDown}
      >
        {mode === "float" && (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full pointer-events-none"
            style={{ background: "rgba(0,128,255,0.12)" }}
          >
            <img src="/mascot.png" alt="Blu" width={20} height={20} className="object-contain" />
          </span>
        )}
        <div className={`flex-1 min-w-0 ${mode === "panel" || mode === "fullscreen" ? "" : "pointer-events-none"}`}>
          {mode === "panel" || mode === "fullscreen" ? (
            <div ref={threadSwitcherRef} className={`relative w-fit max-w-full ${mode === "panel" ? "-ml-1.25" : ""}`}>
              <button
                type="button"
                onClick={() => setThreadSwitcherOpen((o) => !o)}
                className="flex max-w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-stone-100 dark:hover:bg-white/6"
              >
                <NotificationIcon hasUnread={hasUnreadThreads} phase={unreadIconPhase} />
                <span className="max-w-[20ch] truncate text-sm font-medium leading-none text-stone-800 dark:text-stone-100">
                  {activeThreadTitle}
                </span>
                <ChevronDown
                  size={15}
                  className="shrink-0 text-stone-400 transition-transform duration-200"
                  style={{ transform: threadSwitcherOpen ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>

              <div
                className="absolute left-0 top-[calc(100%+6px)] z-50 w-88 overflow-hidden rounded-xl"
                style={{
                  background: "var(--content-bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                  opacity: threadSwitcherOpen ? 1 : 0,
                  transform: threadSwitcherOpen ? "translateY(0)" : "translateY(-6px)",
                  pointerEvents: threadSwitcherOpen ? "auto" : "none",
                  transition: "opacity 180ms cubic-bezier(0.23,1,0.32,1), transform 180ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                <div className="flex flex-col gap-1.5 p-1.5">
                  <div className="relative">
                    <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={threadSwitcherSearch}
                      onChange={(e) => setThreadSwitcherSearch(e.target.value)}
                      placeholder="Search chats..."
                      className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { createThread(); setThreadSwitcherOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/6"
                  >
                    <Plus size={14} className="shrink-0 text-stone-400" />
                    New chat
                  </button>
                </div>
                {!archivedViewOpen ? (
                <div className="max-h-64 overflow-y-auto chat-scroll px-1.5 pb-1.5">
                  {threads
                    .filter((t) => !t.archived)
                    .filter((t) => (t.title ?? "New chat").toLowerCase().includes(threadSwitcherSearch.toLowerCase()))
                    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                    .map((t) => {
                      const isActive = t.id === activeThreadId;
                      const isUnread = unreadThreadIds.has(t.id);
                      const isRenaming = renamingThreadId === t.id;

                      function commitRename() {
                        renameThread(t.id, renameDraft);
                        setRenamingThreadId(null);
                      }

                      return (
                        <div
                          key={t.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => { if (isRenaming) return; switchThread(t.id); markThreadRead(t.id); setThreadSwitcherOpen(false); }}
                          onKeyDown={(e) => { if (!isRenaming && (e.key === "Enter" || e.key === " ")) { switchThread(t.id); markThreadRead(t.id); setThreadSwitcherOpen(false); } }}
                          className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                            isActive ? "bg-stone-100 dark:bg-white/8" : "hover:bg-stone-100 dark:hover:bg-white/6"
                          }`}
                        >
                          {isUnread && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" style={{ animation: "fade-up 250ms ease-out both" }} />
                          )}
                          {t.pinned && (
                            <Pin size={11} className="shrink-0 fill-current text-blue-500" />
                          )}
                          {isRenaming ? (
                            <input
                              autoFocus
                              value={renameDraft}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setRenameDraft(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") commitRename();
                                if (e.key === "Escape") setRenamingThreadId(null);
                              }}
                              className="min-w-0 flex-1 rounded-md bg-white px-1.5 py-0.5 text-sm font-medium text-stone-900 outline-none ring-1 ring-blue-400 dark:bg-white/10 dark:text-stone-100"
                            />
                          ) : (
                            <span className={`min-w-0 flex-1 truncate text-sm ${isActive ? "font-semibold text-stone-900 dark:text-stone-100" : "font-medium text-stone-700 dark:text-stone-200"}`}>
                              {t.title ?? "New chat"}
                            </span>
                          )}
                          {!isRenaming && (
                            <span className="relative h-7 w-30 shrink-0">
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-xs text-stone-400 opacity-100 transition-opacity duration-100 group-hover:opacity-0 dark:text-stone-500">
                                {isActive ? "Current" : t.time}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100">
                                <button
                                  type="button"
                                  title={t.pinned ? "Unpin" : "Pin"}
                                  onClick={(e) => { e.stopPropagation(); togglePinThread(t.id); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/6 dark:hover:text-stone-200"
                                >
                                  <Pin size={13} className={t.pinned ? "fill-current text-blue-500" : ""} />
                                </button>
                                <button
                                  type="button"
                                  title="Rename"
                                  onClick={(e) => { e.stopPropagation(); setRenamingThreadId(t.id); setRenameDraft(t.title ?? "New chat"); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/6 dark:hover:text-stone-200"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  title="Archive"
                                  onClick={(e) => { e.stopPropagation(); archiveThread(t.id); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/6 dark:hover:text-stone-200"
                                >
                                  <Archive size={13} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={(e) => { e.stopPropagation(); deleteThread(t.id); }}
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto chat-scroll px-1.5 pb-1.5">
                  {threads
                    .filter((t) => t.archived)
                    .filter((t) => (t.title ?? "New chat").toLowerCase().includes(threadSwitcherSearch.toLowerCase()))
                    .map((t) => (
                      <div
                        key={t.id}
                        className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700 dark:text-stone-200">
                          {t.title ?? "New chat"}
                        </span>
                        <span className="relative h-7 w-15 shrink-0">
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-xs text-stone-400 opacity-100 transition-opacity duration-100 group-hover:opacity-0 dark:text-stone-500">
                            {t.time}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100">
                            <button
                              type="button"
                              title="Restore"
                              onClick={() => unarchiveThread(t.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/6 dark:hover:text-stone-200"
                            >
                              <ArchiveRestore size={13} />
                            </button>
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => deleteThread(t.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </span>
                        </span>
                      </div>
                    ))}
                  {threads.filter((t) => t.archived).length === 0 && (
                    <p className="px-2.5 py-6 text-center text-xs text-stone-400 dark:text-stone-500">No archived chats</p>
                  )}
                </div>
              )}
              <div className="p-1.5 pt-0">
                <button
                  type="button"
                  onClick={() => setArchivedViewOpen((o) => !o)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    archivedViewOpen ? "bg-stone-100 dark:bg-white/8" : "hover:bg-stone-100 dark:hover:bg-white/6"
                  }`}
                >
                  <Archive size={14} className="shrink-0 text-stone-400" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-700 dark:text-stone-200">
                    Archived chats
                  </span>
                  {archivedViewOpen ? (
                    <ChevronLeft size={13} className="shrink-0 text-stone-400" />
                  ) : (
                    <ChevronRight size={13} className="shrink-0 text-stone-400" />
                  )}
                </button>
              </div>
              </div>
            </div>
          ) : (
            <p className="text-base font-semibold text-stone-800 dark:text-stone-100 leading-none">Blu</p>
          )}
        </div>

        {/* Mode action buttons — stop propagation so they don't trigger drag */}
        <div className="flex items-center gap-0.5" onMouseDown={(e) => e.stopPropagation()}>
          {mode === "panel" && (
            <>
              {onFloat && (
                <button
                  onClick={onFloat}
                  title="Float window"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <AppWindow size={13} />
                </button>
              )}
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  title="Fullscreen"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <Maximize2 size={13} />
                </button>
              )}
            </>
          )}
          {mode === "float" && (
            <>
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  title="Fullscreen"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <Maximize2 size={13} />
                </button>
              )}
              {onBackToPanel && (
                <button
                  onClick={onBackToPanel}
                  title="Back to panel"
                  className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
                >
                  <AppWindow size={13} />
                </button>
              )}
            </>
          )}
          {mode === "fullscreen" && onBackToPanel && (
            <button
              onClick={onBackToPanel}
              title="Exit fullscreen"
              className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/8 transition-colors text-stone-400"
            >
              <Minimize2 size={13} />
            </button>
          )}

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* History panel */}
      {historyOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <div className={`relative ${mode === "fullscreen" ? "max-w-3xl mx-auto" : ""}`}>
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                autoFocus
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-xs font-medium text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100 dark:placeholder:text-stone-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto chat-scroll pb-3">
          <div className={mode === "fullscreen" ? "max-w-3xl mx-auto" : ""}>
            {/* Archived */}
            {ARCHIVED_HISTORY.filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase())).length > 0 && (
              <>
                <div className="flex items-center gap-1.5 px-4 pb-1 pt-3">
                  <Archive size={13} className="text-stone-400 dark:text-stone-500" />
                  <p className="text-sm font-semibold text-stone-400 dark:text-stone-500">Archived</p>
                </div>
                {ARCHIVED_HISTORY
                  .filter((h) => !historySearch || h.title.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setHistoryOpen(false)}
                      className="group w-full text-left px-4 py-2.5 transition-colors hover:bg-stone-50 dark:hover:bg-white/4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{item.title}</p>
                        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500 pt-px">{item.time}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-stone-400 dark:text-stone-500">{item.preview}</p>
                    </button>
                  ))}
              </>
            )}

            {/* Empty state */}
            {!ARCHIVED_HISTORY.some((h) => h.title.toLowerCase().includes(historySearch.toLowerCase())) && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Archive size={24} className="mb-3 text-stone-300 dark:text-stone-600" />
                <p className="text-sm font-medium text-stone-500 dark:text-stone-400">No results for "{historySearch}"</p>
              </div>
            )}
          </div>
          </div>
        </div>
      )}

      {/* Content area below header — hosts Messages, Pending plan card, and Input; relative so the
          fullscreen landing composer can be absolutely centered, then FLIP down to the dock position. */}
      {!historyOpen && <div className="relative flex-1 flex flex-col min-h-0">

      {/* Fullscreen landing heading — fades out the moment typing starts, well before send */}
      {mode === "fullscreen" && (
        <p
          ref={landingHeadingRef}
          className="pointer-events-none absolute left-0 right-0 mx-auto w-full max-w-2xl text-center text-2xl font-medium text-stone-800 dark:text-stone-100 transition-[transform,opacity] duration-300 ease-out"
          style={{
            top: "50%",
            transform: `translateY(-50%) translateY(-${composerHeight / 2 + 24 + headingHeight / 2}px)`,
            opacity: isLanding && editorEmpty ? 1 : 0,
          }}
        >
          {landingPrompt}
        </p>
      )}

      {/* Messages */}
      <div className="relative flex-1 min-h-0" style={{ filter: pendingPlan ? "blur(2px)" : "none", transition: "filter 0.2s", pointerEvents: pendingPlan ? "none" : undefined }}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 transition-opacity duration-300"
          style={{ opacity: msgTopFade ? 1 : 0, background: "linear-gradient(to bottom, var(--content-bg) 0%, transparent 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 transition-opacity duration-300"
          style={{ opacity: msgBottomFade ? 1 : 0, background: "linear-gradient(to top, var(--content-bg) 0%, transparent 100%)" }}
        />
        <div
          ref={messagesRef}
          onScroll={checkMsgFades}
          className="h-full overflow-y-auto px-4 py-4 chat-scroll"
          style={{ paddingBottom: mode === "fullscreen" ? composerHeight + 48 : undefined }}
        >
        <div className={`space-y-4 ${mode === "fullscreen" ? "max-w-3xl mx-auto" : ""}`}>
        {messages.length === 0 && mode !== "fullscreen" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pb-8 select-none text-center">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">Ask Blu anything</p>
            <p className="text-xs text-stone-400 dark:text-stone-500">What are you working on today?</p>
          </div>
        )}
        {(() => {
          let lastShownTs: number | null = null;
          return messages.map((msg) => {
            const isEditingThis = msg.role === "user" && editingMsgId === msg.id;
            const isFullWidthBlock = isEditingThis || !!msg.queryTrace || !!msg.liveRun || !!msg.acceptRun || !!msg.runTasks;
            const showTimestamp =
              msg.role === "user" &&
              msg.timestamp != null &&
              (lastShownTs === null || msg.timestamp - lastShownTs >= TIMESTAMP_DIVIDER_GAP_MS);
            if (showTimestamp) lastShownTs = msg.timestamp!;
            return (
          <Fragment key={msg.id}>
          {showTimestamp && (
            <div className="flex items-center justify-center py-1">
              <span className="text-xs text-stone-400 dark:text-stone-500">{fmtTimestampDivider(msg.timestamp!)}</span>
            </div>
          )}
          <div className="relative flex animate-fade-up justify-start hover:z-20 focus-within:z-20">
          <div className={`group flex flex-col gap-1.5 items-start ${isFullWidthBlock ? "w-full" : "max-w-[85%]"}`}>
            <div className="flex items-center gap-1.5">
              {/* Avatar */}
              {msg.role === "user" ? (
                <div className="h-6 w-6 rounded-full overflow-hidden shrink-0">
                  <img src="/dp.png" alt="You" width={24} height={24} className="w-full h-full object-cover" />
                </div>
              ) : (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(0,128,255,0.12)" }}
                >
                  <img
                    src="/mascot.png"
                    alt="Blu"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                </span>
              )}
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {msg.role === "user" ? "Rana" : "Blu"}
              </span>
            </div>
            <div className="min-w-0 w-full">
              {msg.files?.length ? (
                <div className="mb-2 flex flex-wrap justify-start gap-1.5">
                  {msg.files.map((f) =>
                    f.kind === "image" ? (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLightboxUrl(f.url)}
                        className="h-28 w-28 shrink-0 overflow-hidden rounded-xl transition-opacity hover:opacity-90"
                        style={{ border: "1px solid var(--border)" }}
                      >
                        <img src={f.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ) : (
                      <div
                        key={f.id}
                        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl"
                        style={{ border: "1px solid var(--border)", background: "var(--muted)" }}
                      >
                        <FileKindName name={f.name} />
                        <FileKindBadge kind={f.kind} />
                      </div>
                    )
                  )}
                </div>
              ) : null}
              {msg.runTasks ? (
                <CreationRunStatus tasks={msg.runTasks} declined={msg.declined} />
              ) : msg.liveRun ? (
                <LiveRun declined={msg.declined} />
              ) : msg.acceptRun ? (
                <AcceptRun />
              ) : msg.execChecklist ? (
                <ExecChecklist steps={msg.execChecklist.steps} />
              ) : msg.queryTrace ? (
                <CustomReportBlock
                  declined={msg.declined}
                  extraEvent={msg.extraEvent}
                  noEmbed={msg.noEmbed}
                  onSettled={() => {
                    setSettledReportIds((s) => new Set(s).add(msg.id));
                    setActiveReportId((id) => (id === msg.id ? null : id));
                  }}
                />
              ) : msg.isTyping ? (
                <LoadingState label="Thinking" variant="Beam" />
              ) : msg.isStreaming && msg.role === "blu" ? (
                <StreamingReply
                  text={msg.text}
                  onDone={() => {
                    setMessages((current) => current.map((item) => item.id === msg.id ? { ...item, isStreaming: false } : item));
                  }}
                />
              ) : msg.isError ? (
                <div
                  className="inline-flex flex-col gap-2.5 rounded-xl px-4 py-3"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
                >
                  <div className="flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{msg.text}</p>
                  </div>
                  <button
                    onClick={() => window.open("mailto:support@intempt.com?subject=Bug+Report", "_blank")}
                    className="self-start inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                    style={{ background: "rgba(239,68,68,0.1)", color: "rgb(220,38,38)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/>
                      <path d="M18.5 2.5a2.5 2.5 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Report bug
                  </button>
                </div>
              ) : msg.role === "user" && editingMsgId === msg.id ? (
                <div className="flex w-full flex-col gap-3 rounded-xl px-4 pt-5 pb-4" style={{ background: "var(--muted)" }}>
                  <textarea
                    autoFocus
                    value={editingMsgText}
                    onChange={(e) => {
                      setEditingMsgText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveMsgEdit(msg.id); }
                      if (e.key === "Escape") setEditingMsgId(null);
                    }}
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = `${el.scrollHeight}px`;
                      }
                    }}
                    className="w-full resize-none bg-transparent text-sm text-stone-700 outline-none dark:text-stone-200"
                    style={{ minHeight: "1.4em", maxHeight: 240, overflowY: "auto" }}
                    rows={1}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingMsgId(null)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/8"
                      style={{ border: "1px solid var(--border)", background: "var(--content-bg)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveMsgEdit(msg.id)}
                      className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#0080FF" }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : msg.role === "user" ? (
                <p
                  className="inline-block max-w-full whitespace-pre-wrap wrap-break-word rounded-2xl px-3.5 py-2.5 text-sm leading-[1.55] text-stone-800 dark:text-stone-100"
                  style={{ background: "var(--muted)", borderTopLeftRadius: 4 }}
                >
                  {msg.text}
                </p>
              ) : (
                <p className="max-w-full text-sm text-stone-600 dark:text-stone-300 leading-[1.55] whitespace-pre-wrap wrap-break-word">
                  {msg.text}
                </p>
              )}
              {msg.journeyChip && !msg.isStreaming && (
                <div className="mt-2.5">
                  <button
                    onClick={() => setJourneyPreviewName(msg.journeyChip!.name)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-90"
                    style={{
                      background: "rgb(245,243,255)",
                      color: "rgb(109,40,217)",
                      border: "1px solid rgb(221,214,254)",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="19" r="3"/>
                      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                      <circle cx="18" cy="5" r="3"/>
                    </svg>
                    {msg.journeyChip.name}
                    <span className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px]" style={{ background: "rgb(237,233,254)" }}>
                      <Eye size={9} />
                      Preview
                    </span>
                  </button>
                </div>
              )}
              {msg.feedbackForm && (
                <FeedbackQuestionnaire onSubmit={(text) => sendMessage(text)} />
              )}
              {msg.mentions?.length ? (
                <div className="mt-2 flex flex-wrap justify-start gap-1.5">
                  {msg.mentions.map((m) => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/12"
                    >
                      <span className="shrink-0">{getMentionIcon(m.categoryKey, 11)}</span>
                      {m.label}
                    </span>
                  ))}
                </div>
              ) : null}
              {msg.recipes?.length ? (
                <div className="mt-2 flex flex-wrap justify-start gap-1.5">
                  {msg.recipes.map((r) => (
                    <span
                      key={r.key}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/12"
                    >
                      <ChefHat size={11} strokeWidth={2.5} className="shrink-0" />
                      {r.label}
                    </span>
                  ))}
                </div>
              ) : null}
              {msg.attachments?.length ? (
                <div className="mt-2 flex flex-wrap justify-start gap-1.5">
                  {msg.attachments.map((item) => (
                    <span
                      key={`${msg.id}-${item.category}`}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-medium text-stone-600 dark:border-(--border) dark:bg-white/4 dark:text-stone-300"
                    >
                      <span className="truncate">{item.category}: {item.title}</span>
                    </span>
                  ))}
                </div>
              ) : null}
              {!msg.feedbackForm && !msg.runTasks && !msg.liveRun && !msg.acceptRun && !msg.isTyping && !msg.isStreaming && !msg.isError && !msg.isPlan && editingMsgId !== msg.id && (
                <div className={`mt-2.5 flex w-full items-center gap-1 transition-opacity justify-start ${
                  msg.role === "blu" && msg.id === latestCompletedBluId
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                }`}>
                  {/* Copy */}
                  <div className="group/tip relative">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        setCopiedId(msg.id);
                        setTimeout(() => setCopiedId((id) => id === msg.id ? null : id), 1500);
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                        copiedId === msg.id
                          ? "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"
                          : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      }`}
                    >
                      {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                      {copiedId === msg.id ? "Copied!" : "Copy"}
                    </span>
                  </div>
                  {/* Fork from here */}
                  <div className="group/tip relative">
                    <button
                      onClick={() => forkFromMessage(msg)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                    >
                      <GitFork size={13} />
                    </button>
                    <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                      Fork from here
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="group/tip relative">
                      <button
                        onClick={() => startMsgEdit(msg)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      >
                        <Pencil size={13} />
                      </button>
                      <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                        Edit
                      </span>
                    </div>
                  )}
                  {msg.role === "blu" && (
                    <>
                    <div className="relative" data-reaction-menu>
                      <div className="group/tip relative">
                        <button
                          onClick={() => setReactionMenuId((id) => id === msg.id ? null : msg.id)}
                          className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                            reactions[msg.id]
                              ? "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"
                              : "text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                          }`}
                        >
                          {reactions[msg.id] === "down" ? (
                            <ThumbsDown size={13} fill="currentColor" />
                          ) : reactions[msg.id] === "up" ? (
                            <ThumbsUp size={13} fill="currentColor" />
                          ) : (
                            <span className="relative flex h-4 w-4 items-center justify-center">
                              <ThumbsUp size={12} className="absolute -left-0.5 -top-0.5" />
                              <ThumbsDown size={12} className="absolute -bottom-0.5 -right-0.5" />
                            </span>
                          )}
                        </button>
                        <span className={`pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white transition-opacity dark:bg-stone-700 ${reactionMenuId === msg.id ? "opacity-0" : "opacity-0 group-hover/tip:opacity-100"}`}>
                          {reactions[msg.id] === "down" ? "Bad response" : reactions[msg.id] === "up" ? "Good response" : "Rate response"}
                        </span>
                      </div>

                      {reactionMenuId === msg.id && (
                        <div
                          className="absolute bottom-[calc(100%+8px)] left-0 z-40 w-40 rounded-xl p-1.5 animate-card-in"
                          style={{
                            background: "var(--content-bg)",
                            border: "1px solid var(--border)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                          }}
                        >
                          {[
                            { value: "up" as const, label: "Good response", icon: ThumbsUp },
                            { value: "down" as const, label: "Bad response", icon: ThumbsDown },
                          ].map((item) => {
                            const Icon = item.icon;
                            const active = reactions[msg.id] === item.value;

                            return (
                              <button
                                key={item.value}
                                onClick={() => {
                                  setReactions((current) => ({ ...current, [msg.id]: item.value }));
                                  setReactionMenuId(null);
                                  if (item.value === "down") {
                                    setBadResponseTags([]);
                                    setBadResponseDetail("");
                                    setBadResponseModalId(msg.id);
                                  }
                                }}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                                  active
                                    ? "bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-stone-100"
                                    : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/6"
                                }`}
                              >
                                <Icon size={14} fill={active ? "currentColor" : "none"} className="shrink-0" />
                                <span className="text-sm font-medium">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="group/tip relative">
                      <button
                        onClick={() => regenerateBluReply(msg)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-white/8 dark:hover:text-stone-300"
                      >
                        <RotateCcw size={13} />
                      </button>
                      <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover/tip:opacity-100 dark:bg-stone-700">
                        Regenerate
                      </span>
                    </div>
                    </>
                  )}
                </div>
              )}
              {msg.role === "blu" && msg.id === lastBluMessageId && !msg.isTyping && !msg.isStreaming && (!msg.queryTrace || settledReportIds.has(msg.id)) &&
                msg.followUps && msg.followUps.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Follow-ups</p>
                  <div className="mt-0.5 flex flex-col">
                    {msg.followUps.slice(0, 3).map((q, i) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="-mx-1.5 flex items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm text-stone-700 dark:text-stone-200 transition-colors duration-100 hover:bg-stone-100 dark:hover:bg-white/6"
                        style={{ animation: `fade-up 350ms cubic-bezier(0.23,1,0.32,1) ${i * 90}ms both` }}
                      >
                        <FollowUpArrow />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
          </Fragment>
            );
          });
        })()}
        {activeThread?.forkedFrom && (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-stone-500 dark:text-stone-400" style={{ background: "var(--muted)" }}>
              <GitFork size={11} className="shrink-0" />
              Forked from "{activeThread.forkedFrom}"
            </span>
          </div>
        )}
        </div>
        </div>
      </div>

      {/* Pending plan card — docked directly above the composer in fullscreen (which is itself
          position: absolute and anchored to the bottom), so it never overlaps it. */}
      {!historyOpen && pendingPlan && (
        <div
          className={mode === "fullscreen" ? "absolute inset-x-0 z-20" : ""}
          style={
            mode === "fullscreen"
              ? { margin: "0 auto", width: "100%", maxWidth: "48rem", bottom: `${composerHeight + 24}px` }
              : undefined
          }
        >
          <PlanCard
            fullscreen={mode === "fullscreen"}
            content={pendingPlan.content}
            onApprove={() => {
              setPendingPlan(null);
              const ts = Date.now();
              setMessages(c => [...c, { id: `blu-plan-approved-${ts}`, role: "blu", text: "Plan approved. Starting execution now." }]);
            }}
            onSkip={() => {
              setPendingPlan(null);
              const ts = Date.now();
              setMessages(c => [...c, { id: `blu-plan-skipped-${ts}`, role: "blu", text: "Got it, plan skipped. Let me know how you'd like to proceed." }]);
            }}
          />
        </div>
      )}

      {/* Input */}
      <div
        ref={mentionRef}
        className={mode === "fullscreen" ? "absolute inset-x-0 px-3 z-30" : "relative px-3 pb-3 shrink-0"}
        style={{
          ...(mode === "fullscreen"
            ? {
                margin: "0 auto",
                width: "100%",
                maxWidth: isLanding ? "56rem" : "48rem",
                top: isLanding ? "50%" : "100%",
                transform: isLanding ? "translateY(-50%)" : "translateY(calc(-100% - 12px))",
                transition: "top 500ms cubic-bezier(0.23,1,0.32,1), transform 500ms cubic-bezier(0.23,1,0.32,1), max-width 500ms cubic-bezier(0.23,1,0.32,1)",
              }
            : {}),
          opacity: pendingPlan ? 0.4 : 1,
          pointerEvents: pendingPlan ? "none" : undefined,
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            const withinSize = files.filter((file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES);
            if (withinSize.length < files.length) setComposerNotice("File size exceeds limit");
            const room = Math.max(MAX_ATTACHMENTS - filePreviews.length, 0);
            const accepted = withinSize.slice(0, room);
            if (withinSize.length > accepted.length) setComposerNotice("Max 7 files attached. Remove one to add another");
            accepted.forEach((file) => {
              const kind = classifyFileKind(file);
              const id = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
              const url = URL.createObjectURL(file);
              setFilePreviews((prev) => [...prev, { id, url, name: file.name, kind, uploading: true }]);
              setTimeout(() => {
                setFilePreviews((prev) => prev.map((p) => (p.id === id ? { ...p, uploading: false } : p)));
              }, 3000);
            });
            e.target.value = "";
          }}
        />

        {/* + attach picker — floats above input */}
        {plusPickerOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <button
              onClick={openFilePicker}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-white/5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-white/8 text-stone-500 dark:text-stone-400">
                <Paperclip size={14} />
              </span>
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Attach files</p>
                <p className="text-xs text-stone-400 dark:text-stone-500">Upload from your device · Press Enter to open</p>
              </div>
            </button>
          </div>
        )}

        {/* Slash / recipe picker — floats above input */}
        {slashOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ background: "rgb(239,246,255)", color: "rgb(37,99,235)" }}
              >
                <ChefHat size={11} strokeWidth={2.5} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Recipes</p>
            </div>
            <div className="pb-2 max-h-64 overflow-y-auto">
              {(() => {
                const filtered = slashQuery
                  ? SLASH_RECIPES.filter(r => r.label.toLowerCase().includes(slashQuery))
                  : null;

                if (filtered) {
                  return filtered.length === 0
                    ? <p className="px-4 py-3 text-sm text-stone-400 dark:text-stone-500">No recipes match "{slashQuery}"</p>
                    : filtered.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />);
                }

                if (suggestedRecipes.length === 0) {
                  return SLASH_RECIPES.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />);
                }

                return (
                  <>
                    <p className="px-3.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Suggested for this page</p>
                    {suggestedRecipes.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />)}
                    {otherRecipes.length > 0 && (
                      <>
                        <div className="mx-3.5 my-1.5 border-t border-stone-100 dark:border-(--border)" />
                        <p className="px-3.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">All recipes</p>
                        {otherRecipes.map(recipe => <RecipeRow key={recipe.key} recipe={recipe} onSelect={selectRecipe} />)}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Mention picker — floats above input */}
        {mentionOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 z-30 rounded-xl overflow-hidden animate-card-in"
            style={{
              background: "var(--content-bg)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07)",
            }}
          >
            {mentionCategory ? (
              /* Level 2 — items */
              <>
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <button
                    onClick={() => { setMentionCategory(null); setMentionItemQuery(""); }}
                    className="flex items-center gap-1 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                  >
                    <ChevronLeft size={13} />
                    Back
                  </button>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200">
                    <span className="text-stone-500 dark:text-stone-400">{getMentionIcon(mentionCategory, 12)}</span>
                    {MENTION_CATEGORIES.find((c) => c.key === mentionCategory)?.label}
                  </span>
                </div>
                <div className="px-3 pt-2.5 pb-2">
                  <div className="relative">
                    <Search size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      ref={mentionSearchRef}
                      value={mentionItemQuery}
                      onChange={(e) => setMentionItemQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Escape" && setMentionOpen(false)}
                      placeholder="Search..."
                      className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-xs font-medium text-stone-800 outline-none placeholder:text-stone-400 focus:border-blue-400 dark:border-(--border) dark:bg-white/4 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto pb-2">
                  {(MENTION_ITEMS[mentionCategory] ?? [])
                    .filter((item) => !mentionItemQuery || item.toLowerCase().includes(mentionItemQuery.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item}
                        onClick={() => selectMentionItem(item)}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-stone-400 dark:text-stone-500">
                          {getMentionIcon(mentionCategory, 13)}
                        </span>
                        {item}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              /* Level 1 — categories */
              <>
                <div className="pb-2 pt-2">
                  {MENTION_CATEGORIES.filter((c) =>
                    !mentionQuery || c.label.toLowerCase().includes(mentionQuery)
                  ).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-500 dark:bg-white/8 dark:text-stone-400">
                        {getMentionIcon(cat.key, 13)}
                      </span>
                      {cat.label}
                      <ChevronRight size={12} className="ml-auto text-stone-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((item) => (
              <span
                key={item.category}
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 py-1 pl-2 pr-1.5 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
              >
                <span className="flex h-3 w-3 shrink-0 items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: getReferenceIconPaths(item.category) }} />
                </span>
                {item.title}
                <button
                  onClick={() => removeAttachment(item.category)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {chatSettingsOpen ? (
          <div
            className="flex flex-col rounded-t-xl px-3.5 py-3"
            style={{
              background: "var(--content-bg)",
              borderTop: "2px solid var(--border)",
              borderLeft: "2px solid var(--border)",
              borderRight: "2px solid var(--border)",
              animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Chat Settings</span>
              <button
                type="button"
                onClick={() => setChatSettingsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
              >
                <X size={13} />
              </button>
            </div>
            <div className="space-y-4 pb-1">
              {[
                { title: "Response depth", options: RESPONSE_DEPTH_OPTIONS, value: responseDepth, set: setResponseDepth },
                { title: "Model tier", options: MODEL_TIER_OPTIONS, value: modelTier, set: setModelTier },
                { title: "Knowledge scope", options: KNOWLEDGE_SCOPE_OPTIONS, value: contextScope, set: (v: string) => setContextScope(v as "Project" | "Thread") },
              ].map((group) => (
                <div key={group.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((option) => {
                      const isActive = group.value === option;
                      return (
                        <button
                          key={option}
                          onClick={() => group.set(option)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/6"
                          }`}
                          style={isActive ? { background: "#0080FF" } : undefined}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : referencesOpen || selectedReference ? (
          <div
            className="flex flex-col overflow-hidden rounded-t-xl"
            style={{
              maxHeight: 280,
              background: "var(--content-bg)",
              borderTop: "2px solid var(--border)",
              borderLeft: "2px solid var(--border)",
              borderRight: "2px solid var(--border)",
              animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            <div className="flex shrink-0 items-center justify-between px-3.5 py-2.5">
              {selectedReference ? (
                <button
                  type="button"
                  onClick={() => { setSelectedReference(null); setReferencesOpen(true); }}
                  className="flex items-center gap-1.5 text-xs font-medium text-stone-500 transition-colors hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  <ChevronLeft size={13} />
                  Back to References
                </button>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">References</span>
              )}
              <button
                type="button"
                onClick={() => { setReferencesOpen(false); setSelectedReference(null); }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
              >
                <X size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedReference ? (
                selectedReference === "Image settings" ? (
                  <div className="space-y-4 px-3.5 py-3">
                    {[
                      { title: "Aspect ratio", key: "aspect" as const, options: IMAGE_ASPECT_OPTIONS },
                      { title: "Background", key: "background" as const, options: IMAGE_BACKGROUND_OPTIONS },
                      { title: "Style", key: "style" as const, options: IMAGE_STYLE_OPTIONS },
                    ].map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                          {group.title}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.options.map((option) => {
                            const isActive = imageSettings[group.key] === option;
                            return (
                              <button
                                key={option}
                                onClick={() => updateImageSetting(group.key, option)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                  isActive
                                    ? "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300"
                                    : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50 dark:border-(--border) dark:bg-white/3 dark:text-stone-400 dark:hover:bg-white/6"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col px-3.5 py-3">
                    <div className="relative mb-2">
                      <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                      <input
                        type="search"
                        value={referenceListSearch}
                        onChange={(e) => setReferenceListSearch(e.target.value)}
                        placeholder={`Search ${selectedReference.toLowerCase()}...`}
                        className="h-8 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:border-(--border) dark:bg-white/3 dark:text-stone-100 dark:placeholder:text-stone-500"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {(REFERENCE_LIST_ITEMS[selectedReference] ?? [])
                        .filter((name) => name.toLowerCase().includes(referenceListSearch.toLowerCase()))
                        .map((name) => (
                          <button
                            key={name}
                            onClick={() => addAttachment(name)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-white/6"
                          >
                            {name}
                          </button>
                        ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="py-1">
                  {REFERENCE_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { setSelectedReference(item.label); setReferenceListSearch(""); }}
                      className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-white/5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-stone-500 dark:text-stone-400">
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : composerNotice ? (
          <div
            className="flex items-start gap-2 rounded-t-xl px-3 py-2.5"
            style={{
              background: "rgba(239,68,68,0.1)",
              borderTop: "2px solid var(--border)",
              borderLeft: "2px solid var(--border)",
              borderRight: "2px solid var(--border)",
              animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            <span className="min-w-0 flex-1 text-xs font-medium text-red-600 dark:text-red-400">
              {composerNotice}
            </span>
            <button
              type="button"
              onClick={() => setComposerNotice(null)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-700 dark:hover:bg-red-500/15 dark:hover:text-red-300"
            >
              <X size={12} />
            </button>
          </div>
        ) : upgradeStripVisible ? (
          <div
            className="flex items-center gap-2.5 rounded-t-xl px-3 py-2.5"
            style={{
              background: "rgba(0,128,255,0.1)",
              borderTop: "2px solid var(--border)",
              borderLeft: "2px solid var(--border)",
              borderRight: "2px solid var(--border)",
              animation: "fade-up 350ms cubic-bezier(0.23,1,0.32,1) both",
            }}
          >
            <span className="min-w-0 flex-1 text-xs font-medium leading-none text-blue-700 dark:text-blue-300">
              {mode === "fullscreen"
                ? "You're on a limited plan. Upgrade to keep using Blu."
                : "Upgrade to keep using Blu."}
            </span>
            <button
              type="button"
              onClick={() => { setUpgradeStripVisible(false); navigate("/settings/billing"); }}
              className="flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold leading-none text-white transition-opacity hover:opacity-90"
              style={{ background: "#0080FF" }}
            >
              Upgrade now
            </button>
            <button
              type="button"
              onClick={() => setUpgradeStripVisible(false)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-500/10 hover:text-blue-700 dark:hover:bg-blue-500/15 dark:hover:text-blue-300"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <NotificationStrip
            visible={hasUnreadThreads && !notificationStripDismissed}
            onOpen={() => { setThreadSwitcherOpen(true); setNotificationStripDismissed(true); }}
            onDismiss={() => setNotificationStripDismissed(true)}
          />
        )}

              <div
                className={`px-4 pt-4 pb-4 ${topStripVisible ? "rounded-b-xl" : "rounded-xl"}`}
                style={{
                  borderLeft: "2px solid var(--border)",
                  borderRight: "2px solid var(--border)",
                  borderBottom: "2px solid var(--border)",
                  borderTop: topStripVisible ? "none" : "2px solid var(--border)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                  background: mode === "fullscreen" ? "var(--content-bg)" : undefined,
                  opacity: inputLocked ? 0.45 : 1,
                  pointerEvents: inputLocked ? "none" : undefined,
                  transition: "opacity 0.25s ease",
                }}
              >
          {queue.length > 0 && (
            <div className="mb-2 flex flex-col gap-1.5">
              <DndContext sensors={queueSensors} collisionDetection={closestCenter} onDragEnd={handleQueueDragEnd}>
                <SortableContext items={queue.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                  {queue.map((item) => (
                    <QueueItemRow
                      key={item.id}
                      item={item}
                      isEditing={editingQueueId === item.id}
                      editingText={editingQueueText}
                      onStartEdit={() => { setEditingQueueId(item.id); setEditingQueueText(item.text); }}
                      onEditChange={setEditingQueueText}
                      onSave={() => saveQueueEdit(item.id)}
                      onCancelEdit={() => setEditingQueueId(null)}
                      onDelete={() => removeQueueItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
          {filePreviews.length > 0 && (
            <div className={`mb-2 gap-2 ${mode === "fullscreen" ? "flex flex-nowrap overflow-x-auto" : "grid grid-cols-3"}`}>
              {filePreviews.map((f) => (
                <div
                  key={f.id}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
                  style={{ border: "1px solid var(--border)" }}
                >
                  {f.kind === "image" ? (
                    <button
                      type="button"
                      onClick={() => setLightboxUrl(f.url)}
                      className="block h-full w-full"
                    >
                      <img
                        src={f.url}
                        alt=""
                        className="h-full w-full object-cover transition-[filter] duration-500 ease-out"
                        style={{ filter: f.uploading ? "blur(6px)" : "blur(0px)" }}
                      />
                    </button>
                  ) : (
                    <div
                      className="h-full w-full transition-[filter] duration-500 ease-out"
                      style={{ background: "var(--muted)", filter: f.uploading ? "blur(6px)" : "blur(0px)" }}
                    >
                      <FileKindName name={f.name} />
                    </div>
                  )}
                  <FileKindBadge kind={f.kind} />
                  {f.uploading && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFilePreview(f.id); }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            {editorEmpty && (() => {
              const ph = PLACEHOLDERS[placeholderIdx];
              return (
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-0 left-0 select-none pr-7 text-sm text-stone-400 dark:text-stone-500 transition-opacity duration-300 ${placeholderVisible ? "opacity-100" : "opacity-0"}`}
                >
                  {ph.text}
                </span>
              );
            })()}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setMentionOpen(false); setMentionCategory(null); setSlashOpen(false); setPlusPickerOpen(false); return; }
                if (e.key === "Enter" && plusPickerOpen) { e.preventDefault(); openFilePicker(); return; }
                if (e.key === "Enter" && mentionOpen && !mentionCategory) {
                  const filtered = MENTION_CATEGORIES.filter((c) => !mentionQuery || c.label.toLowerCase().includes(mentionQuery));
                  if (filtered.length === 1) { e.preventDefault(); selectCategory(filtered[0].key); return; }
                }
                if (e.key === "Enter" && !e.shiftKey && !mentionOpen) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="w-full min-h-5 max-h-32 overflow-y-auto bg-transparent pr-7 text-sm text-stone-700 dark:text-stone-200 outline-none leading-relaxed"
            />
            <button
              type="button"
              aria-label="Voice input"
              className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/8 dark:hover:text-stone-300"
              style={{ opacity: editorEmpty ? 1 : 0, pointerEvents: editorEmpty ? "auto" : "none", transition: "opacity 200ms ease, background-color 150ms ease, color 150ms ease" }}
            >
              <Mic size={14} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-4">
            {/* + with dropup */}
            <div ref={plusRef} className="relative">
              <button
                onClick={() => {
                  setPlusOpen((open) => {
                    if (open) {
                      setReferencesOpen(false);
                      setSelectedReference(null);
                      setChatSettingsOpen(false);
                    }
                    return !open;
                  });
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  plusOpen
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-white/8 dark:hover:text-stone-200"
                }`}
              >
                <Plus size={15} />
              </button>

              {plusOpen && (
                <div
                  className="absolute bottom-[calc(100%+8px)] left-0 z-20 w-56 rounded-xl overflow-hidden animate-card-in transition-all duration-200"
                  style={{
                    background: "var(--content-bg)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  {PLUS_ITEMS.map((item, i) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setPlusOpen(false);
                        if (item.label === "References") {
                          setReferencesOpen(true);
                          return;
                        }
                        if (item.label === "Chat Settings") {
                          setChatSettingsOpen(true);
                          return;
                        }
                        if (item.label === "Attach Files") openFilePicker();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-white/5 transition-colors
                        ${i > 0 ? "border-t" : ""}`}
                      style={i > 0 ? { borderColor: "var(--border)" } : undefined}
                    >
                      <span className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-white/6 flex items-center justify-center shrink-0">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700 dark:text-stone-200 leading-none mb-0.5">{item.label}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 leading-none">{item.desc}</p>
                      </div>
                      {item.arrow && <ChevronRight size={12} className="text-stone-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setContextScope((s) => (s === "Project" ? "Thread" : "Project"))}
                className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-colors"
                style={{ background: "var(--raised)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
              >
                <Brain size={12} />
                {contextScope}
              </button>
              <button
                type="button"
                onClick={() => setPlanMode((mode) => !mode)}
                className={`inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors ${
                  planMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                }`}
              >
                Plan
              </button>
              <button
                type="button"
                onClick={() => setWebMode((mode) => !mode)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-colors ${
                  webMode
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                }`}
              >
                <Globe size={12} />
                Web
              </button>
              <button
                onClick={() => (activeReportId ? stopActiveReport() : sendMessage())}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150"
                style={{ background: activeReportId || !editorEmpty || attachments.length || filePreviews.length ? "#0080FF" : "var(--border)" }}
              >
                {activeReportId ? (
                  <Square size={11} fill="white" className="text-white" />
                ) : (
                  <ArrowUp size={13} className={!editorEmpty || attachments.length || filePreviews.length ? "text-white" : "text-stone-400 dark:text-stone-500"} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      </div>}

      {/* Bad response feedback modal */}
      {badResponseModalId && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          onClick={() => setBadResponseModalId(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-5 animate-card-in"
            style={{ background: "var(--content-bg)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setBadResponseModalId(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:bg-white/10 dark:hover:text-stone-100"
            >
              <X size={14} />
            </button>
            <p className="pr-8 text-base font-semibold text-stone-900 dark:text-stone-100">What went wrong?</p>
            <p className="mt-1 pr-8 text-xs text-stone-400 dark:text-stone-500">Pick what didn't work (optional) and add any detail.</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Inaccurate", "Tone", "Length"].map((tag) => {
                const active = badResponseTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setBadResponseTags((current) =>
                        active ? current.filter((t) => t !== tag) : [...current, tag]
                      )
                    }
                    className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                      active
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-white/6 dark:text-stone-400 dark:hover:bg-white/10"
                    }`}
                    style={active ? { border: "1px solid rgba(0,128,255,0.3)" } : { border: "1px solid var(--border)" }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="relative mt-3">
              <textarea
                value={badResponseDetail}
                onChange={(e) => setBadResponseDetail(e.target.value.slice(0, 250))}
                maxLength={250}
                rows={4}
                placeholder="Add more detail (optional)"
                className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-stone-100"
                style={{ borderColor: "var(--border)", background: "var(--input)" }}
              />
              <span className="pointer-events-none absolute bottom-2 right-2.5 text-[11px] tabular-nums text-stone-400 dark:text-stone-500">
                {badResponseDetail.length}/250
              </span>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBadResponseModalId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/8"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setBadResponseModalId(null)}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#0080FF" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Journey preview overlay */}
      {journeyPreviewName && (
        <JourneyPreviewOverlay
          name={journeyPreviewName}
          onClose={() => setJourneyPreviewName(null)}
        />
      )}

      {/* Image lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm" onClick={() => setLightboxUrl(null)}>
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div className="relative h-full max-h-[86vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxUrl} alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
