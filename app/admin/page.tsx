"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Cotizacion, Orden } from "@/lib/tipos";
import { IconoAlerta, IconoRefrescar } from "@/components/Iconos";
import Login from "@/components/admin/Login";
import Panel from "@/components/admin/Panel";

type Sesion = "cargando" | "sin-sesion" | "activa" | "error";

export default function PaginaAdmin() {
  const [sesion, setSesion] = useState<Sesion>("cargando");
  const [motivo, setMotivo] = useState("");
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  const cargarDatos = useCallback(async () => {
    try {
      const [resOrdenes, resCotizaciones] = await Promise.all([
        fetch("/api/admin/ordenes", { cache: "no-store" }),
        fetch("/api/admin/cotizaciones", { cache: "no-store" }),
      ]);

      if (resOrdenes.status === 401) {
        setSesion("sin-sesion");
        return false;
      }

      if (!resOrdenes.ok) {
        const { error } = await resOrdenes.json().catch(() => ({ error: "" }));
        setMotivo(error || "El servidor no pudo devolver las órdenes.");
        setSesion("error");
        return false;
      }

      setOrdenes(await resOrdenes.json());
      setCotizaciones(resCotizaciones.ok ? await resCotizaciones.json() : []);
      setSesion("activa");
      return true;
    } catch {
      // Antes, un fallo aquí dejaba el panel girando para siempre.
      setMotivo("No pudimos conectarnos con el servidor. Revisa tu internet.");
      setSesion("error");
      return false;
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await cargarDatos();
    })();
  }, [cargarDatos]);

  if (sesion === "cargando") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader-ring" />
        <span className="sr-only">Cargando el panel…</span>
      </div>
    );
  }

  if (sesion === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-amber-400/5 p-9 text-center backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
            <IconoAlerta className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-xl font-bold">No pudimos abrir el panel</h1>
          <p className="mb-7 text-sm text-slate-400">{motivo}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSesion("cargando");
                void cargarDatos();
              }}
              className="btn-glow"
            >
              <span className="!px-6 !py-2.5 text-sm">
                <IconoRefrescar />
                Reintentar
              </span>
            </button>
            <Link href="/" className="btn-plano !px-5 !py-2.5 text-sm">
              Volver a la página
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sesion === "sin-sesion") {
    return <Login alEntrar={cargarDatos} />;
  }

  return (
    <Panel
      ordenes={ordenes}
      cotizaciones={cotizaciones}
      recargar={cargarDatos}
      alSalir={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        setOrdenes([]);
        setCotizaciones([]);
        setSesion("sin-sesion");
      }}
    />
  );
}
