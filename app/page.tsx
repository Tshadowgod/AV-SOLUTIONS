import Link from "next/link";
import ConsultaEstado from "@/components/ConsultaEstado";
import Cotizacion from "@/components/Cotizacion";
import Navegacion from "@/components/Navegacion";
import { NEGOCIO, crearEnlaceWhatsApp } from "@/lib/config";
import {
  IconoLlave,
  IconoChip,
  IconoMonitor,
  IconoRayo,
  IconoLupa,
  IconoChat,
  IconoPin,
  IconoReloj,
  IconoCandado,
  IconoDocumento,
} from "@/components/Iconos";

const SERVICIOS = [
  {
    icono: <IconoLlave />,
    titulo: "Mantenimiento preventivo",
    detalle:
      "Limpieza interna profunda, cambio de pasta térmica y optimización para que tu equipo rinda como nuevo.",
  },
  {
    icono: <IconoChip />,
    titulo: "Reparación de hardware",
    detalle:
      "Diagnóstico y cambio de pantallas, teclados, baterías, discos, memoria RAM y fuentes de poder.",
  },
  {
    icono: <IconoMonitor />,
    titulo: "Formateo y software",
    detalle:
      "Instalación de sistema operativo, programas esenciales, eliminación de virus y respaldo de tu información.",
  },
  {
    icono: <IconoRayo />,
    titulo: "Mejoras y upgrades",
    detalle:
      "Pasa de disco duro a SSD, amplía tu RAM y dale una segunda vida a tu computadora.",
  },
];

const PASOS = [
  { titulo: "Recibido", detalle: "Registramos tu equipo y te entregamos tu código de orden." },
  { titulo: "En diagnóstico", detalle: "Detectamos la falla y te confirmamos el costo antes de reparar." },
  { titulo: "En reparación", detalle: "Reparamos tu equipo y comprobamos que todo funcione correctamente." },
  { titulo: "Listo para recoger", detalle: "Te indicamos en línea cuándo puedes pasar por tu equipo." },
  { titulo: "Entregado", detalle: "Retiras tu equipo y recibes la garantía correspondiente." },
];

export default function Inicio() {
  return (
    <>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Navegacion />

      <main id="contenido">
      {/* ══════════ HERO ══════════ */}
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-16 text-center sm:pt-24" id="inicio">
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-slate-400 backdrop-blur">
          <span className="pulse-dot" />
          Servicio técnico especializado
        </div>
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-6xl">
          Reparamos tu computadora.
          <br />
          <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            Tú sigues su estado en línea.
          </span>
        </h1>
        <p className="mx-auto mb-9 mt-6 max-w-2xl text-lg text-slate-400">
          Mantenimiento, reparación y optimización de laptops y PCs de escritorio.
          Ingresa tu código de orden y descubre al instante si tu equipo ya está{" "}
          <b className="text-slate-100">listo para recoger</b>.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <a href="#consulta" className="btn-glow">
            <span className="px-2 py-1 text-base">
              <IconoLupa />
              Consultar mi equipo
            </span>
          </a>
          <a
            href="#cotizacion"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3 font-semibold text-slate-300 transition hover:border-white/30 hover:bg-white/5 hover:text-slate-100"
          >
            <IconoDocumento className="h-5 w-5" />
            Cotización gratuita
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-11">
          {[
            ["+500", "Equipos reparados"],
            ["24-72h", "Tiempo promedio"],
            ["30 días", "Garantía"],
          ].map(([num, etiqueta]) => (
            <div key={etiqueta} className="text-center">
              <span
                className="block bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {num}
              </span>
              <span className="text-sm text-slate-400">{etiqueta}</span>
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
        <div className="mb-11 text-center">
          <span className="mb-4 inline-block rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Servicios
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">Lo que hacemos por tu equipo</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((s) => (
            <article
              key={s.titulo}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-violet-500/45 hover:shadow-[0_18px_44px_rgba(0,0,0,0.4),0_0_30px_rgba(139,92,246,0.12)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 text-cyan-400 transition group-hover:scale-110 group-hover:text-violet-300">
                {s.icono}
              </div>
              <h3 className="mb-2 text-lg font-bold">{s.titulo}</h3>
              <p className="text-sm text-slate-400">{s.detalle}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════ PROCESO ══════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="proceso">
        <div className="mb-11 text-center">
          <span className="mb-4 inline-block rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Proceso
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">Así viaja tu equipo con nosotros</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {PASOS.map((p, i) => (
            <div
              key={p.titulo}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <span
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white shadow-[0_6px_18px_rgba(139,92,246,0.35)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {i + 1}
              </span>
              <h3 className="mb-1.5 font-bold">{p.titulo}</h3>
              <p className="text-sm text-slate-400">{p.detalle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ CONTACTO ══════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16" id="contacto">
        <div className="mb-11 text-center">
          <span className="mb-4 inline-block rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Contacto
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl">¿Dudas? Hablemos</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icono: <IconoChat />,
              titulo: "WhatsApp",
              detalle: NEGOCIO.telefonoVisible,
              apoyo: "Escríbenos para coordinar",
              href: crearEnlaceWhatsApp("Hola AV SOLUTIONS, necesito información sobre sus servicios."),
            },
            {
              icono: <IconoPin />,
              titulo: "Cómo llegar",
              detalle: NEGOCIO.direccion,
              apoyo: "Abrir ubicación en Google Maps",
              href: NEGOCIO.mapsUrl,
            },
            {
              icono: <IconoReloj />,
              titulo: "Atención",
              detalle: "Emergencias 24/7",
              apoyo: "Coordina la entrega o el recojo por WhatsApp",
              href: crearEnlaceWhatsApp("Hola AV SOLUTIONS, quisiera coordinar una visita al taller."),
            },
          ].map((c) => {
            const contenido = (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 text-cyan-400">
                  {c.icono}
                </div>
                <h3 className="mb-1.5 font-bold">{c.titulo}</h3>
                <p className="text-slate-400">{c.detalle}</p>
                <p className="mt-3 text-sm font-semibold text-cyan-400">{c.apoyo} →</p>
              </>
            );
            const clases =
              "block rounded-2xl border border-white/10 bg-white/[0.04] p-7 text-center backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-violet-500/45";
            return (
              <a key={c.titulo} href={c.href} target="_blank" rel="noopener noreferrer" className={clases}>
                {contenido}
              </a>
            );
          })}
        </div>
      </section>
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="mt-auto border-t border-white/10 py-8 text-center text-sm text-slate-400">
        <p className="flex flex-wrap items-center justify-center gap-1.5">
          © 2026 AV SOLUTIONS · Reparación y mantenimiento de computadoras ·
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 opacity-70 transition hover:text-cyan-400 hover:opacity-100"
            title="Acceso administrador"
          >
            <IconoCandado className="w-3.5 h-3.5" /> Admin
          </Link>
        </p>
      </footer>
    </>
  );
}
