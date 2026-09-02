import { Route, Shuffle, UserCircle, Clapperboard, PersonStanding, PenTool, Package, Activity } from "lucide-react";
import type { ReactNode } from "react";

export function getMentionIcon(key: string, size = 13): ReactNode {
  switch (key) {
    case "journeys": return <Route size={size} />;
    case "experiences": return <Shuffle size={size} />;
    case "avatars": return <UserCircle size={size} />;
    case "scenes": return <Clapperboard size={size} />;
    case "poses": return <PersonStanding size={size} />;
    case "design-system": return <PenTool size={size} />;
    case "catalog": return <Package size={size} />;
    case "events": return <Activity size={size} />;
    default: return null;
  }
}

export function getCategoryIconPaths(key: string): string {
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

export function createMentionChipEl(categoryKey: string, label: string): HTMLSpanElement {
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

export function getReferenceIconPaths(label: string): string {
  switch (label) {
    case "Assets": return '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>';
    case "Attributes": return '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>';
    case "Users": return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
    case "Events": return '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>';
    case "Avatars": return '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>';
    case "Scenes": return '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1-.3 2.1.3 2.4 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 3.8"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>';
    case "Poses": return '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>';
    case "Design System": return '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>';
    case "Catalog": return '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
    case "Feeds": return '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>';
    case "Journeys": return '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>';
    case "Experiences": return '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="m18 22 4-4-4-4"/>';
    case "Out of the box": return '<path d="M12 22v-9"/><path d="M3.17 8 12 13l8.83-5"/><path d="M3 13.5v5.37a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V13.5"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v1l9 5 9-5Z"/>';
    case "Boards": return '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>';
    default: return "";
  }
}

export function createReferenceChipEl(category: string, name: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.className = "reference-chip";
  span.dataset.reference = "true";
  span.dataset.category = category;
  span.dataset.refName = name;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "12"); svg.setAttribute("height", "12");
  svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = getReferenceIconPaths(category);
  const lbl = document.createElement("span");
  lbl.textContent = name;
  span.appendChild(svg);
  span.appendChild(lbl);
  return span;
}

export function FollowUpArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-stone-400 dark:text-stone-500">
      <path d="M9 10l-5 5 5 5" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}
