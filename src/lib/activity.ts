export type ActivityKind = "email" | "meeting" | "task" | "research";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  preview: string;
  createdAt: number;
}

const KEY = "flowmind:activity";
const MAX = 25;

export function getActivity(): ActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addActivity(item: Omit<ActivityItem, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const list = getActivity();
  list.unshift({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event("flowmind:activity"));
}

export function counts(): Record<ActivityKind, number> {
  const list = getActivity();
  const c: Record<ActivityKind, number> = { email: 0, meeting: 0, task: 0, research: 0 };
  list.forEach((i) => (c[i.kind] += 1));
  return c;
}

export interface Settings {
  name: string;
  defaultTone: string;
  responseLength: "Concise" | "Balanced" | "Detailed";
  theme: "dark" | "light";
}

const SETTINGS_KEY = "flowmind:settings";

export function getSettings(): Settings {
  if (typeof window === "undefined")
    return { name: "", defaultTone: "Friendly", responseLength: "Balanced", theme: "dark" };
  try {
    return {
      name: "",
      defaultTone: "Friendly",
      responseLength: "Balanced",
      theme: "dark",
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}"),
    };
  } catch {
    return { name: "", defaultTone: "Friendly", responseLength: "Balanced", theme: "dark" };
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("flowmind:settings"));
}
