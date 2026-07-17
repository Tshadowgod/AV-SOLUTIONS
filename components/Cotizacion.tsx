"use client";

import { useState } from "react";
import { IconoLaptop, IconoMonitor, IconoChat } from "@/components/Iconos";

const TIPOS = [
  { valor: "Laptop", icono: <IconoLaptop className="w-7 h-7" /> },
  { valor: "PC de escritorio", icono: <IconoMonitor className="w-7 h-7" /> },
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
        // Arma el mensaje de WhatsApp hacia el negocio y lo abre.
        // Emojis con \u{...} para que lleguen correctos sin problemas de codificación.
        const modeloTexto = !noSabeModelo && modelo.trim() ? modelo.trim() : "No lo sé";
        const emEquipo = tipo === "Laptop" ? "\u{1F4BB}" : "\u{1F5A5}\u{FE0F}"; // 💻 / 🖥️
        const mensaje =
          `\u{1F44B} Hola AV SOLUTIONS, quiero una cotización:\n\n` + // 👋
          `${emEquipo} Equipo: ${tipo}\n` +
          `\u{1F3F7}\u{FE0F} Modelo: ${modeloTexto}\n` + // 🏷️
          `\u{1F527} Problema: ${problema.trim()}\n` + // 🔧
          `\u{1F9D1} Mi nombre: ${nombre.trim()}\n` + // 🧑
          `\u{1F4F1} Mi WhatsApp: ${whatsapp.trim()}`; // 📱
        const link = `https://wa.me/${WHATSAPP_NEGOCIO}?text=${encodeURIComponent(mensaje)}`;
        setWaLink(link);
        setEnviada(true);
        // Abre WhatsApp automáticamente (si el navegador lo bloquea, queda el botón).
        window.open(link, "_blank");
      } else {
        const { error } = await res.json().catch(() => ({ error: "No se pudo enviar" }));
        setError(error);
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
    setError("");
  }

  const inputClase =
    "w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.18)]";

  return (
    <section className="px-5 py-16" id="cotizacion">
      <div className="mb-11 text-center">
        <span className="mb-4 inline-block rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
          Cotización gratis
        </span>
        <h2 className="text-3xl font-bold sm:text-4xl">Realizar cotización</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Cuéntanos qué le pasa a tu equipo y te enviamos un presupuesto sin compromiso por WhatsApp.
        </p>
      </div>

      <div className="beam-top mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/45 backdrop-blur-xl sm:p-12">
        {enviada ? (
          <div className="aparecer py-8 text-center">
            <span className="mb-4 block text-5xl">🎉</span>
            <h3 className="mb-2 text-2xl font-bold text-emerald-400">¡Ya casi está!</h3>
            <p className="mx-auto mb-7 max-w-md text-slate-400">
              Se abrió WhatsApp con tu cotización lista. Solo pulsa <b className="text-slate-100">Enviar</b> ahí
              para mandárnosla. ¿No se abrió? Usa el botón:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-400"
              >
                <IconoChat className="w-5 h-5" /> Enviar por WhatsApp
              </a>
              <button onClick={reiniciar} className="btn-glow">
                <span>Enviar otra cotización</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-6">
            {/* Tipo de equipo */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                1. ¿Qué tipo de equipo es?
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {TIPOS.map((t) => (
                  <button
                    type="button"
                    key={t.valor}
                    onClick={() => setTipo(t.valor)}
                    className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-2xl border p-5 transition ${
                      tipo === t.valor
                        ? "border-violet-500 bg-violet-500/10 text-slate-100 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200"
                    }`}
                  >
                    {t.icono}
                    <span className="font-semibold">{t.valor}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modelo */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                2. ¿Qué modelo es tu equipo?
              </label>
              <input
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                disabled={noSabeModelo}
                type="text"
                placeholder="Ej: HP Pavilion 15, Lenovo IdeaPad 3…"
                className={`${inputClase} ${noSabeModelo ? "cursor-not-allowed opacity-40" : ""}`}
              />
              <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={noSabeModelo}
                  onChange={(e) => setNoSabeModelo(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-violet-500"
                />
                No sé el modelo de mi equipo
              </label>
            </div>

            {/* Problema */}
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-slate-300">
                3. ¿Qué necesitas? Explica el problema
              </label>
              <textarea
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                required
                rows={4}
                placeholder="Ej: Mi laptop se apaga sola, calienta mucho y va muy lenta al abrir programas…"
                className={`${inputClase} resize-y`}
              />
            </div>

            {/* Contacto */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-300">Tu nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  type="text"
                  placeholder="Nombre completo"
                  className={inputClase}
                />
              </div>
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-slate-300">Tu WhatsApp</label>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  type="tel"
                  placeholder="+591 …"
                  className={inputClase}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                ⚠️ {error}
              </p>
            )}

            <div className="flex justify-center">
              <button type="submit" className="btn-glow" disabled={enviando}>
                <span className="px-3 py-1 text-base">
                  {enviando ? "Enviando…" : "Enviar cotización"}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
