"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ESTADOS, type Orden } from "@/lib/tipos";
import { IconoCandado, IconoLupa, LogoAV } from "@/components/Iconos";

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

export default function PaginaAdmin() {
  const [sesion, setSesion] = useState<"cargando" | "sin-sesion" | "activa">("cargando");
  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  const cargarOrdenes = useCallback(async () => {
    const res = await fetch("/api/admin/ordenes");
    if (res.status === 401) {
      setSesion("sin-sesion");
      return false;
    }
    if (res.ok) {
      setOrdenes(await res.json());
      setSesion("activa");
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  if (sesion === "cargando") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader-ring" />
      </div>
    );
  }

  if (sesion === "sin-sesion") {
    return <PantallaLogin alEntrar={cargarOrdenes} />;
  }

  return (
    <Panel
      ordenes={ordenes}
      recargar={cargarOrdenes}
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
  recargar,
  alSalir,
}: {
  ordenes: Orden[];
  recargar: () => Promise<boolean>;
  alSalir: () => Promise<void>;
}) {
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState<Orden>({ ...ORDEN_VACIA, recibido: fechaHoy() });
  const [editando, setEditando] = useState<string | null>(null);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function toast(msg: string) {
    setAviso(msg);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(""), 2800);
  }

  function siguienteCodigo() {
    const nums = ordenes
      .map((o) => parseInt((o.codigo.match(/(\d+)$/) || [])[1], 10))
      .filter((n) => !isNaN(n));
    return `AV-${nums.length ? Math.max(...nums) + 1 : 1001}`;
  }

  const visibles = ordenes.filter(
    (o) =>
      !filtro ||
      [o.codigo, o.cliente, o.equipo, o.servicio].join(" ").toLowerCase().includes(filtro.toLowerCase())
  );

  const stats = {
    total: ordenes.length,
    proceso: ordenes.filter((o) => o.estado <= 2).length,
    listo: ordenes.filter((o) => o.estado === 3).length,
    entregado: ordenes.filter((o) => o.estado === 4).length,
  };

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
      toast(editando ? `✏️ Orden ${cuerpo.codigo} actualizada` : `✅ Orden ${cuerpo.codigo} registrada`);
      setForm({ ...ORDEN_VACIA, recibido: fechaHoy() });
      setEditando(null);
      await recargar();
    } else {
      const { error } = await res.json().catch(() => ({ error: "Error al guardar" }));
      toast(`⚠️ ${error}`);
    }
    setGuardando(false);
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
      toast(`🗑️ Orden ${codigo} eliminada`);
      await recargar();
    } else {
      toast("⚠️ No se pudo eliminar");
    }
  }

  function editar(orden: Orden) {
    setEditando(orden.codigo);
    setForm({ ...orden });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast(`✏️ Editando ${orden.codigo} — modifica y pulsa "Actualizar orden"`);
  }

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8">
      {/* Cabecera */}
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <LogoAV className="w-9 h-9" />
          <div>
            <h1 className="text-2xl font-bold">Panel de órdenes</h1>
            <p className="text-sm text-slate-400">Los cambios se publican al instante para tus clientes</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Link href="/" target="_blank" className="rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100">
            👁️ Ver página
          </Link>
          <button onClick={alSalir} className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4.5 py-2 text-sm font-medium text-slate-400 transition hover:border-white/30 hover:text-slate-100">
            Salir
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { num: stats.total, etiqueta: "Órdenes totales", color: "text-slate-100" },
          { num: stats.proceso, etiqueta: "En proceso", color: "text-amber-400" },
          { num: stats.listo, etiqueta: "Listos para recoger", color: "text-emerald-400" },
          { num: stats.entregado, etiqueta: "Entregados", color: "text-slate-400" },
        ].map((s) => (
          <div key={s.etiqueta} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
            <span className={`block text-3xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {s.num}
            </span>
            <span className="text-xs text-slate-400">{s.etiqueta}</span>
          </div>
        ))}
      </section>

      {/* Formulario nueva orden / edición */}
      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
        <h2 className="mb-1 text-lg font-bold">{editando ? `✏️ Editando ${editando}` : "➕ Nueva orden"}</h2>
        <p className="mb-5 text-sm text-slate-400">
          {editando ? "Modifica los datos y guarda." : "Registra el equipo que acaba de dejar un cliente."}
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
            {editando && (
              <button type="button" className="cursor-pointer rounded-full border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-400 transition hover:text-slate-100"
                onClick={() => { setEditando(null); setForm({ ...ORDEN_VACIA, recibido: fechaHoy() }); }}>
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
            <h2 className="text-lg font-bold">📋 Órdenes registradas</h2>
            <p className="text-sm text-slate-400">Cambia el estado con el menú desplegable — se guarda solo.</p>
          </div>
          <div className="flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500">
            <span className="ml-3.5 text-slate-400"><IconoLupa className="w-4 h-4" /></span>
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              type="search"
              placeholder="Buscar…"
              className="w-40 bg-transparent px-2.5 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {visibles.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
              {filtro ? "No hay órdenes que coincidan con tu búsqueda." : "Aún no hay órdenes registradas. Agrega la primera arriba. 👆"}
            </div>
          )}
          {visibles.map((o) => (
            <div
              key={o.codigo}
              className={`grid items-center gap-4 rounded-2xl border p-4 transition sm:grid-cols-[110px_1.3fr_200px_auto] ${
                o.estado === 3
                  ? "border-emerald-400/40 bg-emerald-400/5"
                  : o.estado === 4
                  ? "border-white/10 bg-white/[0.03] opacity-60"
                  : "border-white/10 bg-white/[0.03] hover:border-violet-500/40"
              }`}
            >
              <span className="font-bold text-cyan-400" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {o.codigo}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{o.cliente}</div>
                <div className="truncate text-xs text-slate-400">{o.equipo} · {o.servicio}</div>
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm transition hover:border-red-400/50 hover:bg-red-400/10">
                  {confirmandoBorrar === o.codigo ? "❗" : "🗑️"}
                </button>
              </div>
            </div>
          ))}
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
