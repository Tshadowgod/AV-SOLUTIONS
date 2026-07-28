"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ESTADOS, ESTADO_LISTO, ESTADO_ENTREGADO, type Orden, type Cotizacion } from "@/lib/tipos";
import { IconoCandado, IconoLupa, IconoChat, LogoAV } from "@/components/Iconos";

const ETIQUETAS_ESTADO = ESTADOS.map((e) => `${e.icono} ${e.nombre}`);

/** Colores del pill/selector de estado, en el mismo orden que ESTADOS. */
const COLOR_ESTADO = [
  "border-sky-400/40 bg-sky-400/10 text-sky-300", // Recibido
  "border-amber-400/40 bg-amber-400/10 text-amber-300", // En diagnóstico
  "border-violet-400/40 bg-violet-400/10 text-violet-300", // En reparación
  "border-emerald-400/45 bg-emerald-400/10 text-emerald-300", // Listo para recoger
  "border-slate-400/30 bg-slate-400/10 text-slate-400", // Entregado
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

function fechaHoy() {
  return new Date()
    .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .replace(" de 2", ", 2");
}

type DatosPanel =
  | { tipo: "sin-sesion" }
  | { tipo: "ok"; ordenes: Orden[]; cotizaciones: Cotizacion[] };

async function obtenerDatos(): Promise<DatosPanel> {
  const [resOrd, resCot] = await Promise.all([
    fetch("/api/admin/ordenes"),
    fetch("/api/admin/cotizaciones"),
  ]);
  if (resOrd.status === 401 || resCot.status === 401) return { tipo: "sin-sesion" };
  if (!resOrd.ok || !resCot.ok) throw new Error("Error al cargar los datos");
  const [ordenes, cotizaciones] = await Promise.all([resOrd.json(), resCot.json()]);
  return { tipo: "ok", ordenes, cotizaciones };
}

export default function PaginaAdmin() {
  const [sesion, setSesion] = useState<"cargando" | "error" | "sin-sesion" | "expirada" | "activa">(
    "cargando"
  );
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  const aplicarDatos = useCallback((datos: DatosPanel) => {
    if (datos.tipo === "sin-sesion") {
      setSesion("sin-sesion");
      return;
    }
    setOrdenes(datos.ordenes);
    setCotizaciones(datos.cotizaciones);
    setSesion("activa");
  }, []);

  useEffect(() => {
    obtenerDatos()
      .then(aplicarDatos)
      .catch(() => setSesion("error"));
  }, [aplicarDatos]);

  // Recarga usada por el panel tras cada acción. Devuelve false si falló
  // (sin tumbar la pantalla: el panel muestra su propio aviso).
  const recargar = useCallback(async () => {
    try {
      aplicarDatos(await obtenerDatos());
      return true;
    } catch {
      return false;
    }
  }, [aplicarDatos]);

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
        <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-amber-400/5 p-10 text-center">
          <span className="mb-3 block text-4xl">⚠️</span>
          <h1 className="mb-1.5 text-xl font-bold">No pudimos cargar el panel</h1>
          <p className="mb-6 text-sm text-slate-400">
            Revisa tu conexión a internet e intenta de nuevo.
          </p>
          <button
            onClick={() => {
              setSesion("cargando");
              obtenerDatos()
                .then(aplicarDatos)
                .catch(() => setSesion("error"));
            }}
            className="btn-glow"
          >
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  if (sesion === "sin-sesion" || sesion === "expirada") {
    return (
      <PantallaLogin
        aviso={sesion === "expirada" ? "Tu sesión expiró. Vuelve a entrar para continuar." : ""}
        alEntrar={recargar}
      />
    );
  }

  return (
    <Panel
      ordenes={ordenes}
      cotizaciones={cotizaciones}
      recargar={recargar}
      alExpirar={() => setSesion("expirada")}
      alSalir={async () => {
        await fetch("/api/admin/login", { method: "DELETE" }).catch(() => undefined);
        setSesion("sin-sesion");
      }}
    />
  );
}

/* ══════════ LOGIN ══════════ */

function PantallaLogin({ aviso, alEntrar }: { aviso: string; alEntrar: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(false);
    try {
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
    } catch {
      setError(true);
    }
    setCargando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className={`beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/50 backdrop-blur-xl ${error ? "sacudir" : ""}`}
      >
        <div className="mb-3 flex justify-center"><LogoAV className="w-14 h-14" /></div>
        <h1 className="mb-1.5 text-2xl font-bold">Panel del taller</h1>
        <p className="mb-7 text-sm text-slate-400">Acceso exclusivo para el personal de AV SOLUTIONS</p>

        {aviso && (
          <p className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-300">
            {aviso}
          </p>
        )}

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

type FiltroEstado = "todas" | "proceso" | "listo" | "entregado";
type Toast = { texto: string; tipo: "ok" | "error" };

function Panel({
  ordenes,
  cotizaciones,
  recargar,
  alExpirar,
  alSalir,
}: {
  ordenes: Orden[];
  cotizaciones: Cotizacion[];
  recargar: () => Promise<boolean>;
  alExpirar: () => void;
  alSalir: () => Promise<void>;
}) {
  const [pestana, setPestana] = useState<"ordenes" | "cotizaciones">("ordenes");
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<Orden>(ORDEN_VACIA);
  const [editando, setEditando] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Toast | null>(null);
  const [guardando, setGuardando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerBorrar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toast(texto: string, tipo: Toast["tipo"] = "ok") {
    setAviso({ texto, tipo });
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(null), 3200);
  }

  // fetch con manejo de sesión expirada y errores de red.
  async function pedir(url: string, init?: RequestInit): Promise<Response | null> {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch {
      toast("Sin conexión. Revisa tu internet e intenta de nuevo.", "error");
      return null;
    }
    if (res.status === 401) {
      alExpirar();
      return null;
    }
    return res;
  }

  function siguienteCodigo() {
    const nums = ordenes
      .map((o) => parseInt((o.codigo.match(/(\d+)$/) || [])[1], 10))
      .filter((n) => !isNaN(n));
    return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
  }

  const visibles = ordenes.filter((o) => {
    const texto = !filtro ||
      [o.codigo, o.cliente, o.equipo, o.servicio].join(" ").toLowerCase().includes(filtro.toLowerCase());
    const estado =
      filtroEstado === "todas" ||
      (filtroEstado === "proceso" && o.estado < ESTADO_LISTO) ||
      (filtroEstado === "listo" && o.estado === ESTADO_LISTO) ||
      (filtroEstado === "entregado" && o.estado === ESTADO_ENTREGADO);
    return texto && estado;
  });

  const stats: Array<{ clave: FiltroEstado; num: number; etiqueta: string; color: string }> = [
    { clave: "todas", num: ordenes.length, etiqueta: "Órdenes totales", color: "text-slate-100" },
    { clave: "proceso", num: ordenes.filter((o) => o.estado < ESTADO_LISTO).length, etiqueta: "En proceso", color: "text-amber-400" },
    { clave: "listo", num: ordenes.filter((o) => o.estado === ESTADO_LISTO).length, etiqueta: "Listas para recoger", color: "text-emerald-400" },
    { clave: "entregado", num: ordenes.filter((o) => o.estado === ESTADO_ENTREGADO).length, etiqueta: "Entregadas", color: "text-slate-400" },
  ];

  const cotizacionesPendientes = cotizaciones.filter((c) => !c.atendida).length;

  function abrirNuevaOrden() {
    setEditando(null);
    setConvirtiendo(null);
    setForm({ ...ORDEN_VACIA, codigo: siguienteCodigo(), recibido: fechaHoy() });
    setMostrarForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  function cerrarForm() {
    setMostrarForm(false);
    setEditando(null);
    setConvirtiendo(null);
    setForm(ORDEN_VACIA);
  }

  async function guardarForm(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    const cuerpo = { ...form, codigo: form.codigo.trim().toUpperCase() };

    const res = editando
      ? await pedir(`/api/admin/ordenes/${encodeURIComponent(editando)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        })
      : await pedir("/api/admin/ordenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        });

    if (res?.ok) {
      // Si esta orden venía de una cotización, la marcamos como atendida.
      if (convirtiendo !== null && !editando) {
        await pedir(`/api/admin/cotizaciones/${convirtiendo}`, {
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
      cerrarForm();
      await recargar();
    } else if (res) {
      const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
      toast(`${error}`, "error");
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
    setMostrarForm(true);
    setPestana("ordenes");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    toast("📋 Revisa los datos y pulsa «Guardar orden» para registrarla");
  }

  async function cambiarEstado(codigo: string, estado: number) {
    const res = await pedir(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    if (res?.ok) {
      toast(
        estado === ESTADO_LISTO
          ? `✅ ${codigo} marcado como LISTO PARA RECOGER`
          : `${ESTADOS[estado]?.icono ?? ""} ${codigo} → ${ESTADOS[estado]?.nombre ?? "actualizado"}`
      );
      await recargar();
    } else if (res) {
      toast("No se pudo actualizar el estado", "error");
    }
  }

  function pedirConfirmacion(clave: string) {
    setConfirmandoBorrar(clave);
    if (timerBorrar.current) clearTimeout(timerBorrar.current);
    timerBorrar.current = setTimeout(() => setConfirmandoBorrar(null), 4000);
  }

  async function borrar(codigo: string) {
    if (confirmandoBorrar !== codigo) {
      pedirConfirmacion(codigo);
      return;
    }
    setConfirmandoBorrar(null);
    const res = await pedir(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, { method: "DELETE" });
    if (res?.ok) {
      toast(`🗑️ Orden ${codigo} eliminada`);
      await recargar();
    } else if (res) {
      toast("No se pudo eliminar", "error");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setEditando(orden.codigo);
    setForm({ ...orden });
    setMostrarForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  }

  async function marcarCotizacion(id: number, atendida: boolean) {
    const res = await pedir(`/api/admin/cotizaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ atendida }),
    });
    if (res?.ok) {
      toast(atendida ? "✅ Cotización marcada como atendida" : "↩️ Cotización reabierta");
      await recargar();
    } else if (res) {
      toast("No se pudo actualizar", "error");
    }
  }

  async function borrarCotizacion(id: number) {
    if (confirmandoBorrar !== `cot-${id}`) {
      pedirConfirmacion(`cot-${id}`);
      return;
    }
    setConfirmandoBorrar(null);
    const res = await pedir(`/api/admin/cotizaciones/${id}`, { method: "DELETE" });
    if (res?.ok) {
      toast("🗑️ Cotización eliminada");
      await recargar();
    } else if (res) {
      toast("No se pudo eliminar", "error");
    }
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";
  const botonSecundario =
    "cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100";

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
          <Link href="/" target="_blank" className={botonSecundario}>
            👁️ Ver página
          </Link>
          <button
            onClick={async () => {
              toast((await recargar()) ? "🔄 Datos actualizados" : "No se pudo actualizar. Revisa tu conexión.");
            }}
            className={botonSecundario}
            title="Volver a cargar órdenes y cotizaciones"
          >
            🔄 Actualizar
          </button>
          <button onClick={alSalir} className={botonSecundario}>
            Salir
          </button>
        </div>
      </header>

      {/* Estadísticas (también filtran la lista) */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const activa = pestana === "ordenes" && filtroEstado === s.clave;
          return (
            <button
              key={s.clave}
              onClick={() => {
                setPestana("ordenes");
                setFiltroEstado(s.clave);
              }}
              title={`Ver: ${s.etiqueta.toLowerCase()}`}
              className={`cursor-pointer rounded-2xl border px-5 py-4 text-left backdrop-blur transition ${
                activa
                  ? "border-violet-500/60 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
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
      <nav className="mb-6 flex gap-2">
        {[
          { clave: "ordenes" as const, etiqueta: "🛠️ Órdenes", badge: 0 },
          { clave: "cotizaciones" as const, etiqueta: "📨 Cotizaciones", badge: cotizacionesPendientes },
        ].map((t) => (
          <button
            key={t.clave}
            onClick={() => setPestana(t.clave)}
            className={`flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
              pestana === t.clave
                ? "border-violet-500/60 bg-violet-500/15 text-slate-100"
                : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/25 hover:text-slate-200"
            }`}
          >
            {t.etiqueta}
            {t.badge > 0 && (
              <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[0.7rem] font-bold text-white">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {pestana === "ordenes" && (
        <>
          {/* Formulario nueva orden / edición (plegable) */}
          {mostrarForm && (
            <section
              className={`aparecer mb-6 rounded-3xl border p-7 backdrop-blur ${
                convirtiendo !== null
                  ? "border-violet-500/40 bg-violet-500/[0.06]"
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
                  <button type="button" onClick={cerrarForm}
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
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  {filtroEstado === "todas"
                    ? "Órdenes registradas"
                    : filtroEstado === "proceso"
                    ? "Órdenes en proceso"
                    : filtroEstado === "listo"
                    ? "Listas para recoger"
                    : "Órdenes entregadas"}
                  <span className="ml-2 text-sm font-normal text-slate-500">({visibles.length})</span>
                </h2>
                <p className="text-sm text-slate-400">
                  Usa <b className="text-slate-300">▸ Avanzar</b> para pasar al siguiente estado sin abrir nada.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500">
                  <span className="ml-3.5 text-slate-400"><IconoLupa className="w-4 h-4" /></span>
                  <input
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    type="search"
                    placeholder="Código, cliente, equipo…"
                    className="w-44 bg-transparent px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
                {!mostrarForm && (
                  <button onClick={abrirNuevaOrden} className="btn-glow">
                    <span className="px-1 py-0">➕ Nueva orden</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {visibles.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
                  {filtro || filtroEstado !== "todas"
                    ? "No hay órdenes que coincidan con este filtro."
                    : "Aún no hay órdenes registradas. Pulsa «Nueva orden» para agregar la primera."}
                </div>
              )}
              {visibles.map((o) => (
                <article
                  key={o.codigo}
                  className={`rounded-2xl border p-4 transition ${
                    o.estado === ESTADO_LISTO
                      ? "border-emerald-400/40 bg-emerald-400/5"
                      : o.estado === ESTADO_ENTREGADO
                      ? "border-white/10 bg-white/[0.03] opacity-60"
                      : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    <div className="w-24 shrink-0">
                      <span className="block font-bold text-cyan-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {o.codigo}
                      </span>
                      <span className="block text-[0.7rem] text-slate-500">{o.recibido}</span>
                    </div>
                    <div className="min-w-0 flex-1 basis-52">
                      <div className="text-sm font-semibold">{o.cliente}</div>
                      <div className="truncate text-xs text-slate-400">{o.equipo} · {o.servicio}</div>
                      {o.nota && <div className="mt-0.5 truncate text-xs italic text-slate-500">📝 {o.nota}</div>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                      <select
                        value={o.estado}
                        onChange={(e) => cambiarEstado(o.codigo, Number(e.target.value))}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold outline-none transition [&>option]:bg-[#0b1020] [&>option]:text-slate-100 ${COLOR_ESTADO[o.estado] ?? COLOR_ESTADO[0]}`}
                        title="Cambiar estado"
                        aria-label={`Estado de la orden ${o.codigo}`}
                      >
                        {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                          <option key={etiqueta} value={i}>{etiqueta}</option>
                        ))}
                      </select>
                      {o.estado < ESTADO_ENTREGADO && (
                        <button
                          onClick={() => cambiarEstado(o.codigo, o.estado + 1)}
                          title={`Pasar a: ${ESTADOS[o.estado + 1].nombre}`}
                          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:brightness-125 ${
                            o.estado + 1 === ESTADO_LISTO
                              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                              : "border-white/15 bg-white/[0.06] text-slate-300"
                          }`}
                        >
                          ▸ {ESTADOS[o.estado + 1].nombre}
                        </button>
                      )}
                      </div>
                      <div className="flex items-center gap-2">
                      <button onClick={() => editar(o)} title="Editar orden" aria-label={`Editar orden ${o.codigo}`}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-white/30">
                        ✏️
                      </button>
                      <button onClick={() => borrar(o.codigo)}
                        aria-label={`Eliminar orden ${o.codigo}`}
                        className={`flex h-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition ${
                          confirmandoBorrar === o.codigo
                            ? "w-auto border-red-400/60 bg-red-400/15 px-3 font-semibold text-red-300"
                            : "w-9 border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                        }`}>
                        {confirmandoBorrar === o.codigo ? "¿Eliminar?" : "🗑️"}
                      </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {pestana === "cotizaciones" && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold">Cotizaciones recibidas</h2>
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
                <article
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
                      aria-label="Eliminar cotización"
                      className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-sm transition ${
                        confirmandoBorrar === `cot-${c.id}`
                          ? "border-red-400/60 bg-red-400/15 font-semibold text-red-300"
                          : "border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                      }`}
                    >
                      {confirmandoBorrar === `cot-${c.id}` ? "¿Eliminar?" : "🗑️"}
                    </button>
                  </div>
                </article>
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
              ? "border-red-400/60 text-red-200 shadow-[0_0_26px_rgba(248,113,113,0.25),0_12px_34px_rgba(0,0,0,0.5)]"
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
