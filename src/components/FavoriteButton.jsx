export default function FavoriteButton({ favorite, onToggle, variant = "list" }) {
  const sizeClass = variant === "header" ? "h-10 w-10" : "h-11 w-11";
  const colorClass =
    variant === "header"
      ? favorite
        ? "text-rose-200 hover:bg-white/15"
        : "text-white/90 hover:bg-white/15 hover:text-white"
      : favorite
        ? "text-rose-600 hover:bg-paper"
        : "text-ink-soft hover:bg-paper hover:text-rose-600";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={favorite}
      aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`inline-flex ${sizeClass} shrink-0 items-center justify-center self-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${colorClass}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-5 w-5"
        fill={favorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
      </svg>
    </button>
  );
}
