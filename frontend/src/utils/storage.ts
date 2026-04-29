import type { HistoryEntry } from "../types";

const STORAGE_KEY = "ai-code-reviewer-history";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  entry: Omit<HistoryEntry, "id" | "timestamp">
): HistoryEntry {
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const existing = getHistory();
  const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full — drop oldest entries
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 20)));
  }
  return newEntry;
}

export function removeFromHistory(id: string): void {
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
