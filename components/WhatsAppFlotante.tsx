import { WHATSAPP_URL } from "@/lib/negocio";
import { IconoChat } from "@/components/Iconos";

export default function WhatsAppFlotante() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-flotante group"
      aria-label="Escribir por WhatsApp"
      title="¿Necesitas ayuda? Escríbenos por WhatsApp"
    >
      <IconoChat className="h-6 w-6 transition group-hover:scale-110" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
