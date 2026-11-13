import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { canManageSongs } from "@/lib/songs.js";
import { getAccentHex, useAccent, useTheme } from "@/lib/theme.js";

const barItem =
  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine landscape-mobile:h-10 landscape-mobile:flex-row landscape-mobile:gap-1.5";
const barOn = "text-pine";
const barOff = "text-ink-soft hover:text-ink";

const MORE_PATHS = new Set([
  "/mais",
  "/categorias",
  "/favoritos",
  "/previsualizacao",
  "/instalar",
  "/sobre",
  "/configuracoes",
  "/temas",
  "/admin",
  "/admin/previews",
]);

export default function HomeLayout() {
  const canManage = canManageSongs();
  const { pathname } = useLocation();
  const theme = useTheme();
  const accent = useAccent();
  const activeColor = getAccentHex(theme, accent);
  const isMoreActive = MORE_PATHS.has(pathname) || pathname.startsWith("/temas/");
  const isCatalog = !isMoreActive;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>

      <div className="relative shrink-0">
        {canManage && isCatalog ? (
          <div className="pointer-events-none absolute bottom-full right-3 z-20 mb-3">
            <div className="pointer-events-auto inline-flex h-9 items-center rounded-full border border-line bg-card p-0.5 shadow-lg">
              <Link
                to="/musicas/nova"
                className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine"
              >
                <PlusIcon />
                Nova
              </Link>
            </div>
          </div>
        ) : null}

        <nav
          aria-label="Navegação principal"
          data-accent={accent}
          className="grid shrink-0 grid-cols-2 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${barItem} ${isActive ? barOn : barOff}`}
            style={({ isActive }) => (isActive ? { color: activeColor } : undefined)}
            aria-label="Louvor"
          >
            <PraiseIcon />
            Louvor
          </NavLink>
          <NavLink
            to="/mais"
            className={() => `${barItem} ${isMoreActive ? barOn : barOff}`}
            style={() => (isMoreActive ? { color: activeColor } : undefined)}
            aria-label="Mais+"
          >
            <MoreIcon />
            Mais+
          </NavLink>
        </nav>
      </div>
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

function MoreIcon() {
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
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M17.5 14v7" />
      <path d="M14 17.5h7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
