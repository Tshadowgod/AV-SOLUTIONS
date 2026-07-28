"use client";

import { useState } from "react";
import Link from "next/link";
import { IconoAlerta, IconoCandado } from "@/components/Iconos";
import { NEGOCIO } from "@/lib/negocio";

export default function Login({ alEntrar }: { alEntrar: () => Promise<boolean> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        await alEntrar();
        return;
      }

      // El servidor explica el motivo real: contraseña mala, demasiados
      // intentos o variables de entorno sin configurar.
      const { error: motivo } = await res.json().catch(() => ({ error: "" }));
      setError(motivo || "No pudimos verificar la contraseña.");
      setPassword("");
    } catch {
      setError("Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className={`beam-top w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.045] p-9 text-center shadow-2xl shadow-black/50 backdrop-blur-xl ${
          error ? "sacudir" : ""
        }`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/20 to-cyan-400/15 text-cyan-400">
          <IconoCandado className="h-6 w-6" />
        </div>
        <h1 className="mb-1.5 text-2xl font-bold">Panel de administración</h1>
        <p className="mb-7 text-sm text-slate-400">
          Acceso exclusivo para el personal de {NEGOCIO.nombre}
        </p>

        <label htmlFor="password" className="sr-only">
          Contraseña
        </label>
        <div className="flex items-center rounded-full border border-white/10 bg-[#0b1020] transition focus-within:border-violet-500 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.18)]">
          <span className="ml-4 text-slate-400" aria-hidden>
            <IconoCandado />
          </span>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
            className="w-full flex-1 bg-transparent px-3 py-3.5 text-slate-100 outline-none placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-center justify-center gap-2 text-sm text-red-300"
          >
            <IconoAlerta className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <button type="submit" className="btn-glow mt-5 w-full" disabled={cargando}>
          <span className="w-full">{cargando ? "Verificando…" : "Entrar"}</span>
        </button>

        <Link href="/" className="mt-6 inline-block text-sm text-slate-400 transition hover:text-cyan-400">
          ← Volver a la página principal
        </Link>
      </form>
    </div>
  );
}
