"use client";

import { useState } from "react";
import { IconoLaptop, IconoMonitor, IconoChat } from "@/components/Iconos";
import { WHATSAPP_NUMERO } from "@/lib/negocio";
import RevealOnScroll from "@/components/RevealOnScroll";
import {
  MARCAS_COMUNES,
  SERVICIOS_COMUNES,
  ID_MODELO_OTRO,
  ID_MODELO_NO_SE,
  ID_SERVICIO_OTRO,
  textoModeloFinal,
  textoServicioFinal,
} from "@/lib/cotizacion-opciones";

const TIPOS = [
  { valor: "Laptop", icono: <IconoLaptop className="w-7 h-7" /> },
  { valor: "PC de escritorio", icono: <IconoMonitor className="w-7 h-7" /> },
];

function claseChip(activo: boolean) {
  return `cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
    activo
      ? "border-violet-500 bg-violet-500/15 text-slate-100 shadow-[0_0_16px_rgba(139,92,246,0.2)]"
      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
  }`;
}

export default function Cotizacion() {
  const [tipo, setTipo] = useState("");
  const [modeloSel, setModeloSel] = useState("");
  const [modeloOtro, setModeloOtro] = useState("");
  const [serviciosSel, setServiciosSel] = useState<string[]>([]);
  const [servicioOtro, setServicioOtro] = useState("");
  const [detalleExtra, setDetalleExtra] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tipo) {
      setError("Elige si tu equipo es una laptop o una PC de escritorio.");
      return;
    }
    if (!modeloSel) {
      setError("Selecciona la marca de tu equipo o elige «Otra marca» / «No sé la marca».");
      return;
    }
    if (modeloSel === ID_MODELO_OTRO && !modeloOtro.trim()) {
      setError("Escribe la marca de tu equipo en el campo «Otra marca».");
      return;
    }
    if (serviciosSel.length === 0) {
      setError("Selecciona al menos un servicio o elige «Otro» para describirlo.");
      return;
    }
    const soloOtro =
      serviciosSel.length === 1 && serviciosSel[0] === ID_SERVICIO_OTRO;
    if (soloOtro && !servicioOtro.trim()) {
      setError("Describe qué necesitas en el campo «Otro».");
      return;
    }

    const { modelo, sabe_modelo } = textoModeloFinal(modeloSel, modeloOtro);
    const problema = textoServicioFinal(serviciosSel, servicioOtro, detalleExtra);
    if (!problema.trim()) {
      setError("Indica qué necesitas o escribe un detalle en «Otro».");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          modelo,
          sabe_modelo,
          problema,
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });
      if (res.ok) {
        const modeloTexto = sabe_modelo && modelo ? modelo : "No lo sé";
        const emEquipo = tipo === "Laptop" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";
        const mensaje =
          `\u{1F44B} Hola AV SOLUTIONS, quiero una cotización:\n\n` +
          `${emEquipo} Equipo: ${tipo}\n` +
          `\u{1F3F7}\u{FE0F} Marca: ${modeloTexto}\n` +
          `\u{1F527} Necesito: ${problema}\n` +
          `\u{1F9D1} Mi nombre: ${nombre.trim()}\n` +
          `\u{1F4F1} Mi WhatsApp: ${whatsapp.trim()}`;
        const link = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
        setWaLink(link);
        setEnviada(true);
        window.open(link, "_blank");
      } else {
        const { error } = await res.json().catch(() => ({ error: "No se pudo enviar" }));
        setError(error);
      }
    } catch {
      setError("No pudimos enviar la cotización. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setTipo("");
    setModeloSel("");
    setModeloOtro("");
    setServiciosSel([]);
    setServicioOtro("");
    setDetalleExtra("");
    setNombre("");
    setWhatsapp("");
    setEnviada(false);
    setError("");
  }

  function toggleServicio(id: string) {
    setServiciosSel((prev) => {
      const activo = prev.includes(id);
      if (activo) {
        if (id === ID_SERVICIO_OTRO) setServicioOtro("");
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }

  const tienePresets = serviciosSel.some((id) => id !== ID_SERVICIO_OTRO);
  const tieneOtro = serviciosSel.includes(ID_SERVICIO_OTRO);

  const inputClase =
    "w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";

  return (
    <section className="px-5 py-16" id="cotizacion">
      <RevealOnScroll>
        <div className="mb-11 text-center">
          <span className="mb-4 inline-block rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
            Cotización gratis
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">Realizar cotización</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Elige las opciones más cercanas a tu equipo y te enviamos un presupuesto sin compromiso por WhatsApp.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={150} variante="escala">
        <div className="beam-top mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-12">
          {enviada ? (
            <div className="aparecer py-8 text-center">
              <span className="mb-4 block text-5xl">🎉</span>
              <h3 className="mb-2 text-2xl font-bold text-emerald-400">¡Ya casi está!</h3>
              <p className="mx-auto mb-7 max-w-md text-slate-400">
                Se abrió WhatsApp con tu cotización lista. Solo pulsa <b className="text-slate-100">Enviar</b> ahí
                para mandárnosla. ¿No se abrió? Usa el botón:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400"
                >
                  <IconoChat className="h-5 w-5" /> Enviar por WhatsApp
                </a>
                <button type="button" onClick={reiniciar} className="btn-glow">
                  <span>Enviar otra cotización</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={enviar} className="flex flex-col gap-6">
              {/* Tipo de equipo */}
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                  1. ¿Qué tipo de equipo es?
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  {TIPOS.map((t) => (
                    <button
                      type="button"
                      key={t.valor}
                      onClick={() => setTipo(t.valor)}
                      className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border p-5 transition ${
                        tipo === t.valor
                          ? "border-violet-500 bg-violet-500/10 text-slate-100 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
                      }`}
                    >
                      {t.icono}
                      <span className="font-semibold">{t.valor}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Marca */}
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                  2. ¿Qué marca es tu equipo?
                </label>
                <p className="mb-3 text-xs text-slate-500">
                  Elige la marca (HP, Lenovo, Mac…). Si no está en la lista, selecciona «Otra marca».
                </p>
                <div className="flex flex-wrap gap-2">
                  {MARCAS_COMUNES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setModeloSel(m.id);
                        setModeloOtro("");
                      }}
                      className={claseChip(modeloSel === m.id)}
                    >
                      {m.etiqueta}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setModeloSel(ID_MODELO_OTRO)}
                    className={claseChip(modeloSel === ID_MODELO_OTRO)}
                  >
                    Otra marca
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModeloSel(ID_MODELO_NO_SE);
                      setModeloOtro("");
                    }}
                    className={claseChip(modeloSel === ID_MODELO_NO_SE)}
                  >
                    No sé la marca
                  </button>
                </div>
                {modeloSel === ID_MODELO_OTRO && (
                  <input
                    value={modeloOtro}
                    onChange={(e) => setModeloOtro(e.target.value)}
                    type="text"
                    placeholder="Escribe la marca, ej: Sony, LG, Gateway…"
                    className={`${inputClase} mt-3`}
                    autoFocus
                  />
                )}
              </div>

              {/* Servicio / problema */}
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                  3. ¿Qué necesitas?
                </label>
                <p className="mb-3 text-xs text-slate-500">
                  Puedes elegir varias opciones. Si necesitas algo más, marca «Otro» y descríbelo.
                  {serviciosSel.length > 0 && (
                    <span className="ml-1 font-medium text-violet-300">
                      ({serviciosSel.length} seleccionada{serviciosSel.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SERVICIOS_COMUNES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleServicio(s.id)}
                      className={claseChip(serviciosSel.includes(s.id))}
                      title={s.detalle}
                      aria-pressed={serviciosSel.includes(s.id)}
                    >
                      {serviciosSel.includes(s.id) && <span className="mr-1">✓</span>}
                      {s.etiqueta}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => toggleServicio(ID_SERVICIO_OTRO)}
                    className={claseChip(tieneOtro)}
                    aria-pressed={tieneOtro}
                  >
                    {tieneOtro && <span className="mr-1">✓</span>}
                    Otro
                  </button>
                </div>
                {tieneOtro && (
                  <textarea
                    value={servicioOtro}
                    onChange={(e) => setServicioOtro(e.target.value)}
                    rows={3}
                    placeholder="Describe qué más necesitas…"
                    className={`${inputClase} mt-3 resize-y`}
                  />
                )}
                {tienePresets && (
                  <textarea
                    value={detalleExtra}
                    onChange={(e) => setDetalleExtra(e.target.value)}
                    rows={2}
                    placeholder="Detalle adicional (opcional): ej. «hace ruido el ventilador»"
                    className={`${inputClase} mt-3 resize-y`}
                  />
                )}
              </div>

              {/* Contacto */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-sm font-semibold text-slate-300">Tu nombre</label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    type="text"
                    placeholder="Nombre completo"
                    className={inputClase}
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-sm font-semibold text-slate-300">Tu WhatsApp</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    type="tel"
                    placeholder="+591 …"
                    className={inputClase}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  ⚠️ {error}
                </p>
              )}

              <div className="flex justify-center">
                <button type="submit" className="btn-glow" disabled={enviando}>
                  <span className="px-3 py-1 text-base">
                    {enviando ? "Enviando…" : "Enviar cotización"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
