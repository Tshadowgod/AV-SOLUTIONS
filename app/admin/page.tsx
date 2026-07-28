"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ESTADOS, ESTADO_LISTO, ESTADO_ENTREGADO, type Orden, type Cotizacion } from "@/lib/tipos";
import { IconoCandado, IconoLupa, IconoChat, LogoAV } from "@/components/Iconos";

const ETIQUETAS_ESTADO = ESTADOS.map((e) => `${e.icono} ${e.nombre}`);

// Colores de acento por estado: [texto, borde/fondo de la insignia]
const COLOR_ESTADO = [
  "text-sky-300",
  "text-violet-300",
  "text-amber-300",
  "text-emerald-300",
  "text-slate-400",
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

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function fechaHoy() {
  const d = new Date();
  return `${d.getDate()} de ${MESES[d.getMonth()]}, ${d.getFullYear()}`;
}

type Aviso = { texto: string; tipo: "ok" | "error" } | null;
type FiltroEstado = "todos" | "proceso" | "listo" | "entregado";
type Pestana = "ordenes" | "cotizaciones";

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
      if (resOrd.ok) {
        setOrdenes(await resOrd.json());
        if (resCot.ok) setCotizaciones(await resCot.json());
        setSesion("activa");
        return true;
      }
      setSesion("error");
      return false;
    } catch {
      setSesion("error");
      return false;
    }
  }, []);

  useEffect(() => {
    // La carga es asíncrona: los setState ocurren tras la respuesta de la red,
    // no de forma síncrona dentro del efecto.
    void Promise.resolve().then(cargarDatos);
  }, [cargarDatos]);

  if (sesion === "cargando") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader-ring" />
      </div>
    );
  }

  if (sesion === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="beam-top w-full max-w-md rounded-3xl border border-amber-400/30 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-3 text-4xl">⚠️</div>
          <h1 className="mb-1.5 text-xl font-bold">No se pudo cargar el panel</h1>
          <p className="mb-6 text-sm text-slate-400">
            Revisa tu conexión a internet e intenta de nuevo.
          </p>
          <button onClick={() => { setSesion("cargando"); cargarDatos(); }} className="btn-glow">
            <span className="justify-center">Reintentar</span>
          </button>
        </div>
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
        try {
          await fetch("/api/admin/login", { method: "DELETE" });
        } finally {
          setSesion("sin-sesion");
        }
      }}
    />
  );
}

/* ══════════ LOGIN ══════════ */

