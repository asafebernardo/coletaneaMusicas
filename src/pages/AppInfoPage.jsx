import { Link } from "react-router-dom";
import { APP_DESCRIPTION } from "@/data/appDescription.js";

export default function AppInfoPage() {
  const { titulo, subtitulo, descricao, itens } = APP_DESCRIPTION;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to="/"
          aria-label="Voltar para o início"
          className="inline-flex h-10 w-10 -ml-2 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          {subtitulo || "Sobre o aplicativo"}
        </h1>
      </header>

      <div className="space-y-4 p-4">
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          {titulo ? (
            <h2 className="text-base font-semibold text-ink">{titulo}</h2>
          ) : null}
          {descricao ? (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
              {descricao}
            </p>
          ) : null}
        </section>

        {Array.isArray(itens) && itens.length > 0 ? (
          <dl className="divide-y divide-line rounded-2xl border border-line bg-paper/60">
            {itens.map(({ rotulo, valor }) => {
              const text = String(valor ?? "").trim();
              if (!text) return null;
              return (
                <div key={rotulo} className="px-4 py-3.5">
                  <dt className="text-xs font-medium text-ink-soft">{rotulo}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {text}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : null}
      </div>
    </>
  );
}
