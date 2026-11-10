import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteSong, getSong, messageForSongError } from "@/api/songs.js";
import Lyrics from "@/components/Lyrics.jsx";
import MarqueeText from "@/components/MarqueeText.jsx";
import SongScroll from "@/components/SongScroll.jsx";
import ThemeButton from "@/components/ThemeButton.jsx";
import TransposeBar from "@/components/TransposeBar.jsx";
import {
  detectSongKey,
  songHasChords,
  transposeChordLines,
  transposeKeyLabel,
} from "@/lib/chords.js";
import {
  fontLimits,
  readFontSize,
  readShowChronological,
  writeFontSize,
  writeShowChronological,
} from "@/lib/songs.js";

const barItem =
  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine";
const barOn = "text-pine";
const barOff = "text-ink-soft hover:text-ink";
const barDisabled = "cursor-not-allowed text-ink-soft/45";

export default function SongPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const idOk = Number.isInteger(numericId);
  const [song, setSong] = useState(null);
  const [status, setStatus] = useState(idOk ? "loading" : "missing");
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState(readFontSize);
  const [showChronological, setShowChronological] = useState(readShowChronological);
  const [showChords, setShowChords] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState(false);
  const hasChords = songHasChords(song);
  const baseKey = detectSongKey(song?.cifraLetra, song?.cifraRefrao);
  const currentKey = baseKey ? transposeKeyLabel(baseKey, transpose) : "";
  const preferFlats = String(currentKey || baseKey || "").includes("b");
  const cifraLetraView = showChords
    ? transposeChordLines(song?.cifraLetra, transpose, preferFlats)
    : song?.cifraLetra;
  const cifraRefraoView = showChords
    ? transposeChordLines(song?.cifraRefrao, transpose, preferFlats)
    : song?.cifraRefrao;

  useEffect(() => {
    if (!idOk) return undefined;
    let active = true;
    getSong(numericId)
      .then((data) => {
        if (!active) return;
        setSong(data);
        setShowChords(false);
        setTranspose(0);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 404) {
          setStatus("missing");
          return;
        }
        setError(messageForSongError(err));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [idOk, numericId]);

  const changeFont = (delta) => {
    setFontSize((current) => {
      const next = Math.min(fontLimits.max, Math.max(fontLimits.min, current + delta));
      writeFontSize(next);
      return next;
    });
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await deleteSong(numericId);
      navigate("/", { replace: true });
    } catch (err) {
      setError(messageForSongError(err));
      setRemoving(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-line bg-card/95 px-2 py-2 backdrop-blur">
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
            aria-label="Voltar à lista"
          >
            <span aria-hidden className="text-xl leading-none">
              ‹
            </span>
          </Link>
          <div className="min-w-0 flex-1 px-1">
            {song ? (
              <h1 className="flex min-h-6 min-w-0 items-stretch gap-3">
                <span className="flex w-[3ch] shrink-0 items-center justify-end text-base font-semibold tabular-nums leading-tight">
                  {String(song.numero).padStart(3, "0")}
                </span>
                <span aria-hidden className="w-px shrink-0 self-stretch bg-ink-soft/35" />
                <span className="flex min-w-0 flex-1 items-center">
                  <MarqueeText text={song.titulo} className="text-base font-semibold leading-tight" />
                </span>
              </h1>
            ) : (
              <p className="text-sm font-medium">Coletânea</p>
            )}
          </div>
          <div className="flex shrink-0 items-center">
            <div className="inline-flex h-10 items-center" role="group" aria-label="Tamanho da letra">
              <button
                type="button"
                className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:text-ink-soft/35"
                aria-label="Diminuir letra"
                disabled={fontSize <= fontLimits.min}
                onClick={() => changeFont(-2)}
              >
                A−
              </button>
              <button
                type="button"
                className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:text-ink-soft/35"
                aria-label="Aumentar letra"
                disabled={fontSize >= fontLimits.max}
                onClick={() => changeFont(2)}
              >
                A+
              </button>
            </div>
            <ThemeButton />
          </div>
        </div>
      </header>

      <SongScroll>
        {status === "loading" ? (
          <div className="space-y-3 p-5" aria-hidden>
            <div className="h-4 w-2/3 animate-pulse rounded bg-paper" />
            <div className="h-28 animate-pulse rounded-xl bg-paper" />
          </div>
        ) : status === "missing" ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium">Música não encontrada</p>
            <Link to="/" className="mt-3 inline-block text-sm font-medium text-pine hover:underline">
              Voltar à lista
            </Link>
          </div>
        ) : status === "error" ? (
          <p className="px-4 py-10 text-center text-sm text-ink-soft">{error}</p>
        ) : (
          <Lyrics
            letra={song.letra}
            refrao={song.refrao}
            vozesLetra={song.vozesLetra}
            vozesRefrao={song.vozesRefrao}
            cifraLetra={cifraLetraView}
            cifraRefrao={cifraRefraoView}
            cronologica={Boolean(song.cronologica) && showChronological}
            refraoPrimeiro={Boolean(song.refraoPrimeiro)}
            showVoices={!showChords}
            showChords={showChords && hasChords}
            fontSize={fontSize}
          />
        )}

        {error && status === "ready" ? (
          <p className="px-4 pb-4 text-sm text-danger">{error}</p>
        ) : null}
      </SongScroll>

      <div className="relative shrink-0">
      {confirmDelete ? (
        <div className="shrink-0 border-t border-line bg-card px-4 py-3">
          <p className="text-sm">Apagar esta música do catálogo local?</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm hover:bg-paper disabled:opacity-50"
              onClick={() => setConfirmDelete(false)}
              disabled={removing}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-full bg-ink px-3.5 text-sm text-card disabled:opacity-60"
              onClick={remove}
              disabled={removing}
            >
              {removing ? "Apagando…" : "Apagar"}
            </button>
          </div>
        </div>
      ) : null}

      {song ? (
        <div className="pointer-events-none absolute bottom-full right-3 z-20 mb-3">
          <div className="pointer-events-auto inline-flex h-9 items-center rounded-full border border-line bg-card p-0.5 shadow-lg">
            <Link
              to={`/musicas/${song.id}/editar`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              <PencilIcon />
              Editar
            </Link>
            <button
              type="button"
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                confirmDelete
                  ? "bg-paper text-ink"
                  : "text-ink-soft hover:bg-danger-soft hover:text-danger"
              }`}
              aria-expanded={confirmDelete}
              onClick={() => setConfirmDelete(true)}
            >
              <TrashIcon />
              Apagar
            </button>
          </div>
        </div>
      ) : null}

      {song && showChords && hasChords ? (
        <TransposeBar
          cifraLetra={song.cifraLetra}
          cifraRefrao={song.cifraRefrao}
          semitones={transpose}
          onChange={setTranspose}
        />
      ) : null}

      {song ? (
        <nav
          aria-label="Controles da música"
          className="grid shrink-0 grid-cols-3 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
        >
          <button
            type="button"
            disabled
            className={`${barItem} ${barDisabled}`}
            aria-label="Vozes em breve"
          >
            <VoicesPartsIcon />
            Vozes
          </button>
          {hasChords ? (
            <button
              type="button"
              className={`${barItem} ${showChords ? barOn : barOff}`}
              aria-pressed={showChords}
              aria-label={showChords ? "Ver letra sem cifra" : "Ver música cifrada"}
              onClick={() =>
                setShowChords((current) => {
                  const next = !current;
                  if (!next) setTranspose(0);
                  return next;
                })
              }
            >
              <ChordIcon />
              Cifra
            </button>
          ) : (
            <button
              type="button"
              disabled
              className={`${barItem} ${barDisabled}`}
              aria-label="Esta música não tem cifra"
            >
              <ChordIcon />
              Cifra
            </button>
          )}
          {song.cronologica && String(song.refrao || "").trim() ? (
            <button
              type="button"
              className={`${barItem} ${showChronological ? barOn : barOff}`}
              aria-pressed={showChronological}
              aria-label={
                showChronological ? "Refrão depois de cada estrofe" : "Refrão só no final"
              }
              onClick={() =>
                setShowChronological((current) => {
                  const next = !current;
                  writeShowChronological(next);
                  return next;
                })
              }
            >
              <ChronologyIcon />
              Cronologia
            </button>
          ) : (
            <button
              type="button"
              disabled
              className={`${barItem} ${barDisabled}`}
              aria-label="Esta música não tem refrão cronológico"
            >
              <ChronologyIcon />
              Cronologia
            </button>
          )}
        </nav>
      ) : null}
      </div>
    </div>
  );
}

function VoicesPartsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0">
      <circle cx="6.4" cy="6.4" r="2.5" className="fill-voice-men" />
      <path className="fill-voice-men" d="M2.2 18.2v-.4c0-2.4 1.85-4.1 4.2-4.1s4.2 1.7 4.2 4.1v.4z" />
      <circle cx="17.6" cy="6.4" r="2.5" className="fill-voice-women" />
      <path className="fill-voice-women" d="M13.4 18.2v-.4c0-2.4 1.85-4.1 4.2-4.1s4.2 1.7 4.2 4.1v.4z" />
    </svg>
  );
}

function ChordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.5" />
      <path d="M8 7.5h8" />
      <path d="M8 12h8" />
      <path d="M8 16.5h5" />
      <circle cx="15.5" cy="16.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChronologyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 5.5v13" />
      <circle cx="7" cy="6" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="7" cy="18" r="1.35" fill="currentColor" stroke="none" />
      <path d="M11 6h7" />
      <path d="M11 12h7" />
      <path d="M11 18h5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 12h8l1-12" />
    </svg>
  );
}
