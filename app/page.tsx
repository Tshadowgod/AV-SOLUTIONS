import Image from "next/image";
import Link from "next/link";
import ConsultaEstado from "@/components/ConsultaEstado";
import Cotizacion from "@/components/Cotizacion";
import Nav from "@/components/Nav";
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
  LogoAV,
} from "@/components/Iconos";
import heroTaller from "@/public/hero-taller.jpg";

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
  { titulo: "Diagnóstico", detalle: "Detectamos la falla y te confirmamos el costo antes de reparar." },
  { titulo: "Reparación", detalle: "Manos a la obra: reparamos y probamos todo a fondo." },
  { titulo: "Listo para recoger", detalle: "Consulta tu código aquí y pasa por tu equipo cuando quieras." },
];

export default function Inicio() {
  return (
    <>
      <Nav />

      {/* ══════════ HERO — full-bleed taller ══════════ */}
      <section
        className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 sm:items-center sm:pb-0 sm:pt-20"
        id="inicio"
      >
        <Image
          src={heroTaller}
          alt="Laptop abierta en el taller técnico de AV SOLUTIONS"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0c1222]/92 via-[#0c1222]/72 to-[#0c1222]/25"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0c1222]/55 via-transparent to-[#0c1222]/35"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
          <p
            className="anim-revelar mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            AV <span className="text-teal-300">SOLUTIONS</span>
          </p>
          <h1 className="anim-revelar anim-delay-1 max-w-xl text-2xl font-semibold leading-snug text-white/95 sm:text-3xl lg:text-4xl">
            Reparamos tu computadora en Santa Cruz.
          </h1>
          <p className="anim-revelar anim-delay-2 mt-4 max-w-lg text-base text-white/75 sm:text-lg">
            Cotiza por WhatsApp y sigue el estado de tu equipo en línea con tu código de orden.
          </p>
          <div className="anim-revelar anim-delay-3 mt-8 flex flex-wrap gap-3">
            <a href="#cotizacion" className="btn-taller">
              <IconoDocumento className="h-5 w-5" />
              Cotizar ahora
            </a>
            <a href="#consulta" className="btn-ghost">
              <IconoLupa />
              Consultar mi equipo
            </a>
          </div>
        </div>
      </section>

      {/* Confianza — fuera del primer viewport */}
      <section className="border-b border-[var(--line)] bg-[var(--surface)]" aria-label="Datos del taller">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[var(--line)] px-5 py-7 sm:px-8">
          {[
            ["+500", "Equipos reparados"],
            ["24–72 h", "Tiempo promedio"],
            ["30 días", "Garantía"],
          ].map(([num, etiqueta]) => (
            <div key={etiqueta} className="px-2 text-center sm:px-6">
              <span
                className="block text-xl font-bold text-[var(--accent)] sm:text-3xl"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {num}
              </span>
              <span className="text-xs text-[var(--muted)] sm:text-sm">{etiqueta}</span>
            </div>
          ))}
        </div>
      </section>

      <ConsultaEstado />
      <Cotizacion />

      {/* ══════════ SERVICIOS ══════════ */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" id="servicios">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Servicios
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que hacemos por tu equipo
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            Del mantenimiento rápido a la reparación profunda: trabajamos laptops y PCs de escritorio.
          </p>
        </div>
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {SERVICIOS.map((s, i) => (
            <article key={s.titulo} className="group flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--accent)]/10 text-[var(--accent)] transition group-hover:bg-[var(--accent)] group-hover:text-white">
                {s.icono}
              </div>
              <div>
                <h3 className="mb-1.5 text-lg font-bold">
                  <span className="mr-2 text-sm font-semibold text-[var(--accent)]" style={{ fontFamily: "var(--font-syne)" }}>
                    0{i + 1}
                  </span>
                  {s.titulo}
                </h3>
                <p className="text-[var(--muted)] leading-relaxed">{s.detalle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════ PROCESO ══════════ */}
      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-20" id="proceso">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              Proceso
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Así viaja tu equipo con nosotros
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              Transparencia de punta a punta: siempre sabes en qué paso está tu máquina.
            </p>
          </div>
          <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div
              className="anim-barra pointer-events-none absolute left-0 right-0 top-5 hidden h-0.5 bg-[var(--line)] lg:block"
              aria-hidden="true"
            />
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="relative">
                <span
                  className="relative z-10 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ink)] text-sm font-bold text-white"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {i + 1}
                </span>
                <h3 className="mb-1.5 font-bold">{p.titulo}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{p.detalle}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ CONTACTO ══════════ */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8" id="contacto">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Contacto
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Dudas? Hablemos</h2>
          <p className="mt-3 text-[var(--muted)]">
            Estamos en Radial 10. Escríbenos por WhatsApp o pásate al taller.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <a
            href="https://wa.me/59165073163"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-3 border-t-2 border-[var(--accent)] pt-5 transition hover:opacity-90"
          >
            <span className="text-[var(--accent)]"><IconoChat /></span>
            <h3 className="font-bold">WhatsApp</h3>
            <p className="text-[var(--muted)] group-hover:text-[var(--accent)]">+591 65073163</p>
          </a>
          <div className="flex flex-col gap-3 border-t-2 border-[var(--line)] pt-5">
            <span className="text-[var(--accent)]"><IconoPin /></span>
            <h3 className="font-bold">Taller</h3>
            <p className="text-[var(--muted)]">Radial 10, calle Godofredo Núñez</p>
          </div>
          <div className="flex flex-col gap-3 border-t-2 border-[var(--line)] pt-5">
            <span className="text-[var(--accent)]"><IconoReloj /></span>
            <h3 className="font-bold">Horario</h3>
            <p className="text-[var(--muted)]">Emergencias 24/7</p>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="mt-auto border-t border-[var(--line)] bg-[var(--ink)] py-10 text-center text-sm text-white/60">
        <div className="mb-3 flex items-center justify-center gap-2 text-white">
          <LogoAV className="h-7 w-7" />
          <span className="font-bold" style={{ fontFamily: "var(--font-syne)" }}>
            AV <span className="text-teal-300">SOLUTIONS</span>
          </span>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-1.5 px-4">
          © 2026 · Reparación y mantenimiento de computadoras · Santa Cruz
          <span className="mx-1 hidden sm:inline">·</span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 opacity-70 transition hover:text-teal-300 hover:opacity-100"
            title="Acceso administrador"
          >
            <IconoCandado className="h-3.5 w-3.5" /> Admin
          </Link>
        </p>
      </footer>
    </>
  );
}
