/* Freno simple contra intentos de adivinar la contraseña del panel.
   Vive en memoria: en un servidor sin estado no es infalible, pero corta
   de raíz los ataques de fuerza bruta rápidos, que es lo que importa. */

const MAX_INTENTOS = 5;
const VENTANA_MS = 10 * 60 * 1000;
const BLOQUEO_MS = 5 * 60 * 1000;

type Registro = { fallos: number; ultimo: number; bloqueadoHasta: number };

const registros = new Map<string, Registro>();

function limpiarViejos(ahora: number) {
  if (registros.size < 500) return;
  for (const [clave, r] of registros) {
    if (ahora - r.ultimo > VENTANA_MS && r.bloqueadoHasta < ahora) registros.delete(clave);
  }
}

/** Segundos que faltan para poder reintentar. 0 significa «adelante». */
export function segundosBloqueado(clave: string): number {
  const r = registros.get(clave);
  if (!r) return 0;
  const restante = r.bloqueadoHasta - Date.now();
  return restante > 0 ? Math.ceil(restante / 1000) : 0;
}

export function registrarFallo(clave: string) {
  const ahora = Date.now();
  limpiarViejos(ahora);

  const r = registros.get(clave);
  const dentroDeVentana = r && ahora - r.ultimo < VENTANA_MS;
  const fallos = dentroDeVentana ? r.fallos + 1 : 1;

  registros.set(clave, {
    fallos,
    ultimo: ahora,
    bloqueadoHasta: fallos >= MAX_INTENTOS ? ahora + BLOQUEO_MS : 0,
  });
}

export function registrarAcierto(clave: string) {
  registros.delete(clave);
}

/* ── Freno genérico para formularios públicos (anti-spam) ── */

const envios = new Map<string, number[]>();

/**
 * Deja pasar como mucho `maximo` acciones por `ventanaMs` para una misma clave.
 * Devuelve `false` cuando hay que rechazar la petición.
 */
export function permitirEnvio(clave: string, maximo: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const previos = (envios.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);

  if (envios.size > 500) {
    for (const [k, marcas] of envios) {
      if (marcas.every((t) => ahora - t >= ventanaMs)) envios.delete(k);
    }
  }

  if (previos.length >= maximo) {
    envios.set(clave, previos);
    return false;
  }

  previos.push(ahora);
  envios.set(clave, previos);
  return true;
}
