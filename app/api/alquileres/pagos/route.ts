import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { asegurarTablasAlquileres } from "@/lib/alquileres-db";
import { periodoActual } from "@/lib/alquileres";
import {
  usarStoreLocal,
  listarPagosLocal,
  registrarPagoLocal,
  listarInquilinosLocal,
} from "@/lib/alquileres-local";

export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const periodo = request.nextUrl.searchParams.get("periodo") || periodoActual();

  try {
    if (usarStoreLocal()) {
      return NextResponse.json(listarPagosLocal(periodo));
    }
    await asegurarTablasAlquileres();
    const filas = await sql`
      SELECT
        p.id, p.inquilino_id, p.periodo,
        p.monto::float AS monto,
        p.pagado, p.fecha_pago, p.nota, p.creado,
        i.nombre, i.unidad
      FROM pagos_alquiler p
      JOIN inquilinos i ON i.id = p.inquilino_id
      WHERE p.periodo = ${periodo}
      ORDER BY i.unidad ASC, i.nombre ASC
    `;
    return NextResponse.json(filas);
  } catch (error) {
    console.error("Error listando pagos:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos?.inquilino_id) {
    return NextResponse.json({ error: "Falta el inquilino" }, { status: 400 });
  }

  const inquilinoId = Number(datos.inquilino_id);
  const periodo = String(datos.periodo || periodoActual()).trim();
  const pagado = Boolean(datos.pagado);
  const nota = String(datos.nota ?? "").trim();

  try {
    if (usarStoreLocal()) {
      const inqs = listarInquilinosLocal();
      const inq = inqs.find((i) => i.id === inquilinoId);
      if (!inq) {
        return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
      }
      const monto =
        datos.monto !== undefined && datos.monto !== null
          ? Number(datos.monto)
          : Number(inq.alquiler_mensual) || 0;
      const pago = registrarPagoLocal({
        inquilino_id: inquilinoId,
        periodo,
        monto,
        pagado,
        nota,
      });
      return NextResponse.json(pago, { status: 201 });
    }

    await asegurarTablasAlquileres();

    const inquilinos = await sql`
      SELECT id, alquiler_mensual::float AS alquiler_mensual
      FROM inquilinos WHERE id = ${inquilinoId}
    `;
    if (inquilinos.length === 0) {
      return NextResponse.json({ error: "Inquilino no encontrado" }, { status: 404 });
    }

    const monto =
      datos.monto !== undefined && datos.monto !== null
        ? Number(datos.monto)
        : Number(inquilinos[0].alquiler_mensual) || 0;

    const filas = await sql`
      INSERT INTO pagos_alquiler (
        inquilino_id, periodo, monto, pagado, fecha_pago, nota
      ) VALUES (
        ${inquilinoId},
        ${periodo},
        ${monto},
        ${pagado},
        ${pagado ? new Date().toISOString() : null},
        ${nota}
      )
      ON CONFLICT (inquilino_id, periodo) DO UPDATE SET
        monto = EXCLUDED.monto,
        pagado = EXCLUDED.pagado,
        fecha_pago = CASE
          WHEN EXCLUDED.pagado THEN COALESCE(pagos_alquiler.fecha_pago, NOW())
          ELSE NULL
        END,
        nota = EXCLUDED.nota
      RETURNING
        id, inquilino_id, periodo,
        monto::float AS monto,
        pagado, fecha_pago, nota, creado
    `;

    return NextResponse.json(filas[0], { status: 201 });
  } catch (error) {
    console.error("Error registrando pago:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
