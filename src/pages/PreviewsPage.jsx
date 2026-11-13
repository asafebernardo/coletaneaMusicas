import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listSongs, messageForSongError, getAudioUrl } from "@/api/songs.js";
import { filterSongs } from "@/lib/songs.js";

export default function PreviewsPage() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [activeSongId, setActiveSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const searchInputRef = useRef(null);
  const previewSongs = useMemo(
    () => filterSongs(songs, query).filter((song) => song.audioArquivo),
    [songs, query],
  );
  const hasPreviews = songs.some((song) => song.audioArquivo);

  useEffect(() => {
    let active = true;
    listSongs()
      .then((data) => {
        if (!active) return;
        setSongs(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(messageForSongError(err));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  const toggleSearch = () => {
    setShowSearch((current) => {
      const next = !current;
      if (!next) setQuery("");
      return next;
    });
  };

  const togglePlayback = (song) => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaybackError("");

    if (activeSongId === song.id) {
      if (audio.paused) {
        audio.play().catch(() => {
          setPlaybackError("Não foi possível reproduzir esta prévia.");
        });
      } else {
        audio.pause();
      }
      return;
    }

    audio.pause();
    audio.src = getAudioUrl(song.audioArquivo);
    audio.load();
    setActiveSongId(song.id);
    setCurrentTime(0);
    setDuration(0);
    audio.play().catch(() => {
      setPlaybackError("Não foi possível reproduzir esta prévia.");
    });
  };

  const seek = (event) => {
    const nextTime = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(nextTime)) return;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to="/mais"
          aria-label="Voltar para Mais+"
          className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          Pré-visualização
        </h1>
        <button
          type="button"
          onClick={toggleSearch}
          aria-expanded={showSearch}
          aria-label={showSearch ? "Fechar pesquisa" : "Pesquisar música"}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8 ${
            showSearch
              ? "bg-white text-pine shadow-sm"
              : "text-white/90 hover:bg-white/15 hover:text-white"
          }`}
        >
          <SearchIcon />
        </button>
      </header>

      {showSearch ? (
        <div className="sticky top-14 z-10 border-b border-line bg-card px-4 py-2.5 shadow-sm landscape-mobile:top-11 landscape-mobile:py-1.5">
          <input
            ref={searchInputRef}
            className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-soft outline-none ring-pine focus:ring-2 landscape-mobile:h-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setShowSearch(false);
                setQuery("");
              }
            }}
            placeholder="Título ou trecho da letra"
            aria-label="Pesquisar prévias por título ou letra"
            type="search"
          />
        </div>
      ) : null}

      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
        }}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;
          if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        className="hidden"
      />

      {status === "loading" ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p className="px-4 py-10 text-center text-sm text-ink-soft">{error}</p>
      ) : previewSongs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">
            {hasPreviews ? "Nenhum resultado" : "Nenhuma prévia disponível"}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            {hasPreviews
              ? "Tente outro título ou trecho da letra."
              : "As músicas com áudio aparecerão aqui."}
          </p>
        </div>
      ) : (
        <ul>
          {previewSongs.map((song) => {
            const active = activeSongId === song.id;
            return (
              <li key={song.id} className="border-b border-line/80 px-4 py-2.5 last:border-b-0">
                <div className="flex min-h-11 items-center gap-3">
                  <span className="w-[3ch] shrink-0 text-right text-sm font-medium tabular-nums">
                    {String(song.numero).padStart(3, "0")}
                  </span>
                  <span aria-hidden className="w-px self-stretch bg-ink-soft/35" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                    {song.titulo}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePlayback(song)}
                    aria-label={`${active && isPlaying ? "Pausar" : "Reproduzir"} prévia de ${song.titulo}`}
                    aria-pressed={active && isPlaying}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-pine hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
                  >
                    {active && isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </div>
                {active ? (
                  <div className="mt-1 flex items-center gap-2 pl-[calc(3ch+1rem)] text-xs text-ink-soft">
                    <span className="w-9 shrink-0 text-right font-mono tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={Math.min(currentTime, duration || 0)}
                      onChange={seek}
                      disabled={!duration}
                      aria-label={`Linha do tempo da prévia de ${song.titulo}`}
                      className="h-5 min-w-0 flex-1 accent-pine disabled:opacity-50"
                    />
                    <span className="w-9 shrink-0 font-mono tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {playbackError ? (
        <p role="alert" className="px-4 py-2 text-sm text-danger">
          {playbackError}
        </p>
      ) : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="currentColor">
      <path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11-7.2a.8.8 0 0 0 0-1.4l-11-7.2a.8.8 0 0 0-1.2.7Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="currentColor">
      <rect x="6" y="4" width="4.5" height="16" rx="1" />
      <rect x="13.5" y="4" width="4.5" height="16" rx="1" />
    </svg>
  );
}
