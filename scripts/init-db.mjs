/* Inicializa la base de datos en Neon:
   crea la tabla de órdenes y carga datos de ejemplo si está vacía.
   Uso:  node --env-file=.env.local scripts/init-db.mjs        */

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("❌ Falta DATABASE_URL. Ejecuta: node --env-file=.env.local scripts/init-db.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS ordenes (
    id       SERIAL PRIMARY KEY,
    codigo   TEXT UNIQUE NOT NULL,
    cliente  TEXT NOT NULL,
    equipo   TEXT NOT NULL,
    servicio TEXT NOT NULL,
    recibido TEXT NOT NULL DEFAULT '',
    estado   INTEGER NOT NULL DEFAULT 0,
    nota     TEXT NOT NULL DEFAULT '',
    creado   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
console.log("✅ Tabla 'ordenes' lista");

await sql`
  CREATE TABLE IF NOT EXISTS cotizaciones (
    id         SERIAL PRIMARY KEY,
    tipo       TEXT NOT NULL,
    modelo     TEXT NOT NULL DEFAULT '',
    sabe_modelo BOOLEAN NOT NULL DEFAULT TRUE,
    problema   TEXT NOT NULL,
    nombre     TEXT NOT NULL,
    whatsapp   TEXT NOT NULL,
    atendida   BOOLEAN NOT NULL DEFAULT FALSE,
    creado     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
console.log("✅ Tabla 'cotizaciones' lista");

const [{ total }] = await sql`SELECT COUNT(*)::int AS total FROM ordenes`;

if (total === 0) {
  await sql`
    INSERT INTO ordenes (codigo, cliente, equipo, servicio, recibido, estado, nota) VALUES
    ('AV-1001', 'Juan Pérez', 'Laptop HP Pavilion 15', 'Cambio de pantalla', '10 de julio, 2026', 3, 'Puedes pasar en horario de atención. Trae tu comprobante.'),
    ('AV-1002', 'María López', 'PC de escritorio (torre)', 'Formateo + instalación de programas', '12 de julio, 2026', 2, ''),
    ('AV-1003', 'Carlos Mamani', 'Laptop Lenovo IdeaPad 3', 'Mantenimiento preventivo + cambio de pasta térmica', '13 de julio, 2026', 1, ''),
    ('AV-1004', 'Ana Gutiérrez', 'Laptop Dell Inspiron 14', 'Cambio de disco duro a SSD', '8 de julio, 2026', 4, 'Entregado el 11 de julio. ¡Gracias por confiar en nosotros!')
  `;
  console.log("✅ Datos de ejemplo cargados (4 órdenes)");
} else {
  console.log(`ℹ️  La tabla ya tiene ${total} órdenes — no se cargaron ejemplos`);
}

console.log("🎉 Base de datos lista");
