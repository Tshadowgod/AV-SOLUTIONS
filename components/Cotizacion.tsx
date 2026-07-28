"use client";

import { useState } from "react";
import { IconoLaptop, IconoMonitor, IconoChat } from "@/components/Iconos";

const TIPOS = [
  { valor: "Laptop", icono: <IconoLaptop className="h-7 w-7" /> },
  { valor: "PC de escritorio", icono: <IconoMonitor className="h-7 w-7" /> },
];

// Número de WhatsApp del negocio (código de país + número, sin «+»)
const WHATSAPP_NEGOCIO = "59165073163";

export default function Cotizacion() {
  const [tipo, setTipo] = useState("");
  const [modelo, setModelo] = useState("");
  const [noSabeModelo, setNoSabeModelo] = useState(false);
  const [problema, setProblema] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [waLink, setWaLink] = useState("");
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tipo) {
      setError("Elige si tu equipo es una laptop o una PC de escritorio.");
      return;
    }
    if (!noSabeModelo && !modelo.trim()) {
      setError("Escribe el modelo de tu equipo o marca «No sé el modelo».");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/cotizacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          modelo: modelo.trim(),
          sabe_modelo: !noSabeModelo,
          problema: problema.trim(),
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
        }),
      });
      if (res.ok) {
        const modeloTexto = !noSabeModelo && modelo.trim() ? modelo.trim() : "No lo sé";
        const emEquipo = tipo === "Laptop" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}";
        const mensaje =
          `\u{1F44B} Hola AV SOLUTIONS, quiero una cotización:\n\n` +
          `${emEquipo} Equipo: ${tipo}\n` +
          `\u{1F3F7}\u{FE0F} Modelo: ${modeloTexto}\n` +
          `\u{1F527} Problema: ${problema.trim()}\n` +
          `\u{1F9D1} Mi nombre: ${nombre.trim()}\n` +
          `\u{1F4F1} Mi WhatsApp: ${whatsapp.trim()}`;
        const link = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${encodeURIComponent(mensaje)}`;
        setWaLink(link);
        setEnviada(true);
        window.open(link, "_blank");
      } else {
        const data = await res.json().catch(() => ({ error: "No se pudo enviar" }));
        setError(data.error || "No se pudo enviar");
      }
    } catch {
      setError("No pudimos enviar la cotización. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setTipo("");
    setModelo("");
    setNoSabeModelo(false);
    setProblema("");
    setNombre("");
    setWhatsapp("");
    setEnviada(false);
    setWaLink("");
    setError("");
  }

  return (
    <section className="border-y border-[var(--line)] bg-[var(--surface)] px-5 py-20 sm:px-8" id="cotizacion">
      <div className="mx-auto mb-10 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Cotización gratis
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Cuéntanos qué le pasa</h2>
        <p className="mt-3 text-[var(--muted)]">
          Te armamos un presupuesto sin compromiso y lo enviamos por WhatsApp al taller.
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--paper)] p-7 sm:p-11">
        {enviada ? (
          <div className="aparecer py-6 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700"
              aria-hidden="true"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-emerald-800">¡Ya casi está!</h3>
            <p className="mx-auto mb-7 max-w-md text-[var(--muted)]">
              Se abrió WhatsApp con tu cotización lista. Solo pulsa{" "}
              <b className="text-[var(--ink)]">Enviar</b> ahí para mandárnosla. ¿No se abrió? Usa el botón:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
              >
                <IconoChat className="h-5 w-5" /> Enviar por WhatsApp
              </a>
              <button type="button" onClick={reiniciar} className="btn-ghost-ink">
                Enviar otra cotización
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-6">
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-[var(--ink)]">
                1. ¿Qué tipo de equipo es?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TIPOS.map((t) => (
                  <button
                    type="button"
                    key={t.valor}
                    onClick={() => setTipo(t.valor)}
                    aria-pressed={tipo === t.valor}
                    className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-md border p-5 transition ${
                      tipo === t.valor
                        ? "border-[var(--accent)] bg-teal-50 text-[var(--ink)] shadow-[0_0_0_3px_rgba(15,118,110,0.12)]"
                        : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-teal-300 hover:text-[var(--ink)]"
                    }`}
                  >
                    {t.icono}
                    <span className="font-semibold">{t.valor}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="modelo" className="mb-2.5 block text-sm font-semibold text-[var(--ink)]">
                2. ¿Qué modelo es tu equipo?
              </label>
              <input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                disabled={noSabeModelo}
                type="text"
                placeholder="Ej: HP Pavilion 15, Lenovo IdeaPad 3…"
                className="input-taller"
              />
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={noSabeModelo}
                  onChange={(e) => setNoSabeModelo(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-teal-700"
                />
                No sé el modelo de mi equipo
              </label>
            </div>

            <div>
              <label htmlFor="problema" className="mb-2.5 block text-sm font-semibold text-[var(--ink)]">
                3. ¿Qué necesitas? Explica el problema
              </label>
              <textarea
                id="problema"
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                required
                rows={4}
                placeholder="Ej: Mi laptop se apaga sola, calienta mucho y va muy lenta al abrir programas…"
                className="input-taller resize-y"
              />
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="mb-2.5 block text-sm font-semibold text-[var(--ink)]">
                  Tu nombre
                </label>
                <input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  type="text"
                  placeholder="Nombre completo"
                  className="input-taller"
                />
              </div>
              <div>
                <label htmlFor="whatsapp" className="mb-2.5 block text-sm font-semibold text-[var(--ink)]">
                  Tu WhatsApp
                </label>
                <input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  type="tel"
                  placeholder="+591 …"
                  className="input-taller"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex justify-center pt-1">
              <button type="submit" className="btn-taller min-w-[200px]" disabled={enviando}>
                {enviando ? "Enviando…" : "Enviar cotización"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
