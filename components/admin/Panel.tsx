"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ESTADO_ENTREGADO,
  ESTADO_LISTO,
  ESTADOS,
  normalizarCodigo,
  type Cotizacion,
  type Orden,
} from "@/lib/tipos";
import { IconoAlerta, IconoCheck, IconoRefrescar, LogoAV } from "@/components/Iconos";
import FormularioOrden, { type ModoFormulario } from "@/components/admin/FormularioOrden";
import Ordenes, { type Filtro } from "@/components/admin/Ordenes";
import Cotizaciones from "@/components/admin/Cotizaciones";

const ORDEN_VACIA: Orden = {
  codigo: "",
  cliente: "",
  telefono: "",
  equipo: "",
  servicio: "",
  recibido: "",
  estado: 0,
  nota: "",
};

function fechaHoy(): string {
  const hoy = new Date();
  const mes = hoy.toLocaleDateString("es-ES", { month: "long" });
  return `${hoy.getDate()} de ${mes}, ${hoy.getFullYear()}`;
}

type Aviso = { texto: string; tono: "exito" | "error" };

export default function Panel({
  ordenes,
  cotizaciones,
  recargar,
  alSalir,
}: {
  ordenes: Orden[];
  cotizaciones: Cotizacion[];
  recargar: () => Promise<boolean>;
  alSalir: () => Promise<void>;
}) {
  const [pestana, setPestana] = useState<"ordenes" | "cotizaciones">("ordenes");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [modo, setModo] = useState<ModoFormulario>("nueva");
  const [form, setForm] = useState<Orden>({ ...ORDEN_VACIA, recibido: fechaHoy() });
  // Código con el que se abrió la edición: es el que identifica la orden en la
  // API aunque el usuario le cambie el código en el formulario.
  const [codigoOriginal, setCodigoOriginal] = useState("");
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function avisar(texto: string, tono: "exito" | "error" = "exito") {
    setAviso({ texto, tono });
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAviso(null), 3200);
  }

  function limpiarFormulario() {
    setModo("nueva");
    setConvirtiendo(null);
    setCodigoOriginal("");
    setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
  }

  function siguienteCodigo(): string {
    const numeros = ordenes
      .map((o) => Number.parseInt(o.codigo.match(/(\d+)$/)?.[1] ?? "", 10))
      .filter((n) => Number.isFinite(n));
    return `AV-${numeros.length ? Math.max(...numeros) + 1 : 1001}`;
  }

  const estadisticas = [
    { valor: ordenes.length, texto: "Órdenes totales", filtro: "todas" as Filtro, color: "text-slate-100" },
    {
      valor: ordenes.filter((o) => o.estado < ESTADO_LISTO).length,
      texto: "En proceso",
      filtro: "proceso" as Filtro,
      color: "text-amber-400",
    },
    {
      valor: ordenes.filter((o) => o.estado === ESTADO_LISTO).length,
      texto: "Listas para recoger",
      filtro: "listas" as Filtro,
      color: "text-emerald-400",
    },
    {
      valor: ordenes.filter((o) => o.estado === ESTADO_ENTREGADO).length,
      texto: "Entregadas",
      filtro: "entregadas" as Filtro,
      color: "text-slate-400",
    },
  ];

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);

    const cuerpo = { ...form, codigo: normalizarCodigo(form.codigo) };
    const editando = modo === "editar";

    try {
      const res = editando
        ? await fetch(`/api/admin/ordenes/${encodeURIComponent(codigoOriginal)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo),
          })
        : await fetch("/api/admin/ordenes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo),
          });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
        avisar(error || "Error al guardar", "error");
        return;
      }

      if (convirtiendo !== null && !editando) {
        await fetch(`/api/admin/cotizaciones/${convirtiendo}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atendida: true }),
        });
      }

      avisar(
        editando
          ? `Orden ${cuerpo.codigo} actualizada`
          : convirtiendo !== null
            ? `Cotización convertida en la orden ${cuerpo.codigo}`
            : `Orden ${cuerpo.codigo} registrada`
      );
      limpiarFormulario();
      await recargar();
    } catch {
      avisar("Sin conexión con el servidor", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(codigo: string, estado: number) {
    try {
      const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      if (!res.ok) {
        avisar("No se pudo actualizar el estado", "error");
        return;
      }

      avisar(
        estado === ESTADO_LISTO
          ? `${codigo}: listo para recoger — avisa al cliente`
          : `${codigo} pasó a «${ESTADOS[estado].nombre}»`
      );
      await recargar();
    } catch {
      avisar("Sin conexión con el servidor", "error");
    }
  }

  async function borrarOrden(codigo: string) {
    try {
      const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        avisar("No se pudo eliminar la orden", "error");
        return;
      }
      avisar(`Orden ${codigo} eliminada`);
      await recargar();
    } catch {
      avisar("Sin conexión con el servidor", "error");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setModo("editar");
    setCodigoOriginal(orden.codigo);
    setForm({ ...orden });
  }

  function convertir(cotizacion: Cotizacion) {
    const modelo = cotizacion.sabe_modelo && cotizacion.modelo ? ` ${cotizacion.modelo}` : "";
    setModo("convertir");
    setCodigoOriginal("");
    setConvirtiendo(cotizacion.id);
    setForm({
      codigo: siguienteCodigo(),
      cliente: cotizacion.nombre,
      telefono: cotizacion.whatsapp,
      equipo: `${cotizacion.tipo}${modelo}`,
      servicio: cotizacion.problema,
      recibido: fechaHoy(),
      estado: 0,
      nota: "",
    });
    setPestana("ordenes");
    avisar("Revisa los datos y pulsa «Guardar orden»");
  }

  async function marcarCotizacion(id: number, atendida: boolean) {
    try {
      const res = await fetch(`/api/admin/cotizaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atendida }),
      });
      if (!res.ok) {
        avisar("No se pudo actualizar la cotización", "error");
        return;
      }
      avisar(atendida ? "Cotización marcada como atendida" : "Cotización reabierta");
      await recargar();
    } catch {
      avisar("Sin conexión con el servidor", "error");
    }
  }

  async function borrarCotizacion(id: number) {
    try {
      const res = await fetch(`/api/admin/cotizaciones/${id}`, { method: "DELETE" });
      if (!res.ok) {
        avisar("No se pudo eliminar la cotización", "error");
        return;
      }
      avisar("Cotización eliminada");
      await recargar();
    } catch {
      avisar("Sin conexión con el servidor", "error");
    }
  }

  async function refrescar() {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  }

  const pendientes = cotizaciones.filter((c) => !c.atendida).length;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-5">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <LogoAV className="h-9 w-9" />
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Panel de órdenes</h1>
            <p className="text-sm text-slate-400">
              Los cambios se publican al instante para tus clientes
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refrescar()}
            disabled={refrescando}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100 disabled:opacity-50"
          >
            <IconoRefrescar />
            {refrescando ? "Actualizando…" : "Actualizar"}
          </button>
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100"
          >
            Ver página
          </Link>
          <button
            type="button"
            onClick={() => void alSalir()}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100"
          >
            Salir
          </button>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {estadisticas.map((e) => (
          <button
            key={e.texto}
            type="button"
            onClick={() => {
              setFiltro(e.filtro);
              setPestana("ordenes");
            }}
            aria-pressed={pestana === "ordenes" && filtro === e.filtro}
            className={`rounded-2xl border px-5 py-4 text-left backdrop-blur transition ${
              pestana === "ordenes" && filtro === e.filtro
                ? "border-cyan-400/50 bg-cyan-400/[0.07]"
                : "border-white/10 bg-white/[0.04] hover:border-white/25"
            }`}
          >
            <span
              className={`block text-3xl font-bold ${e.color}`}
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {e.valor}
            </span>
            <span className="text-xs text-slate-400">{e.texto}</span>
          </button>
        ))}
      </section>

      <div className="mb-6 flex gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(
          [
            ["ordenes", `Órdenes (${ordenes.length})`],
            ["cotizaciones", `Cotizaciones${pendientes ? ` (${pendientes})` : ""}`],
          ] as const
        ).map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setPestana(valor)}
            aria-pressed={pestana === valor}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              pestana === valor
                ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      {pestana === "ordenes" ? (
        <>
          <FormularioOrden
            modo={modo}
            valores={form}
            guardando={guardando}
            alCambiar={setForm}
            alGuardar={guardar}
            alCancelar={limpiarFormulario}
            fechaDeHoy={fechaHoy}
          />
          <Ordenes
            ordenes={ordenes}
            filtro={filtro}
            alCambiarFiltro={setFiltro}
            alCambiarEstado={cambiarEstado}
            alEditar={editar}
            alBorrar={borrarOrden}
            avisar={avisar}
          />
        </>
      ) : (
        <Cotizaciones
          cotizaciones={cotizaciones}
          alConvertir={convertir}
          alMarcar={marcarCotizacion}
          alBorrar={borrarCotizacion}
        />
      )}

      {aviso && (
        <div
          role="status"
          className={`aparecer fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-[#0b1020] px-5 py-3 text-sm font-medium shadow-[0_12px_34px_rgba(0,0,0,0.5)] ${
            aviso.tono === "error"
              ? "border-red-400/50 text-red-200"
              : "border-emerald-400/50 text-emerald-100"
          }`}
        >
          {aviso.tono === "error" ? (
            <IconoAlerta className="h-4 w-4 shrink-0" />
          ) : (
            <IconoCheck className="h-4 w-4 shrink-0" />
          )}
          {aviso.texto}
        </div>
      )}
    </div>
  );
}
