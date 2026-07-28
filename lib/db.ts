import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { estadoValido, type Cotizacion, type Orden } from "@/lib/tipos";

let cliente: NeonQueryFunction<false, false> | undefined;
let esquema: Promise<void> | undefined;

// Conexión perezosa: se crea en el primer uso (en tiempo de ejecución),
// nunca durante el build — las variables sensibles de Vercel solo
// existen en runtime.
function conexion(): NeonQueryFunction<false, false> {
  if (!cliente) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Falta la variable de entorno DATABASE_URL");
    }
    cliente = neon(process.env.DATABASE_URL);
  }
  return cliente;
}

/**
 * Crea las tablas y columnas que falten. Todo el DDL es idempotente y viaja
 * en una sola petición, así el sitio se auto-repara al desplegar cambios de
 * esquema sin que nadie tenga que ejecutar scripts a mano.
 */
export function asegurarEsquema(): Promise<void> {
  const db = conexion();
  esquema ??= db
    .transaction([
      db`
        CREATE TABLE IF NOT EXISTS ordenes (
          id          SERIAL PRIMARY KEY,
          codigo      TEXT UNIQUE NOT NULL,
          cliente     TEXT NOT NULL,
          equipo      TEXT NOT NULL,
          servicio    TEXT NOT NULL,
          recibido    TEXT NOT NULL DEFAULT '',
          estado      INTEGER NOT NULL DEFAULT 0,
          nota        TEXT NOT NULL DEFAULT '',
          creado      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
      db`ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS telefono TEXT NOT NULL DEFAULT ''`,
      db`ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS actualizado TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      db`CREATE INDEX IF NOT EXISTS ordenes_codigo_mayusculas ON ordenes (UPPER(codigo))`,
      db`
        CREATE TABLE IF NOT EXISTS cotizaciones (
          id          SERIAL PRIMARY KEY,
          tipo        TEXT NOT NULL,
          modelo      TEXT NOT NULL DEFAULT '',
          sabe_modelo BOOLEAN NOT NULL DEFAULT TRUE,
          problema    TEXT NOT NULL,
          nombre      TEXT NOT NULL,
          whatsapp    TEXT NOT NULL,
          atendida    BOOLEAN NOT NULL DEFAULT FALSE,
          creado      TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `,
    ])
    .then(() => undefined)
    .catch((error) => {
      // Si falla, se reintenta en la siguiente consulta en vez de dejar el
      // sitio caído para siempre.
      esquema = undefined;
      throw error;
    });
  return esquema;
}

export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  await asegurarEsquema();
  return conexion()(strings, ...values) as Promise<Record<string, unknown>[]>;
}

const texto = (valor: unknown): string => (valor == null ? "" : String(valor));
const fecha = (valor: unknown): string =>
  valor instanceof Date ? valor.toISOString() : texto(valor);

/** Convierte una fila cruda de Postgres en una orden con todos sus campos. */
export function aOrden(fila: Record<string, unknown>): Orden {
  return {
    codigo: texto(fila.codigo),
    cliente: texto(fila.cliente),
    telefono: texto(fila.telefono),
    equipo: texto(fila.equipo),
    servicio: texto(fila.servicio),
    recibido: texto(fila.recibido),
    estado: estadoValido(fila.estado),
    nota: texto(fila.nota),
    actualizado: fecha(fila.actualizado),
  };
}

/** Convierte una fila cruda de Postgres en una cotización. */
export function aCotizacion(fila: Record<string, unknown>): Cotizacion {
  return {
    id: Number(fila.id),
    tipo: texto(fila.tipo),
    modelo: texto(fila.modelo),
    sabe_modelo: Boolean(fila.sabe_modelo),
    problema: texto(fila.problema),
    nombre: texto(fila.nombre),
    whatsapp: texto(fila.whatsapp),
    atendida: Boolean(fila.atendida),
    creado: fecha(fila.creado),
  };
}
