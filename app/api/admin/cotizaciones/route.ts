import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

// Listar todas las cotizaciones (solo admin)
export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filas = await sql`
    SELECT id, tipo, modelo, sabe_modelo, problema, nombre, whatsapp, atendida, creado
    FROM cotizaciones
    ORDER BY atendida ASC, creado DESC
  `;
  return NextResponse.json(filas);
}
