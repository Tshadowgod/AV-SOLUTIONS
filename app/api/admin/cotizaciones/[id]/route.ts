import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

function identificador(valor: string): number | null {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Marcar como atendida / no atendida (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = identificador((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }

  const datos = await request.json().catch(() => ({}));
  const atendida = Boolean(datos.atendida);

  try {
    const resultado = await sql`
      UPDATE cotizaciones SET atendida = ${atendida}
      WHERE id = ${id} RETURNING id
    `;

    if (resultado.length === 0) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error actualizando cotización:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
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

  const id = identificador((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }

  try {
    const resultado = await sql`
      DELETE FROM cotizaciones WHERE id = ${id} RETURNING id
    `;

    if (resultado.length === 0) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error eliminando cotización:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
