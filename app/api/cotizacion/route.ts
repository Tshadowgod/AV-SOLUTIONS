import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { notificarWhatsApp } from "@/lib/notificar";

// Enviar una cotización (público: el cliente describe su equipo y problema)
export async function POST(request: Request) {
  const datos = await request.json().catch(() => null);

  if (!datos?.tipo || !datos?.problema || !datos?.nombre || !datos?.whatsapp) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }

  const tipo = String(datos.tipo).trim();
  if (tipo !== "Laptop" && tipo !== "PC de escritorio") {
    return NextResponse.json({ error: "Tipo de equipo inválido" }, { status: 400 });
  }

  const sabeModelo = Boolean(datos.sabe_modelo);
  const modelo = sabeModelo ? String(datos.modelo || "").trim() : "";

  if (sabeModelo && !modelo) {
    return NextResponse.json({ error: "Indica el modelo o marca «No sé el modelo»" }, { status: 400 });
  }

  const problema = String(datos.problema).trim().slice(0, 2000);
  const nombre = String(datos.nombre).trim().slice(0, 120);
  const whatsapp = String(datos.whatsapp).trim().slice(0, 40);

  try {
    await sql`
      INSERT INTO cotizaciones (tipo, modelo, sabe_modelo, problema, nombre, whatsapp)
      VALUES (${tipo}, ${modelo}, ${sabeModelo}, ${problema}, ${nombre}, ${whatsapp})
    `;
  } catch (error) {
    console.error("Error guardando cotización:", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }

  // Aviso al WhatsApp del dueño (si está configurado). No bloquea si falla.
  await notificarWhatsApp(
    `🔔 Nueva cotización en AV SOLUTIONS\n\n` +
      `👤 Cliente: ${nombre}\n` +
      `💻 Equipo: ${tipo}${sabeModelo && modelo ? ` — ${modelo}` : " — (modelo no indicado)"}\n` +
      `📝 Problema: ${problema}\n` +
      `📱 WhatsApp: ${whatsapp}`
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
