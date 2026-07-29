import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { asegurarTablasAlquileres } from "@/lib/alquileres-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      UPDATE inquilinos SET
        nombre = COALESCE(${datos.nombre !== undefined ? String(datos.nombre).trim() : null}, nombre),
        unidad = COALESCE(${datos.unidad !== undefined ? String(datos.unidad).trim() : null}, unidad),
        telefono = COALESCE(${datos.telefono !== undefined ? String(datos.telefono).trim() : null}, telefono),
        alquiler_mensual = COALESCE(${datos.alquiler_mensual !== undefined ? Number(datos.alquiler_mensual) : null}, alquiler_mensual),
        medidor = COALESCE(${datos.medidor !== undefined ? String(datos.medidor).trim() : null}, medidor),
        lectura_anterior = COALESCE(${datos.lectura_anterior !== undefined ? Number(datos.lectura_anterior) : null}, lectura_anterior),
        activo = COALESCE(${typeof datos.activo === "boolean" ? datos.activo : null}, activo)
      WHERE id = ${id}
      RETURNING
        id, nombre, unidad, telefono,
        alquiler_mensual::float AS alquiler_mensual,
        medidor,
        lectura_anterior::float AS lectura_anterior,
        activo, creado
    `;

    if (filas.length === 0) {
      return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
    }
    return NextResponse.json(filas[0]);
  } catch (error) {
    console.error("Error actualizando inquilino:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      DELETE FROM inquilinos WHERE id = ${id} RETURNING id
    `;
    if (filas.length === 0) {
      return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando inquilino:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
