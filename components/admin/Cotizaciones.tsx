"use client";

import { useState } from "react";
import type { Cotizacion } from "@/lib/tipos";
import { enlaceWhatsAppCliente } from "@/lib/negocio";
import {
  IconoBasura,
  IconoCheck,
  IconoRefrescar,
  IconoUsuario,
  IconoWhatsApp,
} from "@/components/Iconos";

function fechaLegible(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

export default function Cotizaciones({
  cotizaciones,
  alConvertir,
  alMarcar,
  alBorrar,
}: {
  cotizaciones: Cotizacion[];
  alConvertir: (cotizacion: Cotizacion) => void;
  alMarcar: (id: number, atendida: boolean) => Promise<void>;
  alBorrar: (id: number) => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const [soloPendientes, setSoloPendientes] = useState(false);

  const pendientes = cotizaciones.filter((c) => !c.atendida).length;
  const visibles = soloPendientes ? cotizaciones.filter((c) => !c.atendida) : cotizaciones;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2.5 text-lg font-bold">
            Cotizaciones recibidas
            {pendientes > 0 && (
              <span className="rounded-full bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-300">
                {pendientes} sin atender
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400">
            Solicitudes que llegaron desde la página. Respóndelas y conviértelas en órdenes.
          </p>
        </div>
        {cotizaciones.length > 0 && (
          <button
            type="button"
            onClick={() => setSoloPendientes((v) => !v)}
            aria-pressed={soloPendientes}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
              soloPendientes
                ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-200"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
            }`}
          >
            Solo sin atender
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {visibles.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
            {soloPendientes
              ? "No queda ninguna cotización sin atender. ¡Bien ahí!"
              : "Aún no llegan cotizaciones. Cuando un cliente envíe una desde la página, aparecerá aquí."}
          </p>
        )}

        {visibles.map((c) => {
          const waCliente = enlaceWhatsAppCliente(
            c.whatsapp,
            `\u{1F44B} Hola ${c.nombre}, te escribimos por la cotización que nos enviaste para tu ${c.tipo.toLowerCase()}.`
          );

          return (
            <article
              key={c.id}
              className={`rounded-2xl border p-5 transition ${
                c.atendida
                  ? "border-white/10 bg-white/[0.02] opacity-70"
                  : "border-violet-500/30 bg-violet-500/[0.06]"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-cyan-400">
                    {c.tipo}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                    <IconoUsuario className="h-4 w-4 text-slate-500" />
                    {c.nombre}
                  </span>
                  {c.atendida && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <IconoCheck className="h-3.5 w-3.5" /> Atendida
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{fechaLegible(c.creado)}</span>
              </div>

              <p className="mb-3 whitespace-pre-line text-sm text-slate-300">{c.problema}</p>

              <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
                <span>
                  <b className="text-slate-300">Modelo:</b>{" "}
                  {c.sabe_modelo && c.modelo ? c.modelo : "No lo sabe"}
                </span>
                <span>
                  <b className="text-slate-300">WhatsApp:</b> {c.whatsapp}
                </span>
              </div>

              {confirmando === c.id ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3">
                  <p className="text-sm text-red-200">
                    ¿Eliminar la cotización de {c.nombre}? No se puede deshacer.
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
                        await alBorrar(c.id);
                      }}
                      className="rounded-lg bg-red-500/80 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Sí, eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {waCliente && (
                    <a
                      href={waCliente}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                    >
                      <IconoWhatsApp className="h-4 w-4" />
                      Responder
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => alConvertir(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-400/10 px-3 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
                  >
                    <IconoRefrescar />
                    Convertir a orden
                  </button>
                  <button
                    type="button"
                    onClick={() => void alMarcar(c.id, !c.atendida)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-slate-300 transition hover:border-white/30"
                  >
                    {c.atendida ? "Reabrir" : "Marcar atendida"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(c.id)}
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
