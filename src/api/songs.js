import { canManageSongs, withNumbers } from "@/lib/songs.js";

/**
 * Cliente da API local com fallback estático para GitHub Pages.
 * O número é a posição alfabética do título.
 * Não há chamada ao site ICER.
 */

const basePrefix = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export function getAudioUrl(audioArquivo) {
  const safe = String(audioArquivo ?? "").trim();
  if (!safe) return "";
  return `${basePrefix}/data/audios/${encodeURIComponent(safe)}`;
}

async function readStaticCatalog() {
  const response = await fetch(`${basePrefix}/data/songs.json`);
  if (!response.ok) {
    throw new Error("erro_interno");
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("erro_interno");
  }
  return withNumbers(data);
}

export async function request(path, options = {}) {
  const response = await fetch(`${basePrefix}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const error = new Error("api_indisponivel");
    error.status = response.status;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "erro_interno");
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getStaticSong(id) {
  const songs = await readStaticCatalog();
  const found = songs.find((song) => Number(song.id) === Number(id));
  if (!found) {
    const notFound = new Error("nao_encontrada");
    notFound.status = 404;
    throw notFound;
  }
  return found;
}

export async function listSongs() {
  if (!canManageSongs()) {
    return readStaticCatalog();
  }
  try {
    return await request("/api/songs");
  } catch {
    return readStaticCatalog();
  }
}

export async function getSong(id) {
  if (!canManageSongs()) {
    return getStaticSong(id);
  }
  try {
    return await request(`/api/songs/${id}`);
  } catch (err) {
    if (err?.status === 404 && err?.message === "nao_encontrada") {
      throw err;
    }
    return getStaticSong(id);
  }
}

export function createSong(song) {
  return request("/api/songs", {
    method: "POST",
    body: JSON.stringify(song),
  });
}

export function updateSong(id, song) {
  return request(`/api/songs/${id}`, {
    method: "PUT",
    body: JSON.stringify(song),
  });
}

export function deleteSong(id) {
  return request(`/api/songs/${id}`, { method: "DELETE" });
}

export function messageForSongError(error) {
  switch (error?.message) {
    case "titulo_invalido":
      return "Informe o título (até 200 caracteres).";
    case "letra_invalida":
      return "Informe a letra da música.";
    case "audio_invalido":
      return "Arquivo de áudio inválido.";
    case "nao_encontrada":
      return "Não encontrado.";
    default:
      return "Não foi possível concluir esta ação.";
  }
}
