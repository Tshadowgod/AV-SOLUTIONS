import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";

// Listar todas las órdenes (solo admin)
export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const filas = await sql`
    SELECT codigo, cliente, equipo, servicio, recibido, estado, nota
    FROM ordenes
    ORDER BY creado DESC
  `;
  return NextResponse.json(filas);
}

// Crear una orden nueva (solo admin)
export async function POST(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos?.codigo || !datos?.cliente || !datos?.equipo || !datos?.servicio) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const codigo = String(datos.codigo).trim().toUpperCase();
  const estado = Math.min(4, Math.max(0, Number(datos.estado) || 0));

  try {
    await sql`
      INSERT INTO ordenes (codigo, cliente, equipo, servicio, recibido, estado, nota)
      VALUES (${codigo}, ${datos.cliente}, ${datos.equipo}, ${datos.servicio},
              ${datos.recibido || ""}, ${estado}, ${datos.nota || ""})
    `;
  } catch (error: unknown) {
    const mensaje = error instanceof Error ? error.message : "";
    if (mensaje.includes("duplicate key")) {
      return NextResponse.json(
        { error: `Ya existe una orden con el código ${codigo}` },
        { status: 409 }
      );
    }
    console.error("Error creando orden:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, codigo }, { status: 201 });
}
