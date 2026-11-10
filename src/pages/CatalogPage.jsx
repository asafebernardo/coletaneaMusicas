import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listSongs, messageForSongError } from "@/api/songs.js";
import MarqueeText from "@/components/MarqueeText.jsx";
import ThemeButton from "@/components/ThemeButton.jsx";
import { filterSongs, lyricExcerpt } from "@/lib/songs.js";

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

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

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-card/95 px-4 py-3 backdrop-blur landscape-mobile:flex landscape-mobile:items-center landscape-mobile:gap-3 landscape-mobile:py-2">
        <div className="relative z-20 flex items-center gap-2 landscape-mobile:shrink-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight landscape-mobile:text-base">
              Coletâneas de Louvor
            </h1>
          </div>
          <ThemeButton />
          <Link
            to="/musicas/nova"
            className="inline-flex h-9 items-center rounded-full bg-pine px-3 text-sm font-medium text-white hover:bg-pine-dark landscape-mobile:h-8"
          >
            Nova
          </Link>
        </div>
        <input
          className="mt-3 h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm outline-none ring-pine focus:ring-2 landscape-mobile:mt-0 landscape-mobile:h-9 landscape-mobile:flex-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Número, título ou letra"
          aria-label="Pesquisar música"
          type="search"
        />
      </header>

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
              ? "A coletânea começa com o catálogo local. Inclua a primeira letra em Nova."
              : "Tente outro número, título ou trecho da letra."}
          </p>
        </div>
      ) : (
        <ul>
          {filtered.map((song) => (
            <li key={song.id} className="border-b border-line/80 last:border-b-0">
              <Link
                to={`/musicas/${song.id}`}
                className="flex min-h-14 min-w-0 items-stretch gap-3 px-4 py-3 hover:bg-paper"
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
