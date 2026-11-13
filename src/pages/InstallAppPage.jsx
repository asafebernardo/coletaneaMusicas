import { useState } from "react";
import { Link } from "react-router-dom";
import {
  isIosDevice,
  triggerPwaInstall,
  useCanPromptInstall,
  useIsPwaInstalled,
} from "@/lib/pwa.js";

const STATIC_PAGE_URL = "https://asafebernardo.github.io/coletaneaMusicas/";

export default function InstallAppPage() {
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const canPrompt = useCanPromptInstall();
  const isInstalled = useIsPwaInstalled();
  const isIos = isIosDevice();

  const handleInstall = async () => {
    if (canPrompt) {
      await triggerPwaInstall();
      return;
    }
    setShowInstallHelp((current) => !current);
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
          Aplicativo e versão web
        </h1>
      </header>

      <div className="space-y-3 p-4">
        {isInstalled ? (
          <section className="rounded-2xl border border-line bg-paper/60 p-4">
            <h2 className="text-sm font-semibold text-ink">Aplicativo já instalado</h2>
            <p className="mt-1 text-xs text-ink-soft">
              A Coletânea já está disponível na tela inicial do dispositivo.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-line bg-paper/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink">Aplicativo (PWA)</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Instale a coletânea no seu dispositivo para acesso rápido e offline
                </p>
              </div>
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-pine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
              >
                <InstallIcon />
                Instalar
              </button>
            </div>

            {showInstallHelp ? (
              <div className="mt-3 rounded-xl border border-line bg-card p-3 text-xs leading-relaxed text-ink">
                {isIos ? (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">Como instalar no iPhone / iPad:</p>
                    <ol className="list-decimal space-y-0.5 pl-4 text-ink-soft">
                      <li>
                        Toque em <strong className="text-ink">Compartilhar</strong> na barra do
                        Safari.
                      </li>
                      <li>
                        Selecione <strong className="text-ink">Adicionar à Tela de Início</strong>.
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">Como instalar neste navegador:</p>
                    <ol className="list-decimal space-y-0.5 pl-4 text-ink-soft">
                      <li>
                        Abra o menu do navegador (<strong className="text-ink">⋮</strong>) ou o
                        ícone na barra de endereços.
                      </li>
                      <li>
                        Toque em <strong className="text-ink">Instalar aplicativo</strong> ou{" "}
                        <strong className="text-ink">Adicionar à tela inicial</strong>.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}

        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Versão web</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Acesse a página estática da coletânea no navegador.
              </p>
            </div>
            <a
              href={STATIC_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-pine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              Abrir versão web
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

function InstallIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3v9.5" />
      <path d="m6.5 9 3.5 3.5L13.5 9" />
      <path d="M4 16.5h12" />
    </svg>
  );
}
