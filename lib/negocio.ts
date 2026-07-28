/* Datos del negocio en un solo lugar.
   Si cambia el teléfono, la dirección o el horario, edita SOLO este archivo
   y se actualiza en toda la página (web, WhatsApp, panel y buscadores). */

export const NEGOCIO = {
  nombre: "AV SOLUTIONS",
  rubro: "Reparación y mantenimiento de computadoras",
  eslogan: "Servicio técnico especializado en laptops y PCs",

  /** Código de país + número, sin «+» ni espacios. Se usa en los enlaces wa.me */
  whatsapp: "59165073163",
  /** Cómo se muestra el número en pantalla */
  whatsappVisible: "+591 65073163",

  direccion: "Radial 10, calle Godofredo Núñez",
  horario: "Emergencias 24/7",

  garantiaDias: 30,
  tiempoPromedio: "24 a 72 horas",
  equiposReparados: "+500",
} as const;

/** Enlace de WhatsApp hacia el negocio, con un mensaje ya escrito (opcional). */
export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Enlace de WhatsApp hacia un cliente, a partir del número que dejó escrito. */
export function enlaceWhatsAppCliente(telefono: string, mensaje?: string): string | null {
  const numero = telefono.replace(/\D/g, "");
  if (numero.length < 8) return null;
  // Números bolivianos escritos sin código de país (8 dígitos) → se antepone 591.
  const completo = numero.length === 8 ? `591${numero}` : numero;
  const base = `https://wa.me/${completo}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Enlace a Google Maps con la dirección del taller. */
export const ENLACE_MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  NEGOCIO.direccion
)}`;
