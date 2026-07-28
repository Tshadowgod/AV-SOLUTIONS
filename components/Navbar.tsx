"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import { IconoCerrar, IconoLupa, IconoMenu, IconoWhatsApp, LogoAV } from "@/components/Iconos";

const ENLACES = [
  { href: "#consulta", texto: "Consultar estado" },
  { href: "#cotizacion", texto: "Cotización" },
  { href: "#servicios", texto: "Servicios" },
  { href: "#proceso", texto: "Proceso" },
  { href: "#preguntas", texto: "Preguntas" },
  { href: "#contacto", texto: "Contacto" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState("");
  const panel = useRef<HTMLDivElement>(null);

  // Resalta en el menú la sección que se está viendo.
  useEffect(() => {
    const secciones = ENLACES.map((e) => document.querySelector(e.href)).filter(
      (s): s is Element => s !== null
    );
    if (secciones.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActivo(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, []);

  // Cerrar el menú móvil con Escape o tocando fuera.
  useEffect(() => {
    if (!abierto) return;

    const alPulsarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const alTocarFuera = (e: MouseEvent) => {
      if (!panel.current?.contains(e.target as Node)) setAbierto(false);
    };

    document.addEventListener("keydown", alPulsarTecla);
    document.addEventListener("mousedown", alTocarFuera);
    return () => {
      document.removeEventListener("keydown", alPulsarTecla);
      document.removeEventListener("mousedown", alTocarFuera);
    };
  }, [abierto]);

  return (
    <header
      ref={panel}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="#inicio"
          className="flex shrink-0 items-center gap-2 text-lg font-bold sm:text-xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
          onClick={() => setAbierto(false)}
        >
          <LogoAV className="h-8 w-8" />
          <span>
            AV <b className="text-cyan-400">SOLUTIONS</b>
          </span>
        </Link>

        <nav className="hidden lg:flex lg:gap-7" aria-label="Secciones de la página">
          {ENLACES.map(({ href, texto }) => (
            <a
              key={href}
              href={href}
              aria-current={activo === href ? "true" : undefined}
              className={`text-sm font-medium transition ${
                activo === href ? "text-cyan-400" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={enlaceWhatsApp(`Hola ${NEGOCIO.nombre}, necesito ayuda con mi computadora.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 sm:inline-flex"
          >
            <IconoWhatsApp className="h-4 w-4" />
            WhatsApp
          </a>

          <a href="#consulta" className="btn-glow hidden sm:inline-flex">
            <span className="!px-5 !py-2.5 text-sm">
              <IconoLupa className="h-4 w-4" />
              Mi equipo
            </span>
          </a>

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-white/30 lg:hidden"
          >
            {abierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
      </div>

      {abierto && (
        <div
          id="menu-movil"
          className="aparecer border-t border-white/10 bg-[#070b14]/95 px-5 pb-5 pt-3 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Secciones de la página">
            {ENLACES.map(({ href, texto }) => (
              <a
                key={href}
                href={href}
                onClick={() => setAbierto(false)}
                className={`rounded-xl px-3 py-3 text-base font-medium transition ${
                  activo === href
                    ? "bg-white/[0.06] text-cyan-400"
                    : "text-slate-300 hover:bg-white/[0.04] hover:text-slate-100"
                }`}
              >
                {texto}
              </a>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="#consulta"
              onClick={() => setAbierto(false)}
              className="btn-plano !px-4 !py-2.5 text-sm"
            >
              <IconoLupa className="h-4 w-4" />
              Mi equipo
            </a>
            <a
              href={enlaceWhatsApp(`Hola ${NEGOCIO.nombre}, necesito ayuda con mi computadora.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wa !px-4 !py-2.5 text-sm"
            >
              <IconoWhatsApp className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
