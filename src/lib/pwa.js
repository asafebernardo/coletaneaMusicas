import { useSyncExternalStore } from "react";

let deferredPrompt = null;
let isInstalled = false;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const search = new URLSearchParams(window.location.search);
  if (search.get("pwa") === "1") return true;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator?.standalone === true
  );
}

export function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent || "");
}

export function initPwa() {
  if (typeof window === "undefined") return;
  isInstalled = isStandaloneMode();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    isInstalled = true;
    notify();
  });
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return Boolean(deferredPrompt);
}

function getInstalledSnapshot() {
  return isInstalled || isStandaloneMode();
}

export function useCanPromptInstall() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function useIsPwaInstalled() {
  return useSyncExternalStore(subscribe, getInstalledSnapshot, () => false);
}

export async function triggerPwaInstall() {
  if (!deferredPrompt) return { outcome: "unavailable" };
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  notify();
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice.catch(() => ({ outcome: "dismissed" }));
  if (choice?.outcome === "accepted") {
    isInstalled = true;
    notify();
  }
  return choice || { outcome: "dismissed" };
}
