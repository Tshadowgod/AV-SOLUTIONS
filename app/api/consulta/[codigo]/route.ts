import { NextResponse } from "next/server";
import { aOrden, sql } from "@/lib/db";
import { normalizarCodigo } from "@/lib/tipos";

/**
 * Los códigos son correlativos, así que cualquiera podría probar
 * AV-1001, AV-1002… Por eso la consulta pública devuelve el nombre abreviado
 * («Juan P.»): alcanza para que el dueño reconozca su orden, pero no expone
 * el nombre completo ni el teléfono de nadie.
 */
function abreviarNombre(nombre: string): string {
  const partes = nombre.split(" ").filter(Boolean);
  if (partes.length <= 1) return partes[0] ?? "";
  return `${partes[0]} ${partes[1][0].toUpperCase()}.`;
}

// Consulta pública: los clientes buscan su orden por código
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;
  const buscado = normalizarCodigo(decodeURIComponent(codigo));

  if (!buscado) {
    return NextResponse.json({ error: "Código vacío" }, { status: 400 });
  }

  try {
    const filas = await sql`
      SELECT codigo, cliente, telefono, equipo, servicio, recibido, estado, nota, actualizado
      FROM ordenes
      WHERE UPPER(codigo) = UPPER(${buscado})
      LIMIT 1
    `;

    if (filas.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    const orden = aOrden(filas[0]);
    return NextResponse.json(
      { ...orden, cliente: abreviarNombre(orden.cliente), telefono: "" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error consultando orden:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
