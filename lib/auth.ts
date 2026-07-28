import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const COOKIE_SESION = "av_admin";

/** Duración de la sesión del panel: 8 horas. */
export const DURACION_SESION_SEG = 8 * 60 * 60;

function secreto(): string {
  const valor = process.env.AUTH_SECRET;
  if (!valor) throw new Error("Falta la variable de entorno AUTH_SECRET");
  return valor;
}

function firmar(datos: string): string {
  return createHmac("sha256", secreto()).update(datos).digest("hex");
}

/** Compara dos textos en tiempo constante, sin filtrar su longitud. */
function iguales(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** ¿La contraseña escrita coincide con ADMIN_PASSWORD? */
export function contrasenaCorrecta(intento: unknown): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return iguales(typeof intento === "string" ? intento : "", real);
}

/**
 * Valor de la cookie de sesión: la fecha de expiración firmada.
 * Al llevar la expiración dentro de la firma, una cookie copiada deja de
 * servir cuando vence, aunque el navegador la conserve.
 */
export function crearSesion(): string {
  const expira = Date.now() + DURACION_SESION_SEG * 1000;
  return `${expira}.${firmar(String(expira))}`;
}

export function estaAutorizado(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_SESION)?.value;
  if (!cookie) return false;

  const [expira, firma] = cookie.split(".");
  if (!expira || !firma) return false;

  const vence = Number(expira);
  if (!Number.isFinite(vence) || vence < Date.now()) return false;

  try {
    return iguales(firma, firmar(expira));
  } catch {
    // AUTH_SECRET sin configurar: se trata como sesión inválida y el login
    // devuelve el mensaje de configuración correspondiente.
    return false;
  }
}
