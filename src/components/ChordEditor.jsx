import { invalidChordTokens, linesOf, syncChordLines } from "@/lib/chords.js";

export default function ChordEditor({
  label,
  text,
  chords,
  italic,
  emptyHint = "Escreva a letra na aba Letra para cifrar aqui.",
  onChange,
}) {
  const lines = linesOf(text);
  const chordLines = syncChordLines(text, chords);
  const hasContent = lines.some((line) => line.trim());

  const setChordAt = (index, value) => {
    const next = [...chordLines];
    next[index] = value;
    onChange(next);
  };

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-paper px-3 py-8 text-center text-sm text-ink-soft">
        {emptyHint}
      </div>
    );
  }

  return (
    <div
      className="space-y-1 rounded-xl border border-line bg-paper px-3 py-3 text-center font-lyric"
      role="group"
      aria-label={label}
    >
      {lines.map((line, index) => {
        if (!line.trim()) {
          return <div key={`gap-${index}`} className="h-3" aria-hidden />;
        }
        const chord = chordLines[index] || "";
        const invalid = invalidChordTokens(chord);
        return (
          <div key={index} className="space-y-0.5">
            <input
              type="text"
              value={chord}
              onChange={(event) => setChordAt(index, event.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-label={`Cifra da linha: ${line}`}
              aria-invalid={invalid.length > 0}
              placeholder="C  Dm  G7"
              className={`h-7 w-full border-0 bg-transparent px-0 text-center font-lyric text-sm font-semibold outline-none ring-0 placeholder:text-ink-soft/35 focus:ring-0 ${
                invalid.length > 0 ? "text-danger" : "text-pine"
              }`}
            />
            <p
              className={`whitespace-pre-wrap text-center font-lyric text-sm leading-snug text-ink ${
                italic ? "italic" : ""
              }`}
            >
              {line}
            </p>
            {invalid.length > 0 ? (
              <p className="font-sans text-[11px] leading-snug text-danger">
                Não reconhecido: {invalid.join(", ")}. Use acordes como C, Dm, F#m7, G7(9), C/E.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
