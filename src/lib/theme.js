import { useSyncExternalStore } from "react";

export const THEME_KEY = "coletanea-theme";
export const ACCENT_KEY = "coletanea-accent";

export const ACCENT_OPTIONS = [
  {
    id: "verde",
    label: "Verde",
    swatch: "#1e4d3a",
    darkSwatch: "#2e7a5a",
    pine: "30 77 58",
    pineDark: "22 57 43",
    darkPine: "46 122 90",
    darkPineDark: "32 92 68",
  },
  {
    id: "amarelo",
    label: "Amarelo",
    swatch: "#a16a12",
    darkSwatch: "#ca8a04",
    pine: "161 106 18",
    pineDark: "128 83 12",
    darkPine: "202 138 4",
    darkPineDark: "161 106 18",
  },
  {
    id: "azul",
    label: "Azul",
    swatch: "#1e4476",
    darkSwatch: "#3b76c4",
    pine: "30 68 118",
    pineDark: "21 50 89",
    darkPine: "59 118 196",
    darkPineDark: "42 91 158",
  },
  {
    id: "laranja",
    label: "Laranja",
    swatch: "#b04a1c",
    darkSwatch: "#d6622c",
    pine: "176 74 28",
    pineDark: "138 56 19",
    darkPine: "214 98 44",
    darkPineDark: "176 74 28",
  },
  {
    id: "roxo",
    label: "Roxo",
    swatch: "#5e357e",
    darkSwatch: "#8b5cb8",
    pine: "94 53 126",
    pineDark: "71 38 97",
    darkPine: "139 92 184",
    darkPineDark: "110 68 150",
  },
  {
    id: "rosa",
    label: "Rosa",
    swatch: "#9c2f5d",
    darkSwatch: "#c64b80",
    pine: "156 47 93",
    pineDark: "120 34 71",
    darkPine: "198 75 128",
    darkPineDark: "163 54 101",
  },
  {
    id: "cinza",
    label: "Cinza",
    swatch: "#44505e",
    darkSwatch: "#70849c",
    pine: "68 80 94",
    pineDark: "50 60 72",
    darkPine: "112 132 156",
    darkPineDark: "88 106 128",
  },
  {
    id: "turquesa",
    label: "Turquesa",
    swatch: "#0f766e",
    darkSwatch: "#147d75",
    pine: "15 118 110",
    pineDark: "13 95 89",
    darkPine: "20 125 117",
    darkPineDark: "15 100 94",
  },
  {
    id: "vermelho",
    label: "Vermelho",
    swatch: "#b42318",
    darkSwatch: "#b4372f",
    pine: "180 35 24",
    pineDark: "143 28 20",
    darkPine: "180 55 47",
    darkPineDark: "146 40 34",
  },
  {
    id: "indigo",
    label: "Índigo",
    swatch: "#4338ca",
    darkSwatch: "#5b58d1",
    pine: "67 56 202",
    pineDark: "49 41 150",
    darkPine: "91 88 209",
    darkPineDark: "69 67 165",
  },
  {
    id: "marrom",
    label: "Marrom",
    swatch: "#79502b",
    darkSwatch: "#976432",
    pine: "121 80 43",
    pineDark: "93 60 32",
    darkPine: "151 100 50",
    darkPineDark: "117 74 37",
  },
];

const ACCENT_MAP = new Map(ACCENT_OPTIONS.map((item) => [item.id, item]));
const VALID_ACCENTS = new Set(ACCENT_OPTIONS.map((item) => item.id));

const THEME_COLOR = {
  light: "#f3efe6",
  dark: "#000000",
};

let current = "light";
let currentAccent = "verde";
let followsSystemTheme = false;
let systemThemeMedia = null;
const listeners = new Set();

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return null;
}

function readSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function handleSystemThemeChange(event) {
  if (!followsSystemTheme) return;
  current = event.matches ? "dark" : "light";
  applyCssVariables(current, currentAccent);
  listeners.forEach((listener) => listener());
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

function applyCssVariables(themeValue, accentValue) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = themeValue;
  root.dataset.accent = accentValue;
  const option = ACCENT_MAP.get(accentValue) || ACCENT_OPTIONS[0];
  const isDark = themeValue === "dark";
  root.style.setProperty("--pine", isDark ? option.darkPine : option.pine);
  root.style.setProperty("--pine-dark", isDark ? option.darkPineDark : option.pineDark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[themeValue] || THEME_COLOR.light);
}

export function getAccentHex(themeValue = current, accentValue = currentAccent) {
  const option = ACCENT_MAP.get(accentValue) || ACCENT_OPTIONS[0];
  return themeValue === "dark" ? option.darkSwatch : option.swatch;
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
  followsSystemTheme = false;
  current = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* ignore */
  }
  applyCssVariables(current, currentAccent);
  listeners.forEach((listener) => listener());
}

export function setAccent(next) {
  if (!VALID_ACCENTS.has(next)) return;
  currentAccent = next;
  try {
    localStorage.setItem(ACCENT_KEY, next);
  } catch {
    /* ignore */
  }
  applyCssVariables(current, currentAccent);
  listeners.forEach((listener) => listener());
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

export function initTheme() {
  if (typeof document === "undefined") return;
  const storedTheme = readStoredTheme();
  followsSystemTheme = storedTheme === null;
  current = storedTheme || readSystemTheme();
  currentAccent = readStoredAccent();
  applyCssVariables(current, currentAccent);

  if (systemThemeMedia) {
    if (systemThemeMedia.removeEventListener) {
      systemThemeMedia.removeEventListener("change", handleSystemThemeChange);
    } else {
      systemThemeMedia.removeListener(handleSystemThemeChange);
    }
  }
  systemThemeMedia = window.matchMedia?.("(prefers-color-scheme: dark)") || null;
  if (systemThemeMedia) {
    if (systemThemeMedia.addEventListener) {
      systemThemeMedia.addEventListener("change", handleSystemThemeChange);
    } else {
      systemThemeMedia.addListener(handleSystemThemeChange);
    }
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "light");
}

export function useAccent() {
  return useSyncExternalStore(subscribeTheme, getAccent, () => "verde");
}