function PantallaLogin({ alEntrar }: { alEntrar: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<"" | "credenciales" | "red">("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        await alEntrar();
      } else {
        setError("credenciales");
        setPassword("");
      }
    } catch {
      setError("red");
    } finally {
      setCargando(false);
    }
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

        {error === "credenciales" && (
          <p className="mb-4 text-sm text-red-400">❌ Contraseña incorrecta. Intenta de nuevo.</p>
        )}
        {error === "red" && (
          <p className="mb-4 text-sm text-amber-400">⚠️ Sin conexión. Revisa tu internet e intenta de nuevo.</p>
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
  const [pestana, setPestana] = useState<Pestana>("ordenes");
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState<Orden>({ ...ORDEN_VACIA, recibido: fechaHoy() });
  const [editando, setEditando] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);
  const [guardando, setGuardando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerBorrar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toast(texto: string, tipo: "ok" | "error" = "ok") {
    setAviso({ texto, tipo });
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 3200);
  }

  // La confirmación de borrado se desarma sola a los 4 segundos
  function armarBorrado(clave: string) {
    setConfirmandoBorrar(clave);
    if (timerBorrar.current) clearTimeout(timerBorrar.current);
    timerBorrar.current = setTimeout(() => setConfirmandoBorrar(null), 4000);
  }

  function siguienteCodigo() {
    const nums = ordenes
      .map((o) => parseInt((o.codigo.match(/(\d+)$/) || [])[1], 10))
      .filter((n) => !isNaN(n));
    return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
  }

  const visibles = ordenes.filter((o) => {
    const coincideTexto =
      !filtro ||
      [o.codigo, o.cliente, o.equipo, o.servicio].join(" ").toLowerCase().includes(filtro.toLowerCase());
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "proceso" && o.estado < ESTADO_LISTO) ||
      (filtroEstado === "listo" && o.estado === ESTADO_LISTO) ||
      (filtroEstado === "entregado" && o.estado === ESTADO_ENTREGADO);
    return coincideTexto && coincideEstado;
  });

  const stats: Array<{ clave: FiltroEstado; num: number; etiqueta: string; color: string }> = [
    { clave: "todos", num: ordenes.length, etiqueta: "Órdenes totales", color: "text-slate-100" },
    { clave: "proceso", num: ordenes.filter((o) => o.estado < ESTADO_LISTO).length, etiqueta: "En proceso", color: "text-amber-400" },
    { clave: "listo", num: ordenes.filter((o) => o.estado === ESTADO_LISTO).length, etiqueta: "Listos para recoger", color: "text-emerald-400" },
    { clave: "entregado", num: ordenes.filter((o) => o.estado === ESTADO_ENTREGADO).length, etiqueta: "Entregados", color: "text-slate-400" },
  ];

  const cotizacionesPendientes = cotizaciones.filter((c) => !c.atendida).length;

  function abrirNuevaOrden() {
    setEditando(null);
    setConvirtiendo(null);
    setForm({ ...ORDEN_VACIA, codigo: siguienteCodigo(), recibido: fechaHoy() });
    setFormAbierto(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  function cerrarForm() {
    setEditando(null);
    setConvirtiendo(null);
    setFormAbierto(false);
    setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
  }

  async function guardarForm(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const cuerpo = { ...form, codigo: form.codigo.trim().toUpperCase() };

    try {
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
          }).catch(() => {});
        }
        toast(
          editando
            ? `✏️ Orden ${cuerpo.codigo} actualizada`
            : convirtiendo !== null
            ? `✅ Cotización convertida en la orden ${cuerpo.codigo}`
            : `✅ Orden ${cuerpo.codigo} registrada`
        );
        cerrarForm();
        await recargar();
      } else {
        const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
        toast(`⚠️ ${error}`, "error");
      }
    } catch {
      toast("⚠️ Sin conexión. No se guardaron los cambios.", "error");
    } finally {
      setGuardando(false);
    }
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    toast("📋 Revisa los datos y pulsa «Guardar orden» para registrarla");
  }

  async function cambiarEstado(codigo: string, estado: number) {
    try {
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
        toast("⚠️ No se pudo actualizar", "error");
      }
    } catch {
      toast("⚠️ Sin conexión. No se pudo actualizar.", "error");
    }
  }

  async function borrar(codigo: string) {
    if (confirmandoBorrar !== codigo) {
      armarBorrado(codigo);
      return;
    }
    setConfirmandoBorrar(null);
    try {
      const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, { method: "DELETE" });
      if (res.ok) {
        toast(`🗑️ Orden ${codigo} eliminada`);
        await recargar();
      } else {
        toast("⚠️ No se pudo eliminar", "error");
      }
    } catch {
      toast("⚠️ Sin conexión. No se pudo eliminar.", "error");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setEditando(orden.codigo);
    setForm({ ...orden });
    setFormAbierto(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      toast(`📋 Código ${codigo} copiado — compártelo con el cliente`);
    } catch {
      toast("⚠️ No se pudo copiar el código", "error");
    }
  }

  async function marcarCotizacion(id: number, atendida: boolean) {
    try {
      const res = await fetch(`/api/admin/cotizaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atendida }),
      });
      if (res.ok) {
        toast(atendida ? "✅ Cotización marcada como atendida" : "↩️ Cotización reabierta");
        await recargar();
      } else {
        toast("⚠️ No se pudo actualizar", "error");
      }
    } catch {
      toast("⚠️ Sin conexión. No se pudo actualizar.", "error");
    }
  }

  async function borrarCotizacion(id: number) {
    if (confirmandoBorrar !== `cot-${id}`) {
      armarBorrado(`cot-${id}`);
      return;
    }
    setConfirmandoBorrar(null);
    try {
      const res = await fetch(`/api/admin/cotizaciones/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("🗑️ Cotización eliminada");
        await recargar();
      } else {
        toast("⚠️ No se pudo eliminar", "error");
      }
    } catch {
      toast("⚠️ Sin conexión. No se pudo eliminar.", "error");
    }
  }

  async function refrescar() {
    setRefrescando(true);
    const ok = await recargar();
    setRefrescando(false);
    if (ok) toast("🔄 Datos actualizados");
    else toast("⚠️ No se pudo actualizar", "error");
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";
  const clasePestana = (activa: boolean) =>
    `cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition ${
      activa
        ? "bg-gradient-to-r from-violet-500/30 to-cyan-400/20 text-slate-100 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.45)]"
        : "text-slate-400 hover:text-slate-100"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8">
      {/* Cabecera */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <LogoAV className="w-9 h-9" />
          <div>
            <h1 className="text-2xl font-bold">Panel del taller</h1>
            <p className="text-sm text-slate-400">Los cambios se publican al instante para tus clientes</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={refrescar}
            disabled={refrescando}
            title="Volver a cargar órdenes y cotizaciones"
            className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100 disabled:opacity-50"
          >
            {refrescando ? "Actualizando…" : "🔄 Actualizar"}
          </button>
          <Link href="/" target="_blank" className="rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100">
            👁️ Ver página
          </Link>
          <button onClick={alSalir} className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100">
            Salir
          </button>
        </div>
      </header>

      {/* Estadísticas — también filtran la lista */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const activa = pestana === "ordenes" && filtroEstado === s.clave;
          return (
            <button
              key={s.etiqueta}
              onClick={() => { setPestana("ordenes"); setFiltroEstado(s.clave); }}
              title={`Ver: ${s.etiqueta.toLowerCase()}`}
              className={`cursor-pointer rounded-2xl border px-5 py-4 text-left backdrop-blur transition ${
                activa
                  ? "border-violet-500/50 bg-violet-500/[0.08] shadow-[0_0_18px_rgba(139,92,246,0.18)]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/25"
              }`}
            >
              <span className={`block text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {s.num}
              </span>
              <span className="text-xs text-slate-400">{s.etiqueta}</span>
            </button>
          );
        })}
      </section>

      {/* Pestañas */}
      <nav className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur sm:w-fit">
        <button onClick={() => setPestana("ordenes")} className={clasePestana(pestana === "ordenes")}>
          📋 Órdenes
        </button>
        <button onClick={() => setPestana("cotizaciones")} className={clasePestana(pestana === "cotizaciones")}>
          📨 Cotizaciones
          {cotizacionesPendientes > 0 && (
            <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[0.7rem] font-bold text-white">
              {cotizacionesPendientes}
            </span>
          )}
        </button>
      </nav>

      {pestana === "ordenes" && (
        <>
          {/* Formulario nueva orden / edición */}
          {formAbierto ? (
            <section className={`aparecer mb-6 rounded-3xl border p-7 backdrop-blur ${convirtiendo !== null ? "border-violet-500/40 bg-violet-500/[0.06]" : "border-white/10 bg-white/[0.04]"}`}>
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
                  : "Registra el equipo que acaba de dejar un cliente."}
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
                  <button type="button" className="cursor-pointer rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-100"
                    onClick={cerrarForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-glow" disabled={guardando}>
                    <span>{guardando ? "Guardando…" : editando ? "Actualizar orden" : "Guardar orden"}</span>
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <button
              onClick={abrirNuevaOrden}
              className="mb-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-4 font-semibold text-slate-400 transition hover:border-violet-500/50 hover:bg-violet-500/[0.05] hover:text-slate-100"
            >
              ➕ Registrar nueva orden
            </button>
          )}

          {/* Lista de órdenes */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">📋 Órdenes registradas</h2>
                <p className="text-sm text-slate-400">
                  Usa <b className="text-slate-300">»</b> para avanzar al siguiente estado, o elige uno en el menú.
                </p>
              </div>
              <div className="flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500">
                <span className="ml-3.5 text-slate-400"><IconoLupa className="w-4 h-4" /></span>
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  type="search"
                  placeholder="Código, cliente, equipo…"
                  className="w-48 bg-transparent px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {filtroEstado !== "todos" && (
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                Mostrando:{" "}
                <b className="text-slate-200">
                  {stats.find((s) => s.clave === filtroEstado)?.etiqueta.toLowerCase()}
                </b>
                <button
                  onClick={() => setFiltroEstado("todos")}
                  className="cursor-pointer rounded-full border border-white/10 px-2.5 py-0.5 text-xs transition hover:border-white/30 hover:text-slate-100"
                >
                  ✕ Quitar filtro
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              {visibles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                  {filtro || filtroEstado !== "todos"
                    ? "No hay órdenes que coincidan con tu búsqueda."
                    : "Aún no hay órdenes registradas. Agrega la primera arriba. 👆"}
                </div>
              )}
              {visibles.map((o) => (
                <div
                  key={o.codigo}
                  className={`grid items-center gap-3 rounded-2xl border p-4 transition sm:grid-cols-[130px_1.3fr_190px_auto] ${
                    o.estado === ESTADO_LISTO
                      ? "border-emerald-400/40 bg-emerald-400/5"
                      : o.estado === ESTADO_ENTREGADO
                      ? "border-white/10 bg-white/[0.03] opacity-60"
                      : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
                  }`}
                >
                  <div>
                    <button
                      onClick={() => copiarCodigo(o.codigo)}
                      title="Copiar código para compartirlo con el cliente"
                      className="cursor-pointer font-bold text-cyan-400 transition hover:text-cyan-300"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {o.codigo}
                    </button>
                    <div className="text-[0.7rem] text-slate-500">{o.recibido}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{o.cliente}</div>
                    <div className="truncate text-xs text-slate-400">{o.equipo} · {o.servicio}</div>
                    {o.nota && (
                      <div className="mt-0.5 truncate text-xs text-amber-300/80" title={o.nota}>
                        📝 {o.nota}
                      </div>
                    )}
                  </div>
                  <select
                    value={o.estado}
                    onChange={(e) => cambiarEstado(o.codigo, Number(e.target.value))}
                    className={`${inputClase} w-full cursor-pointer font-medium ${COLOR_ESTADO[o.estado] ?? ""}`}
                    title="Cambiar estado"
                  >
                    {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                      <option key={etiqueta} value={i} className="text-slate-100">{etiqueta}</option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    {o.estado < ESTADO_ENTREGADO && (
                      <button
                        onClick={() => cambiarEstado(o.codigo, o.estado + 1)}
                        title={`Pasar a: ${ESTADOS[o.estado + 1].icono} ${ESTADOS[o.estado + 1].nombre}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-base font-bold text-cyan-300 transition hover:border-cyan-400/60 hover:bg-cyan-400/20"
                      >
                        »
                      </button>
                    )}
                    <button onClick={() => editar(o)} title="Editar orden"
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-white/30">
                      ✏️
                    </button>
                    <button onClick={() => borrar(o.codigo)}
                      title={confirmandoBorrar === o.codigo ? "Haz clic otra vez para confirmar" : "Eliminar orden"}
                      className={`flex h-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition ${
                        confirmandoBorrar === o.codigo
                          ? "w-auto gap-1 border-red-400/60 bg-red-400/15 px-2.5 text-xs font-semibold text-red-300"
                          : "w-9 border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                      }`}>
                      {confirmandoBorrar === o.codigo ? "❗ ¿Seguro?" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {pestana === "cotizaciones" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">📨 Cotizaciones recibidas</h2>
            {cotizacionesPendientes > 0 && (
              <span className="rounded-full bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-300">
                {cotizacionesPendientes} sin atender
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            {cotizaciones.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                Aún no llegan cotizaciones. Cuando un cliente envíe una desde la página, aparecerá aquí. 📩
              </div>
            )}
            {cotizaciones.map((c) => {
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
                      className="cursor-pointer rounded-lg border border-violet-400/40 bg-violet-400/10 px-3.5 py-1.5 text-sm font-medium text-violet-200 transition hover:bg-violet-400/20"
                    >
                      🔄 Convertir a orden
                    </button>
                    <button
                      onClick={() => marcarCotizacion(c.id, !c.atendida)}
                      className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-medium text-slate-300 transition hover:border-white/30"
                    >
                      {c.atendida ? "↩️ Reabrir" : "✓ Marcar atendida"}
                    </button>
                    <button
                      onClick={() => borrarCotizacion(c.id)}
                      title={confirmandoBorrar === `cot-${c.id}` ? "Haz clic otra vez para confirmar" : "Eliminar"}
                      className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-sm transition ${
                        confirmandoBorrar === `cot-${c.id}`
                          ? "border-red-400/60 bg-red-400/15 text-xs font-semibold text-red-300"
                          : "border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                      }`}
                    >
                      {confirmandoBorrar === `cot-${c.id}` ? "❗ ¿Seguro?" : "🗑️"}
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
          className={`aparecer fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-[#0b1020] px-6 py-3 text-sm font-medium ${
            aviso.tipo === "error"
              ? "border-red-400/50 shadow-[0_0_26px_rgba(248,113,113,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
              : "border-emerald-400/50 shadow-[0_0_26px_rgba(52,211,153,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
          }`}
          role="status"
        >
          {aviso.texto}
        </div>
      )}
    </div>
  );
}
