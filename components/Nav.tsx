"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoAV } from "@/components/Iconos";

const LINKS = [
  ["#consulta", "Consultar estado"],
  ["#cotizacion", "Cotización"],
  ["#servicios", "Servicios"],
  ["#proceso", "Proceso"],
  ["#contacto", "Contacto"],
] as const;

export default function Nav() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="#inicio"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-syne)" }}
          onClick={() => setAbierto(false)}
        >
          <LogoAV className="h-9 w-9" />
          <span>
            AV <span className="text-teal-300">SOLUTIONS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map(([href, texto]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-white/70 transition hover:text-white"
            >
              {texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#consulta" className="btn-taller hidden !py-2.5 !px-4 text-sm sm:inline-flex">
            Mi equipo
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 bg-white/10 text-white md:hidden"
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {abierto && (
        <nav className="border-t border-white/10 bg-[#0c1222]/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map(([href, texto]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block rounded-md px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
                  onClick={() => setAbierto(false)}
                >
                  {texto}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#consulta" className="btn-taller w-full" onClick={() => setAbierto(false)}>
                Mi equipo
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
