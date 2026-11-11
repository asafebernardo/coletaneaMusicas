import { useSyncExternalStore } from "react";

export const THEME_KEY = "coletanea-theme";
export const ACCENT_KEY = "coletanea-accent";

export const ACCENT_OPTIONS = [
  { id: "verde", label: "Verde", swatch: "#1e4d3a" },
  { id: "amarelo", label: "Amarelo", swatch: "#a16a12" },
  { id: "azul", label: "Azul", swatch: "#1e4476" },
  { id: "laranja", label: "Laranja", swatch: "#b04a1c" },
  { id: "roxo", label: "Roxo", swatch: "#5e357e" },
  { id: "rosa", label: "Rosa", swatch: "#9c2f5d" },
  { id: "cinza", label: "Cinza", swatch: "#44505e" },
];

const VALID_ACCENTS = new Set(ACCENT_OPTIONS.map((item) => item.id));

const THEME_COLOR = {
  light: "#f3efe6",
  dark: "#000000",
};

let current = "light";
let currentAccent = "verde";
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

function readStoredAccent() {
  try {
    const stored = localStorage.getItem(ACCENT_KEY);
    if (VALID_ACCENTS.has(stored)) return stored;
  } catch {
    /* ignore */
  }
  const datasetAccent = document.documentElement.dataset.accent;
  return VALID_ACCENTS.has(datasetAccent) ? datasetAccent : "verde";
}

export function getTheme() {
  return current;
}

export function getAccent() {
  return currentAccent;
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

export function setAccent(next) {
  if (!VALID_ACCENTS.has(next)) return;
  currentAccent = next;
  document.documentElement.dataset.accent = next;
  try {
    localStorage.setItem(ACCENT_KEY, next);
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function initTheme() {
  if (typeof document === "undefined") return;
  setTheme(readStored());
  setAccent(readStoredAccent());
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "light");
}

export function useAccent() {
  return useSyncExternalStore(subscribeTheme, getAccent, () => "verde");
}
