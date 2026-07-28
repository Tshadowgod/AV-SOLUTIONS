"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ESTADOS, ESTADO_LISTO, ESTADO_ENTREGADO, type Orden, type Cotizacion } from "@/lib/tipos";
import {
  IconoCandado,
  IconoLupa,
  IconoChat,
  IconoMas,
  IconoEditar,
  IconoBasura,
  IconoRefrescar,
  IconoCopiar,
  IconoCheck,
  IconoCerrar,
  IconoSalir,
  IconoFlechaDerecha,
  IconoOjo,
  IconoBandeja,
  IconoPortapapeles,
  LogoAV,
} from "@/components/Iconos";

const ETIQUETAS_ESTADO = ESTADOS.map((e) => `${e.icono} ${e.nombre}`);

// Colores de cada estado del flujo de taller (mismo orden que ESTADOS).
const ESTILO_ESTADO = [
  "border-sky-400/40 bg-sky-400/10 text-sky-300",
  "border-violet-400/40 bg-violet-400/10 text-violet-300",
  "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  "border-white/15 bg-white/[0.06] text-slate-400",
];

const ORDEN_VACIA: Orden = {
  codigo: "",
  cliente: "",
  equipo: "",
  servicio: "",
  recibido: "",
  estado: 0,
  nota: "",
};

type Aviso = { texto: string; tipo: "ok" | "error" | "info" };
type Pestana = "ordenes" | "cotizaciones";
type FiltroEstado = "todas" | "proceso" | "listo" | "entregado";
type FiltroCotizacion = "todas" | "pendientes" | "atendidas";

function fechaHoy() {
  return new Date()
    .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .replace(" de 2", ", 2");
}

