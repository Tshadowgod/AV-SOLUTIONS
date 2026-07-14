import { neon } from "@neondatabase/serverless";

type ClienteNeon = ReturnType<typeof neon>;

let cliente: ClienteNeon | undefined;

// Conexión perezosa: se crea en el primer uso (en tiempo de ejecución),
// nunca durante el build — las variables sensibles de Vercel solo
// existen en runtime.
export function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  if (!cliente) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Falta la variable de entorno DATABASE_URL");
    }
    cliente = neon(process.env.DATABASE_URL);
  }
  return cliente(strings, ...values) as Promise<Record<string, unknown>[]>;
}
