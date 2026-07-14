import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Consulta pública: los clientes buscan su orden por código
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;

  try {
    const filas = await sql`
      SELECT codigo, cliente, equipo, servicio, recibido, estado, nota
      FROM ordenes
      WHERE UPPER(codigo) = UPPER(${codigo.trim()})
      LIMIT 1
    `;

    if (filas.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json(filas[0]);
  } catch (error) {
    console.error("Error consultando orden:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
