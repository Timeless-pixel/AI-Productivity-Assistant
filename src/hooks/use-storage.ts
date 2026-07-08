import { useEffect, useState } from "react";
import {
  getActivity,
  getProfile,
  getSettings,
  getStats,
  getThreads,
  setProfile as writeProfile,
  setSettings as writeSettings,
  type ActivityEntry,
  type Profile,
  type Settings,
  type Stats,
  type Thread,
} from "@/lib/storage";

function useStore<T>(read: () => T): [T, () => void] {
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    setValue(read());
    const handler = () => setValue(read());
    window.addEventListener("workwise:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("workwise:update", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [value, () => setValue(read())];
}

export function useStats(): Stats {
  return useStore(getStats)[0];
}
export function useActivity(): ActivityEntry[] {
  return useStore(getActivity)[0];
}
export function useThreads(): Thread[] {
  return useStore(getThreads)[0];
}
export function useProfile(): [Profile, (p: Profile) => void] {
  const [value] = useStore(getProfile);
  return [value, (p) => writeProfile(p)];
}
export function useSettings(): [Settings, (s: Settings) => void] {
  const [value] = useStore(getSettings);
  return [value, (s) => writeSettings(s)];
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}