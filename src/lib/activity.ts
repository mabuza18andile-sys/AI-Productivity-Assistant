import { useSyncExternalStore } from "react";

export type ActivityType = "email" | "meeting" | "planner" | "research" | "chat";
export type Activity = { id: string; type: ActivityType; title: string; createdAt: number };

const KEY = "worksmart.activity.v1";
const listeners = new Set<() => void>();
let cache: Activity[] | null = null;
const EMPTY: Activity[] = [];

function read(): Activity[] {
  if (typeof window === "undefined") return EMPTY;
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(list: Activity[]) {
  cache = list;
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

export function logActivity(type: ActivityType, title: string) {
  const entry = { id: crypto.randomUUID(), type, title: title.slice(0, 120), createdAt: Date.now() };
  write([entry, ...read()].slice(0, 200));
}

export function clearActivity() {
  write([]);
}

export function useActivity() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => EMPTY,
  );
}
