export interface Orden {
  codigo: string;
  cliente: string;
  telefono: string;
  equipo: string;
  servicio: string;
  recibido: string;
  estado: number;
  nota: string;
  /** Última vez que el taller tocó la orden (ISO). Lo pone el servidor. */
  actualizado?: string;
}

export type TonoEstado = "espera" | "trabajo" | "listo" | "cerrado";

export interface Estado {
  /** Nombre completo, para títulos y menús */
  nombre: string;
  /** Versión corta, para la línea de tiempo en pantallas angostas */
  corto: string;
  /** Emoji: se ve bien dentro de los <select> del panel */
  icono: string;
  /** Qué significa este estado, explicado para el cliente */
  descripcion: string;
  tono: TonoEstado;
}

export const ESTADOS: readonly Estado[] = [
  {
    nombre: "Recibido",
    corto: "Recibido",
    icono: "📥",
    descripcion: "Tu equipo llegó al taller y quedó registrado con su código de orden.",
    tono: "espera",
  },
  {
    nombre: "En diagnóstico",
    corto: "Diagnóstico",
    icono: "🔎",
    descripcion: "Estamos revisando tu equipo para saber exactamente qué falla tiene.",
    tono: "trabajo",
  },
  {
    nombre: "En reparación",
    corto: "Reparación",
    icono: "🔧",
    descripcion: "Ya sabemos qué pasa y nuestro técnico está trabajando en tu equipo.",
    tono: "trabajo",
  },
  {
    nombre: "Listo para recoger",
    corto: "Listo",
    icono: "✅",
    descripcion: "Terminamos la reparación y probamos todo. Puedes pasar a recogerlo.",
    tono: "listo",
  },
  {
    nombre: "Entregado",
    corto: "Entregado",
    icono: "📦",
    descripcion: "Tu equipo ya fue entregado. ¡Gracias por confiar en nosotros!",
    tono: "cerrado",
  },
];

export const ESTADO_RECIBIDO = 0;
export const ESTADO_LISTO = 3;
export const ESTADO_ENTREGADO = 4;
export const ESTADO_MAXIMO = ESTADOS.length - 1;

/** Deja un número de estado siempre dentro del rango válido. */
export function estadoValido(valor: unknown): number {
  const n = Math.trunc(Number(valor));
  if (!Number.isFinite(n)) return ESTADO_RECIBIDO;
  return Math.min(ESTADO_MAXIMO, Math.max(0, n));
}

export const PREFIJO_ORDEN = "AV-";

/**
 * Convierte lo que sea que escriba el cliente en un código con formato:
 * «1001», «av1001», «av 1001» → «AV-1001».
 */
export function normalizarCodigo(valor: string): string {
  const limpio = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!limpio) return "";
  if (/^\d+$/.test(limpio)) return `${PREFIJO_ORDEN}${limpio}`;
  const conPrefijo = limpio.match(/^AV(\d+)$/);
  if (conPrefijo) return `${PREFIJO_ORDEN}${conPrefijo[1]}`;
  return limpio;
}

export interface Cotizacion {
  id: number;
  tipo: string;
  modelo: string;
  sabe_modelo: boolean;
  problema: string;
  nombre: string;
  whatsapp: string;
  atendida: boolean;
  creado: string;
}

export const TIPOS_EQUIPO = ["Laptop", "PC de escritorio"] as const;
export type TipoEquipo = (typeof TIPOS_EQUIPO)[number];

export function esTipoEquipo(valor: unknown): valor is TipoEquipo {
  return TIPOS_EQUIPO.includes(valor as TipoEquipo);
}
