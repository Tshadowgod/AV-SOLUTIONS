import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { Inquilino, LecturaLuz, PagoAlquiler } from "@/lib/alquileres";

type Store = {
  inquilinos: Inquilino[];
  lecturas: LecturaLuz[];
  pagos: PagoAlquiler[];
  nextInq: number;
  nextLec: number;
  nextPag: number;
};

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "alquileres-local.json");

function vacio(): Store {
  return {
    inquilinos: [],
    lecturas: [],
    pagos: [],
    nextInq: 1,
    nextLec: 1,
    nextPag: 1,
  };
}

export function usarStoreLocal(): boolean {
  return !process.env.DATABASE_URL;
}

export function leerStore(): Store {
  if (!existsSync(DATA_FILE)) return vacio();
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf8")) as Store;
  } catch {
    return vacio();
  }
}

export function guardarStore(store: Store) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function listarInquilinosLocal(): Inquilino[] {
  return [...leerStore().inquilinos].sort((a, b) =>
    (a.unidad + a.nombre).localeCompare(b.unidad + b.nombre, "es")
  );
}

export function crearInquilinoLocal(datos: {
  nombre: string;
  unidad: string;
  telefono: string;
  alquiler_mensual: number;
  medidor: string;
  lectura_anterior: number;
  activo: boolean;
}): Inquilino {
  const store = leerStore();
  const fila: Inquilino = {
    id: store.nextInq++,
    ...datos,
    creado: new Date().toISOString(),
  };
  store.inquilinos.push(fila);
  guardarStore(store);
  return fila;
}

export function actualizarInquilinoLocal(
  id: number,
  datos: Partial<{
    nombre: string;
    unidad: string;
    telefono: string;
    alquiler_mensual: number;
    medidor: string;
    lectura_anterior: number;
    activo: boolean;
  }>
): Inquilino | null {
  const store = leerStore();
  const idx = store.inquilinos.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  store.inquilinos[idx] = { ...store.inquilinos[idx], ...datos };
  guardarStore(store);
  return store.inquilinos[idx];
}

export function borrarInquilinoLocal(id: number): boolean {
  const store = leerStore();
  const antes = store.inquilinos.length;
  store.inquilinos = store.inquilinos.filter((i) => i.id !== id);
  store.lecturas = store.lecturas.filter((l) => l.inquilino_id !== id);
  store.pagos = store.pagos.filter((p) => p.inquilino_id !== id);
  if (store.inquilinos.length === antes) return false;
  guardarStore(store);
  return true;
}

export function listarLecturasLocal(periodo: string): LecturaLuz[] {
  const store = leerStore();
  return store.lecturas
    .filter((l) => l.periodo === periodo)
    .map((l) => {
      const i = store.inquilinos.find((x) => x.id === l.inquilino_id);
      return { ...l, nombre: i?.nombre, unidad: i?.unidad };
    })
    .sort((a, b) =>
      ((a.unidad || "") + (a.nombre || "")).localeCompare(
        (b.unidad || "") + (b.nombre || ""),
        "es"
      )
    );
}

export function registrarLecturaLocal(datos: {
  inquilino_id: number;
  periodo: string;
  lectura_actual: number;
  precio_kwh: number;
  nota: string;
}): { ok: true; lectura: LecturaLuz } | { ok: false; error: string; status: number } {
  const store = leerStore();
  const inq = store.inquilinos.find((i) => i.id === datos.inquilino_id);
  if (!inq) return { ok: false, error: "Inquilino no encontrado", status: 404 };

  const lecturaAnterior = Number(inq.lectura_anterior) || 0;
  if (datos.lectura_actual < lecturaAnterior) {
    return {
      ok: false,
      error: `La lectura actual (${datos.lectura_actual}) no puede ser menor que la anterior (${lecturaAnterior})`,
      status: 400,
    };
  }

  const consumo =
    Math.round((datos.lectura_actual - lecturaAnterior) * 100) / 100;
  const monto = Math.round(consumo * datos.precio_kwh * 100) / 100;

  const existente = store.lecturas.findIndex(
    (l) => l.inquilino_id === datos.inquilino_id && l.periodo === datos.periodo
  );

  const lectura: LecturaLuz = {
    id: existente >= 0 ? store.lecturas[existente].id : store.nextLec++,
    inquilino_id: datos.inquilino_id,
    periodo: datos.periodo,
    lectura_anterior: lecturaAnterior,
    lectura_actual: datos.lectura_actual,
    consumo,
    precio_kwh: datos.precio_kwh,
    monto,
    nota: datos.nota,
    creado: new Date().toISOString(),
  };

  if (existente >= 0) store.lecturas[existente] = lectura;
  else store.lecturas.push(lectura);

  inq.lectura_anterior = datos.lectura_actual;
  guardarStore(store);
  return { ok: true, lectura };
}

export function borrarLecturaLocal(id: number): boolean {
  const store = leerStore();
  const antes = store.lecturas.length;
  store.lecturas = store.lecturas.filter((l) => l.id !== id);
  if (store.lecturas.length === antes) return false;
  guardarStore(store);
  return true;
}

export function listarPagosLocal(periodo: string): PagoAlquiler[] {
  const store = leerStore();
  return store.pagos
    .filter((p) => p.periodo === periodo)
    .map((p) => {
      const i = store.inquilinos.find((x) => x.id === p.inquilino_id);
      return { ...p, nombre: i?.nombre, unidad: i?.unidad };
    })
    .sort((a, b) =>
      ((a.unidad || "") + (a.nombre || "")).localeCompare(
        (b.unidad || "") + (b.nombre || ""),
        "es"
      )
    );
}

export function registrarPagoLocal(datos: {
  inquilino_id: number;
  periodo: string;
  monto: number;
  pagado: boolean;
  nota: string;
}): PagoAlquiler | null {
  const store = leerStore();
  const inq = store.inquilinos.find((i) => i.id === datos.inquilino_id);
  if (!inq) return null;

  const existente = store.pagos.findIndex(
    (p) => p.inquilino_id === datos.inquilino_id && p.periodo === datos.periodo
  );

  const pago: PagoAlquiler = {
    id: existente >= 0 ? store.pagos[existente].id : store.nextPag++,
    inquilino_id: datos.inquilino_id,
    periodo: datos.periodo,
    monto: datos.monto,
    pagado: datos.pagado,
    fecha_pago: datos.pagado
      ? existente >= 0 && store.pagos[existente].fecha_pago
        ? store.pagos[existente].fecha_pago
        : new Date().toISOString()
      : null,
    nota: datos.nota,
    creado:
      existente >= 0
        ? store.pagos[existente].creado
        : new Date().toISOString(),
  };

  if (existente >= 0) store.pagos[existente] = pago;
  else store.pagos.push(pago);

  guardarStore(store);
  return pago;
}
