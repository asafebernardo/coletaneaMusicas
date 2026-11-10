/** Linhas de um texto, normalizando quebras Windows. */
export function linesOf(text) {
  return String(text ?? "").replace(/\r\n/g, "\n").split("\n");
}

/** Garante um acorde por linha do texto (preenche ou corta). */
export function syncChordLines(text, chords) {
  const lines = linesOf(text);
  const raw = Array.isArray(chords) ? chords : [];
  return lines.map((_, index) => String(raw[index] ?? ""));
}

/**
 * Aplica o mesmo corte de linhas vazias das pontas que packLyrics usa no texto,
 * para a cifra continuar alinhada à letra salva.
 */
export function packChordLines(text, chords) {
  const raw = String(text ?? "").replace(/\r\n/g, "\n");
  const lines = raw.split("\n");
  const synced = syncChordLines(raw, chords);
  let startLine = 0;
  let endLine = lines.length;
  while (startLine < endLine && !lines[startLine].trim()) startLine += 1;
  while (endLine > startLine && !lines[endLine - 1].trim()) endLine -= 1;
  return synced.slice(startLine, endLine);
}

export function hasChordLines(chords) {
  return Array.isArray(chords) && chords.some((line) => String(line ?? "").trim());
}

export function songHasChords(song) {
  return hasChordLines(song?.cifraLetra) || hasChordLines(song?.cifraRefrao);
}

/**
 * Agrupa texto + cifra em estrofes (linhas vazias separam),
 * no mesmo espírito de stanzasOf, sem marcas de voz.
 */
export function chordedStanzas(text, chords) {
  const lines = linesOf(text);
  const chordLines = syncChordLines(text, chords);
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start += 1;
  while (end > start && !lines[end - 1].trim()) end -= 1;

  const stanzas = [];
  let current = [];
  for (let index = start; index < end; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      if (current.length) stanzas.push(current);
      current = [];
    } else {
      current.push({ text: line, chord: chordLines[index] || "" });
    }
  }
  if (current.length) stanzas.push(current);
  return stanzas;
}

/* ——— Padrão musical / Cifra Club ——— */

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_TO_SEMI = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

/** Tokens especiais aceitos na cifra (não são acordes, não transpose). */
const SPECIAL_TOKENS = new Set(["N.C.", "NC", "N.C", "%", "-", "–", "—", "(", ")", "[", "]"]);

/**
 * Acorde no estilo Cifra Club / cifra BR:
 * C, Dm, F#m7, Bbmaj7, G7(9), C/E, Asus4, C° , etc.
 */
