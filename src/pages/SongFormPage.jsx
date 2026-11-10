import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createSong, getSong, messageForSongError, updateSong } from "@/api/songs.js";
import ChordEditor from "@/components/ChordEditor.jsx";
import { splitLyrics } from "@/components/Lyrics.jsx";
import LyricEditor from "@/components/LyricEditor.jsx";
import ThemeButton from "@/components/ThemeButton.jsx";
import VocalArrangementEditor from "@/components/VocalArrangementEditor.jsx";
import { packChordLines, syncChordLines } from "@/lib/chords.js";
import { buildFullSongLyrics, hasMarkedVoices, packLyrics } from "@/lib/voices.js";

const emptyForm = {
  titulo: "",
  letra: "",
  refrao: "",
  cronologica: false,
  refraoPrimeiro: false,
  somenteVozes: false,
  vozesLetra: [],
  vozesRefrao: [],
  letraVozes: "",
  vozesArranjo: [],
  cifraLetra: [],
  cifraRefrao: [],
};

function fieldsFromSong(song) {
  const embedded = splitLyrics(song.letra || "");
  const storedRefrao = String(song.refrao ?? "").trim();
  const refrao = storedRefrao || embedded.refrao;
  const letra = storedRefrao ? song.letra || "" : embedded.letra;
  const cronologica = Boolean(song.cronologica) && Boolean(refrao);
  const refraoPrimeiro = Boolean(song.refraoPrimeiro) && Boolean(refrao);
  const vozesLetra = Array.isArray(song.vozesLetra) ? song.vozesLetra : [];
  const vozesRefrao = Array.isArray(song.vozesRefrao) ? song.vozesRefrao : [];

  const storedLetraVozes = String(song.letraVozes ?? "").trim();
  const storedVozesArranjo = Array.isArray(song.vozesArranjo) ? song.vozesArranjo : [];
  const hasLegacyVoices = hasMarkedVoices(vozesLetra) || hasMarkedVoices(vozesRefrao);
  const built = hasLegacyVoices
    ? buildFullSongLyrics({
        letra,
        refrao,
        vozesLetra,
        vozesRefrao,
        cronologica,
        refraoPrimeiro,
      })
    : { text: "", marks: [] };

  const letraVozes = storedLetraVozes || built.text;
  const vozesArranjo = storedLetraVozes ? storedVozesArranjo : built.marks;
  const somenteVozes =
    Boolean(song.somenteVozes) && (Boolean(letraVozes) || hasMarkedVoices(vozesArranjo));

  return {
    titulo: song.titulo || "",
    letra,
    refrao,
    cronologica,
    refraoPrimeiro,
    somenteVozes,
    vozesLetra,
    vozesRefrao,
    letraVozes,
    vozesArranjo,
    cifraLetra: syncChordLines(letra, song.cifraLetra),
    cifraRefrao: syncChordLines(refrao, song.cifraRefrao),
  };
}

