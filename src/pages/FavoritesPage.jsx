import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton.jsx";
import MarqueeText from "@/components/MarqueeText.jsx";
import { listSongs, messageForSongError } from "@/api/songs.js";
import { useFavorites } from "@/lib/favorites.js";
import { filterSongs } from "@/lib/songs.js";

export default function FavoritesPage() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const searchInputRef = useRef(null);
  const { favoriteIds, favoriteError, toggleFavorite } = useFavorites();
  const allFavoriteSongs = useMemo(() => {
    const ids = new Set(favoriteIds);
    return songs.filter((song) => ids.has(Number(song.id)));
  }, [favoriteIds, songs]);
  const favoriteSongs = useMemo(() => {
    const ids = new Set(favoriteIds);
    return filterSongs(songs, query).filter((song) => ids.has(Number(song.id)));
  }, [favoriteIds, query, songs]);

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
          Favoritos
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
            aria-label="Pesquisar favoritos por título ou letra"
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
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p className="px-4 py-10 text-center text-sm text-ink-soft">{error}</p>
      ) : allFavoriteSongs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Nenhuma música favorita</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            Marque uma música com o ícone de coração para encontrá-la aqui.
          </p>
        </div>
      ) : favoriteSongs.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Nenhum resultado</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            Tente outro título ou trecho da letra.
          </p>
        </div>
      ) : (
        <ul>
          {favoriteSongs.map((song) => (
            <li key={song.id} className="flex min-w-0 items-stretch border-b border-line/80 px-2 last:border-b-0">
              <Link
                to={`/musicas/${song.id}`}
                className="flex min-h-14 min-w-0 flex-1 items-stretch gap-3 px-2 py-3 hover:bg-paper"
              >
                <span className="flex w-[3ch] shrink-0 items-center justify-end self-center text-[15px] font-medium tabular-nums">
                  {String(song.numero).padStart(3, "0")}
                </span>
                <span aria-hidden className="w-px shrink-0 bg-ink-soft/35" />
                <span className="flex min-w-0 flex-1 items-center">
                  <MarqueeText text={song.titulo} className="text-[15px] font-medium" />
                </span>
              </Link>
              <FavoriteButton
                favorite
                onToggle={() => toggleFavorite(song.id)}
              />
            </li>
          ))}
        </ul>
      )}
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
