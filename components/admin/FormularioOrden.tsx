"use client";

import { useEffect, useRef } from "react";
import { ESTADOS, type Orden } from "@/lib/tipos";
import { IconoCheck, IconoDocumento, IconoEditar, IconoRefrescar } from "@/components/Iconos";

export type ModoFormulario = "nueva" | "editar" | "convertir";

const TITULOS: Record<ModoFormulario, { icono: React.ReactNode; ayuda: string }> = {
  nueva: {
    icono: <IconoDocumento className="h-5 w-5" />,
    ayuda: "Registra el equipo que acaba de dejar un cliente.",
  },
  editar: {
    icono: <IconoEditar className="h-5 w-5" />,
    ayuda: "Modifica los datos y guarda los cambios.",
  },
  convertir: {
    icono: <IconoRefrescar className="h-5 w-5" />,
    ayuda: "Revisa los datos que mandó el cliente y guárdalos como orden registrada.",
  },
};

export default function FormularioOrden({
  modo,
  valores,
  guardando,
  alCambiar,
  alGuardar,
  alCancelar,
  fechaDeHoy,
}: {
  modo: ModoFormulario;
  valores: Orden;
  guardando: boolean;
  alCambiar: (orden: Orden) => void;
  alGuardar: (e: React.FormEvent) => void;
  alCancelar: () => void;
  fechaDeHoy: () => string;
}) {
  const contenedor = useRef<HTMLElement>(null);

  // Al pasar a editar o convertir, el formulario se trae a la vista solo.
  useEffect(() => {
    if (modo !== "nueva") {
      contenedor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [modo, valores.codigo]);

  const titulo =
    modo === "editar"
      ? `Editando ${valores.codigo}`
      : modo === "convertir"
        ? "Convertir cotización en orden"
        : "Nueva orden";

  const campo = (
    etiqueta: string,
    clave: keyof Pick<Orden, "codigo" | "cliente" | "telefono" | "equipo" | "servicio" | "nota">,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {etiqueta}
      <input
        value={valores[clave]}
        onChange={(e) => alCambiar({ ...valores, [clave]: e.target.value })}
        className="campo !py-2.5 text-sm font-normal normal-case tracking-normal"
        {...props}
      />
    </label>
  );

  return (
    <section
      ref={contenedor}
      className={`mb-6 rounded-3xl border p-6 backdrop-blur sm:p-7 ${
        modo === "nueva"
          ? "border-white/10 bg-white/[0.04]"
          : "border-violet-500/40 bg-violet-500/[0.06]"
      }`}
    >
      <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
        <span className="text-cyan-400">{TITULOS[modo].icono}</span>
        {titulo}
      </h2>
      <p className="mb-5 text-sm text-slate-400">{TITULOS[modo].ayuda}</p>

      <form onSubmit={alGuardar} className="grid gap-4 sm:grid-cols-2">
        {campo("Código", "codigo", { required: true, placeholder: "AV-1001", maxLength: 20 })}
        {campo("Cliente", "cliente", {
          required: true,
          placeholder: "Nombre del cliente",
          maxLength: 120,
        })}
        {campo("WhatsApp del cliente", "telefono", {
          type: "tel",
          placeholder: "+591 7XXXXXXX",
          maxLength: 40,
        })}
        {campo("Equipo", "equipo", {
          required: true,
          placeholder: "Laptop HP Pavilion 15",
          maxLength: 160,
        })}
        {campo("Servicio", "servicio", {
          required: true,
          placeholder: "Mantenimiento preventivo",
          maxLength: 200,
        })}

        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fecha de recepción
          <span className="flex gap-2">
            <input
              required
              value={valores.recibido}
              onChange={(e) => alCambiar({ ...valores, recibido: e.target.value })}
              maxLength={40}
              className="campo !py-2.5 text-sm font-normal normal-case tracking-normal"
            />
            <button
              type="button"
              onClick={() => alCambiar({ ...valores, recibido: fechaDeHoy() })}
              className="shrink-0 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300"
            >
              Hoy
            </button>
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Estado
          <select
            value={valores.estado}
            onChange={(e) => alCambiar({ ...valores, estado: Number(e.target.value) })}
            className="campo !py-2.5 cursor-pointer text-sm font-normal normal-case tracking-normal"
          >
            {ESTADOS.map((estado, i) => (
              <option key={estado.nombre} value={i}>
                {estado.icono} {estado.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          {campo("Nota para el cliente (opcional)", "nota", {
            placeholder: "Ej: Trae tu comprobante al recoger",
            maxLength: 300,
          })}
        </div>

        <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
          {modo !== "nueva" && (
            <button type="button" onClick={alCancelar} className="btn-plano !px-5 !py-2.5 text-sm">
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-glow" disabled={guardando}>
            <span className="!px-6 !py-2.5 text-sm">
              <IconoCheck className="h-4 w-4" />
              {guardando ? "Guardando…" : modo === "editar" ? "Actualizar orden" : "Guardar orden"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}
