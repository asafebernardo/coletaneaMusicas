import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MarqueeText from "@/components/MarqueeText.jsx";
import { listSongs, messageForSongError } from "@/api/songs.js";
import { filterSongs } from "@/lib/songs.js";
import { useSongThemes } from "@/lib/songThemes.js";

export default function SongThemeAddPage() {
  const { themeId } = useParams();
  const { themes, error: themeError, isReady, addSong, removeSong } = useSongThemes();
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const theme = themes.find((item) => item.id === themeId);
  const includedIds = useMemo(() => new Set(theme?.songIds || []), [theme?.songIds]);
  const filteredSongs = useMemo(() => filterSongs(songs, query), [songs, query]);

  useEffect(() => {
    let active = true;
    listSongs()
      .then((data) => {
        if (!active) return;
        setSongs(Array.isArray(data) ? data : []);
        setStatus("ready");
      })
      .catch((loadError) => {
        if (!active) return;
        setError(messageForSongError(loadError));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleSong = (song) => {
    if (!theme) return;
    if (includedIds.has(Number(song.id))) {
      removeSong(theme.id, song.id);
    } else {
      addSong(theme.id, song.id);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to={`/temas/${encodeURIComponent(themeId)}`}
          aria-label={`Voltar para o tema ${theme?.name || ""}`}
          className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          Adicionar músicas
        </h1>
      </header>

      {themeError ? (
        <p role="alert" className="px-4 py-2 text-sm text-danger">
          {themeError}
        </p>
      ) : null}

      {!isReady ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : !theme ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Tema não encontrado</p>
          <Link to="/temas" className="mt-3 inline-block text-sm font-medium text-pine underline">
            Voltar para Temas
          </Link>
        </div>
      ) : status === "loading" ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p role="alert" className="px-4 py-10 text-center text-sm text-danger">
          {error}
        </p>
      ) : songs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Nenhuma música disponível</p>
        </div>
      ) : (
        <>
          <div className="sticky top-14 z-10 border-b border-line bg-card px-4 py-2.5 shadow-sm landscape-mobile:top-11 landscape-mobile:py-1.5">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar por título ou letra"
              aria-label="Pesquisar músicas por título ou letra"
              type="search"
              className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-soft outline-none ring-pine focus:ring-2 landscape-mobile:h-9"
            />
          </div>
          {filteredSongs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-medium">Nenhuma música encontrada</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
                Tente outro título ou trecho da letra.
              </p>
            </div>
          ) : (
            <ul>
              {filteredSongs.map((song) => {
                const isAdded = includedIds.has(Number(song.id));
                return (
                  <li
                    key={song.id}
                    className="flex min-w-0 items-stretch border-b border-line/80 px-2 last:border-b-0"
                  >
                    <div className="flex min-h-14 min-w-0 flex-1 items-stretch gap-3 px-2 py-3">
                      <span className="flex w-[3ch] shrink-0 items-center justify-end self-center text-[15px] font-medium tabular-nums">
                        {String(song.numero).padStart(3, "0")}
                      </span>
                      <span aria-hidden className="w-px shrink-0 bg-ink-soft/35" />
                      <span className="flex min-w-0 flex-1 items-center">
                        <MarqueeText text={song.titulo} className="text-[15px] font-medium" />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSong(song)}
                      aria-pressed={isAdded}
                      aria-label={
                        isAdded
                          ? `Remover ${song.titulo} do tema ${theme.name}`
                          : `Adicionar ${song.titulo} ao tema ${theme.name}`
                      }
                      title={isAdded ? "Remover do tema" : "Adicionar ao tema"}
                      className={`inline-flex min-h-14 w-12 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                        isAdded
                          ? "text-pine hover:bg-danger-soft hover:text-danger"
                          : "text-ink-soft hover:bg-paper hover:text-pine"
                      }`}
                    >
                      {isAdded ? <AddedIcon /> : <PlusIcon />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function AddedIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}
