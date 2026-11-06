import { useSyncExternalStore } from "react";

export const THEME_KEY = "coletanea-theme";

const THEME_COLOR = {
  light: "#f3efe6",
  dark: "#000000",
};

let current = "light";
const listeners = new Set();

function readStored() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getTheme() {
  return current;
}

export function subscribeTheme(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTheme(next) {
  if (next !== "light" && next !== "dark") return;
  current = next;
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);
  listeners.forEach((listener) => listener());
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function initTheme() {
  if (typeof document === "undefined") return;
  setTheme(readStored());
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "light");
}
