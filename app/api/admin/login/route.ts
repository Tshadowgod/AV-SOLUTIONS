import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_SESION,
  DURACION_SESION_SEG,
  contrasenaCorrecta,
  crearSesion,
} from "@/lib/auth";
import { registrarAcierto, registrarFallo, segundosBloqueado } from "@/lib/limite";

function origen(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "desconocido"
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Faltan las variables ADMIN_PASSWORD y/o AUTH_SECRET en el servidor" },
      { status: 500 }
    );
  }

  const clave = origen(request);
  const espera = segundosBloqueado(clave);
  if (espera > 0) {
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Vuelve a probar en ${espera} segundos.` },
      { status: 429 }
    );
  }

  const { password } = await request.json().catch(() => ({ password: "" }));

  if (!contrasenaCorrecta(password)) {
    registrarFallo(clave);
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  registrarAcierto(clave);

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE_SESION, crearSesion(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_SESION_SEG,
    path: "/",
  });
  return respuesta;
}

// Cerrar sesión
export async function DELETE() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(COOKIE_SESION, "", { maxAge: 0, path: "/" });
  return respuesta;
}
