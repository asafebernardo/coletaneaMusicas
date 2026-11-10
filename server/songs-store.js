import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packChordLines, syncChordLines } from "../src/lib/chords.js";
import { withNumbers } from "../src/lib/songs.js";
import { packLyrics } from "../src/lib/voices.js";

/**
 * Catálogo local. Cada música é
 * { id, titulo, letra, refrao, cronologica, refraoPrimeiro, vozesLetra, vozesRefrao, cifraLetra, cifraRefrao }.
 * O número não fica gravado: é a posição do título em ordem alfabética.
 * A palavra "Refrão" não faz parte do texto: o app a mostra na leitura.
 * No ICER, MusicaLetra guarda só a letra; o refrão entra nesse campo na integração.
 * Este arquivo não conversa com o ICER.
 */
const filePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/songs.json",
);

let queue = Promise.resolve();

function withLock(task) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readSongs() {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("songs_invalidas");
  }
  return parsed;
}

const droppedKeys = [
  "numero",
  "autor",
  "tema",
  "autorId",
  "temaId",
  "banda",
  "album",
  "ano",
  "outros",
  "vozesSeparadas",
  "vozesTodas",
];

async function writeSongs(songs) {
  const stored = songs.map((song) => {
    const next = { ...song };
    for (const key of droppedKeys) delete next[key];
    return next;
  });
  await writeFile(filePath, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
}

function presentSongs(songs) {
  return withNumbers(songs);
}

export function validateSong(input) {
  const titulo = String(input?.titulo ?? "").trim();
  const letraRaw = input?.letra;
  const refraoRaw = String(input?.refrao ?? "").replace(/^(?:refr[aã]o|coro)\s*:?\s*\n+/i, "");
  const letraPack = packLyrics(letraRaw, input?.vozesLetra);
  const refraoPack = packLyrics(refraoRaw, input?.vozesRefrao);
  const letra = letraPack.text;
  const refrao = refraoPack.text;
  const cifraLetra = syncChordLines(letra, packChordLines(letraRaw, input?.cifraLetra));
  const cifraRefrao = syncChordLines(refrao, packChordLines(refraoRaw, input?.cifraRefrao));

  if (!titulo || titulo.length > 200) {
    return { error: "titulo_invalido" };
  }
  if (!letra) {
    return { error: "letra_invalida" };
  }
  const refraoPrimeiro = Boolean(input?.refraoPrimeiro) && Boolean(refrao);
  const cronologica = Boolean(input?.cronologica) && Boolean(refrao);
  return {
    value: {
      titulo,
      letra,
      refrao,
      cronologica,
      refraoPrimeiro,
      vozesLetra: letraPack.marks,
      vozesRefrao: refraoPack.marks,
      cifraLetra,
      cifraRefrao,
    },
  };
}

export function listSongs() {
  return withLock(async () => presentSongs(await readSongs()));
}

export function getSong(id) {
  return withLock(async () => {
    const songs = await presentSongs(await readSongs());
    return songs.find((song) => song.id === id) ?? null;
  });
}

export function createSong(input) {
  return withLock(async () => {
    const songs = await readSongs();
    const checked = validateSong(input);
    if (checked.error) return checked;
    const id = songs.reduce((max, song) => Math.max(max, Number(song.id) || 0), 0) + 1;
    songs.push({ id, ...checked.value });
    await writeSongs(songs);
    return { song: (await presentSongs(songs)).find((item) => item.id === id) };
  });
}

export function updateSong(id, input) {
  return withLock(async () => {
    const songs = await readSongs();
    const index = songs.findIndex((song) => song.id === id);
    if (index === -1) return { error: "nao_encontrada" };
    const checked = validateSong(input);
    if (checked.error) return checked;
    songs[index] = { id, ...checked.value };
    await writeSongs(songs);
    return { song: (await presentSongs(songs)).find((item) => item.id === id) };
  });
}

export function deleteSong(id) {
  return withLock(async () => {
    const songs = await readSongs();
    const next = songs.filter((song) => song.id !== id);
    if (next.length === songs.length) return { error: "nao_encontrada" };
    await writeSongs(next);
    return { ok: true };
  });
}
