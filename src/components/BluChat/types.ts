import type { ReactNode } from "react";

export type MentionChip = {
  id: string;
  categoryKey: string;
  label: string;
};

export type QueueItem = {
  id: string;
  text: string;
};

export type HistoryItem = { id: string; title: string; preview: string; time: string };

export type ReferenceAttachment = {
  category: string;
  title: string;
  subtitle: string;
  bg: string;
};

export type RecipeChip = { key: string; label: string };
export type RunTask = { id: string; label: string; detail: string; icon: "avatar" | "pose" | "scene" };

export type ChatMessage = {
  id: string;
  role: "user" | "blu";
  text: string;
  attachments?: ReferenceAttachment[];
  images?: { id: string; url: string }[];
  mentions?: MentionChip[];
  recipes?: RecipeChip[];
  feedbackForm?: boolean;
  isTyping?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  isPlan?: boolean;
  planContent?: string;
  journeyChip?: { name: string };
  execChecklist?: { steps: string[] };
  runTasks?: RunTask[];
  liveRun?: boolean;
  queryTrace?: boolean;
  declined?: boolean;
  extraEvent?: boolean;
  noEmbed?: boolean;
  followUps?: string[];
};

export type SlashRecipe = { key: string; icon: ReactNode; label: string; desc: string };

export type Placeholder = { text: string };

export type BluMode = "panel" | "float" | "fullscreen";
