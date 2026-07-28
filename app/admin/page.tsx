"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ESTADOS, type Orden, type Cotizacion } from "@/lib/tipos";
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

function fechaHoy() {
  return new Date()
    .toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .replace(" de 2", ", 2");
}

function tiempoRelativo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms) || ms < 0) return "";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? "hace 1 día" : `hace ${dias} días`;
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
      if (!resOrd.ok) throw new Error("Respuesta inesperada del servidor");
      setOrdenes(await resOrd.json());
      if (resCot.ok) setCotizaciones(await resCot.json());
      setSesion("activa");
      return true;
    } catch {
      // Si el panel ya estaba abierto, no lo tiramos por un fallo puntual de red.
      setSesion((actual) => (actual === "activa" ? actual : "error"));
      return false;
    }
  }, []);

  useEffect(() => {
    const carga = setTimeout(cargarDatos, 0);
    return () => clearTimeout(carga);
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
        <div className="beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-3 text-4xl">📡</div>
          <h1 className="mb-1.5 text-2xl font-bold">Sin conexión</h1>
          <p className="mb-7 text-sm text-slate-400">
            No pudimos cargar el panel. Revisa tu internet e inténtalo de nuevo.
          </p>
          <button
            className="btn-glow w-full"
            onClick={() => {
              setSesion("cargando");
              cargarDatos();
            }}
          >
            <span className="w-full justify-center">Reintentar</span>
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
        await fetch("/api/admin/login", { method: "DELETE" });
        setSesion("sin-sesion");
      }}
    />
  );
}

/* ══════════ LOGIN ══════════ */

