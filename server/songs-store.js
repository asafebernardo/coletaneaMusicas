import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packChordLines, syncChordLines } from "../src/lib/chords.js";
import { withNumbers } from "../src/lib/songs.js";
import { packLyrics } from "../src/lib/voices.js";

/**
 * Catálogo local. Cada música é
 * { id, titulo, letra, refrao, cronologica, refraoPrimeiro, vozesLetra, vozesRefrao, letraVozes, vozesArranjo, cifraLetra, cifraRefrao }.
 * O número não fica gravado: é a posição do título em ordem alfabética.
 * A palavra "Refrão" não faz parte do texto: o app a mostra na leitura.
 * No ICER, MusicaLetra guarda só a letra; o refrão entra nesse campo na integração.
 * Este arquivo não conversa com o ICER.
 */
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(serverDir, "../data/songs.json");
const audiosDir = path.resolve(serverDir, "../data/audios");

const AUDIO_EXTENSIONS = {
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/wave": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/aac": ".aac",
  "audio/webm": ".webm",
  "audio/flac": ".flac",
};

const CONTENT_TYPES = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".webm": "audio/webm",
  ".flac": "audio/flac",
};

async function removeAudioFile(filename) {
  const safe = path.basename(String(filename ?? "").trim());
  if (!safe) return;
  try {
    await unlink(path.join(audiosDir, safe));
  } catch {
    /* ignore missing file */
  }
}

async function saveAudioFromDataUrl(songId, dataUrl, originalName) {
  const match = String(dataUrl ?? "").match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) return { error: "audio_invalido" };
  const mime = match[1].toLowerCase().trim();
  const base64 = match[2];
  const rawName = path.basename(String(originalName ?? "").trim()).slice(0, 180);
  const nameExt = path.extname(rawName).toLowerCase();
  const ext =
    (CONTENT_TYPES[nameExt] ? nameExt : "") ||
    AUDIO_EXTENSIONS[mime] ||
    (mime.startsWith("audio/") ? ".mp3" : "");
  if (!ext) return { error: "audio_invalido" };

  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) return { error: "audio_invalido" };

  await mkdir(audiosDir, { recursive: true });
  const audioArquivo = `song-${songId}-${Date.now()}${ext}`;
  await writeFile(path.join(audiosDir, audioArquivo), buffer);
  return {
    audioArquivo,
    audioNome: rawName || `demonstracao${ext}`,
  };
}

export async function streamAudioFile(filename, req, res) {
  const safe = path.basename(String(filename ?? "").trim());
  if (!safe || safe !== filename) {
    res.statusCode = 404;
    res.end();
    return;
  }
  const target = path.join(audiosDir, safe);
  let info;
  try {
    info = await stat(target);
  } catch {
    res.statusCode = 404;
    res.end();
    return;
  }
  if (!info.isFile()) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const ext = path.extname(safe).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const total = info.size;
  const range = req.headers?.range;

  res.setHeader("Content-Type", contentType);
  res.setHeader("Accept-Ranges", "bytes");

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(parts[0], 10);
    const end = parts[1] ? Number.parseInt(parts[1], 10) : total - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= total) {
      res.statusCode = 416;
      res.setHeader("Content-Range", `bytes */${total}`);
      res.end();
      return;
    }
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
    res.setHeader("Content-Length", String(end - start + 1));
    createReadStream(target, { start, end }).pipe(res);
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Length", String(total));
  createReadStream(target).pipe(res);
}

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
  const compositor = String(input?.compositor ?? "").trim().slice(0, 200);
  const album = String(input?.album ?? "").trim().slice(0, 200);
  const anoLancamento = String(input?.anoLancamento ?? "").trim().slice(0, 20);
  const adicionais = String(input?.adicionais ?? "").trim().slice(0, 2000);
  const vozesPack = packLyrics(input?.letraVozes ?? "", input?.vozesArranjo);
  const hasArranjoVoices = Boolean(vozesPack.text);
  const letraRaw = String(input?.letra ?? "").trim() ? input?.letra : vozesPack.text;
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
  const somenteVozes =
    Boolean(input?.somenteVozes) &&
    (hasArranjoVoices || letraPack.marks.length > 0 || refraoPack.marks.length > 0);
  return {
    value: {
      titulo,
      compositor,
      album,
      anoLancamento,
      adicionais,
      letra,
      refrao,
      cronologica,
      refraoPrimeiro,
      somenteVozes,
      vozesLetra: letraPack.marks,
      vozesRefrao: refraoPack.marks,
      letraVozes: hasArranjoVoices ? vozesPack.text : "",
      vozesArranjo: hasArranjoVoices ? vozesPack.marks : [],
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
    let audioArquivo = "";
    let audioNome = "";
    if (input?.audioDataUrl) {
      const savedAudio = await saveAudioFromDataUrl(id, input.audioDataUrl, input.audioNome);
      if (savedAudio.error) return savedAudio;
      audioArquivo = savedAudio.audioArquivo;
      audioNome = savedAudio.audioNome;
    }
    songs.push({ id, ...checked.value, audioArquivo, audioNome });
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
    const current = songs[index];
    let audioArquivo = String(current.audioArquivo ?? "").trim();
    let audioNome = String(current.audioNome ?? "").trim();

    if (input?.audioDataUrl) {
      const savedAudio = await saveAudioFromDataUrl(id, input.audioDataUrl, input.audioNome);
      if (savedAudio.error) return savedAudio;
      if (audioArquivo && audioArquivo !== savedAudio.audioArquivo) {
        await removeAudioFile(audioArquivo);
      }
      audioArquivo = savedAudio.audioArquivo;
      audioNome = savedAudio.audioNome;
    } else if (input?.removeAudio) {
      if (audioArquivo) await removeAudioFile(audioArquivo);
      audioArquivo = "";
      audioNome = "";
    }

    songs[index] = { id, ...checked.value, audioArquivo, audioNome };
    await writeSongs(songs);
    return { song: (await presentSongs(songs)).find((item) => item.id === id) };
  });
}

export function deleteSong(id) {
  return withLock(async () => {
    const songs = await readSongs();
    const target = songs.find((song) => song.id === id);
    if (!target) return { error: "nao_encontrada" };
    const next = songs.filter((song) => song.id !== id);
    if (target.audioArquivo) {
      await removeAudioFile(target.audioArquivo);
    }
    await writeSongs(next);
    return { ok: true };
  });
}
