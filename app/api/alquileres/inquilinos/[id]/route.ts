import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { asegurarTablasAlquileres } from "@/lib/alquileres-db";
import {
  usarStoreLocal,
  actualizarInquilinoLocal,
  borrarInquilinoLocal,
} from "@/lib/alquileres-local";

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
    if (usarStoreLocal()) {
      const patch: Record<string, unknown> = {};
      if (datos.nombre !== undefined) patch.nombre = String(datos.nombre).trim();
      if (datos.unidad !== undefined) patch.unidad = String(datos.unidad).trim();
      if (datos.telefono !== undefined) patch.telefono = String(datos.telefono).trim();
      if (datos.alquiler_mensual !== undefined)
        patch.alquiler_mensual = Number(datos.alquiler_mensual);
      if (datos.medidor !== undefined) patch.medidor = String(datos.medidor).trim();
      if (datos.lectura_anterior !== undefined)
        patch.lectura_anterior = Number(datos.lectura_anterior);
      if (typeof datos.activo === "boolean") patch.activo = datos.activo;

      const fila = actualizarInquilinoLocal(id, patch);
      if (!fila) {
        return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
      }
      return NextResponse.json(fila);
    }

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
    if (usarStoreLocal()) {
      if (!borrarInquilinoLocal(id)) {
        return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

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
