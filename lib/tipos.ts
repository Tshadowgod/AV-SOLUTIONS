export interface Orden {
  codigo: string;
  cliente: string;
  equipo: string;
  servicio: string;
  recibido: string;
  estado: number;
  nota: string;
}

export const ESTADOS = [
  { nombre: "Recibido", icono: "📥" },
  { nombre: "En diagnóstico", icono: "🔎" },
  { nombre: "En reparación", icono: "🔧" },
  { nombre: "Listo para recoger", icono: "✅" },
  { nombre: "Entregado", icono: "📦" },
] as const;

export const ESTADO_LISTO = 3;
export const ESTADO_ENTREGADO = 4;
