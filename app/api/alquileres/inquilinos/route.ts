import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { asegurarTablasAlquileres } from "@/lib/alquileres-db";

export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      SELECT
        id, nombre, unidad, telefono,
        alquiler_mensual::float AS alquiler_mensual,
        medidor,
        lectura_anterior::float AS lectura_anterior,
        activo, creado
      FROM inquilinos
      ORDER BY unidad ASC, nombre ASC
    `;
    return NextResponse.json(filas);
  } catch (error) {
    console.error("Error listando inquilinos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos?.nombre?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      INSERT INTO inquilinos (
        nombre, unidad, telefono, alquiler_mensual, medidor, lectura_anterior, activo
      ) VALUES (
        ${String(datos.nombre).trim()},
        ${String(datos.unidad ?? "").trim()},
        ${String(datos.telefono ?? "").trim()},
        ${Number(datos.alquiler_mensual) || 0},
        ${String(datos.medidor ?? "").trim()},
        ${Number(datos.lectura_anterior) || 0},
        ${datos.activo !== false}
      )
      RETURNING
        id, nombre, unidad, telefono,
        alquiler_mensual::float AS alquiler_mensual,
        medidor,
        lectura_anterior::float AS lectura_anterior,
        activo, creado
    `;
    return NextResponse.json(filas[0], { status: 201 });
  } catch (error) {
    console.error("Error creando inquilino:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
