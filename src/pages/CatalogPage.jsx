import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listSongs, messageForSongError } from "@/api/songs.js";
import FavoriteButton from "@/components/FavoriteButton.jsx";
import MarqueeText from "@/components/MarqueeText.jsx";
import { useFavorites } from "@/lib/favorites.js";
import { canManageSongs, filterSongs, lyricExcerpt } from "@/lib/songs.js";

export default function CatalogPage() {
  const canManage = canManageSongs();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const searchInputRef = useRef(null);
  const { favoriteIds, favoriteError, toggleFavorite } = useFavorites();

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

  const filtered = useMemo(() => filterSongs(songs, query), [songs, query]);

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  const toggleSearch = () => {
    setShowSearch((current) => {
      const next = !current;
      if (!next) setQuery("");
      return next;
    });
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
            Coletânea de Louvor
          </h1>
        </div>
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
            placeholder="Número, título ou letra"
            aria-label="Pesquisar música"
            type="search"
          />
        </div>
      ) : null}

      {favoriteError ? (
        <p role="alert" className="px-4 py-2 text-sm text-danger">
          {favoriteError}
        </p>
      ) : null}
      {status === "loading" ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p className="px-4 py-10 text-center text-sm text-ink-soft">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">
            {songs.length === 0 ? "Nenhuma música ainda" : "Nenhum resultado"}
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            {songs.length === 0
              ? canManage
                ? "A coletânea começa com o catálogo local. Inclua a primeira letra em Nova."
                : "Nenhuma música disponível no catálogo."
              : "Tente outro número, título ou trecho da letra."}
          </p>
        </div>
      ) : (
        <ul>
          {filtered.map((song) => (
            <li
              key={song.id}
              className="flex min-w-0 items-stretch border-b border-line/80 px-2 last:border-b-0"
            >
              <Link
                to={`/musicas/${song.id}`}
                className="flex min-h-14 min-w-0 flex-1 items-stretch gap-3 px-2 py-3 hover:bg-paper"
              >
                <span className="flex w-[3ch] shrink-0 items-center justify-end self-center text-[15px] font-medium tabular-nums">
                  {String(song.numero).padStart(3, "0")}
                </span>
                <span aria-hidden className="w-px shrink-0 bg-ink-soft/35" />
                <span className="flex min-w-0 flex-1 items-center">
                  <span className="min-w-0 flex-1">
                    <MarqueeText text={song.titulo} className="text-[15px] font-medium" />
                    <LyricExcerpt song={song} query={query} />
                  </span>
                </span>
              </Link>
              <FavoriteButton
                favorite={favoriteIds.includes(Number(song.id))}
                onToggle={() => toggleFavorite(song.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function LyricExcerpt({ song, query }) {
  const excerpt = lyricExcerpt(song, query);
  if (!excerpt) return null;
  return (
    <p className="mt-0.5 truncate text-xs leading-snug text-ink-soft">
      {excerpt.before}
      <span className="font-medium text-ink">{excerpt.match}</span>
      {excerpt.after}
    </p>
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
