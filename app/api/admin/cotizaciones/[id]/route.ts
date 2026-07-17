import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

// Marcar como atendida / no atendida (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const datos = await request.json().catch(() => ({}));
  const atendida = Boolean(datos.atendida);

  const resultado = await sql`
    UPDATE cotizaciones SET atendida = ${atendida}
    WHERE id = ${Number(id)} RETURNING id
  `;

  if (resultado.length === 0) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// Eliminar una cotización (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const resultado = await sql`
    DELETE FROM cotizaciones WHERE id = ${Number(id)} RETURNING id
  `;

  if (resultado.length === 0) {
    return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
