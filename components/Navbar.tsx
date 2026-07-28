"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ENLACES_NAV } from "@/lib/negocio";
import { IconoMenu, IconoX, LogoAV } from "@/components/Iconos";

const SECCIONES = ["#inicio", ...ENLACES_NAV.map(([href]) => href)];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("#inicio");

  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("hashchange", cerrar);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("hashchange", cerrar);
    };
  }, [abierto]);

  useEffect(() => {
    const ids = SECCIONES.map((s) => s.slice(1));
    const elementos = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elementos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibles[0]) {
          setSeccionActiva(`#${visibles[0].target.id}`);
        }
      },
      { rootMargin: "-18% 0px -55% 0px", threshold: [0, 0.15, 0.4] }
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function claseEnlace(href: string, movil = false) {
    const activo = seccionActiva === href;
    if (movil) {
      return `rounded-xl px-4 py-3 text-sm font-medium transition ${
        activo
          ? "bg-violet-500/15 text-cyan-400"
          : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
      }`;
    }
    return `relative text-sm font-medium transition ${
      activo ? "text-cyan-400" : "text-slate-400 hover:text-slate-100"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl transition-shadow duration-300">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-16">
        <Link
          href="#inicio"
          className="flex items-center gap-2 text-xl font-bold"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
          onClick={() => setAbierto(false)}
        >
          <LogoAV />
          <span>
            AV <b className="text-cyan-400">SOLUTIONS</b>
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex" aria-label="Navegación principal">
          {ENLACES_NAV.map(([href, texto]) => (
            <a key={href} href={href} className={claseEnlace(href)}>
              {texto}
              {seccionActiva === href && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a href="#consulta" className="btn-glow hidden sm:inline-flex">
            <span>Mi equipo</span>
          </a>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/25 hover:text-slate-100 md:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          >
            {abierto ? <IconoX /> : <IconoMenu />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="menu-movil"
        className={`overflow-hidden border-t border-white/10 bg-[#070b14]/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          abierto ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!abierto}
      >
        <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Navegación móvil">
          {ENLACES_NAV.map(([href, texto]) => (
            <a
              key={href}
              href={href}
              onClick={() => setAbierto(false)}
              className={claseEnlace(href, true)}
            >
              {texto}
            </a>
          ))}
          <a
            href="#consulta"
            onClick={() => setAbierto(false)}
            className="btn-glow mt-2 w-full sm:hidden"
          >
            <span className="w-full justify-center">Consultar mi equipo</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
