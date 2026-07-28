import { ImageResponse } from "next/og";
import { NEGOCIO } from "@/lib/negocio";

// Imagen que se ve al compartir el enlace por WhatsApp, Facebook o Messenger.
export const alt = `${NEGOCIO.nombre} — ${NEGOCIO.rubro}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #070b14 0%, #140f2e 55%, #06222b 100%)",
          color: "#e8ecf4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 26px",
            borderRadius: 999,
            border: "1px solid rgba(34, 211, 238, 0.35)",
            background: "rgba(34, 211, 238, 0.1)",
            color: "#67e8f9",
            fontSize: 28,
            letterSpacing: 2,
          }}
        >
          {NEGOCIO.eslogan.toUpperCase()}
        </div>

        <div style={{ display: "flex", fontSize: 104, fontWeight: 800, marginTop: 34 }}>
          <span>AV&nbsp;</span>
          <span style={{ color: "#22d3ee" }}>SOLUTIONS</span>
        </div>

        <div style={{ display: "flex", fontSize: 44, color: "#94a3b8", marginTop: 18 }}>
          Reparamos tu computadora. Tú sigues su estado en línea.
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 54, fontSize: 30, color: "#cbd5e1" }}>
          <span>Cotización gratis</span>
          <span style={{ color: "#475569" }}>·</span>
          <span>Garantía de {NEGOCIO.garantiaDias} días</span>
          <span style={{ color: "#475569" }}>·</span>
          <span>{NEGOCIO.whatsappVisible}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
