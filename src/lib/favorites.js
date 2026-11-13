import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "coletanea-favorite-song-ids";
const FAVORITES_EVENT = "coletanea-favorites-changed";

export function readFavoriteIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    return [...new Set(stored.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
  } catch {
    return [];
  }
}

function toggleFavoriteId(id) {
  const songId = Number(id);
  if (!Number.isSafeInteger(songId) || songId <= 0) {
    throw new Error("id_invalido");
  }

  const current = readFavoriteIds();
  const next = current.includes(songId)
    ? current.filter((favoriteId) => favoriteId !== songId)
    : [...current, songId];

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
  return next;
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(readFavoriteIds);
  const [favoriteError, setFavoriteError] = useState("");

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(readFavoriteIds());
    window.addEventListener(FAVORITES_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  const toggleFavorite = useCallback((id) => {
    try {
      const next = toggleFavoriteId(id);
      setFavoriteIds(next);
      setFavoriteError("");
    } catch {
      setFavoriteError("Não foi possível atualizar os favoritos neste dispositivo.");
    }
  }, []);

  return { favoriteIds, favoriteError, toggleFavorite };
}
