import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { asegurarTablasAlquileres } from "@/lib/alquileres-db";
import { periodoActual } from "@/lib/alquileres";

export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const periodo = request.nextUrl.searchParams.get("periodo") || periodoActual();

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      SELECT
        l.id, l.inquilino_id, l.periodo,
        l.lectura_anterior::float AS lectura_anterior,
        l.lectura_actual::float AS lectura_actual,
        l.consumo::float AS consumo,
        l.precio_kwh::float AS precio_kwh,
        l.monto::float AS monto,
        l.nota, l.creado,
        i.nombre, i.unidad
      FROM lecturas_luz l
      JOIN inquilinos i ON i.id = l.inquilino_id
      WHERE l.periodo = ${periodo}
      ORDER BY i.unidad ASC, i.nombre ASC
    `;
    return NextResponse.json(filas);
  } catch (error) {
    console.error("Error listando lecturas:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

/**
 * Registra la lectura de la factura:
 * consumo = lectura_actual − lectura_anterior del inquilino,
 * y actualiza lectura_anterior = lectura_actual.
 */
export async function POST(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos?.inquilino_id) {
    return NextResponse.json({ error: "Falta el inquilino" }, { status: 400 });
  }

  const inquilinoId = Number(datos.inquilino_id);
  const lecturaActual = Number(datos.lectura_actual);
  const periodo = String(datos.periodo || periodoActual()).trim();
  const precioKwh = Number(datos.precio_kwh) || 0;
  const nota = String(datos.nota ?? "").trim();

  if (!inquilinoId || Number.isNaN(lecturaActual)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    await asegurarTablasAlquileres();

    const inquilinos = await sql`
      SELECT id, lectura_anterior::float AS lectura_anterior
      FROM inquilinos WHERE id = ${inquilinoId}
    `;
    if (inquilinos.length === 0) {
      return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
    }

    const lecturaAnterior = Number(inquilinos[0].lectura_anterior) || 0;
    if (lecturaActual < lecturaAnterior) {
      return NextResponse.json(
        {
          error: `La lectura actual (${lecturaActual}) no puede ser menor que la anterior (${lecturaAnterior})`,
        },
        { status: 400 }
      );
    }

    const consumo = Math.round((lecturaActual - lecturaAnterior) * 100) / 100;
    const monto = Math.round(consumo * precioKwh * 100) / 100;

    const filas = await sql`
      INSERT INTO lecturas_luz (
        inquilino_id, periodo, lectura_anterior, lectura_actual,
        consumo, precio_kwh, monto, nota
      ) VALUES (
        ${inquilinoId}, ${periodo}, ${lecturaAnterior}, ${lecturaActual},
        ${consumo}, ${precioKwh}, ${monto}, ${nota}
      )
      ON CONFLICT (inquilino_id, periodo) DO UPDATE SET
        lectura_anterior = EXCLUDED.lectura_anterior,
        lectura_actual = EXCLUDED.lectura_actual,
        consumo = EXCLUDED.consumo,
        precio_kwh = EXCLUDED.precio_kwh,
        monto = EXCLUDED.monto,
        nota = EXCLUDED.nota
      RETURNING
        id, inquilino_id, periodo,
        lectura_anterior::float AS lectura_anterior,
        lectura_actual::float AS lectura_actual,
        consumo::float AS consumo,
        precio_kwh::float AS precio_kwh,
        monto::float AS monto,
        nota, creado
    `;

    await sql`
      UPDATE inquilinos
      SET lectura_anterior = ${lecturaActual}
      WHERE id = ${inquilinoId}
    `;

    return NextResponse.json(filas[0], { status: 201 });
  } catch (error) {
    console.error("Error registrando lectura:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await asegurarTablasAlquileres();
    const filas = await sql`
      DELETE FROM lecturas_luz WHERE id = ${id} RETURNING id
    `;
    if (filas.length === 0) {
      return NextResponse.json({ error: "Lectura no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error eliminando lectura:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
