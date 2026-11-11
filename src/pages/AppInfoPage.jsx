import { Link } from "react-router-dom";
import { APP_DESCRIPTION } from "@/data/appDescription.js";

/**
 * Página "Informações" (em Mais+).
 * Exibe centralizados: logo, nome do aplicativo, versão (DD.MM.AA),
 * mensagem de boas-vindas, versículo em destaque e nota de direitos autorais.
 */
export default function AppInfoPage() {
  const {
    titulo,
    versao,
    subtitulo,
    boasVindas,
    introducao,
    versiculo,
    mensagem,
    direitosAutorais,
  } = APP_DESCRIPTION;
  const logoSrc = `${import.meta.env.BASE_URL || "/"}logo.jfif`;

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to="/mais"
          aria-label="Voltar para Mais+"
          className="inline-flex h-10 w-10 -ml-2 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          Informações
        </h1>
      </header>

      <div className="flex flex-col items-center px-5 py-8 text-center">
        {/* Identidade e versão */}
        <img
          src={logoSrc}
          alt={`Logo ${titulo}`}
          className="h-20 w-20 shrink-0 rounded-full border border-line bg-white object-cover shadow-sm"
        />

        <h2 className="mt-4 text-xl font-semibold text-ink">{titulo}</h2>

        {versao ? (
          <p className="mt-1 text-xs font-medium text-ink-soft">Versão {versao}</p>
        ) : null}

        {/* Espaço entre cabeçalho de identidade e seção Sobre */}
        <div className="mt-8 w-full max-w-sm space-y-4">
          <section className="space-y-4 rounded-2xl border border-line bg-paper/60 p-5 text-center shadow-sm">
            {subtitulo ? (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-pine">
                {subtitulo}
              </h3>
            ) : null}

            {boasVindas ? (
              <p className="text-base font-semibold text-ink">{boasVindas}</p>
            ) : null}

            {introducao ? (
              <p className="text-sm leading-relaxed text-ink-soft">{introducao}</p>
            ) : null}

            {versiculo ? (
              <blockquote className="rounded-xl border border-pine/20 bg-card/80 px-4 py-3.5 text-center">
                {versiculo.introducao ? (
                  <p className="text-xs text-ink-soft">{versiculo.introducao}</p>
                ) : null}
                <p className="mt-1 font-lyric text-sm font-semibold italic leading-relaxed text-ink">
                  {versiculo.citacao}
                </p>
                {versiculo.referencia ? (
                  <footer className="mt-1 text-xs font-semibold text-pine">
                    ({versiculo.referencia})
                  </footer>
                ) : null}
              </blockquote>
            ) : null}

            {Array.isArray(mensagem)
              ? mensagem.map((paragrafo, index) => (
                  <p key={index} className="text-sm leading-relaxed text-ink-soft">
                    {paragrafo}
                  </p>
                ))
              : null}
          </section>

          {direitosAutorais ? (
            <section className="rounded-2xl border border-line bg-paper/40 px-4 py-3.5 text-center">
              <p className="text-xs leading-relaxed text-ink-soft">
                <strong className="font-semibold text-ink">{direitosAutorais.titulo}</strong>{" "}
                {direitosAutorais.texto}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
