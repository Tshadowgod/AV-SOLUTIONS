"use client";

import { useEffect, useState } from "react";
import { NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import { IconoWhatsApp } from "@/components/Iconos";

const MENSAJE = `Hola ${NEGOCIO.nombre}, quiero consultar por la reparación de mi computadora.`;

/** Botón flotante de WhatsApp: aparece cuando el visitante deja atrás el inicio. */
export default function BotonWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const inicio = document.getElementById("inicio");
    if (!inicio) return;

    const observador = new IntersectionObserver(
      ([entrada]) => setVisible(!entrada.isIntersecting),
      { threshold: 0 }
    );
    observador.observe(inicio);
    return () => observador.disconnect();
  }, []);

  return (
    <a
      href={enlaceWhatsApp(MENSAJE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribirnos por WhatsApp al ${NEGOCIO.whatsappVisible}`}
      className={`fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-[#25d366] px-4 py-3.5 font-bold text-[#04361a] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:bg-[#1ebe5a] sm:px-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <IconoWhatsApp className="h-6 w-6" />
      <span className="hidden text-sm sm:inline">Escríbenos</span>
    </a>
  );
}
