import { useState } from "react";
import { Link } from "react-router-dom";
import {
  isMobileDevice,
  isIosDevice,
  triggerPwaInstall,
  useCanPromptInstall,
  useIsPwaInstalled,
} from "@/lib/pwa.js";

export default function InstallAppPage() {
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installStatus, setInstallStatus] = useState("");
  const [installError, setInstallError] = useState("");
  const canPrompt = useCanPromptInstall();
  const isInstalled = useIsPwaInstalled();
  const isMobile = isMobileDevice();
  const isIos = isIosDevice();

  const handleInstall = async () => {
    setInstallError("");
    setShowInstallHelp(false);
    if (isInstalled) {
      setInstallStatus("installed");
      return;
    }
    if (canPrompt) {
      try {
        const result = await triggerPwaInstall();
        if (result.outcome === "accepted") {
          setInstallStatus("accepted");
        } else if (result.outcome === "unavailable") {
          setShowInstallHelp(true);
        } else {
          setInstallStatus("dismissed");
        }
      } catch (error) {
        setInstallError(
          error instanceof Error ? error.message : "Não foi possível iniciar a instalação.",
        );
      }
      return;
    }
    setInstallStatus("");
    setShowInstallHelp(true);
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
        {isMobile && isInstalled ? (
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
                disabled={!isMobile}
                aria-describedby={!isMobile ? "install-device-warning" : undefined}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  isMobile
                    ? "bg-pine text-white transition-colors hover:bg-pine-dark"
                    : "cursor-not-allowed bg-line text-ink-soft"
                }`}
              >
                <InstallIcon />
                Instalar
              </button>
            </div>

            {!isMobile ? (
              <p id="install-device-warning" role="note" className="mt-3 text-xs text-ink-soft">
                A instalação do aplicativo está disponível apenas em celulares e tablets. Neste
                dispositivo, use a versão web.
              </p>
            ) : null}

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

        {installError ? (
          <p role="alert" className="text-sm text-danger">
            {installError}
          </p>
        ) : null}
        {installStatus && !isInstalled ? (
          <p role="status" className="text-sm text-ink">
            {installStatus === "accepted"
              ? "Instalação iniciada. O navegador está baixando e instalando o aplicativo; esta tela permanecerá aberta."
              : "A instalação foi cancelada. Você pode tentar novamente quando quiser."}
          </p>
        ) : null}

        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Escolher como acessar</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Volte à tela inicial para continuar pela web ou baixar o aplicativo.
              </p>
            </div>
            <Link
              to="/inicio"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-pine px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-pine-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
            >
              Escolher
            </Link>
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
