import Link from "next/link";
import Navbar from "@/components/Navbar";
import ConsultaEstado from "@/components/ConsultaEstado";
import Cotizacion from "@/components/Cotizacion";
import Faq from "@/components/Faq";
import BotonWhatsApp from "@/components/BotonWhatsApp";
import { ENLACE_MAPA, NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import {
  IconoCandado,
  IconoChip,
  IconoCheck,
  IconoDocumento,
  IconoEscudo,
  IconoLlave,
  IconoLupa,
  IconoMonitor,
  IconoPin,
  IconoRayo,
  IconoReloj,
  IconoWhatsApp,
  LogoAV,
} from "@/components/Iconos";

const SERVICIOS = [
  {
    icono: <IconoLlave />,
    titulo: "Mantenimiento preventivo",
    detalle: "Para que tu equipo deje de calentar y vuelva a rendir como el primer día.",
    incluye: ["Limpieza interna profunda", "Cambio de pasta térmica", "Optimización del sistema"],
  },
  {
    icono: <IconoChip />,
    titulo: "Reparación de hardware",
    detalle: "Diagnosticamos la pieza que falla y la cambiamos sin cambiarte todo el equipo.",
    incluye: ["Pantallas y teclados", "Baterías y fuentes de poder", "Discos y memoria RAM"],
  },
  {
    icono: <IconoMonitor />,
    titulo: "Formateo y software",
    detalle: "Tu computadora limpia, rápida y con todo lo que necesitas ya instalado.",
    incluye: ["Sistema operativo al día", "Programas esenciales", "Eliminación de virus"],
  },
  {
    icono: <IconoRayo />,
    titulo: "Mejoras y upgrades",
    detalle: "Antes de comprar una nueva, dale una segunda vida a la que ya tienes.",
    incluye: ["Cambio de disco duro a SSD", "Ampliación de memoria RAM", "Prueba de rendimiento"],
  },
];

const PASOS = [
  {
    titulo: "Recibido",
    detalle: "Registramos tu equipo y te entregamos tu código de orden.",
  },
  {
    titulo: "Diagnóstico",
    detalle: "Detectamos la falla y te confirmamos el costo antes de reparar.",
  },
  {
    titulo: "Reparación",
    detalle: "Manos a la obra: reparamos y probamos todo a fondo.",
  },
  {
    titulo: "Listo para recoger",
    detalle: "Consulta tu código aquí y pasa por tu equipo cuando quieras.",
  },
];

const GARANTIAS = [
  { icono: <IconoDocumento className="h-4 w-4" />, texto: "Cotización gratis" },
  { icono: <IconoCheck className="h-4 w-4" />, texto: "Te confirmamos el precio antes de reparar" },
  { icono: <IconoEscudo className="h-4 w-4" />, texto: `Garantía de ${NEGOCIO.garantiaDias} días` },
];

const CONTACTOS = [
  {
    icono: <IconoWhatsApp />,
    titulo: "WhatsApp",
    detalle: NEGOCIO.whatsappVisible,
    pie: "La forma más rápida de llegar a nosotros",
    href: enlaceWhatsApp(`Hola ${NEGOCIO.nombre}, quiero hacer una consulta.`),
  },
  {
    icono: <IconoPin />,
    titulo: "Taller",
    detalle: NEGOCIO.direccion,
    pie: "Ver cómo llegar en el mapa",
    href: ENLACE_MAPA,
  },
  {
    icono: <IconoReloj />,
    titulo: "Horario",
    detalle: NEGOCIO.horario,
    pie: "Escríbenos a cualquier hora",
  },
];

export default function Inicio() {
  return (
    <>
      <Navbar />

      <main id="contenido">
        {/* ══════════ HERO ══════════ */}
        <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center sm:pt-24" id="inicio">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-slate-400 backdrop-blur">
            <span className="pulse-dot" aria-hidden />
            {NEGOCIO.eslogan}
          </div>

          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl">
            Reparamos tu computadora.
            <br />
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Tú sigues su estado en línea.
            </span>
          </h1>

          <p className="mx-auto mb-8 mt-6 max-w-2xl text-lg text-slate-400">
            Mantenimiento, reparación y optimización de laptops y PCs de escritorio. Ingresa tu
            código de orden y descubre al instante si tu equipo ya está{" "}
            <b className="text-slate-100">listo para recoger</b>.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <a href="#consulta" className="btn-glow">
              <span className="w-full text-base">
                <IconoLupa className="h-5 w-5" />
                Consultar mi equipo
              </span>
            </a>
            <a href="#cotizacion" className="btn-plano">
              <IconoDocumento className="h-5 w-5" />
              Pedir cotización
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-sm text-slate-400">
            {GARANTIAS.map((g) => (
              <li key={g.texto} className="flex items-center gap-2">
                <span className="text-cyan-400" aria-hidden>
                  {g.icono}
                </span>
                {g.texto}
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[
              [NEGOCIO.equiposReparados, "Equipos reparados"],
              ["24-72h", "Tiempo promedio"],
              [`${NEGOCIO.garantiaDias} días`, "Garantía"],
            ].map(([num, etiqueta]) => (
              <div key={etiqueta} className="text-center">
                <span
                  className="block bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {num}
                </span>
                <span className="text-xs text-slate-400 sm:text-sm">{etiqueta}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ CONSULTA ══════════ */}
        <ConsultaEstado />

        {/* ══════════ COTIZACIÓN ══════════ */}
        <Cotizacion />

        {/* ══════════ SERVICIOS ══════════ */}
        <section className="mx-auto max-w-6xl px-6 py-16" id="servicios">
          <Encabezado
            etiqueta="Servicios"
            titulo="Lo que hacemos por tu equipo"
            bajada="Trabajamos con laptops y PCs de escritorio de cualquier marca."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map((s) => (
              <article
                key={s.titulo}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-violet-500/45 hover:shadow-[0_18px_44px_rgba(0,0,0,0.4),0_0_30px_rgba(139,92,246,0.12)]"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 text-cyan-400 transition group-hover:scale-110 group-hover:text-violet-300">
                  {s.icono}
                </div>
                <h3 className="mb-2 text-lg font-bold">{s.titulo}</h3>
                <p className="mb-4 text-sm text-slate-400">{s.detalle}</p>
                <ul className="mt-auto flex flex-col gap-1.5 border-t border-white/10 pt-4">
                  {s.incluye.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <IconoCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ══════════ PROCESO ══════════ */}
        <section className="mx-auto max-w-6xl px-6 py-16" id="proceso">
          <Encabezado
            etiqueta="Proceso"
            titulo="Así viaja tu equipo con nosotros"
            bajada="Cuatro pasos que puedes seguir desde tu teléfono, sin llamar a preguntar."
          />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p, i) => (
              <li
                key={p.titulo}
                className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
              >
                <span
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white shadow-[0_6px_18px_rgba(139,92,246,0.35)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {i + 1}
                </span>
                <h3 className="mb-1.5 font-bold">{p.titulo}</h3>
                <p className="text-sm text-slate-400">{p.detalle}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ══════════ PREGUNTAS FRECUENTES ══════════ */}
        <section className="mx-auto max-w-6xl px-6 py-16" id="preguntas">
          <Encabezado
            etiqueta="Preguntas frecuentes"
            titulo="Lo que más nos preguntan"
            bajada="Las dudas que aparecen siempre antes de dejar un equipo en el taller."
          />
          <Faq />
        </section>

        {/* ══════════ CONTACTO ══════════ */}
        <section className="mx-auto max-w-6xl px-6 py-16" id="contacto">
          <Encabezado etiqueta="Contacto" titulo="¿Dudas? Hablemos" />
          <div className="grid gap-5 sm:grid-cols-3">
            {CONTACTOS.map((c) => {
              const contenido = (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 text-cyan-400">
                    {c.icono}
                  </div>
                  <h3 className="mb-1.5 font-bold">{c.titulo}</h3>
                  <p className="text-slate-300">{c.detalle}</p>
                  <p className="mt-2 text-xs text-slate-500">{c.pie}</p>
                </>
              );
              const clases =
                "block rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-violet-500/45";
              return c.href ? (
                <a
                  key={c.titulo}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clases}
                >
                  {contenido}
                </a>
              ) : (
                <div key={c.titulo} className={clases}>
                  {contenido}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="mt-auto border-t border-white/10 bg-[#070b14]/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-3">
          <div>
            <div
              className="mb-3 flex items-center gap-2 text-lg font-bold"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <LogoAV className="h-8 w-8" />
              <span>
                AV <b className="text-cyan-400">SOLUTIONS</b>
              </span>
            </div>
            <p className="text-sm text-slate-400">{NEGOCIO.rubro}.</p>
            <a
              href={enlaceWhatsApp(`Hola ${NEGOCIO.nombre}, quiero hacer una consulta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa mt-5 !px-4 !py-2 text-sm"
            >
              <IconoWhatsApp className="h-4 w-4" />
              {NEGOCIO.whatsappVisible}
            </a>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Secciones
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-slate-400">
              {[
                ["#consulta", "Consultar estado"],
                ["#cotizacion", "Pedir cotización"],
                ["#servicios", "Servicios"],
                ["#proceso", "Cómo trabajamos"],
                ["#preguntas", "Preguntas frecuentes"],
              ].map(([href, texto]) => (
                <li key={href}>
                  <a href={href} className="transition hover:text-cyan-400">
                    {texto}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Taller
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <IconoPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                <a href={ENLACE_MAPA} target="_blank" rel="noopener noreferrer" className="transition hover:text-cyan-400">
                  {NEGOCIO.direccion}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <IconoReloj className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                {NEGOCIO.horario}
              </li>
              <li className="flex items-start gap-2">
                <IconoEscudo className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                Garantía de {NEGOCIO.garantiaDias} días
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">
          <p className="flex flex-wrap items-center justify-center gap-1.5">
            © {new Date().getFullYear()} {NEGOCIO.nombre} · {NEGOCIO.rubro} ·
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 opacity-70 transition hover:text-cyan-400 hover:opacity-100"
              title="Acceso administrador"
            >
              <IconoCandado className="h-3.5 w-3.5" /> Admin
            </Link>
          </p>
        </div>
      </footer>

      <BotonWhatsApp />
    </>
  );
}

function Encabezado({
  etiqueta,
  titulo,
  bajada,
}: {
  etiqueta: string;
  titulo: string;
  bajada?: string;
}) {
  return (
    <div className="mb-10 text-center">
      <span className="mb-4 inline-block rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
        {etiqueta}
      </span>
      <h2 className="text-3xl font-bold sm:text-4xl">{titulo}</h2>
      {bajada && <p className="mx-auto mt-3 max-w-2xl text-slate-400">{bajada}</p>}
    </div>
  );
}
