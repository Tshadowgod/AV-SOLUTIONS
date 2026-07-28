"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoAV } from "@/components/Iconos";

const ENLACES = [
  ["#consulta", "Consultar estado"],
  ["#cotizacion", "Cotización"],
  ["#servicios", "Servicios"],
  ["#proceso", "Proceso"],
  ["#contacto", "Contacto"],
] as const;

export default function Navegacion() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link
          href="#inicio"
          className="flex items-center gap-2 text-lg font-bold sm:text-xl"
          onClick={() => setAbierto(false)}
        >
          <LogoAV />
          <span>
            AV <b className="text-cyan-400">SOLUTIONS</b>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          {ENLACES.map(([href, texto]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-400 transition hover:text-slate-100"
            >
              {texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <a href="#consulta" className="btn-glow">
              <span>Mi equipo</span>
            </a>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-100 transition hover:border-cyan-400/50 hover:bg-white/10 md:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setAbierto((actual) => !actual)}
          >
            <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
            <span className="relative block h-5 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-1 h-0.5 w-5 bg-current transition ${
                  abierto ? "translate-y-1.5 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2.5 h-0.5 w-5 bg-current transition ${
                  abierto ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-5 bg-current transition ${
                  abierto ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="menu-movil"
        aria-label="Navegación móvil"
        className={`${abierto ? "grid" : "hidden"} border-t border-white/10 bg-[#090e1a] px-5 py-4 md:hidden`}
      >
        {ENLACES.map(([href, texto]) => (
          <a
            key={href}
            href={href}
            onClick={() => setAbierto(false)}
            className="border-b border-white/[0.07] px-2 py-3.5 font-medium text-slate-200 last:border-0"
          >
            {texto}
          </a>
        ))}
        <a href="#consulta" onClick={() => setAbierto(false)} className="btn-glow mt-3">
          <span className="w-full">Consultar mi equipo</span>
        </a>
      </nav>
    </header>
  );
}
