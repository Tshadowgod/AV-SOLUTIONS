import { ESTADOS, ESTADO_ENTREGADO, ESTADO_LISTO, type Orden } from "@/lib/tipos";
import { NEGOCIO } from "@/lib/negocio";

/** Enlace que abre la página con la orden ya consultada. */
export function enlaceSeguimiento(codigo: string): string {
  const base = typeof window === "undefined" ? "" : window.location.origin;
  return `${base}/?codigo=${encodeURIComponent(codigo)}`;
}

/**
 * Mensaje listo para mandarle al cliente por WhatsApp desde el panel.
 * Cambia según en qué paso está su equipo.
 */
export function mensajeParaCliente(orden: Orden): string {
  const nombre = orden.cliente.split(" ")[0] || "";
  const saludo = `\u{1F44B} Hola ${nombre}, te escribimos de ${NEGOCIO.nombre}.`;
  const equipo = orden.equipo ? ` (${orden.equipo})` : "";
  const seguimiento = `\n\n\u{1F50E} Sigue el estado aquí: ${enlaceSeguimiento(orden.codigo)}`;

  if (orden.estado === ESTADO_LISTO) {
    return (
      `${saludo}\n\n\u{2705} Tu orden ${orden.codigo}${equipo} ya está LISTA para recoger.\n` +
      `\u{1F4CD} Te esperamos en ${NEGOCIO.direccion}.` +
      seguimiento
    );
  }

  if (orden.estado === ESTADO_ENTREGADO) {
    return (
      `${saludo}\n\n\u{1F4E6} Tu orden ${orden.codigo}${equipo} fue entregada. ` +
      `¡Gracias por confiar en nosotros!\n` +
      `Recuerda que el trabajo tiene ${NEGOCIO.garantiaDias} días de garantía.`
    );
  }

  const estado = ESTADOS[orden.estado] ?? ESTADOS[0];
  return (
    `${saludo}\n\n\u{1F527} Tu orden ${orden.codigo}${equipo} está en: ${estado.nombre}.\n` +
    `${estado.descripcion}` +
    seguimiento
  );
}
