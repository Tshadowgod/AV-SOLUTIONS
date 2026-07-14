import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const COOKIE_SESION = "av_admin";

export function tokenSesion(): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("Falta la variable de entorno AUTH_SECRET");
  return createHmac("sha256", secreto).update("av-admin-session").digest("hex");
}

export function estaAutorizado(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_SESION)?.value;
  if (!cookie) return false;
  const esperado = tokenSesion();
  const a = Buffer.from(cookie);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
