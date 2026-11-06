/**
 * Cliente da API local. O número é a posição alfabética do título.
 * Não há chamada ao site ICER.
 */

export async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "erro_interno");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function listSongs() {
  return request("/api/songs");
}

export function getSong(id) {
  return request(`/api/songs/${id}`);
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
    case "nao_encontrada":
      return "Não encontrado.";
    default:
      return "Não foi possível concluir esta ação.";
  }
}