function PantallaLogin({ alEntrar }: { alEntrar: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        setError("❌ Contraseña incorrecta. Intenta de nuevo.");
        setPassword("");
      }
    } catch {
      setError("⚠️ No se pudo conectar. Revisa tu internet e inténtalo otra vez.");
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

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

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
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [form, setForm] = useState<Orden>({ ...ORDEN_VACIA, recibido: fechaHoy() });
  const [editando, setEditando] = useState<string | null>(null);
  const [convirtiendo, setConvirtiendo] = useState<number | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => {
      if (timerAviso.current) clearTimeout(timerAviso.current);
    };
  }, []);

  // Escape cancela la edición o conversión en curso.
  useEffect(() => {
    if (!editando && convirtiendo === null) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setEditando(null);
      setConvirtiendo(null);
      setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [editando, convirtiendo]);

  function toast(msg: string) {
    setAviso(msg);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(""), 2800);
  }

  // Si la sesión caducó a mitad de trabajo, avisamos y volvemos al login.
  async function avisarFallo(res: Response, mensajePorDefecto: string) {
    if (res.status === 401) {
      toast("⚠️ Tu sesión expiró — vuelve a iniciar sesión");
      await recargar();
      return;
    }
    const { error } = await res.json().catch(() => ({ error: mensajePorDefecto }));
    toast(`⚠️ ${error || mensajePorDefecto}`);
  }

  function siguienteCodigo() {
    const nums = ordenes
      .map((o) => parseInt(o.codigo.match(/(\d+)$/)?.[1] ?? "", 10))
      .filter((n) => !isNaN(n));
    return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
  }

  const coincideEstado = (o: Orden) =>
    filtroEstado === "todas" ||
    (filtroEstado === "proceso" && o.estado <= 2) ||
    (filtroEstado === "listo" && o.estado === 3) ||
    (filtroEstado === "entregado" && o.estado === 4);

  const visibles = ordenes.filter(
    (o) =>
      coincideEstado(o) &&
      (!filtro ||
        [o.codigo, o.cliente, o.equipo, o.servicio, o.nota]
          .join(" ")
          .toLowerCase()
          .includes(filtro.toLowerCase()))
  );

  const stats = {
    total: ordenes.length,
    proceso: ordenes.filter((o) => o.estado <= 2).length,
    listo: ordenes.filter((o) => o.estado === 3).length,
    entregado: ordenes.filter((o) => o.estado === 4).length,
  };

  const tarjetas: { clave: FiltroEstado; num: number; etiqueta: string; color: string }[] = [
    { clave: "todas", num: stats.total, etiqueta: "Órdenes totales", color: "text-slate-100" },
    { clave: "proceso", num: stats.proceso, etiqueta: "En proceso", color: "text-amber-400" },
    { clave: "listo", num: stats.listo, etiqueta: "Listos para recoger", color: "text-emerald-400" },
    { clave: "entregado", num: stats.entregado, etiqueta: "Entregados", color: "text-slate-400" },
  ];

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
      setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
      setEditando(null);
      setConvirtiendo(null);
      await recargar();
    } else {
      await avisarFallo(res, "Error al guardar");
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
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("📋 Revisa los datos y pulsa «Guardar orden» para registrarla");
  }

  async function cambiarEstado(codigo: string, estado: number) {
    const res = await fetch(`/api/admin/ordenes/${encodeURIComponent(codigo)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    if (res.ok) {
      toast(estado === 3 ? `✅ ${codigo} marcado como LISTO PARA RECOGER` : `Estado de ${codigo} actualizado`);
      await recargar();
    } else {
      await avisarFallo(res, "No se pudo actualizar");
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
      toast(`🗑️ Orden ${codigo} eliminada`);
      await recargar();
    } else {
      await avisarFallo(res, "No se pudo eliminar");
    }
  }

  function editar(orden: Orden) {
    setConvirtiendo(null);
    setEditando(orden.codigo);
    setForm({ ...orden });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast(`✏️ Editando ${orden.codigo} — modifica y pulsa "Actualizar orden"`);
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      toast(`📋 Código ${codigo} copiado — pásaselo al cliente`);
    } catch {
      toast("⚠️ No se pudo copiar el código");
    }
  }

  async function refrescar() {
    setRefrescando(true);
    const ok = await recargar();
    toast(ok ? "🔄 Datos actualizados" : "⚠️ No se pudo actualizar — revisa tu conexión");
    setRefrescando(false);
  }

  const cotizacionesPendientes = cotizaciones.filter((c) => !c.atendida).length;

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
      await avisarFallo(res, "No se pudo actualizar");
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
      toast("🗑️ Cotización eliminada");
      await recargar();
    } else {
      await avisarFallo(res, "No se pudo eliminar");
    }
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";

  const botonHeaderClase =
    "cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8">
      {/* Cabecera */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <LogoAV className="w-9 h-9" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold">Panel de órdenes</h1>
              {cotizacionesPendientes > 0 && (
                <a
                  href="#cotizaciones"
                  className="rounded-full border border-violet-400/40 bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/30"
                  title="Ir a las cotizaciones sin atender"
                >
                  📨 {cotizacionesPendientes} sin atender
                </a>
              )}
            </div>
            <p className="text-sm text-slate-400">Los cambios se publican al instante para tus clientes</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button onClick={refrescar} disabled={refrescando} className={botonHeaderClase} title="Volver a cargar órdenes y cotizaciones">
            {refrescando ? "Actualizando…" : "🔄 Actualizar"}
          </button>
          <Link href="/" target="_blank" className={botonHeaderClase}>
            👁️ Ver página
          </Link>
          <button onClick={alSalir} className={botonHeaderClase}>
            Salir
          </button>
        </div>
      </header>

      {/* Estadísticas — clic para filtrar la lista */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tarjetas.map((s) => {
          const activa = filtroEstado === s.clave;
          return (
            <button
              key={s.etiqueta}
              type="button"
              aria-pressed={activa}
              onClick={() => setFiltroEstado(activa ? "todas" : s.clave)}
              title={activa && s.clave !== "todas" ? "Quitar filtro" : `Ver solo: ${s.etiqueta.toLowerCase()}`}
              className={`cursor-pointer rounded-2xl border px-5 py-4 text-left backdrop-blur transition ${
                activa
                  ? "border-violet-500/60 bg-violet-500/[0.08] shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
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

      {/* Formulario nueva orden / edición */}
      <section className={`mb-6 rounded-3xl border p-7 backdrop-blur ${convirtiendo !== null ? "border-violet-500/40 bg-violet-500/[0.06]" : editando ? "border-cyan-400/40 bg-cyan-400/[0.04]" : "border-white/10 bg-white/[0.04]"}`}>
        <h2 className="mb-1 text-lg font-bold">
          {editando
            ? `✏️ Editando ${editando}`
            : convirtiendo !== null
            ? "🔄 Convertir cotización en orden"
            : "➕ Nueva orden"}
        </h2>
        <p className="mb-5 text-sm text-slate-400">
          {editando
            ? "Modifica los datos y guarda. Pulsa Esc para cancelar."
            : convirtiendo !== null
            ? "Ajusta los datos de la cotización y guárdala como orden registrada. Pulsa Esc para cancelar."
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
            {(editando || convirtiendo !== null) && (
              <button type="button" className="cursor-pointer rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-100"
                onClick={() => { setEditando(null); setConvirtiendo(null); setForm({ ...ORDEN_VACIA, recibido: fechaHoy() }); }}>
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
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">
              📋 Órdenes registradas
              {(filtro || filtroEstado !== "todas") && (
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({visibles.length} de {ordenes.length})
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400">
              Cambia el estado con el menú desplegable — se guarda solo. Toca el código para copiarlo.
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

        <div className="flex flex-col gap-3.5">
          {visibles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
              {filtro || filtroEstado !== "todas" ? (
                <>
                  No hay órdenes que coincidan con tu búsqueda.{" "}
                  <button
                    type="button"
                    onClick={() => { setFiltro(""); setFiltroEstado("todas"); }}
                    className="cursor-pointer font-semibold text-cyan-400 underline decoration-dotted underline-offset-4 transition hover:text-cyan-300"
                  >
                    Quitar filtros
                  </button>
                </>
              ) : (
                "Aún no hay órdenes registradas. Agrega la primera arriba. 👆"
              )}
            </div>
          )}
          {visibles.map((o) => (
            <div
              key={o.codigo}
              className={`grid gap-3 rounded-2xl border p-4 transition sm:grid-cols-[110px_1.3fr_200px_auto] sm:items-center sm:gap-4 ${
                o.estado === 3
                  ? "border-emerald-400/40 bg-emerald-400/5"
                  : o.estado === 4
                  ? "border-white/10 bg-white/[0.03] opacity-60"
                  : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
              }`}
            >
              <button
                type="button"
                onClick={() => copiarCodigo(o.codigo)}
                title="Copiar código para pasárselo al cliente"
                className="cursor-pointer justify-self-start font-bold text-cyan-400 underline decoration-dotted decoration-cyan-400/40 underline-offset-4 transition hover:text-cyan-300"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {o.codigo}
              </button>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{o.cliente}</div>
                <div className="truncate text-xs text-slate-400">{o.equipo} · {o.servicio}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-slate-500">
                  {o.recibido && <span>📅 {o.recibido}</span>}
                  {o.nota && <span className="truncate" title={o.nota}>📝 {o.nota}</span>}
                </div>
              </div>
              <select
                value={o.estado}
                onChange={(e) => cambiarEstado(o.codigo, Number(e.target.value))}
                className={`${inputClase} w-full cursor-pointer`}
                title="Cambiar estado"
              >
                {ETIQUETAS_ESTADO.map((etiqueta, i) => (
                  <option key={etiqueta} value={i}>{etiqueta}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => editar(o)} title="Editar orden"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-white/30">
                  ✏️
                </button>
                <button onClick={() => borrar(o.codigo)}
                  title={confirmandoBorrar === o.codigo ? "Haz clic otra vez para confirmar" : "Eliminar orden"}
                  className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm transition ${
                    confirmandoBorrar === o.codigo
                      ? "border-red-400/60 bg-red-400/15"
                      : "border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                  }`}>
                  {confirmandoBorrar === o.codigo ? "❗" : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cotizaciones recibidas */}
      <section id="cotizaciones" className="mt-6 scroll-mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
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
                  <span
                    className="text-xs text-slate-500"
                    title={new Date(c.creado).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" })}
                  >
                    {tiempoRelativo(c.creado) ||
                      new Date(c.creado).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
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
                        ? "border-red-400/60 bg-red-400/15"
                        : "border-white/10 bg-white/[0.04] hover:border-red-400/50 hover:bg-red-400/10"
                    }`}
                  >
                    {confirmandoBorrar === `cot-${c.id}` ? "❗" : "🗑️"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Toast */}
      {aviso && (
        <div className="aparecer fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-400/50 bg-[#0b1020] px-6 py-3 text-sm font-medium shadow-[0_0_26px_rgba(52,211,153,0.25),0_12px_34px_rgba(0,0,0,0.5)]">
          {aviso}
        </div>
      )}
    </div>
  );
}
