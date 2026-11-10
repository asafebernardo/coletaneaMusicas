import LyricEditor from "@/components/LyricEditor.jsx";
import { hasMarkedVoices } from "@/lib/voices.js";

export default function VocalArrangementEditor({
  text,
  marks,
  somenteVozes = false,
  onChange,
  onSomenteVozesChange,
}) {
  const hasVoicesContent = Boolean(String(text ?? "").trim()) || hasMarkedVoices(marks);

  return (
    <div className="space-y-3" role="region" aria-label="Divisão de vozes">
      <div className="space-y-1.5">
        <p className="text-center text-[0.78em] tracking-[0.16em] text-ink-soft">
          Divisão de vozes
        </p>
        <LyricEditor
          label="Música completa com divisão de vozes"
          text={text}
          marks={marks}
          placeholder={"Escreva toda a música aqui\ne selecione os trechos de cada voz"}
          minClass="min-h-56"
          showVoiceTools
          onChange={onChange}
        />
      </div>

      {hasVoicesContent ? (
        <label className="flex items-start gap-3 rounded-xl border border-line px-3 py-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-pine"
            checked={Boolean(somenteVozes)}
            onChange={(event) => onSomenteVozesChange?.(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium">Somente vozes</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
              Habilita apenas o modo Vozes nesta música e bloqueia o botão Letra na leitura.
            </span>
          </span>
        </label>
      ) : null}
    </div>
  );
}
