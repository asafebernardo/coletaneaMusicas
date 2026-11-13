import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteSong, getAudioUrl, getSong, messageForSongError } from "@/api/songs.js";
import FavoriteButton from "@/components/FavoriteButton.jsx";
import Lyrics from "@/components/Lyrics.jsx";
import MarqueeText from "@/components/MarqueeText.jsx";
import SongScroll from "@/components/SongScroll.jsx";
import TransposeBar from "@/components/TransposeBar.jsx";
import {
  detectSongKey,
  songHasChords,
  transposeChordLines,
  transposeKeyLabel,
} from "@/lib/chords.js";
import {
  canManageSongs,
  fontLimits,
  readDefaultSongView,
  readFontSize,
  readShowChronological,
  writeFontSize,
  writeShowChronological,
} from "@/lib/songs.js";
import { useFavorites } from "@/lib/favorites.js";
import { getAccentHex, useAccent, useTheme } from "@/lib/theme.js";
import { songHasVoices } from "@/lib/voices.js";

const barItem =
  "flex h-14 landscape-mobile:h-10 flex-col landscape-mobile:flex-row items-center justify-center gap-0.5 landscape-mobile:gap-1.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine";
const barOn = "text-pine";
const barOff = "text-ink-soft hover:text-ink";

export default function SongPage() {
  const canManage = canManageSongs();
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const idOk = Number.isInteger(numericId);
  const [song, setSong] = useState(null);
  const [status, setStatus] = useState(idOk ? "loading" : "missing");
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState(readFontSize);
  const [showChronological, setShowChronological] = useState(readShowChronological);
  const [showVoices, setShowVoices] = useState(false);
  const [showChords, setShowChords] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transpose, setTranspose] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const { favoriteIds, favoriteError, toggleFavorite } = useFavorites();
  const audioRef = useRef(null);
  const timelineRef = useRef(null);
  const seekingRef = useRef(false);
  const theme = useTheme();
  const accent = useAccent();
  const activeColor = getAccentHex(theme, accent);
  const hasAudio = Boolean(song?.audioArquivo);
  const isFavorite = favoriteIds.includes(Number(song?.id));
  const audioUrl = hasAudio ? getAudioUrl(song.audioArquivo) : "";
  const progressPercent =
    audioDuration > 0 ? Math.min(100, Math.max(0, (audioTime / audioDuration) * 100)) : 0;
  const hasVoices = songHasVoices(song);
  const lockLyricsToVoices = hasVoices && Boolean(song?.somenteVozes);
  const activeVoices = (showVoices || lockLyricsToVoices) && !showChords;
  const hasChords = songHasChords(song);
  const currentView =
    showChords && hasChords ? "Cifra" : activeVoices ? "Vozes" : "Letra";
  const hasChronology = Boolean(song?.cronologica) && Boolean(String(song?.refrao || "").trim());
  const baseKey = detectSongKey(song?.cifraLetra, song?.cifraRefrao);
  const currentKey =
    transpose === 0
      ? baseKey
      : selectedKey || (baseKey ? transposeKeyLabel(baseKey, transpose) : "");
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
        const defaultView = readDefaultSongView();
        const hasSongVoices = songHasVoices(data);
        const hasSongChords = songHasChords(data);
        setShowVoices(
          hasSongVoices &&
            (defaultView === "vozes" || Boolean(data?.somenteVozes)),
        );
        setShowChords(defaultView === "cifra" && hasSongChords);
        setShowSettings(false);
        setTranspose(0);
        setSelectedKey("");
        setIsPlaying(false);
        setShowTimeline(false);
        setAudioTime(0);
        setAudioDuration(0);
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

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const seekToClientX = (clientX) => {
    const bar = timelineRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !bar.clientWidth) return;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : audioDuration;
    if (!duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const nextTime = ratio * duration;
    audio.currentTime = nextTime;
    setAudioTime(nextTime);
  };

  const handleTimelinePointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    seekingRef.current = true;
    seekToClientX(event.clientX);
  };

  const handleTimelinePointerMove = (event) => {
    if (!seekingRef.current) return;
    seekToClientX(event.clientX);
  };

  const handleTimelinePointerUp = (event) => {
    if (!seekingRef.current) return;
    seekingRef.current = false;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleTimelineKeyDown = (event) => {
    const audio = audioRef.current;
    if (!audio) return;
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : audioDuration;
    if (!duration) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = Math.min(duration, audio.currentTime + 5);
      audio.currentTime = next;
      setAudioTime(next);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = Math.max(0, audio.currentTime - 5);
      audio.currentTime = next;
      setAudioTime(next);
    }
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
      <header className="relative z-20 flex h-14 shrink-0 items-center border-b border-pine-dark bg-pine px-2 text-white shadow-sm landscape-mobile:h-11">
        <div className="flex w-full items-center gap-1">
          <Link
            to="/"
            className="inline-flex h-10 w-10 landscape-mobile:h-8 landscape-mobile:w-8 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Voltar à lista"
          >
            <span aria-hidden className="text-xl leading-none">
              ‹
            </span>
          </Link>
          <div className="min-w-0 flex-1 px-1">
            {song ? (
              <h1 className="flex min-h-6 min-w-0 items-stretch gap-3 text-white">
                <span className="flex w-[3ch] shrink-0 items-center justify-end text-base font-semibold tabular-nums leading-tight">
                  {String(song.numero).padStart(3, "0")}
                </span>
                <span aria-hidden className="w-px shrink-0 self-stretch bg-white/35" />
                <span className="flex min-w-0 flex-1 items-center">
                  <MarqueeText text={song.titulo} className="text-base font-semibold leading-tight" />
                </span>
              </h1>
            ) : (
              <p className="text-sm font-medium text-white">Coletânea</p>
            )}
          </div>
          {song ? (
            <FavoriteButton
              favorite={isFavorite}
              onToggle={() => toggleFavorite(song.id)}
              variant="header"
            />
          ) : null}
          {hasAudio ? (
            <button
              type="button"
              onClick={() => {
                setShowTimeline((current) => {
                  const next = !current;
                  if (!next && audioRef.current && !audioRef.current.paused) {
                    audioRef.current.pause();
                  }
                  return next;
                });
              }}
              aria-expanded={showTimeline}
              aria-label={showTimeline ? "Ocultar player de áudio" : "Abrir player de áudio"}
              className={`inline-flex h-10 w-10 landscape-mobile:h-8 landscape-mobile:w-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                showTimeline
                  ? "bg-white text-pine shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              <MusicNoteIcon />
            </button>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Demonstração de áudio indisponível"
              className="inline-flex h-10 w-10 landscape-mobile:h-8 landscape-mobile:w-8 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-white/35"
            >
              <MusicNoteIcon />
            </button>
          )}
          {hasAudio ? (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onLoadedMetadata={(event) => {
                const dur = event.currentTarget.duration;
                if (Number.isFinite(dur) && dur > 0) setAudioDuration(dur);
              }}
              onDurationChange={(event) => {
                const dur = event.currentTarget.duration;
                if (Number.isFinite(dur) && dur > 0) setAudioDuration(dur);
              }}
              onTimeUpdate={(event) => {
                if (!seekingRef.current) {
                  setAudioTime(event.currentTarget.currentTime);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setAudioTime(0);
              }}
              className="hidden"
            />
          ) : null}
        </div>
      </header>

      {hasAudio && showTimeline ? (
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-card px-3 py-2 landscape-mobile:py-1.5">
          <button
            type="button"
            onClick={toggleAudio}
            aria-pressed={isPlaying}
            aria-label={isPlaying ? "Parar demonstração" : "Reproduzir demonstração"}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine text-white shadow-sm transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
          >
            {isPlaying ? <StopIcon /> : <PlayIcon />}
          </button>

          <div
            ref={timelineRef}
            role="slider"
            tabIndex={0}
            aria-label="Linha do tempo da música"
            aria-valuemin={0}
            aria-valuemax={Math.round(audioDuration || 0)}
            aria-valuenow={Math.round(audioTime || 0)}
            onPointerDown={handleTimelinePointerDown}
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
            onPointerCancel={handleTimelinePointerUp}
            onKeyDown={handleTimelineKeyDown}
            className="group relative flex h-6 flex-1 cursor-pointer touch-none select-none items-center focus-visible:outline-none"
          >
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-line transition-[height] group-hover:h-3 group-active:h-3">
              <div
                className="h-full rounded-full bg-pine"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      <SongScroll
        onContentClick={() => {
          setShowSettings(false);
          setConfirmDelete(false);
        }}
      >
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
            letraVozes={song.letraVozes}
            vozesArranjo={song.vozesArranjo}
            cifraLetra={cifraLetraView}
            cifraRefrao={cifraRefraoView}
            cronologica={Boolean(song.cronologica) && showChronological}
            refraoPrimeiro={Boolean(song.refraoPrimeiro)}
            showVoices={activeVoices}
            showChords={showChords && hasChords}
            fontSize={fontSize}
          />
        )}

        {error && status === "ready" ? (
          <p className="px-4 pb-4 text-sm text-danger">{error}</p>
        ) : null}
        {favoriteError ? (
          <p role="alert" className="px-4 pb-4 text-sm text-danger">
            {favoriteError}
          </p>
        ) : null}
      </SongScroll>

      <div className="relative shrink-0">
      {canManage && confirmDelete ? (
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

      {canManage && song ? (
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

      <div className="relative">
      {song && showChords && hasChords ? (
        <TransposeBar
          cifraLetra={song.cifraLetra}
          cifraRefrao={song.cifraRefrao}
          semitones={transpose}
          selectedKey={selectedKey}
          onChange={(nextSemitones, nextKey = "") => {
            setTranspose(nextSemitones);
            setSelectedKey(nextSemitones === 0 ? "" : nextKey);
          }}
        />
      ) : null}

      {song && showSettings ? (
        <div
          id="song-settings-menu"
          role="region"
          aria-label="Menu de configuração"
          className="absolute inset-x-0 bottom-full z-30 mb-2 max-h-[70dvh] space-y-3 overflow-y-auto border border-line bg-card px-4 py-3 shadow-lg landscape-mobile:max-h-[48dvh] landscape-mobile:space-y-2 landscape-mobile:py-2"
        >
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-ink-soft">Visualização da música</span>
            <div
              className="grid grid-cols-3 rounded-xl border border-line bg-paper p-0.5"
              role="group"
              aria-label="Visualização da música"
            >
              <button
                type="button"
                disabled={lockLyricsToVoices}
                aria-pressed={!showChords && !activeVoices}
                onClick={() => {
                  setShowChords(false);
                  setShowVoices(false);
                  setTranspose(0);
                  setSelectedKey("");
                }}
                className={`h-9 rounded-lg px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-40 ${
                  !showChords && !activeVoices
                    ? "bg-card text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Letra
              </button>
              <button
                type="button"
                disabled={!hasVoices}
                aria-pressed={activeVoices}
                onClick={() => {
                  setShowChords(false);
                  setTranspose(0);
                  setSelectedKey("");
                  setShowVoices(true);
                }}
                className={`h-9 rounded-lg px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-40 ${
                  activeVoices ? "bg-card text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                }`}
              >
                Vozes
              </button>
              <button
                type="button"
                disabled={!hasChords}
                aria-pressed={showChords}
                onClick={() => {
                  setShowChords(true);
                  setShowVoices(false);
                }}
                className={`h-9 rounded-lg px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-40 ${
                  showChords ? "bg-card text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                }`}
              >
                Cifra
              </button>
            </div>
          </div>

          {/* Tamanho da letra */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-ink-soft">Tamanho da letra</span>
            <div
              className="inline-flex h-8 items-center rounded-full border border-line bg-paper p-0.5"
              role="group"
              aria-label="Tamanho da letra"
            >
              <button
                type="button"
                className="inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold text-ink hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Diminuir letra"
                disabled={fontSize <= fontLimits.min}
                onClick={() => changeFont(-2)}
              >
                A−
              </button>
              <span className="min-w-[2.75rem] text-center font-mono text-xs font-medium text-ink-soft tabular-nums">
                {fontSize}px
              </span>
              <button
                type="button"
                className="inline-flex h-7 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold text-ink hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Aumentar letra"
                disabled={fontSize >= fontLimits.max}
                onClick={() => changeFont(2)}
              >
                A+
              </button>
            </div>
          </div>

          {/* Cronologia */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-xs font-medium text-ink-soft">Cronologia</span>
              <span className="block truncate text-[11px] text-ink-soft/75">
                {hasChronology
                  ? "Repetir refrão depois de cada estrofe"
                  : "Esta música não possui refrão cronológico"}
              </span>
            </div>
            <div
              className="inline-flex h-8 shrink-0 items-center rounded-full border border-line bg-paper p-0.5"
              role="group"
              aria-label="Ordem cronológica"
            >
              <button
                type="button"
                disabled={!hasChronology}
                aria-pressed={hasChronology && showChronological}
                onClick={() => {
                  setShowChronological(true);
                  writeShowChronological(true);
                }}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-40 ${
                  hasChronology && showChronological
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Ativada
              </button>
              <button
                type="button"
                disabled={!hasChronology}
                aria-pressed={!hasChronology || !showChronological}
                onClick={() => {
                  setShowChronological(false);
                  writeShowChronological(false);
                }}
                className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-40 ${
                  hasChronology && !showChronological
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Desativada
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {song ? (
        <nav
          aria-label="Controles da música"
          data-accent={accent}
          className="grid shrink-0 grid-cols-2 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
        >
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Visualização atual: ${currentView}`}
            className={`${barItem} text-pine`}
            style={{ color: activeColor }}
          >
            {currentView === "Cifra" ? (
              <ChordIcon />
            ) : currentView === "Vozes" ? (
              <VoicesPartsIcon />
            ) : (
              <LyricIcon />
            )}
            {currentView}
          </div>
          <button
            type="button"
            className={`${barItem} ${showSettings ? barOn : barOff}`}
            style={showSettings ? { color: activeColor } : undefined}
            aria-pressed={showSettings}
            aria-expanded={showSettings}
            aria-controls="song-settings-menu"
            aria-label="Configuração"
            onClick={() => setShowSettings((current) => !current)}
          >
            <SettingsIcon />
            Configuração
          </button>
        </nav>
      ) : null}
      </div>
      </div>
    </div>
  );
}

function LyricIcon() {
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
      <path d="M5 7h14" />
      <path d="M7 12h10" />
      <path d="M6 17h12" />
    </svg>
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

function SettingsIcon() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
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

function MusicNoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="currentColor">
      <polygon points="8,5.5 18.5,12 8,18.5" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5 shrink-0" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1.8" />
    </svg>
  );
}
