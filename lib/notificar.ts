/* Envía una notificación al WhatsApp del dueño usando CallMeBot (gratis).
   Se activa cuando están configuradas las variables de entorno:
     WHATSAPP_NOTIFY_PHONE  — tu número con código de país, sin «+» (ej. 59165073163)
     CALLMEBOT_APIKEY       — la clave que te da CallMeBot al autorizar tu número
   Si faltan, la función no hace nada (la web sigue funcionando igual). */

export async function notificarWhatsApp(mensaje: string): Promise<void> {
  const phone = process.env.WHATSAPP_NOTIFY_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return; // aún no configurado

  const url =
    "https://api.callmebot.com/whatsapp.php" +
    `?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(mensaje)}` +
    `&apikey=${encodeURIComponent(apikey)}`;

  try {
    const controlador = new AbortController();
    const t = setTimeout(() => controlador.abort(), 8000);
    const res = await fetch(url, { signal: controlador.signal });
    clearTimeout(t);
    if (!res.ok) {
      console.error("CallMeBot respondió con estado", res.status);
    }
  } catch (error) {
    // Nunca dejamos que un fallo de la notificación rompa el envío de la cotización
    console.error("No se pudo enviar la notificación de WhatsApp:", error);
  }
}
