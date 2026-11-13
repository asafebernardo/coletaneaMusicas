import { useState } from "react";
import {
  isMobileDevice,
  isIosDevice,
  triggerPwaInstall,
  useCanPromptInstall,
  useIsPwaInstalled,
} from "@/lib/pwa.js";

export default function LandingPage({ onEnterWeb }) {
  const canPrompt = useCanPromptInstall();
  const isInstalled = useIsPwaInstalled();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installStatus, setInstallStatus] = useState("");
  const [installError, setInstallError] = useState("");
  const logoSrc = `${import.meta.env.BASE_URL || "/"}logo.jfif`;
  const isMobile = isMobileDevice();
  const isIos = isIosDevice();

  const handleInstallClick = async () => {
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
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
        <img
          src={logoSrc}
          alt="Logo Coletânea de Louvor"
          className="h-20 w-20 shrink-0 rounded-full border border-line bg-white object-cover shadow-sm landscape-mobile:h-14 landscape-mobile:w-14"
        />

        <h2 className="mt-4 text-xl font-semibold text-ink landscape-mobile:mt-2 landscape-mobile:text-lg">
          Coletânea de Louvor
        </h2>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">
          Escolha como deseja utilizar a coletânea de músicas no seu dispositivo.
        </p>

        <div className="mt-7 w-full max-w-xs space-y-3 landscape-mobile:mt-4">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!isMobile}
            aria-describedby={!isMobile ? "install-unavailable" : undefined}
            className={`flex w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
              isMobile
                ? "bg-pine text-white transition-colors hover:bg-pine-dark"
                : "cursor-not-allowed bg-line text-ink-soft"
            }`}
          >
            <DownloadIcon />
            <span>Baixar Coletânea de Louvor</span>
          </button>
          {!isMobile ? (
            <p id="install-unavailable" role="note" className="px-2 text-xs leading-relaxed text-ink-soft">
              A instalação do aplicativo está disponível apenas em celulares e tablets. Neste
              dispositivo, continue pela versão web.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onEnterWeb?.()}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-line bg-paper px-4 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
          >
            <GlobeIcon />
            <span>Continuar</span>
          </button>
        </div>

        {installError ? (
          <p role="alert" className="mt-4 w-full max-w-xs text-left text-sm text-danger">
            {installError}
          </p>
        ) : null}
        {installStatus || isInstalled ? (
          <p role="status" className="mt-4 w-full max-w-xs text-left text-sm text-ink">
            {isInstalled || installStatus === "installed"
              ? "O aplicativo já está instalado neste dispositivo."
              : installStatus === "accepted"
              ? "Instalação iniciada. O navegador está baixando e instalando o aplicativo; esta tela permanecerá aberta."
              : "A instalação foi cancelada. Você pode tentar novamente quando quiser."}
          </p>
        ) : null}

        {showInstallHelp ? (
          <div
            role="region"
            aria-label="Instruções de instalação"
            className="mt-5 w-full max-w-xs rounded-2xl border border-line bg-paper/75 p-4 text-left text-xs leading-relaxed text-ink"
          >
            {isInstalled ? (
              <p className="font-medium text-pine">
                O aplicativo já está instalado neste dispositivo. Você pode abri-lo pela tela
                inicial ou clicar em &ldquo;Continuar&rdquo; para usar a versão web.
              </p>
            ) : isIos ? (
              <div className="space-y-1.5">
                <p className="font-semibold text-ink">Como instalar no iPhone / iPad:</p>
                <ol className="list-decimal space-y-1 pl-4 text-ink-soft">
                  <li>
                    Toque no botão <strong className="text-ink">Compartilhar</strong> na barra do
                    Safari.
                  </li>
                  <li>
                    Selecione <strong className="text-ink">Adicionar à Tela de Início</strong> e
                    confirme em <strong className="text-ink">Adicionar</strong>.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="font-semibold text-ink">Como instalar neste navegador:</p>
                <ol className="list-decimal space-y-1 pl-4 text-ink-soft">
                  <li>
                    Abra o menu do navegador (<strong className="text-ink">⋮</strong>) ou o ícone de
                    instalação na barra de endereços.
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
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M12 3a14.5 14.5 0 0 0 0 18" />
      <path d="M12 3a14.5 14.5 0 0 1 0 18" />
    </svg>
  );
}
