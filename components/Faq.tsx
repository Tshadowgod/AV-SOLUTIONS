import { NEGOCIO, enlaceWhatsApp } from "@/lib/negocio";
import { IconoFlecha, IconoWhatsApp } from "@/components/Iconos";

const PREGUNTAS = [
  {
    pregunta: "¿Cuánto tarda la reparación?",
    respuesta: `La mayoría de los equipos sale en ${NEGOCIO.tiempoPromedio}. Si hay que pedir un repuesto especial puede tardar un poco más, y te avisamos apenas lo sepamos.`,
  },
  {
    pregunta: "¿Cuánto me va a costar?",
    respuesta:
      "La cotización es gratis. Revisamos tu equipo, te decimos exactamente cuánto cuesta y recién empezamos a reparar cuando tú estás de acuerdo. Sin sorpresas al final.",
  },
  {
    pregunta: "¿Voy a perder mis fotos y documentos?",
    respuesta:
      "No trabajamos sobre tu información sin avisarte. Si el trabajo necesita formatear el equipo, te lo consultamos antes y respaldamos lo que nos indiques.",
  },
  {
    pregunta: "¿El trabajo tiene garantía?",
    respuesta: `Sí. Todo lo que reparamos queda con ${NEGOCIO.garantiaDias} días de garantía. Si algo relacionado vuelve a fallar, lo revisamos sin costo.`,
  },
  {
    pregunta: "¿Cómo me entero de que ya está listo?",
    respuesta:
      "En esta misma página, escribiendo el código de tu orden en «Consultar estado». Cuando marca «Listo para recoger» ya puedes pasar por tu equipo, y también te escribimos por WhatsApp.",
  },
  {
    pregunta: "¿Qué tengo que llevar al taller?",
    respuesta:
      "El equipo y su cargador. Si es una PC de escritorio, basta con la torre. Al dejarlo te entregamos el código de orden para que sigas el avance en línea.",
  },
  {
    pregunta: "¿Atienden fuera de horario?",
    respuesta: `Sí, atendemos emergencias las 24 horas. Escríbenos por WhatsApp al ${NEGOCIO.whatsappVisible} y vemos tu caso.`,
  },
];

export default function Faq() {
  return (
    <div className="faq mx-auto max-w-3xl">
      <div className="flex flex-col gap-3">
        {PREGUNTAS.map(({ pregunta, respuesta }) => (
          <details
            key={pregunta}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 backdrop-blur transition open:border-violet-500/40 open:bg-violet-500/[0.05]"
          >
            <summary className="flex items-center justify-between gap-4 py-4 text-left font-semibold text-slate-100">
              {pregunta}
              <IconoFlecha className="chevron h-5 w-5 shrink-0 text-cyan-400" />
            </summary>
            <p className="pb-5 pr-8 text-sm leading-relaxed text-slate-400">{respuesta}</p>
          </details>
        ))}
      </div>

      <div className="mt-7 rounded-2xl border border-dashed border-white/15 p-6 text-center">
        <p className="mb-4 text-slate-400">
          ¿Tu duda no está en la lista? Pregúntanos directo, respondemos rápido.
        </p>
        <a
          href={enlaceWhatsApp(`Hola ${NEGOCIO.nombre}, tengo una consulta:`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-wa !px-5 !py-2.5 text-sm"
        >
          <IconoWhatsApp className="h-4 w-4" />
          Preguntar por WhatsApp
        </a>
      </div>
    </div>
  );
}
