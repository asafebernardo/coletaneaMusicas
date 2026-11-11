import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listSongs, messageForSongError } from "@/api/songs.js";
import MarqueeText from "@/components/MarqueeText.jsx";
import { groupSongs, splitLabels } from "@/lib/songs.js";

const CATEGORY_OPTIONS = [
  {
    id: "temas",
    label: "Temas",
    description: "Músicas agrupadas por tema",
    pick: (song) => splitLabels(song.tema),
    icon: ThemesIcon,
  },
  {
    id: "autores",
    label: "Autores",
    description: "Músicas agrupadas por compositor",
    pick: (song) => splitLabels(song.compositor),
    icon: AuthorsIcon,
  },
  {
    id: "data-lancamento",
    label: "Data de Lançamento",
    description: "Músicas agrupadas por ano de lançamento",
    pick: (song) => splitLabels(song.anoLancamento),
    icon: CalendarIcon,
  },
  {
    id: "album",
    label: "Álbum",
    description: "Músicas agrupadas por álbum",
    pick: (song) => splitLabels(song.album),
    icon: AlbumIcon,
  },
];

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("tipo") || "";
  const activeCategory = CATEGORY_OPTIONS.find((item) => item.id === activeType) || null;

  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [openGroup, setOpenGroup] = useState("");

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

  const groupsByCategory = useMemo(() => {
    const result = {};
    for (const option of CATEGORY_OPTIONS) {
      result[option.id] = groupSongs(songs, option.pick);
    }
    return result;
  }, [songs]);

  const selectCategory = (id) => {
    setOpenGroup("");
    setSearchParams({ tipo: id });
  };

  const clearCategory = () => {
    setOpenGroup("");
    setSearchParams({});
  };

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-pine-dark bg-pine px-4 py-3 text-white shadow-sm landscape-mobile:py-2">
        <div className="flex items-center gap-2">
          {activeCategory ? (
            <button
              type="button"
              onClick={clearCategory}
              aria-label="Voltar para categorias"
              className="inline-flex h-9 w-9 -ml-1.5 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span aria-hidden className="text-xl leading-none">
                ‹
              </span>
            </button>
          ) : null}
          <h1 className="text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
            {activeCategory ? activeCategory.label : "Categorias"}
          </h1>
        </div>
      </header>

      {!activeCategory ? (
        <ul>
          {CATEGORY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const count = groupsByCategory[option.id]?.length ?? 0;
            return (
              <li key={option.id} className="border-b border-line/80 last:border-b-0">
                <button
                  type="button"
                  onClick={() => selectCategory(option.id)}
                  className="flex min-h-14 w-full min-w-0 items-stretch gap-3 px-4 py-3 text-left hover:bg-paper"
                >
                  <span className="flex w-[3ch] shrink-0 items-center justify-center self-center text-pine">
                    <Icon />
                  </span>
                  <span aria-hidden className="w-px shrink-0 bg-ink-soft/35" />
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs leading-snug text-ink-soft">
                        {option.description}
                      </span>
                    </span>
                    <span aria-hidden className="text-lg leading-none text-ink-soft">
                      ›
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : status === "loading" ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p className="px-4 py-10 text-center text-sm text-ink-soft">{error}</p>
      ) : (groupsByCategory[activeCategory.id] ?? []).length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Nenhum item em {activeCategory.label}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            As músicas cadastradas com esta informação aparecerão agrupadas aqui.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line/80">
          {groupsByCategory[activeCategory.id].map((group) => {
            const expanded = openGroup === group.label;
            return (
              <li key={group.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenGroup(expanded ? "" : group.label)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-paper"
                >
                  <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                    {group.label}
                  </span>
                  <span className="shrink-0 rounded-full border border-line bg-paper px-2.5 py-0.5 text-xs font-medium text-ink-soft tabular-nums">
                    {group.songs.length}
                  </span>
                </button>
                {expanded ? (
                  <ul className="border-t border-line/60 bg-paper/45">
                    {group.songs.map((song) => (
                      <li key={song.id} className="border-b border-line/50 last:border-b-0">
                        <Link
                          to={`/musicas/${song.id}`}
                          className="flex min-h-12 min-w-0 items-stretch gap-3 px-5 py-2.5 hover:bg-paper"
                        >
                          <span className="flex w-[3ch] shrink-0 items-center justify-end self-center text-sm font-medium tabular-nums text-ink-soft">
                            {String(song.numero).padStart(3, "0")}
                          </span>
                          <span aria-hidden className="w-px shrink-0 bg-ink-soft/30" />
                          <span className="flex min-w-0 flex-1 items-center">
                            <MarqueeText text={song.titulo} className="text-sm font-medium" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ThemesIcon() {
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
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AuthorsIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
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
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function AlbumIcon() {
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
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
