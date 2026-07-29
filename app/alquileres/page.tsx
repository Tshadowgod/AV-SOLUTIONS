"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  type Inquilino,
  type LecturaLuz,
  type PagoAlquiler,
  periodoActual,
  etiquetaPeriodo,
  formatoMoneda,
  formatoKwh,
} from "@/lib/alquileres";

type Sesion = "cargando" | "sin-sesion" | "activa" | "error";
type Vista = "inquilinos" | "luz" | "alquiler";
type ToastTipo = "ok" | "error" | "info";

const INQUILINO_VACIO = {
  nombre: "",
  unidad: "",
  telefono: "",
  alquiler_mensual: 0,
  medidor: "",
  lectura_anterior: 0,
  activo: true,
};

function periodosRecientes(n = 6): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(periodoActual(d));
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export default function PaginaAlquileres() {
  const [sesion, setSesion] = useState<Sesion>("cargando");
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [lecturas, setLecturas] = useState<LecturaLuz[]>([]);
  const [pagos, setPagos] = useState<PagoAlquiler[]>([]);
  const [periodo, setPeriodo] = useState(periodoActual);

  const cargar = useCallback(async (periodoSel?: string) => {
    const p = periodoSel ?? periodo;
    try {
      const [rInq, rLuz, rPag] = await Promise.all([
        fetch("/api/alquileres/inquilinos"),
        fetch(`/api/alquileres/lecturas?periodo=${encodeURIComponent(p)}`),
        fetch(`/api/alquileres/pagos?periodo=${encodeURIComponent(p)}`),
      ]);
      if (rInq.status === 401) {
        setSesion("sin-sesion");
        return false;
      }
      if (!rInq.ok) throw new Error("error");
      setInquilinos(await rInq.json());
      if (rLuz.ok) setLecturas(await rLuz.json());
      if (rPag.ok) setPagos(await rPag.json());
      setSesion("activa");
      return true;
    } catch {
      setSesion((s) => (s === "activa" ? s : "error"));
      return false;
    }
  }, [periodo]);

  useEffect(() => {
    const t = setTimeout(() => cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

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
        <div className="beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center">
          <h1 className="mb-2 text-2xl font-bold">Sin conexión</h1>
          <p className="mb-6 text-sm text-slate-400">
            No pudimos cargar el panel de alquileres.
          </p>
          <button
            type="button"
            className="btn-glow w-full"
            onClick={() => {
              setSesion("cargando");
              cargar();
            }}
          >
            <span className="w-full justify-center">Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  if (sesion === "sin-sesion") {
    return (
      <LoginAlquileres
        alEntrar={async () => {
          await cargar();
        }}
      />
    );
  }

  return (
    <PanelAlquileres
      inquilinos={inquilinos}
      lecturas={lecturas}
      pagos={pagos}
      periodo={periodo}
      setPeriodo={(p) => {
        setPeriodo(p);
        cargar(p);
      }}
      recargar={() => cargar()}
      alSalir={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        setSesion("sin-sesion");
      }}
    />
  );
}

function LoginAlquileres({ alEntrar }: { alEntrar: () => Promise<void> }) {
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
    if (res.ok) await alEntrar();
    else {
      setError(true);
      setPassword("");
    }
    setCargando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className={`beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center ${error ? "sacudir" : ""}`}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
          Control de alquileres
        </p>
        <h1 className="mb-1.5 text-2xl font-bold">Acceso al panel</h1>
        <p className="mb-7 text-sm text-slate-400">
          Misma contraseña del panel de administración
        </p>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          required
          className="mb-4 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
        />
        {error && (
          <p className="mb-4 text-sm text-red-400">Contraseña incorrecta.</p>
        )}
        <button type="submit" className="btn-glow w-full" disabled={cargando}>
          <span className="w-full justify-center">
            {cargando ? "Verificando…" : "Entrar"}
          </span>
        </button>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-slate-400 hover:text-cyan-400"
        >
          ← Volver al inicio
        </Link>
      </form>
    </div>
  );
}

function PanelAlquileres({
  inquilinos,
  lecturas,
  pagos,
  periodo,
  setPeriodo,
  recargar,
  alSalir,
}: {
  inquilinos: Inquilino[];
  lecturas: LecturaLuz[];
  pagos: PagoAlquiler[];
  periodo: string;
  setPeriodo: (p: string) => void;
  recargar: () => Promise<boolean>;
  alSalir: () => Promise<void>;
}) {
  const [vista, setVista] = useState<Vista>("inquilinos");
  const [filtro, setFiltro] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...INQUILINO_VACIO });
  const [lecturaModal, setLecturaModal] = useState<Inquilino | null>(null);
  const [lecturaActual, setLecturaActual] = useState("");
  const [precioKwh, setPrecioKwh] = useState("");
  const [notaLuz, setNotaLuz] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState<ToastTipo>("ok");
  const [confirmandoBorrar, setConfirmandoBorrar] = useState<number | null>(null);
  const timerAviso = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toast(msg: string, tipo: ToastTipo = "ok") {
    setAviso(msg);
    setTipoAviso(tipo);
    if (timerAviso.current) clearTimeout(timerAviso.current);
    timerAviso.current = setTimeout(() => setAviso(""), 3200);
  }

  useEffect(() => {
    if (!confirmandoBorrar) return;
    const t = setTimeout(() => setConfirmandoBorrar(null), 3500);
    return () => clearTimeout(t);
  }, [confirmandoBorrar]);

  const activos = inquilinos.filter((i) => i.activo);
  const lecturasPorInq = useMemo(() => {
    const m = new Map<number, LecturaLuz>();
    for (const l of lecturas) m.set(l.inquilino_id, l);
    return m;
  }, [lecturas]);
  const pagosPorInq = useMemo(() => {
    const m = new Map<number, PagoAlquiler>();
    for (const p of pagos) m.set(p.inquilino_id, p);
    return m;
  }, [pagos]);

  const visibles = inquilinos
    .filter((i) => (mostrarInactivos ? true : i.activo))
    .filter((i) => {
      if (!filtro) return true;
      const q = filtro.toLowerCase();
      return [i.nombre, i.unidad, i.medidor, i.telefono]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

  const stats = {
    activos: activos.length,
    alquilerPendiente: activos.filter((i) => !pagosPorInq.get(i.id)?.pagado).length,
    sinLectura: activos.filter((i) => !lecturasPorInq.has(i.id)).length,
    consumoTotal: lecturas.reduce((s, l) => s + Number(l.consumo), 0),
    luzTotal: lecturas.reduce((s, l) => s + Number(l.monto), 0),
  };

  const inputClase =
    "rounded-xl border border-white/10 bg-[#0b1020] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]";

  async function avisarSesion(res: Response) {
    if (res.status === 401) {
      toast("Sesión expirada. Vuelve a entrar.", "error");
      await alSalir();
      return true;
    }
    return false;
  }

  function abrirNuevo() {
    setEditandoId(null);
    setForm({ ...INQUILINO_VACIO });
    setFormAbierto(true);
    setVista("inquilinos");
  }

  function abrirEditar(i: Inquilino) {
    setEditandoId(i.id);
    setForm({
      nombre: i.nombre,
      unidad: i.unidad,
      telefono: i.telefono,
      alquiler_mensual: i.alquiler_mensual,
      medidor: i.medidor,
      lectura_anterior: i.lectura_anterior,
      activo: i.activo,
    });
    setFormAbierto(true);
    setVista("inquilinos");
  }

  async function guardarInquilino(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = editandoId
        ? await fetch(`/api/alquileres/inquilinos/${editandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/alquileres/inquilinos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (await avisarSesion(res)) return;
      if (res.ok) {
        toast(editandoId ? "Inquilino actualizado" : "Inquilino registrado");
        setFormAbierto(false);
        setEditandoId(null);
        setForm({ ...INQUILINO_VACIO });
        await recargar();
      } else {
        const { error } = await res.json().catch(() => ({ error: "Error" }));
        toast(error, "error");
      }
    } catch {
      toast("Sin conexión", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function borrarInquilino(id: number) {
    if (confirmandoBorrar !== id) {
      setConfirmandoBorrar(id);
      return;
    }
    try {
      const res = await fetch(`/api/alquileres/inquilinos/${id}`, {
        method: "DELETE",
      });
      setConfirmandoBorrar(null);
      if (await avisarSesion(res)) return;
      if (res.ok) {
        toast("Inquilino eliminado");
        await recargar();
      } else toast("No se pudo eliminar", "error");
    } catch {
      toast("Sin conexión", "error");
    }
  }

  function abrirLectura(i: Inquilino) {
    setLecturaModal(i);
    setLecturaActual("");
    setPrecioKwh("");
    setNotaLuz("");
  }

  async function guardarLectura(e: React.FormEvent) {
    e.preventDefault();
    if (!lecturaModal) return;
    setGuardando(true);
    try {
      const res = await fetch("/api/alquileres/lecturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquilino_id: lecturaModal.id,
          periodo,
          lectura_actual: Number(lecturaActual),
          precio_kwh: Number(precioKwh) || 0,
          nota: notaLuz,
        }),
      });
      if (await avisarSesion(res)) return;
      if (res.ok) {
        const data = await res.json();
        toast(
          `Consumo: ${formatoKwh(data.consumo)}${data.monto ? ` · ${formatoMoneda(data.monto)}` : ""}`
        );
        setLecturaModal(null);
        await recargar();
      } else {
        const { error } = await res.json().catch(() => ({ error: "Error" }));
        toast(error, "error");
      }
    } catch {
      toast("Sin conexión", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function togglePago(i: Inquilino) {
    const actual = pagosPorInq.get(i.id);
    const nuevoPagado = !actual?.pagado;
    try {
      const res = await fetch("/api/alquileres/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquilino_id: i.id,
          periodo,
          monto: i.alquiler_mensual,
          pagado: nuevoPagado,
        }),
      });
      if (await avisarSesion(res)) return;
      if (res.ok) {
        toast(
          nuevoPagado
            ? `Alquiler de ${i.unidad || i.nombre} marcado como pagado`
            : `Alquiler de ${i.unidad || i.nombre} marcado como pendiente`
        );
        await recargar();
      } else toast("No se pudo actualizar el pago", "error");
    } catch {
      toast("Sin conexión", "error");
    }
  }

  const consumoPreview =
    lecturaModal && lecturaActual !== ""
      ? Math.max(0, Number(lecturaActual) - Number(lecturaModal.lectura_anterior))
      : null;
  const montoPreview =
    consumoPreview !== null && precioKwh
      ? Math.round(consumoPreview * Number(precioKwh) * 100) / 100
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-5 sm:pt-8">
      <header className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#070b14]/90 px-4 py-4 backdrop-blur-xl sm:-mx-5 sm:px-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
            Gestión
          </p>
          <h1 className="text-xl font-bold sm:text-2xl">Alquileres y luz</h1>
          <p className="text-sm text-slate-400">
            {etiquetaPeriodo(periodo)} · inquilinos, pagos y medidores
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className={`${inputClase} cursor-pointer`}
            aria-label="Periodo"
          >
            {periodosRecientes().map((p) => (
              <option key={p} value={p}>
                {etiquetaPeriodo(p)}
              </option>
            ))}
          </select>
          <Link
            href="/admin"
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
          >
            Admin AV
          </Link>
          <button
            type="button"
            onClick={alSalir}
            className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Resumen ordenado */}
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Inquilinos activos", value: String(stats.activos), tone: "text-slate-100" },
          {
            label: "Alquiler pendiente",
            value: String(stats.alquilerPendiente),
            tone: stats.alquilerPendiente ? "text-amber-300" : "text-emerald-300",
          },
          {
            label: "Sin lectura de luz",
            value: String(stats.sinLectura),
            tone: stats.sinLectura ? "text-amber-300" : "text-emerald-300",
          },
          {
            label: "Consumo del mes",
            value: formatoKwh(stats.consumoTotal),
            tone: "text-cyan-300",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
          >
            <div
              className={`text-2xl font-bold tabular-nums ${s.tone}`}
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {s.value}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Pestañas */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5">
        {(
          [
            ["inquilinos", "Inquilinos"],
            ["luz", "Medidores kWh"],
            ["alquiler", "Alquileres"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setVista(id)}
            className={`flex-1 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              vista === id
                ? "bg-white/[0.09] text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Formulario inquilino */}
      {vista === "inquilinos" && (
        <>
          {!formAbierto ? (
            <button
              type="button"
              onClick={abrirNuevo}
              className="mb-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/40 hover:text-slate-100"
            >
              + Nuevo inquilino
            </button>
          ) : (
            <section className="mb-5 rounded-3xl border border-cyan-500/25 bg-cyan-500/[0.04] p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    {editandoId ? "Editar inquilino" : "Nuevo inquilino"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Anota el medidor y la lectura anterior para calcular el consumo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormAbierto(false);
                    setEditandoId(null);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-100"
                >
                  Cerrar
                </button>
              </div>
              <form onSubmit={guardarInquilino} className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Nombre
                  <input
                    required
                    value={form.nombre}
                    className={inputClase}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Unidad / departamento
                  <input
                    value={form.unidad}
                    placeholder="Ej. Depto 2B"
                    className={inputClase}
                    onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Teléfono
                  <input
                    value={form.telefono}
                    className={inputClase}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Alquiler mensual (Bs)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.alquiler_mensual}
                    className={inputClase}
                    onChange={(e) =>
                      setForm({ ...form, alquiler_mensual: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  N.º de medidor
                  <input
                    value={form.medidor}
                    placeholder="Número del medidor de luz"
                    className={inputClase}
                    onChange={(e) => setForm({ ...form, medidor: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
                  Lectura anterior (kWh)
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.lectura_anterior}
                    className={inputClase}
                    onChange={(e) =>
                      setForm({ ...form, lectura_anterior: Number(e.target.value) })
                    }
                  />
                </label>
                {editandoId && (
                  <label className="flex items-center gap-2 text-sm text-slate-300 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.activo}
                      onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                    />
                    Inquilino activo
                  </label>
                )}
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormAbierto(false);
                      setEditandoId(null);
                    }}
                    className="cursor-pointer rounded-full border border-white/10 px-5 py-2 text-sm text-slate-400"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-glow" disabled={guardando}>
                    <span>{guardando ? "Guardando…" : "Guardar"}</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {/* Buscador */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          type="search"
          placeholder="Buscar por nombre, unidad o medidor…"
          className={`${inputClase} min-w-[14rem] flex-1`}
        />
        {vista === "inquilinos" && (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={mostrarInactivos}
              onChange={(e) => setMostrarInactivos(e.target.checked)}
            />
            Mostrar inactivos
          </label>
        )}
      </div>

      {/* Lista principal */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <h2 className="font-bold">
            {vista === "inquilinos" && "Lista de inquilinos"}
            {vista === "luz" && `Lecturas de luz · ${etiquetaPeriodo(periodo)}`}
            {vista === "alquiler" && `Pagos de alquiler · ${etiquetaPeriodo(periodo)}`}
          </h2>
          <p className="text-sm text-slate-400">
            {visibles.length} registro{visibles.length !== 1 ? "s" : ""}
            {vista === "luz" && stats.luzTotal > 0
              ? ` · total luz ${formatoMoneda(stats.luzTotal)}`
              : ""}
          </p>
        </div>

        {visibles.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No hay inquilinos. Registra el primero arriba.
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {visibles.map((i) => {
              const lec = lecturasPorInq.get(i.id);
              const pago = pagosPorInq.get(i.id);
              return (
                <li
                  key={i.id}
                  className={`px-5 py-4 transition hover:bg-white/[0.03] sm:px-6 ${
                    !i.activo ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {i.unidad && (
                          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                            {i.unidad}
                          </span>
                        )}
                        <span className="font-semibold text-slate-100">{i.nombre}</span>
                        {!i.activo && (
                          <span className="text-xs text-slate-500">Inactivo</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                        <span>Alquiler: {formatoMoneda(i.alquiler_mensual)}</span>
                        <span>
                          Medidor: {i.medidor || "—"} · ant. {formatoKwh(i.lectura_anterior)}
                        </span>
                        {i.telefono && <span>{i.telefono}</span>}
                      </div>

                      {vista === "luz" && (
                        <div className="mt-2 text-sm">
                          {lec ? (
                            <span className="text-emerald-300">
                              {formatoKwh(lec.lectura_anterior)} →{" "}
                              {formatoKwh(lec.lectura_actual)} ={" "}
                              <strong>{formatoKwh(lec.consumo)}</strong>
                              {lec.monto > 0 ? ` · ${formatoMoneda(lec.monto)}` : ""}
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              Pendiente registrar lectura de la factura
                            </span>
                          )}
                        </div>
                      )}

                      {vista === "alquiler" && (
                        <div className="mt-2 text-sm">
                          {pago?.pagado ? (
                            <span className="text-emerald-300">
                              Pagado · {formatoMoneda(pago.monto)}
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              Pendiente · {formatoMoneda(i.alquiler_mensual)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(vista === "luz" || vista === "inquilinos") && i.activo && (
                        <button
                          type="button"
                          onClick={() => abrirLectura(i)}
                          className="cursor-pointer rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
                        >
                          {lec ? "Actualizar lectura" : "Registrar factura luz"}
                        </button>
                      )}
                      {(vista === "alquiler" || vista === "inquilinos") && i.activo && (
                        <button
                          type="button"
                          onClick={() => togglePago(i)}
                          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                            pago?.pagado
                              ? "border-white/15 bg-white/[0.04] text-slate-300"
                              : "border-emerald-400/35 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                          }`}
                        >
                          {pago?.pagado ? "Marcar pendiente" : "Marcar pagado"}
                        </button>
                      )}
                      {vista === "inquilinos" && (
                        <>
                          <button
                            type="button"
                            onClick={() => abrirEditar(i)}
                            className="cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 hover:border-white/30"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarInquilino(i.id)}
                            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs ${
                              confirmandoBorrar === i.id
                                ? "border-red-400/50 bg-red-400/15 text-red-300"
                                : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-red-400/40"
                            }`}
                          >
                            {confirmandoBorrar === i.id ? "¿Confirmar?" : "Eliminar"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Modal lectura */}
      {lecturaModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <form
            onSubmit={guardarLectura}
            className="aparecer w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1020] p-6 shadow-2xl"
          >
            <h3 className="mb-1 text-lg font-bold">Lectura de luz</h3>
            <p className="mb-5 text-sm text-slate-400">
              {lecturaModal.unidad ? `${lecturaModal.unidad} · ` : ""}
              {lecturaModal.nombre}
              {lecturaModal.medidor ? ` · medidor ${lecturaModal.medidor}` : ""}
            </p>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-xs text-slate-400">Lectura anterior</div>
              <div
                className="text-xl font-bold text-slate-100 tabular-nums"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {formatoKwh(lecturaModal.lectura_anterior)}
              </div>
            </div>

            <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
              Lectura actual (de la factura)
              <input
                required
                type="number"
                min={lecturaModal.lectura_anterior}
                step="0.01"
                value={lecturaActual}
                onChange={(e) => setLecturaActual(e.target.value)}
                className={inputClase}
                placeholder={`Mayor o igual a ${lecturaModal.lectura_anterior}`}
                autoFocus
              />
            </label>

            <label className="mb-3 flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
              Precio por kWh (opcional)
              <input
                type="number"
                min={0}
                step="0.0001"
                value={precioKwh}
                onChange={(e) => setPrecioKwh(e.target.value)}
                className={inputClase}
                placeholder="Ej. 0.75"
              />
            </label>

            <label className="mb-4 flex flex-col gap-1.5 text-xs font-semibold text-slate-400">
              Nota (opcional)
              <input
                value={notaLuz}
                onChange={(e) => setNotaLuz(e.target.value)}
                className={inputClase}
              />
            </label>

            {consumoPreview !== null && (
              <div className="mb-5 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm">
                <div>
                  Consumo: <strong>{formatoKwh(consumoPreview)}</strong>
                </div>
                {montoPreview !== null && (
                  <div className="text-slate-300">
                    Monto estimado: {formatoMoneda(montoPreview)}
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Al guardar, la lectura anterior pasa a ser {lecturaActual || "—"} kWh.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLecturaModal(null)}
                className="cursor-pointer rounded-full border border-white/10 px-5 py-2 text-sm text-slate-400"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-glow" disabled={guardando}>
                <span>{guardando ? "Guardando…" : "Guardar lectura"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {aviso && (
        <div
          className={`aparecer fixed bottom-7 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full border px-6 py-3 text-center text-sm font-medium shadow-lg ${
            tipoAviso === "error"
              ? "border-red-400/50 bg-[#0b1020] text-red-300"
              : tipoAviso === "info"
                ? "border-cyan-400/50 bg-[#0b1020] text-cyan-200"
                : "border-emerald-400/50 bg-[#0b1020] text-emerald-200"
          }`}
          role="status"
        >
          {aviso}
        </div>
      )}
    </div>
  );
}
