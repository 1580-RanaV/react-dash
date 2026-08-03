import { useState, useEffect } from "react";

export type WidgetSize = "sm" | "md" | "lg";
export type WidgetType = "kpi" | "report" | "design" | "asset" | "journey" | "meeting" | "recipe" | "custom" | "product" | "experience";
export type WidgetSource = "stripe" | "sdk" | "google" | "internal";

export interface PinnedWidget {
  id: string;
  type: WidgetType;
  label: string;
  sublabel?: string;
  size: WidgetSize;
  href?: string;
  source?: WidgetSource;
  meta?: Record<string, unknown>;
}

const KEY = "intempt:pinboard-v1";
const EV  = "intempt:pinboard";

function read(): PinnedWidget[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

function write(items: PinnedWidget[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EV));
}

export function useFavorites() {
  const [pinned, setPinned] = useState<PinnedWidget[]>(read);

  useEffect(() => {
    function sync() { setPinned(read()); }
    window.addEventListener(EV, sync);
    return () => window.removeEventListener(EV, sync);
  }, []);

  function pin(widget: PinnedWidget) {
    const prev = read();
    if (prev.some(w => w.id === widget.id)) return;
    write([...prev, widget]);
  }

  function unpin(id: string) {
    write(read().filter(w => w.id !== id));
  }

  function toggle(widget: PinnedWidget) {
    read().some(w => w.id === widget.id) ? unpin(widget.id) : pin(widget);
  }

  function isPinned(id: string): boolean {
    return pinned.some(w => w.id === id);
  }

  function move(fromId: string, toId: string) {
    if (fromId === toId) return;
    const arr = [...read()];
    const fi = arr.findIndex(w => w.id === fromId);
    const ti = arr.findIndex(w => w.id === toId);
    if (fi < 0 || ti < 0) return;
    arr.splice(ti, 0, arr.splice(fi, 1)[0]);
    write(arr);
  }

  function reorder(ids: string[]) {
    const current = read();
    const map = new Map(current.map(w => [w.id, w]));
    const sorted = ids.map(id => map.get(id)).filter(Boolean) as PinnedWidget[];
    write(sorted);
  }

  return { pinned, pin, unpin, toggle, isPinned, move, reorder };
}
