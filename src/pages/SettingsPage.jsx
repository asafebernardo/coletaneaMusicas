import { useState } from "react";
import { Link } from "react-router-dom";
import {
  fontLimits,
  readDefaultSongView,
  readFontSize,
  readShowChronological,
  writeDefaultSongView,
  writeFontSize,
  writeShowChronological,
} from "@/lib/songs.js";
import { ACCENT_OPTIONS, setAccent, setTheme, useAccent, useTheme } from "@/lib/theme.js";

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState(readFontSize);
  const [defaultSongView, setDefaultSongView] = useState(readDefaultSongView);
  const [showChronological, setShowChronological] = useState(readShowChronological);
  const theme = useTheme();
  const accent = useAccent();

  const changeFont = (delta) => {
    setFontSize((current) => {
      const next = Math.min(fontLimits.max, Math.max(fontLimits.min, current + delta));
      writeFontSize(next);
      return next;
    });
  };

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
          Configurações
        </h1>
      </header>

      <div className="space-y-3 p-4">
        {/* Cor de destaque */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Cor de destaque</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Personalize a cor principal dos botões, ícones e cifras do aplicativo
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Cor de destaque"
              className="flex flex-wrap items-center gap-3"
            >
              {ACCENT_OPTIONS.map((option) => {
                const selected = accent === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setAccent(option.id)}
                    style={{ backgroundColor: option.swatch }}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                      selected
                        ? "scale-110 ring-2 ring-ink ring-offset-2 ring-offset-card"
                        : " opacity-85 hover:scale-105 hover:opacity-100"
                    }`}
                  >
                    {selected ? (
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m4.5 10.5 3.5 3.5 7.5-7.5" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visualização padrão da música */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Visualização padrão da música</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Usada ao abrir uma música; opções indisponíveis usam a visualização compatível.
              </p>
            </div>
            <div
              className="grid grid-cols-3 rounded-xl border border-line bg-card p-0.5"
              role="group"
              aria-label="Visualização padrão da música"
            >
              {[
                { value: "letra", label: "Letra" },
                { value: "vozes", label: "Vozes" },
                { value: "cifra", label: "Cifra" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={defaultSongView === value}
                  onClick={() => {
                    setDefaultSongView(value);
                    writeDefaultSongView(value);
                  }}
                  className={`h-9 rounded-lg px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                    defaultSongView === value
                      ? "bg-paper text-ink shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tamanho da letra */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Tamanho da letra</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Ajuste o tamanho do texto na leitura das músicas
              </p>
            </div>
            <div
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-card p-0.5"
              role="group"
              aria-label="Tamanho da letra"
            >
              <button
                type="button"
                className="inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-semibold text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Diminuir letra"
                disabled={fontSize <= fontLimits.min}
                onClick={() => changeFont(-2)}
              >
                A−
              </button>
              <span className="min-w-[3rem] text-center font-mono text-xs font-medium text-ink-soft tabular-nums">
                {fontSize}px
              </span>
              <button
                type="button"
                className="inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-semibold text-ink hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Aumentar letra"
                disabled={fontSize >= fontLimits.max}
                onClick={() => changeFont(2)}
              >
                A+
              </button>
            </div>
          </div>
          <div
            aria-label="Prévia do tamanho da letra"
            className="mt-4 rounded-xl border border-line bg-card p-3"
          >
            <p className="text-[11px] font-medium text-ink-soft">Prévia da letra</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-ink" style={{ fontSize }}>
              {"Esta é uma prévia da letra.\n\nO texto acompanha o tamanho selecionado."}
            </p>
          </div>
        </section>

        {/* Alterar tema */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Tema</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Escolha entre a aparência clara ou escura
              </p>
            </div>
            <div
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-card p-0.5"
              role="group"
              aria-label="Tema do aplicativo"
            >
              <button
                type="button"
                aria-pressed={theme === "light"}
                onClick={() => setTheme("light")}
                className={`inline-flex h-8 items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  theme === "light"
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <SunIcon />
                Claro
              </button>
              <button
                type="button"
                aria-pressed={theme === "dark"}
                onClick={() => setTheme("dark")}
                className={`inline-flex h-8 items-center gap-1 rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  theme === "dark"
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <MoonIcon />
                Escuro
              </button>
            </div>
          </div>
        </section>

        {/* Habilitar e desabilitar cronologia */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Cronologia</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Repetir refrão depois de cada estrofe
              </p>
            </div>
            <div
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-card p-0.5"
              role="group"
              aria-label="Ordem cronológica"
            >
              <button
                type="button"
                aria-pressed={showChronological}
                onClick={() => {
                  setShowChronological(true);
                  writeShowChronological(true);
                }}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  showChronological
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Ativada
              </button>
              <button
                type="button"
                aria-pressed={!showChronological}
                onClick={() => {
                  setShowChronological(false);
                  writeShowChronological(false);
                }}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  !showChronological
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Desativada
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
    </svg>
  );
}
