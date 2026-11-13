import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MarqueeText from "@/components/MarqueeText.jsx";
import { listSongs, messageForSongError } from "@/api/songs.js";

export default function MissingPreviewsPage() {
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const missingPreviews = useMemo(
    () => songs.filter((song) => !String(song.audioArquivo ?? "").trim()),
    [songs],
  );

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
          Pré-visualizações pendentes
        </h1>
      </header>

      <p className="px-4 py-2 text-xs text-ink-soft">
        Ao salvar uma prévia, a música deixa esta lista.
      </p>

      {status === "loading" ? (
        <div className="space-y-2 p-4" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-xl bg-paper" />
          ))}
        </div>
      ) : status === "error" ? (
        <p role="alert" className="px-4 py-10 text-center text-sm text-danger">
          {error}
        </p>
      ) : missingPreviews.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Todas as músicas têm prévia</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
            Não há músicas pendentes para adicionar áudio.
          </p>
        </div>
      ) : (
        <ul>
          {missingPreviews.map((song) => (
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
              <Link
                to={`/musicas/${song.id}/editar?aba=info&returnTo=%2Fadmin%2Fpreviews`}
                aria-label={`Adicionar prévia para ${song.titulo}`}
                className="inline-flex min-h-14 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium text-pine hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
              >
                Adicionar
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
