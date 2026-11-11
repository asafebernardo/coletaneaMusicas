import { useState } from "react";
import {
  fontLimits,
  readFontSize,
  readShowChordsButton,
  readShowChronological,
  writeFontSize,
  writeShowChordsButton,
  writeShowChronological,
} from "@/lib/songs.js";
import { ACCENT_OPTIONS, setAccent, setTheme, useAccent, useTheme } from "@/lib/theme.js";

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState(readFontSize);
  const [showChronological, setShowChronological] = useState(readShowChronological);
  const [showChordsButton, setShowChordsButton] = useState(readShowChordsButton);
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
      <header className="sticky top-0 z-10 border-b border-pine-dark bg-pine px-4 py-3 text-white shadow-sm landscape-mobile:py-2">
        <h1 className="text-lg font-semibold leading-tight text-white landscape-mobile:text-base">
          Configurações
        </h1>
      </header>

      <div className="space-y-3 p-4">
        {/* 1. Tamanho da letra */}
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
        </section>

        {/* 2. Alterar tema */}
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
                Escuro
              </button>
            </div>
          </div>
        </section>

        {/* 3. Habilitar e desabilitar cronologia */}
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

        {/* 4. Exibir/ocultar botão de Cifras */}
        <section className="rounded-2xl border border-line bg-paper/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Botão de Cifras</h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                Visualizar ou ocultar o botão Cifra dentro das músicas
              </p>
            </div>
            <div
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-line bg-card p-0.5"
              role="group"
              aria-label="Botão de Cifras"
            >
              <button
                type="button"
                aria-pressed={showChordsButton}
                onClick={() => {
                  setShowChordsButton(true);
                  writeShowChordsButton(true);
                }}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  showChordsButton
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Visível
              </button>
              <button
                type="button"
                aria-pressed={!showChordsButton}
                onClick={() => {
                  setShowChordsButton(false);
                  writeShowChordsButton(false);
                }}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
                  !showChordsButton
                    ? "bg-pine text-white shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Oculto
              </button>
            </div>
          </div>
        </section>

        {/* 5. Cor de destaque */}
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
      </div>
    </>
  );
}
