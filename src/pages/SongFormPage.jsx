import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createSong, getSong, messageForSongError, updateSong } from "@/api/songs.js";
import { splitLyrics } from "@/components/Lyrics.jsx";
import LyricEditor from "@/components/LyricEditor.jsx";
import ThemeButton from "@/components/ThemeButton.jsx";
import { packLyrics } from "@/lib/voices.js";

const emptyForm = {
  titulo: "",
  letra: "",
  refrao: "",
  cronologica: false,
  refraoPrimeiro: false,
  vozesLetra: [],
  vozesRefrao: [],
};

function fieldsFromSong(song) {
  const embedded = splitLyrics(song.letra || "");
  const storedRefrao = String(song.refrao ?? "").trim();
  const refrao = storedRefrao || embedded.refrao;
  return {
    titulo: song.titulo || "",
    letra: storedRefrao ? song.letra || "" : embedded.letra,
    refrao,
    cronologica: Boolean(song.cronologica) && Boolean(refrao),
    refraoPrimeiro: Boolean(song.refraoPrimeiro) && Boolean(refrao),
    vozesLetra: Array.isArray(song.vozesLetra) ? song.vozesLetra : [],
    vozesRefrao: Array.isArray(song.vozesRefrao) ? song.vozesRefrao : [],
  };
}

export default function SongFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id != null;
  const numericId = Number(id);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(editing ? "loading" : "ready");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return undefined;
    if (!Number.isInteger(numericId)) {
      setStatus("missing");
      return undefined;
    }
    setStatus("loading");
    let active = true;
    getSong(numericId)
      .then((song) => {
        if (!active) return;
        setForm(fieldsFromSong(song));
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setStatus(err.status === 404 ? "missing" : "error");
        setError(messageForSongError(err));
      });
    return () => {
      active = false;
    };
  }, [editing, numericId]);

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const letraPack = packLyrics(form.letra, form.vozesLetra);
    const refraoPack = packLyrics(form.refrao, form.vozesRefrao);
    const payload = {
      titulo: form.titulo.trim(),
      letra: letraPack.text,
      refrao: refraoPack.text,
      cronologica: Boolean(form.cronologica) && Boolean(refraoPack.text),
      refraoPrimeiro: Boolean(form.refraoPrimeiro) && Boolean(refraoPack.text),
      vozesLetra: letraPack.marks,
      vozesRefrao: refraoPack.marks,
    };
    try {
      const saved = editing
        ? await updateSong(numericId, payload)
        : await createSong(payload);
      navigate(`/musicas/${saved.id}`, { replace: true });
    } catch (err) {
      setError(messageForSongError(err));
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-1 border-b border-line bg-card/95 px-2 py-2 backdrop-blur">
        <Link
          to={editing ? `/musicas/${id}` : "/"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
          aria-label="Voltar"
        >
          <span aria-hidden className="text-xl leading-none">
            ‹
          </span>
        </Link>
        <h1 className="min-w-0 flex-1 truncate px-1 text-base font-semibold">
          {editing ? "Editar música" : "Nova música"}
        </h1>
        <ThemeButton />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {status === "loading" ? (
        <div className="space-y-3 p-4" aria-hidden>
          <div className="h-11 animate-pulse rounded-xl bg-paper" />
          <div className="h-11 animate-pulse rounded-xl bg-paper" />
          <div className="h-48 animate-pulse rounded-xl bg-paper" />
        </div>
      ) : status === "missing" ? (
        <div className="px-6 py-16 text-center">
          <p className="text-base font-medium">Música não encontrada</p>
          <Link to="/" className="mt-3 inline-block text-sm font-medium text-pine hover:underline">
            Voltar à lista
          </Link>
        </div>
      ) : (
        <form className="space-y-4 px-4 py-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-ink-soft">Título</span>
              <input
                className="h-11 w-full rounded-xl border border-line bg-paper px-3 outline-none ring-pine focus:ring-2"
                placeholder="Título da música"
                value={form.titulo}
                onChange={setField("titulo")}
                maxLength={200}
                aria-describedby="titulo-numero"
                required
              />
            </label>
            <p id="titulo-numero" className="text-xs leading-relaxed text-ink-soft">
              O número segue a ordem alfabética do título e muda quando a coletânea muda.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink-soft">Letra</p>
            <LyricEditor
              label="Letra"
              text={form.letra}
              marks={form.vozesLetra}
              placeholder={"Primeira estrofe\n\nSegunda estrofe"}
              minClass="min-h-48"
              onChange={({ text, marks }) =>
                setForm((current) => ({ ...current, letra: text, vozesLetra: marks }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-center text-[0.78em] tracking-[0.16em] text-ink-soft">Refrão</p>
            <LyricEditor
              label="Texto do refrão"
              text={form.refrao}
              marks={form.vozesRefrao}
              placeholder="Texto do refrão"
              italic
              onChange={({ text, marks }) =>
                setForm((current) => ({ ...current, refrao: text, vozesRefrao: marks }))
              }
            />
          </div>
          {form.refrao.trim() ? (
            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-xl border border-line px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-pine"
                  checked={form.refraoPrimeiro}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, refraoPrimeiro: event.target.checked }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium">Refrão primeiro</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                    O refrão fica no topo desta música. Com a ordem cronológica, ele também se repete depois de cada estrofe.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-line px-3 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-pine"
                  checked={form.cronologica}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, cronologica: event.target.checked }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium">Ordem cronológica</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">
                    Permite repetir o refrão depois de cada estrofe. Marcar aqui não liga a cronologia de quem está lendo.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex justify-end gap-2 pb-4">
            <Link
              to={editing ? `/musicas/${id}` : "/"}
              className="inline-flex h-10 items-center rounded-lg border border-line px-3 text-sm"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="h-10 rounded-lg bg-pine px-4 text-sm font-medium text-white disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
