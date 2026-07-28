import { NextResponse, type NextRequest } from "next/server";
import { aCotizacion, sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

// Listar todas las cotizaciones (solo admin)
export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const filas = await sql`
      SELECT id, tipo, modelo, sabe_modelo, problema, nombre, whatsapp, atendida, creado
      FROM cotizaciones
      ORDER BY atendida ASC, creado DESC
    `;
    return NextResponse.json(filas.map(aCotizacion));
  } catch (error) {
    console.error("Error listando cotizaciones:", error);
    return NextResponse.json({ error: "No se pudo leer la base de datos" }, { status: 500 });
  }
}
