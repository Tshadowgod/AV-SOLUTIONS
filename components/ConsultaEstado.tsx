"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ESTADOS,
  ESTADO_ENTREGADO,
  ESTADO_LISTO,
  ESTADO_MAXIMO,
  normalizarCodigo,
  type Orden,
} from "@/lib/tipos";
import { ENLACE_MAPA, NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import {
  IconoCheck,
  IconoCopiar,
  IconoLupa,
  IconoPin,
  IconoRefrescar,
  IconoWhatsApp,
} from "@/components/Iconos";

const CLAVE_MEMORIA = "av-ultimo-codigo";

type Fallo = "no-encontrada" | "servidor" | null;

/** Da formato al código mientras se escribe, sin estorbar. */
function formatearAlEscribir(valor: string): string {
  const limpio = valor.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const conPrefijo = limpio.match(/^AV-?(\d*)$/);
  if (conPrefijo) return conPrefijo[1] ? `AV-${conPrefijo[1]}` : limpio.slice(0, 2);
  return limpio;
}

/** «hace 3 horas», «ayer», «hace 5 días»… */
function haceCuanto(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";

  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (minutos < 2) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} minutos`;

  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;

  const dias = Math.round(horas / 24);
  if (dias === 1) return "ayer";
  if (dias < 30) return `hace ${dias} días`;
  return fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function ConsultaEstado() {
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState<Orden | null>(null);
  const [fallo, setFallo] = useState<Fallo>(null);
  const [ultimo, setUltimo] = useState("");
  const resultado = useRef<HTMLDivElement>(null);

  const buscar = useCallback(async (valor: string) => {
    const buscado = normalizarCodigo(valor);
    if (!buscado) return;

    setCodigo(buscado);
    setCargando(true);
    setOrden(null);
    setFallo(null);

    try {
      const res = await fetch(`/api/consulta/${encodeURIComponent(buscado)}`, {
        cache: "no-store",
      });

      if (res.ok) {
        setOrden(await res.json());
        try {
          localStorage.setItem(CLAVE_MEMORIA, buscado);
          const url = new URL(window.location.href);
          url.searchParams.set("codigo", buscado);
          window.history.replaceState(null, "", url);
        } catch {
          // Modo incógnito o almacenamiento bloqueado: no es motivo para fallar.
        }
      } else if (res.status === 404) {
        setFallo("no-encontrada");
      } else {
        setFallo("servidor");
      }
    } catch {
      setFallo("servidor");
    } finally {
      setCargando(false);
    }
  }, []);

  // Al abrir: si el enlace trae ?codigo=AV-1001 se consulta solo (así el taller
  // puede mandar el enlace listo por WhatsApp) y se recuerda la última consulta.
  useEffect(() => {
    void (async () => {
      let guardado = "";
      try {
        guardado = localStorage.getItem(CLAVE_MEMORIA) ?? "";
      } catch {
        guardado = "";
      }

      const enlace = new URLSearchParams(window.location.search).get("codigo");
      if (enlace) {
        await buscar(enlace);
        resultado.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (guardado) {
        setUltimo(guardado);
      }
    })();
  }, [buscar]);

  return (
    <section className="px-5 pb-20 pt-6" id="consulta">
      <div
        ref={resultado}
        className="beam-top mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-10"
      >
        <div className="mb-7 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Seguimiento en línea
          </span>
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">¿Ya puedo recoger mi equipo?</h2>
          <p className="text-slate-400">
            Escribe el código que aparece en tu comprobante y mira al instante en qué paso va tu
            reparación.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void buscar(codigo);
          }}
          className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
          autoComplete="off"
        >
          <div className="flex flex-1 items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.18),0_0_22px_rgba(139,92,246,0.28)]">
            <span className="ml-4 text-slate-400" aria-hidden>
              <IconoLupa />
            </span>
            <input
              id="codigo-orden"
              name="codigo"
              value={codigo}
              onChange={(e) => setCodigo(formatearAlEscribir(e.target.value))}
              type="text"
              inputMode="text"
              enterKeyHint="search"
              spellCheck={false}
              placeholder="AV-1001"
              aria-label="Código de tu orden"
              maxLength={12}
              required
              className="w-full flex-1 bg-transparent px-3 py-3.5 font-semibold tracking-wide text-slate-100 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500"
            />
          </div>
          <button type="submit" className="btn-glow" disabled={cargando}>
            <span className="w-full sm:w-auto">{cargando ? "Buscando…" : "Consultar"}</span>
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-slate-500">
          También vale escribir solo el número: <b className="text-slate-400">1001</b>
        </p>

        {ultimo && !orden && !cargando && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => void buscar(ultimo)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300"
            >
              <IconoRefrescar />
              Volver a consultar {ultimo}
            </button>
          </div>
        )}

        <div aria-live="polite" aria-busy={cargando}>
          {cargando && (
            <div className="mt-9 flex flex-col items-center gap-4 text-slate-400">
              <div className="loader-ring" />
              <p>Buscando tu equipo…</p>
            </div>
          )}

          {orden && <Resultado orden={orden} />}

          {fallo === "no-encontrada" && (
            <div className="aparecer mt-8 rounded-2xl border border-dashed border-pink-500/40 bg-pink-500/5 p-7 text-center">
              <span className="mb-2 block text-4xl" aria-hidden>
                🤔
              </span>
              <h3 className="mb-1.5 text-lg font-bold">No encontramos esa orden</h3>
              <p className="mx-auto mb-5 max-w-md text-sm text-slate-400">
                Revisa que el código esté bien escrito. Aparece en el comprobante que te dimos al
                dejar tu equipo.
              </p>
              <a
                href={enlaceWhatsApp(
                  `Hola ${NEGOCIO.nombre}, busqué mi orden con el código ${codigo} y no aparece. ¿Me ayudan?`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa !px-5 !py-2.5 text-sm"
              >
                <IconoWhatsApp className="h-4 w-4" />
                Consultar por WhatsApp
              </a>
            </div>
          )}

          {fallo === "servidor" && (
            <div className="aparecer mt-8 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-7 text-center">
              <span className="mb-2 block text-4xl" aria-hidden>
                ⚠️
              </span>
              <h3 className="mb-1.5 text-lg font-bold">Algo salió mal</h3>
              <p className="mb-5 text-sm text-slate-400">
                No pudimos consultar en este momento. Intenta de nuevo en unos segundos.
              </p>
              <button
                type="button"
                onClick={() => void buscar(codigo)}
                className="btn-plano !px-5 !py-2.5 text-sm"
              >
                <IconoRefrescar />
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ══════════ Resultado de la consulta ══════════ */

function Resultado({ orden }: { orden: Orden }) {
  const [copiado, setCopiado] = useState(false);
  const estado = ESTADOS[orden.estado] ?? ESTADOS[0];
  const esListo = orden.estado === ESTADO_LISTO;
  const esEntregado = orden.estado === ESTADO_ENTREGADO;

  const banner = esListo
    ? {
        titulo: "¡Tu equipo está listo!",
        clase: "border-emerald-400/40 bg-emerald-400/10 shadow-[inset_0_0_34px_rgba(52,211,153,0.12)]",
        color: "text-emerald-400",
      }
    : esEntregado
      ? {
          titulo: "Equipo entregado",
          clase: "border-slate-400/25 bg-slate-400/10",
          color: "text-slate-200",
        }
      : {
          titulo: `Tu equipo está: ${estado.nombre.toLowerCase()}`,
          clase: "border-amber-400/30 bg-amber-400/10",
          color: "text-amber-400",
        };

  const mensaje = orden.nota?.trim() || estado.descripcion;

  const datos: Array<[string, string]> = [
    ["Orden", orden.codigo],
    ["Cliente", orden.cliente],
    ["Equipo", orden.equipo],
    ["Servicio", orden.servicio],
    ["Recibido", orden.recibido || "—"],
  ];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(orden.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el código igual está a la vista.
    }
  }

  return (
    <div className="aparecer mt-8">
      <div className={`mb-5 flex items-start gap-4 rounded-2xl border p-5 ${banner.clase}`}>
        <span className="text-4xl leading-none" aria-hidden>
          {estado.icono}
        </span>
        <div className="min-w-0">
          <h3 className={`text-xl font-bold ${banner.color}`}>{banner.titulo}</h3>
          <p className="mt-1 text-sm text-slate-300">{mensaje}</p>
          {orden.actualizado && (
            <p className="mt-2 text-xs text-slate-500">
              Última actualización: {haceCuanto(orden.actualizado)}
            </p>
          )}
        </div>
      </div>

      <dl className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {datos.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <dt className="mb-1 text-[0.68rem] font-semibold uppercase tracking-widest text-slate-500">
              {etiqueta}
            </dt>
            <dd className="text-sm font-semibold break-words">{valor}</dd>
          </div>
        ))}
      </dl>

      <LineaTiempo estado={orden.estado} />

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {esListo && (
          <a
            href={ENLACE_MAPA}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-plano !px-5 !py-2.5 text-sm"
          >
            <IconoPin className="h-4 w-4" />
            Cómo llegar al taller
          </a>
        )}
        <a
          href={enlaceWhatsApp(
            esListo
              ? `Hola ${NEGOCIO.nombre}, mi orden ${orden.codigo} figura como lista. ¿A qué hora puedo pasar a recogerla?`
              : `Hola ${NEGOCIO.nombre}, quiero consultar por mi orden ${orden.codigo}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa !px-5 !py-2.5 text-sm"
        >
          <IconoWhatsApp className="h-4 w-4" />
          {esListo ? "Avisar que voy a pasar" : "Consultar por WhatsApp"}
        </a>
        <button type="button" onClick={() => void copiar()} className="btn-plano !px-5 !py-2.5 text-sm">
          {copiado ? <IconoCheck className="h-4 w-4" /> : <IconoCopiar />}
          {copiado ? "¡Copiado!" : "Copiar código"}
        </button>
      </div>
    </div>
  );
}

