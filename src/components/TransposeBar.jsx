import {
  detectSongKey,
  KEY_OPTIONS,
  semitonesBetweenKeys,
  transposeKeyLabel,
} from "@/lib/chords.js";

export default function TransposeBar({ cifraLetra, cifraRefrao, semitones, onChange }) {
  const baseKey = detectSongKey(cifraLetra, cifraRefrao);
  const currentKey = baseKey ? transposeKeyLabel(baseKey, semitones) : "";
  const minor = /m$/i.test(baseKey);
  const keyOptions = KEY_OPTIONS.filter((key) => /m$/i.test(key) === minor);

  const setByKey = (nextKey) => {
    if (!baseKey) return;
    onChange(semitonesBetweenKeys(baseKey, nextKey));
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-line bg-card px-3 py-2">
      <p className="shrink-0 text-xs text-ink-soft">Tom</p>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-sm text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
          aria-label="Diminuir um semitom"
          onClick={() => onChange(semitones - 1)}
        >
          −
        </button>
        <label className="sr-only" htmlFor="song-key">
          Tom da música
        </label>
        <select
          id="song-key"
          className="h-8 min-w-[4.5rem] rounded-full border border-line bg-paper px-2 text-sm font-medium text-ink outline-none focus:ring-2 focus:ring-pine disabled:opacity-50"
          value={currentKey || ""}
          disabled={!baseKey}
          onChange={(event) => setByKey(event.target.value)}
        >
          {!baseKey ? <option value="">—</option> : null}
          {currentKey && !keyOptions.includes(currentKey) ? (
            <option value={currentKey}>{currentKey}</option>
          ) : null}
          {keyOptions.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-sm text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
          aria-label="Aumentar um semitom"
          onClick={() => onChange(semitones + 1)}
        >
          +
        </button>
        {semitones !== 0 ? (
          <button
            type="button"
            className="h-8 shrink-0 rounded-full px-2.5 text-xs text-ink-soft hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            onClick={() => onChange(0)}
          >
            Original{baseKey ? ` (${baseKey})` : ""}
          </button>
        ) : null}
      </div>
    </div>
  );
}
