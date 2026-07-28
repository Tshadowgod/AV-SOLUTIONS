"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ESTADOS,
  ESTADO_LISTO,
  ESTADO_ENTREGADO,
  type Orden,
  type Cotizacion,
} from "@/lib/tipos";
import { IconoCandado, IconoLupa, IconoChat, LogoAV } from "@/components/Iconos";

const ETIQUETAS_ESTADO = ESTADOS.map((e) => `${e.icono} ${e.nombre}`);

const ORDEN_VACIA: Orden = {
  codigo: "",
  cliente: "",
  equipo: "",
  servicio: "",
  recibido: "",
  estado: 0,
  nota: "",
};

type FiltroEstado = "todos" | "proceso" | "listo" | "entregado";
type Vista = "ordenes" | "cotizaciones";

function fechaHoy() {
  return new Date()
    .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .replace(" de 2", ", 2");
}

function siguienteCodigo(ordenes: Orden[]) {
  const nums = ordenes
    .map((o) => parseInt((o.codigo.match(/(\d+)$/) || [])[1], 10))
    .filter((n) => !isNaN(n));
  return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
}

function ordenarOrdenes(lista: Orden[]) {
  const prioridad = (e: number) => {
    if (e === ESTADO_LISTO) return 0;
    if (e === ESTADO_ENTREGADO) return 2;
    return 1;
  };
  return [...lista].sort((a, b) => prioridad(a.estado) - prioridad(b.estado));
}

function claseEstado(estado: number) {
  if (estado === ESTADO_LISTO) return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  if (estado === ESTADO_ENTREGADO) return "border-slate-500/30 bg-slate-500/10 text-slate-400";
  if (estado <= 2) return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  return "border-white/10 bg-white/[0.04] text-slate-300";
}

export default function PaginaAdmin() {
  const [sesion, setSesion] = useState<"cargando" | "sin-sesion" | "activa">("cargando");
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  const cargarDatos = useCallback(async () => {
    const [resOrd, resCot] = await Promise.all([
      fetch("/api/admin/ordenes"),
      fetch("/api/admin/cotizaciones"),
    ]);
    if (resOrd.status === 401) {
      setSesion("sin-sesion");
      return false;
    }
    if (resOrd.ok) {
      setOrdenes(await resOrd.json());
      if (resCot.ok) setCotizaciones(await resCot.json());
      setSesion("activa");
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const [resOrd, resCot] = await Promise.all([
        fetch("/api/admin/ordenes"),
        fetch("/api/admin/cotizaciones"),
      ]);
      if (cancelado) return;
      if (resOrd.status === 401) {
        setSesion("sin-sesion");
        return;
      }
      if (resOrd.ok) {
        setOrdenes(await resOrd.json());
        if (resCot.ok) setCotizaciones(await resCot.json());
        setSesion("activa");
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  if (sesion === "cargando") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader-ring" />
      </div>
    );
  }

  if (sesion === "sin-sesion") {
    return <PantallaLogin alEntrar={cargarDatos} />;
  }

  return (
    <Panel
      ordenes={ordenes}
      cotizaciones={cotizaciones}
      recargar={cargarDatos}
      alSalir={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        setSesion("sin-sesion");
      }}
    />
  );
}

/* ══════════ LOGIN ══════════ */

function PantallaLogin({ alEntrar }: { alEntrar: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      await alEntrar();
    } else {
      setError(true);
      setPassword("");
    }
    setCargando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className={`beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/50 backdrop-blur-xl ${error ? "sacudir" : ""}`}
      >
        <div className="mb-4 flex justify-center">
          <LogoAV className="h-14 w-14" />
        </div>
        <h1 className="mb-1.5 text-2xl font-bold">Panel de Administración</h1>
        <p className="mb-7 text-sm text-slate-400">
          Acceso exclusivo para el personal de AV SOLUTIONS
        </p>

        <div className="mb-4 flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.18)]">
          <span className="ml-4 text-slate-400">
            <IconoCandado />
          </span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
            className="flex-1 bg-transparent px-3 py-3.5 text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400">Contraseña incorrecta. Intenta de nuevo.</p>
        )}

        <button type="submit" className="btn-glow w-full" disabled={cargando}>
          <span className="w-full justify-center">{cargando ? "Verificando…" : "Entrar"}</span>
        </button>

        <Link href="/" className="mt-6 inline-block text-sm text-slate-400 transition hover:text-cyan-400">
          ← Volver a la página principal
        </Link>
      </form>
    </div>
  );
}

