import { Link } from "react-router-dom";
import { canManageSongs } from "@/lib/songs.js";

const MORE_OPTIONS = [
  {
    id: "favoritos",
    label: "Favoritos",
    description: "Músicas que você marcou como favoritas",
    to: "/favoritos",
    icon: HeartIcon,
  },
  {
    id: "temas",
    label: "Temas",
    description: "Organizar músicas em listas próprias",
    to: "/temas",
    icon: CollectionIcon,
  },
  {
    id: "previsualizacao",
    label: "Pré-visualização",
    description: "Ouvir as músicas que têm demonstração",
    to: "/previsualizacao",
    icon: MusicIcon,
  },
  {
    id: "previsualizacoes-pendentes",
    label: "Pré-visualizações pendentes (temporário)",
    description: "Adicionar áudio às músicas sem prévia",
    to: "/admin/previews",
    icon: PendingAudioIcon,
    adminOnly: true,
  },
  {
    id: "instalar",
    label: "Aplicativo e versão web",
    description: "Instalar o app ou abrir a página estática",
    to: "/instalar",
    icon: InstallIcon,
  },
  {
    id: "informacoes",
    label: "Informações",
    description: "Sobre a coletânea e o aplicativo",
    to: "/sobre",
    icon: InfoIcon,
  },
  {
    id: "configuracoes",
    label: "Configurações",
    description: "Tamanho da letra, tema e cores",
    to: "/configuracoes",
    icon: SettingsIcon,
  },
];

export default function CategoriesPage() {
  const canManage = canManageSongs();
  const options = MORE_OPTIONS.filter((option) => !option.adminOnly || canManage);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-pine-dark bg-pine px-4 text-white shadow-sm landscape-mobile:h-11">
        <Link
          to="/"
          aria-label="Voltar para a lista de músicas"
          className="-ml-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white landscape-mobile:h-8 landscape-mobile:w-8"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          Mais+
        </h1>
      </header>

      <ul>
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <li key={option.id} className="border-b border-line/80 last:border-b-0">
              <Link
                to={option.to}
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
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function InfoIcon() {
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
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function HeartIcon() {
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
      <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function MusicIcon() {
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
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
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

function PendingAudioIcon() {
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
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <path d="M12 8v4m-2-2h4" />
    </svg>
  );
}

function InstallIcon() {
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function SettingsIcon() {
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}
