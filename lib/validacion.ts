/** Convierte cualquier valor recibido por la API en texto limpio y acotado. */
export function texto(valor: unknown, maximo: number): string {
  if (valor == null) return "";
  return String(valor).trim().replace(/\s+/g, " ").slice(0, maximo);
}

/** Igual que `texto`, pero conserva los saltos de línea (descripciones largas). */
export function textoLargo(valor: unknown, maximo: number): string {
  if (valor == null) return "";
  return String(valor).trim().slice(0, maximo);
}

export const LARGOS = {
  codigo: 20,
  nombre: 120,
  telefono: 40,
  equipo: 160,
  servicio: 200,
  fecha: 40,
  nota: 300,
  problema: 2000,
  modelo: 120,
} as const;