const CHORD_RE =
  /^([A-G])([#b♯♭]?)(m(?!aj)|M(?!aj)|maj|min|dim|aug|sus\d?|[º°ø+])?(maj7|M7|m7|dim7|ø7|7|9|11|13|6|2|4|5)?((?:\([^)]+\)|[#b♯♭]\d{1,2}|add\d{1,2}|maj\d{1,2}|M\d{1,2}|sus\d{0,2})*)(?:\/([A-G])([#b♯♭]?))?$/i;

function normalizeAccidental(value) {
  if (value === "♯") return "#";
  if (value === "♭") return "b";
  return value || "";
}

function normalizeNoteLetter(letter, accidental) {
  const root = `${String(letter).toUpperCase()}${normalizeAccidental(accidental)}`;
  return NOTE_TO_SEMI[root] == null ? null : root;
}

function preferFlatsFrom(note) {
  return note.includes("b");
}

function noteFromSemi(semi, preferFlats) {
  const index = ((semi % 12) + 12) % 12;
  return preferFlats ? FLATS[index] : SHARPS[index];
}

export function parseChord(token) {
  const raw = String(token ?? "").trim();
  if (!raw) return null;
  if (SPECIAL_TOKENS.has(raw) || SPECIAL_TOKENS.has(raw.toUpperCase())) {
    return { kind: "special", raw };
  }
  const match = raw.match(CHORD_RE);
  if (!match) return null;
  const root = normalizeNoteLetter(match[1], match[2]);
  if (!root) return null;
  const quality = match[3] || "";
  const extension = match[4] || "";
  const extras = match[5] || "";
  const bass = match[6] ? normalizeNoteLetter(match[6], match[7]) : "";
  if (match[6] && !bass) return null;
  return {
    kind: "chord",
    raw,
    root,
    quality,
    extension,
    extras,
    bass: bass || "",
    preferFlats: preferFlatsFrom(root) || preferFlatsFrom(bass || ""),
  };
}

export function isValidChordToken(token) {
  return Boolean(parseChord(token));
}

/** Quebra a linha preservando espaços (para alinhar e transpose). */
export function tokenizeChordLine(line) {
  const raw = String(line ?? "");
  const parts = [];
  const re = /(\S+)|(\s+)/g;
  let match = re.exec(raw);
  while (match) {
    if (match[1]) {
      const parsed = parseChord(match[1]);
      parts.push({
        type: "token",
        text: match[1],
        valid: Boolean(parsed),
        chord: parsed?.kind === "chord" ? parsed : null,
      });
    } else {
      parts.push({ type: "space", text: match[2] });
    }
    match = re.exec(raw);
  }
  return parts;
}

export function invalidChordTokens(line) {
  return tokenizeChordLine(line)
    .filter((part) => part.type === "token" && !part.valid)
    .map((part) => part.text);
}

export function lineHasInvalidChords(line) {
  return invalidChordTokens(line).length > 0;
}

export function chordsHaveInvalidTokens(chords) {
  if (!Array.isArray(chords)) return false;
  return chords.some((line) => lineHasInvalidChords(line));
}

function transposeNote(note, semitones, preferFlats) {
  const semi = NOTE_TO_SEMI[note];
  if (semi == null) return note;
  return noteFromSemi(semi + semitones, preferFlats);
}

export function transposeChordToken(token, semitones, preferFlats) {
  const parsed = parseChord(token);
  if (!parsed || parsed.kind !== "chord") return token;
  const flats = preferFlats ?? parsed.preferFlats;
  const root = transposeNote(parsed.root, semitones, flats);
  const bass = parsed.bass ? `/${transposeNote(parsed.bass, semitones, flats)}` : "";
  // extras pode conter /baixo legado no meio; o baixo final já foi separado pelo regex
  return `${root}${parsed.quality}${parsed.extension}${parsed.extras}${bass}`;
}

export function transposeChordLine(line, semitones, preferFlats) {
  if (!semitones) return String(line ?? "");
  return tokenizeChordLine(line)
    .map((part) => {
      if (part.type !== "token" || !part.chord) return part.text;
      return transposeChordToken(part.text, semitones, preferFlats);
    })
    .join("");
}

export function transposeChordLines(lines, semitones, preferFlats) {
  if (!Array.isArray(lines)) return [];
  if (!semitones) return lines.map((line) => String(line ?? ""));
  return lines.map((line) => transposeChordLine(line, semitones, preferFlats));
}

/** Primeira nota/acorde encontrada nas linhas de cifra (tom de referência). */
export function detectSongKey(cifraLetra, cifraRefrao) {
  const pools = [cifraLetra, cifraRefrao];
  for (const pool of pools) {
    if (!Array.isArray(pool)) continue;
    for (const line of pool) {
      for (const part of tokenizeChordLine(line)) {
        if (part.chord?.root) {
          const minor = /^(?:m(?!aj)|min)/i.test(part.chord.quality || "") && !/^M/.test(part.chord.quality || "");
          return minor ? `${part.chord.root}m` : part.chord.root;
        }
      }
    }
  }
  return "";
}

export function transposeKeyLabel(key, semitones, preferFlats) {
  if (!key) return "";
  const parsed = parseChord(key);
  if (!parsed || parsed.kind !== "chord") return key;
  if (!semitones) return key;
  const candidate = transposeChordToken(key, semitones, preferFlats ?? parsed.preferFlats);
  if (preferFlats != null || KEY_OPTIONS.includes(candidate)) return candidate;
  const alt = transposeChordToken(key, semitones, !parsed.preferFlats);
  return KEY_OPTIONS.includes(alt) ? alt : candidate;
}

export const KEY_OPTIONS = [
  "C",
  "C#",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
  "Cm",
  "C#m",
  "Dm",
  "Ebm",
  "Em",
  "Fm",
  "F#m",
  "Gm",
  "G#m",
  "Am",
  "Bbm",
  "Bm",
];

function keyToSemi(key) {
  const parsed = parseChord(key);
  if (!parsed || parsed.kind !== "chord") return null;
  return NOTE_TO_SEMI[parsed.root];
}

/** Quantos semitons faltam para ir do tom A ao tom B (mesma qualidade m/maior). */
export function semitonesBetweenKeys(fromKey, toKey) {
  const from = keyToSemi(fromKey);
  const to = keyToSemi(toKey);
  if (from == null || to == null) return 0;
  return (to - from + 12) % 12;
}
