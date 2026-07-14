import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

// Actualizar una orden (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { codigo } = await params;
  const datos = await request.json().catch(() => null);
  if (!datos) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const nuevoCodigo = String(datos.codigo ?? codigo).trim().toUpperCase();
  const estado = Math.min(4, Math.max(0, Number(datos.estado) || 0));

  try {
    const resultado = await sql`
      UPDATE ordenes SET
        codigo = ${nuevoCodigo},
        cliente = COALESCE(${datos.cliente}, cliente),
        equipo = COALESCE(${datos.equipo}, equipo),
        servicio = COALESCE(${datos.servicio}, servicio),
        recibido = COALESCE(${datos.recibido}, recibido),
        estado = ${estado},
        nota = COALESCE(${datos.nota}, nota)
      WHERE UPPER(codigo) = UPPER(${codigo})
      RETURNING codigo
    `;

    if (resultado.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "";
    if (mensaje.includes("duplicate key")) {
      return NextResponse.json(
        { error: `Ya existe una orden con el código ${nuevoCodigo}` },
        { status: 409 }
      );
    }
    console.error("Error actualizando orden:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Eliminar una orden (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { codigo } = await params;
  const resultado = await sql`
    DELETE FROM ordenes WHERE UPPER(codigo) = UPPER(${codigo}) RETURNING codigo
  `;

  if (resultado.length === 0) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
