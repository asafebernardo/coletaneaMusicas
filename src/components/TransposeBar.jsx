import { useEffect, useRef, useState } from "react";
import {
  detectSongKey,
  KEY_OPTIONS,
  semitonesBetweenKeys,
  transposeKeyLabel,
} from "@/lib/chords.js";

export default function TransposeBar({
  cifraLetra,
  cifraRefrao,
  semitones,
  selectedKey,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const baseKey = detectSongKey(cifraLetra, cifraRefrao);
  const computedKey = baseKey ? transposeKeyLabel(baseKey, semitones) : "";
  const currentKey = semitones === 0 ? baseKey : selectedKey || computedKey;
  const minor = /m$/i.test(baseKey);
  const keyOptions = KEY_OPTIONS.filter((key) => /m$/i.test(key) === minor);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const setByKey = (nextKey) => {
    if (!baseKey) return;
    const nextSemitones = semitonesBetweenKeys(baseKey, nextKey);
    onChange(nextSemitones, nextSemitones === 0 ? "" : nextKey);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-line bg-card px-4 py-2 landscape-mobile:py-1.5">
      <span id="song-key-label" className="shrink-0 text-xs font-medium text-ink-soft">
        Tom
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {semitones !== 0 ? (
          <button
            type="button"
            className="h-8 shrink-0 rounded-full border border-line bg-paper px-3 text-xs font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            onClick={() => {
              onChange(0, "");
              setOpen(false);
            }}
          >
            Original{baseKey ? ` (${baseKey})` : ""}
          </button>
        ) : null}

        <div ref={containerRef} className="relative">
          <button
            id="song-key"
            type="button"
            disabled={!baseKey}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby="song-key-label song-key"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex h-8 min-w-[4.75rem] items-center justify-between gap-2 rounded-full border border-line bg-paper pl-3 pr-2.5 font-mono text-sm font-semibold text-pine transition-colors hover:border-pine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{currentKey || "—"}</span>
            <ChevronIcon open={open} />
          </button>

          {open && baseKey ? (
            <div
              role="listbox"
              aria-labelledby="song-key-label"
              className="absolute bottom-full right-0 z-30 mb-2 w-52 landscape-mobile:w-80 landscape-mobile:max-h-[55dvh] landscape-mobile:overflow-y-auto rounded-2xl border border-line bg-card p-2 shadow-lg"
            >
              <div className="grid grid-cols-4 landscape-mobile:grid-cols-7 gap-1">
                {keyOptions.map((key) => {
                  const active = key === currentKey;
                  const isOriginal = key === baseKey;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => setByKey(key)}
                      className={`inline-flex h-8 items-center justify-center rounded-lg font-mono text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                        active
                          ? "bg-pine text-white"
                          : isOriginal
                            ? "border border-pine/35 bg-paper text-pine hover:bg-pine/10"
                            : "text-ink hover:bg-paper"
                      }`}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-150 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}
