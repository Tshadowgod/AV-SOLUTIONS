import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { esTipoEquipo } from "@/lib/tipos";
import { LARGOS, texto, textoLargo } from "@/lib/validacion";
import { permitirEnvio } from "@/lib/limite";

const MAX_POR_IP = 5;
const VENTANA_MS = 10 * 60 * 1000;

// Enviar una cotización (público: el cliente describe su equipo y problema)
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "desconocido";

  if (!permitirEnvio(ip, MAX_POR_IP, VENTANA_MS)) {
    return NextResponse.json(
      { error: "Recibimos varias solicitudes tuyas. Espera unos minutos o escríbenos por WhatsApp." },
      { status: 429 }
    );
  }

  const datos = await request.json().catch(() => null);
  if (!datos) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const tipo = texto(datos.tipo, 40);
  if (!esTipoEquipo(tipo)) {
    return NextResponse.json({ error: "Elige si tu equipo es una laptop o una PC" }, { status: 400 });
  }

  const sabeModelo = Boolean(datos.sabe_modelo);
  const modelo = sabeModelo ? texto(datos.modelo, LARGOS.modelo) : "";
  if (sabeModelo && !modelo) {
    return NextResponse.json(
      { error: "Indica el modelo o marca «No sé el modelo»" },
      { status: 400 }
    );
  }

  const problema = textoLargo(datos.problema, LARGOS.problema);
  if (problema.length < 10) {
    return NextResponse.json(
      { error: "Cuéntanos un poco más sobre el problema (al menos 10 caracteres)" },
      { status: 400 }
    );
  }

  const nombre = texto(datos.nombre, LARGOS.nombre);
  if (nombre.length < 2) {
    return NextResponse.json({ error: "Escribe tu nombre" }, { status: 400 });
  }

  const whatsapp = texto(datos.whatsapp, LARGOS.telefono);
  if (whatsapp.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "Escribe un número de WhatsApp válido para poder responderte" },
      { status: 400 }
    );
  }

  try {
    await sql`
      INSERT INTO cotizaciones (tipo, modelo, sabe_modelo, problema, nombre, whatsapp)
      VALUES (${tipo}, ${modelo}, ${sabeModelo}, ${problema}, ${nombre}, ${whatsapp})
    `;
  } catch (error) {
    console.error("Error guardando cotización:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
