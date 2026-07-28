"use client";

import { useMemo, useState } from "react";
import {
  ESTADOS,
  ESTADO_ENTREGADO,
  ESTADO_LISTO,
  ESTADO_MAXIMO,
  type Orden,
} from "@/lib/tipos";
import { enlaceWhatsAppCliente } from "@/lib/negocio";
import { enlaceSeguimiento, mensajeParaCliente } from "@/lib/mensajes";
import {
  IconoBasura,
  IconoCheck,
  IconoCopiar,
  IconoEditar,
  IconoLupa,
  IconoWhatsApp,
} from "@/components/Iconos";

type Filtro = "todas" | "proceso" | "listas" | "entregadas";

const FILTROS: Array<{ valor: Filtro; texto: string }> = [
  { valor: "todas", texto: "Todas" },
  { valor: "proceso", texto: "En proceso" },
  { valor: "listas", texto: "Listas para recoger" },
  { valor: "entregadas", texto: "Entregadas" },
];

function coincideConFiltro(orden: Orden, filtro: Filtro): boolean {
  if (filtro === "proceso") return orden.estado < ESTADO_LISTO;
  if (filtro === "listas") return orden.estado === ESTADO_LISTO;
  if (filtro === "entregadas") return orden.estado === ESTADO_ENTREGADO;
  return true;
}

export default function Ordenes({
  ordenes,
  filtro,
  alCambiarFiltro,
  alCambiarEstado,
  alEditar,
  alBorrar,
  avisar,
}: {
  ordenes: Orden[];
  filtro: Filtro;
  alCambiarFiltro: (filtro: Filtro) => void;
  alCambiarEstado: (codigo: string, estado: number) => Promise<void>;
  alEditar: (orden: Orden) => void;
  alBorrar: (codigo: string) => Promise<void>;
  avisar: (mensaje: string, tono?: "exito" | "error") => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return ordenes.filter((o) => {
      if (!coincideConFiltro(o, filtro)) return false;
      if (!texto) return true;
      return [o.codigo, o.cliente, o.telefono, o.equipo, o.servicio]
        .join(" ")
        .toLowerCase()
        .includes(texto);
    });
  }, [ordenes, filtro, busqueda]);

  async function copiarEnlace(codigo: string) {
    try {
      await navigator.clipboard.writeText(enlaceSeguimiento(codigo));
      avisar(`Enlace de seguimiento de ${codigo} copiado`);
    } catch {
      avisar("Tu navegador no permitió copiar el enlace", "error");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Órdenes registradas</h2>
          <p className="text-sm text-slate-400">
            Cambia el estado con el menú: se guarda solo y el cliente lo ve al instante.
          </p>
        </div>
        <div className="flex w-full items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 sm:w-56">
          <span className="ml-3.5 text-slate-400" aria-hidden>
            <IconoLupa className="h-4 w-4" />
          </span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            type="search"
            placeholder="Buscar código, cliente…"
            aria-label="Buscar órdenes"
            className="w-full bg-transparent px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map(({ valor, texto }) => {
          const cantidad = ordenes.filter((o) => coincideConFiltro(o, valor)).length;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => alCambiarFiltro(valor)}
              aria-pressed={filtro === valor}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                filtro === valor
                  ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
              }`}
            >
              {texto} <span className="opacity-60">({cantidad})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {visibles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
            {busqueda || filtro !== "todas"
              ? "Ninguna orden coincide con lo que buscas."
              : "Aún no hay órdenes registradas. Agrega la primera con el formulario de arriba."}
          </p>
        )}

        {visibles.map((orden) => {
          const waCliente = enlaceWhatsAppCliente(orden.telefono, mensajeParaCliente(orden));
          const puedeAvanzar = orden.estado < ESTADO_MAXIMO;

          return (
            <article
              key={orden.codigo}
              className={`rounded-2xl border p-4 transition ${
                orden.estado === ESTADO_LISTO
                  ? "border-emerald-400/40 bg-emerald-400/5"
                  : orden.estado === ESTADO_ENTREGADO
                    ? "border-white/10 bg-white/[0.02] opacity-70"
                    : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="font-bold text-cyan-400"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {orden.codigo}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{orden.cliente}</span>
                    {orden.telefono && (
                      <span className="text-xs text-slate-500">{orden.telefono}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {orden.equipo} · {orden.servicio}
                  </p>
                  {orden.recibido && (
                    <p className="mt-0.5 text-xs text-slate-500">Recibido: {orden.recibido}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={orden.estado}
                    onChange={(e) => void alCambiarEstado(orden.codigo, Number(e.target.value))}
                    aria-label={`Estado de la orden ${orden.codigo}`}
                    className="campo !py-2 w-full cursor-pointer text-sm sm:!w-48"
                  >
                    {ESTADOS.map((estado, i) => (
                      <option key={estado.nombre} value={i}>
                        {estado.icono} {estado.nombre}
                      </option>
                    ))}
                  </select>
                  {puedeAvanzar && (
                    <button
                      type="button"
                      onClick={() => void alCambiarEstado(orden.codigo, orden.estado + 1)}
                      title={`Avanzar a «${ESTADOS[orden.estado + 1].nombre}»`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300"
                    >
                      <IconoCheck className="h-4 w-4" />
                      <span className="sr-only">Avanzar al siguiente paso</span>
                    </button>
                  )}
                </div>
              </div>

              {confirmando === orden.codigo ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3">
                  <p className="text-sm text-red-200">
                    ¿Eliminar la orden {orden.codigo}? No se puede deshacer.
                  </p>
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmando(null)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-300 transition hover:text-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setConfirmando(null);
                        await alBorrar(orden.codigo);
                      }}
                      className="rounded-lg bg-red-500/80 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                  {waCliente ? (
                    <a
                      href={waCliente}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                    >
                      <IconoWhatsApp className="h-4 w-4" />
                      Avisar al cliente
                    </a>
                  ) : (
                    <span
                      title="Agrega el WhatsApp del cliente para poder avisarle"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-600"
                    >
                      <IconoWhatsApp className="h-4 w-4" />
                      Sin WhatsApp
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => void copiarEnlace(orden.codigo)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/30"
                  >
                    <IconoCopiar />
                    Copiar enlace
                  </button>

                  <button
                    type="button"
                    onClick={() => alEditar(orden)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/30"
                  >
                    <IconoEditar />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmando(orden.codigo)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-400 transition hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <IconoBasura />
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export type { Filtro };
