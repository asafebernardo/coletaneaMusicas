import { chordedStanzas } from "@/lib/chords.js";
import { stanzasOf } from "@/lib/voices.js";

const REFRAIN_LABEL = /^(refr[aã]o|coro)\s*:?$/i;

/** Separa um texto antigo em que a palavra Refrão ainda estava dentro da letra. */
export function splitLyrics(text) {
  const raw = String(text ?? "").replace(/\r\n/g, "\n").trim();
  if (!raw) return { letra: "", refrao: "" };

  const verses = [];
  let refrao = "";

  raw.split(/\n{2,}/).forEach((chunk, index, chunks) => {
    if (
      refrao &&
      index > 0 &&
      chunks[index - 1] &&
      REFRAIN_LABEL.test(chunks[index - 1].split("\n")[0].trim()) &&
      chunks[index - 1].split("\n").length === 1
    ) {
      return;
    }
    const lines = chunk.split("\n");
    const first = lines[0].trim();
    if (!REFRAIN_LABEL.test(first)) {
      verses.push(chunk);
      return;
    }
    const inline = lines.slice(1).join("\n").trim();
    if (inline) {
      refrao = inline;
      return;
    }
    const next = chunks[index + 1];
    refrao = next ? next.trim() : "";
  });

  return { letra: verses.join("\n\n").trim(), refrao };
}

export function stripRefrainLabel(text) {
  return String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/^(?:refr[aã]o|coro)\s*:?\s*\n+/i, "")
    .trim();
}

function voiceClass(voice, showVoices) {
  if (!showVoices) return "";
  if (voice === "homens") return "text-voice-men";
  if (voice === "mulheres") return "text-voice-women";
  return "";
}

function Stanza({ lines, showVoices, italic }) {
  return (
    <div>
      {lines.map((line, index) => (
        <p key={index} className={`whitespace-pre-wrap ${italic ? "italic" : ""}`}>
          {line.segments.map((segment, segmentIndex) => (
            <span key={segmentIndex} className={voiceClass(segment.voice, showVoices)}>
              {segment.text}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function ChordStanza({ lines, italic }) {
  return (
    <div className="space-y-1">
      {lines.map((line, index) => (
        <div key={index} className="space-y-0.5">
          {line.chord.trim() ? (
            <p className="whitespace-pre-wrap font-lyric text-[0.92em] font-semibold leading-tight text-pine">
              {line.chord}
            </p>
          ) : null}
          <p className={`whitespace-pre-wrap ${italic ? "italic" : ""}`}>
            {line.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function Refrain({ lines, showVoices }) {
  if (lines.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[0.78em] not-italic tracking-[0.16em] text-ink-soft">Refrão</p>
      <Stanza lines={lines} showVoices={showVoices} italic />
    </div>
  );
}

function ChordRefrain({ lines }) {
  if (lines.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-[0.78em] not-italic tracking-[0.16em] text-ink-soft">Refrão</p>
      <ChordStanza lines={lines} italic />
    </div>
  );
}

function SongBody({ verses, chorus, lead, repeated, renderVerse, renderChorus }) {
  if (repeated) {
    return (
      <>
        {lead ? renderChorus() : null}
        {verses.map((stanza, index) => (
          <div key={index} className="space-y-6">
            {renderVerse(stanza, index)}
            {renderChorus()}
          </div>
        ))}
      </>
    );
  }
  if (lead) {
    return (
      <>
        {renderChorus()}
        {verses.map((stanza, index) => renderVerse(stanza, index))}
      </>
    );
  }
  return (
    <>
      {verses[0] ? renderVerse(verses[0], 0) : null}
      {chorus.length > 0 ? renderChorus() : null}
      {verses.slice(1).map((stanza, index) => renderVerse(stanza, index + 1))}
    </>
  );
}

export default function Lyrics({
  letra,
  refrao,
  vozesLetra,
  vozesRefrao,
  letraVozes,
  vozesArranjo,
  cifraLetra,
  cifraRefrao,
  cronologica,
  refraoPrimeiro,
  showVoices,
  showChords,
  fontSize,
}) {
  const cleanRefrao = stripRefrainLabel(refrao);
  const lead = Boolean(refraoPrimeiro);
  const repeated = Boolean(cronologica);

  return (
    <article
      className="space-y-6 px-5 py-6 text-center font-lyric leading-relaxed"
      style={{ fontSize: `${fontSize}px` }}
    >
      {showChords ? (
        <ChordedBody
          letra={letra}
          refrao={cleanRefrao}
          cifraLetra={cifraLetra}
          cifraRefrao={cifraRefrao}
          lead={lead}
          repeated={repeated}
        />
      ) : (
        <VoicedBody
          letra={letra}
          refrao={cleanRefrao}
          vozesLetra={vozesLetra}
          vozesRefrao={vozesRefrao}
          letraVozes={letraVozes}
          vozesArranjo={vozesArranjo}
          lead={lead}
          repeated={repeated}
          showVoices={showVoices}
        />
      )}
    </article>
  );
}

function VoicedBody({
  letra,
  refrao,
  vozesLetra,
  vozesRefrao,
  letraVozes,
  vozesArranjo,
  lead,
  repeated,
  showVoices,
}) {
  const hasFullVoicedSong = showVoices && Boolean(String(letraVozes ?? "").trim());
  if (hasFullVoicedSong) {
    const fullStanzas = stanzasOf(letraVozes, vozesArranjo);
    return (
      <>
        {fullStanzas.map((stanza, index) => (
          <Stanza key={index} lines={stanza} showVoices={showVoices} />
        ))}
      </>
    );
  }

  const verses = stanzasOf(letra, vozesLetra);
  const chorus = stanzasOf(refrao, vozesRefrao).flat();
  const showLead = lead && chorus.length > 0;
  const showRepeated = repeated && chorus.length > 0;
  return (
    <SongBody
      verses={verses}
      chorus={chorus}
      lead={showLead}
      repeated={showRepeated}
      renderVerse={(stanza, index) => <Stanza key={index} lines={stanza} showVoices={showVoices} />}
      renderChorus={() => <Refrain lines={chorus} showVoices={showVoices} />}
    />
  );
}

function ChordedBody({ letra, refrao, cifraLetra, cifraRefrao, lead, repeated }) {
  const verses = chordedStanzas(letra, cifraLetra);
  const chorus = chordedStanzas(refrao, cifraRefrao).flat();
  const showLead = lead && chorus.length > 0;
  const showRepeated = repeated && chorus.length > 0;
  return (
    <SongBody
      verses={verses}
      chorus={chorus}
      lead={showLead}
      repeated={showRepeated}
      renderVerse={(stanza, index) => <ChordStanza key={index} lines={stanza} />}
      renderChorus={() => <ChordRefrain lines={chorus} />}
    />
  );
}
