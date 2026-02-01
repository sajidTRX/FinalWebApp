/**
 * Persist and read the last-used writing mode (note, novel, journal).
 * Used so "Start Writing" on the landing page can open a new document in that mode.
 */

export const LAST_USED_MODE_KEY = "tagore_last_used_mode";

export type WritingMode = "note" | "novel" | "journal";

export function getLastUsedMode(): WritingMode {
  if (typeof window === "undefined") return "note";
  const stored = localStorage.getItem(LAST_USED_MODE_KEY);
  if (stored === "note" || stored === "novel" || stored === "journal") return stored;
  return "note";
}

export function setLastUsedMode(mode: WritingMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_USED_MODE_KEY, mode);
}
