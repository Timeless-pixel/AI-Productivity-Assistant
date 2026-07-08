// Client-side localStorage helpers. All reads must be guarded by typeof window.
import type { UIMessage } from "ai";

const KEYS = {
  threads: "workwise:threads",
  stats: "workwise:stats",
  profile: "workwise:profile",
  settings: "workwise:settings",
  activity: "workwise:activity",
  streak: "workwise:streak",
  workspace: "workwise:workspace",
  favTemplates: "workwise:fav-templates",
  notifications: "workwise:notifications",
  cmdHistory: "workwise:cmd-history",
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
  theme: "light" | "dark" | "dynamic";
  notifications: boolean;
  aiStyle: "concise" | "balanced" | "detailed";
  language: string;
};

const defaultSettings: Settings = {
  theme: "dynamic",
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
  try {
    touchStreak();
  } catch {
    // ignore
  }
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
  const iconByKind: Record<ActivityKind, string> = {
    email: "📧",
    research: "📚",
    meeting: "📝",
    tasks: "✅",
    chat: "🤖",
  };
  const titleByKind: Record<ActivityKind, string> = {
    email: "Email generated successfully.",
    research: "Research report ready.",
    meeting: "Meeting summary completed.",
    tasks: "Task plan generated.",
    chat: "New Nova conversation.",
  };
  pushNotification({
    kind: entry.kind,
    icon: iconByKind[entry.kind],
    title: titleByKind[entry.kind],
    body: entry.title,
  });
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

/* ---- Streak ---- */
export type Streak = {
  current: number;
  best: number;
  lastDay: string; // YYYY-MM-DD
};
const defaultStreak: Streak = { current: 0, best: 0, lastDay: "" };

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getStreak(): Streak {
  return { ...defaultStreak, ...read<Streak>(KEYS.streak, defaultStreak) };
}
export function touchStreak(): { streak: Streak; leveledUp: boolean } {
  const s = getStreak();
  const t = today();
  const y = yesterday();
  let leveledUp = false;
  const prev = s.current;
  if (s.lastDay === t) {
    // already counted today
  } else if (s.lastDay === y) {
    s.current += 1;
    s.lastDay = t;
  } else {
    s.current = 1;
    s.lastDay = t;
  }
  s.best = Math.max(s.best, s.current);
  const milestones = [3, 7, 30, 100];
  if (milestones.includes(s.current) && s.current !== prev) leveledUp = true;
  write(KEYS.streak, s);
  return { streak: s, leveledUp };
}
export function streakBadge(n: number): { icon: string; label: string } {
  if (n >= 100) return { icon: "🏆", label: "Productivity Master" };
  if (n >= 30) return { icon: "🥇", label: "30-Day Gold" };
  if (n >= 7) return { icon: "🥈", label: "Weekly Silver" };
  if (n >= 3) return { icon: "🥉", label: "3-Day Bronze" };
  return { icon: "✨", label: "Getting started" };
}
export function streakMessage(n: number): string {
  if (n === 0) return "Start your streak by using any AI action today.";
  if (n < 3) return "Great start! Keep your streak alive tomorrow.";
  if (n < 7) return `One more day to reach a weekly streak — you're on ${n} days.`;
  if (n < 30) return `You're building productive habits — ${n} days strong!`;
  if (n < 100) return `Incredible discipline — ${n} days in a row!`;
  return "You are a WorkWise AI Productivity Master. 🏆";
}

/* ---- Workspace ---- */
export type WorkspaceDoc = {
  id: string;
  title: string;
  content: string;
  source: ActivityKind;
  folder: string;
  tags: string[];
  favorite: boolean;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};
export function getWorkspace(): WorkspaceDoc[] {
  return read<WorkspaceDoc[]>(KEYS.workspace, []);
}
export function saveWorkspace(list: WorkspaceDoc[]) {
  write(KEYS.workspace, list);
}
export function addWorkspaceDoc(
  doc: Omit<WorkspaceDoc, "id" | "createdAt" | "updatedAt" | "folder" | "tags" | "favorite" | "pinned"> &
    Partial<Pick<WorkspaceDoc, "folder" | "tags" | "favorite" | "pinned">>,
): WorkspaceDoc {
  const now = Date.now();
  const full: WorkspaceDoc = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    folder: doc.folder ?? "Inbox",
    tags: doc.tags ?? [],
    favorite: doc.favorite ?? false,
    pinned: doc.pinned ?? false,
    ...doc,
  };
  const list = getWorkspace();
  list.unshift(full);
  saveWorkspace(list);
  return full;
}
export function updateWorkspaceDoc(id: string, patch: Partial<WorkspaceDoc>) {
  saveWorkspace(
    getWorkspace().map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)),
  );
}
export function deleteWorkspaceDoc(id: string) {
  saveWorkspace(getWorkspace().filter((d) => d.id !== id));
}

/* ---- Favorite templates ---- */
export function getFavoriteTemplates(): string[] {
  return read<string[]>(KEYS.favTemplates, []);
}
export function toggleFavoriteTemplate(id: string) {
  const list = new Set(getFavoriteTemplates());
  if (list.has(id)) list.delete(id);
  else list.add(id);
  write(KEYS.favTemplates, [...list]);
}

/* ---- Tips ---- */
export const AI_TIPS = [
  "Be specific in your prompts for better AI responses.",
  "Always verify AI-generated information before making important business decisions.",
  "Break complex tasks into smaller prompts for more accurate results.",
  "AI works best as an assistant — not a replacement for human judgment.",
  "Avoid sharing confidential company information with AI systems.",
  "Give the AI context: audience, tone, and desired length.",
  "Iterate: ask Nova to refine, shorten, or reframe the output.",
  "Use templates to start faster and keep quality consistent.",
];

/* ---- Dynamic theme ---- */
export function effectiveTheme(mode: Settings["theme"]): "light" | "dark" | "sunrise" | "sunset" {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "sunrise" : "sunset";
}