export type BoardType = "retention" | "dashboard" | "insights" | "funnel";

export type BoardEntry = {
  id: string;
  title: string;
  type: BoardType;
  lastUpdated: string;
  createdBy: { initials: string; color: string; name: string };
};

export const BOARDS_DATA: BoardEntry[] = [
  { id: "r1", title: "Untitled report-330",         type: "retention",  lastUpdated: "Jun 4, 2026 03:52 PM",  createdBy: { initials: "YB", color: "#8B5CF6", name: "Yaroslav Bezr..." } },
  { id: "r2", title: "Central Marketing Dashboard", type: "dashboard",  lastUpdated: "May 27, 2026 01:30 PM", createdBy: { initials: "SN", color: "#0D9488", name: "Somya Nayak" } },
  { id: "r3", title: "Untitled report-719",         type: "insights",   lastUpdated: "May 15, 2026 04:17 PM", createdBy: { initials: "I",  color: "#EF4444", name: "Intempt" } },
  { id: "r4", title: "Untitled report-105",         type: "funnel",     lastUpdated: "May 11, 2026 04:20 PM", createdBy: { initials: "I",  color: "#EF4444", name: "Intempt" } },
  { id: "r5", title: "Traffic from Newsletter",     type: "insights",   lastUpdated: "May 11, 2026 04:19 PM", createdBy: { initials: "SN", color: "#0D9488", name: "Somya Nayak" } },
  { id: "r6", title: "Untitled report-768",         type: "insights",   lastUpdated: "Apr 17, 2026 05:56 PM", createdBy: { initials: "HS", color: "#22C55E", name: "Hardik Sharma" } },
  { id: "r7", title: "Company newsletter",          type: "dashboard",  lastUpdated: "Apr 9, 2026 04:30 PM",  createdBy: { initials: "TB", color: "#F59E0B", name: "Tushar Bansal" } },
  { id: "r8", title: "Untitled report-279",         type: "retention",  lastUpdated: "Apr 8, 2026 03:02 PM",  createdBy: { initials: "HK", color: "#0F766E", name: "Harish Kumar" } },
  { id: "r9", title: "Untitled report-486",         type: "insights",   lastUpdated: "Apr 8, 2026 01:58 PM",  createdBy: { initials: "HK", color: "#0F766E", name: "Harish Kumar" } },
];
