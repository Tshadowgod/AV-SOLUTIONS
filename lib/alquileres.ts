export interface Inquilino {
  id: number;
  nombre: string;
  unidad: string;
  telefono: string;
  alquiler_mensual: number;
  medidor: string;
  lectura_anterior: number;
  activo: boolean;
  creado: string;
}

export interface LecturaLuz {
  id: number;
  inquilino_id: number;
  periodo: string;
  lectura_anterior: number;
  lectura_actual: number;
  consumo: number;
  precio_kwh: number;
  monto: number;
  nota: string;
  creado: string;
  /** Joined fields */
  nombre?: string;
  unidad?: string;
}

export interface PagoAlquiler {
  id: number;
  inquilino_id: number;
  periodo: string;
  monto: number;
  pagado: boolean;
  fecha_pago: string | null;
  nota: string;
  creado: string;
  /** Joined fields */
  nombre?: string;
  unidad?: string;
}

export function periodoActual(fecha = new Date()): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function etiquetaPeriodo(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number);
  if (!y || !m) return periodo;
  const nombre = new Date(y, m - 1, 1).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

export function formatoMoneda(n: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatoKwh(n: number): string {
  return `${Number(n).toLocaleString("es-BO", {
    maximumFractionDigits: 2,
  })} kWh`;
}