export default function PaginaAdmin() {
  const [sesion, setSesion] = useState<"cargando" | "sin-sesion" | "activa" | "error">("cargando");
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  const cargarDatos = useCallback(async () => {
    try {
      const [resOrd, resCot] = await Promise.all([
        fetch("/api/admin/ordenes"),
        fetch("/api/admin/cotizaciones"),
      ]);
      if (resOrd.status === 401) {
        setSesion("sin-sesion");
        return false;
      }
      if (!resOrd.ok) {
        setSesion((s) => (s === "activa" ? s : "error"));
        return false;
      }
      setOrdenes(await resOrd.json());
      if (resCot.ok) setCotizaciones(await resCot.json());
      setSesion("activa");
      return true;
    } catch {
      // Sin conexión: si ya había sesión activa conservamos los datos en pantalla.
      setSesion((s) => (s === "activa" ? s : "error"));
      return false;
    }
  }, []);

  useEffect(() => {
    // La carga inicial es asíncrona: los setState ocurren tras la respuesta
    // de la red, nunca de forma síncrona dentro del efecto.
    const cargar = async () => {
      await cargarDatos();
    };
    void cargar();
  }, [cargarDatos]);

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

  if (sesion === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <span className="mb-3 block text-4xl">⚠️</span>
          <h1 className="mb-1.5 text-xl font-bold">No pudimos cargar el panel</h1>
          <p className="mb-6 text-sm text-slate-400">
            Revisa tu conexión a internet e intenta de nuevo.
          </p>
          <button onClick={() => { setSesion("cargando"); cargarDatos(); }} className="btn-glow">
            <span className="justify-center"><IconoRefrescar /> Reintentar</span>
          </button>
        </div>
      </div>
    );
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
        <div className="mb-3 text-4xl">🔐</div>
        <h1 className="mb-1.5 text-2xl font-bold">Panel de Administración</h1>
        <p className="mb-7 text-sm text-slate-400">Acceso exclusivo para el personal de AV SOLUTIONS</p>

        <div className="mb-4 flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.18)]">
          <span className="ml-4 text-slate-400"><IconoCandado /></span>
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

        {error && <p className="mb-4 text-sm text-red-400">❌ Contraseña incorrecta. Intenta de nuevo.</p>}

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
  const [pestana, setPestana] = useState<Pestana>("ordenes");
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [filtroCot, setFiltroCot] = useState<FiltroCotizacion>("todas");
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState<Orden>({ ...ORDEN_VACIA, recibido: fechaHoy() });
  const [editando, setEditando] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [recargando, setRecargando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerBorrar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toast(texto: string, tipo: Aviso["tipo"] = "ok") {
    setAviso({ texto, tipo });
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 2800);
  }

  // La confirmación de borrado se desarma sola pasados unos segundos,
  // para evitar eliminaciones accidentales con un clic posterior.
  function armarConfirmacion(clave: string) {
    setConfirmandoBorrar(clave);
    if (timerBorrar.current) clearTimeout(timerBorrar.current);
    timerBorrar.current = setTimeout(() => setConfirmandoBorrar(null), 3500);
  }

  function siguienteCodigo() {
    const nums = ordenes
      .map((o) => parseInt((o.codigo.match(/(\d+)$/) || [])[1], 10))
      .filter((n) => !isNaN(n));
    return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
  }

  function cerrarFormulario() {
    setFormAbierto(false);
    setEditando(null);
    setConvirtiendo(null);
    setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
  }

  function abrirNuevaOrden() {
    setEditando(null);
    setConvirtiendo(null);
    setForm({ ...ORDEN_VACIA, codigo: siguienteCodigo(), recibido: fechaHoy() });
    setFormAbierto(true);
    enfocarFormulario();
  }

  function enfocarFormulario() {
    // El formulario puede no estar montado aún cuando cambia la pestaña.
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      formRef.current?.querySelector("input")?.focus();
    }, 60);
  }

  const visibles = ordenes.filter((o) => {
    const coincideTexto =
      !filtro ||
      [o.codigo, o.cliente, o.equipo, o.servicio, o.nota].join(" ").toLowerCase().includes(filtro.toLowerCase());
    const coincideEstado =
      filtroEstado === "todas" ||
      (filtroEstado === "proceso" && o.estado < ESTADO_LISTO) ||
      (filtroEstado === "listo" && o.estado === ESTADO_LISTO) ||
      (filtroEstado === "entregado" && o.estado === ESTADO_ENTREGADO);
    return coincideTexto && coincideEstado;
  });

  const stats: Array<{ clave: FiltroEstado; num: number; etiqueta: string; color: string }> = [
    { clave: "todas", num: ordenes.length, etiqueta: "Órdenes totales", color: "text-slate-100" },
    { clave: "proceso", num: ordenes.filter((o) => o.estado < ESTADO_LISTO).length, etiqueta: "En proceso", color: "text-amber-400" },
    { clave: "listo", num: ordenes.filter((o) => o.estado === ESTADO_LISTO).length, etiqueta: "Listos para recoger", color: "text-emerald-400" },
    { clave: "entregado", num: ordenes.filter((o) => o.estado === ESTADO_ENTREGADO).length, etiqueta: "Entregados", color: "text-slate-400" },
  ];

  const cotizacionesPendientes = cotizaciones.filter((c) => !c.atendida).length;
  const cotizacionesVisibles = cotizaciones.filter((c) =>
    filtroCot === "todas" ? true : filtroCot === "pendientes" ? !c.atendida : c.atendida
  );

  async function refrescar() {
    setRecargando(true);
    const ok = await recargar();
    setRecargando(false);
    toast(ok ? "Datos actualizados" : "No se pudo actualizar. Revisa tu conexión.", ok ? "info" : "error");
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
      // Si esta orden venía de una cotización, la marcamos como atendida.
      if (convirtiendo !== null && !editando) {
        await fetch(`/api/admin/cotizaciones/${convirtiendo}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atendida: true }),
        });
      }
      toast(
        editando
          ? `✏️ Orden ${cuerpo.codigo} actualizada`
          : convirtiendo !== null
          ? `✅ Cotización convertida en la orden ${cuerpo.codigo}`
          : `✅ Orden ${cuerpo.codigo} registrada`
      );
      cerrarFormulario();
      await recargar();
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
      toast(error, "error");
    }
    setGuardando(false);
  }

  function convertirAOrden(c: Cotizacion) {
    const modelo = c.sabe_modelo && c.modelo ? ` ${c.modelo}` : "";
    setEditando(null);
    setConvirtiendo(c.id);
    setForm({
      codigo: siguienteCodigo(),
      cliente: c.nombre,
      equipo: `${c.tipo}${modelo}`,
      servicio: c.problema,
      recibido: fechaHoy(),
      estado: 0,
      nota: "",
    });
    setPestana("ordenes");
    setFormAbierto(true);
    enfocarFormulario();
    toast("Revisa los datos y pulsa «Guardar orden» para registrarla", "info");
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
          ? `✅ ${codigo} marcado como LISTO PARA RECOGER`
          : `${ESTADOS[estado].icono} ${codigo} → ${ESTADOS[estado].nombre}`
      );
      await recargar();
    } else {
      toast("No se pudo actualizar el estado", "error");
    }
  }

  async function borrar(codigo: string) {
    if (confirmandoBorrar !== codigo) {
      armarConfirmacion(codigo);
      return;
    }
    const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, { method: "DELETE" });
    setConfirmandoBorrar(null);
    if (res.ok) {
      toast(`🗑️ Orden ${codigo} eliminada`);
      await recargar();
    } else {
      toast("No se pudo eliminar la orden", "error");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setEditando(orden.codigo);
    setForm({ ...orden });
    setFormAbierto(true);
    enfocarFormulario();
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      toast(`📋 Código ${codigo} copiado`, "info");
    } catch {
      toast("No se pudo copiar el código", "error");
    }
  }

  async function marcarCotizacion(id: number, atendida: boolean) {
    const res = await fetch(`/api/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendida }),
    });
    if (res.ok) {
      toast(atendida ? "✅ Cotización marcada como atendida" : "↩️ Cotización reabierta");
      await recargar();
    } else {
      toast("No se pudo actualizar la cotización", "error");
    }
  }

  async function borrarCotizacion(id: number) {
    if (confirmandoBorrar !== `cot-${id}`) {
      armarConfirmacion(`cot-${id}`);
      return;
    }
    const res = await fetch(`/api/admin/cotizaciones/${id}`, { method: "DELETE" });
    setConfirmandoBorrar(null);
    if (res.ok) {
      toast("🗑️ Cotización eliminada");
      await recargar();
    } else {
      toast("No se pudo eliminar la cotización", "error");
    }
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";
  const botonIcono =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/30 hover:text-slate-100";
  const mostrarFormulario = formAbierto || editando !== null || convirtiendo !== null;

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 -mx-5 mb-6 border-b border-white/10 bg-[#070b14]/80 px-5 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogoAV className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Panel de administración</h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Los cambios se publican al instante para tus clientes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refrescar}
              disabled={recargando}
              aria-label="Actualizar datos"
              title="Actualizar datos"
              className={botonIcono}
            >
              <IconoRefrescar className={`w-4 h-4 ${recargando ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100"
            >
              <IconoOjo /> <span className="hidden sm:inline">Ver página</span>
            </Link>
            <button
              onClick={alSalir}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-red-400/40 hover:text-red-300"
            >
              <IconoSalir /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pestañas */}
      <nav className="mb-6 flex gap-2" role="tablist" aria-label="Secciones del panel">
        {(
          [
            { clave: "ordenes", texto: "Órdenes", icono: <IconoPortapapeles />, badge: ordenes.length, badgeAlerta: false },
            { clave: "cotizaciones", texto: "Cotizaciones", icono: <IconoBandeja />, badge: cotizacionesPendientes, badgeAlerta: true },
          ] as const
        ).map((t) => (
          <button
            key={t.clave}
            role="tab"
            aria-selected={pestana === t.clave}
            onClick={() => setPestana(t.clave)}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              pestana === t.clave
                ? "border-violet-500/60 bg-violet-500/15 text-slate-100 shadow-[0_0_18px_rgba(139,92,246,0.2)]"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
            }`}
          >
            {t.icono}
            {t.texto}
            {t.badge > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  t.badgeAlerta ? "bg-violet-500/80 text-white" : "bg-white/10 text-slate-300"
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {pestana === "ordenes" && (
        <>
          {/* Estadísticas: cada tarjeta filtra la lista */}
          <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <button
                key={s.clave}
                onClick={() => setFiltroEstado(s.clave)}
                aria-pressed={filtroEstado === s.clave}
                title={`Mostrar: ${s.etiqueta.toLowerCase()}`}
                className={`cursor-pointer rounded-2xl border px-5 py-4 text-left backdrop-blur transition ${
                  filtroEstado === s.clave
                    ? "border-violet-500/60 bg-violet-500/[0.08] shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/25"
                }`}
              >
                <span className={`block text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {s.num}
                </span>
                <span className="text-xs text-slate-400">{s.etiqueta}</span>
              </button>
            ))}
          </section>

          {/* Barra de acciones */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500">
              <span className="ml-3.5 shrink-0 text-slate-400"><IconoLupa className="w-4 h-4" /></span>
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                type="search"
                placeholder="Buscar por código, cliente, equipo…"
                className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
            {mostrarFormulario ? (
              <button
                onClick={cerrarFormulario}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-white/30 hover:text-slate-100"
              >
                <IconoCerrar /> Cerrar formulario
              </button>
            ) : (
              <button onClick={abrirNuevaOrden} className="btn-glow">
                <span><IconoMas className="w-4 h-4" /> Nueva orden</span>
              </button>
            )}
          </div>

          {/* Formulario nueva orden / edición / conversión */}
          {mostrarFormulario && (
            <section
              className={`aparecer mb-6 rounded-3xl border p-7 backdrop-blur ${
                convirtiendo !== null
                  ? "border-violet-500/40 bg-violet-500/[0.06]"
                  : editando
                  ? "border-cyan-400/40 bg-cyan-400/[0.05]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <h2 className="mb-1 text-lg font-bold">
                {editando
                  ? `✏️ Editando ${editando}`
                  : convirtiendo !== null
                  ? "🔄 Convertir cotización en orden"
                  : "➕ Nueva orden"}
              </h2>
              <p className="mb-5 text-sm text-slate-400">
                {editando
                  ? "Modifica los datos y guarda."
                  : convirtiendo !== null
                  ? "Ajusta los datos de la cotización y guárdala como orden registrada."
                  : "Registra el equipo que acaba de dejar un cliente. El código se generó solo — puedes cambiarlo."}
              </p>
              <form ref={formRef} onSubmit={guardarForm} className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Código
                  <input required value={form.codigo} placeholder={siguienteCodigo()} className={inputClase}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Cliente
                  <input required value={form.cliente} placeholder="Nombre del cliente" className={inputClase}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Equipo
                  <input required value={form.equipo} placeholder="Laptop HP Pavilion 15" className={inputClase}
                    onChange={(e) => setForm({ ...form, equipo: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Servicio
                  <input required value={form.servicio} placeholder="Mantenimiento preventivo" className={inputClase}
                    onChange={(e) => setForm({ ...form, servicio: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Fecha de recepción
                  <input required value={form.recibido} className={inputClase}
                    onChange={(e) => setForm({ ...form, recibido: e.target.value })} />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Estado
                  <select value={form.estado} className={`${inputClase} cursor-pointer`}
                    onChange={(e) => setForm({ ...form, estado: Number(e.target.value) })}>
                    {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                      <option key={etiqueta} value={i}>{etiqueta}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400 sm:col-span-2">
                  Nota para el cliente (opcional)
                  <input value={form.nota} placeholder="Ej: Trae tu comprobante al recoger" className={inputClase}
                    onChange={(e) => setForm({ ...form, nota: e.target.value })} />
                </label>
                <div className="flex justify-end gap-3 sm:col-span-2">
                  <button type="button" onClick={cerrarFormulario}
                    className="cursor-pointer rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-100">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-glow" disabled={guardando}>
                    <span>{guardando ? "Guardando…" : editando ? "Actualizar orden" : "Guardar orden"}</span>
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Lista de órdenes */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  Órdenes {filtroEstado !== "todas" && (
                    <span className="text-sm font-medium text-slate-400">
                      · {stats.find((s) => s.clave === filtroEstado)?.etiqueta.toLowerCase()}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-slate-400">
                  Cambia el estado con el menú o avanza al siguiente paso con <IconoFlechaDerecha className="inline w-3.5 h-3.5" /> — se guarda solo.
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {visibles.length} de {ordenes.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {visibles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                  {ordenes.length === 0
                    ? "Aún no hay órdenes registradas. Pulsa «Nueva orden» para agregar la primera."
                    : "No hay órdenes que coincidan con el filtro o la búsqueda."}
                </div>
              )}
              {visibles.map((o) => {
                const estilo = ESTILO_ESTADO[o.estado] ?? ESTILO_ESTADO[0];
                const siguiente = o.estado < ESTADO_ENTREGADO ? ESTADOS[o.estado + 1] : null;
                return (
                  <div
                    key={o.codigo}
                    className={`grid items-center gap-3 rounded-2xl border p-4 transition sm:grid-cols-[130px_1.4fr_190px_auto] ${
                      o.estado === ESTADO_LISTO
                        ? "border-emerald-400/40 bg-emerald-400/5"
                        : o.estado === ESTADO_ENTREGADO
                        ? "border-white/10 bg-white/[0.03] opacity-60"
                        : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-cyan-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {o.codigo}
                      </span>
                      <span className="text-xs text-slate-500">{o.recibido}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{o.cliente}</div>
                      <div className="truncate text-xs text-slate-400">{o.equipo} · {o.servicio}</div>
                      {o.nota && <div className="truncate text-xs text-slate-500">📝 {o.nota}</div>}
                    </div>
                    <select
                      value={o.estado}
                      onChange={(e) => cambiarEstado(o.codigo, Number(e.target.value))}
                      aria-label={`Estado de la orden ${o.codigo}`}
                      title="Cambiar estado"
                      className={`w-full cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium outline-none transition focus:border-violet-500 ${estilo} [&>option]:bg-[#0b1020] [&>option]:text-slate-100`}
                    >
                      {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                        <option key={etiqueta} value={i}>{etiqueta}</option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      {siguiente && (
                        <button
                          onClick={() => cambiarEstado(o.codigo, o.estado + 1)}
                          aria-label={`Pasar ${o.codigo} a ${siguiente.nombre}`}
                          title={`Pasar a «${siguiente.nombre}»`}
                          className={`${botonIcono} hover:border-emerald-400/50 hover:text-emerald-300`}
                        >
                          <IconoFlechaDerecha />
                        </button>
                      )}
                      <button
                        onClick={() => copiarCodigo(o.codigo)}
                        aria-label={`Copiar código ${o.codigo}`}
                        title="Copiar código"
                        className={botonIcono}
                      >
                        <IconoCopiar />
                      </button>
                      <button
                        onClick={() => editar(o)}
                        aria-label={`Editar orden ${o.codigo}`}
                        title="Editar orden"
                        className={`${botonIcono} hover:border-cyan-400/50 hover:text-cyan-300`}
                      >
                        <IconoEditar />
                      </button>
                      <button
                        onClick={() => borrar(o.codigo)}
                        aria-label={confirmandoBorrar === o.codigo ? "Confirmar eliminación" : `Eliminar orden ${o.codigo}`}
                        title={confirmandoBorrar === o.codigo ? "Haz clic otra vez para confirmar" : "Eliminar orden"}
                        className={`${botonIcono} ${
                          confirmandoBorrar === o.codigo
                            ? "!border-red-400/70 !bg-red-400/15 !text-red-300"
                            : "hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
                        }`}
                      >
                        {confirmandoBorrar === o.codigo ? <IconoCheck /> : <IconoBasura />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {pestana === "cotizaciones" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Cotizaciones recibidas</h2>
              <p className="text-sm text-slate-400">
                Responde por WhatsApp o conviértelas en órdenes registradas.
              </p>
            </div>
            <div className="flex gap-1.5">
              {(
                [
                  { clave: "todas", texto: "Todas" },
                  { clave: "pendientes", texto: `Pendientes${cotizacionesPendientes ? ` (${cotizacionesPendientes})` : ""}` },
                  { clave: "atendidas", texto: "Atendidas" },
                ] as const
              ).map((f) => (
                <button
                  key={f.clave}
                  onClick={() => setFiltroCot(f.clave)}
                  aria-pressed={filtroCot === f.clave}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    filtroCot === f.clave
                      ? "border-violet-500/60 bg-violet-500/15 text-slate-100"
                      : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25"
                  }`}
                >
                  {f.texto}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {cotizacionesVisibles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                {cotizaciones.length === 0
                  ? "Aún no llegan cotizaciones. Cuando un cliente envíe una desde la página, aparecerá aquí. 📩"
                  : "No hay cotizaciones en este filtro."}
              </div>
            )}
            {cotizacionesVisibles.map((c) => {
              const waLink = `https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}`;
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-5 transition ${
                    c.atendida
                      ? "border-white/10 bg-white/[0.02] opacity-60"
                      : "border-violet-500/30 bg-violet-500/[0.06]"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-cyan-400">
                        {c.tipo}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">{c.nombre}</span>
                      {c.atendida && <span className="text-xs text-emerald-400">✓ Atendida</span>}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(c.creado).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
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

                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                    >
                      <IconoChat className="w-4 h-4" /> Responder por WhatsApp
                    </a>
                    <button
                      onClick={() => convertirAOrden(c)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-400/40 bg-violet-400/10 px-3.5 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
                    >
                      <IconoFlechaDerecha /> Convertir a orden
                    </button>
                    <button
                      onClick={() => marcarCotizacion(c.id, !c.atendida)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-medium text-slate-300 transition hover:border-white/30"
                    >
                      {c.atendida ? "↩️ Reabrir" : <><IconoCheck /> Marcar atendida</>}
                    </button>
                    <button
                      onClick={() => borrarCotizacion(c.id)}
                      aria-label={confirmandoBorrar === `cot-${c.id}` ? "Confirmar eliminación" : "Eliminar cotización"}
                      title={confirmandoBorrar === `cot-${c.id}` ? "Haz clic otra vez para confirmar" : "Eliminar"}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm transition ${
                        confirmandoBorrar === `cot-${c.id}`
                          ? "border-red-400/70 bg-red-400/15 text-red-300"
                          : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-red-400/50 hover:bg-red-400/10 hover:text-red-300"
                      }`}
                    >
                      {confirmandoBorrar === `cot-${c.id}` ? <><IconoCheck /> Confirmar</> : <IconoBasura />}
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
          role="status"
          className={`aparecer fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-[#0b1020] px-6 py-3 text-sm font-medium shadow-[0_12px_34px_rgba(0,0,0,0.5)] ${
            aviso.tipo === "error"
              ? "border-red-400/60 shadow-[0_0_26px_rgba(248,113,113,0.25),0_12px_34px_rgba(0,0,0,0.5)] text-red-200"
              : aviso.tipo === "info"
              ? "border-violet-400/60 shadow-[0_0_26px_rgba(167,139,250,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
              : "border-emerald-400/50 shadow-[0_0_26px_rgba(52,211,153,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
          }`}
        >
          {aviso.tipo === "error" && "⚠️ "}
          {aviso.texto}
        </div>
      )}
    </div>
  );
}
