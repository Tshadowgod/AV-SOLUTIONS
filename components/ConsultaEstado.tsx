"use client";

import { useState } from "react";
import { ESTADOS, ESTADO_LISTO, ESTADO_ENTREGADO, type Orden } from "@/lib/tipos";
import { IconoChat, IconoLupa, IconoPin } from "@/components/Iconos";
import { NEGOCIO, crearEnlaceWhatsApp } from "@/lib/config";

export default function ConsultaEstado() {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState<Orden | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [errorServidor, setErrorServidor] = useState(false);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const buscado = codigo.trim().toUpperCase();
    if (!buscado) return;

    setCargando(true);
    setOrden(null);
    setNoEncontrada(false);
    setErrorServidor(false);

    try {
      const res = await fetch(`/api/consulta/${encodeURIComponent(buscado)}`);
      if (res.ok) {
        setOrden(await res.json());
      } else if (res.status === 404) {
        setNoEncontrada(true);
      } else {
        setErrorServidor(true);
      }
    } catch {
      setErrorServidor(true);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="px-5 pb-20 pt-8" id="consulta">
      <div className="beam-top mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-13">
        <div className="mb-8 text-center">
          <h2 className="mb-2.5 text-2xl font-bold sm:text-3xl">
            ¿Ya puedo recoger mi equipo?
          </h2>
          <p className="text-slate-400">
            Escribe el código que aparece en tu comprobante (por ejemplo{" "}
            <code className="rounded-md bg-violet-500/20 px-2 py-0.5 text-sm text-violet-300">
              AV-1001
            </code>
            ).
          </p>
        </div>

        <form onSubmit={consultar} className="mx-auto flex max-w-xl flex-col gap-3.5 sm:flex-row" autoComplete="off">
          <label htmlFor="codigo-orden" className="sr-only">Código de orden</label>
          <div className="flex flex-1 items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.18),0_0_22px_rgba(139,92,246,0.28)]">
            <span className="ml-4 text-slate-400" aria-hidden="true"><IconoLupa /></span>
            <input
              id="codigo-orden"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              type="text"
              inputMode="text"
              placeholder="Código de orden…"
              maxLength={12}
              required
              aria-describedby="ayuda-codigo"
              className="flex-1 bg-transparent px-3 py-3.5 uppercase text-slate-100 outline-none placeholder:normal-case placeholder:text-slate-500"
            />
          </div>
          <button type="submit" className="btn-glow" disabled={cargando}>
            <span className="justify-center">Consultar</span>
          </button>
        </form>

        {cargando && (
          <div className="mt-9 flex flex-col items-center gap-4 text-slate-400" aria-live="polite">
            <div className="loader-ring" />
            <p>Buscando tu equipo…</p>
          </div>
        )}

        {orden && <Resultado orden={orden} />}

        <span id="ayuda-codigo" className="sr-only">El código aparece en tu comprobante, por ejemplo AV-1001.</span>

        {noEncontrada && (
          <div className="aparecer mt-9 rounded-2xl border border-dashed border-pink-500/40 bg-pink-500/5 p-8 text-center" role="alert">
            <span className="mb-2 block text-4xl">🤔</span>
            <h3 className="mb-1.5 text-lg font-bold">No encontramos esa orden</h3>
            <p className="text-sm text-slate-400">
              Revisa que el código esté bien escrito. Si el problema continúa,{" "}
              <a href="#contacto" className="text-cyan-400 underline-offset-2 hover:underline">contáctanos</a>{" "}
              y te ayudamos.
            </p>
          </div>
        )}

        {errorServidor && (
          <div className="aparecer mt-9 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-8 text-center" role="alert">
            <span className="mb-2 block text-4xl">⚠️</span>
            <h3 className="mb-1.5 text-lg font-bold">Algo salió mal</h3>
            <p className="text-sm text-slate-400">
              No pudimos consultar en este momento. Intenta de nuevo en unos segundos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Resultado({ orden }: { orden: Orden }) {
  const estado = ESTADOS[orden.estado] ?? ESTADOS[0];
  const esListo = orden.estado === ESTADO_LISTO;
  const esEntregado = orden.estado === ESTADO_ENTREGADO;

  let titulo = `Tu equipo está: ${estado.nombre.toLowerCase()}`;
  let mensaje = "Aún estamos trabajando en tu equipo. Vuelve a consultar pronto.";
  let claseBanner = "border-amber-400/30 bg-amber-400/10";
  let claseTitulo = "text-amber-400";

  if (esListo) {
    titulo = "¡Tu equipo está listo! 🎉";
    mensaje = "Ya puedes pasar a recogerlo en nuestro horario de atención.";
    claseBanner = "border-emerald-400/35 bg-emerald-400/10 shadow-[inset_0_0_34px_rgba(52,211,153,0.12)]";
    claseTitulo = "text-emerald-400";
  } else if (esEntregado) {
    titulo = "Equipo entregado";
    mensaje = "Esta orden ya fue completada y entregada. ¡Gracias por tu preferencia!";
    claseBanner = "border-slate-400/25 bg-slate-400/10";
    claseTitulo = "text-slate-200";
  }

  if (orden.nota) mensaje = orden.nota;

  const progreso = (orden.estado / (ESTADOS.length - 1)) * 88;

  const datos: Array<[string, string]> = [
    ["Orden", orden.codigo],
    ["Equipo", orden.equipo],
    ["Servicio", orden.servicio],
    ["Recibido", orden.recibido],
  ];

  return (
    <div className="aparecer mt-9" aria-live="polite">
      {/* Banner de estado */}
      <div className={`mb-6 flex items-center gap-4 rounded-2xl border p-5 ${claseBanner}`}>
        <span className="text-4xl" aria-hidden="true">{estado.icono}</span>
        <div>
          <h3 className={`text-xl font-bold ${claseTitulo}`}>{titulo}</h3>
          <p className="text-sm text-slate-400">{mensaje}</p>
        </div>
      </div>

      {esListo && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <a
            href={NEGOCIO.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/15"
          >
            <IconoPin className="h-5 w-5" /> Cómo llegar al taller
          </a>
          <a
            href={crearEnlaceWhatsApp(`Hola AV SOLUTIONS, mi orden ${orden.codigo} aparece lista. Quisiera coordinar el recojo.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
          >
            <IconoChat className="h-5 w-5" /> Coordinar recojo
          </a>
        </div>
      )}

      {/* Datos de la orden */}
      <div className="mb-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
            <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">
              {etiqueta}
            </span>
            <span className="text-sm font-semibold">{valor}</span>
          </div>
        ))}
      </div>

      {/* Línea de tiempo */}
      <div className="relative mx-1.5 flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0" aria-label={`Progreso de la orden: ${estado.nombre}`}>
        <div className="absolute bottom-5 left-4 top-5 w-[3px] rounded bg-white/10 sm:bottom-auto sm:left-[6%] sm:right-[6%] sm:top-4 sm:h-[3px] sm:w-auto" />
        <div
          className="absolute left-4 top-5 w-[3px] rounded bg-gradient-to-b from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.7)] transition-all duration-700 sm:hidden"
          style={{
            height:
              orden.estado === 0
                ? "0"
                : `calc(${(orden.estado / (ESTADOS.length - 1)) * 100}% - 1.25rem)`,
          }}
        />
        <div
          className="absolute left-[6%] top-4 hidden h-[3px] rounded bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.7)] transition-all duration-700 sm:block"
          style={{ width: `${progreso}%` }}
        />
        {ESTADOS.map((e, i) => {
          const hecho = i < orden.estado;
          const actual = i === orden.estado;
          return (
            <div key={e.nombre} className="relative z-10 flex min-h-14 items-center gap-3 text-left sm:w-1/5 sm:flex-col sm:gap-2 sm:text-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                  hecho || actual
                    ? "border-transparent bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                    : "border-white/10 bg-[#0d1322] text-slate-400"
                } ${actual ? "paso-actual" : ""}`}
              >
                {hecho ? "✓" : e.icono}
              </div>
              <span
                className={`text-sm leading-tight sm:text-xs ${
                  hecho || actual ? "font-semibold text-slate-100" : "text-slate-400"
                }`}
              >
                {e.nombre}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