export default function SongFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id != null;
  const numericId = Number(id);
  const [form, setForm] = useState(emptyForm);
  const [contentTab, setContentTab] = useState("letra");
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

  const updateLyricsPart = (updates) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const baseLetra = form.letra.trim() ? form.letra : form.letraVozes;
    const letraPack = packLyrics(baseLetra, []);
    const refraoPack = packLyrics(form.refrao, []);
    const vozesPack = packLyrics(form.letraVozes, form.vozesArranjo);
    const hasArranjoVoices = Boolean(vozesPack.text);

    const payload = {
      titulo: form.titulo.trim(),
      letra: letraPack.text,
      refrao: refraoPack.text,
      cronologica: Boolean(form.cronologica) && Boolean(refraoPack.text),
      refraoPrimeiro: Boolean(form.refraoPrimeiro) && Boolean(refraoPack.text),
      somenteVozes: Boolean(form.somenteVozes) && hasArranjoVoices,
      vozesLetra: [],
      vozesRefrao: [],
      letraVozes: hasArranjoVoices ? vozesPack.text : "",
      vozesArranjo: hasArranjoVoices ? vozesPack.marks : [],
      cifraLetra: syncChordLines(letraPack.text, packChordLines(baseLetra, form.cifraLetra)),
      cifraRefrao: syncChordLines(refraoPack.text, packChordLines(form.refrao, form.cifraRefrao)),
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
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-1 border-b border-line bg-card/95 px-2 py-2 landscape-mobile:py-1 backdrop-blur">
        <Link
          to={editing ? `/musicas/${id}` : "/"}
          className="inline-flex h-10 w-10 landscape-mobile:h-8 landscape-mobile:w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
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

            <div
              className="grid grid-cols-3 rounded-xl border border-line bg-paper p-0.5"
              role="tablist"
              aria-label="Conteúdo da música"
            >
              <TabButton active={contentTab === "letra"} onClick={() => setContentTab("letra")}>
                Letra
              </TabButton>
              <TabButton active={contentTab === "arranjo"} onClick={() => setContentTab("arranjo")}>
                Arranjo Vocal
              </TabButton>
              <TabButton active={contentTab === "cifra"} onClick={() => setContentTab("cifra")}>
                Cifra
              </TabButton>
            </div>

            {contentTab === "letra" ? (
              <>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-ink-soft">Letra</p>
                  <LyricEditor
                    label="Letra"
                    text={form.letra}
                    marks={[]}
                    showVoiceTools={false}
                    placeholder={"Primeira estrofe\n\nSegunda estrofe"}
                    minClass="min-h-48"
                    onChange={({ text }) =>
                      updateLyricsPart({
                        letra: text,
                        cifraLetra: syncChordLines(text, form.cifraLetra),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-center text-[0.78em] tracking-[0.16em] text-ink-soft">Refrão</p>
                  <LyricEditor
                    label="Texto do refrão"
                    text={form.refrao}
                    marks={[]}
                    showVoiceTools={false}
                    placeholder="Texto do refrão"
                    italic
                    onChange={({ text }) =>
                      updateLyricsPart({
                        refrao: text,
                        cifraRefrao: syncChordLines(text, form.cifraRefrao),
                      })
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
                          updateLyricsPart({ refraoPrimeiro: event.target.checked })
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
                          updateLyricsPart({ cronologica: event.target.checked })
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
              </>
            ) : contentTab === "arranjo" ? (
              <VocalArrangementEditor
                text={form.letraVozes}
                marks={form.vozesArranjo}
                somenteVozes={form.somenteVozes}
                onChange={({ text, marks }) =>
                  setForm((current) => ({
                    ...current,
                    letraVozes: text,
                    vozesArranjo: marks,
                  }))
                }
                onSomenteVozesChange={(somenteVozes) =>
                  setForm((current) => ({
                    ...current,
                    somenteVozes,
                  }))
                }
              />
            ) : (
              <>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-ink-soft">Cifra da letra</p>
                  <p className="text-xs leading-relaxed text-ink-soft">
                    Digite acordes acima de cada linha (C, Dm, F#m7, G7(9), C/E…). Use espaços para
                    alinhar. Na leitura, dá para mudar o tom da cifra.
                  </p>
                  <ChordEditor
                    label="Cifra da letra"
                    text={form.letra}
                    chords={form.cifraLetra}
                    onChange={(cifraLetra) => setForm((current) => ({ ...current, cifraLetra }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-center text-[0.78em] tracking-[0.16em] text-ink-soft">Refrão</p>
                  <ChordEditor
                    label="Cifra do refrão"
                    text={form.refrao}
                    chords={form.cifraRefrao}
                    italic
                    emptyHint="Escreva o refrão na aba Letra para cifrar aqui."
                    onChange={(cifraRefrao) => setForm((current) => ({ ...current, cifraRefrao }))}
                  />
                </div>
              </>
            )}

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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`h-9 rounded-[0.65rem] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine ${
        active ? "bg-card text-ink shadow-sm" : "text-ink-soft hover:text-ink"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
