import { sql } from "@/lib/db";

let tablasListas = false;

/** Crea las tablas de alquileres la primera vez que se usan. */
export async function asegurarTablasAlquileres() {
  if (tablasListas) return;

  await sql`
    CREATE TABLE IF NOT EXISTS inquilinos (
      id               SERIAL PRIMARY KEY,
      nombre           TEXT NOT NULL,
      unidad           TEXT NOT NULL DEFAULT '',
      telefono         TEXT NOT NULL DEFAULT '',
      alquiler_mensual NUMERIC(12, 2) NOT NULL DEFAULT 0,
      medidor          TEXT NOT NULL DEFAULT '',
      lectura_anterior NUMERIC(12, 2) NOT NULL DEFAULT 0,
      activo           BOOLEAN NOT NULL DEFAULT TRUE,
      creado           TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS lecturas_luz (
      id               SERIAL PRIMARY KEY,
      inquilino_id     INTEGER NOT NULL REFERENCES inquilinos(id) ON DELETE CASCADE,
      periodo          TEXT NOT NULL,
      lectura_anterior NUMERIC(12, 2) NOT NULL,
      lectura_actual   NUMERIC(12, 2) NOT NULL,
      consumo          NUMERIC(12, 2) NOT NULL,
      precio_kwh       NUMERIC(12, 4) NOT NULL DEFAULT 0,
      monto            NUMERIC(12, 2) NOT NULL DEFAULT 0,
      nota             TEXT NOT NULL DEFAULT '',
      creado           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (inquilino_id, periodo)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pagos_alquiler (
      id           SERIAL PRIMARY KEY,
      inquilino_id INTEGER NOT NULL REFERENCES inquilinos(id) ON DELETE CASCADE,
      periodo      TEXT NOT NULL,
      monto        NUMERIC(12, 2) NOT NULL,
      pagado       BOOLEAN NOT NULL DEFAULT FALSE,
      fecha_pago   TIMESTAMPTZ,
      nota         TEXT NOT NULL DEFAULT '',
      creado       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (inquilino_id, periodo)
    )
  `;

  tablasListas = true;
}
