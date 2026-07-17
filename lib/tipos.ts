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
