import { Outlet } from "react-router-dom";

const barItem =
  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium cursor-not-allowed text-ink-soft/45 landscape-mobile:h-10 landscape-mobile:flex-row landscape-mobile:gap-1.5";

export default function HomeLayout() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>

      <nav
        aria-label="Navegação principal"
        className="grid shrink-0 grid-cols-3 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
      >
        <button type="button" disabled className={barItem} aria-label="Louvor em breve">
          <PraiseIcon />
          Louvor
        </button>
        <button type="button" disabled className={barItem} aria-label="Temas em breve">
          <ThemesIcon />
          Temas
        </button>
        <button type="button" disabled className={barItem} aria-label="Autores em breve">
          <AuthorsIcon />
          Autores
        </button>
      </nav>
    </div>
  );
}

function PraiseIcon() {
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

function ThemesIcon() {
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
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7" cy="7" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AuthorsIcon() {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
