import { NextResponse, type NextRequest } from "next/server";
import { aOrden, sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { estadoValido, normalizarCodigo } from "@/lib/tipos";
import { LARGOS, texto } from "@/lib/validacion";

// Listar todas las órdenes (solo admin)
export async function GET(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const filas = await sql`
      SELECT codigo, cliente, telefono, equipo, servicio, recibido, estado, nota, actualizado
      FROM ordenes
      ORDER BY creado DESC
    `;
    return NextResponse.json(filas.map(aOrden));
  } catch (error) {
    console.error("Error listando órdenes:", error);
    return NextResponse.json({ error: "No se pudo leer la base de datos" }, { status: 500 });
  }
}

// Crear una orden nueva (solo admin)
export async function POST(request: NextRequest) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const datos = await request.json().catch(() => null);
  if (!datos) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const codigo = normalizarCodigo(texto(datos.codigo, LARGOS.codigo));
  const cliente = texto(datos.cliente, LARGOS.nombre);
  const equipo = texto(datos.equipo, LARGOS.equipo);
  const servicio = texto(datos.servicio, LARGOS.servicio);

  if (!codigo || !cliente || !equipo || !servicio) {
    return NextResponse.json(
      { error: "Faltan datos obligatorios: código, cliente, equipo y servicio" },
      { status: 400 }
    );
  }

  const telefono = texto(datos.telefono, LARGOS.telefono);
  const recibido = texto(datos.recibido, LARGOS.fecha);
  const nota = texto(datos.nota, LARGOS.nota);
  const estado = estadoValido(datos.estado);

  try {
    await sql`
      INSERT INTO ordenes (codigo, cliente, telefono, equipo, servicio, recibido, estado, nota)
      VALUES (${codigo}, ${cliente}, ${telefono}, ${equipo}, ${servicio},
              ${recibido}, ${estado}, ${nota})
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
