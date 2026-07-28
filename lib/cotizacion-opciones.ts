/** Marcas preestablecidas para el formulario de cotización */

export const MARCAS_COMUNES = [
  { id: "hp", etiqueta: "HP" },
  { id: "lenovo", etiqueta: "Lenovo" },
  { id: "dell", etiqueta: "Dell" },
  { id: "asus", etiqueta: "ASUS" },
  { id: "acer", etiqueta: "Acer" },
  { id: "mac", etiqueta: "Mac / Apple" },
  { id: "samsung", etiqueta: "Samsung" },
  { id: "toshiba", etiqueta: "Toshiba" },
  { id: "msi", etiqueta: "MSI" },
  { id: "huawei", etiqueta: "Huawei" },
  { id: "pc-armada", etiqueta: "PC armada / genérica" },
] as const;

export const SERVICIOS_COMUNES = [
  {
    id: "mantenimiento",
    etiqueta: "Mantenimiento preventivo",
    detalle: "Limpieza interna, pasta térmica y optimización general",
  },
  {
    id: "lento",
    etiqueta: "Va lento",
    detalle: "Optimización de rendimiento y revisión del sistema",
  },
  {
    id: "no-enciende",
    etiqueta: "No enciende",
    detalle: "Diagnóstico de encendido y revisión de hardware",
  },
  {
    id: "pantalla",
    etiqueta: "Pantalla dañada",
    detalle: "Cambio o reparación de pantalla",
  },
  {
    id: "teclado",
    etiqueta: "Teclado o touchpad",
    detalle: "Reparación o cambio de teclado / touchpad",
  },
  {
    id: "bateria",
    etiqueta: "Batería",
    detalle: "No carga, no dura o reemplazo de batería",
  },
  {
    id: "calor",
    etiqueta: "Sobrecalentamiento",
    detalle: "Limpieza de ventiladores y revisión térmica",
  },
  {
    id: "formateo",
    etiqueta: "Formateo / Windows",
    detalle: "Instalación de sistema operativo y programas básicos",
  },
  {
    id: "virus",
    etiqueta: "Virus o malware",
    detalle: "Eliminación de virus y limpieza de software",
  },
  {
    id: "ssd",
    etiqueta: "Upgrade a SSD",
    detalle: "Cambio de disco duro a SSD para más velocidad",
  },
  {
    id: "ram",
    etiqueta: "Ampliar RAM",
    detalle: "Instalación o ampliación de memoria RAM",
  },
  {
    id: "componente",
    etiqueta: "Reparar componente",
    detalle: "Fuente, placa madre, tarjeta u otro componente",
  },
] as const;

export const ID_MODELO_OTRO = "otro";
export const ID_MODELO_NO_SE = "no-se";
export const ID_SERVICIO_OTRO = "otro";

export function textoModeloFinal(seleccion: string, otro: string): { modelo: string; sabe_modelo: boolean } {
  if (seleccion === ID_MODELO_NO_SE) {
    return { modelo: "", sabe_modelo: false };
  }
  if (seleccion === ID_MODELO_OTRO) {
    return { modelo: otro.trim(), sabe_modelo: true };
  }
  const preset = MARCAS_COMUNES.find((m) => m.id === seleccion);
  return { modelo: preset?.etiqueta ?? otro.trim(), sabe_modelo: true };
}

export function textoServicioFinal(selecciones: string[], otro: string, detalleExtra: string): string {
  const partes: string[] = [];

  for (const id of selecciones) {
    if (id === ID_SERVICIO_OTRO) {
      const texto = otro.trim();
      if (texto) partes.push(texto);
      continue;
    }
    const preset = SERVICIOS_COMUNES.find((s) => s.id === id);
    if (preset) partes.push(preset.etiqueta);
  }

  let base = partes.join(" · ");
  const extra = detalleExtra.trim();
  if (extra) {
    base = base ? `${base}. Detalle: ${extra}` : extra;
  }
  return base;
}
