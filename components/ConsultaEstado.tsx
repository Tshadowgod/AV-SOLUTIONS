"use client";

import { useState } from "react";
import { ESTADOS, ESTADO_LISTO, ESTADO_ENTREGADO, type Orden } from "@/lib/tipos";
import { IconoLupa } from "@/components/Iconos";

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
    <section className="px-5 py-20 sm:px-8" id="consulta">
      <div className="mx-auto max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_20px_50px_rgba(12,18,34,0.06)] sm:p-11">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Seguimiento
          </p>
          <h2 className="mb-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            ¿Ya puedo recoger mi equipo?
          </h2>
          <p className="text-[var(--muted)]">
            Escribe el código de tu comprobante (por ejemplo{" "}
            <code className="rounded bg-teal-50 px-2 py-0.5 text-sm font-semibold text-[var(--accent)]">
              AV-1001
            </code>
            ).
          </p>
        </div>

        <form
          onSubmit={consultar}
          className="flex flex-col gap-3 sm:flex-row"
          autoComplete="off"
        >
          <div className="flex flex-1 items-center rounded-md border border-[var(--line)] bg-[var(--paper)] transition focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(15,118,110,0.15)]">
            <span className="ml-3.5 text-[var(--muted)]">
              <IconoLupa />
            </span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              type="text"
              placeholder="Código de orden…"
              maxLength={12}
              required
              aria-label="Código de orden"
              className="flex-1 bg-transparent px-3 py-3.5 uppercase text-[var(--ink)] outline-none placeholder:normal-case placeholder:text-slate-400"
            />
          </div>
          <button type="submit" className="btn-taller justify-center sm:min-w-[140px]" disabled={cargando}>
            {cargando ? "Buscando…" : "Consultar"}
          </button>
        </form>

        {cargando && (
          <div className="mt-9 flex flex-col items-center gap-4 text-[var(--muted)]" aria-live="polite">
            <div className="loader-ring" />
            <p>Buscando tu equipo…</p>
          </div>
        )}

        {orden && <Resultado orden={orden} />}

        {noEncontrada && (
          <div className="aparecer mt-9 rounded-md border border-dashed border-rose-300 bg-rose-50 p-7 text-center">
            <h3 className="mb-1.5 text-lg font-bold text-rose-800">No encontramos esa orden</h3>
            <p className="text-sm text-rose-700/80">
              Revisa que el código esté bien escrito. Si el problema continúa,{" "}
              <a href="#contacto" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
                contáctanos
              </a>{" "}
              y te ayudamos.
            </p>
          </div>
        )}

        {errorServidor && (
          <div className="aparecer mt-9 rounded-md border border-dashed border-amber-300 bg-amber-50 p-7 text-center">
            <h3 className="mb-1.5 text-lg font-bold text-amber-900">Algo salió mal</h3>
            <p className="text-sm text-amber-800/80">
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
  let claseBanner = "border-amber-200 bg-amber-50";
  let claseTitulo = "text-amber-800";

  if (esListo) {
    titulo = "¡Tu equipo está listo!";
    mensaje = "Ya puedes pasar a recogerlo en nuestro horario de atención.";
    claseBanner = "border-emerald-200 bg-emerald-50";
    claseTitulo = "text-emerald-800";
  } else if (esEntregado) {
    titulo = "Equipo entregado";
    mensaje = "Esta orden ya fue completada y entregada. ¡Gracias por tu preferencia!";
    claseBanner = "border-slate-200 bg-slate-50";
    claseTitulo = "text-slate-700";
  }

  if (orden.nota) mensaje = orden.nota;

  const progreso = (orden.estado / (ESTADOS.length - 1)) * 80;

  const datos: Array<[string, string]> = [
    ["Orden", orden.codigo],
    ["Cliente", orden.cliente],
    ["Equipo", orden.equipo],
    ["Servicio", orden.servicio],
    ["Recibido", orden.recibido],
  ];

  return (
    <div className="aparecer mt-9" aria-live="polite">
      <div className={`mb-6 flex items-start gap-4 rounded-md border p-5 ${claseBanner}`}>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/80 text-lg font-bold"
          style={{ fontFamily: "var(--font-syne)" }}
          aria-hidden="true"
        >
          {esListo ? "OK" : esEntregado ? "✓" : estado.nombre.charAt(0)}
        </span>
        <div>
          <h3 className={`text-xl font-bold ${claseTitulo}`}>{titulo}</h3>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{mensaje}</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-md border border-[var(--line)] bg-[var(--paper)] px-4 py-3.5">
            <span className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-widest text-[var(--muted)]">
              {etiqueta}
            </span>
            <span className="text-sm font-semibold">{valor}</span>
          </div>
        ))}
      </div>

      <div className="relative mx-1 flex justify-between">
        <div className="absolute left-[10%] right-[10%] top-4 h-[3px] rounded bg-[var(--line)]" />
        <div
          className="absolute left-[10%] top-4 h-[3px] rounded bg-[var(--accent)] transition-all duration-700"
          style={{ width: `${progreso}%` }}
        />
        {ESTADOS.map((e, i) => {
          const hecho = i < orden.estado;
          const actual = i === orden.estado;
          return (
            <div key={e.nombre} className="relative z-10 flex w-1/5 flex-col items-center gap-2 text-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  hecho || actual
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--muted)]"
                } ${actual ? "paso-actual" : ""}`}
              >
                {hecho ? "✓" : i + 1}
              </div>
              <span
                className={`text-[0.65rem] leading-tight sm:text-xs ${
                  hecho || actual ? "font-semibold text-[var(--ink)]" : "text-[var(--muted)]"
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
