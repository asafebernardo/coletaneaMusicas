import { useCallback, useEffect, useState } from "react";

const SONG_THEMES_KEY = "coletanea-song-themes";
const SONG_THEMES_EVENT = "coletanea-song-themes-changed";

function isValidSongId(id) {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId) && numericId > 0;
}

function createThemeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readSongThemes() {
  try {
    const stored = localStorage.getItem(SONG_THEMES_KEY);
    if (stored == null) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) throw new Error("theme_storage_invalid");

    return parsed.map((theme) => {
      if (
        !theme ||
        typeof theme.id !== "string" ||
        typeof theme.name !== "string" ||
        !Array.isArray(theme.songIds)
      ) {
        throw new Error("theme_storage_invalid");
      }
      const songIds = theme.songIds.map(Number);
      if (!songIds.every(isValidSongId)) throw new Error("theme_storage_invalid");
      return {
        id: theme.id,
        name: theme.name,
        songIds: [...new Set(songIds)],
      };
    });
  } catch (error) {
    if (error?.message === "theme_storage_invalid") throw error;
    throw new Error("theme_storage_read");
  }
}

function updateSongThemes(update) {
  const current = readSongThemes();
  const next = update(current);
  if (next === current) return current;

  try {
    localStorage.setItem(SONG_THEMES_KEY, JSON.stringify(next));
  } catch {
    throw new Error("theme_storage_write");
  }
  window.dispatchEvent(new Event(SONG_THEMES_EVENT));
  return next;
}

export function createSongTheme(name) {
  const cleanName = String(name ?? "").trim();
  if (!cleanName) throw new Error("theme_name_required");
  if (cleanName.length > 80) throw new Error("theme_name_too_long");

  return updateSongThemes((themes) => {
    const normalizedName = cleanName.toLocaleLowerCase("pt-BR");
    if (themes.some((theme) => theme.name.toLocaleLowerCase("pt-BR") === normalizedName)) {
      throw new Error("theme_name_duplicate");
    }
    return [...themes, { id: createThemeId(), name: cleanName, songIds: [] }];
  });
}

export function renameSongTheme(themeId, name) {
  const cleanName = String(name ?? "").trim();
  if (!cleanName) throw new Error("theme_name_required");
  if (cleanName.length > 80) throw new Error("theme_name_too_long");

  return updateSongThemes((themes) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) throw new Error("theme_not_found");
    const normalizedName = cleanName.toLocaleLowerCase("pt-BR");
    if (
      themes.some(
        (item) =>
          item.id !== themeId && item.name.toLocaleLowerCase("pt-BR") === normalizedName,
      )
    ) {
      throw new Error("theme_name_duplicate");
    }
    if (theme.name === cleanName) return themes;
    return themes.map((item) =>
      item.id === themeId ? { ...item, name: cleanName } : item,
    );
  });
}

export function deleteSongTheme(themeId) {
  return updateSongThemes((themes) => {
    if (!themes.some((item) => item.id === themeId)) throw new Error("theme_not_found");
    return themes.filter((item) => item.id !== themeId);
  });
}

export function addSongToTheme(themeId, songId) {
  const numericSongId = Number(songId);
  if (!isValidSongId(numericSongId)) throw new Error("theme_song_id_invalid");

  return updateSongThemes((themes) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) throw new Error("theme_not_found");
    if (theme.songIds.includes(numericSongId)) return themes;
    return themes.map((item) =>
      item.id === themeId ? { ...item, songIds: [...item.songIds, numericSongId] } : item,
    );
  });
}

export function removeSongFromTheme(themeId, songId) {
  const numericSongId = Number(songId);
  if (!isValidSongId(numericSongId)) throw new Error("theme_song_id_invalid");

  return updateSongThemes((themes) => {
    const theme = themes.find((item) => item.id === themeId);
    if (!theme) throw new Error("theme_not_found");
    if (!theme.songIds.includes(numericSongId)) return themes;
    return themes.map((item) =>
      item.id === themeId
        ? { ...item, songIds: item.songIds.filter((id) => id !== numericSongId) }
        : item,
    );
  });
}

export function songThemeErrorMessage(error) {
  switch (error?.message) {
    case "theme_name_required":
      return "Informe o nome do tema.";
    case "theme_name_too_long":
      return "O nome do tema deve ter até 80 caracteres.";
    case "theme_name_duplicate":
      return "Já existe um tema com esse nome.";
    case "theme_not_found":
      return "Este tema não foi encontrado.";
    case "theme_song_id_invalid":
      return "Não foi possível identificar esta música.";
    case "theme_storage_invalid":
    case "theme_storage_read":
      return "Não foi possível carregar os temas salvos neste dispositivo.";
    case "theme_storage_write":
      return "Não foi possível salvar as alterações dos temas neste dispositivo.";
    default:
      return "Não foi possível atualizar os temas.";
  }
}

export function useSongThemes() {
  const [themes, setThemes] = useState([]);
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    try {
      setThemes(readSongThemes());
      setError("");
    } catch (loadError) {
      setThemes([]);
      setError(songThemeErrorMessage(loadError));
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(SONG_THEMES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SONG_THEMES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const runUpdate = useCallback((update) => {
    try {
      setThemes(update());
      setError("");
      return true;
    } catch (updateError) {
      setError(songThemeErrorMessage(updateError));
      return false;
    }
  }, []);

  const createTheme = useCallback(
    (name) => runUpdate(() => createSongTheme(name)),
    [runUpdate],
  );
  const renameTheme = useCallback(
    (themeId, name) => runUpdate(() => renameSongTheme(themeId, name)),
    [runUpdate],
  );
  const deleteTheme = useCallback(
    (themeId) => runUpdate(() => deleteSongTheme(themeId)),
    [runUpdate],
  );
  const addSong = useCallback(
    (themeId, songId) => runUpdate(() => addSongToTheme(themeId, songId)),
    [runUpdate],
  );
  const removeSong = useCallback(
    (themeId, songId) => runUpdate(() => removeSongFromTheme(themeId, songId)),
    [runUpdate],
  );

  return { themes, error, isReady, createTheme, renameTheme, deleteTheme, addSong, removeSong };
}
