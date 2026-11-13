import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSongThemes } from "@/lib/songThemes.js";

export default function SongThemesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const nameInputRef = useRef(null);
  const { themes, error, isReady, createTheme } = useSongThemes();

  useEffect(() => {
    if (showCreate) nameInputRef.current?.focus();
  }, [showCreate]);

  const submitTheme = (event) => {
    event.preventDefault();
    if (createTheme(name)) {
      setName("");
      setShowCreate(false);
    }
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
          Temas
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate((current) => !current)}
          aria-expanded={showCreate}
          aria-label={showCreate ? "Fechar criação de tema" : "Criar tema"}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8 ${
            showCreate
              ? "bg-white text-pine shadow-sm"
              : "text-white/90 hover:bg-white/15 hover:text-white"
          }`}
        >
          <PlusIcon />
        </button>
      </header>

      {showCreate ? (
        <form
          onSubmit={submitTheme}
          className="space-y-3 border-b border-line bg-card p-4"
        >
          <label htmlFor="song-theme-name" className="block text-sm font-medium text-ink">
            Nome do tema
          </label>
          <input
            ref={nameInputRef}
            id="song-theme-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Ex.: Páscoa, Gratidão..."
            className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink placeholder:text-ink-soft outline-none ring-pine focus:ring-2"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setName("");
                setShowCreate(false);
              }}
              className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="inline-flex h-9 items-center rounded-full bg-pine px-4 text-sm font-semibold text-white hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-50"
            >
              Criar tema
            </button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p role="alert" className="px-4 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!isReady ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Nenhum tema criado</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            Toque em + para criar um tema e organizar músicas.
          </p>
        </div>
      ) : (
        <ul>
          {themes.map((theme) => (
            <li key={theme.id} className="border-b border-line/80 last:border-b-0">
              <Link
                to={`/temas/${encodeURIComponent(theme.id)}`}
                className="flex min-h-14 w-full min-w-0 items-stretch gap-3 px-4 py-3 text-left hover:bg-paper"
              >
                <span className="flex w-[3ch] shrink-0 items-center justify-center self-center text-pine">
                  <CollectionIcon />
                </span>
                <span aria-hidden className="w-px shrink-0 bg-ink-soft/35" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {theme.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs leading-snug text-ink-soft">
                      {theme.songIds.length}{" "}
                      {theme.songIds.length === 1 ? "música" : "músicas"}
                    </span>
                  </span>
                  <span aria-hidden className="text-lg leading-none text-ink-soft">
                    ›
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

function CollectionIcon() {
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
      <path d="M4 5.5h16M4 12h16M4 18.5h16" />
      <circle cx="7" cy="5.5" r="1" fill="currentColor" />
      <circle cx="7" cy="12" r="1" fill="currentColor" />
      <circle cx="7" cy="18.5" r="1" fill="currentColor" />
    </svg>
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
