"use client";

import { useState } from "react";
import { TIPOS_EQUIPO } from "@/lib/tipos";
import { NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import {
  IconoAlerta,
  IconoCheck,
  IconoDocumento,
  IconoLaptop,
  IconoMonitor,
  IconoWhatsApp,
} from "@/components/Iconos";

const ICONOS_TIPO = {
  Laptop: <IconoLaptop className="h-7 w-7" />,
  "PC de escritorio": <IconoMonitor className="h-7 w-7" />,
} as const;

// Las fallas que más se repiten en el taller: elegirlas es más rápido y más
// claro que pedirle a un cliente sin conocimientos técnicos que las describa.
const FALLAS_COMUNES = [
  "No enciende",
  "Va muy lenta",
  "Se apaga sola o se calienta",
  "Pantalla rota o con líneas",
  "No carga la batería",
  "Teclas que no responden",
  "Virus o publicidad molesta",
  "Quiero más RAM o un SSD",
  "Formateo e instalación de programas",
  "Le cayó líquido",
  "Hace ruidos raros",
  "No conecta al wifi",
];

type Errores = Partial<Record<"tipo" | "modelo" | "problema" | "nombre" | "whatsapp", string>>;

export default function Cotizacion() {
  const [tipo, setTipo] = useState("");
  const [fallas, setFallas] = useState<string[]>([]);
  const [detalle, setDetalle] = useState("");
  const [modelo, setModelo] = useState("");
  const [noSabeModelo, setNoSabeModelo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [waLink, setWaLink] = useState("");

  function alternarFalla(falla: string) {
    setFallas((previas) =>
      previas.includes(falla) ? previas.filter((f) => f !== falla) : [...previas, falla]
    );
    setErrores((e) => ({ ...e, problema: undefined }));
  }

  function describirProblema(): string {
    const listado = fallas.join(". ");
    const extra = detalle.trim();
    if (listado && extra) return `${listado}. ${extra}`;
    return listado || extra;
  }

  function validar(): Errores {
    const fallos: Errores = {};
    if (!tipo) fallos.tipo = "Elige si tu equipo es una laptop o una PC de escritorio.";
    if (!noSabeModelo && !modelo.trim())
      fallos.modelo = "Escribe el modelo o marca «No sé el modelo».";
    if (describirProblema().length < 10)
      fallos.problema = "Marca al menos una falla o cuéntanos qué le pasa a tu equipo.";
    if (nombre.trim().length < 2) fallos.nombre = "Escribe tu nombre.";
    if (whatsapp.replace(/\D/g, "").length < 7)
      fallos.whatsapp = "Necesitamos un número válido para poder responderte.";
    return fallos;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErrorGeneral("");

    const fallos = validar();
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) {
      document.getElementById("form-cotizacion")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // La pestaña se abre AHORA, mientras todavía estamos dentro del clic del
    // usuario: si se abriera después de guardar, el navegador la bloquearía.
    const pestana = window.open("", "_blank");
    setEnviando(true);

    const problema = describirProblema();

    try {
      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          modelo: modelo.trim(),
          sabe_modelo: !noSabeModelo,
          problema,
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });

      if (!res.ok) {
        pestana?.close();
        const { error } = await res
          .json()
          .catch(() => ({ error: "No pudimos enviar tu cotización." }));
        setErrorGeneral(error || "No pudimos enviar tu cotización.");
        return;
      }

      const link = enlaceWhatsApp(mensajeWhatsApp({ tipo, modelo, noSabeModelo, problema, nombre, whatsapp }));
      setWaLink(link);
      setEnviada(true);

      if (pestana) pestana.location.href = link;
    } catch {
      pestana?.close();
      setErrorGeneral("No pudimos enviar la cotización. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setTipo("");
    setFallas([]);
    setDetalle("");
    setModelo("");
    setNoSabeModelo(false);
    setNombre("");
    setWhatsapp("");
    setErrores({});
    setErrorGeneral("");
    setEnviada(false);
    setWaLink("");
  }

  return (
    <section className="px-5 py-16" id="cotizacion">
      <div className="mb-10 text-center">
        <span className="mb-4 inline-block rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
          Cotización gratis
        </span>
        <h2 className="text-3xl font-bold sm:text-4xl">Pide tu presupuesto</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Cuéntanos qué le pasa a tu equipo en menos de un minuto y te respondemos por WhatsApp,
          sin compromiso.
        </p>
      </div>

      <div className="beam-top mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-10">
        {enviada ? (
          <div className="aparecer py-6 text-center">
            <span className="mb-4 block text-5xl" aria-hidden>
              🎉
            </span>
            <h3 className="mb-2 text-2xl font-bold text-emerald-400">¡Ya casi está!</h3>
            <p className="mx-auto mb-7 max-w-md text-slate-400">
              Guardamos tu solicitud y abrimos WhatsApp con el mensaje escrito. Solo pulsa{" "}
              <b className="text-slate-100">Enviar</b> ahí para que nos llegue. ¿No se abrió?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa">
                <IconoWhatsApp className="h-5 w-5" />
                Enviar por WhatsApp
              </a>
              <button type="button" onClick={reiniciar} className="btn-plano">
                Enviar otra cotización
              </button>
            </div>
          </div>
        ) : (
          <form id="form-cotizacion" onSubmit={enviar} noValidate className="flex flex-col gap-7">
            <Paso numero={1} titulo="¿Qué tipo de equipo es?" error={errores.tipo}>
              <div className="grid grid-cols-2 gap-3">
                {TIPOS_EQUIPO.map((valor) => (
                  <button
                    type="button"
                    key={valor}
                    onClick={() => {
                      setTipo(valor);
                      setErrores((e) => ({ ...e, tipo: undefined }));
                    }}
                    aria-pressed={tipo === valor}
                    className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border p-5 transition ${
                      tipo === valor
                        ? "border-violet-500 bg-violet-500/10 text-slate-100 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
                    }`}
                  >
                    {ICONOS_TIPO[valor]}
                    <span className="text-sm font-semibold sm:text-base">{valor}</span>
                  </button>
                ))}
              </div>
            </Paso>

            <Paso numero={2} titulo="¿Qué le pasa a tu equipo?" error={errores.problema}>
              <p className="-mt-1 mb-3 text-sm text-slate-500">
                Marca todo lo que notes. Puedes elegir varias.
              </p>
              <div className="flex flex-wrap gap-2">
                {FALLAS_COMUNES.map((falla) => {
                  const marcada = fallas.includes(falla);
                  return (
                    <button
                      type="button"
                      key={falla}
                      onClick={() => alternarFalla(falla)}
                      aria-pressed={marcada}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition ${
                        marcada
                          ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
                      }`}
                    >
                      {marcada && <IconoCheck className="h-3.5 w-3.5" />}
                      {falla}
                    </button>
                  );
                })}
              </div>

              <label htmlFor="detalle" className="mt-4 mb-2 block text-sm text-slate-400">
                ¿Algo más que debamos saber? (opcional)
              </label>
              <textarea
                id="detalle"
                value={detalle}
                onChange={(e) => {
                  setDetalle(e.target.value);
                  setErrores((err) => ({ ...err, problema: undefined }));
                }}
                rows={3}
                maxLength={1000}
                placeholder="Ej: empezó después de una caída, ya le cambiaron el cargador…"
                aria-invalid={Boolean(errores.problema)}
                className="campo resize-y"
              />
            </Paso>

            <Paso numero={3} titulo="¿Qué modelo es?" error={errores.modelo}>
              <input
                id="modelo"
                value={modelo}
                onChange={(e) => {
                  setModelo(e.target.value);
                  setErrores((err) => ({ ...err, modelo: undefined }));
                }}
                disabled={noSabeModelo}
                type="text"
                maxLength={120}
                placeholder="Ej: HP Pavilion 15, Lenovo IdeaPad 3…"
                aria-invalid={Boolean(errores.modelo)}
                className="campo"
              />
              <label className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={noSabeModelo}
                  onChange={(e) => {
                    setNoSabeModelo(e.target.checked);
                    setErrores((err) => ({ ...err, modelo: undefined }));
                  }}
                  className="h-4 w-4 cursor-pointer accent-violet-500"
                />
                No sé el modelo de mi equipo
              </label>
            </Paso>

            <Paso numero={4} titulo="¿Cómo te contactamos?">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className="mb-2 block text-sm text-slate-400">
                    Tu nombre
                  </label>
                  <input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      setErrores((err) => ({ ...err, nombre: undefined }));
                    }}
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    placeholder="Nombre y apellido"
                    aria-invalid={Boolean(errores.nombre)}
                    className="campo"
                  />
                  {errores.nombre && <Aviso texto={errores.nombre} />}
                </div>
                <div>
                  <label htmlFor="whatsapp" className="mb-2 block text-sm text-slate-400">
                    Tu WhatsApp
                  </label>
                  <input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      setErrores((err) => ({ ...err, whatsapp: undefined }));
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={40}
                    placeholder="+591 7XXXXXXX"
                    aria-invalid={Boolean(errores.whatsapp)}
                    className="campo"
                  />
                  {errores.whatsapp && <Aviso texto={errores.whatsapp} />}
                </div>
              </div>
            </Paso>

            {errorGeneral && (
              <p
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                <IconoAlerta className="h-4 w-4 shrink-0" />
                {errorGeneral}
              </p>
            )}

            <div className="flex flex-col items-center gap-3">
              <button type="submit" className="btn-glow w-full sm:w-auto" disabled={enviando}>
                <span className="w-full !px-8 text-base">
                  <IconoDocumento className="h-5 w-5" />
                  {enviando ? "Enviando…" : "Enviar cotización"}
                </span>
              </button>
              <p className="text-center text-xs text-slate-500">
                Usamos tus datos solo para responderte por WhatsApp al {NEGOCIO.whatsappVisible}.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/* ══════════ Piezas del formulario ══════════ */

function Paso({
  numero,
  titulo,
  error,
  children,
}: {
  numero: number;
  titulo: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2.5 text-sm font-semibold text-slate-200">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {numero}
        </span>
        {titulo}
      </legend>
      {children}
      {error && <Aviso texto={error} />}
    </fieldset>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-300">
      <IconoAlerta className="h-4 w-4 shrink-0" />
      {texto}
    </p>
  );
}

/* ══════════ Mensaje que se manda por WhatsApp ══════════ */

function mensajeWhatsApp({
  tipo,
  modelo,
  noSabeModelo,
  problema,
  nombre,
  whatsapp,
}: {
  tipo: string;
  modelo: string;
  noSabeModelo: boolean;
  problema: string;
  nombre: string;
  whatsapp: string;
}): string {
  // Emojis escritos con \u{...} para que lleguen intactos sin importar la
  // codificación del archivo.
  const emojiEquipo = tipo === "Laptop" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";
  const modeloTexto = !noSabeModelo && modelo.trim() ? modelo.trim() : "No lo sé";

  return (
    `\u{1F44B} Hola ${NEGOCIO.nombre}, quiero una cotización:\n\n` +
    `${emojiEquipo} Equipo: ${tipo}\n` +
    `\u{1F3F7}\u{FE0F} Modelo: ${modeloTexto}\n` +
    `\u{1F527} Problema: ${problema}\n` +
    `\u{1F9D1} Mi nombre: ${nombre.trim()}\n` +
    `\u{1F4F1} Mi WhatsApp: ${whatsapp.trim()}`
  );
}
