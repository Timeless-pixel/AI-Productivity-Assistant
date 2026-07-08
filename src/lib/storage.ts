// Client-side localStorage helpers. All reads must be guarded by typeof window.
import type { UIMessage } from "ai";

const KEYS = {
  threads: "workwise:threads",
  stats: "workwise:stats",
  profile: "workwise:profile",
  settings: "workwise:settings",
  activity: "workwise:activity",
} as const;

export type ActivityKind =
  | "email"
  | "research"
  | "meeting"
  | "tasks"
  | "chat";

export type ActivityEntry = {
  id: string;
  kind: ActivityKind;
  title: string;
  createdAt: number;
};

export type Stats = Record<ActivityKind, number>;

const emptyStats: Stats = {
  email: 0,
  research: 0,
  meeting: 0,
  tasks: 0,
  chat: 0,
};

export type Profile = {
  name: string;
  jobTitle: string;
  avatar: string; // data URL or empty
};

const defaultProfile: Profile = {
  name: "You",
  jobTitle: "Workplace Professional",
  avatar: "",
};

export type Settings = {
  theme: "light" | "dark";
  notifications: boolean;
  aiStyle: "concise" | "balanced" | "detailed";
  language: string;
};

const defaultSettings: Settings = {
  theme: "light",
  notifications: true,
  aiStyle: "balanced",
  language: "English",
};

export type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("workwise:update", { detail: { key } }));
  } catch {
    // ignore
  }
}

/* ---- Stats ---- */
export function getStats(): Stats {
  return { ...emptyStats, ...read<Stats>(KEYS.stats, emptyStats) };
}
export function bumpStat(kind: ActivityKind) {
  const s = getStats();
  s[kind] = (s[kind] ?? 0) + 1;
  write(KEYS.stats, s);
}

/* ---- Activity feed ---- */
export function getActivity(): ActivityEntry[] {
  return read<ActivityEntry[]>(KEYS.activity, []);
}
export function pushActivity(entry: Omit<ActivityEntry, "id" | "createdAt">) {
  const list = getActivity();
  const next: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  list.unshift(next);
  write(KEYS.activity, list.slice(0, 30));
}

/* ---- Profile ---- */
export function getProfile(): Profile {
  return { ...defaultProfile, ...read<Profile>(KEYS.profile, defaultProfile) };
}
export function setProfile(p: Profile) {
  write(KEYS.profile, p);
}

/* ---- Settings ---- */
export function getSettings(): Settings {
  return { ...defaultSettings, ...read<Settings>(KEYS.settings, defaultSettings) };
}
export function setSettings(s: Settings) {
  write(KEYS.settings, s);
}

/* ---- Threads ---- */
export function getThreads(): Thread[] {
  return read<Thread[]>(KEYS.threads, []);
}
export function saveThreads(threads: Thread[]) {
  write(KEYS.threads, threads);
}
export function upsertThread(thread: Thread) {
  const list = getThreads().filter((t) => t.id !== thread.id);
  list.unshift(thread);
  saveThreads(list);
}
export function deleteThread(id: string) {
  saveThreads(getThreads().filter((t) => t.id !== id));
}
export function getThread(id: string): Thread | undefined {
  return getThreads().find((t) => t.id === id);
}

/* ---- Productivity score ---- */
export function productivityScore(stats: Stats): number {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return Math.min(100, Math.round(20 + total * 4));
}