/* ══════════ PANEL ══════════ */

function Panel({
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
  const [vista, setVista] = useState<Vista>("ordenes");
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [soloPendientes, setSoloPendientes] = useState(true);
  const [form, setForm] = useState<Orden>(() => ({
    ...ORDEN_VACIA,
    recibido: fechaHoy(),
    codigo: siguienteCodigo(ordenes),
  }));
  const [editando, setEditando] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [recargando, setRecargando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toast(msg: string) {
    setAviso(msg);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(""), 2800);
  }

  function resetForm() {
    setForm({
      ...ORDEN_VACIA,
      recibido: fechaHoy(),
      codigo: siguienteCodigo(ordenes),
    });
    setEditando(null);
    setConvirtiendo(null);
  }

  const visibles = ordenarOrdenes(
    ordenes.filter((o) => {
      const coincideTexto =
        !filtro ||
        [o.codigo, o.cliente, o.equipo, o.servicio].join(" ").toLowerCase().includes(filtro.toLowerCase());
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "proceso" && o.estado <= 2) ||
        (filtroEstado === "listo" && o.estado === ESTADO_LISTO) ||
        (filtroEstado === "entregado" && o.estado === ESTADO_ENTREGADO);
      return coincideTexto && coincideEstado;
    })
  );

  const stats = {
    total: ordenes.length,
    proceso: ordenes.filter((o) => o.estado <= 2).length,
    listo: ordenes.filter((o) => o.estado === ESTADO_LISTO).length,
    entregado: ordenes.filter((o) => o.estado === ESTADO_ENTREGADO).length,
  };

  const cotizacionesPendientes = cotizaciones.filter((c) => !c.atendida).length;
  const cotizacionesVisibles = soloPendientes
    ? cotizaciones.filter((c) => !c.atendida)
    : cotizaciones;

  async function refrescar() {
    setRecargando(true);
    await recargar();
    setRecargando(false);
    toast("Datos actualizados");
  }

  async function guardarForm(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const cuerpo = { ...form, codigo: form.codigo.trim().toUpperCase() };

    const res = editando
      ? await fetch(`/api/admin/ordenes/${encodeURIComponent(editando)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        })
      : await fetch("/api/admin/ordenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        });

    if (res.ok) {
      if (convirtiendo !== null && !editando) {
        await fetch(`/api/admin/cotizaciones/${convirtiendo}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atendida: true }),
        });
      }
      toast(
        editando
          ? `Orden ${cuerpo.codigo} actualizada`
          : convirtiendo !== null
            ? `Cotización convertida en la orden ${cuerpo.codigo}`
            : `Orden ${cuerpo.codigo} registrada`
      );
      await recargar();
      setEditando(null);
      setConvirtiendo(null);
      const numGuardado = parseInt((cuerpo.codigo.match(/(\d+)$/) || [])[1], 10);
      const proximoCodigo = !editando && !isNaN(numGuardado)
        ? `AV-${numGuardado + 1}`
        : siguienteCodigo(ordenes);
      setForm({
        ...ORDEN_VACIA,
        recibido: fechaHoy(),
        codigo: proximoCodigo,
      });
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
      toast(`⚠️ ${error}`);
    }
    setGuardando(false);
  }

  function convertirAOrden(c: Cotizacion) {
    const modelo = c.sabe_modelo && c.modelo ? ` ${c.modelo}` : "";
    setEditando(null);
    setConvirtiendo(c.id);
    setVista("ordenes");
    setForm({
      codigo: siguienteCodigo(ordenes),
      cliente: c.nombre,
      equipo: `${c.tipo}${modelo}`,
      servicio: c.problema,
      recibido: fechaHoy(),
      estado: 0,
      nota: "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Revisa los datos y pulsa «Guardar orden»");
  }

  async function cambiarEstado(codigo: string, estado: number) {
    const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) {
      toast(
        estado === ESTADO_LISTO
          ? `${codigo} marcado como LISTO PARA RECOGER`
          : `Estado de ${codigo} actualizado`
      );
      await recargar();
    } else {
      toast("⚠️ No se pudo actualizar");
    }
  }

  async function borrar(codigo: string) {
    if (confirmandoBorrar !== codigo) {
      setConfirmandoBorrar(codigo);
      toast("Haz clic otra vez en ❗ para confirmar la eliminación");
      return;
    }
    const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, { method: "DELETE" });
    setConfirmandoBorrar(null);
    if (res.ok) {
      toast(`Orden ${codigo} eliminada`);
      await recargar();
    } else {
      toast("⚠️ No se pudo eliminar");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setEditando(orden.codigo);
    setForm({ ...orden });
    setVista("ordenes");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`Editando ${orden.codigo}`);
  }

  async function marcarCotizacion(id: number, atendida: boolean) {
    const res = await fetch(`/api/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendida }),
    });
    if (res.ok) {
      toast(atendida ? "Cotización marcada como atendida" : "Cotización reabierta");
      await recargar();
    } else {
      toast("⚠️ No se pudo actualizar");
    }
  }

  async function borrarCotizacion(id: number) {
    if (confirmandoBorrar !== `cot-${id}`) {
      setConfirmandoBorrar(`cot-${id}`);
      toast("Haz clic otra vez en ❗ para confirmar la eliminación");
      return;
    }
    const res = await fetch(`/api/admin/cotizaciones/${id}`, { method: "DELETE" });
    setConfirmandoBorrar(null);
    if (res.ok) {
      toast("Cotización eliminada");
      await recargar();
    } else {
      toast("⚠️ No se pudo eliminar");
    }
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";

  const filtrosEstado: { id: FiltroEstado; etiqueta: string; count: number }[] = [
    { id: "todos", etiqueta: "Todas", count: stats.total },
    { id: "proceso", etiqueta: "En proceso", count: stats.proceso },
    { id: "listo", etiqueta: "Listos", count: stats.listo },
    { id: "entregado", etiqueta: "Entregados", count: stats.entregado },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-5 sm:pb-16 sm:pt-8">
      {/* Cabecera */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <LogoAV className="h-9 w-9" />
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Panel de administración</h1>
            <p className="text-sm text-slate-400">Los cambios se publican al instante para tus clientes</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refrescar}
            disabled={recargando}
            className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100 disabled:opacity-50"
          >
            {recargando ? "Actualizando…" : "↻ Actualizar"}
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
            onClick={alSalir}
            className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {filtrosEstado.slice(1).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setFiltroEstado(s.id);
              setVista("ordenes");
            }}
            className={`cursor-pointer rounded-2xl border px-4 py-3.5 text-left backdrop-blur transition hover:-translate-y-0.5 sm:px-5 sm:py-4 ${
              filtroEstado === s.id
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-white/10 bg-white/[0.04] hover:border-white/25"
            }`}
          >
            <span
              className={`block text-2xl font-bold sm:text-3xl ${
                s.id === "listo"
                  ? "text-emerald-400"
                  : s.id === "proceso"
                    ? "text-amber-400"
                    : "text-slate-400"
              }`}
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {s.count}
            </span>
            <span className="text-xs text-slate-400">{s.etiqueta}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setFiltroEstado("todos");
            setVista("ordenes");
          }}
          className={`cursor-pointer rounded-2xl border px-4 py-3.5 text-left backdrop-blur transition hover:-translate-y-0.5 sm:col-span-2 sm:px-5 sm:py-4 lg:col-span-1 ${
            filtroEstado === "todos"
              ? "border-violet-500/50 bg-violet-500/10"
              : "border-white/10 bg-white/[0.04] hover:border-white/25"
          }`}
        >
          <span
            className="block text-2xl font-bold text-slate-100 sm:text-3xl"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {stats.total}
          </span>
          <span className="text-xs text-slate-400">Órdenes totales</span>
        </button>
      </section>

      {/* Pestañas */}
      <div className="mb-6 flex gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
        <button
          type="button"
          onClick={() => setVista("ordenes")}
          className={`flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            vista === "ordenes"
              ? "bg-white/[0.08] text-slate-100 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Órdenes
        </button>
        <button
          type="button"
          onClick={() => setVista("cotizaciones")}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            vista === "cotizaciones"
              ? "bg-white/[0.08] text-slate-100 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Cotizaciones
          {cotizacionesPendientes > 0 && (
            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white">
              {cotizacionesPendientes}
            </span>
          )}
        </button>
      </div>

      {vista === "ordenes" ? (
        <>
          {/* Formulario nueva orden / edición */}
          <section
            className={`mb-6 rounded-3xl border p-5 backdrop-blur sm:p-7 ${
              convirtiendo !== null
                ? "border-violet-500/40 bg-violet-500/[0.06]"
                : editando
                  ? "border-cyan-500/30 bg-cyan-500/[0.04]"
                  : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <h2 className="mb-1 text-lg font-bold">
              {editando
                ? `Editando ${editando}`
                : convirtiendo !== null
                  ? "Convertir cotización en orden"
                  : "Nueva orden"}
            </h2>
            <p className="mb-5 text-sm text-slate-400">
              {editando
                ? "Modifica los datos y guarda."
                : convirtiendo !== null
                  ? "Ajusta los datos de la cotización y guárdala como orden registrada."
                  : "Registra el equipo que acaba de dejar un cliente."}
            </p>
            <form ref={formRef} onSubmit={guardarForm} className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Código
                <input
                  required
                  value={form.codigo}
                  placeholder={siguienteCodigo(ordenes)}
                  className={`${inputClase} uppercase`}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Cliente
                <input
                  required
                  value={form.cliente}
                  placeholder="Nombre del cliente"
                  className={inputClase}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Equipo
                <input
                  required
                  value={form.equipo}
                  placeholder="Laptop HP Pavilion 15"
                  className={inputClase}
                  onChange={(e) => setForm({ ...form, equipo: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Servicio
                <input
                  required
                  value={form.servicio}
                  placeholder="Mantenimiento preventivo"
                  className={inputClase}
                  onChange={(e) => setForm({ ...form, servicio: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Fecha de recepción
                <input
                  required
                  value={form.recibido}
                  className={inputClase}
                  onChange={(e) => setForm({ ...form, recibido: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                Estado
                <select
                  value={form.estado}
                  className={`${inputClase} cursor-pointer`}
                  onChange={(e) => setForm({ ...form, estado: Number(e.target.value) })}
                >
                  {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                    <option key={etiqueta} value={i}>
                      {etiqueta}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400 sm:col-span-2">
                Nota para el cliente (opcional)
                <input
                  value={form.nota}
                  placeholder="Ej: Trae tu comprobante al recoger"
                  className={inputClase}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                />
              </label>
              <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
                {(editando || convirtiendo !== null) && (
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-100"
                    onClick={resetForm}
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn-glow" disabled={guardando}>
                  <span>{guardando ? "Guardando…" : editando ? "Actualizar orden" : "Guardar orden"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Lista de órdenes */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Órdenes registradas</h2>
                <p className="text-sm text-slate-400">
                  {visibles.length} de {ordenes.length} órdenes
                </p>
              </div>
              <div className="flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500">
                <span className="ml-3.5 text-slate-400">
                  <IconoLupa className="h-4 w-4" />
                </span>
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  type="search"
                  placeholder="Buscar cliente, código…"
                  className="w-full min-w-0 bg-transparent px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 sm:w-52"
                />
              </div>
            </div>

            {/* Chips de filtro */}
            <div className="mb-5 flex flex-wrap gap-2">
              {filtrosEstado.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltroEstado(f.id)}
                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    filtroEstado === f.id
                      ? "bg-violet-500/25 text-violet-200 ring-1 ring-violet-500/40"
                      : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {f.etiqueta} ({f.count})
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3.5">
              {visibles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                  {filtro || filtroEstado !== "todos"
                    ? "No hay órdenes que coincidan con tu búsqueda."
                    : "Aún no hay órdenes registradas. Agrega la primera arriba."}
                </div>
              )}
              {visibles.map((o) => (
                <div
                  key={o.codigo}
                  className={`rounded-2xl border p-4 transition ${
                    o.estado === ESTADO_LISTO
                      ? "border-emerald-400/40 bg-emerald-400/5"
                      : o.estado === ESTADO_ENTREGADO
                        ? "border-white/10 bg-white/[0.03] opacity-70"
                        : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className="font-bold text-cyan-400"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {o.codigo}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${claseEstado(o.estado)}`}
                        >
                          {ESTADOS[o.estado]?.icono} {ESTADOS[o.estado]?.nombre}
                        </span>
                      </div>
                      <div className="text-sm font-semibold">{o.cliente}</div>
                      <div className="text-xs text-slate-400">
                        {o.equipo} · {o.servicio}
                      </div>
                      {o.nota && (
                        <p className="mt-1.5 text-xs text-slate-500">Nota: {o.nota}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {o.estado < ESTADO_LISTO && (
                        <button
                          type="button"
                          onClick={() => cambiarEstado(o.codigo, ESTADO_LISTO)}
                          className="cursor-pointer rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20"
                        >
                          ✅ Marcar listo
                        </button>
                      )}
                      <select
                        value={o.estado}
                        onChange={(e) => cambiarEstado(o.codigo, Number(e.target.value))}
                        className={`${inputClase} min-w-[10rem] cursor-pointer`}
                        title="Cambiar estado"
                        aria-label={`Estado de ${o.codigo}`}
                      >
                        {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                          <option key={etiqueta} value={i}>
                            {etiqueta}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => editar(o)}
                        title="Editar orden"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-white/30"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => borrar(o.codigo)}
                        title={
                          confirmandoBorrar === o.codigo
                            ? "Haz clic otra vez para confirmar"
                            : "Eliminar orden"
                        }
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-red-400/50 hover:bg-red-400/10"
                      >
                        {confirmandoBorrar === o.codigo ? "❗" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Cotizaciones */
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Cotizaciones recibidas</h2>
              <p className="text-sm text-slate-400">
                {cotizacionesVisibles.length} cotización
                {cotizacionesVisibles.length !== 1 ? "es" : ""} mostrada
                {cotizacionesVisibles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={soloPendientes}
                onChange={(e) => setSoloPendientes(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-violet-500"
              />
              Solo pendientes
            </label>
          </div>

          <div className="flex flex-col gap-3.5">
            {cotizacionesVisibles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                {soloPendientes
                  ? "No hay cotizaciones pendientes. ¡Buen trabajo!"
                  : "Aún no llegan cotizaciones desde la página."}
              </div>
            )}
            {cotizacionesVisibles.map((c) => {
              const waLink = `https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}`;
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 transition sm:p-5 ${
                    c.atendida
                      ? "border-white/10 bg-white/[0.02] opacity-60"
                      : "border-violet-500/30 bg-violet-500/[0.06]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-cyan-400">
                        {c.tipo}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{c.nombre}</span>
                      {c.atendida && <span className="text-xs text-emerald-400">✓ Atendida</span>}
                      {!c.atendida && (
                        <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(c.creado).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-slate-300">{c.problema}</p>

                  <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
                    <span>
                      <b className="text-slate-300">Modelo:</b>{" "}
                      {c.sabe_modelo ? c.modelo : "No lo sabe"}
                    </span>
                    <span>
                      <b className="text-slate-300">WhatsApp:</b> {c.whatsapp}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                    >
                      <IconoChat className="h-4 w-4" /> WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => convertirAOrden(c)}
                      className="cursor-pointer rounded-lg border border-violet-400/40 bg-violet-400/10 px-3.5 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
                    >
                      Convertir a orden
                    </button>
                    <button
                      type="button"
                      onClick={() => marcarCotizacion(c.id, !c.atendida)}
                      className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-medium text-slate-300 transition hover:border-white/30"
                    >
                      {c.atendida ? "Reabrir" : "Marcar atendida"}
                    </button>
                    <button
                      type="button"
                      onClick={() => borrarCotizacion(c.id)}
                      title={
                        confirmandoBorrar === `cot-${c.id}`
                          ? "Haz clic otra vez para confirmar"
                          : "Eliminar"
                      }
                      className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm transition hover:border-red-400/50 hover:bg-red-400/10"
                    >
                      {confirmandoBorrar === `cot-${c.id}` ? "❗" : "🗑️"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Toast */}
      {aviso && (
        <div
          className="aparecer fixed bottom-7 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full border border-emerald-400/50 bg-[#0b1020] px-6 py-3 text-center text-sm font-medium shadow-[0_0_26px_rgba(52,211,153,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
          role="status"
        >
          {aviso}
        </div>
      )}
    </div>
  );
}
