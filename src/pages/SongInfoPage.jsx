import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSong, messageForSongError } from "@/api/songs.js";
import MarqueeText from "@/components/MarqueeText.jsx";
import SongScroll from "@/components/SongScroll.jsx";

export default function SongInfoPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const idOk = Number.isInteger(numericId);
  const [song, setSong] = useState(null);
  const [status, setStatus] = useState(idOk ? "loading" : "missing");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idOk) return undefined;
    let active = true;
    getSong(numericId)
      .then((data) => {
        if (!active) return;
        setSong(data);
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

  const infoItems = song
    ? [
        { label: "Título", value: song.titulo },
        { label: "Compositor", value: song.compositor },
        { label: "Álbum", value: song.album },
        { label: "Ano de Lançamento", value: song.anoLancamento },
        { label: "Adicionais", value: song.adicionais, multiline: true },
      ]
    : [];

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-pine-dark bg-pine px-2 py-2 text-white shadow-sm landscape-mobile:py-1">
        <div className="flex items-center gap-1">
          <Link
            to={idOk ? `/musicas/${numericId}` : "/"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
            aria-label="Voltar à música"
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
                  <MarqueeText
                    text={song.titulo}
                    className="text-base font-semibold leading-tight"
                  />
                </span>
              </h1>
            ) : (
              <h1 className="truncate text-base font-semibold text-white">Informações da música</h1>
            )}
          </div>
        </div>
      </header>

      <SongScroll>
        {status === "loading" ? (
          <div className="space-y-3 p-4" aria-hidden>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-paper" />
            ))}
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
          <div className="space-y-4 px-4 py-4">
            <h2 className="text-sm font-semibold text-ink-soft">Informações da música</h2>

            <dl className="divide-y divide-line rounded-2xl border border-line bg-paper/60">
              {infoItems.map(({ label, value, multiline }) => {
                const text = String(value ?? "").trim();
                return (
                  <div key={label} className="px-4 py-3.5">
                    <dt className="text-xs font-medium text-ink-soft">{label}</dt>
                    <dd
                      className={`mt-1 text-sm ${
                        text ? "text-ink" : "italic text-ink-soft/65"
                      } ${multiline ? "whitespace-pre-wrap leading-relaxed" : "break-words"}`}
                    >
                      {text || "Não informado"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}
      </SongScroll>
    </div>
  );
}