/* ══════════ Línea de tiempo ══════════ */

function LineaTiempo({ estado }: { estado: number }) {
  const avance = (estado / ESTADO_MAXIMO) * 80;

  // Los pasos que faltan van numerados, no con su emoji: un ✅ apagado en
  // «Listo para recoger» hacía creer que el equipo ya estaba terminado.
  const marca = (indice: number) => {
    if (indice < estado) return <IconoCheck className="h-4 w-4" />;
    if (indice === estado) return ESTADOS[indice].icono;
    return <span className="text-xs font-bold">{indice + 1}</span>;
  };

  return (
    <>
      {/* Pantallas anchas: recorrido horizontal */}
      <ol className="relative hidden grid-cols-5 sm:grid" aria-label="Avance de la reparación">
        <div className="absolute left-[10%] right-[10%] top-[19px] h-[3px] rounded bg-white/10" />
        <div
          className="absolute left-[10%] top-[19px] h-[3px] rounded bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.7)] transition-all duration-700"
          style={{ width: `${avance}%` }}
        />
        {ESTADOS.map((e, i) => {
          const hecho = i < estado;
          const actual = i === estado;
          return (
            <li key={e.nombre} className="relative z-10 flex flex-col items-center gap-2 text-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm transition ${
                  hecho || actual
                    ? "border-transparent bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                    : "border-white/10 bg-[#0d1322] text-slate-500"
                } ${actual ? "paso-actual" : ""}`}
              >
                {marca(i)}
              </span>
              <span
                className={`px-1 text-xs leading-tight ${
                  hecho || actual ? "font-semibold text-slate-100" : "text-slate-500"
                }`}
              >
                {e.corto}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Teléfono: recorrido vertical, con espacio para explicar cada paso */}
      <ol className="relative flex flex-col gap-4 sm:hidden" aria-label="Avance de la reparación">
        <div className="absolute bottom-5 left-[19px] top-5 w-[2px] bg-white/10" />
        <div
          className="absolute left-[19px] top-5 w-[2px] bg-gradient-to-b from-violet-500 to-cyan-400 transition-all duration-700"
          style={{ height: `calc((100% - 2.5rem) * ${estado / ESTADO_MAXIMO})` }}
        />
        {ESTADOS.map((e, i) => {
          const hecho = i < estado;
          const actual = i === estado;
          return (
            <li key={e.nombre} className="relative z-10 flex items-start gap-3.5">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                  hecho || actual
                    ? "border-transparent bg-gradient-to-br from-violet-500 to-cyan-400 text-white"
                    : "border-white/10 bg-[#0d1322] text-slate-500"
                } ${actual ? "paso-actual" : ""}`}
              >
                {marca(i)}
              </span>
              <div className="pt-1.5">
                <p
                  className={`text-sm ${
                    hecho || actual ? "font-semibold text-slate-100" : "text-slate-500"
                  }`}
                >
                  {e.nombre}
                </p>
                {actual && <p className="mt-1 text-xs text-slate-400">{e.descripcion}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
