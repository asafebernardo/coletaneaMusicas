import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarqueeText from "@/components/MarqueeText.jsx";
import { listSongs, messageForSongError } from "@/api/songs.js";
import { filterSongs } from "@/lib/songs.js";
import { useSongThemes } from "@/lib/songThemes.js";

export default function SongThemePage() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const {
    themes,
    error: themeError,
    isReady,
    renameTheme,
    deleteTheme,
    removeSong,
  } = useSongThemes();
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editInputRef = useRef(null);
  const theme = themes.find((item) => item.id === themeId);
  const themeSongIds = theme?.songIds || [];
  const includedIds = useMemo(() => new Set(themeSongIds), [themeSongIds]);
  const themeSongs = useMemo(
    () => filterSongs(songs, "").filter((song) => includedIds.has(Number(song.id))),
    [includedIds, songs],
  );

  useEffect(() => {
    if (showEdit) editInputRef.current?.focus();
  }, [showEdit]);

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

  const removeSongFromCurrentTheme = (songId) => {
    if (theme) removeSong(theme.id, songId);
  };

  const saveThemeName = (event) => {
    event.preventDefault();
    if (theme && renameTheme(theme.id, editedName)) setShowEdit(false);
  };

  const removeCurrentTheme = () => {
    if (theme && deleteTheme(theme.id)) navigate("/temas", { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to="/temas"
          aria-label="Voltar para Temas"
          className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          {theme?.name || "Tema"}
        </h1>
        {theme ? (
          <>
            <button
              type="button"
              onClick={() => {
                setEditedName(theme.name);
                setConfirmDelete(false);
                setShowEdit((current) => !current);
              }}
              aria-label="Editar nome do tema"
              title="Editar nome"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEdit(false);
                setConfirmDelete((current) => !current);
              }}
              aria-label="Remover tema"
              title="Remover tema"
              aria-expanded={confirmDelete}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
            >
              <TrashIcon />
            </button>
            <Link
              to={`/temas/${encodeURIComponent(theme.id)}/adicionar`}
              aria-label="Adicionar músicas ao tema"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
            >
              <PlusIcon />
            </Link>
          </>
        ) : null}
      </header>

      {theme && showEdit ? (
        <form onSubmit={saveThemeName} className="space-y-3 border-b border-line bg-card p-4">
          <label htmlFor="edit-theme-name" className="block text-sm font-medium text-ink">
            Nome do tema
          </label>
          <input
            ref={editInputRef}
            id="edit-theme-name"
            value={editedName}
            onChange={(event) => setEditedName(event.target.value)}
            maxLength={80}
            className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none ring-pine focus:ring-2"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!editedName.trim()}
              className="inline-flex h-9 items-center rounded-full bg-pine px-4 text-sm font-semibold text-white hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-50"
            >
              Salvar nome
            </button>
          </div>
        </form>
      ) : null}

      {theme && confirmDelete ? (
        <section
          aria-label="Confirmar remoção do tema"
          className="border-b border-line bg-card px-4 py-3"
        >
          <p className="text-sm text-ink">
            Remover o tema <strong>{theme.name}</strong>? As músicas do catálogo não serão apagadas.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={removeCurrentTheme}
              className="inline-flex h-9 items-center rounded-full bg-danger px-4 text-sm font-semibold text-white hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              Remover tema
            </button>
          </div>
        </section>
      ) : null}

      {themeError ? (
        <p role="alert" className="px-4 py-2 text-sm text-danger">
          {themeError}
        </p>
      ) : null}

      {!isReady ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
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
      ) : (
        <>
          {status === "loading" ? (
            <div className="space-y-2 p-4" aria-hidden>
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
              ))}
            </div>
          ) : status === "error" ? (
            <p role="alert" className="px-4 py-10 text-center text-sm text-danger">
              {error}
            </p>
          ) : themeSongs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-medium">Nenhuma música neste tema</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
                Toque em + para adicionar músicas. Uma música pode estar em vários temas.
              </p>
            </div>
          ) : (
            <ul>
              {themeSongs.map((song) => (
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
                      <MarqueeText text={song.titulo} className="text-[15px] font-medium" />
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSongFromCurrentTheme(song.id)}
                    aria-label={`Remover ${song.titulo} do tema ${theme.name}`}
                    title="Remover do tema"
                    className="inline-flex min-h-14 shrink-0 items-center justify-center px-3 text-ink-soft hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
                  >
                    <RemoveIcon />
                  </button>
                </li>
              ))}
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

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />
    </svg>
  );
}

function RemoveIcon() {
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
      <path d="M8 12h8" />
    </svg>
  );
}
