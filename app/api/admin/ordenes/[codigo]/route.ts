import { NextResponse, type NextRequest } from "next/server";
import { aOrden, sql } from "@/lib/db";
import { estaAutorizado } from "@/lib/auth";
import { estadoValido, normalizarCodigo } from "@/lib/tipos";
import { LARGOS, texto } from "@/lib/validacion";

/** Devuelve el texto limpio solo si el campo venía en la petición; si no, null
 *  para que el UPDATE deje el valor que ya tenía la orden. */
function siViene(datos: Record<string, unknown>, campo: string, maximo: number): string | null {
  return campo in datos ? texto(datos[campo], maximo) : null;
}

// Actualizar una orden, entera o solo algunos campos (solo admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  if (!estaAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { codigo } = await params;
  const datos = await request.json().catch(() => null);
  if (!datos || typeof datos !== "object") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const nuevoCodigo =
    "codigo" in datos ? normalizarCodigo(texto(datos.codigo, LARGOS.codigo)) : null;
  if (nuevoCodigo === "") {
    return NextResponse.json({ error: "El código no puede quedar vacío" }, { status: 400 });
  }

  const cliente = siViene(datos, "cliente", LARGOS.nombre);
  const telefono = siViene(datos, "telefono", LARGOS.telefono);
  const equipo = siViene(datos, "equipo", LARGOS.equipo);
  const servicio = siViene(datos, "servicio", LARGOS.servicio);
  const recibido = siViene(datos, "recibido", LARGOS.fecha);
  const nota = siViene(datos, "nota", LARGOS.nota);
  const estado = "estado" in datos ? estadoValido(datos.estado) : null;

  if (cliente === "" || equipo === "" || servicio === "") {
    return NextResponse.json(
      { error: "Cliente, equipo y servicio no pueden quedar vacíos" },
      { status: 400 }
    );
  }

  try {
    const resultado = await sql`
      UPDATE ordenes SET
        codigo      = COALESCE(${nuevoCodigo}::text, codigo),
        cliente     = COALESCE(${cliente}::text, cliente),
        telefono    = COALESCE(${telefono}::text, telefono),
        equipo      = COALESCE(${equipo}::text, equipo),
        servicio    = COALESCE(${servicio}::text, servicio),
        recibido    = COALESCE(${recibido}::text, recibido),
        estado      = COALESCE(${estado}::int, estado),
        nota        = COALESCE(${nota}::text, nota),
        actualizado = NOW()
      WHERE UPPER(codigo) = UPPER(${codigo.trim()})
      RETURNING codigo, cliente, telefono, equipo, servicio, recibido, estado, nota, actualizado
    `;

    if (resultado.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, orden: aOrden(resultado[0]) });
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

  try {
    const resultado = await sql`
      DELETE FROM ordenes WHERE UPPER(codigo) = UPPER(${codigo.trim()}) RETURNING codigo
    `;

    if (resultado.length === 0) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error eliminando orden:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
